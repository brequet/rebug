use serde::{Deserialize, Serialize};
use ts_rs::TS;
use validator::Validate;

#[derive(Deserialize, Validate, Debug, Serialize, TS)]
#[ts(export)]
pub struct LoginRequest {
    #[validate(email)]
    pub email: String,
    pub password: String,
}
