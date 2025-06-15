use serde::Deserialize;
use validator::Validate;

const DEFAULT_PAGE: i64 = 1;
const DEFAULT_PER_PAGE: i64 = 20;
const MAX_PER_PAGE: i64 = 100;

#[derive(Deserialize, Validate, Debug)]
pub struct PaginationParams {
    #[serde(default = "default_page")]
    #[validate(range(min = 1))]
    pub page: i64,
    #[serde(default = "default_per_page")]
    #[validate(range(min = 1, max = "MAX_PER_PAGE"))]
    pub per_page: i64,
}

fn default_page() -> i64 {
    DEFAULT_PAGE
}

fn default_per_page() -> i64 {
    DEFAULT_PER_PAGE
}
