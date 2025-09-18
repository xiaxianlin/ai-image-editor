// 路由工具函数

export const routes = {
  home: '/',
  gallery: '/gallery',
  styles: '/styles',
  settings: '/settings'
} as const

export type RouteKey = keyof typeof routes
export type RoutePath = typeof routes[RouteKey]

// 路由名称映射
export const routeNames: Record<RoutePath, string> = {
  '/': '编辑器',
  '/gallery': '图库',
  '/styles': '风格管理',
  '/settings': '设置'
}

// 获取路由名称
export function getRouteName(path: RoutePath): string {
  return routeNames[path] || '未知页面'
}

// 检查是否为有效路由
export function isValidRoute(path: string): path is RoutePath {
  return Object.values(routes).includes(path as RoutePath)
}