import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SettingsState {
  // API 配置
  apiEndpoint: string
  apiKey: string
  model: string
  
  // 可用模型列表
  availableModels: string[]
  
  // 操作方法
  setApiEndpoint: (endpoint: string) => void
  setApiKey: (key: string) => void
  setModel: (model: string) => void
  setAvailableModels: (models: string[]) => void
  resetSettings: () => void
}

const defaultSettings = {
  apiEndpoint: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4-vision-preview',
  availableModels: [
    'gpt-4-vision-preview',
    'gpt-4o',
    'gpt-4o-mini',
    'claude-3-opus',
    'claude-3-sonnet',
    'claude-3-haiku'
  ]
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      setApiEndpoint: (endpoint: string) => 
        set({ apiEndpoint: endpoint }),
      
      setApiKey: (key: string) => 
        set({ apiKey: key }),
      
      setModel: (model: string) => 
        set({ model }),
      
      setAvailableModels: (models: string[]) => 
        set({ availableModels: models }),
      
      resetSettings: () => 
        set(defaultSettings)
    }),
    {
      name: 'ai-image-editor-settings'
    }
  )
)