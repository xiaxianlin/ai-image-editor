use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub id: String,
    pub gallery_id: String,
    pub role: String,
    pub content: String,
    pub create_at: i64,
}

pub struct MessageRepository<'conn> {
    conn: &'conn Connection,
}

#[allow(dead_code)]
impl<'conn> MessageRepository<'conn> {
    pub fn new(conn: &'conn Connection) -> Self {
        Self { conn }
    }

    pub fn create(&self, message: &Message) -> Result<()> {
        self.conn.execute(
            "INSERT INTO message (id, gallery_id, role, content, create_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                message.id,
                message.gallery_id,
                message.role,
                message.content,
                message.create_at
            ],
        )?;
        Ok(())
    }

    pub fn get_by_gallery_id(&self, gallery_id: &str) -> Result<Vec<Message>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, gallery_id, role, content, create_at
             FROM message WHERE gallery_id = ?1
             ORDER BY create_at ASC"
        )?;

        let messages = stmt.query_map([gallery_id], |row| {
            Ok(Message {
                id: row.get(0)?,
                gallery_id: row.get(1)?,
                role: row.get(2)?,
                content: row.get(3)?,
                create_at: row.get(4)?,
            })
        })?;

        messages.collect()
    }

    pub fn get_by_id(&self, id: &str) -> Result<Option<Message>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, gallery_id, role, content, create_at
             FROM message WHERE id = ?1"
        )?;

        let mut messages = stmt.query_map([id], |row| {
            Ok(Message {
                id: row.get(0)?,
                gallery_id: row.get(1)?,
                role: row.get(2)?,
                content: row.get(3)?,
                create_at: row.get(4)?,
            })
        })?;

        messages.next().transpose()
    }

    pub fn delete_by_gallery_id(&self, gallery_id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM message WHERE gallery_id = ?1", [gallery_id])?;
        Ok(())
    }

    pub fn get_latest_by_gallery_id(&self, gallery_id: &str, limit: usize) -> Result<Vec<Message>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, gallery_id, role, content, create_at
             FROM message WHERE gallery_id = ?1
             ORDER BY create_at DESC LIMIT ?2"
        )?;

        let messages = stmt.query_map([gallery_id, limit.to_string().as_str()], |row| {
            Ok(Message {
                id: row.get(0)?,
                gallery_id: row.get(1)?,
                role: row.get(2)?,
                content: row.get(3)?,
                create_at: row.get(4)?,
            })
        })?;

        let mut result: Vec<Message> = messages.collect::<Result<Vec<_>>>()?;
        result.reverse(); // Reverse to get chronological order
        Ok(result)
    }
}