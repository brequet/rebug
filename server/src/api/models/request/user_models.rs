use serde::{Deserialize, Serialize};
use ts_rs::TS;
use validator::Validate;

use crate::domain::models::user::UserRole;

#[derive(Deserialize, Validate, Debug, Serialize, TS)]
#[ts(export)]
pub struct CreateUserRequest {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8, message = "Password must be at least 8 characters long"))]
    pub password: String,
    #[validate(length(min = 1))]
    pub first_name: Option<String>,
    #[validate(length(min = 1))]
    pub last_name: Option<String>,
    pub role: UserRole,
}
