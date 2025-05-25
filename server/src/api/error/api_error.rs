use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use thiserror::Error;

use super::error_response::ApiErrorResponse;

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("Validation error: {message}")]
    Validation { message: String },

    #[error("Resource not found: {resource}")]
    NotFound { resource: String },

    #[error("Authentication failed")]
    Unauthorized,

    #[error("Action forbidden")]
    Forbidden,

    #[error("Conflict: {message}")]
    Conflict { message: String },

    #[error("Internal server error")]
    InternalServerError {
        #[source]
        source: Option<Box<dyn std::error::Error + Send + Sync>>,
        context: String,
    },
}

impl ApiError {
    pub fn validation(message: impl Into<String>) -> Self {
        Self::Validation {
            message: message.into(),
        }
    }

    pub fn not_found(resource: impl Into<String>) -> Self {
        Self::NotFound {
            resource: resource.into(),
        }
    }

    pub fn conflict(message: impl Into<String>) -> Self {
        Self::Conflict {
            message: message.into(),
        }
    }

    pub fn internal_error(context: impl Into<String>) -> Self {
        Self::InternalServerError {
            source: None,
            context: context.into(),
        }
    }

    pub fn internal_error_with_source(
        context: impl Into<String>,
        source: impl std::error::Error + Send + Sync + 'static,
    ) -> Self {
        Self::InternalServerError {
            source: Some(Box::new(source)),
            context: context.into(),
        }
    }

    fn status_code(&self) -> StatusCode {
        match self {
            Self::Validation { .. } => StatusCode::BAD_REQUEST,
            Self::NotFound { .. } => StatusCode::NOT_FOUND,
            Self::Unauthorized => StatusCode::UNAUTHORIZED,
            Self::Forbidden => StatusCode::FORBIDDEN,
            Self::Conflict { .. } => StatusCode::CONFLICT,
            Self::InternalServerError { .. } => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn to_response_data(&self) -> ApiErrorResponse {
        let (error, details) = match self {
            Self::Validation { message } => (message.clone(), None),
            Self::NotFound { resource } => (format!("{} not found", resource), None),
            Self::Unauthorized => ("Authentication failed".to_string(), None),
            Self::Forbidden => ("Action forbidden".to_string(), None),
            Self::Conflict { message } => (message.clone(), None),
            Self::InternalServerError { .. } => ("An unexpected error occurred".to_string(), None),
        };

        ApiErrorResponse { error, details }
    }

    fn log_error(&self, status: StatusCode) {
        match status {
            s if s.is_server_error() => {
                tracing::error!(
                    status_code = %s,
                    error = %self,
                    "API request resulted in server error"
                );
            }
            s if s.is_client_error() => {
                tracing::warn!(
                    status_code = %s,
                    error = %self,
                    "API request resulted in client error"
                );
            }
            _ => {}
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let status = self.status_code();
        let error_data = self.to_response_data();

        self.log_error(status);

        (status, Json(error_data)).into_response()
    }
}
