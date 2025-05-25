use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    routing::{get, post},
};
use tracing::instrument;
use validator::Validate;

use crate::api::{
    auth::{AuthenticatedAdmin, AuthenticatedUser},
    error::ApiError,
    models::{request::user_models::CreateUserRequest, response::user_models::UserResponse},
    state::AppState,
};

pub fn user_routes() -> Router<AppState> {
    let user_routes = Router::new()
        .route("/", post(create_user_handler))
        .route("/me", get(get_current_user_handler));

    Router::new().nest("/users", user_routes)
}

#[instrument(skip(state, payload, authenticated_admin), fields(admin_id = %authenticated_admin.claims.sub), level = "debug")]
async fn create_user_handler(
    State(state): State<AppState>,
    authenticated_admin: AuthenticatedAdmin,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<UserResponse>), ApiError> {
    tracing::debug!("Creating user.");

    payload.validate().map_err(|e| {
        tracing::warn!("User validation failed: {}", e);
        ApiError::validation(e.to_string())
    })?;

    let user = state
        .user_onboarding_service()
        .onboard_user(
            &payload.email,
            &payload.password,
            payload.first_name.as_deref(),
            payload.last_name.as_deref(),
            payload.role,
        )
        .await?;

    tracing::info!(user_id = %user.id, "User created successfully.");

    Ok((StatusCode::CREATED, Json(user.into())))
}

#[instrument(skip(state, authenticated_user), fields(user_id = %authenticated_user.claims.sub), level = "debug")]
async fn get_current_user_handler(
    State(state): State<AppState>,
    authenticated_user: AuthenticatedUser,
) -> Result<Json<UserResponse>, ApiError> {
    tracing::debug!("Fetching current user.");
    let user_id = authenticated_user.claims.sub;

    let user = state.user_service().get_user_by_id(user_id).await?;

    Ok(Json(user.into()))
}
