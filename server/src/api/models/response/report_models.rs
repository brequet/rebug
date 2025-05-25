use serde::Serialize;
use ts_rs::TS;
use uuid::Uuid;

#[derive(Serialize, Debug, TS)]
#[ts(export)]
pub struct ReportResponse {
    pub id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub file_path: String,
    pub url: Option<String>,
}
