import { useEffect } from 'react'
import { router } from 'expo-router'
import { getToken } from '@/services/auth'
import { ActivityIndicator, View } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'

export default function Index() {
  const { colors } = useTheme()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = await getToken()
    if (token) {
      router.replace('/tasks')
    } else {
      router.replace('/auth/login')
    }
  }
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ActivityIndicator size="large" color={colors.teal} />
    </View>
  )
}
