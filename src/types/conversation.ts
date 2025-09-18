// 对话相关类型定义

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  tokens?: {
    input: number
    output: number
    total: number
  }
  metadata?: {
    model?: string
    temperature?: number
    max_tokens?: number
    processing_time?: number
  }
}

// 数据库中的消息格式
export interface DbMessage {
  id: string
  conversation_id: string
  role: string
  content: string
  timestamp: number
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  model?: string
  processing_time?: number
}

export interface Conversation {
  id: string
  title: string
  created_at: number
  updated_at: number
  messages?: Message[]
  image_id?: string // 关联的图片ID
  total_input_tokens: number
  total_output_tokens: number
  total_tokens: number
  model: string
  temperature: number
  max_tokens: number
  system_prompt?: string
}

export interface TokenUsage {
  id: string
  date: string // YYYY-MM-DD 格式
  model: string
  input_tokens: number
  output_tokens: number
  total_tokens: number
  cost?: number // 可选的成本计算
  conversation_count: number
  created_at: number
}

export interface TokenStats {
  today: TokenUsage
  this_month: TokenUsage
  total: TokenUsage
  by_model: Record<string, TokenUsage>
  daily_usage: TokenUsage[] // 最近30天的使用情况
}

// Token 计算相关
export interface ModelPricing {
  model: string
  input_price_per_1k: number  // 每1000个输入token的价格
  output_price_per_1k: number // 每1000个输出token的价格
  currency: string
}

// 默认模型定价（示例价格，实际使用时需要更新）
export const DEFAULT_MODEL_PRICING: Record<string, ModelPricing> = {
  'gpt-4o': {
    model: 'gpt-4o',
    input_price_per_1k: 0.005,
    output_price_per_1k: 0.015,
    currency: 'USD'
  },
  'gpt-4o-mini': {
    model: 'gpt-4o-mini',
    input_price_per_1k: 0.00015,
    output_price_per_1k: 0.0006,
    currency: 'USD'
  },
  'gpt-4-vision-preview': {
    model: 'gpt-4-vision-preview',
    input_price_per_1k: 0.01,
    output_price_per_1k: 0.03,
    currency: 'USD'
  },
  'claude-3-opus': {
    model: 'claude-3-opus',
    input_price_per_1k: 0.015,
    output_price_per_1k: 0.075,
    currency: 'USD'
  },
  'claude-3-sonnet': {
    model: 'claude-3-sonnet',
    input_price_per_1k: 0.003,
    output_price_per_1k: 0.015,
    currency: 'USD'
  },
  'claude-3-haiku': {
    model: 'claude-3-haiku',
    input_price_per_1k: 0.00025,
    output_price_per_1k: 0.00125,
    currency: 'USD'
  }
}

// Token 计算工具函数
export function calculateTokenCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  const pricing = DEFAULT_MODEL_PRICING[model]
  if (!pricing) return 0
  
  const inputCost = (inputTokens / 1000) * pricing.input_price_per_1k
  const outputCost = (outputTokens / 1000) * pricing.output_price_per_1k
  
  return inputCost + outputCost
}

// 简单的 token 估算函数（实际应用中应该使用专门的 tokenizer）
export function estimateTokens(text: string): number {
  // 粗略估算：英文约4个字符=1个token，中文约1.5个字符=1个token
  const englishChars = text.match(/[a-zA-Z0-9\s.,!?;:'"()-]/g)?.length || 0
  const chineseChars = text.length - englishChars
  
  return Math.ceil(englishChars / 4 + chineseChars / 1.5)
}