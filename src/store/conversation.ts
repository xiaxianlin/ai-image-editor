import { create } from 'zustand'
import { Message, Conversation, estimateTokens } from '@/types/conversation'
import { settingAPI } from '@/utils/backend-api'

interface ConversationState {
  // 当前对话（仅本地状态）
  currentConversation: Conversation | null
  conversations: Conversation[]

  // Token 统计（从后端获取）
  tokenStats: {
    today: number
    thisMonth: number
    total: number
    cost: number
  }

  // 加载状态
  isLoading: boolean

  // 操作方法（仅本地操作，不依赖后端对话功能）
  loadConversations: () => Promise<void>
  createConversation: (imageId?: string) => Promise<string>
  selectConversation: (id: string) => Promise<void>
  updateConversationTitle: (id: string, title: string) => Promise<void>
  deleteConversation: (id: string) => Promise<void>

  // 消息操作（仅本地）
  sendMessage: (content: string) => Promise<void>
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>

  // Token 统计（从后端获取）
  updateTokenUsage: (inputTokens: number, outputTokens: number, model: string) => Promise<void>
  loadTokenStats: () => Promise<void>
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  currentConversation: null,
  conversations: [],
  tokenStats: {
    today: 0,
    thisMonth: 0,
    total: 0,
    cost: 0
  },
  isLoading: false,

  loadConversations: async () => {
    set({ isLoading: true })
    try {
      // 新的后端没有对话功能，使用空数组
      set({ conversations: [] })
    } catch (error) {
      console.error('Failed to load conversations:', error)
      set({ conversations: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  createConversation: async (imageId?: string) => {
    const now = Date.now()
    const conversationId = `conv_${now}`

    const conversation: Conversation = {
      id: conversationId,
      title: '新对话',
      created_at: now,
      updated_at: now,
      image_id: imageId,
      total_input_tokens: 0,
      total_output_tokens: 0,
      total_tokens: 0,
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 2048,
      system_prompt: '你是一个专业的AI图片编辑助手，帮助用户处理和编辑图片。',
      messages: []
    }

    try {
      set(state => ({
        conversations: [conversation, ...state.conversations],
        currentConversation: conversation
      }))
      return conversationId
    } catch (error) {
      console.error('Failed to create conversation:', error)
      throw error
    }
  },

  selectConversation: async (id: string) => {
    const { conversations } = get()
    const conversation = conversations.find(c => c.id === id)

    if (conversation) {
      // 新的后端没有消息存储功能，直接使用本地消息
      set({
        currentConversation: {
          ...conversation,
          messages: conversation.messages || []
        }
      })
    }
  },

  updateConversationTitle: async (id: string, title: string) => {
    const { conversations, currentConversation } = get()
    const conversation = conversations.find(c => c.id === id)

    if (conversation) {
      const updatedConversation = {
        ...conversation,
        title,
        updated_at: Date.now()
      }

      try {
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === id ? updatedConversation : c
          ),
          currentConversation: currentConversation?.id === id ?
            { ...currentConversation, title } : currentConversation
        }))
      } catch (error) {
        console.error('Failed to update conversation title:', error)
      }
    }
  },

  deleteConversation: async (id: string) => {
    try {
      set(state => ({
        conversations: state.conversations.filter(c => c.id !== id),
        currentConversation: state.currentConversation?.id === id ? null : state.currentConversation
      }))
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  },

  sendMessage: async (content: string) => {
    const { currentConversation } = get()
    if (!currentConversation) return

    const now = Date.now()
    const messageId = `msg_${now}`

    // 估算输入 tokens
    const inputTokens = estimateTokens(content)

    // 添加用户消息（仅本地）
    const userMessage: Message = {
      id: messageId,
      role: 'user',
      content,
      timestamp: now,
      tokens: {
        input: inputTokens,
        output: 0,
        total: inputTokens
      }
    }

    try {
      // 模拟 AI 回复
      setTimeout(async () => {
        const aiResponse = '我已经收到您的消息。这是一个模拟回复，实际使用时会调用真实的AI API来生成回复。'
        const outputTokens = estimateTokens(aiResponse)
        const processingTime = Math.random() * 3 + 1 // 1-4秒

        const aiMessage: Message = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: aiResponse,
          timestamp: Date.now(),
          tokens: {
            input: 0,
            output: outputTokens,
            total: outputTokens
          },
          metadata: {
            model: currentConversation.model,
            processing_time: processingTime
          }
        }

        // 更新对话的 token 统计（仅本地）
        const updatedConversation = {
          ...currentConversation,
          total_input_tokens: currentConversation.total_input_tokens + inputTokens,
          total_output_tokens: currentConversation.total_output_tokens + outputTokens,
          total_tokens: currentConversation.total_tokens + inputTokens + outputTokens,
          updated_at: Date.now(),
          messages: [...(currentConversation.messages || []), aiMessage]
        }

        // 更新全局 token 统计
        await get().updateTokenUsage(inputTokens, outputTokens, currentConversation.model)

        // 更新当前对话
        set(() => ({
          currentConversation: updatedConversation
        }))
      }, 1000)

      // 立即更新 UI 显示用户消息
      set(state => ({
        currentConversation: state.currentConversation ? {
          ...state.currentConversation,
          messages: [...(state.currentConversation.messages || []), userMessage]
        } : null
      }))

    } catch (error) {
      console.error('Failed to send message:', error)
    }
  },

  addMessage: async (message: Omit<Message, 'id' | 'timestamp'>) => {
    const messageId = `msg_${Date.now()}`
    const fullMessage: Message = {
      ...message,
      id: messageId,
      timestamp: Date.now()
    }

    try {
      // 仅本地添加消息
      set(state => ({
        currentConversation: state.currentConversation ? {
          ...state.currentConversation,
          messages: [...(state.currentConversation.messages || []), fullMessage]
        } : null
      }))
    } catch (error) {
      console.error('Failed to add message:', error)
    }
  },

  updateTokenUsage: async (_inputTokens: number, _outputTokens: number, _model: string) => {
    // 使用新的后端API更新token统计
    try {
      // 重新加载token统计
      await get().loadTokenStats()
    } catch (error) {
      console.error('Failed to update token usage:', error)
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