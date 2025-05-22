use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::SqlitePool;
use tracing::instrument;
use uuid::Uuid;

use crate::domain::{
    models::user::{User, UserRole},
    repositories::{RepositoryResult, map_sqlx_error, user_repository::UserRepository},
};

#[derive(Clone)]
pub struct SqliteUserRepository {
    pool: SqlitePool,
}

impl SqliteUserRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl UserRepository for SqliteUserRepository {
    #[instrument(skip(self, password_hash), fields(email = %email, role = %role), level = "debug")]
    async fn create_user(
        &self,
        email: &str,
        password_hash: &str,
        first_name: Option<&str>,
        last_name: Option<&str>,
        role: UserRole,
    ) -> RepositoryResult<User> {
        let user_id = Uuid::new_v4();
        tracing::debug!(user_id = %user_id, "Executing insert query for new user.");

        sqlx::query_as!(
            User,
            r#"
            INSERT INTO users (id, email, password_hash, first_name, last_name, role)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                id as "id: uuid::Uuid",
                email,
                password_hash,
                first_name,
                last_name,
                role as "role: UserRole",
                created_at as "created_at: DateTime<Utc>",
                updated_at as "updated_at: DateTime<Utc>"
            "#,
            user_id,
            email,
            password_hash,
            first_name,
            last_name,
            role
        )
        .fetch_one(&self.pool)
        .await
        .map_err(map_sqlx_error)
    }

    #[instrument(skip(self), fields(email = %email), level = "debug")]
    async fn find_by_email(&self, email: &str) -> RepositoryResult<Option<User>> {
        sqlx::query_as!(
            User,
            r#"
            SELECT
                id as "id: uuid::Uuid",
                email,
                password_hash,
                first_name,
                last_name,
                role as "role: UserRole",
                created_at as "created_at: DateTime<Utc>",
                updated_at as "updated_at: DateTime<Utc>"
            FROM users
            WHERE email = $1
            "#,
            email
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(map_sqlx_error)
    }

    #[instrument(skip(self), fields(id = %id), level = "debug")]
    async fn find_by_id(&self, id: Uuid) -> RepositoryResult<Option<User>> {
        sqlx::query_as!(
            User,
            r#"
            SELECT
                id as "id: uuid::Uuid",
                email,
                password_hash,
                first_name,
                last_name,
                role as "role: UserRole",
                created_at as "created_at: DateTime<Utc>",
                updated_at as "updated_at: DateTime<Utc>"
            FROM users
            WHERE id = $1 
            "#,
            id
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(map_sqlx_error)
    }
}
