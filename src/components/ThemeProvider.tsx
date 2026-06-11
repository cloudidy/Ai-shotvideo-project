'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { currentTheme } = useThemeStore()

  useEffect(() => {
    // 动态设置CSS变量
    const root = document.documentElement
    Object.entries(currentTheme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [currentTheme])

  return <>{children}</>
}
