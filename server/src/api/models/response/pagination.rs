use serde::Serialize;
use ts_rs::TS;

#[derive(Serialize, Debug, TS)]
#[ts(export)]
pub struct PaginatedResponse<T> {
    pub items: Vec<T>,
    pub page: i64,
    pub per_page: i64,
    pub total_items: i64,
    pub total_pages: i64,
}

impl<T> PaginatedResponse<T> {
    pub fn new(items: Vec<T>, page: i64, per_page: i64, total_items: i64) -> Self {
        let total_pages = if total_items == 0 {
            0
        } else {
            (total_items as f64 / per_page as f64).ceil() as i64
        };
        Self {
            items,
            page,
            per_page,
            total_items,
            total_pages,
        }
    }
}
