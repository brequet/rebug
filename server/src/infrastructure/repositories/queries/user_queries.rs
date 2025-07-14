use rbatis::{executor::Executor, html_sql};
use uuid::Uuid;

use crate::infrastructure::repositories::entities::user_entity::UserEntity;

#[html_sql("src/infrastructure/repositories/queries/templates/user_queries.html")]
pub async fn find_by_id(rb: &dyn Executor, id: Uuid) -> Option<UserEntity> {
    impled!()
}

#[html_sql("src/infrastructure/repositories/queries/templates/user_queries.html")]
pub async fn find_by_email(rb: &dyn Executor, email: &str) -> Option<UserEntity> {
    impled!()
}

#[html_sql("src/infrastructure/repositories/queries/templates/user_queries.html")]
pub async fn insert_user(rb: &dyn Executor, entity: UserEntity) -> rbatis::Result<UserEntity> {
    impled!()
}
