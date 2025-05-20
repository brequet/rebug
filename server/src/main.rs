use std::{env, net::SocketAddr, sync::Arc};

use axum::Router;
use rebug::{
    api::{routers::get_api_routes, state::AppState},
    application::services::{
        auth_service::AuthService,
        health_service::HealthService,
        report_service::ReportService,
        user_service::{UserService, UserServiceInterface},
    },
    config::app_config::APP_CONFIG,
    domain::{models::user::UserRole, ports::storage_port::StoragePort},
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
use tracing::Level;
use tracing_subscriber::{EnvFilter, FmtSubscriber};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let subscriber = FmtSubscriber::builder()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("info,rebug=trace")),
        )
        .finish();

    tracing::subscriber::set_global_default(subscriber)
        .expect("Setting default tracing subscriber failed");

    let sqlite_connection = Sqlite::new(APP_CONFIG.database_url.clone())
        .await
        .expect("Failed to create SQLite connection pool");

    tracing::info!("Running database migrations...");
    sqlx::migrate!()
        .run(&sqlite_connection.get_pool())
        .await
        .expect("Failed to run database migrations");
    tracing::info!("Database migrations completed.");

    let file_system_storage = Arc::new(
        FileSystemStorage::new(
            APP_CONFIG.upload_directory.clone(),
            APP_CONFIG.file_base_url.clone(),
        )
        .expect("Failed to initialize file system storage"),
    );
    let storage_port: Arc<dyn StoragePort> = file_system_storage;

    let health_service = Arc::new(HealthService);

    let user_repository = Arc::new(SqliteUserRepository::new(sqlite_connection.get_pool()));
    let user_service = Arc::new(UserService::new(user_repository));

    let auth_service = Arc::new(AuthService::new(user_service.clone()));

    let report_repository = Arc::new(SqliteReportRepository::new(sqlite_connection.get_pool()));
    let report_service = Arc::new(ReportService::new(report_repository, storage_port));

    if let Err(e) = setup_initial_admin(user_service.clone()).await {
        tracing::error!("Failed to setup initial admin user: {}", e);
        return Err(e);
    }

    let app_state = AppState::new(auth_service, health_service, report_service, user_service);

    let static_files_service = ServeDir::new(&APP_CONFIG.upload_directory);

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

    tracing::info!("Starting server on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, router).await?;

    Ok(())
}

async fn setup_initial_admin(
    user_service: Arc<dyn UserServiceInterface>,
) -> Result<(), Box<dyn std::error::Error>> {
    match user_service
        .get_user_by_email(&APP_CONFIG.default_admin_email)
        .await
    {
        Ok(_) => {
            tracing::info!(
                "Default admin user with email '{}' already exists.",
                APP_CONFIG.default_admin_email
            );
        }
        Err(e) => {
            if let rebug::application::services::user_service::UserServiceError::UserNotFound = e {
                tracing::info!(
                    "Default admin user with email '{}' not found. Creating...",
                    APP_CONFIG.default_admin_email
                );
                user_service
                    .create_user(
                        &APP_CONFIG.default_admin_email,
                        &APP_CONFIG.default_admin_password,
                        Some(&APP_CONFIG.default_admin_first_name),
                        Some(&APP_CONFIG.default_admin_last_name),
                        UserRole::Admin,
                    )
                    .await
                    .map_err(|create_err| {
                        format!("Failed to create default admin user: {}", create_err)
                    })?;
                tracing::info!(
                    "Default admin user '{}' created successfully.",
                    APP_CONFIG.default_admin_email
                );
            } else {
                tracing::error!(
                    "Error checking for default admin user: {}. Admin not created.",
                    e
                );
                return Err(Box::new(e));
            }
        }
    }

    Ok(())
}
