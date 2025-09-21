use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Style {
    pub id: String,
    pub name: String,
    pub description: String,
    pub prompt: String,
    pub tags: String, // JSON array
    pub create_at: i64,
    pub update_at: i64,
}

pub struct StyleRepository<'conn> {
    conn: &'conn Connection,
}

#[allow(dead_code)]
impl<'conn> StyleRepository<'conn> {
    pub fn new(conn: &'conn Connection) -> Self {
        Self { conn }
    }

    pub fn create(&self, style: &Style) -> Result<()> {
        self.conn.execute(
            "INSERT INTO style (id, name, description, prompt, tags, create_at, update_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                style.id,
                style.name,
                style.description,
                style.prompt,
                style.tags,
                style.create_at,
                style.update_at
            ],
        )?;
        Ok(())
    }

    pub fn get_all(&self) -> Result<Vec<Style>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, description, prompt, tags, create_at, update_at
             FROM style ORDER BY create_at DESC",
        )?;

        let styles = stmt.query_map([], |row| {
            Ok(Style {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                prompt: row.get(3)?,
                tags: row.get(4)?,
                create_at: row.get(5)?,
                update_at: row.get(6)?,
            })
        })?;

        styles.collect()
    }

    pub fn get_by_id(&self, id: &str) -> Result<Option<Style>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, description, prompt, tags, create_at, update_at
             FROM style WHERE id = ?1",
        )?;

        let mut styles = stmt.query_map([id], |row| {
            Ok(Style {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                prompt: row.get(3)?,
                tags: row.get(4)?,
                create_at: row.get(5)?,
                update_at: row.get(6)?,
            })
        })?;

        styles.next().transpose()
    }

    pub fn get_by_name(&self, name: &str) -> Result<Option<Style>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, description, prompt, tags, create_at, update_at
             FROM style WHERE name = ?1",
        )?;

        let mut styles = stmt.query_map([name], |row| {
            Ok(Style {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                prompt: row.get(3)?,
                tags: row.get(4)?,
                create_at: row.get(5)?,
                update_at: row.get(6)?,
            })
        })?;

        styles.next().transpose()
    }

    pub fn update(&self, style: &Style) -> Result<()> {
        self.conn.execute(
            "UPDATE style SET
             name = ?2, description = ?3, prompt = ?4, tags = ?5, update_at = ?6
             WHERE id = ?1",
            params![
                style.id,
                style.name,
                style.description,
                style.prompt,
                style.tags,
                style.update_at
            ],
        )?;
        Ok(())
    }

    pub fn delete(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM style WHERE id = ?1", [id])?;
        Ok(())
    }

    pub fn delete_by_name(&self, name: &str) -> Result<()> {
        self.conn
            .execute("DELETE FROM style WHERE name = ?1", [name])?;
        Ok(())
    }
}
