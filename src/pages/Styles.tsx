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
  Star,
  StarOff
} from 'lucide-react'

interface Style {
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
  usePageTitle("风格")
  const [styles, setStyles] = useState<Style[]>([
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

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingStyle, setEditingStyle] = useState<Style | null>(null)
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

    const newStyle: Style = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      prompt: formData.prompt.trim(),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: Date.now(),
      isFavorite: false,
      category: formData.category
    }

    setStyles(prev => [newStyle, ...prev])
    resetForm()
    setIsCreateDialogOpen(false)
  }

  const handleEdit = (style: Style) => {
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

    const updatedStyle: Style = {
      ...editingStyle,
      name: formData.name.trim(),
      description: formData.description.trim(),
      prompt: formData.prompt.trim(),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      category: formData.category
    }

    setStyles(prev =>
      prev.map(style => style.id === editingStyle.id ? updatedStyle : style)
    )

    resetForm()
    setEditingStyle(null)
  }

  const handleToggleFavorite = (id: string) => {
    setStyles(prev =>
      prev.map(style =>
        style.id === id ? { ...style, isFavorite: !style.isFavorite } : style
      )
    )
  }

  const handleDelete = (id: string) => {
    setStyles(prev => prev.filter(style => style.id !== id))
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

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6" />
          <h1 className="text-2xl font-bold">风格</h1>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              创建风格
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>创建新风格</DialogTitle>
              <DialogDescription>
                定义一个自定义的AI图像处理风格
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">风格名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如：梦幻水彩"
                  className="col-span-3"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">风格描述</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="简要描述这种风格的特点"
                  className="col-span-3"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prompt">AI提示词</Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="描述AI应该如何处理图像的详细提示词"
                  className="col-span-3 min-h-[100px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">标签</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="水彩, 梦幻, 柔和（用逗号分隔）"
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreate} disabled={!formData.name.trim() || !formData.prompt.trim()}>
                <Save className="h-4 w-4 mr-2" />
                创建
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 风格列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {styles.map((style) => (
          <Card key={style.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{style.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {style.description}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleFavorite(style.id)}
                  className="ml-2"
                >
                  {style.isFavorite ? (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  ) : (
                    <StarOff className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {style.category && (
                <Badge variant="secondary" className="mt-2">
                  {style.category}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">AI提示词：</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md max-h-20 overflow-y-auto">
                    {style.prompt}
                  </p>
                </div>

                {style.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">标签：</p>
                    <div className="flex flex-wrap gap-1">
                      {style.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>创建时间：{formatDate(style.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyPrompt(style.prompt, style.id)}
                      className="h-8 w-8"
                    >
                      {copiedId === style.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(style)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(style.id)}
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 空状态 */}
      {styles.length === 0 && (
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

      {/* 编辑对话框 */}
      {editingStyle && (
        <Dialog open={!!editingStyle} onOpenChange={() => setEditingStyle(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>编辑风格</DialogTitle>
              <DialogDescription>
                修改自定义风格的详细信息
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">风格名称</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如：梦幻水彩"
                  className="col-span-3"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">风格描述</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="简要描述这种风格的特点"
                  className="col-span-3"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-prompt">AI提示词</Label>
                <Textarea
                  id="edit-prompt"
                  value={formData.prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="描述AI应该如何处理图像的详细提示词"
                  className="col-span-3 min-h-[100px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-tags">标签</Label>
                <Input
                  id="edit-tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="水彩, 梦幻, 柔和（用逗号分隔）"
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingStyle(null)}>
                取消
              </Button>
              <Button onClick={handleUpdate} disabled={!formData.name.trim() || !formData.prompt.trim()}>
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}