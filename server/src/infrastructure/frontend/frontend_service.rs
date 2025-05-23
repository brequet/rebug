use crate::config::app_config::APP_CONFIG;
use axum::Router;
use std::path::Path;
use tower_http::services::{ServeDir, ServeFile};

pub struct FrontendService;

impl FrontendService {
    pub fn create_router() -> Router {
        let frontend_dir = Path::new(&APP_CONFIG.frontend_directory);

        if !frontend_dir.exists() {
            tracing::warn!(
                "Frontend directory '{}' does not exist. Frontend serving disabled.",
                APP_CONFIG.frontend_directory
            );
            return Router::new();
        }

        let index_file_path = frontend_dir.join("index.html");

        if !index_file_path.exists() {
            tracing::warn!("Frontend index.html not found. Frontend serving disabled.");
            return Router::new();
        }

        let serve_dir = ServeDir::new(&APP_CONFIG.frontend_directory)
            .not_found_service(ServeFile::new(index_file_path));

        Router::new().fallback_service(serve_dir)
    }
}
