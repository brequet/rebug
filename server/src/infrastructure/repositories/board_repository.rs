use async_trait::async_trait;
use rbatis::RBatis;
use tracing::instrument;
use uuid::Uuid;

use crate::{
    domain::{
        models::board::Board,
        repositories::{RepositoryResult, board_repository::BoardRepository},
    },
    infrastructure::repositories::{
        entities::board_entity::BoardEntity, map_rbatis_error, queries::board_queries,
    },
};

#[derive(Clone)]
pub struct SqliteBoardRepository {
    rb: RBatis,
}

impl SqliteBoardRepository {
    pub fn new(rb: RBatis) -> Self {
        Self { rb }
    }
}

#[async_trait]
impl BoardRepository for SqliteBoardRepository {
    #[instrument(skip(self), level = "debug")]
    async fn create_board(
        &self,
        name: &str,
        description: Option<&str>,
        owner_id: Uuid,
        is_default: bool,
    ) -> RepositoryResult<Board> {
        let current_date_time = chrono::Utc::now();

        let entity = BoardEntity {
            id: Uuid::new_v4(),
            name: name.to_string(),
            description: description.map(|d| d.to_string()),
            owner_id,
            is_default,
            created_at: current_date_time,
            updated_at: current_date_time,
        };

        tracing::debug!(board_id = %entity.id, "Creating new board.");

        board_queries::insert_board(&self.rb, entity)
            .await
            .map_err(map_rbatis_error)
            .map(BoardEntity::into)
    }

    #[instrument(skip(self), level = "debug")]
    async fn find_by_id(&self, id: Uuid) -> RepositoryResult<Option<Board>> {
        board_queries::find_by_id(&self.rb, id)
            .await
            .map_err(map_rbatis_error)
            .map(|opt_entity| opt_entity.map(BoardEntity::into))
    }

    #[instrument(skip(self), level = "debug")]
    async fn find_by_user_id(&self, user_id: Uuid) -> RepositoryResult<Vec<Board>> {
        board_queries::find_by_owner_id(&self.rb, user_id)
            .await
            .map_err(map_rbatis_error)
            .map(|entities| entities.into_iter().map(BoardEntity::into).collect())
    }
}
