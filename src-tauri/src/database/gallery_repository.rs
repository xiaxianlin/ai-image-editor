use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Gallery {
    pub id: String,
    pub origin_image: String,
    pub effect_image: String,
    pub total_input_tokens: i64,
    pub total_ouput_tokens: i64,
    pub create_at: i64,
}

pub struct GalleryRepository<'conn> {
    conn: &'conn Connection,
}

#[allow(dead_code)]
impl<'conn> GalleryRepository<'conn> {
    pub fn new(conn: &'conn Connection) -> Self {
        Self { conn }
    }

    pub fn create(&self, gallery: &Gallery) -> Result<()> {
        self.conn.execute(
            "INSERT INTO gallery (id, origin_image, effect_image, total_input_tokens, total_ouput_tokens, create_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                gallery.id,
                gallery.origin_image,
                gallery.effect_image,
                gallery.total_input_tokens,
                gallery.total_ouput_tokens,
                gallery.create_at
            ],
        )?;
        Ok(())
    }

    pub fn get_all(&self) -> Result<Vec<Gallery>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, origin_image, effect_image, total_input_tokens, total_ouput_tokens, create_at
             FROM gallery ORDER BY create_at DESC"
        )?;

        let galleries = stmt.query_map([], |row| {
            Ok(Gallery {
                id: row.get(0)?,
                origin_image: row.get(1)?,
                effect_image: row.get(2)?,
                total_input_tokens: row.get(3)?,
                total_ouput_tokens: row.get(4)?,
                create_at: row.get(5)?,
            })
        })?;

        galleries.collect()
    }

    pub fn get_by_id(&self, id: &str) -> Result<Option<Gallery>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, origin_image, effect_image, total_input_tokens, total_ouput_tokens, create_at
             FROM gallery WHERE id = ?1"
        )?;

        let mut galleries = stmt.query_map([id], |row| {
            Ok(Gallery {
                id: row.get(0)?,
                origin_image: row.get(1)?,
                effect_image: row.get(2)?,
                total_input_tokens: row.get(3)?,
                total_ouput_tokens: row.get(4)?,
                create_at: row.get(5)?,
            })
        })?;

        galleries.next().transpose()
    }

    pub fn update(&self, gallery: &Gallery) -> Result<()> {
        self.conn.execute(
            "UPDATE gallery SET
             origin_image = ?2, effect_image = ?3, total_input_tokens = ?4,
             total_ouput_tokens = ?5 WHERE id = ?1",
            params![
                gallery.id,
                gallery.origin_image,
                gallery.effect_image,
                gallery.total_input_tokens,
                gallery.total_ouput_tokens
            ],
        )?;
        Ok(())
    }

    pub fn delete(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM gallery WHERE id = ?1", [id])?;
        Ok(())
    }

    pub fn batch_delete(&self, ids: &[String]) -> Result<()> {
        let tx = self.conn.unchecked_transaction()?;
        for id in ids {
            tx.execute("DELETE FROM gallery WHERE id = ?1", [id])?;
        }
        tx.commit()?;
        Ok(())
    }

    pub fn update_tokens(&self, id: &str, input_tokens: i64, output_tokens: i64) -> Result<()> {
        self.conn.execute(
            "UPDATE gallery SET total_input_tokens = ?2, total_ouput_tokens = ?3
             WHERE id = ?1",
            params![id, input_tokens, output_tokens],
        )?;
        Ok(())
    }
}