use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::domain::models::report::{Report, ReportType};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportEntity {
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

impl From<ReportEntity> for Report {
    fn from(entity: ReportEntity) -> Self {
        Self {
            id: entity.id,
            user_id: entity.user_id,
            board_id: entity.board_id,
            report_type: entity.report_type,
            title: entity.title,
            description: entity.description,
            file_path: entity.file_path,
            thumbnail_file_path: entity.thumbnail_file_path,
            url: entity.url,
            browser_name: entity.browser_name,
            browser_version: entity.browser_version,
            os_name: entity.os_name,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
        }
    }
}
