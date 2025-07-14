pub mod board_repository;
pub mod report_repository;
pub mod user_repository;

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
