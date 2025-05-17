use once_cell::sync::Lazy;
use std::env;

pub struct JwtConfig {
    pub secret: String,
    pub expiration_seconds: i64,
}

impl JwtConfig {
    fn init() -> Self {
        let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
        let expiration_seconds = env::var("JWT_EXPIRATION_SECONDS")
            .expect("JWT_EXPIRATION_SECONDS must be set")
            .parse::<i64>()
            .expect("JWT_EXPIRATION_SECONDS must be a number");
        Self {
            secret,
            expiration_seconds,
        }
    }
}

pub static JWT_CONFIG: Lazy<JwtConfig> = Lazy::new(JwtConfig::init);

use jsonwebtoken::{DecodingKey, EncodingKey};

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

pub static JWT_KEYS: Lazy<Keys> = Lazy::new(|| Keys::new(JWT_CONFIG.secret.as_bytes()));
