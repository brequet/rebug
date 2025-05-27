use async_trait::async_trait;
use uuid::Uuid;

use crate::domain::models::report::{CreateReportParams, Report};

use super::RepositoryResult;

#[async_trait]
pub trait ReportRepository: Send + Sync {
    async fn create_report(&self, params: CreateReportParams) -> RepositoryResult<Report>;

    async fn get_report(&self, id: Uuid) -> RepositoryResult<Option<Report>>;

    async fn get_recent_reports_by_board(
        &self,
        board_id: Uuid,
        limit: usize,
    ) -> RepositoryResult<Vec<Report>>;
}
