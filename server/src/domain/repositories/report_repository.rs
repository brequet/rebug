use async_trait::async_trait;
use uuid::Uuid;

use crate::domain::models::report::{CreateReportParams, Report};

use super::RepositoryResult;

#[async_trait]
pub trait ReportRepository: Send + Sync {
    async fn create_report(&self, params: CreateReportParams) -> RepositoryResult<Report>;

    async fn find_by_id(&self, id: Uuid) -> RepositoryResult<Option<Report>>;

    async fn find_recent_reports_by_board(
        // TODO: migrate away
        &self,
        board_id: Uuid,
        limit: usize,
    ) -> RepositoryResult<Vec<Report>>;

    async fn find_by_board_id_paginated(
        &self,
        board_id: Uuid,
        page: i32,
        per_page: i32,
    ) -> RepositoryResult<Vec<Report>>;

    async fn count_by_board_id(&self, board_id: Uuid) -> RepositoryResult<i32>;
}
