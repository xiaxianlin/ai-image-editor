use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AIProcessResponse {
    pub content: String,
    pub tokens_used: u32,
    pub model: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StyleGenerationResponse {
    pub name: String,
    pub prompt: String,
}

pub struct AIService;

impl AIService {
    pub fn new() -> Self {
        Self
    }

    /// 处理图片
    pub async fn process_image(
        &self,
        prompt: String,
        image_data: String,
        api_url: String,
        api_key: String,
        model: String,
        style_prompt: Option<String>,
    ) -> Result<AIProcessResponse, String> {
        // 处理图片数据
        let processed_image_data = crate::ai_service::extract_image_base64(&image_data)
            .map_err(|e| format!("Failed to extract image data: {}", e))?;

        // 创建处理后的提示词
        let processed_prompt = crate::ai_service::create_image_processing_prompt(&prompt,
            style_prompt.as_deref()
        );

        let request = crate::ai_service::AIRequest {
            model,
            prompt: processed_prompt,
            image_data: Some(processed_image_data),
            max_tokens: Some(1000),
            temperature: Some(0.7),
        };

        // 使用现有的ai_service模块
        let ai_service = crate::ai_service::AIService::new();
        let ai_response = ai_service.call_ai(request, &api_url, &api_key)
            .await
            .map_err(|e| format!("AI API call failed: {}", e.message))?;

        Ok(AIProcessResponse {
            content: ai_response.content,
            tokens_used: ai_response.tokens_used,
            model: ai_response.model,
        })
    }

    /// 根据内容生成风格
    pub async fn generate_style_from_content(
        &self,
        content: String,
        api_url: String,
        api_key: String,
        model: String,
    ) -> Result<StyleGenerationResponse, String> {
        let prompt = format!(
            "Based on the following user request for image processing, generate a style name and description suitable for an AI image processing style library. \
            Return only a JSON object with 'name' and 'prompt' fields. \
            User request: {}",
            content
        );

        let request = crate::ai_service::AIRequest {
            model,
            prompt,
            image_data: None,
            max_tokens: Some(200),
            temperature: Some(0.7),
        };

        let ai_service = crate::ai_service::AIService::new();
        let ai_response = ai_service.call_ai(request, &api_url, &api_key)
            .await
            .map_err(|e| format!("AI API call failed: {}", e.message))?;

        // 解析AI响应以获取风格信息
        // 这里简化处理，实际应该解析JSON响应
        let style_name = extract_style_name(&ai_response.content)?;
        let style_prompt = extract_style_prompt(&ai_response.content)?;

        Ok(StyleGenerationResponse {
            name: style_name,
            prompt: style_prompt,
        })
    }
}

fn extract_style_name(content: &str) -> Result<String, String> {
    // 简化实现：从内容中提取风格名称
    // 实际应该解析JSON响应
    if content.contains("\"name\"") {
        // 尝试解析JSON
        if let Ok(json) = serde_json::from_str::<serde_json::Value>(content) {
            if let Some(name) = json.get("name").and_then(|v| v.as_str()) {
                return Ok(name.to_string());
            }
        }
    }

    // 回退方案：从内容中提取第一个引号内的内容
    if let Some(start) = content.find('\"') {
        if let Some(end) = content[start + 1..].find('\"') {
            return Ok(content[start + 1..start + 1 + end].to_string());
        }
    }

    Ok("自定义风格".to_string())
}

fn extract_style_prompt(content: &str) -> Result<String, String> {
    // 简化实现：从内容中提取风格提示
    // 实际应该解析JSON响应
    if content.contains("\"prompt\"") {
        // 尝试解析JSON
        if let Ok(json) = serde_json::from_str::<serde_json::Value>(content) {
            if let Some(prompt) = json.get("prompt").and_then(|v| v.as_str()) {
                return Ok(prompt.to_string());
            }
        }
    }

    // 回退方案：返回通用提示
    Ok("Apply artistic style transformation".to_string())
}