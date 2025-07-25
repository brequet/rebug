use std::net::SocketAddr;

use axum::Router;
use rebug::{
    api::{routers::get_api_routes, state::AppState},
    config::app_config::APP_CONFIG,
    domain::models::user::UserRole,
    infrastructure::{
        container::service_container::ServiceContainer, database::sqlite::Sqlite, frontend,
    },
};
use tower_http::{
    services::ServeDir,
    trace::{self, TraceLayer},
};
use tracing::Level;
use tracing_subscriber::{EnvFilter, FmtSubscriber};

const DEFAULT_TRACING_FILTER: &str = "info,rebug=trace";

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    init_tracing();

    let sqlite_connection = &Sqlite::new(APP_CONFIG.database_url.clone()).await?;

    let container = ServiceContainer::new(sqlite_connection).await?;

    run_migrations(sqlite_connection).await?;
    setup_initial_admin(&container).await?;

    let app_state = AppState::new(container);
    let router = build_router(app_state);

    start_server(router).await
}

fn init_tracing() {
    let subscriber = FmtSubscriber::builder()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new(DEFAULT_TRACING_FILTER)),
        )
        .finish();

    tracing::subscriber::set_global_default(subscriber)
        .expect("Setting default tracing subscriber failed");

    fast_log::init(fast_log::Config::new().console()).expect("Failed to initialize fast_log");
}

async fn run_migrations(sqlite_connection: &Sqlite) -> Result<(), Box<dyn std::error::Error>> {
    tracing::info!("Running database migrations...");
    sqlx::migrate!()
        .run(&sqlite_connection.get_pool())
        .await
        .expect("Failed to run database migrations");
    tracing::info!("Database migrations completed.");

    Ok(())
}

async fn setup_initial_admin(
    container: &ServiceContainer,
) -> Result<(), Box<dyn std::error::Error>> {
    match container
        .user_service
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
                container
                    .user_onboarding_service
                    .onboard_user(
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

fn build_router(app_state: AppState) -> Router {
    let uploaded_files_service = ServeDir::new(&APP_CONFIG.upload_directory);

    Router::new()
        .nest("/api", get_api_routes())
        .nest_service("/uploads", uploaded_files_service)
        .fallback(frontend::frontend_service::frontend_handler)
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(trace::DefaultMakeSpan::new().level(Level::INFO)),
        )
        .with_state(app_state)
}

async fn start_server(router: Router) -> Result<(), Box<dyn std::error::Error>> {
    let addr = SocketAddr::from(([127, 0, 0, 1], APP_CONFIG.server_port));

    tracing::info!("Starting server on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;

    let graceful_shutdown = async {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to install CTRL+C signal handler");
        tracing::info!("Received shutdown signal, shutting down gracefully...");
    };

    axum::serve(listener, router)
        .with_graceful_shutdown(graceful_shutdown)
        .await?;

    Ok(())
}
