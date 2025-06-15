use serde::Serialize;
use ts_rs::TS;

#[derive(Serialize, Debug, TS)]
#[ts(export)]
pub struct PaginatedResponse<T> {
    pub items: Vec<T>,
    pub page: i32,
    pub per_page: i32,
    pub total_items: i32,
    pub total_pages: i32,
}

impl<T> PaginatedResponse<T> {
    pub fn new(items: Vec<T>, page: i32, per_page: i32, total_items: i32) -> Self {
        let total_pages = if total_items == 0 {
            0
        } else {
            (total_items as f32 / per_page as f32).ceil() as i32
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
