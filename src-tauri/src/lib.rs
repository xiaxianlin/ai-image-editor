mod database;
mod commands;
mod ai_service;

use database::Database;
use commands::{
    add_image_to_history, get_image_history, delete_image_from_history, clear_image_history,
    add_custom_style, get_custom_styles, update_custom_style, delete_custom_style,
    get_app_settings, save_app_settings,
    create_conversation, get_conversations, update_conversation, delete_conversation,
    add_message, get_messages,
    update_token_usage, get_token_usage_by_date, get_token_usage_stats,
    call_ai_api, process_image_with_ai
};
use std::sync::Mutex;
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // 获取应用数据目录
            let app_data_dir = app.path().app_data_dir()
                .expect("Failed to get app data directory");
            
            // 确保目录存在
            std::fs::create_dir_all(&app_data_dir)
                .expect("Failed to create app data directory");
            
            // 创建数据库文件路径
            let db_path = app_data_dir.join("app.db");
            
            // 初始化数据库
            let database = Database::new(db_path)
                .expect("Failed to initialize database");
            
            // 将数据库添加到应用状态
            app.manage(Mutex::new(database));
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            add_image_to_history,
            get_image_history,
            delete_image_from_history,
            clear_image_history,
            add_custom_style,
            get_custom_styles,
            update_custom_style,
            delete_custom_style,
            get_app_settings,
            save_app_settings,
            create_conversation,
            get_conversations,
            update_conversation,
            delete_conversation,
            add_message,
            get_messages,
            update_token_usage,
            get_token_usage_by_date,
            get_token_usage_stats,
            call_ai_api,
            process_image_with_ai
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
