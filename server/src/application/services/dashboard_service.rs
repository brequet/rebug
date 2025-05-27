use async_trait::async_trait;
use std::sync::Arc;
use tracing::instrument;
use uuid::Uuid;

use super::{
    board_service::{BoardServiceError, BoardServiceInterface},
    report_service::{ReportServiceError, ReportServiceInterface},
};

#[derive(Debug, thiserror::Error)]
pub enum DashboardServiceError {
    #[error("Board service error: {0}")]
    BoardServiceError(#[from] BoardServiceError),
    #[error("Report service error: {0}")]
    ReportServiceError(#[from] ReportServiceError),
    #[error("Internal server error: {0}")]
    InternalError(String),
}

pub type DashboardServiceResult<T> = Result<T, DashboardServiceError>;

#[derive(Debug, Clone)]
pub struct DashboardData {
    pub boards_with_reports: Vec<BoardWithReports>,
}

#[derive(Debug, Clone)]
pub struct BoardWithReports {
    pub board: crate::domain::models::board::Board,
    pub recent_reports: Vec<crate::domain::models::report::Report>,
}

#[async_trait]
pub trait DashboardServiceInterface: Send + Sync {
    async fn get_user_dashboard(&self, user_id: Uuid) -> DashboardServiceResult<DashboardData>;
}

pub struct DashboardService {
    board_service: Arc<dyn BoardServiceInterface>,
    report_service: Arc<dyn ReportServiceInterface>,
}

impl DashboardService {
    pub fn new(
        board_service: Arc<dyn BoardServiceInterface>,
        report_service: Arc<dyn ReportServiceInterface>,
    ) -> Self {
        Self {
            board_service,
            report_service,
        }
    }
}

#[async_trait]
impl DashboardServiceInterface for DashboardService {
    #[instrument(skip(self), fields(user_id = %user_id), level = "info")]
    async fn get_user_dashboard(&self, user_id: Uuid) -> DashboardServiceResult<DashboardData> {
        let boards = self.board_service.get_boards_by_user_id(user_id).await?;

        let mut boards_with_reports = Vec::new();

        for board in boards {
            let recent_reports = self
                .report_service
                .get_recent_reports_by_board(board.id, 5)
                .await
                .unwrap_or_else(|e| {
                    tracing::warn!(
                        board_id = %board.id,
                        error = %e,
                        "Failed to fetch recent reports for board, using empty list"
                    );
                    Vec::new()
                });

            boards_with_reports.push(BoardWithReports {
                board,
                recent_reports,
            });
        }

        tracing::info!(
            user_id = %user_id,
            boards_count = boards_with_reports.len(),
            "Dashboard data retrieved successfully"
        );

        Ok(DashboardData {
            boards_with_reports,
        })
    }
}
