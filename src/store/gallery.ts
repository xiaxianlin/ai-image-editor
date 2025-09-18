import { create } from 'zustand'
import { imageHistoryAPI } from '@/utils/database'

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

export const useGalleryStore = create<GalleryState>((set, get) => ({
  imageHistory: [],
  isLoading: false,
  
  loadImageHistory: async () => {
    set({ isLoading: true })
    try {
      const images = await imageHistoryAPI.getAll()
      const formattedImages: ImageHistory[] = images.map(img => ({
        id: img.id,
        originalImage: img.original_image,
        processedImage: img.processed_image,
        prompt: img.prompt,
        style: img.style,
        createdAt: img.created_at,
        tags: JSON.parse(img.tags || '[]'),
        metadata: {
          originalName: img.original_name,
          originalSize: img.original_size,
          processedSize: img.processed_size,
          dimensions: img.width && img.height ? { width: img.width, height: img.height } : undefined,
          processingTime: img.processing_time
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
        original_image: image.originalImage,
        processed_image: image.processedImage,
        prompt: image.prompt,
        style: image.style,
        tags: image.tags,
        original_name: image.metadata.originalName,
        original_size: image.metadata.originalSize,
        processed_size: image.metadata.processedSize,
        width: image.metadata.dimensions?.width,
        height: image.metadata.dimensions?.height,
        processing_time: image.metadata.processingTime
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