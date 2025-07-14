use rbatis::{executor::Executor, html_sql};
use uuid::Uuid;

use crate::infrastructure::repositories::entities::board_entity::BoardEntity;

#[html_sql("src/infrastructure/repositories/queries/templates/board_queries.html")]
pub async fn find_by_id(rb: &dyn Executor, id: Uuid) -> Option<BoardEntity> {
    impled!()
}

#[html_sql("src/infrastructure/repositories/queries/templates/board_queries.html")]
pub async fn find_by_owner_id(rb: &dyn Executor, owner_id: Uuid) -> Vec<BoardEntity> {
    impled!()
}

#[html_sql("src/infrastructure/repositories/queries/templates/board_queries.html")]
pub async fn insert_board(rb: &dyn Executor, entity: BoardEntity) -> rbatis::Result<BoardEntity> {
    impled!()
}
