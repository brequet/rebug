use auth_routes::auth_routes;
use axum::Router;
use health_routes::health_routes;
use report_routes::report_routes;
use user_routes::user_routes;

use super::state::AppState;

pub mod auth_routes;
pub mod health_routes;
pub mod report_routes;
pub mod user_routes;

pub fn get_api_routes() -> Router<AppState> {
    Router::new()
        .merge(auth_routes())
        .merge(health_routes())
        .merge(report_routes())
        .merge(user_routes())
}
