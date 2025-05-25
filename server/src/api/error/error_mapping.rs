use crate::application::services::{
    auth_service::AuthServiceError, report_service::ReportServiceError,
    user_onboarding_service::UserOnboardingServiceError, user_service::UserServiceError,
};

use super::api_error::ApiError;

pub trait IntoApiError {
    fn into_api_error(self) -> ApiError;
}

impl IntoApiError for AuthServiceError {
    fn into_api_error(self) -> ApiError {
        match self {
            Self::InvalidCredentials => ApiError::Unauthorized,
            Self::PasswordHashingError(msg)
            | Self::TokenCreationError(msg)
            | Self::InternalError(msg) => {
                tracing::error!("Auth service error: {}", msg);
                ApiError::internal_error("Authentication service unavailable")
            }
        }
    }
}

impl IntoApiError for ReportServiceError {
    fn into_api_error(self) -> ApiError {
        match self {
            Self::ReportNotFound { context } => ApiError::not_found(context),
            Self::StorageError(err) => {
                tracing::error!("Storage error: {}", err);
                ApiError::internal_error("File storage unavailable")
            }
            Self::RepositoryError(err) => {
                tracing::error!("Repository error: {}", err);
                ApiError::internal_error("Database unavailable")
            }
            Self::InternalError(msg) => {
                tracing::error!("Report service error: {}", msg);
                ApiError::internal_error("Report service unavailable")
            }
        }
    }
}

impl IntoApiError for UserOnboardingServiceError {
    fn into_api_error(self) -> ApiError {
        match self {
            Self::UserAlreadyExists => ApiError::conflict("User already exists"),
            Self::UserNotFound => ApiError::not_found("User"),
            Self::BoardAlreadyExists => ApiError::conflict("Board already exists"),
            Self::BoardNotFound => ApiError::not_found("Board"),
            Self::UserCreation(msg) => {
                ApiError::validation(format!("User creation failed: {}", msg))
            }
            Self::BoardCreation(msg) => {
                ApiError::validation(format!("Board creation failed: {}", msg))
            }
            Self::InternalError(msg) => {
                tracing::error!("Onboarding service error: {}", msg);
                ApiError::internal_error("Onboarding service unavailable")
            }
        }
    }
}

impl IntoApiError for UserServiceError {
    fn into_api_error(self) -> ApiError {
        match self {
            Self::ValidationError(msg) => ApiError::validation(msg),
            Self::UserAlreadyExists => ApiError::conflict("User already exists"),
            Self::UserNotFound => ApiError::not_found("User"),
            Self::PasswordHashingError(msg) | Self::InternalError(msg) => {
                tracing::error!("User service error: {}", msg);
                ApiError::internal_error("User service unavailable")
            }
        }
    }
}

impl From<AuthServiceError> for ApiError {
    fn from(err: AuthServiceError) -> Self {
        err.into_api_error()
    }
}

impl From<ReportServiceError> for ApiError {
    fn from(err: ReportServiceError) -> Self {
        err.into_api_error()
    }
}

impl From<UserOnboardingServiceError> for ApiError {
    fn from(err: UserOnboardingServiceError) -> Self {
        err.into_api_error()
    }
}

impl From<UserServiceError> for ApiError {
    fn from(err: UserServiceError) -> Self {
        err.into_api_error()
    }
}
