use sqlx::Error as SqlxError;

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

pub fn map_sqlx_error(e: SqlxError) -> RepositoryError {
    match e {
        SqlxError::RowNotFound => RepositoryError::NotFound,
        SqlxError::Database(db_err) => {
            if db_err.is_unique_violation() {
                RepositoryError::AlreadyExists
            } else {
                RepositoryError::DatabaseError(db_err.to_string())
            }
        }
        _ => RepositoryError::DatabaseError(e.to_string()),
    }
}

pub type RepositoryResult<T> = Result<T, RepositoryError>;
