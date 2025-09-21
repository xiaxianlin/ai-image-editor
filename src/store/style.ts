import { create } from 'zustand'
import { styleAPI as backendStyleAPI, CreateStyleRequest, CreateStyleResponse, StyleItem } from '@/utils/backend-api'

export interface Style {
  id: string
  name: string
  description: string
  prompt: string
  tags: string[]
  createdAt: number
  isFavorite: boolean
  category?: string
}

export interface StyleState {
  styles: Style[]
  isLoading: boolean

  // 操作方法
  loadStyles: () => Promise<void>
  addStyle: (style: Omit<Style, 'id' | 'createdAt'>) => Promise<void>
  updateStyle: (style: Omit<Style, 'createdAt'>) => Promise<void>
  deleteStyle: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
}

// API 函数
const styleAPI = {
  async add(style: Omit<Style, 'id' | 'createdAt'>): Promise<void> {
    const request: CreateStyleRequest = {
      name: style.name,
      description: style.description,
      prompt: style.prompt,
      tags: style.tags
    }

    const response: CreateStyleResponse = await backendStyleAPI.addStyle(request)

    if (!response.success) {
      throw new Error(response.message || 'Failed to add style')
    }
  },

  async getAll(): Promise<Style[]> {
    const styles: StyleItem[] = await backendStyleAPI.getAllStyles()
    return styles.map(style => ({
      id: style.id,
      name: style.name,
      description: style.description,
      prompt: style.prompt,
      tags: JSON.parse(style.tags || '[]'),
      createdAt: style.create_at,
      isFavorite: false // 后端没有is_favorite字段，默认为false
    }))
  },

  async update(style: Omit<Style, 'createdAt'>): Promise<void> {
    // 后端没有更新API，这里模拟删除后重新添加
    // 注意：这不是最佳实践，实际应该实现更新API
    await backendStyleAPI.deleteStyle(style.id)

    const request: CreateStyleRequest = {
      name: style.name,
      description: style.description,
      prompt: style.prompt,
      tags: style.tags
    }

    const response: CreateStyleResponse = await backendStyleAPI.addStyle(request)

    if (!response.success) {
      throw new Error(response.message || 'Failed to update style')
    }
  },

  async delete(id: string): Promise<void> {
    await backendStyleAPI.deleteStyle(id)
  }
}

export const useStyleStore = create<StyleState>((set, get) => ({
  styles: [],
  isLoading: false,

  loadStyles: async () => {
    set({ isLoading: true })
    try {
      const styles = await styleAPI.getAll()
      set({ styles: styles })
    } catch (error) {
      console.error('Failed to load custom styles:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  addStyle: async (style) => {
    try {
      await styleAPI.add(style)
      await get().loadStyles()
    } catch (error) {
      console.error('Failed to add custom style:', error)
    }
  },

  updateStyle: async (style) => {
    try {
      await styleAPI.update(style)
      // Reload to get the updated data from backend
      await get().loadStyles()
    } catch (error) {
      console.error('Failed to update custom style:', error)
    }
  },

  deleteStyle: async (id) => {
    try {
      await styleAPI.delete(id)
      set(state => ({
        styles: state.styles.filter(s => s.id !== id)
      }))
    } catch (error) {
      console.error('Failed to delete custom style:', error)
    }
  },

  toggleFavorite: async (id) => {
    const style = get().styles.find(s => s.id === id)
    if (style) {
      await get().updateStyle({
        ...style,
        isFavorite: !style.isFavorite
      })
    }
  }
}))