import { invoke } from '@tauri-apps/api/core'

// 数据类型定义
export interface ImageHistory {
  id: string
  original_image: string
  processed_image: string
  prompt: string
  style: string
  created_at: number
  tags: string // JSON string
  original_name?: string
  original_size?: number
  processed_size?: number
  width?: number
  height?: number
  processing_time?: number
}

export interface CustomStyle {
  id: string
  name: string
  description: string
  prompt: string
  tags: string // JSON string
  created_at: number
  is_favorite: boolean
  category?: string
}

export interface AppSettings {
  id: number
  api_endpoint: string
  api_key: string
  model: string
  updated_at: number
}

// 图片历史 API
export const imageHistoryAPI = {
  async add(image: Omit<ImageHistory, 'id' | 'created_at' | 'tags'> & { tags: string[] }): Promise<void> {
    const imageData: ImageHistory = {
      ...image,
      id: Date.now().toString(),
      created_at: Date.now(),
      tags: JSON.stringify(image.tags)
    }
    return invoke('add_image_to_history', { image: imageData })
  },

  async getAll(): Promise<ImageHistory[]> {
    const images = await invoke<ImageHistory[]>('get_image_history')
    return images.map(image => ({
      ...image,
      tags: JSON.parse(image.tags || '[]')
    })) as any
  },

  async delete(id: string): Promise<void> {
    return invoke('delete_image_from_history', { id })
  },

  async clear(): Promise<void> {
    return invoke('clear_image_history')
  }
}

// 自定义风格 API
export const customStyleAPI = {
  async add(style: Omit<CustomStyle, 'id' | 'created_at' | 'tags'> & { tags: string[] }): Promise<void> {
    const styleData: CustomStyle = {
      ...style,
      id: Date.now().toString(),
      created_at: Date.now(),
      tags: JSON.stringify(style.tags)
    }
    return invoke('add_custom_style', { style: styleData })
  },

  async getAll(): Promise<CustomStyle[]> {
    const styles = await invoke<CustomStyle[]>('get_custom_styles')
    return styles.map(style => ({
      ...style,
      tags: JSON.parse(style.tags || '[]')
    })) as any
  },

  async update(style: Omit<CustomStyle, 'tags'> & { tags: string[] }): Promise<void> {
    const styleData: CustomStyle = {
      ...style,
      tags: JSON.stringify(style.tags)
    }
    return invoke('update_custom_style', { style: styleData })
  },

  async delete(id: string): Promise<void> {
    return invoke('delete_custom_style', { id })
  }
}

// 应用设置 API
export const settingsAPI = {
  async get(): Promise<AppSettings | null> {
    return invoke<AppSettings | null>('get_app_settings')
  },

  async save(settings: Omit<AppSettings, 'id' | 'updated_at'>): Promise<void> {
    const settingsData: AppSettings = {
      ...settings,
      id: 1,
      updated_at: Date.now()
    }
    return invoke('save_app_settings', { settings: settingsData })
  }
}