use uuid::Uuid;

use crate::domain::models::board::Board;

use super::RepositoryResult;

#[async_trait::async_trait]
pub trait BoardRepository: Send + Sync {
    async fn create_board(
        &self,
        name: &str,
        description: Option<&str>,
        owner_id: Uuid,
        is_default: bool,
    ) -> RepositoryResult<Board>;

    async fn find_by_id(&self, id: Uuid) -> RepositoryResult<Option<Board>>;
    async fn find_by_user_id(&self, user_id: Uuid) -> RepositoryResult<Vec<Board>>;
}
