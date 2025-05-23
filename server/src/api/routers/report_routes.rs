use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    routing::{get, post},
};
use axum_typed_multipart::TypedMultipart;
use tracing::instrument;
use uuid::Uuid;

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
    let report_routes = Router::new()
        .route("/screenshots", post(create_screenshot_report_handler))
        .route("/{report_id}", get(get_report_handler));

    Router::new().nest("/reports", report_routes)
}

#[instrument(skip(state, authenticated_user), fields(user_id = %authenticated_user.claims.sub, report_id = %report_id), level = "debug")]
async fn get_report_handler(
    State(state): State<AppState>,
    authenticated_user: AuthenticatedUser,
    Path(report_id): Path<Uuid>,
) -> Result<(StatusCode, Json<ReportResponse>), ApiError> {
    tracing::debug!("Fetching report with ID: {}", report_id);

    // TODO: Check if the user has permission to access this report
    let report = state
        .report_service
        .get_report(report_id)
        .await
        .map_err(|e| {
            tracing::error!("Report service error: {:?}", e);
            ApiError::InternalServerError("Failed to fetch report.".to_string())
        })?;

    let response = ReportResponse {
        id: report.id,
        title: report.title,
        description: report.description,
        file_path: report.file_path,
        url: report.url,
    };

    tracing::info!(report_id = %report.id, "Report fetched successfully.");

    Ok((StatusCode::OK, Json(response)))
}

#[instrument(skip(state, authenticated_user, payload), fields(user_id = %authenticated_user.claims.sub), level = "debug")]
async fn create_screenshot_report_handler(
    State(state): State<AppState>,
    authenticated_user: AuthenticatedUser,
    TypedMultipart(payload): TypedMultipart<CreateScreenshotReportRequest>,
) -> Result<(StatusCode, Json<ReportResponse>), ApiError> {
    tracing::debug!("Creating screenshot report.");

    let user_id = authenticated_user.claims.sub;

    let file_name = payload.file.metadata.file_name.ok_or_else(|| {
        ApiError::Validation("File name is required in the multipart data.".to_string())
    })?;
    let file_data = payload.file.contents;

    let report = state
        .report_service
        .create_screenshot_report(
            user_id,
            payload.board_id,
            &file_name,
            file_data,
            payload.title,
            payload.description,
            payload.url,
        )
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
