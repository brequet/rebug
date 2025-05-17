use axum::{
    Json, Router,
    extract::{Multipart, State},
    http::StatusCode,
    routing::post,
};

use crate::api::{
    auth::AuthenticatedUser, error::ApiError, models::response::report_models::ReportResponse,
    state::AppState,
};

pub fn report_routes() -> Router<AppState> {
    Router::new().route(
        "/reports/screenshots",
        post(create_screenshot_report_handler),
    )
    // TODO: getters for reports
}

async fn create_screenshot_report_handler(
    State(state): State<AppState>,
    authenticated_user: AuthenticatedUser,
    mut multipart: Multipart,
) -> Result<(StatusCode, Json<ReportResponse>), ApiError> {
    let user_id = authenticated_user.claims.sub;

    // Extract the form data
    let mut title = None;
    let mut description = None;
    let mut url = None;
    let mut file_data = None;
    let mut file_name = None;

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| ApiError::InternalServerError(e.to_string()))?
    {
        let name = field.name().map(|s| s.to_string());
        let file_name_opt = field.file_name().map(|s| s.to_string());
        let data = field
            .bytes()
            .await
            .map_err(|e| ApiError::InternalServerError(e.to_string()))?;

        match name.as_deref() {
            Some("title") => {
                title = Some(
                    String::from_utf8(data.to_vec())
                        .map_err(|e| ApiError::Validation(e.to_string()))?,
                );
            }
            Some("description") => {
                description = Some(
                    String::from_utf8(data.to_vec())
                        .map_err(|e| ApiError::Validation(e.to_string()))?,
                );
            }
            Some("url") => {
                url = Some(
                    String::from_utf8(data.to_vec())
                        .map_err(|e| ApiError::Validation(e.to_string()))?,
                );
            }
            Some("file") => {
                file_data = Some(data);
                file_name = file_name_opt;
            }
            _ => {}
        }
    }

    let title = title.ok_or(ApiError::Validation("Title is required".to_string()))?;
    let file_data = file_data.ok_or(ApiError::Validation("File is required".to_string()))?;
    let file_name = file_name.ok_or(ApiError::Validation("File name is required".to_string()))?;

    // Save the file
    let file_path = save_file(&file_name, file_data.to_vec())
        .await
        .map_err(|e| ApiError::InternalServerError(e.to_string()))?;

    // Create the report
    let report = state
        .report_service
        .create_screenshot_report(user_id, title, description, file_path.clone(), url)
        .await
        .map_err(|e| ApiError::InternalServerError(e.to_string()))?;

    let response = ReportResponse {
        id: report.id,
        title: report.title,
        description: report.description,
        file_path: report.file_path,
        url: report.url,
    };

    Ok((StatusCode::CREATED, Json(response)))
}

// TODO: Implement a proper file storage solution, separate concern: move this to a service
async fn save_file(file_name: &str, file_data: Vec<u8>) -> Result<String, std::io::Error> {
    // Generate a unique file name
    let timestamp = chrono::Utc::now().timestamp();
    // TODO: Use a more robust file naming strategy to avoid collisions, also drop initial file name
    let new_file_name = format!("{}_{}", timestamp, file_name);
    let file_path = format!("uploads/{}", new_file_name);

    // Create the uploads directory if it doesn't exist
    std::fs::create_dir_all("uploads")?; // TODO: upload directory should be configurable

    // Write the file to disk
    tokio::fs::write(&file_path, file_data).await?;

    Ok(file_path)
}
