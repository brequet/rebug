use async_trait::async_trait;
use bytes::Bytes;

#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    #[error("Validation error: {0}")]
    ValidationError(String),
    #[error("Failed to save file: {0}")]
    SaveFailed(String),
    #[error("Failed to retrieve file: {0}")]
    RetrievalFailed(String),
    #[error("File not found")]
    NotFound,
    #[error("Configuration error: {0}")]
    ConfigurationError(String),
    #[error("I/O error: {0}")]
    IoError(#[from] std::io::Error),
}

pub type StorageResult<T> = Result<T, StorageError>;

#[async_trait]
pub trait StoragePort: Send + Sync {
    /// Saves file data and returns a unique identifier or path to the stored file.
    async fn save_file(&self, file_name: &str, data: Bytes) -> StorageResult<String>;

    fn get_public_url(&self, file_path: &str) -> String;
    // Potentially add other methods like:
    // async fn retrieve_file(&self, file_identifier: &str) -> StorageResult<Bytes>;
    // async fn delete_file(&self, file_identifier: &str) -> StorageResult<()>;
}
