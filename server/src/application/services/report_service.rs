use async_trait::async_trait;
use std::sync::Arc;
use tracing::instrument;
use uuid::Uuid;

use crate::domain::{
    models::report::{CreateReportParams, CreateScreenshotReportParams, Report, ReportType},
    ports::storage_port::{StorageError, StoragePort},
    repositories::{RepositoryError, report_repository::ReportRepository},
};

use super::{
    authorization_service::{AuthorizationError, AuthorizationServiceInterface},
    board_service::BoardServiceError,
};

#[derive(Debug, thiserror::Error)]
pub enum ReportServiceError {
    #[error("Repository error: {0}")]
    RepositoryError(#[from] RepositoryError),
    #[error("Storage error: {0}")]
    StorageError(#[from] StorageError),
    #[error("Authorization error: {0}")]
    AuthorizationError(#[from] AuthorizationError),
    #[error("Report not found: {context}")]
    ReportNotFound { context: String },
    #[error("Internal server error: {0}")]
    InternalError(String),
}

impl From<BoardServiceError> for ReportServiceError {
    fn from(err: BoardServiceError) -> Self {
        match err {
            BoardServiceError::ValidationError(msg) => ReportServiceError::InternalError(msg),
            BoardServiceError::BoardAlreadyExists => {
                ReportServiceError::InternalError("Board already exists".to_string())
            }
            BoardServiceError::BoardNotFound => {
                ReportServiceError::InternalError("Board not found".to_string())
            }
            BoardServiceError::AccessDenied => {
                ReportServiceError::InternalError("Access denied".to_string())
            }
            BoardServiceError::InternalError(msg) => ReportServiceError::InternalError(msg),
        }
    }
}

pub type ReportServiceResult<T> = Result<T, ReportServiceError>;

#[async_trait]
pub trait ReportServiceInterface: Send + Sync {
    async fn create_screenshot_report(
        &self,
        params: CreateScreenshotReportParams,
    ) -> ReportServiceResult<Report>;

    async fn get_report(&self, id: Uuid) -> ReportServiceResult<Report>;

    async fn get_recent_reports_by_board(
        &self,
        board_id: Uuid,
        limit: usize,
    ) -> ReportServiceResult<Vec<Report>>;
}

#[derive(Clone)]
pub struct ReportService {
    report_repository: Arc<dyn ReportRepository>,
    storage_port: Arc<dyn StoragePort>,

    authorization_service: Arc<dyn AuthorizationServiceInterface>,
}

impl ReportService {
    pub fn new(
        report_repository: Arc<dyn ReportRepository>,
        storage_port: Arc<dyn StoragePort>,
        authorization_service: Arc<dyn AuthorizationServiceInterface>,
    ) -> Self {
        Self {
            report_repository,
            storage_port,
            authorization_service,
        }
    }
}

#[async_trait]
impl ReportServiceInterface for ReportService {
    #[instrument(skip(self, params), fields(user_id = %params.user_id), board_id= %params.board_id, level="info")]
    async fn create_screenshot_report(
        &self,
        params: CreateScreenshotReportParams,
    ) -> ReportServiceResult<Report> {
        self.authorization_service
            .assert_can_user_create_report(params.user_id, params.board_id, &params.user_role)
            .await?;

        tracing::debug!("Saving file to storage");
        let file_path = self
            .storage_port
            .save_file(&params.original_file_name, params.file_data)
            .await?;

        tracing::debug!("Saving report");
        let create_params = CreateReportParams {
            user_id: params.user_id,
            board_id: params.board_id,
            title: params.title,
            report_type: ReportType::Screenshot,
            description: params.description,
            file_path,
            url: params.url,
            browser_name: params.browser_name,
            browser_version: params.browser_version,
            os_name: params.os_name,
        };

        let report = self.report_repository.create_report(create_params).await?;

        tracing::info!(report_id = %report.id, "Screenshot report created successfully");
        Ok(report)
    }

    #[instrument(skip(self), fields(report_id = %id), level="info")]
    async fn get_report(&self, id: Uuid) -> ReportServiceResult<Report> {
        tracing::debug!("Fetching report with ID: {}", id);

        let report = self
            .report_repository
            .get_report(id)
            .await?
            .ok_or_else(|| ReportServiceError::ReportNotFound {
                context: format!("Failed to fetch report with ID: {}", id),
            })?;

        tracing::info!(report_id = %report.id, "Report fetched successfully");
        Ok(report)
    }

    #[instrument(skip(self), fields(board_id = %board_id, limit = %limit), level = "debug")]
    async fn get_recent_reports_by_board(
        &self,
        board_id: Uuid,
        limit: usize,
    ) -> ReportServiceResult<Vec<Report>> {
        let reports = self
            .report_repository
            .get_recent_reports_by_board(board_id, limit)
            .await?;

        tracing::debug!(
            board_id = %board_id,
            reports_count = reports.len(),
            "Recent reports fetched successfully"
        );

        Ok(reports)
    }
}
