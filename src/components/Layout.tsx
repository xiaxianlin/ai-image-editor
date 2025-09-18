import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'

export default function Layout() {
  return (
    <div className="h-screen flex flex-col">
      {/* 导航栏 */}
      <Navigation />
      
      {/* 页面内容 */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}