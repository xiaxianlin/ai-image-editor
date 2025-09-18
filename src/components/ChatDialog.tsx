import { useRef, useEffect } from 'react'
import { useEditorStore, type StylePreset } from '@/store/editor'
import { useGalleryStore } from '@/store/gallery'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Send, Trash2, User, Bot, Palette, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import StyleSelectionModalWithCallback from './StyleSelectionModalWithCallback'

export default function ChatDialog() {
  const {
    messages,
    currentInput,
    setCurrentInput,
    addMessage,
    clearMessages,
    originalImage,
    selectedStyle,
    setProcessedImage
  } = useEditorStore()
  
  const { addImageToHistory } = useGalleryStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!currentInput.trim()) return

    // 添加用户消息
    addMessage({
      role: 'user',
      content: currentInput
    })

    // 如果有原图，模拟图片处理
    if (originalImage) {
      // 模拟 AI 回复和图片处理
      setTimeout(() => {
        // 生成模拟的处理后图片（实际应用中这里会调用AI API）
        const processedImageUrl = generateMockProcessedImage()
        setProcessedImage(processedImageUrl)
        
        // 保存到图库
        const imageMetadata = extractImageMetadata(originalImage)
        addImageToHistory({
          originalImage,
          processedImage: processedImageUrl,
          prompt: currentInput,
          style: selectedStyle?.name || '自定义风格',
          tags: extractTagsFromPrompt(currentInput),
          metadata: imageMetadata
        })

        addMessage({
          role: 'assistant',
          content: '图片处理完成！我已经根据您的要求对图片进行了转换。处理后的图片已保存到图库中，您可以在图库页面查看和管理所有历史记录。'
        })
      }, 2000) // 模拟处理时间
    } else {
      // 没有图片时的普通回复
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: '请先上传一张图片，然后我就可以根据您的要求进行处理了。'
        })
      }, 1000)
    }

    setCurrentInput('')
  }

  // 生成模拟的处理后图片
  const generateMockProcessedImage = () => {
    // 这里应该调用实际的AI图片处理API
    // 现在返回一个模拟的处理后图片
    const colors = ['#3373dc', '#10b981', '#f59e4b', '#ef4444', '#8b5cf6', '#06b6d4']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="${randomColor}"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
              font-family="monospace" font-size="16px" fill="white">
          AI Processed
        </text>
      </svg>
    `)}`
  }

  // 从原图提取元数据
  const extractImageMetadata = (imageUrl: string) => {
    // 这里应该从实际图片文件中提取元数据
    // 现在返回模拟数据
    return {
      originalName: `image_${Date.now()}.jpg`,
      originalSize: Math.floor(Math.random() * 3000000) + 1000000, // 1-4MB
      processedSize: Math.floor(Math.random() * 2500000) + 800000, // 0.8-3.3MB
      dimensions: { width: 1024, height: 1024 },
      processingTime: Math.floor(Math.random() * 20) + 10 // 10-30秒
    }
  }

  // 从提示词中提取标签
  const extractTagsFromPrompt = (prompt: string) => {
    const keywords = ['动漫', '水彩', '油画', '素描', '赛博朋克', '复古', '现代', '抽象', '写实', '卡通']
    return keywords.filter(keyword => 
      prompt.toLowerCase().includes(keyword.toLowerCase())
    ).slice(0, 3) // 最多3个标签
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleStyleSelect = (style: StylePreset) => {
    // 将风格的提示词回填到输入框，使用更自然的中文描述
    const stylePrompt = `请将这张图片转换为${style.name}。具体要求：${style.description}。`
    setCurrentInput(stylePrompt)
    
    // 可选：自动聚焦到输入框
    setTimeout(() => {
      const textarea = document.querySelector('textarea')
      if (textarea) {
        textarea.focus()
        // 将光标移到文本末尾
        textarea.setSelectionRange(textarea.value.length, textarea.value.length)
      }
    }, 100)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            AI 对话
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">开始与 AI 对话</p>
                <p className="text-xs mt-1">
                  {originalImage ? '询问关于图片处理的问题' : '上传图片后开始对话'}
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={cn(
                    "text-xs mt-1 opacity-70",
                    message.role === 'user' ? 'text-primary-foreground' : 'text-gray-500'
                  )}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 当前选择的风格显示 */}
        {selectedStyle && (
          <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                当前风格：<strong>{selectedStyle.name}</strong>
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                已选择
              </Badge>
            </div>
          </div>
        )}

        {/* 输入区域 */}
        <div className="flex-shrink-0 space-y-2">
          <Textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              originalImage 
                ? "询问关于图片处理的问题，或点击'选择风格'快速生成提示词..."
                : "请先上传图片，然后开始对话..."
            }
            disabled={!originalImage}
            rows={3}
            className="resize-none"
          />
          
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              按 Enter 发送，Shift + Enter 换行
            </p>
            <div className="flex items-center gap-2">
              <StyleSelectionModalWithCallback onStyleSelect={handleStyleSelect}>
                <Button variant="outline" size="sm">
                  <Palette className="h-4 w-4 mr-1" />
                  选择风格
                </Button>
              </StyleSelectionModalWithCallback>
              <Button
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || !originalImage}
                size="sm"
              >
                <Send className="h-4 w-4 mr-1" />
                发送
              </Button>
            </div>
          </div>
        </div>

        {/* 快捷问题 */}
        {originalImage && messages.length === 0 && (
          <div className="flex-shrink-0 space-y-2">
            <p className="text-xs text-gray-500">快捷问题：</p>
            <div className="flex flex-wrap gap-2">
              {[
                "这张图片适合什么风格？",
                "如何提升图片质量？",
                "推荐一些艺术风格",
                "如何调整色彩？"
              ].map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentInput(question)}
                  className="text-xs"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}