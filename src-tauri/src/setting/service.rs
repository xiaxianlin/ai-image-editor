use tauri::State;
use std::sync::Mutex;
use chrono::Utc;
use chrono::Datelike;

use crate::database::{Database, Setting};

use super::api::{SaveSettingRequest, SaveSettingResponse, GetSettingResponse};

type DatabaseState = Mutex<Database>;

pub struct SettingService;

impl SettingService {
    pub fn new() -> Self {
        Self
    }

    /// 保存设置
    pub fn save_setting(
        &self,
        db: State<'_, DatabaseState>,
        request: SaveSettingRequest,
    ) -> Result<SaveSettingResponse, String> {
        let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;

        let existing = db.setting().get()
            .map_err(|e| format!("Failed to get settings: {}", e))?;

        let setting = if let Some(mut existing) = existing {
            // 更新现有设置
            existing.api_url = request.api_url;
            existing.api_key = request.api_key;
            existing.model = request.model;
            existing.update_at = Utc::now().timestamp_millis();
            existing
        } else {
            // 创建新设置
            Setting {
                id: uuid::Uuid::new_v4().to_string(),
                api_url: request.api_url,
                api_key: request.api_key,
                model: request.model,
                update_at: Utc::now().timestamp_millis(),
            }
        };

        db.setting().update(&setting)
            .map_err(|e| format!("Failed to save settings: {}", e))?;

        Ok(SaveSettingResponse {
            success: true,
            message: "设置保存成功".to_string(),
        })
    }

    /// 获取设置
    pub fn get_setting(
        &self,
        db: State<'_, DatabaseState>,
    ) -> Result<GetSettingResponse, String> {
        let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;

        let setting = db.setting().get_or_create_default()
            .map_err(|e| format!("Failed to get settings: {}", e))?;

        Ok(GetSettingResponse {
            api_url: setting.api_url,
            model: setting.model,
            has_api_key: !setting.api_key.is_empty(),
        })
    }

    /// 获取日度token使用量
    pub fn get_daily_token_usage(
        &self,
        db: State<'_, DatabaseState>,
    ) -> Result<i64, String> {
        let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;

        let today_start = Utc::now().date_naive().and_hms_opt(0, 0, 0).unwrap().and_utc().timestamp_millis();
        let today_end = today_start + 24 * 60 * 60 * 1000;

        let galleries = db.gallery().get_all()
            .map_err(|e| format!("Failed to get galleries: {}", e))?;

        let daily_usage: i64 = galleries
            .iter()
            .filter(|g| g.create_at >= today_start && g.create_at < today_end)
            .map(|g| g.total_input_tokens + g.total_ouput_tokens)
            .sum();

        Ok(daily_usage)
    }

    /// 获取月度token使用量
    pub fn get_monthly_token_usage(
        &self,
        db: State<'_, DatabaseState>,
    ) -> Result<i64, String> {
        let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;

        let now = Utc::now();
        let month_start = now.date_naive().with_day(1).unwrap().and_hms_opt(0, 0, 0).unwrap().and_utc().timestamp_millis();
        let next_month = if now.month() == 12 {
            now.date_naive().with_year(now.year() + 1).unwrap().with_month(1).unwrap().with_day(1).unwrap()
        } else {
            now.date_naive().with_month(now.month() + 1).unwrap().with_day(1).unwrap()
        };
        let month_end = next_month.and_hms_opt(0, 0, 0).unwrap().and_utc().timestamp_millis();

        let galleries = db.gallery().get_all()
            .map_err(|e| format!("Failed to get galleries: {}", e))?;

        let monthly_usage: i64 = galleries
            .iter()
            .filter(|g| g.create_at >= month_start && g.create_at < month_end)
            .map(|g| g.total_input_tokens + g.total_ouput_tokens)
            .sum();

        Ok(monthly_usage)
    }

    /// 获取年度token使用量
    pub fn get_yearly_token_usage(
        &self,
        db: State<'_, DatabaseState>,
    ) -> Result<i64, String> {
        let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;

        let now = Utc::now();
        let year_start = now.date_naive().with_month(1).unwrap().with_day(1).unwrap().and_hms_opt(0, 0, 0).unwrap().and_utc().timestamp_millis();
        let year_end = now.date_naive().with_year(now.year() + 1).unwrap().with_month(1).unwrap().with_day(1).unwrap().and_hms_opt(0, 0, 0).unwrap().and_utc().timestamp_millis();

        let galleries = db.gallery().get_all()
            .map_err(|e| format!("Failed to get galleries: {}", e))?;

        let yearly_usage: i64 = galleries
            .iter()
            .filter(|g| g.create_at >= year_start && g.create_at < year_end)
            .map(|g| g.total_input_tokens + g.total_ouput_tokens)
            .sum();

        Ok(yearly_usage)
    }
}