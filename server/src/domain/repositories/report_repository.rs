use async_trait::async_trait;
use uuid::Uuid;

use crate::domain::models::report::{Report, ReportType};

use super::RepositoryResult;

#[async_trait]
pub trait ReportRepository: Send + Sync {
    async fn create_report(
        &self,
        user_id: Uuid,
        board_id: Uuid,
        title: String,
        report_type: ReportType,
        description: Option<String>,
        file_path: String,
        url: Option<String>,
    ) -> RepositoryResult<Report>;

    async fn get_report(&self, id: Uuid) -> RepositoryResult<Option<Report>>;
}
