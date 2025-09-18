import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useConversationStore } from '@/store/conversation'
import { BarChart3, DollarSign, MessageSquare, Zap } from 'lucide-react'

export default function TokenStats() {
  const { tokenStats, loadTokenStats } = useConversationStore()

  useEffect(() => {
    loadTokenStats()
  }, [loadTokenStats])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 今日使用 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">今日使用</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(tokenStats.today)}</div>
          <p className="text-xs text-muted-foreground">tokens</p>
        </CardContent>
      </Card>

      {/* 本月使用 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">本月使用</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(tokenStats.thisMonth)}</div>
          <p className="text-xs text-muted-foreground">tokens</p>
        </CardContent>
      </Card>

      {/* 总使用量 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">总使用量</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(tokenStats.total)}</div>
          <p className="text-xs text-muted-foreground">tokens</p>
        </CardContent>
      </Card>

      {/* 总费用 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">总费用</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCost(tokenStats.cost)}</div>
          <p className="text-xs text-muted-foreground">USD</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Token 使用详情组件
export function TokenUsageDetail() {
  const { currentConversation } = useConversationStore()

  if (!currentConversation) {
    return null
  }

  const totalTokens = currentConversation.total_tokens
  const inputTokens = currentConversation.total_input_tokens
  const outputTokens = currentConversation.total_output_tokens

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm">当前对话 Token 使用</CardTitle>
        <CardDescription>
          {currentConversation.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">输入 Tokens:</span>
          <Badge variant="secondary">{inputTokens.toLocaleString()}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">输出 Tokens:</span>
          <Badge variant="secondary">{outputTokens.toLocaleString()}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">总计:</span>
          <Badge variant="default">{totalTokens.toLocaleString()}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">模型:</span>
          <Badge variant="outline">{currentConversation.model}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}