use async_trait::async_trait;

use chrono::{DateTime, Utc};
use sqlx::SqlitePool;
use uuid::Uuid;

use crate::domain::{
    models::report::{CreateReportParams, Report, ReportType},
    repositories::{RepositoryResult, map_sqlx_error, report_repository::ReportRepository},
};

#[derive(Clone)]
pub struct SqliteReportRepository {
    pool: SqlitePool,
}

impl SqliteReportRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl ReportRepository for SqliteReportRepository {
    async fn create_report(&self, params: CreateReportParams) -> RepositoryResult<Report> {
        let report_id = Uuid::new_v4();

        let result = sqlx::query_as!(
            Report,
            r#"
            INSERT INTO reports (id, user_id, board_id, report_type, title, description, file_path, url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING
                id as "id: uuid::Uuid",
                user_id as "user_id: uuid::Uuid",
                board_id as "board_id: uuid::Uuid",
                report_type as "report_type: ReportType",
                title,
                description,
                file_path,
                url,
                created_at as "created_at: DateTime<Utc>",
                updated_at as "updated_at: DateTime<Utc>"
            "#,
            report_id,
            params.user_id,
            params.board_id,
            params.report_type,
            params.title,
            params.description,
            params.file_path,
            params.url,
        )
        .fetch_one(&self.pool)
        .await;

        match result {
            Ok(report) => Ok(report),
            Err(e) => Err(map_sqlx_error(e)),
        }
    }

    async fn get_report(&self, id: Uuid) -> RepositoryResult<Option<Report>> {
        sqlx::query_as!(
            Report,
            r#"
            SELECT 
                id as "id: uuid::Uuid",
                user_id as "user_id: uuid::Uuid",
                board_id as "board_id: uuid::Uuid",
                report_type as "report_type: ReportType",
                title,
                description,
                file_path,
                url,
                created_at as "created_at: DateTime<Utc>",
                updated_at as "updated_at: DateTime<Utc>"
            FROM reports
            WHERE id = $1
            "#,
            id
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(map_sqlx_error)
    }
}
