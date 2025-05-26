use super::{
    board_service::{BoardServiceError, BoardServiceInterface},
    user_service::{UserServiceError, UserServiceInterface},
};
use crate::domain::models::user::{User, UserRole};
use async_trait::async_trait;
use std::sync::Arc;
use tracing::instrument;

#[derive(Debug, thiserror::Error)]
pub enum UserOnboardingServiceError {
    #[error("User already exists")]
    UserAlreadyExists,
    #[error("User not found")]
    UserNotFound,
    #[error("Board already exists")]
    BoardAlreadyExists,
    #[error("Board not found")]
    BoardNotFound,
    #[error("User creation failed: {0}")]
    UserCreation(String),
    #[error("Board creation failed: {0}")]
    BoardCreation(String),
    #[error("Internal server error: {0}")]
    InternalError(String),
}

pub type UserOnboardingServiceResult<T> = Result<T, UserOnboardingServiceError>;

#[async_trait]
pub trait UserOnboardingServiceInterface: Send + Sync {
    async fn onboard_user(
        &self,
        email: &str,
        password: &str,
        first_name: Option<&str>,
        last_name: Option<&str>,
        user_role: UserRole,
    ) -> UserOnboardingServiceResult<User>;
}

impl From<UserServiceError> for UserOnboardingServiceError {
    fn from(err: UserServiceError) -> Self {
        match err {
            UserServiceError::ValidationError(msg)
            | UserServiceError::PasswordHashingError(msg) => {
                UserOnboardingServiceError::UserCreation(msg)
            }
            UserServiceError::UserAlreadyExists => UserOnboardingServiceError::UserAlreadyExists,
            UserServiceError::UserNotFound => UserOnboardingServiceError::UserNotFound,
            UserServiceError::InternalError(msg) => UserOnboardingServiceError::InternalError(msg),
        }
    }
}

impl From<BoardServiceError> for UserOnboardingServiceError {
    fn from(err: BoardServiceError) -> Self {
        match err {
            BoardServiceError::ValidationError(msg) => {
                UserOnboardingServiceError::BoardCreation(msg)
            }
            BoardServiceError::BoardAlreadyExists => UserOnboardingServiceError::BoardAlreadyExists,
            BoardServiceError::BoardNotFound => UserOnboardingServiceError::BoardNotFound,
            BoardServiceError::AccessDenied => {
                UserOnboardingServiceError::InternalError("user could not access board".to_string())
            }
            BoardServiceError::InternalError(msg) => UserOnboardingServiceError::InternalError(msg),
        }
    }
}

pub struct UserOnboardingService {
    user_service: Arc<dyn UserServiceInterface>,
    board_service: Arc<dyn BoardServiceInterface>,
}

impl UserOnboardingService {
    pub fn new(
        user_service: Arc<dyn UserServiceInterface>,
        board_service: Arc<dyn BoardServiceInterface>,
    ) -> Self {
        Self {
            user_service,
            board_service,
        }
    }
}

#[async_trait]
impl UserOnboardingServiceInterface for UserOnboardingService {
    #[instrument(
        skip(self, email, password),
        fields(email = %email, first_name = ?first_name, last_name = ?last_name),
        level = "info"
    )]
    async fn onboard_user(
        &self,
        email: &str,
        password: &str,
        first_name: Option<&str>,
        last_name: Option<&str>,
        user_role: UserRole,
    ) -> UserOnboardingServiceResult<User> {
        let user = self
            .user_service
            .create_user(email, password, first_name, last_name, user_role)
            .await?;

        let board_name = format!(
            "{}'s Board",
            user.first_name.clone().unwrap_or("User".to_string())
        );

        self.board_service
            .create_board(&board_name, Some("Default board"), user.id, true)
            .await?;

        Ok(user)
    }
}
