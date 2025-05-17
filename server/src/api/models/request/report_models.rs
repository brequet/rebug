use serde::Deserialize;

#[derive(Deserialize)]
pub struct CreateScreenshotReportRequest {
    pub title: String,
    pub description: Option<String>,
    pub url: Option<String>,
    // The file will be handled separately via multipart form data
}
