use std::sync::Arc;

use crate::application::services::{
    auth_service::AuthService, health_service::HealthService, user_service::UserService,
};

#[derive(Clone)]
pub struct AppState {
    pub auth_service: Arc<AuthService>,
    pub health_service: Arc<HealthService>,
    pub user_service: Arc<UserService>,
}

impl AppState {
    pub fn new(
        auth_service: Arc<AuthService>,
        health_service: Arc<HealthService>,
        user_service: Arc<UserService>,
    ) -> Self {
        AppState {
            auth_service,
            health_service,
            user_service,
        }
    }
}
