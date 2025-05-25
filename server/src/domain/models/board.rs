use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use ts_rs::TS;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, TS)]
#[ts(export)]
pub struct Board {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub owner_id: Uuid,
    pub is_default: bool,
    #[sqlx(default)]
    pub created_at: chrono::DateTime<chrono::Utc>,
    #[sqlx(default)]
    pub updated_at: chrono::DateTime<chrono::Utc>,
}
