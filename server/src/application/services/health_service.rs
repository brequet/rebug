use async_trait::async_trait;

use crate::domain::models::health::HealthCheck;

pub type HealthServiceResult<T> = Result<T, Box<dyn std::error::Error>>;

#[async_trait]
pub trait HealthServiceInterface: Send + Sync {
    fn health_check(&self) -> HealthServiceResult<HealthCheck>;
}

#[derive(Clone)]
pub struct HealthService;

impl HealthService {
    pub fn new() -> Self {
        HealthService
    }
}

impl Default for HealthService {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl HealthServiceInterface for HealthService {
    fn health_check(&self) -> HealthServiceResult<HealthCheck> {
        Ok(HealthCheck {
            status: "success".to_string(),
            message: "Everything is OK".to_string(),
        })
    }
}
