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
        auth::{AuthenticatedUser, parse_user_role},
        error::ApiError,
        models::{
            request::report_models::CreateScreenshotReportRequestMultipart,
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

    let response = ReportResponse::from(report);

    tracing::info!(report_id = %response.id, "Report fetched successfully.");

    Ok((StatusCode::OK, Json(response)))
}

#[instrument(skip(state, authenticated_user, payload), fields(user_id = %authenticated_user.claims.sub), level = "debug")]
async fn create_screenshot_report_handler(
    State(state): State<AppState>,
    authenticated_user: AuthenticatedUser,
    TypedMultipart(payload): TypedMultipart<CreateScreenshotReportRequestMultipart>,
) -> Result<(StatusCode, Json<ReportResponse>), ApiError> {
    tracing::debug!("Creating screenshot report.");

    let file_name = payload.file.metadata.file_name.ok_or_else(|| {
        ApiError::validation("File name is required in the multipart data.".to_string())
    })?;

    let user_role = parse_user_role(&authenticated_user.claims.role)?;

    let params = CreateScreenshotReportParams {
        user_id: authenticated_user.claims.sub,
        user_role,
        board_id: payload.board_id,
        title: payload.title,
        description: payload.description,
        original_file_name: file_name,
        file_data: payload.file.contents,
        url: payload.url,
        browser_name: payload.browser_name,
        browser_version: payload.browser_version,
        os_name: payload.os_name,
    };

    let report = state
        .report_service()
        .create_screenshot_report(params)
        .await
        .map_err(|e| {
            tracing::error!("Report service error: {:?}", e);
            ApiError::from(e)
        })?;

    let response = ReportResponse::from(report);

    tracing::info!(report_id = %response.id, "Screenshot report created successfully.");

    Ok((StatusCode::CREATED, Json(response)))
}
