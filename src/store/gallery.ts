import { create } from 'zustand'
import { galleryAPI, ImageEditRequest, ImageEditResponse, GalleryItem } from '@/utils/backend-api'

export interface ImageHistory {
  id: string
  originalImage: string
  processedImage: string
  prompt: string
  style: string
  createdAt: number
  tags: string[]
  metadata: {
    originalName?: string
    originalSize?: number
    processedSize?: number
    dimensions?: { width: number; height: number }
    processingTime?: number
    tokensUsed?: number
    model?: string
  }
}

export interface GalleryState {
  imageHistory: ImageHistory[]
  isLoading: boolean

  // 操作方法
  loadImageHistory: () => Promise<void>
  addImageToHistory: (image: Omit<ImageHistory, 'id' | 'createdAt'>) => Promise<void>
  removeImageFromHistory: (id: string) => Promise<void>
  clearHistory: () => Promise<void>
  getImageById: (id: string) => ImageHistory | undefined
}

// API 函数
const imageHistoryAPI = {
  async add(image: Omit<ImageHistory, 'id' | 'createdAt'>): Promise<void> {
    // 使用新的图片编辑API来添加图片历史
    const request: ImageEditRequest = {
      origin_image: image.originalImage,
      prompt: image.prompt,
      style_name: image.style || undefined
    }

    const response: ImageEditResponse = await galleryAPI.editImage(request)

    if (!response.success) {
      throw new Error(response.message || 'Failed to add image to history')
    }
  },

  async getAll(): Promise<GalleryItem[]> {
    const images = await galleryAPI.getAllImages()
    return images.map(image => ({
      ...image,
      tags: [] // 默认空数组，因为后端没有tags字段
    }))
  },

  async delete(id: string): Promise<void> {
    // 使用批量删除API，但只删除一个
    await galleryAPI.batchDeleteImages([id])
  },

  async clear(): Promise<void> {
    // 获取所有图片ID，然后批量删除
    const images = await galleryAPI.getAllImages()
    const ids = images.map(img => img.id)
    if (ids.length > 0) {
      await galleryAPI.batchDeleteImages(ids)
    }
  }
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  imageHistory: [],
  isLoading: false,
  
  loadImageHistory: async () => {
    set({ isLoading: true })
    try {
      const images = await imageHistoryAPI.getAll()
      const formattedImages: ImageHistory[] = images.map(img => ({
        id: img.id,
        originalImage: img.origin_image,
        processedImage: img.effect_image,
        prompt: '', // 后端没有存储prompt，需要从前端获取
        style: '', // 后端没有存储style信息
        createdAt: img.create_at,
        tags: [], // 后端没有tags字段
        metadata: {
          originalName: undefined,
          originalSize: undefined,
          processedSize: undefined,
          dimensions: undefined,
          processingTime: undefined,
          tokensUsed: img.total_input_tokens + img.total_ouput_tokens,
          model: undefined
        }
      }))
      set({ imageHistory: formattedImages })
    } catch (error) {
      console.error('Failed to load image history:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  addImageToHistory: async (image) => {
    try {
      await imageHistoryAPI.add({
        originalImage: image.originalImage,
        processedImage: image.processedImage,
        prompt: image.prompt,
        style: image.style,
        tags: image.tags,
        metadata: {
          originalName: image.metadata.originalName,
          originalSize: image.metadata.originalSize,
          processedSize: image.metadata.processedSize,
          dimensions: image.metadata.dimensions,
          processingTime: image.metadata.processingTime
        }
      })

      // 重新加载数据
      await get().loadImageHistory()
    } catch (error) {
      console.error('Failed to add image to history:', error)
    }
  },
  
  removeImageFromHistory: async (id) => {
    try {
      await imageHistoryAPI.delete(id)
      set(state => ({
        imageHistory: state.imageHistory.filter(image => image.id !== id)
      }))
    } catch (error) {
      console.error('Failed to remove image from history:', error)
    }
  },
  
  clearHistory: async () => {
    try {
      await imageHistoryAPI.clear()
      set({ imageHistory: [] })
    } catch (error) {
      console.error('Failed to clear history:', error)
    }
  },
  
  getImageById: (id) => {
    return get().imageHistory.find(image => image.id === id)
  }
}))