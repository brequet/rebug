use uuid::Uuid;

use crate::domain::models::user::{User, UserRole};

#[derive(Debug, thiserror::Error)]
pub enum RepositoryError {
    #[error("User not found")]
    NotFound,
    #[error("User already exists")]
    AlreadyExists,
    #[error("Database error: {0}")]
    DatabaseError(String),
}

pub type RepositoryResult<T> = Result<T, RepositoryError>;

#[async_trait::async_trait]
pub trait UserRepository: Send + Sync {
    async fn create_user(
        &self,
        email: &str,
        password_hash: &str,
        first_name: Option<&str>,
        last_name: Option<&str>,
        role: UserRole,
    ) -> RepositoryResult<User>;

    async fn find_by_email(&self, email: &str) -> RepositoryResult<Option<User>>;
    async fn find_by_id(&self, id: Uuid) -> RepositoryResult<Option<User>>;
}
