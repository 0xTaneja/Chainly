// Theme provider with light/dark toggle and NextUI integration
'use client'

import { NextUIProvider } from '@nextui-org/react'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ThemeContextProps {
  theme: 'light' | 'dark'
  toggle: () => void
}

export const ThemeContext = createContext<ThemeContextProps>({ theme: 'dark', toggle: () => {} })

export function useThemeMode() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = window.localStorage.getItem('theme') as 'light' | 'dark' | null
    return stored ?? 'dark'
  })

  // apply class to html tag
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') root.classList.remove('dark')
    else root.classList.add('dark')
    window.localStorage.setItem('theme', theme)
  }, [theme])

  const toggle = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <NextUIProvider>{children}</NextUIProvider>
    </ThemeContext.Provider>
  )
} 