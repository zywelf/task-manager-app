import { createContext, useContext, useState } from 'react'

type Theme = 'light' | 'dark'

const darkColors = {
  background: '#0a0a0a',
  card: '#1a1a1a',
  border: '#2e2e2e',
  text: '#ededed',
  textMuted: '#a0a0a0',
  teal: '#2DD4BF',
  tealPressed: '#5eead4',
  tealTint: 'rgba(45,212,191,0.14)',
  highlight: '#2DD4BF',
  onTeal: '#0a0a0a',
  red: '#dc2626',
}

const lightColors: typeof darkColors = {
  background: '#f5f5f5',
  card: '#ffffff',
  border: '#e0e0e0',
  text: '#1a1a1a',
  textMuted: '#6b6b6b',
  teal: '#0D9488',
  tealPressed: '#0f766e',
  tealTint: 'rgba(13,148,136,0.12)',
  highlight: '#5eead4',
  onTeal: '#f5f5f5',
  red: '#dc2626',
}

export type Colors = typeof darkColors

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
  colors: Colors
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Dark is the default theme of the redesign
  const [theme, setTheme] = useState<Theme>('dark')

  const toggleTheme = () => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  }

  const colors = theme === 'dark' ? darkColors : lightColors

  return <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
