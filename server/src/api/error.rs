use crate::application::services::{
    auth_service::AuthServiceError, user_service::UserServiceError,
};
use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde_json::json;

#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("Validation error: {0}")]
    Validation(String),
    #[error("Resource not found: {0}")]
    NotFound(String),
    #[error("Authentication failed")]
    Unauthorized,
    #[error("Action forbidden")]
    Forbidden,
    #[error("Conflict: {0}")]
    Conflict(String),
    #[error("Internal server error: {0}")]
    InternalServerError(String),
}

impl From<AuthServiceError> for ApiError {
    fn from(err: AuthServiceError) -> Self {
        match err {
            AuthServiceError::InvalidCredentials => ApiError::Unauthorized,
            AuthServiceError::PasswordHashingError(msg)
            | AuthServiceError::TokenCreationError(msg)
            | AuthServiceError::InternalError(msg) => {
                tracing::error!("Internal service error: {}", msg);
                ApiError::InternalServerError("An unexpected error occurred".to_string())
            }
        }
    }
}

impl From<UserServiceError> for ApiError {
    fn from(err: UserServiceError) -> Self {
        match err {
            UserServiceError::ValidationError(msg) => ApiError::Validation(msg),
            UserServiceError::UserAlreadyExists => {
                ApiError::Conflict("User already exists".to_string())
            }
            UserServiceError::UserNotFound => ApiError::NotFound("User not found".to_string()),
            UserServiceError::PasswordHashingError(msg) | UserServiceError::InternalError(msg) => {
                tracing::error!("Internal service error: {}", msg);
                ApiError::InternalServerError("An unexpected error occurred".to_string())
            }
        }
    }
}

impl ApiError {
    fn get_status_and_message(&self) -> (StatusCode, String) {
        match self {
            ApiError::Validation(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            ApiError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            ApiError::Unauthorized => (
                StatusCode::UNAUTHORIZED,
                "Authentication failed".to_string(),
            ),
            ApiError::Forbidden => (StatusCode::FORBIDDEN, "Action forbidden".to_string()),
            ApiError::Conflict(msg) => (StatusCode::CONFLICT, msg.clone()),
            ApiError::InternalServerError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.clone()),
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, error_message) = self.get_status_and_message();

        match status {
            s if s.is_server_error() => {
                tracing::error!(status_code = %s, error.type = %self, error.message = %error_message, "API request resulted in server error");
            }
            s if s.is_client_error() => {
                tracing::warn!(status_code = %s, error.type = %self, error.message = %error_message, "API request resulted in client error");
            }
            _ => {}
        }

        let body = Json(json!({
            "error": error_message,
        }));
        (status, body).into_response()
    }
}
