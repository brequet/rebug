use std::sync::Arc;

use crate::{
    application::services::{
        auth_service::AuthServiceInterface, board_service::BoardServiceInterface,
        health_service::HealthServiceInterface, report_service::ReportServiceInterface,
        user_onboarding_service::UserOnboardingServiceInterface,
        user_service::UserServiceInterface,
    },
    infrastructure::container::service_container::ServiceContainer,
};

#[derive(Clone)]
pub struct AppState {
    container: Arc<ServiceContainer>,
}

impl AppState {
    pub fn new(container: ServiceContainer) -> Self {
        Self {
            container: Arc::new(container),
        }
    }

    pub fn health_service(&self) -> &Arc<dyn HealthServiceInterface> {
        &self.container.health_service
    }

    pub fn auth_service(&self) -> &Arc<dyn AuthServiceInterface> {
        &self.container.auth_service
    }

    pub fn user_service(&self) -> &Arc<dyn UserServiceInterface> {
        &self.container.user_service
    }

    pub fn board_service(&self) -> &Arc<dyn BoardServiceInterface> {
        &self.container.board_service
    }

    pub fn report_service(&self) -> &Arc<dyn ReportServiceInterface> {
        &self.container.report_service
    }

    pub fn user_onboarding_service(&self) -> &Arc<dyn UserOnboardingServiceInterface> {
        &self.container.user_onboarding_service
    }
}
