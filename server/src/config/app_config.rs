use std::env;

use config::{Config, ConfigError, Environment, File, FileFormat};
use jsonwebtoken::{DecodingKey, EncodingKey};
use once_cell::sync::Lazy;
use rust_embed::RustEmbed;
use serde::Deserialize;

#[derive(RustEmbed)]
#[folder = "config/"]
struct ConfigAssets;

#[derive(Debug, Deserialize, Clone)]
pub struct AppConfig {
    pub server_port: u16,
    pub max_body_size_mb: u64,
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
    pub fn new() -> Result<Self, ConfigError> {
        let run_mode = env::var("RUN_MODE").unwrap_or_else(|_| "development".into());

        // 1. Load the embedded default configuration file
        let default_config = ConfigAssets::get("default.toml").ok_or_else(|| {
            ConfigError::NotFound("Embedded config/default.toml not found.".into())
        })?;

        let default_config_str =
            std::str::from_utf8(default_config.data.as_ref()).map_err(|e| {
                ConfigError::Message(format!("Failed to parse embedded config as UTF-8: {}", e))
            })?;

        let s = Config::builder()
            // Start with the embedded default config as the base
            .add_source(File::from_str(default_config_str, FileFormat::Toml))
            // Layer on optional external files for overrides.
            // These files are not required to exist, allowing the binary to run from anywhere.
            .add_source(File::with_name(&format!("config/{}", run_mode)).required(false))
            .add_source(File::with_name("config/local.toml").required(false))
            // Layer on settings from environment variables (e.g., `REBUG_SERVER_PORT=8000`)
            .add_source(Environment::with_prefix("rebug").separator("__"))
            .build()?;

        s.try_deserialize()
    }
}

pub static APP_CONFIG: Lazy<AppConfig> = Lazy::new(|| {
    AppConfig::new().unwrap_or_else(|err| {
        eprintln!("🔥 Failed to load configuration: {}", err);
        std::process::exit(1);
    })
});

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
