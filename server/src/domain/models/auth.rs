use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone, TS)]
#[ts(export)]
pub struct TokenClaims {
    pub sub: Uuid, // Subject (user_id)
    pub email: String,
    pub role: String, // User role (can be UserRole enum if you stringify it)
    pub exp: usize,   // Expiration timestamp (seconds since Unix epoch)
    pub iat: usize,   // Issued at timestamp
}
