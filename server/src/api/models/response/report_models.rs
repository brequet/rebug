use serde::Serialize;
use uuid::Uuid;

#[derive(Serialize)]
pub struct ReportResponse {
    pub id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub file_path: String,
    pub url: Option<String>,
}
