import { useState } from 'react'
import { router } from 'expo-router'
import { ArrowRight } from 'lucide-react-native'
import { getAuthErrorMessage, register } from '@/services/auth'
import { useTheme } from '@/contexts/ThemeContext'
import AuthLayout from '@/components/AuthLayout'
import { Field, PrimaryButton } from '@/components/ui'
import i18n from '@/i18n'

const goToLogin = (params?: { email: string; registered: string }) => {
  // Go back to the existing Login screen (with params) instead of stacking a new one
  router.dismissTo({ pathname: '/auth/login', params })
}

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { colors } = useTheme()

  const handleRegister = async () => {
    if (isLoading) return
    if (!name || !email || !password) {
      setError(i18n.t('auth.errorFields'))
      return
    }

    setError('')
    setIsLoading(true)
    try {
      const data = await register({ name, email, password })

      if (data.user) {
        goToLogin({ email, registered: '1' })
      }
    } catch (err) {
      setError(getAuthErrorMessage(err, i18n.t('auth.errorRegister')))
    } finally {
      setIsLoading(false)
    }
  }

  const clearError =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v)
      setError('')
    }

  return (
    <AuthLayout
      title={i18n.t('auth.registerTitle')}
      onBack={() => goToLogin()}
      error={error}
      footerText={i18n.t('auth.hasAccount')}
      footerLink={i18n.t('auth.login')}
      onFooterPress={() => goToLogin()}
      button={
        <PrimaryButton
          label={isLoading ? i18n.t('auth.registering') : i18n.t('auth.register')}
          icon={<ArrowRight size={20} color={colors.onTeal} />}
          onPress={handleRegister}
          disabled={isLoading}
          disabledOpacity={0.6}
        />
      }
    >
      <Field
        label={i18n.t('auth.name')}
        value={name}
        onChangeText={clearError(setName)}
        autoComplete="name"
      />
      <Field
        label={i18n.t('auth.email')}
        value={email}
        onChangeText={clearError(setEmail)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <Field
        label={i18n.t('auth.password')}
        value={password}
        onChangeText={clearError(setPassword)}
        secureTextEntry
        returnKeyType="go"
        onSubmitEditing={handleRegister}
      />
    </AuthLayout>
  )
}
