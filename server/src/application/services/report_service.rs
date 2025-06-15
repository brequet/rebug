use async_trait::async_trait;
use mime_guess::MimeGuess;
use std::sync::Arc;
use tracing::instrument;
use uuid::Uuid;

use crate::domain::{
    models::report::{CreateReportParams, CreateReportServiceParams, Report, ReportType},
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
    async fn create_report(&self, params: CreateReportServiceParams)
    -> ReportServiceResult<Report>;

    async fn get_report(&self, id: Uuid) -> ReportServiceResult<Report>;

    // TODO: remove this method and use pagination instead
    async fn get_recent_reports_by_board(
        &self,
        board_id: Uuid,
        limit: usize,
    ) -> ReportServiceResult<Vec<Report>>;

    async fn get_reports_by_board_paginated(
        &self,
        board_id: Uuid,
        page: i32,
        per_page: i32,
    ) -> ReportServiceResult<(Vec<Report>, i32)>;
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
    async fn create_report(
        &self,
        params: CreateReportServiceParams,
    ) -> ReportServiceResult<Report> {
        self.authorization_service
            .assert_can_user_create_report(params.user_id, params.board_id, &params.user_role)
            .await?;

        let guess = MimeGuess::from_path(&params.original_file_name).first_or_octet_stream();
        let report_type = match guess.type_().as_str() {
            "image" => ReportType::Screenshot,
            "video" => ReportType::Video,
            _ => {
                return Err(ReportServiceError::InternalError(
                    "Unsupported file type.".to_string(),
                ));
            }
        };

        tracing::debug!(?report_type, "Determined report type from file MIME type.");

        tracing::debug!("Saving file to storage");
        let file_path = self
            .storage_port
            .save_file(&params.original_file_name, params.file_data)
            .await?;

        let thumbnail_file_path = if let Some(thumbnail_data) = params.thumbnail_data {
            Some(
                self.storage_port
                    .save_file("thumbnail.jpeg", thumbnail_data)
                    .await?,
            )
        } else {
            None
        };

        tracing::debug!("Saving report");
        let create_params = CreateReportParams {
            user_id: params.user_id,
            board_id: params.board_id,
            title: params.title,
            report_type,
            description: params.description,
            file_path,
            thumbnail_file_path,
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

    #[instrument(skip(self), fields(board_id = %board_id, page = %page, per_page = %per_page), level = "debug")]
    async fn get_reports_by_board_paginated(
        &self,
        board_id: Uuid,
        page: i32,
        per_page: i32,
    ) -> ReportServiceResult<(Vec<Report>, i32)> {
        let reports = self
            .report_repository
            .find_by_board_id_paginated(board_id, page, per_page)
            .await?;

        let total_items = self.report_repository.count_by_board_id(board_id).await?;

        Ok((reports, total_items))
    }
}
