use tauri::State;
use std::sync::Mutex;
use uuid::Uuid;
use chrono::Utc;

use crate::database::{Database, Gallery, Message};
use crate::ai::service::AIService;
use crate::style::service::StyleService;

use super::api::{ImageEditRequest, ImageEditResponse, StyleGenerateRequest, StyleGenerateResponse};

type DatabaseState = Mutex<Database>;

pub struct GalleryService {
    ai_service: AIService,
    #[allow(dead_code)]
    style_service: StyleService,
}

impl GalleryService {
    pub fn new() -> Self {
        Self {
            ai_service: AIService::new(),
            style_service: StyleService::new(),
        }
    }

    /// 图片编辑服务
    pub async fn edit_image(
        &self,
        db: State<'_, DatabaseState>,
        request: ImageEditRequest,
    ) -> Result<ImageEditResponse, String> {
        // 1. 创建图库记录和保存用户消息（不持有MutexGuard跨越await）
        let (gallery_id, setting, style_prompt) = {
            let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;

            let gallery_id = Uuid::new_v4().to_string();
            let gallery = Gallery {
                id: gallery_id.clone(),
                origin_image: request.origin_image.clone(),
                effect_image: request.origin_image.clone(), // 初始时原图和效果图相同
                total_input_tokens: 0,
                total_ouput_tokens: 0,
                create_at: Utc::now().timestamp_millis(),
            };

            db.gallery().create(&gallery)
                .map_err(|e| format!("Failed to create gallery: {}", e))?;

            // 保存用户消息
            let user_message = Message {
                id: Uuid::new_v4().to_string(),
                gallery_id: gallery_id.clone(),
                role: "user".to_string(),
                content: request.prompt.clone(),
                create_at: Utc::now().timestamp_millis(),
            };

            db.message().create(&user_message)
                .map_err(|e| format!("Failed to create message: {}", e))?;

            // 获取AI服务配置
            let setting = db.setting().get_or_create_default()
                .map_err(|e| format!("Failed to get settings: {}", e))?;

            if setting.api_key.is_empty() {
                return Err("请先配置API密钥".to_string());
            }

            // 获取风格配置
            let style_prompt = if let Some(style_name) = &request.style_name {
                match db.style().get_by_name(style_name) {
                    Ok(Some(style)) => Some(style.prompt),
                    Ok(None) => None,
                    Err(e) => return Err(format!("Failed to get style: {}", e)),
                }
            } else {
                None
            };

            (gallery_id, setting, style_prompt)
        };

        // 2. 调用AI服务处理图片
        let ai_response = self.ai_service.process_image(
            request.prompt.clone(),
            request.origin_image.clone(),
            setting.api_url,
            setting.api_key,
            setting.model,
            style_prompt,
        ).await.map_err(|e| format!("AI processing failed: {}", e))?;

        // 3. 保存处理后的图片（这里使用模拟数据，实际应该从AI响应中获取）
        let effect_image = self.generate_mock_processed_image(&ai_response.content)?;

        // 4. 保存AI消息和更新图库记录
        {
            let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;

            // 保存AI消息
            let ai_message = Message {
                id: Uuid::new_v4().to_string(),
                gallery_id: gallery_id.clone(),
                role: "assistant".to_string(),
                content: ai_response.content.clone(),
                create_at: Utc::now().timestamp_millis(),
            };

            db.message().create(&ai_message)
                .map_err(|e| format!("Failed to create AI message: {}", e))?;

            // 更新图库记录
            let updated_gallery = Gallery {
                id: gallery_id.clone(),
                origin_image: request.origin_image,
                effect_image: effect_image.clone(),
                total_input_tokens: 0, // 应该从AI响应中获取
                total_ouput_tokens: ai_response.tokens_used as i64,
                create_at: Utc::now().timestamp_millis(), // This will be fixed below
            };

            db.gallery().update(&updated_gallery)
                .map_err(|e| format!("Failed to update gallery: {}", e))?;
        }

        Ok(ImageEditResponse {
            success: true,
            effect_image: Some(effect_image),
            gallery_id,
            message: "图片编辑完成".to_string(),
        })
    }

    /// 根据消息内容生成风格
    pub async fn generate_style_from_message(
        &self,
        db: State<'_, DatabaseState>,
        request: StyleGenerateRequest,
    ) -> Result<StyleGenerateResponse, String> {
        // 获取设置信息（不持有MutexGuard跨越await）
        let (api_url, api_key, model) = {
            let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
            let setting = db.setting().get_or_create_default()
                .map_err(|e| format!("Failed to get settings: {}", e))?;

            if setting.api_key.is_empty() {
                return Err("请先配置API密钥".to_string());
            }

            (setting.api_url, setting.api_key, setting.model)
        };

        // 使用AI服务分析消息内容并生成风格
        let style_generation = self.ai_service.generate_style_from_content(
            request.message_content.clone(),
            api_url,
            api_key,
            model,
        ).await.map_err(|e| format!("Style generation failed: {}", e))?;

        Ok(StyleGenerateResponse {
            success: true,
            style_name: Some(style_generation.name),
            style_prompt: Some(style_generation.prompt),
            message: "风格生成完成".to_string(),
        })
    }

    /// 生成模拟的处理后图片
    fn generate_mock_processed_image(&self,
        _ai_content: &str
    ) -> Result<String, String> {
        // 这里应该根据AI返回的内容生成实际的图片数据
        // 现在返回一个模拟的SVG图片
        let svg_content = "<svg width='400' height='400' xmlns='http://www.w3.org/2000/svg'>\
                <rect width='400' height='400' fill='#3373dc'/>\
                <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'\
                      font-family='monospace' font-size='16px' fill='white'>\
                    AI Processed\
                </text>\
            </svg>";

        Ok(format!("data:image/svg+xml;base64,{}",
            base64::Engine::encode(&base64::engine::general_purpose::STANDARD, svg_content)))
    }
}