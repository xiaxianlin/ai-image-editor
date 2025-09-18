import { useEditorStore } from '@/store/editor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Palette, Wand2 } from 'lucide-react'
import StyleSelectionModal from './StyleSelectionModal'

export default function StyleSelection() {
  const {
    selectedStyle,
    originalImage,
    isProcessing
  } = useEditorStore()

  const handleProcess = () => {
    if (!originalImage) return
    
    // 这里将来会调用 AI API 处理图片
    console.log('Processing image with:', {
      style: selectedStyle
    })
  }

  const canProcess = originalImage && selectedStyle

  return (
    <div className="space-y-6">
      {/* 快捷风格选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            快捷风格
          </CardTitle>
          <CardDescription>
            选择预设的艺术风格快速转换图片
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 当前选择的风格显示 */}
          {selectedStyle ? (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">{selectedStyle.name}</h3>
                  <p className="text-sm text-blue-700 mt-1">{selectedStyle.description}</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  已选择
                </Badge>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                未选择风格，点击下方按钮选择预设风格
              </p>
            </div>
          )}

          {/* 选择风格按钮 */}
          <StyleSelectionModal>
            <Button variant="outline" className="w-full">
              <Palette className="h-4 w-4 mr-2" />
              {selectedStyle ? '更换风格' : '选择风格'}
            </Button>
          </StyleSelectionModal>
        </CardContent>
      </Card>

      {/* 处理按钮 */}
      <Card>
        <CardContent className="p-4">
          <Button
            onClick={handleProcess}
            disabled={!canProcess || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                处理中...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                开始处理
              </>
            )}
          </Button>
          
          {!originalImage && (
            <p className="text-sm text-gray-500 text-center mt-2">
              请先上传图片
            </p>
          )}
          
          {originalImage && !selectedStyle && (
            <p className="text-sm text-gray-500 text-center mt-2">
              请选择风格
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}