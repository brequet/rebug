use sqlx::{SqlitePool, sqlite::SqliteConnectOptions};

#[derive(Clone)]
pub struct Sqlite {
    pool: SqlitePool,
}

impl Sqlite {
    pub async fn new(database_url: String) -> Result<Self, Box<dyn std::error::Error>> {
        let db_pool = SqlitePool::connect(&database_url)
            .await
            .expect("Failed to create SQLite connection pool");

        Ok(Self { pool: db_pool })
    }

    pub fn get_pool(&self) -> SqlitePool {
        self.pool.clone()
    }
}
