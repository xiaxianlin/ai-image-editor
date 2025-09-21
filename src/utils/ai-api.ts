import { invoke } from '@tauri-apps/api/core'

export interface AIRequest {
  prompt: string
  imageData?: string
  model: string
  apiEndpoint: string
  apiKey: string
  maxTokens?: number
  temperature?: number
  style?: string
}

export interface AIResponse {
  content: string
  tokensUsed: number
  model: string
  finishReason: string
}

export interface AIError {
  errorType: string
  message: string
  code?: string
}

export class AIAPIError extends Error {
  public errorType: string
  public code?: string

  constructor(error: AIError) {
    super(error.message)
    this.name = 'AIAPIError'
    this.errorType = error.errorType
    this.code = error.code
  }
}

/**
 * 调用 AI API 进行图像处理
 */
export async function callAIAPI(request: AIRequest): Promise<AIResponse> {
  try {
    const response = await invoke<AIResponse>('call_ai_api', {
      prompt: request.prompt,
      imageData: request.imageData,
      model: request.model,
      apiEndpoint: request.apiEndpoint,
      apiKey: request.apiKey,
      maxTokens: request.maxTokens,
      temperature: request.temperature,
      style: request.style,
    })

    return {
      content: response.content,
      tokensUsed: response.tokensUsed,
      model: response.model,
      finishReason: response.finishReason,
    }
  } catch (error: any) {
    // 处理 Tauri 返回的错误
    if (error && typeof error === 'object') {
      throw new AIAPIError({
        errorType: error.errorType || 'unknown_error',
        message: error.message || '未知错误',
        code: error.code,
      })
    }
    
    throw new AIAPIError({
      errorType: 'unknown_error',
      message: error?.toString() || '未知错误',
    })
  }
}

/**
 * 简化的图片编辑工作流程（不依赖对话）
 */
export interface SimpleImageEditRequest {
  image_data: string
  prompt: string
  style?: string
}

export interface SimpleImageEditResponse {
  success: boolean
  processed_image?: string
  image_id: string
  message: string
  ai_response: AIResponse
}

/**
 * 简化的图片编辑工作流程（不依赖对话）
 */
export async function simpleEditImageWorkflow(
  request: SimpleImageEditRequest
): Promise<SimpleImageEditResponse> {
  try {
    const response = await invoke<SimpleImageEditResponse>('simple_edit_image_workflow', {
      image_data: request.image_data,
      prompt: request.prompt,
      style: request.style
    })
    return response
  } catch (error: any) {
    // 处理字符串错误（来自 Rust 的 String 错误）
    if (typeof error === 'string') {
      throw new AIAPIError({
        errorType: 'api_error',
        message: error,
      })
    }

    // 处理对象错误
    if (error && typeof error === 'object') {
      throw new AIAPIError({
        errorType: error.errorType || 'unknown_error',
        message: error.message || '未知错误',
        code: error.code,
      })
    }

    throw new AIAPIError({
      errorType: 'unknown_error',
      message: error?.toString() || '未知错误',
    })
  }
}

/**
 * 从 data URL 中提取 base64 数据
 */
export function extractBase64FromDataURL(dataURL: string): string {
  const commaIndex = dataURL.indexOf(',')
  if (commaIndex === -1) {
    throw new Error('无效的 data URL 格式')
  }
  return dataURL.substring(commaIndex + 1)
}

/**
 * 检查是否为有效的图片 data URL
 */
export function isValidImageDataURL(dataURL: string): boolean {
  return dataURL.startsWith('data:image/') && dataURL.includes('base64,')
}

/**
 * 获取错误的用户友好消息
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AIAPIError) {
    switch (error.errorType) {
      case 'network_error':
        return '网络连接失败，请检查网络设置'
      case 'api_error':
        return `API 调用失败: ${error.message}`
      case 'auth_error':
        return 'API Key 无效或已过期，请检查设置'
      case 'quota_error':
        return 'API 配额已用完，请检查账户余额'
      case 'image_error':
        return '图片格式不支持或数据无效'
      case 'parse_error':
        return 'AI 响应格式错误，请重试'
      case 'empty_response':
        return 'AI 返回了空响应，请重试'
      default:
        return error.message || '未知错误'
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return '发生了未知错误'
}

/**
 * 重试机制的配置
 */
export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
}

/**
 * 带重试机制的 AI API 调用
 */
export async function callAIAPIWithRetry(
  request: AIRequest,
  config: Partial<RetryConfig> = {}
): Promise<AIResponse> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: AIAPIError | undefined

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await callAIAPI(request)
    } catch (error) {
      lastError = error instanceof AIAPIError ? error : new AIAPIError({
        errorType: 'unknown_error',
        message: error?.toString() || '未知错误',
      })

      // 如果是最后一次尝试，直接抛出错误
      if (attempt === retryConfig.maxRetries) {
        break
      }

      // 对于某些错误类型，不进行重试
      if (lastError.errorType === 'auth_error' || 
          lastError.errorType === 'quota_error' ||
          lastError.errorType === 'image_error') {
        break
      }

      // 计算延迟时间
      const delay = Math.min(
        retryConfig.baseDelay * Math.pow(retryConfig.backoffFactor, attempt),
        retryConfig.maxDelay
      )

      console.log(`AI API 调用失败，${delay}ms 后重试 (${attempt + 1}/${retryConfig.maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}