import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import { Message, DbMessage, Conversation, TokenUsage, estimateTokens, calculateTokenCost } from '@/types/conversation'

interface ConversationState {
  // 当前对话
  currentConversation: Conversation | null
  conversations: Conversation[]
  
  // Token 统计
  tokenStats: {
    today: number
    thisMonth: number
    total: number
    cost: number
  }
  
  // 加载状态
  isLoading: boolean
  
  // 操作方法
  loadConversations: () => Promise<void>
  createConversation: (imageId?: string) => Promise<string>
  selectConversation: (id: string) => Promise<void>
  updateConversationTitle: (id: string, title: string) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  
  // 消息操作
  sendMessage: (content: string) => Promise<void>
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>
  
  // Token 统计
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
      const conversations = await invoke<Conversation[]>('get_conversations')
      set({ conversations })
    } catch (error) {
      console.error('Failed to load conversations:', error)
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
      system_prompt: '你是一个专业的AI图片编辑助手，帮助用户处理和编辑图片。'
    }
    
    try {
      await invoke('create_conversation', { conversation })
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
      try {
        const dbMessages = await invoke<DbMessage[]>('get_messages', { conversationId: id })
        set({
          currentConversation: {
            ...conversation,
            messages: dbMessages.map(msg => ({
              id: msg.id,
              role: msg.role as 'user' | 'assistant' | 'system',
              content: msg.content,
              timestamp: msg.timestamp,
              tokens: msg.input_tokens && msg.output_tokens ? {
                input: msg.input_tokens,
                output: msg.output_tokens,
                total: msg.total_tokens || msg.input_tokens + msg.output_tokens
              } : undefined,
              metadata: {
                model: msg.model,
                processing_time: msg.processing_time
              }
            }))
          }
        })
      } catch (error) {
        console.error('Failed to load messages:', error)
      }
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
        await invoke('update_conversation', { conversation: updatedConversation })
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
      await invoke('delete_conversation', { id })
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
    
    // 添加用户消息
    const userMessage: DbMessage = {
      id: messageId,
      conversation_id: currentConversation.id,
      role: 'user',
      content,
      timestamp: now,
      input_tokens: inputTokens,
      output_tokens: 0,
      total_tokens: inputTokens,
      model: currentConversation.model,
      processing_time: 0
    }
    
    try {
      await invoke('add_message', { message: userMessage })
      
      // 模拟 AI 回复
      setTimeout(async () => {
        const aiResponse = '我已经收到您的消息。这是一个模拟回复，实际使用时会调用真实的AI API来生成回复。'
        const outputTokens = estimateTokens(aiResponse)
        const processingTime = Math.random() * 3 + 1 // 1-4秒
        
        const aiMessage: DbMessage = {
          id: `msg_${Date.now()}`,
          conversation_id: currentConversation.id,
          role: 'assistant',
          content: aiResponse,
          timestamp: Date.now(),
          input_tokens: 0,
          output_tokens: outputTokens,
          total_tokens: outputTokens,
          model: currentConversation.model,
          processing_time: processingTime
        }
        
        await invoke('add_message', { message: aiMessage })
        
        // 更新对话的 token 统计
        const updatedConversation = {
          ...currentConversation,
          total_input_tokens: currentConversation.total_input_tokens + inputTokens,
          total_output_tokens: currentConversation.total_output_tokens + outputTokens,
          total_tokens: currentConversation.total_tokens + inputTokens + outputTokens,
          updated_at: Date.now()
        }
        
        await invoke('update_conversation', { conversation: updatedConversation })
        
        // 更新全局 token 统计
        await get().updateTokenUsage(inputTokens, outputTokens, currentConversation.model)
        
        // 重新加载当前对话
        await get().selectConversation(currentConversation.id)
      }, 1000)
      
      // 立即更新 UI 显示用户消息
      set(state => ({
        currentConversation: state.currentConversation ? {
          ...state.currentConversation,
          messages: [...(state.currentConversation.messages || []), {
            id: messageId,
            role: 'user',
            content,
            timestamp: now,
            tokens: {
              input: inputTokens,
              output: 0,
              total: inputTokens
            }
          }]
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
      await invoke('add_message', { message: fullMessage })
    } catch (error) {
      console.error('Failed to add message:', error)
    }
  },
  
  updateTokenUsage: async (inputTokens: number, outputTokens: number, model: string) => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const cost = calculateTokenCost(inputTokens, outputTokens, model)
    
    const usage: TokenUsage = {
      id: `${today}_${model}`,
      date: today,
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
      cost,
      conversation_count: 1,
      created_at: Date.now()
    }
    
    try {
      await invoke('update_token_usage', { usage })
      await get().loadTokenStats()
    } catch (error) {
      console.error('Failed to update token usage:', error)
    }
  },
  
  loadTokenStats: async () => {
    try {
      const stats = await invoke<TokenUsage[]>('get_token_usage_stats', { days: 30 })
      const today = new Date().toISOString().split('T')[0]
      const thisMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
      
      let todayTokens = 0
      let monthTokens = 0
      let totalTokens = 0
      let totalCost = 0
      
      stats.forEach(usage => {
        totalTokens += usage.total_tokens
        totalCost += usage.cost || 0
        
        if (usage.date === today) {
          todayTokens += usage.total_tokens
        }
        
        if (usage.date.startsWith(thisMonth)) {
          monthTokens += usage.total_tokens
        }
      })
      
      set({
        tokenStats: {
          today: todayTokens,
          thisMonth: monthTokens,
          total: totalTokens,
          cost: totalCost
        }
      })
    } catch (error) {
      console.error('Failed to load token stats:', error)
    }
  }
}))