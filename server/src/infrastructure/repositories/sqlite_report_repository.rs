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
            INSERT INTO reports (id, user_id, board_id, report_type, title, description, file_path, thumbnail_file_path, url, browser_name, browser_version, os_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING
                id as "id: uuid::Uuid",
                user_id as "user_id: uuid::Uuid",
                board_id as "board_id: uuid::Uuid",
                report_type as "report_type: ReportType",
                title,
                description,
                file_path,
                thumbnail_file_path,
                url,
                browser_name,
                browser_version,
                os_name,
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
            params.thumbnail_file_path,
            params.url,
            params.browser_name,
            params.browser_version,
            params.os_name
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
                thumbnail_file_path,
                url,
                browser_name,
                browser_version,
                os_name,
                created_at as "created_at: DateTime<Utc>",
                updated_at as "updated_at: DateTime<Utc>"
            FROM reports
            WHERE id = ?
            "#,
            id
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(map_sqlx_error)
    }

    async fn get_recent_reports_by_board(
        &self,
        board_id: Uuid,
        limit: usize,
    ) -> RepositoryResult<Vec<Report>> {
        let limit_i64 = limit as i64;
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
                thumbnail_file_path,
                url,
                browser_name,
                browser_version,
                os_name,
                created_at as "created_at: DateTime<Utc>",
                updated_at as "updated_at: DateTime<Utc>"
            FROM reports
            WHERE board_id = ?
            ORDER BY created_at DESC
            LIMIT ?
            "#,
            board_id,
            limit_i64
        )
        .fetch_all(&self.pool)
        .await
        .map_err(map_sqlx_error)
    }

    async fn find_by_board_id_paginated(
        &self,
        board_id: Uuid,
        page: i64,
        per_page: i64,
    ) -> RepositoryResult<Vec<Report>> {
        let offset = (page - 1) * per_page;

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
                thumbnail_file_path,
                url,
                browser_name,
                browser_version,
                os_name,
                created_at as "created_at: DateTime<Utc>",
                updated_at as "updated_at: DateTime<Utc>"
            FROM reports
            WHERE board_id = ?
            ORDER BY created_at DESC
            LIMIT ?
            OFFSET ?
            "#,
            board_id,
            per_page,
            offset
        )
        .fetch_all(&self.pool)
        .await
        .map_err(map_sqlx_error)
    }

    async fn count_by_board_id(&self, board_id: Uuid) -> RepositoryResult<i64> {
        let result = sqlx::query!(
            "SELECT COUNT(*) as count FROM reports WHERE board_id = ?",
            board_id
        )
        .fetch_one(&self.pool)
        .await
        .map_err(map_sqlx_error)?;

        Ok(result.count as i64)
    }
}
