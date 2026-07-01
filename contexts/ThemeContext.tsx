import { createContext, useContext, useState } from 'react'
import { useColorScheme } from 'react-native'

type Theme = 'light' | 'dark'

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
  colors: typeof darkColors
}

const darkColors = {
  background: '#0a0a0a',
  card: '#1a1a1a',
  border: '#2e2e2e',
  text: '#ededed',
  textMuted: '#a0a0a0',
  teal: '#2DD4BF',
  red: '#dc2626',
}

const lightColors = {
  background: '#f5f5f5',
  card: '#ffffff',
  border: '#e0e0e0',
  text: '#1a1a1a',
  textMuted: '#6b6b6b',
  teal: '#0D9488',
  red: '#dc2626',
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme()
  const [theme, setTheme] = useState<Theme>(systemTheme ?? 'dark')

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const colors = theme === 'dark' ? darkColors : lightColors

  return <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
