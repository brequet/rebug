use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::domain::models::board::Board;

use super::bool_from_int;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoardEntity {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub owner_id: Uuid,

    #[serde(with = "bool_from_int")]
    pub is_default: bool,

    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl From<BoardEntity> for Board {
    fn from(entity: BoardEntity) -> Self {
        Self {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            owner_id: entity.owner_id,
            is_default: entity.is_default,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
        }
    }
}
