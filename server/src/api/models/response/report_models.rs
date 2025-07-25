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
    pub thumbnail_file_path: Option<String>,
    pub url: Option<String>,
    pub browser_name: Option<String>,
    pub browser_version: Option<String>,
    pub os_name: Option<String>,
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
            thumbnail_file_path: report.thumbnail_file_path,
            url: report.url,
            browser_name: report.browser_name,
            browser_version: report.browser_version,
            os_name: report.os_name,
            created_at: report.created_at,
            updated_at: report.updated_at,
        }
    }
}
