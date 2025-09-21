import { invoke } from '@tauri-apps/api/core'

// Gallery API interfaces
export interface ImageEditRequest {
  origin_image: string
  prompt: string
  style_name?: string
}

export interface ImageEditResponse {
  success: boolean
  effect_image?: string
  gallery_id: string
  message: string
}

export interface GalleryItem {
  id: string
  origin_image: string
  effect_image: string
  total_input_tokens: number
  total_ouput_tokens: number
  create_at: number
}

export interface StyleGenerateRequest {
  message_content: string
}

export interface StyleGenerateResponse {
  success: boolean
  style_name?: string
  style_prompt?: string
  message: string
}

// Style API interfaces
export interface StyleItem {
  id: string
  name: string
  description: string
  prompt: string
  tags: string
  create_at: number
  update_at: number
}

export interface CreateStyleRequest {
  name: string
  description: string
  prompt: string
  tags: string[]
}

export interface CreateStyleResponse {
  success: boolean
  style_id: string
  message: string
}

// Setting API interfaces
export interface SaveSettingRequest {
  api_url: string
  api_key: string
  model: string
}

export interface SaveSettingResponse {
  success: boolean
  message: string
}

export interface GetSettingResponse {
  api_url: string
  model: string
  has_api_key: boolean
}

// AI API interfaces
export interface AIProcessRequest {
  prompt: string
  image_data: string
  api_url: string
  api_key: string
  model: string
  style_prompt?: string
}

export interface AIProcessResponse {
  content: string
  tokens_used: number
  model: string
}

export interface StyleGenerationRequest {
  content: string
  api_url: string
  api_key: string
  model: string
}

export interface StyleGenerationResponse {
  name: string
  prompt: string
}

// Gallery API functions
export const galleryAPI = {
  async editImage(request: ImageEditRequest): Promise<ImageEditResponse> {
    return invoke('edit_image', { ...request })
  },

  async getAllImages(): Promise<GalleryItem[]> {
    return invoke('get_all_images')
  },

  async batchDeleteImages(ids: string[]): Promise<void> {
    return invoke('batch_delete_images', { ids })
  },

  async generateStyleFromMessage(request: StyleGenerateRequest): Promise<StyleGenerateResponse> {
    return invoke('generate_style_from_message', { ...request })
  }
}

// Style API functions
export const styleAPI = {
  async getAllStyles(): Promise<StyleItem[]> {
    return invoke('get_all_styles')
  },

  async addStyle(request: CreateStyleRequest): Promise<CreateStyleResponse> {
    const styleData = {
      ...request,
      tags: JSON.stringify(request.tags)
    }
    return invoke('add_style', styleData)
  },

  async deleteStyle(id: string): Promise<void> {
    return invoke('delete_style', { id })
  }
}

// Setting API functions
export const settingAPI = {
  async saveSetting(request: SaveSettingRequest): Promise<SaveSettingResponse> {
    return invoke('save_setting', { ...request })
  },

  async getSetting(): Promise<GetSettingResponse> {
    return invoke('get_setting')
  },

  async getDailyTokenUsage(): Promise<number> {
    return invoke('get_daily_token_usage')
  },

  async getMonthlyTokenUsage(): Promise<number> {
    return invoke('get_monthly_token_usage')
  },

  async getYearlyTokenUsage(): Promise<number> {
    return invoke('get_yearly_token_usage')
  }
}

// AI API functions
export const aiAPI = {
  async processImage(request: AIProcessRequest): Promise<AIProcessResponse> {
    return invoke('process_image', { ...request })
  },

  async generateStyle(request: StyleGenerationRequest): Promise<StyleGenerationResponse> {
    return invoke('generate_style', { ...request })
  }
}

// Error handling
export class BackendAPIError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BackendAPIError'
  }
}

export function handleInvokeError(error: any): never {
  if (typeof error === 'string') {
    throw new BackendAPIError(error)
  } else if (error && typeof error === 'object' && 'message' in error) {
    throw new BackendAPIError(String(error.message))
  } else {
    throw new BackendAPIError('未知错误')
  }
}