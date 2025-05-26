use auth_routes::auth_routes;
use axum::Router;
use board_routes::board_routes;
use health_routes::health_routes;
use report_routes::report_routes;
use user_routes::user_routes;

use super::state::AppState;

mod auth_routes;
mod board_routes;
mod health_routes;
mod report_routes;
mod user_routes;

pub fn get_api_routes() -> Router<AppState> {
    Router::new()
        .merge(auth_routes())
        .merge(board_routes())
        .merge(health_routes())
        .merge(report_routes())
        .merge(user_routes())
}
