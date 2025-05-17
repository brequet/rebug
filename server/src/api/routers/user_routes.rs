use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    routing::{get, post},
};
use validator::Validate;

use crate::api::{
    auth::AuthenticatedUser,
    error::ApiError,
    models::{request::user_models::CreateUserRequest, response::user_models::UserResponse},
    state::AppState,
};

pub fn user_routes() -> Router<AppState> {
    Router::new()
        .route("/users", post(create_user_handler))
        .route("/users/me", get(get_current_user_handler))
}

async fn create_user_handler(
    State(state): State<AppState>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<UserResponse>), ApiError> {
    payload
        .validate()
        .map_err(|e| ApiError::Validation(e.to_string()))?;

    let user = state
        .user_service
        .create_user(
            &payload.email,
            &payload.password,
            payload.first_name.as_deref(),
            payload.last_name.as_deref(),
        )
        .await?;

    Ok((StatusCode::CREATED, Json(user.into())))
}

async fn get_current_user_handler(
    State(state): State<AppState>,
    authenticated_user: AuthenticatedUser,
) -> Result<Json<UserResponse>, ApiError> {
    let user_id = authenticated_user.claims.sub;

    let user = state.user_service.get_user_by_id(user_id).await?;

    Ok(Json(user.into()))
}
