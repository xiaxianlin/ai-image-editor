import { useState, useEffect } from 'react'
import { useSettingsStore } from '@/store/settings'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings as SettingsIcon, Save, RotateCcw, Eye, EyeOff } from 'lucide-react'
import TokenStats from '@/components/TokenStats'

export default function Settings() {
  usePageTitle("设置")
  const {
    apiEndpoint,
    apiKey,
    model,
    availableModels,
    loadSettings,
    setApiEndpoint,
    setApiKey,
    setModel,
    saveSettings,
    resetSettings
  } = useSettingsStore()

  useEffect(() => {
    loadSettings()
  }, [])

  const [showApiKey, setShowApiKey] = useState(false)
  const [tempSettings, setTempSettings] = useState({
    apiEndpoint,
    apiKey,
    model
  })

  const handleSave = async () => {
    setApiEndpoint(tempSettings.apiEndpoint)
    setApiKey(tempSettings.apiKey)
    setModel(tempSettings.model)
    await saveSettings()
  }

  const handleReset = () => {
    resetSettings()
    setTempSettings({
      apiEndpoint: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4-vision-preview'
    })
  }

  const hasChanges = 
    tempSettings.apiEndpoint !== apiEndpoint ||
    tempSettings.apiKey !== apiKey ||
    tempSettings.model !== model

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">设置</h1>
      </div>

      <div className="space-y-6">
        {/* API 配置 */}
        <Card>
          <CardHeader>
            <CardTitle>API 配置</CardTitle>
            <CardDescription>
              配置 AI 服务的 API 接口和认证信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* API 接口地址 */}
            <div className="space-y-2">
              <Label htmlFor="api-endpoint">API 接口地址</Label>
              <Input
                id="api-endpoint"
                type="url"
                placeholder="https://api.openai.com/v1"
                value={tempSettings.apiEndpoint}
                onChange={(e) => setTempSettings(prev => ({
                  ...prev,
                  apiEndpoint: e.target.value
                }))}
              />
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  placeholder="输入你的 API Key"
                  value={tempSettings.apiKey}
                  onChange={(e) => setTempSettings(prev => ({
                    ...prev,
                    apiKey: e.target.value
                  }))}
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
              <Select
                value={tempSettings.model}
                onValueChange={(value) => setTempSettings(prev => ({
                  ...prev,
                  model: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择 AI 模型" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((modelOption) => (
                    <SelectItem key={modelOption} value={modelOption}>
                      {modelOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            重置设置
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            保存设置
          </Button>
        </div>

        {/* Token 统计 */}
        <TokenStats />

        {/* 设置说明 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>API 接口地址</strong>：AI 服务的基础 URL，默认为 OpenAI 官方接口</p>
            <p>• <strong>API Key</strong>：用于身份验证的密钥，请确保密钥有效且有足够的配额</p>
            <p>• <strong>AI 模型</strong>：选择用于图像处理的 AI 模型，不同模型有不同的特点和效果</p>
            <p>• 设置会自动保存到本地，下次启动时会自动加载</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}