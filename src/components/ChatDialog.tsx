import { useRef, useEffect, useState } from 'react'
import { useEditorStore, type StylePreset } from '@/store/editor'
import { useGalleryStore } from '@/store/gallery'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Send, User, Bot, Palette, Check, Plus, BarChart3, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import StyleSelectionModalWithCallback from './StyleSelectionModalWithCallback'
import { TokenUsageDetail } from './TokenStats'
import { simpleEditImageWorkflow, getErrorMessage } from '@/utils/ai-api'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ChatDialog() {
  const {
    originalImage,
    selectedStyle,
    setProcessedImage,
    messages,
    addMessage,
    currentInput,
    setCurrentInput
  } = useEditorStore()

  const { addImageToHistory } = useGalleryStore()

  const [showTokenStats, setShowTokenStats] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // 初始化本地消息（不再使用对话系统）
    if (originalImage && messages.length === 0) {
      // 如果有图片但没有消息，添加欢迎消息
      addMessage({
        role: 'assistant',
        content: '欢迎使用AI图片编辑器！请描述您想要的效果。'
      })
    }
  }, [originalImage])

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isProcessing) return

    setError(null)
    setIsProcessing(true)

    try {
      // 添加用户消息到本地状态（不再使用对话系统）
      addMessage({
        role: 'user',
        content: currentInput
      })

      // 如果有原图，调用简化的 AI API
      if (originalImage) {
        try {
          const aiResponse = await simpleEditImageWorkflow({
            image_data: originalImage,
            prompt: currentInput,
            style: selectedStyle?.name
          })

          // 使用返回的处理后图片
          if (aiResponse.processed_image) {
            setProcessedImage(aiResponse.processed_image)
          }

          // 保存到图库
          const imageMetadata = extractImageMetadata()
          addImageToHistory({
            originalImage,
            processedImage: aiResponse.processed_image || '',
            prompt: currentInput,
            style: selectedStyle?.name || '自定义风格',
            tags: extractTagsFromPrompt(currentInput),
            metadata: {
              ...imageMetadata,
              tokensUsed: aiResponse.ai_response.tokensUsed,
              model: aiResponse.ai_response.model,
            }
          })

          // 添加AI回复到本地消息
          addMessage({
            role: 'assistant',
            content: aiResponse.ai_response.content
          })

          console.log('AI 处理完成:', aiResponse)
        } catch (aiError) {
          console.error('AI 处理失败:', aiError)
          setError(getErrorMessage(aiError))
        }
      }

      setCurrentInput('')
    } catch (error) {
      console.error('发送消息失败:', error)
      setError('发送消息失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  // 从原图提取元数据
  const extractImageMetadata = () => {
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
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTokenStats(!showTokenStats)}
              className="h-8 w-8"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // 清除消息
                messages.length = 0
                setCurrentInput('')
              }}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Token 统计 */}
        {showTokenStats && (
          <div className="mb-4">
            <TokenUsageDetail />
          </div>
        )}

        {/* 错误显示 */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {!messages || messages.length === 0 ? (
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
            onKeyDown={handleKeyPress}
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
                disabled={!currentInput.trim() || !originalImage || isProcessing}
                size="sm"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                {isProcessing ? '处理中...' : '发送'}
              </Button>
            </div>
          </div>
        </div>

        {/* 快捷问题 */}
        {originalImage && (!messages || messages.length === 0) && (
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