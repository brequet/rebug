use std::sync::Arc;
use uuid::Uuid;

use crate::domain::{
    models::report::{Report, ReportType},
    repositories::{RepositoryError, report_repository::ReportRepository},
};

#[derive(Debug, thiserror::Error)]
pub enum ReportServiceError {
    #[error("Repository error: {0}")]
    RepositoryError(#[from] RepositoryError),
    #[error("Internal server error: {0}")]
    InternalError(String),
}

pub type ReportServiceResult<T> = Result<T, ReportServiceError>;

#[derive(Clone)]
pub struct ReportService {
    report_repository: Arc<dyn ReportRepository>,
}

impl ReportService {
    pub fn new(report_repository: Arc<dyn ReportRepository>) -> Self {
        Self { report_repository }
    }

    pub async fn create_screenshot_report(
        &self,
        user_id: Uuid,
        title: String,
        description: Option<String>,
        file_path: String,
        url: Option<String>,
    ) -> ReportServiceResult<Report> {
        let report = self
            .report_repository
            .create_report(
                user_id,
                title,
                ReportType::Screenshot,
                description,
                file_path,
                url,
            )
            .await?;
        Ok(report)
    }
}
