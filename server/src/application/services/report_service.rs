use async_trait::async_trait;
use bytes::Bytes;
use std::sync::Arc;
use tracing::instrument;
use uuid::Uuid;

use crate::domain::{
    models::report::{Report, ReportType},
    ports::storage_port::{StorageError, StoragePort},
    repositories::{RepositoryError, report_repository::ReportRepository},
};

#[derive(Debug, thiserror::Error)]
pub enum ReportServiceError {
    #[error("Repository error: {0}")]
    RepositoryError(#[from] RepositoryError),
    #[error("Storage error: {0}")]
    StorageError(#[from] StorageError),
    #[error("Report not found")]
    ReportNotFound,
    #[error("Internal server error: {0}")]
    InternalError(String),
}

pub type ReportServiceResult<T> = Result<T, ReportServiceError>;

#[async_trait]
pub trait ReportServiceInterface: Send + Sync {
    async fn create_screenshot_report(
        &self,
        user_id: Uuid,
        original_file_name: &str,
        file_data: Bytes,
        title: String,
        description: Option<String>,
        url: Option<String>,
    ) -> ReportServiceResult<Report>;

    async fn get_report(&self, id: Uuid) -> ReportServiceResult<Report>;
}

#[derive(Clone)]
pub struct ReportService {
    report_repository: Arc<dyn ReportRepository>,
    storage_port: Arc<dyn StoragePort>,
}

impl ReportService {
    pub fn new(
        report_repository: Arc<dyn ReportRepository>,
        storage_port: Arc<dyn StoragePort>,
    ) -> Self {
        Self {
            report_repository,
            storage_port,
        }
    }
}

#[async_trait]
impl ReportServiceInterface for ReportService {
    #[instrument(skip(self, file_data), fields(user_id = %user_id), level="info")]
    async fn create_screenshot_report(
        &self,
        user_id: Uuid,
        original_file_name: &str,
        file_data: Bytes,
        title: String,
        description: Option<String>,
        url: Option<String>,
    ) -> ReportServiceResult<Report> {
        tracing::debug!("Creating screenshot report");

        tracing::debug!("Saving file to storage");
        let file_path = self
            .storage_port
            .save_file(original_file_name, file_data)
            .await?;

        tracing::debug!("Saving report");
        let mut report = self
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

        report.file_path = self.storage_port.get_public_url(&report.file_path);

        tracing::info!(report_id = %report.id, "Screenshot report created successfully");
        Ok(report)
    }

    #[instrument(skip(self), fields(report_id = %id), level="info")]
    async fn get_report(&self, id: Uuid) -> ReportServiceResult<Report> {
        tracing::debug!("Fetching report with ID: {}", id);

        let mut report = self
            .report_repository
            .get_report(id)
            .await?
            .ok_or(ReportServiceError::ReportNotFound)?;

        report.file_path = self.storage_port.get_public_url(&report.file_path);

        tracing::info!(report_id = %report.id, "Report fetched successfully");
        Ok(report)
    }
}
