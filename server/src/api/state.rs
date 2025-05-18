use std::sync::Arc;

use crate::application::services::{
    auth_service::AuthServiceInterface, health_service::HealthServiceInterface,
    report_service::ReportServiceInterface, user_service::UserServiceInterface,
};

#[derive(Clone)]
pub struct AppState {
    pub auth_service: Arc<dyn AuthServiceInterface>,
    pub health_service: Arc<dyn HealthServiceInterface>,
    pub report_service: Arc<dyn ReportServiceInterface>,
    pub user_service: Arc<dyn UserServiceInterface>,
}

impl AppState {
    pub fn new(
        auth_service: Arc<dyn AuthServiceInterface>,
        health_service: Arc<dyn HealthServiceInterface>,
        report_service: Arc<dyn ReportServiceInterface>,
        user_service: Arc<dyn UserServiceInterface>,
    ) -> Self {
        AppState {
            auth_service,
            health_service,
            report_service,
            user_service,
        }
    }
}
