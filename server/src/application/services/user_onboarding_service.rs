use super::{board_service::BoardServiceInterface, user_service::UserServiceInterface};
use crate::domain::models::user::{User, UserRole};
use async_trait::async_trait;
use std::sync::Arc;
use tracing::instrument;

#[async_trait]
pub trait UserOnboardingServiceInterface: Send + Sync {
    async fn onboard_user(
        &self,
        email: &str,
        password: &str,
        first_name: Option<&str>,
        last_name: Option<&str>,
        user_role: UserRole,
    ) -> Result<User, Box<dyn std::error::Error>>;
}

pub struct UserOnboardingService {
    user_service: Arc<dyn UserServiceInterface>,
    board_service: Arc<dyn BoardServiceInterface>,
}

impl UserOnboardingService {
    pub fn new(
        user_service: Arc<dyn UserServiceInterface>,
        board_service: Arc<dyn BoardServiceInterface>,
    ) -> Self {
        Self {
            user_service,
            board_service,
        }
    }
}

#[async_trait]
impl UserOnboardingServiceInterface for UserOnboardingService {
    #[instrument(
        skip(self, email, password),
        fields(email = %email, first_name = ?first_name, last_name = ?last_name),
        level = "info"
    )]
    async fn onboard_user(
        &self,
        email: &str,
        password: &str,
        first_name: Option<&str>,
        last_name: Option<&str>,
        user_role: UserRole,
    ) -> Result<User, Box<dyn std::error::Error>> {
        let user = self
            .user_service
            .create_user(email, password, first_name, last_name, user_role)
            .await?;

        let board_name = format!(
            "{}'s Board",
            user.first_name.clone().unwrap_or("User".to_string())
        );

        self.board_service
            .create_board(&board_name, Some("User's default board"), user.id, true)
            .await?;

        Ok(user)
    }
}
