use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIRequest {
    pub model: String,
    pub prompt: String,
    pub image_data: Option<String>, // base64 encoded image
    pub max_tokens: Option<u32>,
    pub temperature: Option<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIResponse {
    pub content: String,
    pub tokens_used: u32,
    pub model: String,
    pub finish_reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIError {
    pub error_type: String,
    pub message: String,
    pub code: Option<String>,
}

// OpenAI API 请求结构
#[derive(Debug, Serialize)]
struct OpenAIMessage {
    role: String,
    content: Vec<OpenAIContent>,
}

#[derive(Debug, Serialize)]
#[serde(tag = "type")]
enum OpenAIContent {
    #[serde(rename = "text")]
    Text { text: String },
    #[serde(rename = "image_url")]
    ImageUrl { image_url: OpenAIImageUrl },
}

#[derive(Debug, Serialize)]
struct OpenAIImageUrl {
    url: String,
}

#[derive(Debug, Serialize)]
struct OpenAIRequest {
    model: String,
    messages: Vec<OpenAIMessage>,
    max_tokens: Option<u32>,
    temperature: Option<f32>,
}

// OpenAI API 响应结构
#[derive(Debug, Deserialize)]
struct OpenAIResponse {
    choices: Vec<OpenAIChoice>,
    usage: OpenAIUsage,
}

#[derive(Debug, Deserialize)]
struct OpenAIChoice {
    message: OpenAIResponseMessage,
    finish_reason: String,
}

#[derive(Debug, Deserialize)]
struct OpenAIResponseMessage {
    content: String,
}

#[derive(Debug, Deserialize)]
struct OpenAIUsage {
    total_tokens: u32,
}

#[derive(Debug, Deserialize)]
struct OpenAIErrorResponse {
    error: OpenAIErrorDetail,
}

#[derive(Debug, Deserialize)]
struct OpenAIErrorDetail {
    message: String,
    #[serde(rename = "type")]
    error_type: String,
    code: Option<String>,
}

pub struct AIService {
    client: reqwest::Client,
}

#[derive(Debug, Clone)]
pub struct RetryConfig {
    pub max_retries: u32,
    pub base_delay_ms: u64,
    pub max_delay_ms: u64,
    pub backoff_factor: f64,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            max_retries: 3,
            base_delay_ms: 1000,
            max_delay_ms: 10000,
            backoff_factor: 2.0,
        }
    }
}

impl AIService {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
        }
    }

    pub async fn call_ai(
        &self,
        request: AIRequest,
        api_endpoint: &str,
        api_key: &str,
    ) -> Result<AIResponse, AIError> {
        self.call_ai_with_retry(request, api_endpoint, api_key, RetryConfig::default()).await
    }

    pub async fn call_ai_with_retry(
        &self,
        request: AIRequest,
        api_endpoint: &str,
        api_key: &str,
        retry_config: RetryConfig,
    ) -> Result<AIResponse, AIError> {
        let mut last_error = None;

        for attempt in 0..=retry_config.max_retries {
            match self.call_openai_api(request.clone(), api_endpoint, api_key).await {
                Ok(response) => return Ok(response),
                Err(error) => {
                    last_error = Some(error.clone());

                    // 如果是最后一次尝试，直接返回错误
                    if attempt == retry_config.max_retries {
                        break;
                    }

                    // 对于某些错误类型，不进行重试
                    if should_not_retry(&error) {
                        break;
                    }

                    // 计算延迟时间
                    let delay_ms = calculate_delay(attempt, &retry_config);
                    
                    println!("AI API 调用失败，{}ms 后重试 ({}/{}): {}", 
                             delay_ms, attempt + 1, retry_config.max_retries, error.message);

                    tokio::time::sleep(tokio::time::Duration::from_millis(delay_ms)).await;
                }
            }
        }

        Err(last_error.unwrap())
    }

    async fn call_openai_api(
        &self,
        request: AIRequest,
        api_endpoint: &str,
        api_key: &str,
    ) -> Result<AIResponse, AIError> {
        let mut content = vec![OpenAIContent::Text {
            text: request.prompt,
        }];

        // 如果有图片数据，添加到内容中
        if let Some(image_data) = request.image_data {
            let image_url = if image_data.starts_with("data:") {
                image_data
            } else {
                format!("data:image/jpeg;base64,{}", image_data)
            };

            content.push(OpenAIContent::ImageUrl {
                image_url: OpenAIImageUrl { url: image_url },
            });
        }

        let openai_request = OpenAIRequest {
            model: request.model.clone(),
            messages: vec![OpenAIMessage {
                role: "user".to_string(),
                content,
            }],
            max_tokens: request.max_tokens,
            temperature: request.temperature,
        };

        let url = format!("{}/chat/completions", api_endpoint.trim_end_matches('/'));

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .json(&openai_request)
            .send()
            .await
            .map_err(|e| AIError {
                error_type: "network_error".to_string(),
                message: format!("网络请求失败: {}", e),
                code: None,
            })?;

        let status = response.status();
        let response_text = response.text().await.map_err(|e| AIError {
            error_type: "response_error".to_string(),
            message: format!("读取响应失败: {}", e),
            code: None,
        })?;

        if !status.is_success() {
            // 尝试解析错误响应
            if let Ok(error_response) = serde_json::from_str::<OpenAIErrorResponse>(&response_text) {
                return Err(AIError {
                    error_type: error_response.error.error_type,
                    message: error_response.error.message,
                    code: error_response.error.code,
                });
            } else {
                return Err(AIError {
                    error_type: "api_error".to_string(),
                    message: format!("API 调用失败 ({}): {}", status, response_text),
                    code: Some(status.as_str().to_string()),
                });
            }
        }

        let openai_response: OpenAIResponse = serde_json::from_str(&response_text)
            .map_err(|e| AIError {
                error_type: "parse_error".to_string(),
                message: format!("解析响应失败: {}", e),
                code: None,
            })?;

        if openai_response.choices.is_empty() {
            return Err(AIError {
                error_type: "empty_response".to_string(),
                message: "AI 返回了空响应".to_string(),
                code: None,
            });
        }

        Ok(AIResponse {
            content: openai_response.choices[0].message.content.clone(),
            tokens_used: openai_response.usage.total_tokens,
            model: request.model,
            finish_reason: openai_response.choices[0].finish_reason.clone(),
        })
    }
}

// 图片处理相关的辅助函数
pub fn extract_image_base64(data_url: &str) -> Result<String, String> {
    if let Some(comma_pos) = data_url.find(',') {
        Ok(data_url[comma_pos + 1..].to_string())
    } else {
        Err("无效的图片数据格式".to_string())
    }
}

pub fn create_image_processing_prompt(user_prompt: &str, style: Option<&str>) -> String {
    let base_prompt = "请根据用户的要求处理这张图片。";
    
    let style_prompt = if let Some(style) = style {
        format!("应用 {} 风格。", style)
    } else {
        String::new()
    };

    format!("{} {} 用户要求: {}", base_prompt, style_prompt, user_prompt)
}

// 判断是否应该重试的辅助函数
fn should_not_retry(error: &AIError) -> bool {
    matches!(error.error_type.as_str(), 
        "auth_error" | "quota_error" | "image_error" | "parse_error"
    )
}

// 计算延迟时间的辅助函数
fn calculate_delay(attempt: u32, config: &RetryConfig) -> u64 {
    let delay = (config.base_delay_ms as f64) * config.backoff_factor.powi(attempt as i32);
    (delay as u64).min(config.max_delay_ms)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_image_base64() {
        let data_url = "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
        let result = extract_image_base64(data_url).unwrap();
        assert_eq!(result, "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==");
    }

    #[test]
    fn test_create_image_processing_prompt() {
        let prompt = create_image_processing_prompt("让图片更亮一些", Some("复古"));
        assert!(prompt.contains("复古"));
        assert!(prompt.contains("让图片更亮一些"));
    }
}