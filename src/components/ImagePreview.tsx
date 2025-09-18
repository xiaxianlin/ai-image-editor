import { useState } from 'react'
import { useEditorStore } from '@/store/editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  X, 
  Download, 
  ZoomIn, 
  ArrowLeftRight,
  Upload,
  Image as ImageIcon 
} from 'lucide-react'

export default function ImagePreview() {
  const { 
    originalImage, 
    processedImage, 
    setOriginalImage, 
    setProcessedImage 
  } = useEditorStore()

  const [imageInfo, setImageInfo] = useState<{
    name?: string
    size?: number
    dimensions?: { width: number; height: number }
  }>({})

  const clearImage = () => {
    setOriginalImage(null)
    setProcessedImage(null)
    setImageInfo({})
  }

  const downloadImage = (imageData: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageData
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!originalImage) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">请先上传图片</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 原图显示 */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">原图</CardTitle>
            <div className="flex items-center gap-2">
              {/* 重新上传按钮 */}
              <Button
                variant="outline"
                size="icon"
                onClick={clearImage}
                className="h-8 w-8"
                title="重新上传"
              >
                <Upload className="h-4 w-4" />
              </Button>

              {/* 对比按钮 */}
              {processedImage && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8" title="对比图片">
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>图片对比</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 原图 */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-center">原图</h3>
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={originalImage}
                            alt="原图"
                            className="w-full h-auto"
                          />
                        </div>
                      </div>
                      {/* 处理结果 */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-center">处理结果</h3>
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={processedImage}
                            alt="处理结果"
                            className="w-full h-auto"
                          />
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={clearImage}
                className="h-8 w-8"
                title="清除图片"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
          {/* 图片信息 */}
          {imageInfo.name && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{imageInfo.name}</Badge>
                {imageInfo.size && (
                  <Badge variant="outline">{formatFileSize(imageInfo.size)}</Badge>
                )}
                {imageInfo.dimensions && (
                  <Badge variant="outline">
                    {imageInfo.dimensions.width} × {imageInfo.dimensions.height}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* 图片预览 */}
          <div className="relative group flex-1 flex items-center justify-center min-h-0">
            <img
              src={originalImage}
              alt="原图"
              className="w-full h-auto rounded-lg max-h-full object-contain border"
            />
            
            {/* 悬浮操作按钮 */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" variant="secondary" className="h-8 w-8">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle>原图预览</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-center">
                    <img
                      src={originalImage}
                      alt="原图预览"
                      className="max-w-full h-auto"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 处理后的图片 */}
      {processedImage && (
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">处理结果</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => downloadImage(processedImage, 'processed-image.png')}
                className="h-8 w-8"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="relative group flex-1 flex items-center justify-center min-h-0">
              <img
                src={processedImage}
                alt="处理结果"
                className="w-full h-auto rounded-lg max-h-full object-contain border"
              />
              
              {/* 悬浮操作按钮 */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>处理结果预览</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center">
                      <img
                        src={processedImage}
                        alt="处理结果预览"
                        className="max-w-full h-auto"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}