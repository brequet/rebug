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
}

#[async_trait]
impl StoragePort for FileSystemStorage {
    // TODO: maybe just use the file extension from the original file name
    #[instrument(skip(self, data), fields(original_file_name = %original_file_name, file_size = data.len()), level = "debug")]
    async fn save_file(&self, original_file_name: &str, data: Bytes) -> StorageResult<String> {
        let timestamp = Utc::now().timestamp_millis();

        let safe_original_name = original_file_name
            .chars()
            .filter(|c| c.is_alphanumeric() || *c == '.' || *c == '-' || *c == '_')
            .collect::<String>();
        let unique_file_name = format!("{}_{}", timestamp, safe_original_name);

        let full_path = Path::new(&self.upload_directory).join(&unique_file_name);

        tracing::debug!(path = %full_path.display(), "Attempting to write file to disk.");
        fs::write(&full_path, data)
            .await
            .map_err(|e| StorageError::SaveFailed(e.to_string()))?;
        tracing::debug!(path = %full_path.display(), "File saved successfully.");

        Ok(unique_file_name.to_string())
    }

    #[instrument(skip(self), level = "debug")]
    fn get_public_url(&self, file_path: &str) -> String {
        format!("{}/{}", self.base_url, file_path)
    }
}
