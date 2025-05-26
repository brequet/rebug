use serde::Serialize;
use ts_rs::TS;
use uuid::Uuid;

use crate::domain::models::board::Board;

#[derive(Serialize, Debug, TS)]
#[ts(export)]
pub struct BoardResponse {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub owner_id: Uuid,
    pub is_default: bool,
    #[ts(type = "string")]
    pub created_at: String,
    #[ts(type = "string")]
    pub updated_at: String,
}

impl From<Board> for BoardResponse {
    fn from(board: Board) -> Self {
        Self {
            id: board.id,
            name: board.name,
            description: board.description,
            owner_id: board.owner_id,
            is_default: board.is_default,
            created_at: board.created_at.to_rfc3339(),
            updated_at: board.updated_at.to_rfc3339(),
        }
    }
}
