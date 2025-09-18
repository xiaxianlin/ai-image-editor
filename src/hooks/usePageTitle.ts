import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = `${title} - AI 图片编辑器`
    
    return () => {
      document.title = previousTitle
    }
  }, [title])
}