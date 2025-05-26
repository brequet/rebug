use async_trait::async_trait;
use std::sync::Arc;
use uuid::Uuid;

use crate::domain::{models::user::UserRole, repositories::board_repository::BoardRepository};

#[derive(Debug, thiserror::Error)]
pub enum AuthorizationError {
    #[error("Access denied")]
    AccessDenied,
    #[error("Resource not found")]
    ResourceNotFound,
    #[error("Internal error: {0}")]
    InternalError(String),
}

pub type AuthorizationResult<T> = Result<T, AuthorizationError>;

#[async_trait]
pub trait AuthorizationServiceInterface: Send + Sync {
    async fn assert_can_user_access_board(
        &self,
        user_id: Uuid,
        board_id: Uuid,
    ) -> AuthorizationResult<bool>;

    async fn assert_can_user_create_report(
        &self,
        user_id: Uuid,
        board_id: Uuid,
        user_role: &UserRole,
    ) -> AuthorizationResult<bool>;
}

pub struct AuthorizationService {
    board_repository: Arc<dyn BoardRepository>,
}

impl AuthorizationService {
    pub fn new(board_repository: Arc<dyn BoardRepository>) -> Self {
        Self { board_repository }
    }
}

#[async_trait]
impl AuthorizationServiceInterface for AuthorizationService {
    async fn assert_can_user_access_board(
        &self,
        user_id: Uuid,
        board_id: Uuid,
    ) -> AuthorizationResult<bool> {
        let board = self
            .board_repository
            .find_by_id(board_id)
            .await
            .map_err(|e| AuthorizationError::InternalError(e.to_string()))?
            .ok_or(AuthorizationError::ResourceNotFound)?;

        Ok(board.owner_id == user_id)
    }

    async fn assert_can_user_create_report(
        &self,
        user_id: Uuid,
        board_id: Uuid,
        user_role: &UserRole,
    ) -> AuthorizationResult<bool> {
        if matches!(user_role, UserRole::Admin) {
            return Ok(true);
        }

        self.assert_can_user_access_board(user_id, board_id).await
    }
}
