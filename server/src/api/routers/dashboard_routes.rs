use axum::{Json, Router, extract::State, routing::get};
use tracing::instrument;

use crate::api::{
    auth::AuthenticatedUser,
    error::ApiError,
    models::response::dashboard_models::{BoardWithRecentReports, DashboardResponse},
    state::AppState,
};

pub fn dashboard_routes() -> Router<AppState> {
    Router::new().route("/dashboard", get(get_dashboard_handler))
}

#[instrument(skip(state, authenticated_user), fields(user_id = %authenticated_user.id), level = "debug")]
async fn get_dashboard_handler(
    State(state): State<AppState>,
    authenticated_user: AuthenticatedUser,
) -> Result<Json<DashboardResponse>, ApiError> {
    let dashboard_data = state
        .dashboard_service()
        .get_user_dashboard(authenticated_user.id)
        .await?;

    let boards_with_reports = dashboard_data
        .boards_with_reports
        .into_iter()
        .map(|board_with_reports| BoardWithRecentReports {
            board: board_with_reports.board.into(),
            recent_reports: board_with_reports
                .recent_reports
                .into_iter()
                .map(|report| report.into())
                .collect(),
        })
        .collect();

    let response = DashboardResponse {
        boards: boards_with_reports,
    };

    tracing::info!(user_id = %authenticated_user.id, "Dashboard retrieved successfully");
    Ok(Json(response))
}
