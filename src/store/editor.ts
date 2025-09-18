import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface StylePreset {
  id: string
  name: string
  description: string
  prompt: string
  thumbnail?: string
}

export interface EditorState {
  // 图片相关
  originalImage: string | null
  processedImage: string | null
  isProcessing: boolean
  
  // 聊天对话
  messages: ChatMessage[]
  currentInput: string
  
  // 风格预设
  selectedStyle: StylePreset | null
  customPrompt: string
  
  // 操作方法
  setOriginalImage: (image: string | null) => void
  setProcessedImage: (image: string | null) => void
  setIsProcessing: (processing: boolean) => void
  
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  setCurrentInput: (input: string) => void
  clearMessages: () => void
  
  setSelectedStyle: (style: StylePreset | null) => void
  setCustomPrompt: (prompt: string) => void
  
  resetEditor: () => void
}

const defaultStylePresets: StylePreset[] = [
  {
    id: 'anime',
    name: '动漫风格',
    description: '将图片转换为动漫/二次元风格',
    prompt: 'Convert this image to anime/manga style with vibrant colors and clean lines'
  },
  {
    id: 'oil-painting',
    name: '油画风格',
    description: '模拟传统油画的质感和笔触',
    prompt: 'Transform this image into an oil painting with visible brush strokes and rich textures'
  },
  {
    id: 'watercolor',
    name: '水彩风格',
    description: '创造柔和的水彩画效果',
    prompt: 'Convert this image to watercolor painting style with soft, flowing colors'
  },
  {
    id: 'sketch',
    name: '素描风格',
    description: '转换为黑白素描效果',
    prompt: 'Transform this image into a detailed pencil sketch with shading and texture'
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    description: '未来科技感的霓虹色彩风格',
    prompt: 'Convert this image to cyberpunk style with neon colors and futuristic elements'
  },
  {
    id: 'vintage',
    name: '复古风格',
    description: '怀旧的复古色调和质感',
    prompt: 'Transform this image to vintage style with retro colors and aged texture'
  }
]

export const useEditorStore = create<EditorState>((set) => ({
  // 初始状态
  originalImage: null,
  processedImage: null,
  isProcessing: false,
  
  messages: [],
  currentInput: '',
  
  selectedStyle: null,
  customPrompt: '',
  
  // 图片操作
  setOriginalImage: (image: string | null) => 
    set({ originalImage: image }),
  
  setProcessedImage: (image: string | null) => 
    set({ processedImage: image }),
  
  setIsProcessing: (processing: boolean) => 
    set({ isProcessing: processing }),
  
  // 聊天操作
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now()
    }
    set(state => ({
      messages: [...state.messages, newMessage]
    }))
  },
  
  setCurrentInput: (input: string) => 
    set({ currentInput: input }),
  
  clearMessages: () => 
    set({ messages: [] }),
  
  // 风格操作
  setSelectedStyle: (style: StylePreset | null) => 
    set({ selectedStyle: style }),
  
  setCustomPrompt: (prompt: string) => 
    set({ customPrompt: prompt }),
  
  // 重置
  resetEditor: () => set({
    originalImage: null,
    processedImage: null,
    isProcessing: false,
    messages: [],
    currentInput: '',
    selectedStyle: null,
    customPrompt: ''
  })
}))

// 导出预设风格
export { defaultStylePresets }