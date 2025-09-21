use tauri::State;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

use crate::database::Database;
use super::service::SettingService;

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveSettingRequest {
    pub api_url: String,
    pub api_key: String,
    pub model: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveSettingResponse {
    pub success: bool,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetSettingResponse {
    pub api_url: String,
    pub model: String,
    pub has_api_key: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenUsageResponse {
    pub daily: i64,
    pub monthly: i64,
    pub yearly: i64,
}

type DatabaseState = Mutex<Database>;

/// 保存设置接口
#[tauri::command]
pub fn save_setting(
    db: State<'_, DatabaseState>,
    request: SaveSettingRequest,
) -> Result<SaveSettingResponse, String> {
    let service = SettingService::new();
    service.save_setting(db, request)
}

/// 获取设置接口
#[tauri::command]
pub fn get_setting(db: State<'_, DatabaseState>) -> Result<GetSettingResponse, String> {
    let service = SettingService::new();
    service.get_setting(db)
}

/// 获取token使用量（日度）接口
#[tauri::command]
pub fn get_daily_token_usage(db: State<'_, DatabaseState>) -> Result<i64, String> {
    let service = SettingService::new();
    service.get_daily_token_usage(db)
}

/// 获取token使用量（月度）接口
#[tauri::command]
pub fn get_monthly_token_usage(db: State<'_, DatabaseState>) -> Result<i64, String> {
    let service = SettingService::new();
    service.get_monthly_token_usage(db)
}

/// 获取token使用量（年度）接口
#[tauri::command]
pub fn get_yearly_token_usage(db: State<'_, DatabaseState>) -> Result<i64, String> {
    let service = SettingService::new();
    service.get_yearly_token_usage(db)
}