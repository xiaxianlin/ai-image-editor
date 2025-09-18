import { useState } from 'react'
import { useEditorStore, defaultStylePresets, type StylePreset } from '@/store/editor'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Palette, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StyleSelectionModalProps {
  children: React.ReactNode
}

export default function StyleSelectionModal({ children }: StyleSelectionModalProps) {
  const [open, setOpen] = useState(false)
  const { selectedStyle, setSelectedStyle } = useEditorStore()

  const handleStyleSelect = (style: StylePreset) => {
    setSelectedStyle(style)
    setOpen(false)
  }

  const clearSelection = () => {
    setSelectedStyle(null)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            选择艺术风格
          </DialogTitle>
          <DialogDescription>
            选择一种预设的艺术风格来转换你的图片，或者清除选择使用自定义提示词
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 当前选择 */}
          {selectedStyle && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">当前选择</h3>
                  <p className="text-sm text-blue-700 mt-1">{selectedStyle.name}</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  已选择
                </Badge>
              </div>
            </div>
          )}

          {/* 风格网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defaultStylePresets.map((style) => (
              <div
                key={style.id}
                className={cn(
                  "relative p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg group",
                  selectedStyle?.id === style.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => handleStyleSelect(style)}
              >
                {/* 选中标识 */}
                {selectedStyle?.id === style.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}

                {/* 风格信息 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{style.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {style.description}
                  </p>
                  
                  {/* 示例标签 */}
                  <div className="flex flex-wrap gap-1">
                    {getStyleTags(style.id).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* 提示词预览 */}
                  <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-500 font-mono">
                    {style.prompt.length > 80 
                      ? `${style.prompt.substring(0, 80)}...` 
                      : style.prompt
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={clearSelection}
              disabled={!selectedStyle}
            >
              清除选择
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button 
                onClick={() => setOpen(false)}
                disabled={!selectedStyle}
              >
                确认选择
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// 为不同风格添加标签
function getStyleTags(styleId: string): string[] {
  const tagMap: Record<string, string[]> = {
    'anime': ['二次元', '动漫', '卡通'],
    'oil-painting': ['古典', '艺术', '质感'],
    'watercolor': ['柔和', '艺术', '水彩'],
    'sketch': ['素描', '黑白', '线条'],
    'cyberpunk': ['科幻', '霓虹', '未来'],
    'vintage': ['复古', '怀旧', '胶片']
  }
  return tagMap[styleId] || []
}