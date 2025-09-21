import { create } from 'zustand'
import { TokenUsage } from '@/types/conversation'
import { settingAPI } from '@/utils/backend-api'

export interface TokenState {
  tokenUsages: TokenUsage[]
  tokenStats: {
    today: number
    thisMonth: number
    total: number
    cost: number
  }
  isLoading: boolean

  // 操作方法
  loadTokenUsages: (days: number) => Promise<void>
  updateTokenUsage: (inputTokens: number, outputTokens: number, model: string) => Promise<void>
  getTokenUsageByDate: (date: string) => Promise<TokenUsage[]>
  loadTokenStats: () => Promise<void>
}

// API 函数 - 使用新的后端API
const tokenAPI = {
  async getByDate(_date: string): Promise<TokenUsage[]> {
    // 新的后端没有按日期查询token使用的API，返回空数组
    return []
  },

  async getStats(_days: number): Promise<TokenUsage[]> {
    // 新的后端没有token统计API，返回空数组
    return []
  }
}

export const useTokenStore = create<TokenState>((set, _get) => ({
  tokenUsages: [],
  tokenStats: {
    today: 0,
    thisMonth: 0,
    total: 0,
    cost: 0
  },
  isLoading: false,

  loadTokenUsages: async (days: number) => {
    set({ isLoading: true })
    try {
      const usages = await tokenAPI.getStats(days)
      set({ tokenUsages: usages })
    } catch (error) {
      console.error('Failed to load token usages:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  updateTokenUsage: async (inputTokens: number, outputTokens: number, model: string) => {
    // 新的后端没有token使用统计API，直接返回
    console.log('Token usage updated (simulated):', { inputTokens, outputTokens, model })
  },

  getTokenUsageByDate: async (date: string) => {
    try {
      return await tokenAPI.getByDate(date)
    } catch (error) {
      console.error('Failed to get token usage by date:', error)
      return []
    }
  },

  loadTokenStats: async () => {
    // 使用新的后端API获取token统计
    try {
      const dailyUsage = await settingAPI.getDailyTokenUsage()
      const monthlyUsage = await settingAPI.getMonthlyTokenUsage()
      const yearlyUsage = await settingAPI.getYearlyTokenUsage()

      set({
        tokenStats: {
          today: dailyUsage,
          thisMonth: monthlyUsage,
          total: yearlyUsage, // 简化处理，用年度使用量作为总量
          cost: 0 // 新的后端没有成本计算
        }
      })
    } catch (error) {
      console.error('Failed to load token stats:', error)
      // 如果获取失败，使用默认值
      set({
        tokenStats: {
          today: 0,
          thisMonth: 0,
          total: 0,
          cost: 0
        }
      })
    }
  }
}))