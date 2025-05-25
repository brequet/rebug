use serde::Serialize;
use ts_rs::TS;

#[derive(Serialize, TS)]
#[ts(export)]
pub struct HealthResponse {
    pub status: String,
    pub message: String,
}
