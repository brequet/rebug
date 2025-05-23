use axum::body::Bytes;
use axum_typed_multipart::{FieldData, TryFromMultipart};
use uuid::Uuid;

#[derive(TryFromMultipart)]
pub struct CreateScreenshotReportRequest {
    // Regular form fields
    pub board_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub url: Option<String>,

    // File field
    pub file: FieldData<Bytes>,
}
