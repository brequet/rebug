use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TokenClaims {
    pub sub: Uuid,    // Subject (user_id)
    pub role: String, // User role (can be UserRole enum if you stringify it)
    pub exp: usize,   // Expiration timestamp (seconds since Unix epoch)
    pub iat: usize,   // Issued at timestamp
}
