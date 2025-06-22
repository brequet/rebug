use axum::{
    Json, Router,
    extract::{Path, Query, State},
    routing::get,
};
use tracing::instrument;
use uuid::Uuid;
use validator::Validate;

use crate::api::{
    auth::AuthenticatedUser,
    error::ApiError,
    models::{
        request::pagination_models::PaginationParams,
        response::{
            board_models::BoardResponse, pagination::PaginatedResponse,
            report_models::ReportResponse,
        },
    },
    state::AppState,
};

pub fn board_routes() -> Router<AppState> {
    let board_routes = Router::new()
        .route("/", get(get_all_boards_handler))
        .route("/{board_id}", get(get_board_handler))
        .route("/{board_id}/reports", get(get_board_reports_handler));

    Router::new().nest("/boards", board_routes)
}

#[instrument(skip(state, authenticated_user), fields(user_id = %authenticated_user.id), level = "debug")]
async fn get_all_boards_handler(
    State(state): State<AppState>,
    authenticated_user: AuthenticatedUser,
) -> Result<Json<Vec<BoardResponse>>, ApiError> {
    tracing::debug!("Fetching current user.");
    let boards = state
        .board_service()
        .get_boards_by_user_id(authenticated_user.id)
        .await?;

    Ok(Json(boards.into_iter().map(|board| board.into()).collect()))
}

#[instrument(skip(state, authenticated_user), fields(user_id = %authenticated_user.id, board_id = %board_id), level = "debug")]
async fn get_board_handler(
    State(state): State<AppState>,
    authenticated_user: AuthenticatedUser,
    Path(board_id): Path<Uuid>,
) -> Result<Json<BoardResponse>, ApiError> {
    tracing::debug!("Fetching board with ID: {}", board_id);

    state
        .board_service()
        .ensure_user_can_access_board(authenticated_user.id, board_id)
        .await?;

    let board = state.board_service().get_board_by_id(board_id).await?;
    Ok(Json(board.into()))
}

#[instrument(skip(state, authenticated_user, pagination), fields(user_id = %authenticated_user.id, board_id = %board_id), level = "debug")]
async fn get_board_reports_handler(
    State(state): State<AppState>,
    authenticated_user: AuthenticatedUser,
    Path(board_id): Path<Uuid>,
    Query(pagination): Query<PaginationParams>,
) -> Result<Json<PaginatedResponse<ReportResponse>>, ApiError> {
    pagination.validate().map_err(|e| {
        tracing::warn!("Pagination validation failed: {}", e);
        ApiError::validation(e.to_string())
    })?;

    state
        .board_service()
        .ensure_user_can_access_board(authenticated_user.id, board_id)
        .await?;

    tracing::debug!(
        "Fetching paginated reports for board_id: {}, page: {}, per_page: {}",
        board_id,
        pagination.page,
        pagination.per_page
    );

    let (reports, total_items) = state
        .report_service()
        .get_reports_by_board_paginated(board_id, pagination.page, pagination.per_page)
        .await?;

    let report_responses = reports.into_iter().map(ReportResponse::from).collect();

    let paginated_response = PaginatedResponse::new(
        report_responses,
        pagination.page,
        pagination.per_page,
        total_items,
    );

    Ok(Json(paginated_response))
}
