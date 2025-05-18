use async_trait::async_trait;

#[async_trait]
pub trait HealthServiceInterface: Send + Sync {
    fn health_check(&self) -> serde_json::Value;
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
    fn health_check(&self) -> serde_json::Value {
        const HEALTH_CHECK_RESPONSE: &str = "Everything is OK";

        let json_response = serde_json::json!({
            "status": "success",
            "message": HEALTH_CHECK_RESPONSE,
        });

        json_response
    }
}
