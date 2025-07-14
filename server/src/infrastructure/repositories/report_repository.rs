use async_trait::async_trait;

use rbatis::RBatis;
use uuid::Uuid;

use crate::{
    domain::{
        models::report::{CreateReportParams, Report},
        repositories::{RepositoryError, RepositoryResult, report_repository::ReportRepository},
    },
    infrastructure::repositories::{
        entities::report_entity::ReportEntity, map_rbatis_error, queries::report_queries,
    },
};

#[derive(Clone)]
pub struct SqliteReportRepository {
    rb: RBatis,
}

impl SqliteReportRepository {
    pub fn new(rb: RBatis) -> Self {
        Self { rb }
    }
}

#[async_trait]
impl ReportRepository for SqliteReportRepository {
    async fn create_report(&self, params: CreateReportParams) -> RepositoryResult<Report> {
        let current_date_time = chrono::Utc::now();

        let entity = ReportEntity {
            id: Uuid::new_v4(),
            user_id: params.user_id,
            board_id: params.board_id,
            report_type: params.report_type,
            title: params.title,
            description: params.description,
            file_path: params.file_path,
            thumbnail_file_path: params.thumbnail_file_path,
            url: params.url,
            browser_name: params.browser_name,
            browser_version: params.browser_version,
            os_name: params.os_name,
            created_at: current_date_time,
            updated_at: current_date_time,
        };

        report_queries::insert_report(&self.rb, entity)
            .await
            .map_err(map_rbatis_error)
            .map(ReportEntity::into)
    }

    async fn find_by_id(&self, id: Uuid) -> RepositoryResult<Option<Report>> {
        report_queries::find_by_id(&self.rb, id)
            .await
            .map_err(map_rbatis_error)
            .map(|opt_entity| opt_entity.map(ReportEntity::into))
    }

    async fn find_recent_reports_by_board(
        &self,
        board_id: Uuid,
        limit: usize,
    ) -> RepositoryResult<Vec<Report>> {
        report_queries::find_recent_reports_by_board(&self.rb, board_id, limit as i64)
            .await
            .map_err(map_rbatis_error)
            .map(|entities| entities.into_iter().map(ReportEntity::into).collect())
    }

    async fn find_by_board_id_paginated(
        &self,
        board_id: Uuid,
        page: i32,
        per_page: i32,
    ) -> RepositoryResult<Vec<Report>> {
        let offset = (page - 1) * per_page;

        report_queries::find_by_board_id_paginated(&self.rb, board_id, per_page, offset)
            .await
            .map_err(map_rbatis_error)
            .map(|entities| entities.into_iter().map(ReportEntity::into).collect())
    }

    async fn count_by_board_id(&self, board_id: Uuid) -> RepositoryResult<i32> {
        report_queries::count_by_board_id(&self.rb, board_id)
            .await
            .map_err(map_rbatis_error)
            .and_then(|count| {
                count
                    .try_into()
                    .map_err(|_| RepositoryError::DatabaseError("Count conversion error".into())) // TODO:  dedicated error ?
            })
    }
}
