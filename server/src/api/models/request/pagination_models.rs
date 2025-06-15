use serde::Deserialize;
use validator::Validate;

const DEFAULT_PAGE: i32 = 1;
const DEFAULT_PER_PAGE: i32 = 20;
const MAX_PER_PAGE: i32 = 100;

#[derive(Deserialize, Validate, Debug)]
pub struct PaginationParams {
    #[serde(default = "default_page")]
    #[validate(range(min = 1))]
    pub page: i32,
    #[serde(default = "default_per_page")]
    #[validate(range(min = 1, max = "MAX_PER_PAGE"))]
    pub per_page: i32,
}

fn default_page() -> i32 {
    DEFAULT_PAGE
}

fn default_per_page() -> i32 {
    DEFAULT_PER_PAGE
}
