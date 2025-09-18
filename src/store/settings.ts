import { create } from 'zustand'
import { settingsAPI } from '@/utils/database'

export interface SettingsState {
  // API 配置
  apiEndpoint: string
  apiKey: string
  model: string
  isLoading: boolean
  
  // 可用模型列表
  availableModels: string[]
  
  // 操作方法
  loadSettings: () => Promise<void>
  setApiEndpoint: (endpoint: string) => void
  setApiKey: (key: string) => void
  setModel: (model: string) => void
  setAvailableModels: (models: string[]) => void
  saveSettings: () => Promise<void>
  resetSettings: () => Promise<void>
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

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultSettings,
  isLoading: false,
  
  loadSettings: async () => {
    set({ isLoading: true })
    try {
      const settings = await settingsAPI.get()
      if (settings) {
        set({
          apiEndpoint: settings.api_endpoint,
          apiKey: settings.api_key,
          model: settings.model
        })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  setApiEndpoint: (endpoint: string) => set({ apiEndpoint: endpoint }),
  setApiKey: (key: string) => set({ apiKey: key }),
  setModel: (model: string) => set({ model }),
  setAvailableModels: (models: string[]) => set({ availableModels: models }),
  
  saveSettings: async () => {
    const { apiEndpoint, apiKey, model } = get()
    try {
      await settingsAPI.save({
        api_endpoint: apiEndpoint,
        api_key: apiKey,
        model
      })
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  },
  
  resetSettings: async () => {
    set(defaultSettings)
    await get().saveSettings()
  }
}))