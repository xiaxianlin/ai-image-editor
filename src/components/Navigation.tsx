import { NavLink } from 'react-router-dom'
import { Button } from './ui/button'
import { Settings as SettingsIcon, Image as ImageIcon, Palette, Images } from 'lucide-react'
import { routes } from '@/utils/routeUtils'

export default function Navigation() {
  return (
    <nav className="flex-shrink-0 bg-white border-b px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">AI修图</span>
        </div>
        
        <div className="flex items-center gap-2">
          <NavLink to={routes.home}>
            {({ isActive }) => (
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                编辑器
              </Button>
            )}
          </NavLink>
          
          <NavLink to={routes.gallery}>
            {({ isActive }) => (
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center gap-2"
              >
                <Images className="h-4 w-4" />
                图库
              </Button>
            )}
          </NavLink>
          
          <NavLink to={routes.styles}>
            {({ isActive }) => (
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                风格管理
              </Button>
            )}
          </NavLink>
          
          <NavLink to={routes.settings}>
            {({ isActive }) => (
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center gap-2"
              >
                <SettingsIcon className="h-4 w-4" />
                设置
              </Button>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  )
}