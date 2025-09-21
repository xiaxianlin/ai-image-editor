use tauri::State;
use std::sync::Mutex;
use uuid::Uuid;
use chrono::Utc;
use serde_json;

use crate::database::{Database, Style};

use super::api::{CreateStyleRequest, CreateStyleResponse};

type DatabaseState = Mutex<Database>;

pub struct StyleService;

impl StyleService {
    pub fn new() -> Self {
        Self
    }

    /// 创建风格
    pub fn create_style(
        &self,
        db: State<'_, DatabaseState>,
        request: CreateStyleRequest,
    ) -> Result<CreateStyleResponse, String> {
        let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;

        // 检查风格名称是否已存在
        match db.style().get_by_name(&request.name) {
            Ok(Some(_)) => return Err("风格名称已存在".to_string()),
            Ok(None) => {},
            Err(e) => return Err(format!("Failed to check style: {}", e)),
        }

        let style = Style {
            id: Uuid::new_v4().to_string(),
            name: request.name,
            description: request.description,
            prompt: request.prompt,
            tags: serde_json::to_string(&request.tags).unwrap_or_else(|_| "[]".to_string()),
            create_at: Utc::now().timestamp_millis(),
            update_at: Utc::now().timestamp_millis(),
        };

        db.style().create(&style)
            .map_err(|e| format!("Failed to create style: {}", e))?;

        Ok(CreateStyleResponse {
            success: true,
            style_id: style.id,
            message: "风格创建成功".to_string(),
        })
    }
}