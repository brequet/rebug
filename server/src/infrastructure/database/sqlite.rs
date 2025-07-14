use rbatis::rbatis::RBatis;
use rbdc_sqlite::driver::SqliteDriver;
use sqlx::SqlitePool;

#[derive(Clone)]
pub struct Sqlite {
    pool: SqlitePool,
    rb: RBatis,
}

impl Sqlite {
    pub async fn new(database_url: String) -> Result<Self, Box<dyn std::error::Error>> {
        let db_pool = SqlitePool::connect(&database_url)
            .await
            .expect("Failed to create SQLite connection pool");

        let rb = RBatis::new();
        rb.link(SqliteDriver {}, &database_url)
            .await
            .expect("Failed to link RBatis with SQLite driver");

        Ok(Self { pool: db_pool, rb })
    }

    pub fn get_pool(&self) -> SqlitePool {
        self.pool.clone()
    }

    pub fn get_rbatis(&self) -> RBatis {
        self.rb.clone()
    }
}
