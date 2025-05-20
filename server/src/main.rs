use std::{env, net::SocketAddr, sync::Arc};

use axum::Router;
use dotenv::dotenv;
use rebug::{
    api::{routers::get_api_routes, state::AppState},
    application::services::{
        auth_service::AuthService, health_service::HealthService, report_service::ReportService,
        user_service::UserService,
    },
    domain::ports::storage_port::StoragePort,
    infrastructure::{
        database::sqlite::Sqlite,
        repositories::{
            sqlite_report_repository::SqliteReportRepository,
            sqlite_user_repository::SqliteUserRepository,
        },
        storage::file_system_storage::FileSystemStorage,
    },
};
use tower_http::{
    services::ServeDir,
    trace::{self, TraceLayer},
};
use tracing::{Level, info};
use tracing_subscriber::{EnvFilter, FmtSubscriber};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    let subscriber = FmtSubscriber::builder()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("info,rebug=trace")),
        )
        .finish();

    tracing::subscriber::set_global_default(subscriber)
        .expect("Setting default tracing subscriber failed");

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env file");
    let sqlite_connection = Sqlite::new(database_url.clone())
        .await
        .expect("Failed to create SQLite connection pool");

    info!("Running database migrations...");
    sqlx::migrate!()
        .run(&sqlite_connection.get_pool())
        .await
        .expect("Failed to run database migrations");
    info!("Database migrations completed.");

    // TODO: all this in clean config module
    let upload_dir = env::var("UPLOAD_DIRECTORY").unwrap_or_else(|_| "uploads".to_string());
    let base_url =
        env::var("FILE_BASE_URL").unwrap_or_else(|_| "http://localhost:3000/files".to_string());
    let file_system_storage = Arc::new(
        FileSystemStorage::new(upload_dir.clone(), base_url)
            .expect("Failed to initialize file system storage"),
    );
    let storage_port: Arc<dyn StoragePort> = file_system_storage;

    let health_service = Arc::new(HealthService);

    let user_repository = Arc::new(SqliteUserRepository::new(sqlite_connection.get_pool()));
    let user_service = Arc::new(UserService::new(user_repository));

    let auth_service = Arc::new(AuthService::new(user_service.clone()));

    let report_repository = Arc::new(SqliteReportRepository::new(sqlite_connection.get_pool()));
    let report_service = Arc::new(ReportService::new(report_repository, storage_port));

    let app_state = AppState::new(auth_service, health_service, report_service, user_service);

    let static_files_service = ServeDir::new(upload_dir);

    let router = Router::new()
        .nest("/api", get_api_routes())
        .nest_service("/files", static_files_service)
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(trace::DefaultMakeSpan::new().level(Level::INFO)),
        )
        .with_state(app_state);

    let port: u16 = env::var("PORT")
        .unwrap_or_else(|_| "3000".to_string())
        .parse::<u16>()?;
    let addr = SocketAddr::from(([127, 0, 0, 1], port));

    info!("Starting server on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, router).await?;

    Ok(())
}
