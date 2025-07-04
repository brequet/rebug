use std::sync::Arc;

use async_trait::async_trait;
use chrono::{Duration, Utc};
use jsonwebtoken::{Header, encode};
use tracing::instrument;
use uuid::Uuid;

use crate::{
    config::app_config::{APP_CONFIG, JWT_KEYS},
    domain::models::{
        auth::TokenClaims,
        user::{User, UserRole},
    },
    infrastructure::security::password_hasher::{PasswordError, verify_password},
};

use super::user_service::UserServiceInterface;

#[derive(Debug, thiserror::Error)]
pub enum AuthServiceError {
    #[error("Failed to create JWT: {0}")]
    TokenCreationError(String),
    #[error("Invalid credentials")]
    InvalidCredentials,
    #[error("Password hashing failed: {0}")]
    PasswordHashingError(String),
    #[error("Internal server error: {0}")]
    InternalError(String),
}

impl From<PasswordError> for AuthServiceError {
    fn from(err: PasswordError) -> Self {
        match err {
            PasswordError::HashingError(msg) | PasswordError::VerificationError(msg) => {
                AuthServiceError::PasswordHashingError(msg)
            }
            PasswordError::InvalidPassword => AuthServiceError::InvalidCredentials,
        }
    }
}

pub type AuthServiceResult<T> = Result<T, AuthServiceError>;

#[async_trait]
pub trait AuthServiceInterface: Send + Sync {
    async fn login_user(&self, email: &str, password: &str) -> AuthServiceResult<(User, String)>;
}

#[derive(Clone)]
pub struct AuthService {
    user_service: Arc<dyn UserServiceInterface>,
}

impl AuthService {
    pub fn new(user_service: Arc<dyn UserServiceInterface>) -> Self {
        Self { user_service }
    }

    #[instrument(skip(self), fields(user_id = %user_id, role = %role), level = "debug")]
    fn create_jwt(
        &self,
        user_id: Uuid,
        user_email: &str,
        role: &UserRole,
    ) -> Result<String, AuthServiceError> {
        tracing::debug!("Creating JWT for user.");

        let now = Utc::now();
        let iat = now.timestamp() as usize;
        let exp = (now + Duration::seconds(APP_CONFIG.jwt_expiration_seconds)).timestamp() as usize;

        let claims = TokenClaims {
            sub: user_id,
            email: user_email.to_string(),
            role: role.to_string(),
            exp,
            iat,
        };

        encode(&Header::default(), &claims, &JWT_KEYS.encoding).map_err(|e| {
            AuthServiceError::TokenCreationError(format!("Failed to create JWT: {}", e))
        })
    }
}

#[async_trait]
impl AuthServiceInterface for AuthService {
    #[instrument(skip(self, password), level = "debug")]
    async fn login_user(&self, email: &str, password: &str) -> AuthServiceResult<(User, String)> {
        tracing::debug!("Attempting to authenticate user.");

        let user = self
            .user_service
            .get_user_by_email(email)
            .await
            .map_err(|_| {
                tracing::warn!(
                    "Authentication failed: user not found or other error during lookup."
                );
                AuthServiceError::InvalidCredentials
            })?;

        if verify_password(password, &user.password_hash)? {
            tracing::debug!(user_id = %user.id, "Password verification successful.");
            let token = self.create_jwt(user.id, email, &user.role)?;
            Ok((user, token))
        } else {
            tracing::warn!(user_id = %user.id, "Password verification failed.");
            Err(AuthServiceError::InvalidCredentials)
        }
    }
}
