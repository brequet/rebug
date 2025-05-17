use serde::Serialize;

use super::user_models::UserResponse;

#[derive(Serialize)]
pub struct LoginResponse {
    pub access_token: String,
    pub token_type: String,
    pub user: UserResponse,
}
