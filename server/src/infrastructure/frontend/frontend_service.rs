use axum::{
    http::{StatusCode, Uri, header},
    response::IntoResponse,
};
use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "frontend/build/"]
struct Assets;

pub async fn frontend_handler(uri: Uri) -> impl IntoResponse {
    let mut path = uri.path().trim_start_matches('/').to_string();
    if path.is_empty() {
        path = "index.html".to_string();
    }

    match Assets::get(&path) {
        Some(content) => {
            let mime = mime_guess::from_path(&path).first_or_octet_stream();
            (
                StatusCode::OK,
                [(header::CONTENT_TYPE, mime.as_ref())],
                content.data,
            )
                .into_response()
        }
        None => {
            if let Some(content) = Assets::get("index.html") {
                let mime = mime_guess::from_path("index.html").first_or_octet_stream();
                (
                    StatusCode::OK,
                    [(header::CONTENT_TYPE, mime.as_ref())],
                    content.data,
                )
                    .into_response()
            } else {
                (StatusCode::NOT_FOUND, "404 Not Found").into_response()
            }
        }
    }
}
