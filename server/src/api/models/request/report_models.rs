use axum::body::Bytes;
use axum_typed_multipart::{FieldData, TryFromMultipart};
use uuid::Uuid;
use validator::Validate;

#[derive(TryFromMultipart, Validate)]
pub struct CreateScreenshotReportRequestMultipart {
    pub board_id: Uuid,
    #[validate(length(min = 1, max = 255))]
    pub title: String,
    pub description: Option<String>,
    #[validate(url)]
    pub url: Option<String>,
    pub file: FieldData<Bytes>,
}
