use std::fmt;

use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, sqlx::Type)]
#[sqlx(type_name = "TEXT", rename_all = "PascalCase")]
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

// TODO: Add a dedicated field for full url
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Report {
    pub id: Uuid,
    pub user_id: Uuid,
    pub report_type: ReportType,
    pub title: String,
    pub description: Option<String>,
    pub file_path: String,
    pub url: Option<String>,
    #[sqlx(default)]
    pub created_at: chrono::DateTime<chrono::Utc>,
    #[sqlx(default)]
    pub updated_at: chrono::DateTime<chrono::Utc>,
}
