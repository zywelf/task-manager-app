import { createContext, useContext, useRef, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { captureRef } from 'react-native-view-shot'

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

// Length of the light/dark crossfade
const THEME_FADE_MS = 400

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Dark is the default theme of the redesign
  const [theme, setTheme] = useState<Theme>('dark')
  const rootRef = useRef<View>(null)
  const [snapshot, setSnapshot] = useState<string | null>(null)
  const switching = useRef(false)
  const snapshotOpacity = useSharedValue(0)

  const flipTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  const endTransition = () => {
    setSnapshot(null)
    switching.current = false
  }

  /**
   * Smooth theme switch: freeze the current screen as an image on top, switch the theme
   * underneath, then fade the image out (ease-in-out). Every color, including icons,
   * appears to crossfade without animating each style separately.
   */
  const toggleTheme = async () => {
    if (switching.current) return
    switching.current = true
    try {
      const uri = await captureRef(rootRef, { format: 'jpg', quality: 0.9, result: 'tmpfile' })
      snapshotOpacity.value = 1
      setSnapshot(uri)
    } catch {
      // Snapshot not available: switch without the animation
      flipTheme()
      switching.current = false
    }
  }

  // The snapshot is painted: switch the theme under it and fade it out
  const onSnapshotLoaded = () => {
    requestAnimationFrame(() => {
      flipTheme()
      snapshotOpacity.value = withTiming(
        0,
        { duration: THEME_FADE_MS, easing: Easing.inOut(Easing.ease) },
        finished => {
          if (finished) scheduleOnRN(endTransition)
        },
      )
    })
  }

  const snapshotStyle = useAnimatedStyle(() => ({ opacity: snapshotOpacity.value }))

  const colors = theme === 'dark' ? darkColors : lightColors

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {/* collapsable={false} keeps this a real native view so it can be captured */}
      <View ref={rootRef} collapsable={false} style={[styles.root, { backgroundColor: colors.background }]}>
        {children}
      </View>
      {snapshot && (
        <Animated.View style={[StyleSheet.absoluteFill, snapshotStyle]} pointerEvents="none">
          <Image
            source={{ uri: snapshot }}
            style={styles.root}
            onLoad={onSnapshotLoaded}
            onError={() => {
              flipTheme()
              endTransition()
            }}
            fadeDuration={0}
          />
        </Animated.View>
      )}
    </ThemeContext.Provider>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
})

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
