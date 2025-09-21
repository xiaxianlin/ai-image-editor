use tauri::State;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

use crate::database::Database;
use super::service::StyleService;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateStyleRequest {
    pub name: String,
    pub description: String,
    pub prompt: String,
    pub tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateStyleResponse {
    pub success: bool,
    pub style_id: String,
    pub message: String,
}

type DatabaseState = Mutex<Database>;

/// 获取全部风格接口
#[tauri::command]
pub fn get_all_styles(db: State<'_, DatabaseState>) -> Result<Vec<crate::database::Style>, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.style().get_all().map_err(|e| format!("Failed to get styles: {}", e))
}

/// 添加风格接口
#[tauri::command]
pub fn add_style(
    db: State<'_, DatabaseState>,
    request: CreateStyleRequest,
) -> Result<CreateStyleResponse, String> {
    let service = StyleService::new();
    service.create_style(db, request)
}

/// 删除风格接口
#[tauri::command]
pub fn delete_style(
    db: State<'_, DatabaseState>,
    id: String,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.style().delete(&id).map_err(|e| format!("Failed to delete style: {}", e))
}