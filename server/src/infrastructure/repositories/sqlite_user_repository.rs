use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{Error as SqlxError, SqlitePool};
use uuid::Uuid;

use crate::domain::{
    models::user::{User, UserRole},
    repositories::user_repository::{RepositoryError, RepositoryResult, UserRepository},
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

fn map_sqlx_error(e: SqlxError) -> RepositoryError {
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

#[async_trait]
impl UserRepository for SqliteUserRepository {
    async fn create_user(
        &self,
        email: &str,
        password_hash: &str,
        first_name: Option<&str>,
        last_name: Option<&str>,
        role: UserRole,
    ) -> RepositoryResult<User> {
        let user_id = Uuid::new_v4();

        let result = sqlx::query_as!(
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
        .await;

        match result {
            Ok(user) => Ok(user),
            Err(e) => Err(map_sqlx_error(e)),
        }
    }

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
