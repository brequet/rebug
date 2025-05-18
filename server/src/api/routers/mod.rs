use auth::auth_routes;
use axum::Router;
use health::health_routes;
use report_routes::report_routes;
use user_routes::user_routes;

use super::state::AppState;

pub mod auth;
pub mod health;
pub mod report_routes;
pub mod user_routes;

pub fn get_api_routes() -> Router<AppState> {
    Router::new()
        .merge(auth_routes())
        .merge(health_routes())
        .merge(report_routes())
        .merge(user_routes())
}
