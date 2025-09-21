use tauri::State;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

use crate::database::Database;
use super::service::GalleryService;

#[derive(Debug, Serialize, Deserialize)]
pub struct ImageEditRequest {
    pub origin_image: String,
    pub prompt: String,
    pub style_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImageEditResponse {
    pub success: bool,
    pub effect_image: Option<String>,
    pub gallery_id: String,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BatchDeleteRequest {
    pub ids: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StyleGenerateRequest {
    pub message_content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StyleGenerateResponse {
    pub success: bool,
    pub style_name: Option<String>,
    pub style_prompt: Option<String>,
    pub message: String,
}

type DatabaseState = Mutex<Database>;

/// 图片编辑接口
#[tauri::command]
pub async fn edit_image(
    db: State<'_, DatabaseState>,
    request: ImageEditRequest,
) -> Result<ImageEditResponse, String> {
    let service = GalleryService::new();
    service.edit_image(db, request).await
}

/// 获取全部图片接口
#[tauri::command]
pub fn get_all_images(db: State<'_, DatabaseState>) -> Result<Vec<crate::database::Gallery>, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.gallery().get_all().map_err(|e| format!("Failed to get images: {}", e))
}

/// 批量删除图片接口
#[tauri::command]
pub fn batch_delete_images(
    db: State<'_, DatabaseState>,
    request: BatchDeleteRequest,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.gallery().batch_delete(&request.ids).map_err(|e| format!("Failed to delete images: {}", e))
}

/// 根据消息内容生成风格接口
#[tauri::command]
pub async fn generate_style_from_message(
    db: State<'_, DatabaseState>,
    request: StyleGenerateRequest,
) -> Result<StyleGenerateResponse, String> {
    let service = GalleryService::new();
    service.generate_style_from_message(db, request).await
}