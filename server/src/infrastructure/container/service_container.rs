use std::sync::Arc;

use crate::{
    application::services::{
        auth_service::{AuthService, AuthServiceInterface},
        authorization_service::{AuthorizationService, AuthorizationServiceInterface},
        board_service::{BoardService, BoardServiceInterface},
        dashboard_service::{DashboardService, DashboardServiceInterface},
        health_service::{HealthService, HealthServiceInterface},
        report_service::{ReportService, ReportServiceInterface},
        user_onboarding_service::{UserOnboardingService, UserOnboardingServiceInterface},
        user_service::{UserService, UserServiceInterface},
    },
    config::app_config::APP_CONFIG,
    domain::ports::storage_port::StoragePort,
    infrastructure::{
        database::sqlite::Sqlite,
        repositories::{
            board_repository::SqliteBoardRepository, report_repository::SqliteReportRepository,
            user_repository::SqliteUserRepository,
        },
        storage::file_system_storage::FileSystemStorage,
    },
};

pub struct ServiceContainer {
    pub health_service: Arc<dyn HealthServiceInterface>,
    pub auth_service: Arc<dyn AuthServiceInterface>,
    pub authorization_service: Arc<dyn AuthorizationServiceInterface>,
    pub user_service: Arc<dyn UserServiceInterface>,
    pub board_service: Arc<dyn BoardServiceInterface>,
    pub dashboard_service: Arc<dyn DashboardServiceInterface>,
    pub report_service: Arc<dyn ReportServiceInterface>,
    pub user_onboarding_service: Arc<dyn UserOnboardingServiceInterface>,
}

impl ServiceContainer {
    pub async fn new(sqlite_connection: &Sqlite) -> Result<Self, Box<dyn std::error::Error>> {
        // Repository layer
        let user_repository = Arc::new(SqliteUserRepository::new(sqlite_connection.get_rbatis()));
        let board_repository = Arc::new(SqliteBoardRepository::new(sqlite_connection.get_rbatis()));
        let report_repository =
            Arc::new(SqliteReportRepository::new(sqlite_connection.get_rbatis()));

        // Storage layer
        let storage_port: Arc<dyn StoragePort> = Arc::new(FileSystemStorage::new(
            APP_CONFIG.upload_directory.clone(),
            APP_CONFIG.file_base_url.clone(),
        )?);

        // Service layer
        let health_service = Arc::new(HealthService::new());
        let user_service = Arc::new(UserService::new(user_repository));
        let board_service = Arc::new(BoardService::new(board_repository.clone()));
        let auth_service = Arc::new(AuthService::new(user_service.clone()));
        let authorization_service = Arc::new(AuthorizationService::new(board_repository));
        let report_service = Arc::new(ReportService::new(
            report_repository,
            storage_port,
            authorization_service.clone(),
        ));
        let dashboard_service = Arc::new(DashboardService::new(
            board_service.clone(),
            report_service.clone(),
        ));
        let user_onboarding_service = Arc::new(UserOnboardingService::new(
            user_service.clone(),
            board_service.clone(),
        ));

        Ok(Self {
            health_service,
            auth_service,
            authorization_service,
            user_service,
            board_service,
            dashboard_service,
            report_service,
            user_onboarding_service,
        })
    }
}
