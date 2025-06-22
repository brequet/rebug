use axum::{
    RequestPartsExt,
    extract::FromRequestParts,
    http::{StatusCode, request::Parts},
    response::{IntoResponse, Json, Response},
};
use axum_extra::{
    TypedHeader,
    headers::{Authorization, authorization::Bearer},
};
use jsonwebtoken::{Validation, decode};
use serde_json::json;
use tracing::instrument;

use crate::{
    api::state::AppState,
    application::services::user_service::UserServiceError,
    config::app_config::JWT_KEYS,
    domain::models::{
        auth::TokenClaims,
        user::{User, UserRole},
    },
};

use super::error::ApiError;

#[derive(Debug)]
pub enum AuthError {
    MissingToken,
    InvalidToken(String),
    InternalError(String),
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AuthError::MissingToken => (
                StatusCode::UNAUTHORIZED,
                "Missing authentication token".to_string(),
            ),
            AuthError::InvalidToken(reason) => (
                StatusCode::UNAUTHORIZED,
                format!("Invalid token: {}", reason),
            ),
            AuthError::InternalError(reason) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Internal server error: {}", reason),
            ),
        };
        let body = Json(json!({ "error": error_message }));
        (status, body).into_response()
    }
}

#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub id: uuid::Uuid,
    pub email: String,
    pub role: String,
}

impl From<User> for AuthenticatedUser {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            email: user.email,
            role: user.role.to_string(),
        }
    }
}

impl FromRequestParts<AppState> for AuthenticatedUser {
    type Rejection = AuthError;

    #[instrument(name = "authenticate_user", skip_all, level = "debug")]
    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        tracing::debug!("Attempting to extract and validate JWT.");
        let TypedHeader(Authorization(bearer)) = parts
            .extract::<TypedHeader<Authorization<Bearer>>>()
            .await
            .map_err(|e| {
                tracing::warn!("Failed to extract Authorization header: {:?}", e);
                AuthError::MissingToken
            })?;

        let token_data =
            decode::<TokenClaims>(bearer.token(), &JWT_KEYS.decoding, &Validation::default())
                .map_err(|e| {
                    tracing::warn!("JWT decoding/validation failed: {}", e);
                    AuthError::InvalidToken(e.to_string())
                })?;

        let user_id = token_data.claims.sub;

        let user = state
            .user_service()
            .get_user_by_id(user_id)
            .await
            .map_err(|e| match e {
                UserServiceError::UserNotFound => {
                    tracing::warn!(
                        "Authentication failed: user {} from valid token not found in DB.",
                        user_id
                    );
                    AuthError::InvalidToken("User not found for the provided token".to_string())
                }
                _ => {
                    tracing::error!("Database error during user validation for token: {}", e);
                    AuthError::InternalError("Authentication service error".to_string())
                }
            })?;

        tracing::debug!(user_id = %user.id, "User authenticated successfully.");
        Ok(user.into())
    }
}

#[derive(Debug, Clone)]
pub struct AuthenticatedAdmin {
    pub id: uuid::Uuid,
    pub email: String,
    pub role: String,
}

impl From<AuthenticatedUser> for AuthenticatedAdmin {
    fn from(user: AuthenticatedUser) -> Self {
        AuthenticatedAdmin {
            id: user.id,
            email: user.email,
            role: user.role,
        }
    }
}

impl FromRequestParts<AppState> for AuthenticatedAdmin {
    type Rejection = AuthError;

    #[instrument(name = "authenticate_admin", skip_all, level = "debug")]
    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        tracing::debug!("Attempting to extract and validate admin user.");

        let AuthenticatedUser { id, email, role } =
            AuthenticatedUser::from_request_parts(parts, state).await?;

        if role == UserRole::Admin.to_string() {
            Ok(AuthenticatedAdmin { id, email, role })
        } else {
            tracing::warn!(user_id = %id, "User is not an admin. Role found: {}. Access denied.", role);
            Err(AuthError::InvalidToken(
                "User does not have admin privileges".to_string(),
            ))
        }
    }
}

pub fn parse_user_role(role_str: &str) -> Result<UserRole, ApiError> {
    role_str
        .parse::<UserRole>()
        .map_err(|_| ApiError::internal_error("failed to parse user role".to_string()))
}
