use crate::database::{Database, ImageHistory, CustomStyle, AppSettings, Conversation, Message, TokenUsage};
use crate::ai_service::{AIService, AIRequest, AIResponse, AIError, extract_image_base64, create_image_processing_prompt};
use std::sync::Mutex;
use tauri::State;

pub type DatabaseState = Mutex<Database>;

// 图片历史相关命令
#[tauri::command]
pub async fn add_image_to_history(
    db: State<'_, DatabaseState>,
    image: ImageHistory,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.add_image_history(&image)
        .map_err(|e| format!("Failed to add image to history: {}", e))
}

#[tauri::command]
pub async fn get_image_history(
    db: State<'_, DatabaseState>,
) -> Result<Vec<ImageHistory>, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.get_image_history()
        .map_err(|e| format!("Failed to get image history: {}", e))
}

#[tauri::command]
pub async fn delete_image_from_history(
    db: State<'_, DatabaseState>,
    id: String,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.delete_image_history(&id)
        .map_err(|e| format!("Failed to delete image from history: {}", e))
}

#[tauri::command]
pub async fn clear_image_history(
    db: State<'_, DatabaseState>,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.clear_image_history()
        .map_err(|e| format!("Failed to clear image history: {}", e))
}

// 自定义风格相关命令
#[tauri::command]
pub async fn add_custom_style(
    db: State<'_, DatabaseState>,
    style: CustomStyle,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.add_custom_style(&style)
        .map_err(|e| format!("Failed to add custom style: {}", e))
}

#[tauri::command]
pub async fn get_custom_styles(
    db: State<'_, DatabaseState>,
) -> Result<Vec<CustomStyle>, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.get_custom_styles()
        .map_err(|e| format!("Failed to get custom styles: {}", e))
}

#[tauri::command]
pub async fn update_custom_style(
    db: State<'_, DatabaseState>,
    style: CustomStyle,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.update_custom_style(&style)
        .map_err(|e| format!("Failed to update custom style: {}", e))
}

#[tauri::command]
pub async fn delete_custom_style(
    db: State<'_, DatabaseState>,
    id: String,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.delete_custom_style(&id)
        .map_err(|e| format!("Failed to delete custom style: {}", e))
}

// 设置相关命令
#[tauri::command]
pub async fn get_app_settings(
    db: State<'_, DatabaseState>,
) -> Result<Option<AppSettings>, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.get_settings()
        .map_err(|e| format!("Failed to get app settings: {}", e))
}

#[tauri::command]
pub async fn save_app_settings(
    db: State<'_, DatabaseState>,
    settings: AppSettings,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.save_settings(&settings)
        .map_err(|e| format!("Failed to save app settings: {}", e))
}

// 对话相关命令
#[tauri::command]
pub async fn create_conversation(
    db: State<'_, DatabaseState>,
    conversation: Conversation,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.create_conversation(&conversation)
        .map_err(|e| format!("Failed to create conversation: {}", e))
}

#[tauri::command]
pub async fn get_conversations(
    db: State<'_, DatabaseState>,
) -> Result<Vec<Conversation>, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.get_conversations()
        .map_err(|e| format!("Failed to get conversations: {}", e))
}

#[tauri::command]
pub async fn update_conversation(
    db: State<'_, DatabaseState>,
    conversation: Conversation,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.update_conversation(&conversation)
        .map_err(|e| format!("Failed to update conversation: {}", e))
}

#[tauri::command]
pub async fn delete_conversation(
    db: State<'_, DatabaseState>,
    id: String,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.delete_conversation(&id)
        .map_err(|e| format!("Failed to delete conversation: {}", e))
}

// 消息相关命令
#[tauri::command]
pub async fn add_message(
    db: State<'_, DatabaseState>,
    message: Message,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.add_message(&message)
        .map_err(|e| format!("Failed to add message: {}", e))
}

#[tauri::command]
pub async fn get_messages(
    db: State<'_, DatabaseState>,
    conversation_id: String,
) -> Result<Vec<Message>, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.get_messages(&conversation_id)
        .map_err(|e| format!("Failed to get messages: {}", e))
}

// Token 统计相关命令
#[tauri::command]
pub async fn update_token_usage(
    db: State<'_, DatabaseState>,
    usage: TokenUsage,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.update_token_usage(&usage)
        .map_err(|e| format!("Failed to update token usage: {}", e))
}

#[tauri::command]
pub async fn get_token_usage_by_date(
    db: State<'_, DatabaseState>,
    date: String,
) -> Result<Vec<TokenUsage>, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.get_token_usage_by_date(&date)
        .map_err(|e| format!("Failed to get token usage by date: {}", e))
}

#[tauri::command]
pub async fn get_token_usage_stats(
    db: State<'_, DatabaseState>,
    days: i32,
) -> Result<Vec<TokenUsage>, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.get_token_usage_stats(days)
        .map_err(|e| format!("Failed to get token usage stats: {}", e))
}

// AI 调用相关命令
#[tauri::command]
pub async fn call_ai_api(
    prompt: String,
    image_data: Option<String>,
    model: String,
    api_endpoint: String,
    api_key: String,
    max_tokens: Option<u32>,
    temperature: Option<f32>,
    style: Option<String>,
) -> Result<AIResponse, AIError> {
    let ai_service = AIService::new();
    
    // 处理图片数据
    let processed_image_data = if let Some(data) = image_data {
        Some(extract_image_base64(&data).map_err(|e| AIError {
            error_type: "image_error".to_string(),
            message: e,
            code: None,
        })?)
    } else {
        None
    };

    // 创建处理后的提示词
    let processed_prompt = create_image_processing_prompt(&prompt, style.as_deref());

    let request = AIRequest {
        model,
        prompt: processed_prompt,
        image_data: processed_image_data,
        max_tokens,
        temperature,
    };

    ai_service.call_ai(request, &api_endpoint, &api_key).await
}

#[tauri::command]
pub async fn process_image_with_ai(
    db: State<'_, DatabaseState>,
    conversation_id: String,
    prompt: String,
    image_data: String,
    style: Option<String>,
) -> Result<AIResponse, String> {
    // 获取设置
    let settings = {
        let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
        db.get_settings()
            .map_err(|e| format!("Failed to get settings: {}", e))?
    };

    let settings = settings.ok_or("请先配置 API 设置")?;

    if settings.api_key.is_empty() {
        return Err("请先设置 API Key".to_string());
    }

    // 调用 AI API
    let ai_response = call_ai_api(
        prompt.clone(),
        Some(image_data),
        settings.model,
        settings.api_endpoint,
        settings.api_key,
        Some(1000), // 默认最大 token 数
        Some(0.7),  // 默认温度
        style,
    ).await.map_err(|e| format!("AI API 调用失败: {}", e.message))?;

    // 更新 token 使用统计
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
    let token_usage = TokenUsage {
        id: uuid::Uuid::new_v4().to_string(),
        date: today,
        model: ai_response.model.clone(),
        input_tokens: 0, // 暂时设为0，实际应该从AI响应中获取
        output_tokens: ai_response.tokens_used as i64,
        total_tokens: ai_response.tokens_used as i64,
        cost: Some(calculate_cost(&ai_response.model, ai_response.tokens_used)),
        conversation_count: 1,
        created_at: chrono::Utc::now().timestamp_millis(),
    };

    {
        let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
        db.update_token_usage(&token_usage)
            .map_err(|e| format!("Failed to update token usage: {}", e))?;
    }

    // 添加 AI 响应消息到对话
    let ai_message = Message {
        id: uuid::Uuid::new_v4().to_string(),
        conversation_id: conversation_id.clone(),
        role: "assistant".to_string(),
        content: ai_response.content.clone(),
        timestamp: chrono::Utc::now().timestamp_millis(),
        input_tokens: Some(0), // 暂时设为0，实际应该从AI响应中获取
        output_tokens: Some(ai_response.tokens_used as i64),
        total_tokens: Some(ai_response.tokens_used as i64),
        model: Some(ai_response.model.clone()),
        processing_time: Some(0.0), // 可以记录实际处理时间
    };

    {
        let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
        db.add_message(&ai_message)
            .map_err(|e| format!("Failed to add AI message: {}", e))?;
    }

    Ok(ai_response)
}

// 计算 token 成本的辅助函数
fn calculate_cost(model: &str, tokens: u32) -> f64 {
    let cost_per_1k_tokens = match model {
        "gpt-4o" => 0.005,
        "gpt-4o-mini" => 0.00015,
        "gpt-4-vision-preview" => 0.01,
        "claude-3-opus" => 0.015,
        "claude-3-sonnet" => 0.003,
        "claude-3-haiku" => 0.00025,
        _ => 0.002, // 默认价格
    };
    
    (tokens as f64 / 1000.0) * cost_per_1k_tokens
}