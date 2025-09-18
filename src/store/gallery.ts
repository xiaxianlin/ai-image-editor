import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  }
}

export interface GalleryState {
  imageHistory: ImageHistory[]
  
  // 操作方法
  addImageToHistory: (image: Omit<ImageHistory, 'id' | 'createdAt'>) => void
  removeImageFromHistory: (id: string) => void
  clearHistory: () => void
  getImageById: (id: string) => ImageHistory | undefined
}

export const useGalleryStore = create<GalleryState>()(
  persist(
    (set, get) => ({
      imageHistory: [],
      
      addImageToHistory: (image) => {
        const newImage: ImageHistory = {
          ...image,
          id: Date.now().toString(),
          createdAt: Date.now()
        }
        
        set(state => ({
          imageHistory: [newImage, ...state.imageHistory]
        }))
      },
      
      removeImageFromHistory: (id) => {
        set(state => ({
          imageHistory: state.imageHistory.filter(image => image.id !== id)
        }))
      },
      
      clearHistory: () => {
        set({ imageHistory: [] })
      },
      
      getImageById: (id) => {
        return get().imageHistory.find(image => image.id === id)
      }
    }),
    {
      name: 'gallery-storage',
      version: 1
    }
  )
)