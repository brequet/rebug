use axum::{Json, Router, extract::State, routing::post};
use tracing::instrument;
use validator::Validate;

use crate::api::{
    error::ApiError, models::request::auth_models::LoginRequest,
    models::response::auth_models::LoginResponse, state::AppState,
};

pub fn auth_routes() -> Router<AppState> {
    Router::new().route("/auth/login", post(login_handler))
}

#[instrument(skip(state, payload), fields(email = %payload.email), level = "debug")]
async fn login_handler(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, ApiError> {
    tracing::debug!("Attempting login.");
    payload.validate().map_err(|e| {
        tracing::warn!("Login validation failed: {}", e);
        ApiError::Validation(e.to_string())
    })?;

    let (user, token) = state
        .auth_service
        .login_user(&payload.email, &payload.password)
        .await?;

    let response = LoginResponse {
        access_token: token,
        token_type: "Bearer".to_string(),
        user: user.clone().into(),
    };

    tracing::info!(user_id = %user.id, "User logged in successfully.");
    Ok(Json(response))
}
