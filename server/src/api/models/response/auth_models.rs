use serde::Serialize;
use ts_rs::TS;

use super::user_models::UserResponse;

#[derive(Serialize, Debug, TS)]
#[ts(export)]
pub struct LoginResponse {
    pub access_token: String,
    pub token_type: String,
    pub user: UserResponse,
}
