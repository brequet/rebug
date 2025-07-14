use async_trait::async_trait;
use rbatis::RBatis;
use tracing::instrument;
use uuid::Uuid;

use crate::{
    domain::{
        models::user::{User, UserRole},
        repositories::{RepositoryResult, user_repository::UserRepository},
    },
    infrastructure::repositories::{
        entities::user_entity::UserEntity, map_rbatis_error, queries::user_queries,
    },
};

#[derive(Clone)]
pub struct SqliteUserRepository {
    rb: RBatis,
}

impl SqliteUserRepository {
    pub fn new(rb: RBatis) -> Self {
        Self { rb }
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
        let current_date_time = chrono::Utc::now();

        let entity = UserEntity {
            id: Uuid::new_v4(),
            email: email.to_string(),
            password_hash: password_hash.to_string(),
            first_name: first_name.map(|s| s.to_string()),
            last_name: last_name.map(|s| s.to_string()),
            role,
            created_at: current_date_time,
            updated_at: current_date_time,
        };

        tracing::debug!(user_id = %entity.id, "Executing insert query for new user.");

        user_queries::insert_user(&self.rb, entity)
            .await
            .map_err(map_rbatis_error)
            .map(UserEntity::into)
    }

    #[instrument(skip(self), fields(id = %id), level = "debug")]
    async fn find_by_id(&self, id: Uuid) -> RepositoryResult<Option<User>> {
        user_queries::find_by_id(&self.rb, id)
            .await
            .map_err(map_rbatis_error)
            .map(|opt_entity| opt_entity.map(UserEntity::into))
    }

    #[instrument(skip(self), fields(email = %email), level = "debug")]
    async fn find_by_email(&self, email: &str) -> RepositoryResult<Option<User>> {
        user_queries::find_by_email(&self.rb, email)
            .await
            .map_err(map_rbatis_error)
            .map(|opt_entity| opt_entity.map(UserEntity::into))
    }
}
