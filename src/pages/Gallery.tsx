import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye,
  Calendar,
  Clock,
  FileImage,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { useGalleryStore, ImageHistory } from '@/store/gallery'

export default function Gallery() {
  const { imageHistory, removeImageFromHistory, loadImageHistory } = useGalleryStore()
  usePageTitle("图库")

  useEffect(() => {
    loadImageHistory()
  }, [])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedImage, setSelectedImage] = useState<ImageHistory | null>(null)

  // 过滤和排序逻辑
  const filteredImages = imageHistory
    .filter(image => {
      const matchesSearch = image.metadata.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           image.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           image.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesTag = selectedTag === 'all' || image.tags.includes(selectedTag)
      
      return matchesSearch && matchesTag
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = a.createdAt - b.createdAt
          break
        case 'name':
          comparison = (a.metadata.originalName || '').localeCompare(b.metadata.originalName || '')
          break
        case 'size':
          comparison = (a.metadata.originalSize || 0) - (b.metadata.originalSize || 0)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // 获取所有标签
  const allTags = Array.from(new Set(imageHistory.flatMap(image => image.tags)))

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = (id: string) => {
    removeImageFromHistory(id)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Images className="h-6 w-6" />
          <h1 className="text-2xl font-bold">图库</h1>
          <Badge variant="secondary" className="ml-2">
            {filteredImages.length} 张图片
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 视图模式切换 */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索图片名称、风格、提示词或标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* 过滤和排序 */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            
            {/* 标签筛选 */}
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部标签</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            
            {/* 排序方式 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'size')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">按日期</option>
              <option value="name">按名称</option>
              <option value="size">按大小</option>
            </select>
            
            {/* 排序顺序 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* 图片列表 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <Card key={image.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium truncate">
                      {image.metadata.originalName || `图片 ${image.id}`}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {formatDate(image.createdAt)}
                    </CardDescription>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleDownload(image.processedImage, `processed-${image.metadata.originalName || image.id}.png`)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* 图片预览 */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">原图</p>
                    <img
                      src={image.originalImage}
                      alt="原图"
                      className="w-full h-20 object-cover rounded border cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">处理后</p>
                    <img
                      src={image.processedImage}
                      alt="处理后"
                      className="w-full h-20 object-cover rounded border cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    />
                  </div>
                </div>

                {/* 风格和标签 */}
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    {image.style}
                  </Badge>
                  {image.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {image.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {image.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{image.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* 元数据 */}
                <div className="text-xs text-gray-500 space-y-1">
                  {image.metadata.dimensions && (
                    <div className="flex items-center gap-1">
                      <FileImage className="h-3 w-3" />
                      {image.metadata.dimensions.width} × {image.metadata.dimensions.height}
                    </div>
                  )}
                  {image.metadata.originalSize && (
                    <div>{formatFileSize(image.metadata.originalSize)}</div>
                  )}
                  {image.metadata.processingTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {image.metadata.processingTime}s
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* 列表视图 */
        <div className="space-y-4">
          {filteredImages.map((image) => (
            <Card key={image.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* 图片预览 */}
                  <div className="flex gap-2">
                    <img
                      src={image.originalImage}
                      alt="原图"
                      className="w-16 h-16 object-cover rounded border cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    />
                    <img
                      src={image.processedImage}
                      alt="处理后"
                      className="w-16 h-16 object-cover rounded border cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    />
                  </div>
                  
                  {/* 信息 */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {image.metadata.originalName || `图片 ${image.id}`}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {image.style}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {image.prompt}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(image.createdAt)}
                      </div>
                      {image.metadata.dimensions && (
                        <div className="flex items-center gap-1">
                          <FileImage className="h-3 w-3" />
                          {image.metadata.dimensions.width} × {image.metadata.dimensions.height}
                        </div>
                      )}
                      {image.metadata.originalSize && (
                        <div>{formatFileSize(image.metadata.originalSize)}</div>
                      )}
                      {image.metadata.processingTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {image.metadata.processingTime}s
                        </div>
                      )}
                    </div>
                    
                    {image.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {image.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownload(image.processedImage, `processed-${image.metadata.originalName || image.id}.png`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 详情对话框 */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedImage.metadata.originalName || `图片 ${selectedImage.id}`}
                </DialogTitle>
                <DialogDescription>
                  创建于 {formatDate(selectedImage.createdAt)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* 图片对比 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">原图</h4>
                    <img
                      src={selectedImage.originalImage}
                      alt="原图"
                      className="w-full h-auto rounded-lg border"
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">处理后</h4>
                    <img
                      src={selectedImage.processedImage}
                      alt="处理后"
                      className="w-full h-auto rounded-lg border"
                    />
                  </div>
                </div>
                
                {/* 详细信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">风格和标签</h4>
                      <div className="space-y-2">
                        <Badge variant="outline">{selectedImage.style}</Badge>
                        <div className="flex flex-wrap gap-1">
                          {selectedImage.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">AI 提示词</h4>
                      <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md">
                        {selectedImage.prompt}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">文件信息</h4>
                      <div className="space-y-2 text-sm">
                        {selectedImage.metadata.dimensions && (
                          <div className="flex justify-between">
                            <span>尺寸:</span>
                            <span>{selectedImage.metadata.dimensions.width} × {selectedImage.metadata.dimensions.height}</span>
                          </div>
                        )}
                        {selectedImage.metadata.originalSize && (
                          <div className="flex justify-between">
                            <span>原始大小:</span>
                            <span>{formatFileSize(selectedImage.metadata.originalSize)}</span>
                          </div>
                        )}
                        {selectedImage.metadata.processedSize && (
                          <div className="flex justify-between">
                            <span>处理后大小:</span>
                            <span>{formatFileSize(selectedImage.metadata.processedSize)}</span>
                          </div>
                        )}
                        {selectedImage.metadata.processingTime && (
                          <div className="flex justify-between">
                            <span>处理时间:</span>
                            <span>{selectedImage.metadata.processingTime}秒</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(selectedImage.originalImage, `original-${selectedImage.metadata.originalName || selectedImage.id}.png`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    下载原图
                  </Button>
                  <Button
                    onClick={() => handleDownload(selectedImage.processedImage, `processed-${selectedImage.metadata.originalName || selectedImage.id}.png`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    下载处理后
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 空状态 */}
      {filteredImages.length === 0 && imageHistory.length > 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            没有找到匹配的图片
          </h3>
          <p className="text-gray-500 mb-4">
            尝试调整搜索条件或标签筛选
          </p>
        </div>
      )}

      {imageHistory.length === 0 && (
        <div className="text-center py-12">
          <Images className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            还没有编辑过的图片
          </h3>
          <p className="text-gray-500 mb-4">
            开始编辑图片后，历史记录会显示在这里
          </p>
        </div>
      )}
    </div>
  )
}