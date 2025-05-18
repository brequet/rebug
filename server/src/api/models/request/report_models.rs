use axum::body::Bytes;
use axum_typed_multipart::{FieldData, TryFromMultipart};

#[derive(TryFromMultipart)]
pub struct CreateScreenshotReportRequest {
    // Regular form fields
    pub title: String,
    pub description: Option<String>,
    pub url: Option<String>,

    // File field
    pub file: FieldData<Bytes>,
}
