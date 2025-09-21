import { useState, useEffect } from 'react'
import { useSettingsStore } from '@/store/settings'

export interface ConfigStatus {
  isConfigured: boolean
  isLoading: boolean
  errors: string[]
}

export function useConfigCheck(): ConfigStatus {
  const { apiEndpoint, apiKey, model, loadSettings, isLoading: settingsLoading } = useSettingsStore()
  const [configStatus, setConfigStatus] = useState<ConfigStatus>({
    isConfigured: false,
    isLoading: true,
    errors: []
  })

  useEffect(() => {
    // 加载设置
    loadSettings()
  }, [])

  useEffect(() => {
    if (settingsLoading) {
      setConfigStatus({
        isConfigured: false,
        isLoading: true,
        errors: []
      })
      return
    }

    // 检查配置
    const errors: string[] = []

    if (!apiEndpoint.trim()) {
      errors.push('API接口地址未配置')
    }

    if (!apiKey.trim()) {
      errors.push('API密钥未配置')
    }

    if (!model.trim()) {
      errors.push('AI模型未配置')
    }

    // 如果API接口地址存在，检查格式
    if (apiEndpoint.trim()) {
      try {
        new URL(apiEndpoint)
      } catch {
        errors.push('API接口地址格式不正确')
      }
    }

    setConfigStatus({
      isConfigured: errors.length === 0,
      isLoading: false,
      errors
    })
  }, [apiEndpoint, apiKey, model, settingsLoading])

  return configStatus
}

export default useConfigCheck