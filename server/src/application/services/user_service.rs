use std::sync::Arc;

use async_trait::async_trait;
use tracing::instrument;
use uuid::Uuid;

use crate::{
    domain::{
        models::user::{User, UserRole},
        repositories::{RepositoryError, user_repository::UserRepository},
    },
    infrastructure::security::password_hasher::{PasswordError, hash_password},
};

use super::board_service::BoardServiceError;

#[derive(Debug, thiserror::Error)]
pub enum UserServiceError {
    #[error("Validation error: {0}")]
    ValidationError(String),
    #[error("User already exists")]
    UserAlreadyExists,
    #[error("User not found")]
    UserNotFound,
    #[error("Password hashing failed: {0}")]
    PasswordHashingError(String),
    #[error("Internal server error: {0}")]
    InternalError(String),
}

impl From<RepositoryError> for UserServiceError {
    fn from(err: RepositoryError) -> Self {
        match err {
            RepositoryError::NotFound => UserServiceError::UserNotFound,
            RepositoryError::AlreadyExists => UserServiceError::UserAlreadyExists,
            RepositoryError::DatabaseError(msg) => UserServiceError::InternalError(msg),
        }
    }
}

impl From<PasswordError> for UserServiceError {
    fn from(err: PasswordError) -> Self {
        match err {
            PasswordError::HashingError(msg) | PasswordError::VerificationError(msg) => {
                UserServiceError::PasswordHashingError(msg)
            }
            _ => UserServiceError::InternalError("Unexpected error".to_string()),
        }
    }
}

impl From<BoardServiceError> for UserServiceError {
    fn from(err: BoardServiceError) -> Self {
        match err {
            BoardServiceError::ValidationError(msg) => UserServiceError::ValidationError(msg),
            BoardServiceError::BoardAlreadyExists => {
                UserServiceError::InternalError("Board already exists".to_string())
            }
            BoardServiceError::BoardNotFound => {
                UserServiceError::InternalError("Board not found".to_string())
            }
            BoardServiceError::AccessDenied => {
                UserServiceError::InternalError("Access denied".to_string())
            }
            BoardServiceError::InternalError(msg) => UserServiceError::InternalError(msg),
        }
    }
}

pub type UserServiceResult<T> = Result<T, UserServiceError>;

#[async_trait]
pub trait UserServiceInterface: Send + Sync {
    async fn create_user(
        &self,
        email: &str,
        password: &str,
        first_name: Option<&str>,
        last_name: Option<&str>,
        user_role: UserRole,
    ) -> UserServiceResult<User>;

    async fn get_user_by_id(&self, user_id: Uuid) -> UserServiceResult<User>;
    async fn get_user_by_email(&self, email: &str) -> UserServiceResult<User>;
}

#[derive(Clone)]
pub struct UserService {
    user_repository: Arc<dyn UserRepository>,
}

impl UserService {
    pub fn new(user_repository: Arc<dyn UserRepository>) -> Self {
        Self { user_repository }
    }
}

#[async_trait]
impl UserServiceInterface for UserService {
    #[instrument(skip(self, password), fields(email = %email, first_name = ?first_name, last_name = ?last_name), level = "info")]
    async fn create_user(
        &self,
        email: &str,
        password: &str,
        first_name: Option<&str>,
        last_name: Option<&str>,
        user_role: UserRole,
    ) -> UserServiceResult<User> {
        tracing::debug!("Validating user input.");

        if email.is_empty() || !email.contains('@') {
            return Err(UserServiceError::ValidationError(
                "Invalid email format".to_string(),
            ));
        }
        if password.len() < 8 {
            return Err(UserServiceError::ValidationError(
                "Password must be at least 8 characters long".to_string(),
            ));
        }

        tracing::debug!("Hashing password.");
        let password_hash = hash_password(password)?;

        tracing::debug!("Attempting to save user to repository.");
        let user = self
            .user_repository
            .create_user(email, &password_hash, first_name, last_name, user_role)
            .await
            .map_err(UserServiceError::from)?;

        tracing::info!(user_id = %user.id, "User created successfully.");
        Ok(user)
    }

    #[instrument(skip(self), level = "debug")]
    async fn get_user_by_id(&self, user_id: Uuid) -> UserServiceResult<User> {
        self.user_repository
            .find_by_id(user_id)
            .await?
            .ok_or(UserServiceError::UserNotFound)
    }

    #[instrument(skip(self), level = "debug")]
    async fn get_user_by_email(&self, email: &str) -> UserServiceResult<User> {
        self.user_repository
            .find_by_email(email)
            .await?
            .ok_or(UserServiceError::UserNotFound)
    }
}
