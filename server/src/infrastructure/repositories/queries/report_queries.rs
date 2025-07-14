use rbatis::{executor::Executor, html_sql};
use uuid::Uuid;

use crate::infrastructure::repositories::entities::report_entity::ReportEntity;

#[html_sql("src/infrastructure/repositories/queries/templates/report_queries.html")]
pub async fn find_by_id(rb: &dyn Executor, id: Uuid) -> Option<ReportEntity> {
    impled!()
}

#[html_sql("src/infrastructure/repositories/queries/templates/report_queries.html")]
pub async fn find_recent_reports_by_board(
    rb: &dyn Executor,
    board_id: Uuid,
    limit: i64,
) -> Vec<ReportEntity> {
    impled!()
}

#[html_sql("src/infrastructure/repositories/queries/templates/report_queries.html")]
pub async fn find_by_board_id_paginated(
    rb: &dyn Executor,
    board_id: Uuid,
    per_page: i32,
    offset: i32,
) -> Vec<ReportEntity> {
    impled!()
}

#[html_sql("src/infrastructure/repositories/queries/templates/report_queries.html")]
pub async fn count_by_board_id(rb: &dyn Executor, board_id: Uuid) -> rbatis::Result<i64> {
    impled!()
}

#[html_sql("src/infrastructure/repositories/queries/templates/report_queries.html")]
pub async fn insert_report(
    rb: &dyn Executor,
    entity: ReportEntity,
) -> rbatis::Result<ReportEntity> {
    impled!()
}
