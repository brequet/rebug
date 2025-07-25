use std::fmt;

use bytes::Bytes;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

use super::user::UserRole;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, TS)]
#[ts(export)]
pub enum ReportType {
    Screenshot,
    Video,
}

impl fmt::Display for ReportType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ReportType::Screenshot => write!(f, "Screenshot"),
            ReportType::Video => write!(f, "Video"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Report {
    pub id: Uuid,
    pub user_id: Uuid,
    pub board_id: Uuid,
    pub report_type: ReportType,
    pub title: String,
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

#[derive(Debug, Clone, Serialize)]
pub struct CreateReportParams {
    pub user_id: Uuid,
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
}

#[derive(Debug, Clone)]
pub struct CreateReportServiceParams {
    pub user_id: Uuid,
    pub user_role: UserRole,
    pub board_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub url: Option<String>,
    pub browser_name: Option<String>,
    pub browser_version: Option<String>,
    pub os_name: Option<String>,
    pub original_file_name: String,
    pub file_data: Bytes,
    pub thumbnail_data: Option<Bytes>,
}
