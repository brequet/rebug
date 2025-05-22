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
    ) -> BoardServiceResult<Board>;

    async fn get_board_by_id(&self, board_id: Uuid) -> BoardServiceResult<Board>;
    async fn get_boards_by_user_id(&self, user_id: Uuid) -> BoardServiceResult<Vec<Board>>;
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
    ) -> BoardServiceResult<Board> {
        tracing::debug!("Creating board");

        if name.is_empty() {
            return Err(BoardServiceError::ValidationError(
                "Board name cannot be empty".to_string(),
            ));
        }

        let board = self
            .board_repository
            .create_board(name, description, owner_id)
            .await?;

        tracing::info!(board_id = %board.id,"Board created successfully");
        Ok(board)
    }

    #[instrument(skip(self), fields(board_id = %board_id), level = "debug")]
    async fn get_board_by_id(&self, board_id: Uuid) -> BoardServiceResult<Board> {
        tracing::debug!("Fetching board by ID");
        self.board_repository
            .find_by_id(board_id)
            .await?
            .ok_or(BoardServiceError::BoardNotFound)
    }

    #[instrument(skip(self), fields(user_id = %user_id), level = "debug")]
    async fn get_boards_by_user_id(&self, user_id: Uuid) -> BoardServiceResult<Vec<Board>> {
        tracing::debug!("Fetching boards by user ID");
        let boards = self.board_repository.find_by_user_id(user_id).await?;

        if boards.is_empty() {
            Err(BoardServiceError::BoardNotFound)
        } else {
            Ok(boards)
        }
    }
}
