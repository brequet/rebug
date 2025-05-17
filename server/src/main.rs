use std::{env, net::SocketAddr, sync::Arc};

use axum::Router;
use dotenv::dotenv;
use rebug::{
    api::{
        routers::{auth::auth_routes, health::health_routes, user_routes::user_routes},
        state::AppState,
    },
    application::services::{
        auth_service::AuthService, health_service::HealthService, user_service::UserService,
    },
    infrastructure::{
        database::sqlite::Sqlite, repositories::sqlite_user_repository::SqliteUserRepository,
    },
};
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    tracing_subscriber::fmt::init();

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

    let health_service = Arc::new(HealthService);

    let user_repository = Arc::new(SqliteUserRepository::new(sqlite_connection.get_pool()));
    let user_service = Arc::new(UserService::new(user_repository));

    let auth_service = Arc::new(AuthService::new(user_service.clone()));

    let app_state = AppState::new(auth_service, health_service, user_service);

    let router = Router::new()
        .nest("/api", auth_routes())
        .nest("/api", health_routes())
        .nest("/api", user_routes())
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
