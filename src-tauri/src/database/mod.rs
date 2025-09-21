use rusqlite::{Connection, Result};
use std::path::Path;

pub mod gallery_repository;
pub mod style_repository;
pub mod setting_repository;
pub mod message_repository;

pub use gallery_repository::{GalleryRepository, Gallery};
pub use style_repository::{StyleRepository, Style};
pub use setting_repository::{SettingRepository, Setting};
pub use message_repository::{MessageRepository, Message};

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self> {
        let conn = Connection::open(path)?;
        let db = Self { conn };
        db.init_tables()?;
        Ok(db)
    }

    fn init_tables(&self) -> Result<()> {
        let schema = include_str!("schema.sql");
        self.conn.execute_batch(schema)?;
        Ok(())
    }

    pub fn gallery(&self) -> GalleryRepository {
        GalleryRepository::new(&self.conn)
    }

    pub fn style(&self) -> StyleRepository {
        StyleRepository::new(&self.conn)
    }

    pub fn setting(&self) -> SettingRepository {
        SettingRepository::new(&self.conn)
    }

    pub fn message(&self) -> MessageRepository {
        MessageRepository::new(&self.conn)
    }
}