use axum::{Json, Router, extract::State, routing::post};
use validator::Validate;

use crate::api::{
    error::ApiError, models::request::auth_models::LoginRequest,
    models::response::auth_models::LoginResponse, state::AppState,
};

pub fn auth_routes() -> Router<AppState> {
    Router::new().route("/auth/login", post(login_handler))
}

async fn login_handler(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, ApiError> {
    payload
        .validate()
        .map_err(|e| ApiError::Validation(e.to_string()))?;

    let (user, token) = state
        .auth_service
        .login_user(&payload.email, &payload.password)
        .await?;

    let response = LoginResponse {
        access_token: token,
        token_type: "Bearer".to_string(),
        user: user.into(),
    };

    Ok(Json(response))
}
