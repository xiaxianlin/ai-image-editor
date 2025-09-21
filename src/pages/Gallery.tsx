import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Images,
  Download,
  Trash2,
  Eye,
  Calendar,
  Clock,
  FileImage
} from 'lucide-react'
import { useGalleryStore, ImageHistory } from '@/store/gallery'

export default function Gallery() {
  const { imageHistory, removeImageFromHistory, loadImageHistory } = useGalleryStore()
  usePageTitle("图库")

  useEffect(() => {
    loadImageHistory()
  }, [])

  const [selectedImage, setSelectedImage] = useState<ImageHistory | null>(null)

  const handleDownload = (image: ImageHistory) => {
    const link = document.createElement('a')
    link.href = image.processedImage
    link.download = `processed_${image.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这张图片吗？')) {
      removeImageFromHistory(id)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '未知'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Images className="h-6 w-6" />
          <h1 className="text-2xl font-bold">图库</h1>
        </div>
        <div className="text-sm text-gray-500">
          共 {imageHistory.length} 张图片
        </div>
      </div>

      {/* 图片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {imageHistory.map((image) => (
          <Card key={image.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base mb-1 truncate">
                    {image.metadata.originalName || '未命名图片'}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {image.prompt.substring(0, 50)}
                    {image.prompt.length > 50 && '...'}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-2 flex-shrink-0">
                  {image.style}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* 图片预览 */}
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.processedImage}
                    alt={image.metadata.originalName || '处理后的图片'}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(image)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* 图片信息 */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>创建时间：{formatDate(image.createdAt)}</span>
                  </div>

                  {image.metadata.processingTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>处理时间：{image.metadata.processingTime.toFixed(1)}秒</span>
                    </div>
                  )}

                  {image.metadata.processedSize && (
                    <div className="flex items-center gap-2">
                      <FileImage className="w-4 h-4" />
                      <span>文件大小：{formatFileSize(image.metadata.processedSize)}</span>
                    </div>
                  )}

                  {image.metadata.tokensUsed && (
                    <div className="flex items-center gap-2">
                      <span>Token用量：{image.metadata.tokensUsed}</span>
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(image)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    下载
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    删除
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 空状态 */}
      {imageHistory.length === 0 && (
        <div className="text-center py-12">
          <Images className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            还没有处理过的图片
          </h3>
          <p className="text-gray-500 mb-4">
            前往编辑器处理一些图片，它们会出现在这里
          </p>
        </div>
      )}

      {/* 图片预览对话框 */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>图片预览</DialogTitle>
              <DialogDescription>
                原始图片与处理后图片对比
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-center">原始图片</p>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedImage.originalImage}
                    alt="原始图片"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-center">处理后图片</p>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedImage.processedImage}
                    alt="处理后图片"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p><strong>处理提示词：</strong> {selectedImage.prompt}</p>
              <p><strong>风格：</strong> {selectedImage.style}</p>
              <p><strong>创建时间：</strong> {formatDate(selectedImage.createdAt)}</p>
              {selectedImage.metadata.processingTime && (
                <p><strong>处理时间：</strong> {selectedImage.metadata.processingTime.toFixed(1)}秒</p>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setSelectedImage(null)}>
                关闭
              </Button>
              <Button onClick={() => handleDownload(selectedImage)}>
                <Download className="w-4 h-4 mr-2" />
                下载处理后图片
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}