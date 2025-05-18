use axum::{Json, Router, extract::State, http::StatusCode, routing::post};
use axum_typed_multipart::TypedMultipart;
use tracing::instrument;

use crate::api::{
    auth::AuthenticatedUser,
    error::ApiError,
    models::{
        request::report_models::CreateScreenshotReportRequest,
        response::report_models::ReportResponse,
    },
    state::AppState,
};

pub fn report_routes() -> Router<AppState> {
    Router::new().route(
        "/reports/screenshots",
        post(create_screenshot_report_handler),
    )
    // TODO: getters for reports
}

#[instrument(skip(state, authenticated_user, payload), fields(user_id = %authenticated_user.claims.sub), level = "debug")]
async fn create_screenshot_report_handler(
    State(state): State<AppState>,
    authenticated_user: AuthenticatedUser,
    TypedMultipart(payload): TypedMultipart<CreateScreenshotReportRequest>,
) -> Result<(StatusCode, Json<ReportResponse>), ApiError> {
    tracing::debug!("Creating screenshot report.");

    let user_id = authenticated_user.claims.sub;

    let title = payload.title;
    let description = payload.description;
    let url = payload.url;

    let file_name = payload.file.metadata.file_name.ok_or_else(|| {
        ApiError::Validation("File name is required in the multipart data.".to_string())
    })?;
    let file_data = payload.file.contents;

    let report = state
        .report_service
        .create_screenshot_report(user_id, &file_name, file_data, title, description, url)
        .await
        .map_err(|e| {
            tracing::error!("Report service error: {:?}", e);
            ApiError::InternalServerError("Failed to create report.".to_string())
        })?;

    let response = ReportResponse {
        id: report.id,
        title: report.title,
        description: report.description,
        file_path: report.file_path,
        url: report.url,
    };

    tracing::info!(report_id = %report.id, "Screenshot report created successfully.");

    Ok((StatusCode::CREATED, Json(response)))
}

// TODO: Implement a proper file storage solution, separate concern: move this to a service
