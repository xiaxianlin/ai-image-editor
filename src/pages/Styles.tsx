import { useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Palette,
  Copy,
  Check,
  Search,
  Filter,
  Star,
  StarOff
} from 'lucide-react'

interface CustomStyle {
  id: string
  name: string
  description: string
  prompt: string
  tags: string[]
  createdAt: number
  isFavorite?: boolean
  category?: string
}

export default function Styles() {
  usePageTitle("风格管理")
  const [customStyles, setCustomStyles] = useState<CustomStyle[]>([
    {
      id: '1',
      name: '梦幻水彩',
      description: '柔和的梦幻水彩效果，带有流动的色彩',
      prompt: 'Transform this image into a dreamy watercolor painting with soft, flowing colors and ethereal effects',
      tags: ['水彩', '梦幻', '柔和'],
      createdAt: Date.now() - 86400000,
      isFavorite: true,
      category: '艺术风格'
    },
    {
      id: '2',
      name: '工业朋克',
      description: '带有金属质感和工业元素的朋克风格',
      prompt: 'Convert this image to industrial punk style with metallic textures, gears, and steampunk elements',
      tags: ['朋克', '工业', '金属'],
      createdAt: Date.now() - 172800000,
      isFavorite: false,
      category: '科幻风格'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingStyle, setEditingStyle] = useState<CustomStyle | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompt: '',
    tags: '',
    category: '艺术风格'
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      prompt: '',
      tags: '',
      category: '艺术风格'
    })
  }

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.prompt.trim()) return

    const newStyle: CustomStyle = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      prompt: formData.prompt.trim(),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: Date.now(),
      isFavorite: false,
      category: formData.category
    }

    setCustomStyles(prev => [newStyle, ...prev])
    resetForm()
    setIsCreateDialogOpen(false)
  }

  const handleEdit = (style: CustomStyle) => {
    setEditingStyle(style)
    setFormData({
      name: style.name,
      description: style.description,
      prompt: style.prompt,
      tags: style.tags.join(', '),
      category: style.category || '艺术风格'
    })
  }

  const handleUpdate = () => {
    if (!editingStyle || !formData.name.trim() || !formData.prompt.trim()) return

    const updatedStyle: CustomStyle = {
      ...editingStyle,
      name: formData.name.trim(),
      description: formData.description.trim(),
      prompt: formData.prompt.trim(),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      category: formData.category
    }

    setCustomStyles(prev => 
      prev.map(style => style.id === editingStyle.id ? updatedStyle : style)
    )
    
    resetForm()
    setEditingStyle(null)
  }

  const handleToggleFavorite = (id: string) => {
    setCustomStyles(prev => 
      prev.map(style => 
        style.id === id ? { ...style, isFavorite: !style.isFavorite } : style
      )
    )
  }

  const handleDelete = (id: string) => {
    setCustomStyles(prev => prev.filter(style => style.id !== id))
  }

  const handleCopyPrompt = async (prompt: string, id: string) => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy prompt:', err)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // 过滤和搜索逻辑
  const filteredStyles = customStyles.filter(style => {
    const matchesSearch = style.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         style.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         style.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || 
                           selectedCategory === 'favorites' && style.isFavorite ||
                           style.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = ['all', 'favorites', ...Array.from(new Set(customStyles.map(s => s.category).filter(Boolean)))]

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6" />
          <h1 className="text-2xl font-bold">风格管理</h1>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              创建风格
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>创建自定义风格</DialogTitle>
              <DialogDescription>
                创建你自己的艺术风格，用于图片转换
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">风格名称</Label>
                <Input
                  id="name"
                  placeholder="例如：梦幻水彩"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">风格描述</Label>
                <Input
                  id="description"
                  placeholder="简短描述这种风格的特点"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">AI 提示词</Label>
                <Textarea
                  id="prompt"
                  placeholder="详细描述如何转换图片的英文提示词..."
                  value={formData.prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">分类</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="艺术风格">艺术风格</option>
                  <option value="科幻风格">科幻风格</option>
                  <option value="复古风格">复古风格</option>
                  <option value="现代风格">现代风格</option>
                  <option value="自然风格">自然风格</option>
                  <option value="抽象风格">抽象风格</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">标签</Label>
                <Input
                  id="tags"
                  placeholder="用逗号分隔，例如：水彩,梦幻,柔和"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  取消
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={!formData.name.trim() || !formData.prompt.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  创建
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索和过滤 */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索风格名称、描述或标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部分类</option>
              <option value="favorites">收藏夹</option>
              {categories.filter(cat => cat !== 'all' && cat !== 'favorites').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 风格列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStyles.map((style) => (
          <Card key={style.id} className="relative group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{style.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {style.description}
                  </CardDescription>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleToggleFavorite(style.id)}
                  >
                    {style.isFavorite ? (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(style)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(style.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 分类和标签 */}
              <div className="space-y-2">
                {style.category && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {style.category}
                    </Badge>
                    {style.isFavorite && (
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    )}
                  </div>
                )}
                {style.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {style.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* 提示词预览 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-500">提示词</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopyPrompt(style.prompt, style.id)}
                  >
                    {copiedId === style.id ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <div className="p-2 bg-gray-50 rounded text-xs text-gray-600 font-mono max-h-20 overflow-y-auto">
                  {style.prompt}
                </div>
              </div>

              {/* 创建时间 */}
              <div className="text-xs text-gray-400">
                创建于 {formatDate(style.createdAt)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 编辑对话框 */}
      <Dialog open={!!editingStyle} onOpenChange={() => setEditingStyle(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑风格</DialogTitle>
            <DialogDescription>
              修改你的自定义风格设置
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">风格名称</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">风格描述</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-prompt">AI 提示词</Label>
              <Textarea
                id="edit-prompt"
                value={formData.prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">分类</Label>
              <select
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="艺术风格">艺术风格</option>
                <option value="科幻风格">科幻风格</option>
                <option value="复古风格">复古风格</option>
                <option value="现代风格">现代风格</option>
                <option value="自然风格">自然风格</option>
                <option value="抽象风格">抽象风格</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">标签</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingStyle(null)}>
                取消
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={!formData.name.trim() || !formData.prompt.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 空状态 */}
      {filteredStyles.length === 0 && customStyles.length > 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            没有找到匹配的风格
          </h3>
          <p className="text-gray-500 mb-4">
            尝试调整搜索条件或分类筛选
          </p>
        </div>
      )}

      {customStyles.length === 0 && (
        <div className="text-center py-12">
          <Palette className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            还没有自定义风格
          </h3>
          <p className="text-gray-500 mb-4">
            创建你的第一个自定义风格来开始使用
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            创建风格
          </Button>
        </div>
      )}
    </div>
  )
}