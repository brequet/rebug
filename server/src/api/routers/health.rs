use axum::{Json, Router, extract::State, response::IntoResponse, routing::get};
use tracing::instrument;

use crate::api::state::AppState;

pub fn health_routes() -> Router<AppState> {
    Router::new().route("/health", get(health_check_handler))
}

#[instrument(skip(state), level = "debug")]
async fn health_check_handler(State(state): State<AppState>) -> impl IntoResponse {
    let response = state.health_service.health_check();
    Json(response)
}
