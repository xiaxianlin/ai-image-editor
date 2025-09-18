use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
// use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ImageHistory {
    pub id: String,
    pub original_image: String,
    pub processed_image: String,
    pub prompt: String,
    pub style: String,
    pub created_at: i64,
    pub tags: String, // JSON string
    pub original_name: Option<String>,
    pub original_size: Option<i64>,
    pub processed_size: Option<i64>,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub processing_time: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CustomStyle {
    pub id: String,
    pub name: String,
    pub description: String,
    pub prompt: String,
    pub tags: String, // JSON string
    pub created_at: i64,
    pub is_favorite: bool,
    pub category: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub id: i32,
    pub api_endpoint: String,
    pub api_key: String,
    pub model: String,
    pub updated_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Conversation {
    pub id: String,
    pub title: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub image_id: Option<String>,
    pub total_input_tokens: i64,
    pub total_output_tokens: i64,
    pub total_tokens: i64,
    pub model: String,
    pub temperature: f64,
    pub max_tokens: i32,
    pub system_prompt: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub id: String,
    pub conversation_id: String,
    pub role: String, // 'user', 'assistant', 'system'
    pub content: String,
    pub timestamp: i64,
    pub input_tokens: Option<i64>,
    pub output_tokens: Option<i64>,
    pub total_tokens: Option<i64>,
    pub model: Option<String>,
    pub processing_time: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TokenUsage {
    pub id: String,
    pub date: String, // YYYY-MM-DD
    pub model: String,
    pub input_tokens: i64,
    pub output_tokens: i64,
    pub total_tokens: i64,
    pub cost: Option<f64>,
    pub conversation_count: i64,
    pub created_at: i64,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(db_path: PathBuf) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        let db = Database { conn };
        db.init_tables()?;
        Ok(db)
    }

    fn init_tables(&self) -> Result<()> {
        // 创建图片历史表
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS image_history (
                id TEXT PRIMARY KEY,
                original_image TEXT NOT NULL,
                processed_image TEXT NOT NULL,
                prompt TEXT NOT NULL,
                style TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                tags TEXT NOT NULL DEFAULT '[]',
                original_name TEXT,
                original_size INTEGER,
                processed_size INTEGER,
                width INTEGER,
                height INTEGER,
                processing_time REAL
            )",
            [],
        )?;

        // 创建自定义风格表
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS custom_styles (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                prompt TEXT NOT NULL,
                tags TEXT NOT NULL DEFAULT '[]',
                created_at INTEGER NOT NULL,
                is_favorite BOOLEAN NOT NULL DEFAULT 0,
                category TEXT
            )",
            [],
        )?;

        // 创建设置表
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS app_settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                api_endpoint TEXT NOT NULL DEFAULT '',
                api_key TEXT NOT NULL DEFAULT '',
                model TEXT NOT NULL DEFAULT '',
                updated_at INTEGER NOT NULL
            )",
            [],
        )?;

        // 创建对话表
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                image_id TEXT,
                total_input_tokens INTEGER NOT NULL DEFAULT 0,
                total_output_tokens INTEGER NOT NULL DEFAULT 0,
                total_tokens INTEGER NOT NULL DEFAULT 0,
                model TEXT NOT NULL,
                temperature REAL NOT NULL DEFAULT 0.7,
                max_tokens INTEGER NOT NULL DEFAULT 2048,
                system_prompt TEXT,
                FOREIGN KEY (image_id) REFERENCES image_history(id)
            )",
            [],
        )?;

        // 创建消息表
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
                content TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                input_tokens INTEGER,
                output_tokens INTEGER,
                total_tokens INTEGER,
                model TEXT,
                processing_time REAL,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            )",
            [],
        )?;

        // 创建 token 使用统计表
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS token_usage (
                id TEXT PRIMARY KEY,
                date TEXT NOT NULL,
                model TEXT NOT NULL,
                input_tokens INTEGER NOT NULL DEFAULT 0,
                output_tokens INTEGER NOT NULL DEFAULT 0,
                total_tokens INTEGER NOT NULL DEFAULT 0,
                cost REAL,
                conversation_count INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                UNIQUE(date, model)
            )",
            [],
        )?;

        // 创建索引
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_image_history_created_at ON image_history(created_at DESC)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_custom_styles_created_at ON custom_styles(created_at DESC)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_conversations_image_id ON conversations(image_id)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_token_usage_date ON token_usage(date DESC)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_token_usage_model ON token_usage(model)",
            [],
        )?;

        Ok(())
    }

    // 图片历史操作
    pub fn add_image_history(&self, image: &ImageHistory) -> Result<()> {
        self.conn.execute(
            "INSERT INTO image_history (
                id, original_image, processed_image, prompt, style, created_at, tags,
                original_name, original_size, processed_size, width, height, processing_time
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
            params![
                image.id,
                image.original_image,
                image.processed_image,
                image.prompt,
                image.style,
                image.created_at,
                image.tags,
                image.original_name,
                image.original_size,
                image.processed_size,
                image.width,
                image.height,
                image.processing_time
            ],
        )?;
        Ok(())
    }

    pub fn get_image_history(&self) -> Result<Vec<ImageHistory>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, original_image, processed_image, prompt, style, created_at, tags,
                    original_name, original_size, processed_size, width, height, processing_time
             FROM image_history ORDER BY created_at DESC"
        )?;

        let image_iter = stmt.query_map([], |row| {
            Ok(ImageHistory {
                id: row.get(0)?,
                original_image: row.get(1)?,
                processed_image: row.get(2)?,
                prompt: row.get(3)?,
                style: row.get(4)?,
                created_at: row.get(5)?,
                tags: row.get(6)?,
                original_name: row.get(7)?,
                original_size: row.get(8)?,
                processed_size: row.get(9)?,
                width: row.get(10)?,
                height: row.get(11)?,
                processing_time: row.get(12)?,
            })
        })?;

        let mut images = Vec::new();
        for image in image_iter {
            images.push(image?);
        }
        Ok(images)
    }

    pub fn delete_image_history(&self, id: &str) -> Result<()> {
        self.conn.execute(
            "DELETE FROM image_history WHERE id = ?1",
            params![id],
        )?;
        Ok(())
    }

    pub fn clear_image_history(&self) -> Result<()> {
        self.conn.execute("DELETE FROM image_history", [])?;
        Ok(())
    }

    // 自定义风格操作
    pub fn add_custom_style(&self, style: &CustomStyle) -> Result<()> {
        self.conn.execute(
            "INSERT INTO custom_styles (
                id, name, description, prompt, tags, created_at, is_favorite, category
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                style.id,
                style.name,
                style.description,
                style.prompt,
                style.tags,
                style.created_at,
                style.is_favorite,
                style.category
            ],
        )?;
        Ok(())
    }

    pub fn get_custom_styles(&self) -> Result<Vec<CustomStyle>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, description, prompt, tags, created_at, is_favorite, category
             FROM custom_styles ORDER BY created_at DESC"
        )?;

        let style_iter = stmt.query_map([], |row| {
            Ok(CustomStyle {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                prompt: row.get(3)?,
                tags: row.get(4)?,
                created_at: row.get(5)?,
                is_favorite: row.get(6)?,
                category: row.get(7)?,
            })
        })?;

        let mut styles = Vec::new();
        for style in style_iter {
            styles.push(style?);
        }
        Ok(styles)
    }

    pub fn update_custom_style(&self, style: &CustomStyle) -> Result<()> {
        self.conn.execute(
            "UPDATE custom_styles SET 
                name = ?2, description = ?3, prompt = ?4, tags = ?5, 
                is_favorite = ?6, category = ?7
             WHERE id = ?1",
            params![
                style.id,
                style.name,
                style.description,
                style.prompt,
                style.tags,
                style.is_favorite,
                style.category
            ],
        )?;
        Ok(())
    }

    pub fn delete_custom_style(&self, id: &str) -> Result<()> {
        self.conn.execute(
            "DELETE FROM custom_styles WHERE id = ?1",
            params![id],
        )?;
        Ok(())
    }

    // 设置操作
    pub fn get_settings(&self) -> Result<Option<AppSettings>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, api_endpoint, api_key, model, updated_at FROM app_settings WHERE id = 1"
        )?;

        let mut rows = stmt.query_map([], |row| {
            Ok(AppSettings {
                id: row.get(0)?,
                api_endpoint: row.get(1)?,
                api_key: row.get(2)?,
                model: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })?;

        match rows.next() {
            Some(row) => Ok(Some(row?)),
            None => Ok(None),
        }
    }

    pub fn save_settings(&self, settings: &AppSettings) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO app_settings (id, api_endpoint, api_key, model, updated_at)
             VALUES (1, ?1, ?2, ?3, ?4)",
            params![
                settings.api_endpoint,
                settings.api_key,
                settings.model,
                settings.updated_at
            ],
        )?;
        Ok(())
    }

    // 对话操作
    pub fn create_conversation(&self, conversation: &Conversation) -> Result<()> {
        self.conn.execute(
            "INSERT INTO conversations (
                id, title, created_at, updated_at, image_id, total_input_tokens,
                total_output_tokens, total_tokens, model, temperature, max_tokens, system_prompt
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
            params![
                conversation.id,
                conversation.title,
                conversation.created_at,
                conversation.updated_at,
                conversation.image_id,
                conversation.total_input_tokens,
                conversation.total_output_tokens,
                conversation.total_tokens,
                conversation.model,
                conversation.temperature,
                conversation.max_tokens,
                conversation.system_prompt
            ],
        )?;
        Ok(())
    }

    pub fn get_conversations(&self) -> Result<Vec<Conversation>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, created_at, updated_at, image_id, total_input_tokens,
                    total_output_tokens, total_tokens, model, temperature, max_tokens, system_prompt
             FROM conversations ORDER BY updated_at DESC"
        )?;

        let conversation_iter = stmt.query_map([], |row| {
            Ok(Conversation {
                id: row.get(0)?,
                title: row.get(1)?,
                created_at: row.get(2)?,
                updated_at: row.get(3)?,
                image_id: row.get(4)?,
                total_input_tokens: row.get(5)?,
                total_output_tokens: row.get(6)?,
                total_tokens: row.get(7)?,
                model: row.get(8)?,
                temperature: row.get(9)?,
                max_tokens: row.get(10)?,
                system_prompt: row.get(11)?,
            })
        })?;

        let mut conversations = Vec::new();
        for conversation in conversation_iter {
            conversations.push(conversation?);
        }
        Ok(conversations)
    }

    pub fn update_conversation(&self, conversation: &Conversation) -> Result<()> {
        self.conn.execute(
            "UPDATE conversations SET 
                title = ?2, updated_at = ?3, total_input_tokens = ?4,
                total_output_tokens = ?5, total_tokens = ?6
             WHERE id = ?1",
            params![
                conversation.id,
                conversation.title,
                conversation.updated_at,
                conversation.total_input_tokens,
                conversation.total_output_tokens,
                conversation.total_tokens
            ],
        )?;
        Ok(())
    }

    pub fn delete_conversation(&self, id: &str) -> Result<()> {
        self.conn.execute(
            "DELETE FROM conversations WHERE id = ?1",
            params![id],
        )?;
        Ok(())
    }

    // 消息操作
    pub fn add_message(&self, message: &Message) -> Result<()> {
        self.conn.execute(
            "INSERT INTO messages (
                id, conversation_id, role, content, timestamp, input_tokens,
                output_tokens, total_tokens, model, processing_time
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                message.id,
                message.conversation_id,
                message.role,
                message.content,
                message.timestamp,
                message.input_tokens,
                message.output_tokens,
                message.total_tokens,
                message.model,
                message.processing_time
            ],
        )?;
        Ok(())
    }

    pub fn get_messages(&self, conversation_id: &str) -> Result<Vec<Message>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, conversation_id, role, content, timestamp, input_tokens,
                    output_tokens, total_tokens, model, processing_time
             FROM messages WHERE conversation_id = ?1 ORDER BY timestamp ASC"
        )?;

        let message_iter = stmt.query_map([conversation_id], |row| {
            Ok(Message {
                id: row.get(0)?,
                conversation_id: row.get(1)?,
                role: row.get(2)?,
                content: row.get(3)?,
                timestamp: row.get(4)?,
                input_tokens: row.get(5)?,
                output_tokens: row.get(6)?,
                total_tokens: row.get(7)?,
                model: row.get(8)?,
                processing_time: row.get(9)?,
            })
        })?;

        let mut messages = Vec::new();
        for message in message_iter {
            messages.push(message?);
        }
        Ok(messages)
    }

    // Token 使用统计操作
    pub fn update_token_usage(&self, usage: &TokenUsage) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO token_usage (
                id, date, model, input_tokens, output_tokens, total_tokens,
                cost, conversation_count, created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                usage.id,
                usage.date,
                usage.model,
                usage.input_tokens,
                usage.output_tokens,
                usage.total_tokens,
                usage.cost,
                usage.conversation_count,
                usage.created_at
            ],
        )?;
        Ok(())
    }

    pub fn get_token_usage_by_date(&self, date: &str) -> Result<Vec<TokenUsage>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, date, model, input_tokens, output_tokens, total_tokens,
                    cost, conversation_count, created_at
             FROM token_usage WHERE date = ?1"
        )?;

        let usage_iter = stmt.query_map([date], |row| {
            Ok(TokenUsage {
                id: row.get(0)?,
                date: row.get(1)?,
                model: row.get(2)?,
                input_tokens: row.get(3)?,
                output_tokens: row.get(4)?,
                total_tokens: row.get(5)?,
                cost: row.get(6)?,
                conversation_count: row.get(7)?,
                created_at: row.get(8)?,
            })
        })?;

        let mut usages = Vec::new();
        for usage in usage_iter {
            usages.push(usage?);
        }
        Ok(usages)
    }

    pub fn get_token_usage_stats(&self, days: i32) -> Result<Vec<TokenUsage>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, date, model, input_tokens, output_tokens, total_tokens,
                    cost, conversation_count, created_at
             FROM token_usage 
             WHERE date >= date('now', '-' || ?1 || ' days')
             ORDER BY date DESC"
        )?;

        let usage_iter = stmt.query_map([days], |row| {
            Ok(TokenUsage {
                id: row.get(0)?,
                date: row.get(1)?,
                model: row.get(2)?,
                input_tokens: row.get(3)?,
                output_tokens: row.get(4)?,
                total_tokens: row.get(5)?,
                cost: row.get(6)?,
                conversation_count: row.get(7)?,
                created_at: row.get(8)?,
            })
        })?;

        let mut usages = Vec::new();
        for usage in usage_iter {
            usages.push(usage?);
        }
        Ok(usages)
    }
}