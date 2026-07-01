import { useEffect } from 'react'
import { router } from 'expo-router'
import { getToken } from '@/services/auth'
import { ActivityIndicator, View } from 'react-native'

export default function Index() {
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
        backgroundColor: '#0a0a0a',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ActivityIndicator size="large" color="#2DD4BF" />
    </View>
  )
}
