import { create } from 'zustand'
import { settingAPI, SaveSettingRequest, GetSettingResponse } from '@/utils/backend-api'

export interface AppSettings {
  id: number
  api_endpoint: string
  api_key: string
  model: string
  updated_at: number
}

export interface SettingsState {
  // API 配置
  apiEndpoint: string
  apiKey: string
  model: string
  isLoading: boolean

  // 操作方法
  loadSettings: () => Promise<void>
  setApiEndpoint: (endpoint: string) => void
  setApiKey: (key: string) => void
  setModel: (model: string) => void
  saveSettings: () => Promise<void>
}

const defaultSettings = {
  apiEndpoint: '',
  apiKey: '',
  model: ''
}

// API 函数
const settingsAPI = {
  async get(): Promise<AppSettings | null> {
    try {
      const response: GetSettingResponse = await settingAPI.getSetting()
      return {
        id: 1,
        api_endpoint: response.api_url,
        api_key: response.has_api_key ? '***' : '', // 返回掩码的API key
        model: response.model,
        updated_at: Date.now()
      }
    } catch (error) {
      return null
    }
  },

  async save(settings: Omit<AppSettings, 'id' | 'updated_at'>): Promise<void> {
    const request: SaveSettingRequest = {
      api_url: settings.api_endpoint,
      api_key: settings.api_key,
      model: settings.model
    }
    await settingAPI.saveSetting(request)
  }
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
  }
}))