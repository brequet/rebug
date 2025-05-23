use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    routing::{get, post},
};
use axum_typed_multipart::TypedMultipart;
use tracing::instrument;
use uuid::Uuid;

use crate::{
    api::{
        auth::AuthenticatedUser,
        error::ApiError,
        models::{
            request::report_models::CreateScreenshotReportRequest,
            response::report_models::ReportResponse,
        },
        state::AppState,
    },
    domain::models::{report::CreateScreenshotReportParams, user::UserRole},
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

    let report = state.report_service().get_report(report_id).await?;

    if report.user_id != authenticated_user.claims.sub
        && authenticated_user.claims.role != UserRole::Admin.to_string()
    {
        return Err(ApiError::Forbidden);
    }

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

    let file_name = payload.file.metadata.file_name.ok_or_else(|| {
        ApiError::Validation("File name is required in the multipart data.".to_string())
    })?;

    let params = CreateScreenshotReportParams {
        user_id: authenticated_user.claims.sub,
        board_id: payload.board_id,
        title: payload.title,
        description: payload.description,
        original_file_name: file_name,
        file_data: payload.file.contents,
        url: payload.url,
    };

    let report = state
        .report_service()
        .create_screenshot_report(params)
        .await
        .map_err(|e| {
            tracing::error!("Report service error: {:?}", e);
            ApiError::from(e)
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
