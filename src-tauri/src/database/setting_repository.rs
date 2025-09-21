use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};
use chrono::Utc;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Setting {
    pub id: String,
    pub api_url: String,
    pub api_key: String,
    pub model: String,
    pub update_at: i64,
}

pub struct SettingRepository<'conn> {
    conn: &'conn Connection,
}

impl<'conn> SettingRepository<'conn> {
    pub fn new(conn: &'conn Connection) -> Self {
        Self { conn }
    }

    pub fn create(&self, setting: &Setting) -> Result<()> {
        self.conn.execute(
            "INSERT INTO setting (id, api_url, api_key, model, update_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                setting.id,
                setting.api_url,
                setting.api_key,
                setting.model,
                setting.update_at
            ],
        )?;
        Ok(())
    }

    pub fn get(&self) -> Result<Option<Setting>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, api_url, api_key, model, update_at
             FROM setting LIMIT 1"
        )?;

        let mut settings = stmt.query_map([], |row| {
            Ok(Setting {
                id: row.get(0)?,
                api_url: row.get(1)?,
                api_key: row.get(2)?,
                model: row.get(3)?,
                update_at: row.get(4)?,
            })
        })?;

        settings.next().transpose()
    }

    pub fn update(&self, setting: &Setting) -> Result<()> {
        self.conn.execute(
            "UPDATE setting SET
             api_url = ?2, api_key = ?3, model = ?4, update_at = ?5
             WHERE id = ?1",
            params![
                setting.id,
                setting.api_url,
                setting.api_key,
                setting.model,
                setting.update_at
            ],
        )?;
        Ok(())
    }

    pub fn get_or_create_default(&self) -> Result<Setting> {
        if let Some(setting) = self.get()? {
            return Ok(setting);
        }

        // Create default setting
        let default_setting = Setting {
            id: uuid::Uuid::new_v4().to_string(),
            api_url: "https://api.openai.com/v1".to_string(),
            api_key: String::new(),
            model: "gpt-4o".to_string(),
            update_at: Utc::now().timestamp_millis(),
        };

        self.create(&default_setting)?;
        Ok(default_setting)
    }
}