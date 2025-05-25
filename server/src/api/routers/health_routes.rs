use axum::{Json, Router, extract::State, http::StatusCode, routing::get};
use tracing::instrument;

use crate::api::{
    error::ApiError, models::response::health_models::HealthResponse, state::AppState,
};

pub fn health_routes() -> Router<AppState> {
    Router::new().route("/health", get(health_check_handler))
}

#[instrument(skip(state), level = "debug")]
async fn health_check_handler(
    State(state): State<AppState>,
) -> Result<(StatusCode, Json<HealthResponse>), ApiError> {
    let health_check = state.health_service().health_check();

    match health_check {
        Ok(check) => Ok((
            StatusCode::OK,
            Json(HealthResponse {
                status: check.status,
                message: check.message,
            }),
        )),
        Err(e) => {
            tracing::error!("Health check failed: {}", e);
            Err(ApiError::InternalServerError(e.to_string()))
        }
    }
}
