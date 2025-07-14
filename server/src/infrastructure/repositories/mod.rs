use rbatis::Error as RbatisError;

use crate::domain::repositories::RepositoryError;

pub mod board_repository;
pub mod report_repository;
pub mod user_repository;

mod entities;
pub mod queries;

pub fn map_rbatis_error(e: RbatisError) -> RepositoryError {
    // TODO: not found error ?
    match e {
        RbatisError::E(e) if e.contains("UNIQUE constraint failed") => {
            RepositoryError::AlreadyExists
        }
        _ => RepositoryError::DatabaseError(e.to_string()),
    }
}

pub type RepositoryResult<T> = Result<T, RepositoryError>;
