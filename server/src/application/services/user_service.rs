use std::sync::Arc;

use uuid::Uuid;

use crate::{
    domain::{
        models::user::{User, UserRole},
        repositories::{RepositoryError, user_repository::UserRepository},
    },
    infrastructure::security::password_hasher::{PasswordError, hash_password},
};

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

pub type UserServiceResult<T> = Result<T, UserServiceError>;

#[derive(Clone)]
pub struct UserService {
    user_repository: Arc<dyn UserRepository>,
}

impl UserService {
    pub fn new(user_repository: Arc<dyn UserRepository>) -> Self {
        Self { user_repository }
    }

    pub async fn create_user(
        &self,
        email: &str,
        password: &str,
        first_name: Option<&str>,
        last_name: Option<&str>,
    ) -> UserServiceResult<User> {
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

        let password_hash = hash_password(password)?;

        self.user_repository
            .create_user(email, &password_hash, first_name, last_name, UserRole::User)
            .await
            .map_err(Into::into)
    }

    pub async fn get_user_by_id(&self, user_id: Uuid) -> UserServiceResult<User> {
        self.user_repository
            .find_by_id(user_id)
            .await?
            .ok_or(UserServiceError::UserNotFound)
    }

    pub async fn get_user_by_email(&self, email: &str) -> UserServiceResult<User> {
        self.user_repository
            .find_by_email(email)
            .await?
            .ok_or(UserServiceError::UserNotFound)
    }
}
