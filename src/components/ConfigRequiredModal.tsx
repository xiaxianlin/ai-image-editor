import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Settings } from 'lucide-react'

interface ConfigRequiredModalProps {
  isOpen: boolean
  onClose?: () => void
  errors: string[]
}

export default function ConfigRequiredModal({ isOpen, onClose, errors }: ConfigRequiredModalProps) {
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(false)

  const handleGoToSettings = () => {
    setIsChecking(true)
    // 延迟一下再跳转，给用户反馈
    setTimeout(() => {
      navigate('/settings')
      setIsChecking(false)
    }, 300)
  }

  const getErrorMessage = () => {
    if (errors.length === 0) return '请配置AI服务信息'
    if (errors.length === 1) return errors[0]
    return `发现以下配置问题：${errors.join('、')}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <DialogTitle className="text-xl">
            配置检查失败
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {getErrorMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                需要配置以下信息：
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• API 接口地址 - AI服务的基础URL</li>
                <li>• API Key - 身份验证密钥</li>
                <li>• AI 模型 - 用于图像处理的模型名称</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            onClick={handleGoToSettings}
            disabled={isChecking}
            className="flex-1 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {isChecking ? '跳转中...' : '前往配置'}
          </Button>
        </DialogFooter>

        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            💡 提示：配置信息将保存在本地，下次启动时自动加载
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}