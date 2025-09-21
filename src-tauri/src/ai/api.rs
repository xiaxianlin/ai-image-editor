use serde::{Deserialize, Serialize};

use super::service::AIService;

#[derive(Debug, Serialize, Deserialize)]
pub struct AIProcessRequest {
    pub prompt: String,
    pub image_data: String,
    pub api_url: String,
    pub api_key: String,
    pub model: String,
    pub style_prompt: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIProcessResponse {
    pub content: String,
    pub tokens_used: u32,
    pub model: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StyleGenerationRequest {
    pub content: String,
    pub api_url: String,
    pub api_key: String,
    pub model: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StyleGenerationResponse {
    pub name: String,
    pub prompt: String,
}

/// AI处理图片接口
#[tauri::command]
pub async fn process_image(
    request: AIProcessRequest,
) -> Result<AIProcessResponse, String> {
    let service = AIService::new();
    let service_response = service.process_image(
        request.prompt,
        request.image_data,
        request.api_url,
        request.api_key,
        request.model,
        request.style_prompt,
    ).await?;

    Ok(AIProcessResponse {
        content: service_response.content,
        tokens_used: service_response.tokens_used,
        model: service_response.model,
    })
}

/// 生成风格接口
#[tauri::command]
pub async fn generate_style(
    request: StyleGenerationRequest,
) -> Result<StyleGenerationResponse, String> {
    let service = AIService::new();
    let service_response = service.generate_style_from_content(
        request.content,
        request.api_url,
        request.api_key,
        request.model,
    ).await?;

    Ok(StyleGenerationResponse {
        name: service_response.name,
        prompt: service_response.prompt,
    })
}