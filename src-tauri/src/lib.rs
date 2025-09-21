mod ai_service;
mod database;
mod gallery;
mod style;
mod setting;
mod ai;

use database::Database;
use gallery::api::{edit_image, get_all_images, batch_delete_images, generate_style_from_message};
use style::api::{get_all_styles, add_style, delete_style};
use setting::api::{save_setting, get_setting, get_daily_token_usage, get_monthly_token_usage, get_yearly_token_usage};
use ai::api::{process_image, generate_style};
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // 获取应用数据目录
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");

            // 确保目录存在
            std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");

            // 创建数据库文件路径
            let db_path = app_data_dir.join("app.db");

            // 初始化数据库
            let database = Database::new(db_path).expect("Failed to initialize database");

            // 将数据库添加到应用状态
            app.manage(Mutex::new(database));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Gallery module endpoints
            edit_image,
            get_all_images,
            batch_delete_images,
            generate_style_from_message,

            // Style module endpoints
            get_all_styles,
            add_style,
            delete_style,

            // Setting module endpoints
            save_setting,
            get_setting,
            get_daily_token_usage,
            get_monthly_token_usage,
            get_yearly_token_usage,

            // AI module endpoints
            process_image,
            generate_style
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}