use axum::{
    RequestPartsExt,
    extract::FromRequestParts,
    http::{StatusCode, request::Parts},
    response::{IntoResponse, Json, Response},
};
use axum_extra::{
    TypedHeader,
    headers::{Authorization, authorization::Bearer},
};
use jsonwebtoken::{Validation, decode};
use serde_json::json;
use tracing::instrument;

use crate::{config::app_config::JWT_KEYS, domain::models::auth::TokenClaims};

#[derive(Debug)]
pub enum AuthError {
    MissingToken,
    InvalidToken(String),
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AuthError::MissingToken => (
                StatusCode::UNAUTHORIZED,
                "Missing authentication token".to_string(),
            ),
            AuthError::InvalidToken(reason) => (
                StatusCode::UNAUTHORIZED,
                format!("Invalid token: {}", reason),
            ),
        };
        let body = Json(json!({ "error": error_message }));
        (status, body).into_response()
    }
}

#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub claims: TokenClaims,
}

impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
{
    type Rejection = AuthError;

    #[instrument(name = "authenticate_user", skip_all, level = "debug")]
    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        tracing::debug!("Attempting to extract and validate JWT.");
        let TypedHeader(Authorization(bearer)) = parts
            .extract::<TypedHeader<Authorization<Bearer>>>()
            .await
            .map_err(|e| {
                tracing::warn!("Failed to extract Authorization header: {:?}", e);
                AuthError::MissingToken
            })?;

        let token_data =
            decode::<TokenClaims>(bearer.token(), &JWT_KEYS.decoding, &Validation::default())
                .map_err(|e| {
                    tracing::warn!("JWT decoding/validation failed: {}", e);
                    AuthError::InvalidToken(e.to_string())
                })?;

        tracing::debug!(user_id = %token_data.claims.sub, "User authenticated successfully via token.");
        Ok(AuthenticatedUser {
            claims: token_data.claims,
        })
    }
}
