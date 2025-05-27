use serde::Serialize;
use ts_rs::TS;
use uuid::Uuid;

use crate::domain::models::report::{Report, ReportType};

#[derive(Serialize, Debug, TS)]
#[ts(export)]
pub struct ReportResponse {
    pub id: Uuid,
    pub board_id: Uuid,
    pub title: String,
    pub report_type: ReportType,
    pub description: Option<String>,
    pub file_path: String,
    pub url: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl From<Report> for ReportResponse {
    fn from(report: Report) -> Self {
        Self {
            id: report.id,
            board_id: report.board_id,
            title: report.title,
            report_type: report.report_type,
            description: report.description,
            file_path: report.file_path,
            url: report.url,
            created_at: report.created_at,
            updated_at: report.updated_at,
        }
    }
}
