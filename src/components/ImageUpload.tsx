import { useCallback, useState } from 'react'
import { useEditorStore } from '@/store/editor'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Image as ImageIcon } from 'lucide-react'

export default function ImageUploadOnly() {
  const { 
    originalImage, 
    setOriginalImage, 
    setProcessedImage 
  } = useEditorStore()

  const [imageInfo, setImageInfo] = useState<{
    name?: string
    size?: number
    dimensions?: { width: number; height: number }
  }>({})

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setOriginalImage(result)
        setProcessedImage(null) // 清除之前的处理结果
        
        // 获取图片信息
        const img = new Image()
        img.onload = () => {
          setImageInfo({
            name: file.name,
            size: file.size,
            dimensions: { width: img.width, height: img.height }
          })
        }
        img.src = result
      }
      reader.readAsDataURL(file)
    }
  }, [setOriginalImage, setProcessedImage])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setOriginalImage(result)
        setProcessedImage(null)
        
        // 获取图片信息
        const img = new Image()
        img.onload = () => {
          setImageInfo({
            name: file.name,
            size: file.size,
            dimensions: { width: img.width, height: img.height }
          })
        }
        img.src = result
      }
      reader.readAsDataURL(file)
    }
  }, [setOriginalImage, setProcessedImage])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="h-full flex flex-col">
      {!originalImage ? (
        <Card className="h-full flex flex-col">
          <CardContent className="flex-1 flex items-center justify-center p-6">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer w-full"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                上传图片
              </p>
              <p className="text-sm text-gray-500 mb-4">
                拖拽图片到此处，或点击选择文件
              </p>
              <p className="text-xs text-gray-400">
                支持 JPG、PNG、GIF 等格式
              </p>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="h-full flex flex-col">
          <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <ImageIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-green-800 mb-2">图片上传成功</h3>
                <p className="text-sm text-green-600 mb-4">
                  {imageInfo.name && `文件名：${imageInfo.name}`}
                </p>
                {imageInfo.size && imageInfo.dimensions && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>大小：{formatFileSize(imageInfo.size)}</p>
                    <p>尺寸：{imageInfo.dimensions.width} × {imageInfo.dimensions.height}</p>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload-new')?.click()}
                className="mt-4"
              >
                <Upload className="h-4 w-4 mr-2" />
                重新上传
              </Button>
              <input
                id="file-upload-new"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}