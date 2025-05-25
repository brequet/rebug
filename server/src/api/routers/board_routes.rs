use axum::{Json, Router, extract::State, routing::get};
use tracing::instrument;

use crate::api::{auth::AuthenticatedUser, error::ApiError, state::AppState};

pub fn user_routes() -> Router<AppState> {
    let user_routes = Router::new().route("/", get(get_all_boards_handler));

    Router::new().nest("/boards", user_routes)
}

#[instrument(skip(state, authenticated_user), fields(user_id = %authenticated_user.claims.sub), level = "debug")]
async fn get_all_boards_handler(
    State(state): State<AppState>,
    authenticated_user: AuthenticatedUser,
) -> Result<Json<Vec<BoardResponse>>, ApiError> {
    tracing::debug!("Fetching current user.");
    let user_id = authenticated_user.claims.sub;

    // TODO: implement this
    let boards = state.board_service().get_all_boards(user_id).await?;

    Ok(Json(boards.into_iter().map(|board| board.into()).collect()))
}
