import { useEffect } from 'react'
import { View } from 'react-native'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import * as SystemUI from 'expo-system-ui'
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native'
import { enableScreens } from 'react-native-screens'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Toast from 'react-native-toast-message'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/services/queryClient'
import {
  useFonts,
  Archivo_400Regular,
  Archivo_600SemiBold,
  Archivo_800ExtraBold,
} from '@expo-google-fonts/archivo'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { TutorialProvider } from '@/contexts/TutorialContext'
import { toastConfig } from '@/components/AppToast'

enableScreens()
SplashScreen.preventAutoHideAsync()
// Root window colour (what shows behind screens during transitions); dark is the default theme
SystemUI.setBackgroundColorAsync('#0a0a0a')

function AppStack() {
  const { colors, theme } = useTheme()

  // Keep the native root background in sync with the theme so no white shows between screens
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background)
  }, [colors.background])

  // React Navigation draws its own container background (light by default): match the app theme
  const baseNavTheme = theme === 'dark' ? DarkTheme : DefaultTheme
  const navTheme = {
    ...baseNavTheme,
    colors: { ...baseNavTheme.colors, background: colors.background, card: colors.background },
  }

  return (
    <NavigationThemeProvider value={navTheme}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="tasks" />
          <Stack.Screen name="task/[id]" />
        </Stack>
        <Toast config={toastConfig} />
      </View>
    </NavigationThemeProvider>
  )
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Archivo_400Regular,
    Archivo_600SemiBold,
    Archivo_800ExtraBold,
  })

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync()
  }, [loaded, error])

  if (!loaded && !error) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TutorialProvider>
            <AppStack />
          </TutorialProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
