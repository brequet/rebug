use std::sync::Arc;

use async_trait::async_trait;
use tracing::instrument;
use uuid::Uuid;

use crate::domain::{
    models::board::Board,
    repositories::{RepositoryError, board_repository::BoardRepository},
};

#[derive(Debug, thiserror::Error)]
pub enum BoardServiceError {
    #[error("Validation error: {0}")]
    ValidationError(String),
    #[error("Board already exists")]
    BoardAlreadyExists,
    #[error("Board not found")]
    BoardNotFound,
    #[error("Access denied")]
    AccessDenied,
    #[error("Internal server error: {0}")]
    InternalError(String),
}

impl From<RepositoryError> for BoardServiceError {
    fn from(err: RepositoryError) -> Self {
        match err {
            RepositoryError::NotFound => BoardServiceError::BoardNotFound,
            RepositoryError::AlreadyExists => BoardServiceError::BoardAlreadyExists,
            RepositoryError::DatabaseError(msg) => BoardServiceError::InternalError(msg),
        }
    }
}

pub type BoardServiceResult<T> = Result<T, BoardServiceError>;

#[async_trait]
pub trait BoardServiceInterface: Send + Sync {
    async fn create_board(
        &self,
        name: &str,
        description: Option<&str>,
        owner_id: Uuid,
        is_default: bool,
    ) -> BoardServiceResult<Board>;

    async fn get_board_by_id(&self, board_id: Uuid) -> BoardServiceResult<Board>;
    async fn get_boards_by_user_id(&self, user_id: Uuid) -> BoardServiceResult<Vec<Board>>;

    async fn ensure_user_can_access_board(
        &self,
        user_id: Uuid,
        board_id: Uuid,
    ) -> BoardServiceResult<bool>;
}

#[derive(Clone)]
pub struct BoardService {
    board_repository: Arc<dyn BoardRepository>,
}

impl BoardService {
    pub fn new(board_repository: Arc<dyn BoardRepository>) -> Self {
        Self { board_repository }
    }
}

#[async_trait]
impl BoardServiceInterface for BoardService {
    #[instrument(skip(self, description), fields(owner_id, board_name = %name), level = "info")]
    async fn create_board(
        &self,
        name: &str,
        description: Option<&str>,
        owner_id: Uuid,
        is_default: bool,
    ) -> BoardServiceResult<Board> {
        if name.is_empty() {
            return Err(BoardServiceError::ValidationError(
                "Board name cannot be empty".to_string(),
            ));
        }

        let board = self
            .board_repository
            .create_board(name, description, owner_id, is_default)
            .await?;

        tracing::info!(board_id = %board.id,"Board created successfully");
        Ok(board)
    }

    #[instrument(skip(self), fields(board_id = %board_id), level = "debug")]
    async fn get_board_by_id(&self, board_id: Uuid) -> BoardServiceResult<Board> {
        self.board_repository
            .find_by_id(board_id)
            .await?
            .ok_or(BoardServiceError::BoardNotFound)
    }

    #[instrument(skip(self), fields(user_id = %user_id), level = "debug")]
    async fn get_boards_by_user_id(&self, user_id: Uuid) -> BoardServiceResult<Vec<Board>> {
        let boards = self.board_repository.find_by_user_id(user_id).await?;

        if boards.is_empty() {
            Err(BoardServiceError::BoardNotFound)
        } else {
            Ok(boards)
        }
    }

    #[instrument(skip(self), fields(user_id = %user_id), level = "debug")]
    async fn ensure_user_can_access_board(
        &self,
        user_id: Uuid,
        board_id: Uuid,
    ) -> BoardServiceResult<bool> {
        let board = self.get_board_by_id(board_id).await?;

        if board.owner_id == user_id {
            Ok(true)
        } else {
            Err(BoardServiceError::AccessDenied)
        }
    }
}
