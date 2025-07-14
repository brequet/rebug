use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::domain::models::user::{User, UserRole};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserEntity {
    pub id: Uuid,
    pub email: String,
    pub password_hash: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub role: UserRole,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl From<UserEntity> for User {
    fn from(entity: UserEntity) -> Self {
        Self {
            id: entity.id,
            email: entity.email,
            password_hash: entity.password_hash,
            first_name: entity.first_name,
            last_name: entity.last_name,
            role: entity.role,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
        }
    }
}
