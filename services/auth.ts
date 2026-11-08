import AsyncStorage from '@react-native-async-storage/async-storage'
import { api, ApiError } from './api'
import i18n from '@/i18n'

interface RegisterInfo {
  name: string
  email: string
  password: string
}

type LoginInfo = Pick<RegisterInfo, 'email' | 'password'>

export const register = async ({ name, email, password }: RegisterInfo) => {
  const data = await api.post({
    endpoint: '/api/auth/register',
    body: { name, email, password },
    auth: false,
  })
  return data
}

export const login = async ({ email, password }: LoginInfo) => {
  const data = await api.post({
    endpoint: '/api/auth/login',
    body: { email, password },
    auth: false,
  })

  if (data.token) {
    await AsyncStorage.setItem('token', data.token)
    await AsyncStorage.setItem('user', JSON.stringify(data.user))
  }

  return data
}

export const logout = async () => {
  await AsyncStorage.removeItem('token')
  await AsyncStorage.removeItem('user')
}

export const getToken = async () => {
  return await AsyncStorage.getItem('token')
}

/** Readable message for a failed login/register: Zod errors, server message or connection error */
export const getAuthErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError && error.errors?.length) return error.errors.map(e => e.message).join('\n')
  if (error instanceof ApiError) return error.message || fallback
  return i18n.t('auth.errorConnection')
}
