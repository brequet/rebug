use serde::Serialize;
use ts_rs::TS;

use super::{board_models::BoardResponse, report_models::ReportResponse};

#[derive(Serialize, Debug, TS)]
#[ts(export)]
pub struct DashboardResponse {
    pub boards: Vec<BoardWithRecentReports>,
}

#[derive(Serialize, Debug, TS)]
#[ts(export)]
pub struct BoardWithRecentReports {
    pub board: BoardResponse,
    pub recent_reports: Vec<ReportResponse>,
}
