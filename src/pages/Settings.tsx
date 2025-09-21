import { useState, useEffect, useCallback } from 'react'
import { useSettingsStore } from '@/store/settings'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings as SettingsIcon, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import TokenStats from '@/components/TokenStats'

// 防抖函数
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise((resolve) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => resolve(func(...args)), waitFor)
    })
}

export default function Settings() {
  usePageTitle("设置")
  const {
    apiEndpoint,
    apiKey,
    model,
    loadSettings,
    setApiEndpoint,
    setApiKey,
    setModel,
    saveSettings
  } = useSettingsStore()

  const [showApiKey, setShowApiKey] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState('')

  // 加载设置
  useEffect(() => {
    loadSettings()
  }, [])

  // 自动保存函数（防抖）
  const autoSave = useCallback(
    debounce(async () => {
      setSaveStatus('saving')
      setSaveMessage('正在保存...')
      try {
        await saveSettings()
        setSaveStatus('success')
        setSaveMessage('设置已保存')
        // 3秒后隐藏成功提示
        setTimeout(() => {
          setSaveStatus('idle')
          setSaveMessage('')
        }, 3000)
      } catch (error) {
        setSaveStatus('error')
        setSaveMessage('保存失败，请重试')
        // 5秒后隐藏错误提示
        setTimeout(() => {
          setSaveStatus('idle')
          setSaveMessage('')
        }, 5000)
        console.error('Failed to save settings:', error)
      } finally {
        // isSaving 状态由 saveStatus 管理
      }
    }, 1000),
    [saveSettings]
  )

  // 处理输入变化
  const handleApiEndpointChange = (value: string) => {
    setApiEndpoint(value)
    autoSave()
  }

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    autoSave()
  }

  const handleModelChange = (value: string) => {
    setModel(value)
    autoSave()
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">设置</h1>

        {/* 保存状态提示 */}
        <div className="ml-auto flex items-center gap-2">
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm">正在保存...</span>
            </div>
          )}
          {saveStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">设置已保存</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">保存失败</span>
            </div>
          )}
        </div>
      </div>

      {/* 保存状态提示栏 */}
      {saveStatus !== 'idle' && (
        <Alert
          variant={saveStatus === 'success' ? 'default' : saveStatus === 'error' ? 'destructive' : 'default'}
          className="mb-6"
        >
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && (
              <>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <AlertDescription className="text-blue-600">{saveMessage}</AlertDescription>
              </>
            )}
            {saveStatus === 'success' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">{saveMessage}</AlertDescription>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600">{saveMessage}</AlertDescription>
              </>
            )}
          </div>
        </Alert>
      )}

      <div className="space-y-6">
        {/* API 配置 */}
        <Card>
          <CardHeader>
            <CardTitle>API 配置</CardTitle>
            <CardDescription>
              配置 AI 服务的连接信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* API 接口地址 */}
            <div className="space-y-2">
              <Label htmlFor="api-endpoint">API 接口地址</Label>
              <Input
                id="api-endpoint"
                type="url"
                placeholder="输入 API 接口地址"
                value={apiEndpoint}
                onChange={(e) => handleApiEndpointChange(e.target.value)}
              />
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  placeholder="输入 API Key"
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* 模型选择 */}
            <div className="space-y-2">
              <Label htmlFor="model">AI 模型</Label>
              <Input
                id="model"
                type="text"
                placeholder="输入 AI 模型名称"
                value={model}
                onChange={(e) => handleModelChange(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Token 统计 */}
        <TokenStats />

        {/* 设置说明 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>API 接口地址</strong>：AI 服务的基础 URL</p>
            <p>• <strong>API Key</strong>：用于身份验证的密钥，请确保密钥有效且有足够的配额</p>
            <p>• <strong>AI 模型</strong>：输入用于图像处理的 AI 模型名称</p>
            <p>• 设置会自动保存，修改后无需手动点击保存按钮</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}