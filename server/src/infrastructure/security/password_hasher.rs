use bcrypt::{DEFAULT_COST, hash, verify};

#[derive(Debug, thiserror::Error)]
pub enum PasswordError {
    #[error("Failed to hash password: {0}")]
    HashingError(String),
    #[error("Failed to verify password: {0}")]
    VerificationError(String),
    #[error("Invalid password")]
    InvalidPassword,
}

pub type PasswordResult<T> = Result<T, PasswordError>;

pub fn hash_password(password: &str) -> PasswordResult<String> {
    hash(password, DEFAULT_COST).map_err(|e| PasswordError::HashingError(e.to_string()))
}

pub fn verify_password(password: &str, hashed_password: &str) -> PasswordResult<bool> {
    verify(password, hashed_password).map_err(|e| PasswordError::VerificationError(e.to_string()))
}
