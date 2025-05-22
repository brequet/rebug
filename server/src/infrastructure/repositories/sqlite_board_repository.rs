use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::SqlitePool;
use tracing::instrument;
use uuid::Uuid;

use crate::domain::{
    models::board::Board,
    repositories::{RepositoryResult, board_repository::BoardRepository, map_sqlx_error},
};

#[derive(Clone)]
pub struct SqliteBoardRepository {
    pool: SqlitePool,
}

impl SqliteBoardRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
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
    ) -> RepositoryResult<Board> {
        let board_id = Uuid::new_v4();
        tracing::debug!(board_id = %board_id, "Creating new board.");

        sqlx::query_as!(
            Board,
            r#"
            INSERT INTO boards (id, name, description, owner_id)
             VALUES (?, ?, ?, ?)
             RETURNING 
                id as "id: uuid::Uuid",
                owner_id as "owner_id: uuid::Uuid",
                name,
                description,
                created_at as "created_at: DateTime<Utc>",
                updated_at as "updated_at: DateTime<Utc>"
            "#,
            board_id,
            name,
            description,
            owner_id
        )
        .fetch_one(&self.pool)
        .await
        .map_err(map_sqlx_error)
    }

    #[instrument(skip(self), level = "debug")]
    async fn find_by_id(&self, id: Uuid) -> RepositoryResult<Option<Board>> {
        sqlx::query_as!(
            Board,
            r#"
            SELECT 
                id as "id: uuid::Uuid",
                owner_id as "owner_id: uuid::Uuid",
                name,
                description,
                created_at as "created_at: DateTime<Utc>",
                updated_at as "updated_at: DateTime<Utc>"
            FROM boards
            WHERE id = ?
            "#,
            id
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(map_sqlx_error)
    }

    #[instrument(skip(self), level = "debug")]
    async fn find_by_user_id(&self, user_id: Uuid) -> RepositoryResult<Vec<Board>> {
        sqlx::query_as!(
            Board,
            r#"
            SELECT 
                id as "id: uuid::Uuid",
                owner_id as "owner_id: uuid::Uuid",
                name,
                description,
                created_at as "created_at: DateTime<Utc>",
                updated_at as "updated_at: DateTime<Utc>"
            FROM boards
            WHERE owner_id = ?
            "#,
            user_id
        )
        .fetch_all(&self.pool)
        .await
        .map_err(map_sqlx_error)
    }
}
