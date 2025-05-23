use async_trait::async_trait;
use bytes::Bytes;
use chrono::Utc;
use std::path::Path;
use tokio::fs;
use tracing::instrument;

use crate::domain::ports::storage_port::{StorageError, StoragePort, StorageResult};

#[derive(Clone)]
pub struct FileSystemStorage {
    upload_directory: String,
    base_url: String,
}

impl FileSystemStorage {
    const MAX_FILE_SIZE: usize = 50 * 1024 * 1024; // 50MB
    const ALLOWED_EXTENSIONS: &'static [&'static str] = &["png"];

    pub fn new(upload_directory: String, base_url: String) -> StorageResult<Self> {
        let path = Path::new(&upload_directory);
        if !path.exists() {
            std::fs::create_dir_all(path).map_err(|e| {
                StorageError::ConfigurationError(format!(
                    "Failed to create upload directory '{}': {}",
                    upload_directory, e
                ))
            })?;
        }

        Ok(Self {
            upload_directory,
            base_url,
        })
    }

    fn validate_file(&self, file_name: &str, data: &Bytes) -> StorageResult<()> {
        if data.len() > Self::MAX_FILE_SIZE {
            return Err(StorageError::ValidationError("File too large".to_string()));
        }

        let extension = self.get_file_extension(file_name)?;

        if !Self::ALLOWED_EXTENSIONS.contains(&extension.to_lowercase().as_str()) {
            return Err(StorageError::ValidationError(
                format!("Invalid file type: '{}'", extension).to_string(),
            ));
        }

        Ok(())
    }

    fn get_file_extension(&self, file_name: &str) -> Result<String, StorageError> {
        Path::new(file_name)
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|s| s.to_string())
            .ok_or_else(|| StorageError::ValidationError("File extension not found".to_string()))
    }

    fn get_public_url(&self, file_path: &str) -> String {
        format!("{}/{}", self.base_url, file_path)
    }
}

#[async_trait]
impl StoragePort for FileSystemStorage {
    #[instrument(skip(self, data), fields(original_file_name = %original_file_name, file_size = data.len()), level = "debug")]
    async fn save_file(&self, original_file_name: &str, data: Bytes) -> StorageResult<String> {
        self.validate_file(original_file_name, &data)?;

        let unique_file_name = format!(
            "{}.{}",
            Utc::now().timestamp_millis(),
            self.get_file_extension(original_file_name)?
        );

        let full_path = Path::new(&self.upload_directory).join(&unique_file_name);

        tracing::debug!(path = %full_path.display(), "Attempting to write file to disk.");
        fs::write(&full_path, data)
            .await
            .map_err(|e| StorageError::SaveFailed(e.to_string()))?;
        tracing::debug!(path = %full_path.display(), "File saved successfully.");

        Ok(self.get_public_url(&unique_file_name))
    }
}
