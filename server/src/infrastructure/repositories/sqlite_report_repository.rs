use async_trait::async_trait;

use chrono::{DateTime, Utc};
use sqlx::SqlitePool;
use uuid::Uuid;

use crate::domain::{
    models::report::{Report, ReportType},
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
    async fn create_report(
        &self,
        user_id: Uuid,
        title: String,
        report_type: ReportType,
        description: Option<String>,
        file_path: String,
        url: Option<String>,
    ) -> RepositoryResult<Report> {
        let report_id = Uuid::new_v4();

        let result = sqlx::query_as!(
            Report,
            r#"
            INSERT INTO reports (id, user_id, report_type, title, description, file_path, url)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING
                id as "id: uuid::Uuid",
                user_id as "user_id: uuid::Uuid",
                report_type as "report_type: ReportType",
                title,
                description,
                file_path,
                url,
                created_at as "created_at: DateTime<Utc>",
                updated_at as "updated_at: DateTime<Utc>"
            "#,
            report_id,
            user_id,
            report_type,
            title,
            description,
            file_path,
            url,
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
