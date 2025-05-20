use config::{Config, Environment, File};
use jsonwebtoken::{DecodingKey, EncodingKey};
use once_cell::sync::Lazy;
use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct AppConfig {
    pub database_url: String,
    pub upload_directory: String,
    pub file_base_url: String,
    pub jwt_secret: String,
    pub jwt_expiration_seconds: i64,
    pub default_admin_email: String,
    pub default_admin_password: String,
    pub default_admin_first_name: String,
    pub default_admin_last_name: String,
}

impl AppConfig {
    pub fn init() -> Result<Self, config::ConfigError> {
        tracing::info!("Initializing configuration...");
        let s = Config::builder()
            .add_source(File::with_name("config/default").required(false))
            .add_source(Environment::with_prefix("REBUG"))
            .build()?;

        s.try_deserialize().map_err(|e| {
            tracing::error!("Failed to deserialize configuration: {:?}", e);
            config::ConfigError::Message("Failed to deserialize configuration".into())
        })
    }
}

pub static APP_CONFIG: Lazy<AppConfig> =
    Lazy::new(|| AppConfig::init().expect("Failed to initialize configuration"));

pub struct Keys {
    pub encoding: EncodingKey,
    pub decoding: DecodingKey,
}

impl Keys {
    fn new(secret: &[u8]) -> Self {
        Self {
            encoding: EncodingKey::from_secret(secret),
            decoding: DecodingKey::from_secret(secret),
        }
    }
}

pub static JWT_KEYS: Lazy<Keys> = Lazy::new(|| Keys::new(APP_CONFIG.jwt_secret.as_bytes()));
