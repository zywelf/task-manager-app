import { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { ArrowRight } from 'lucide-react-native'
import { getAuthErrorMessage, login } from '@/services/auth'
import { useTheme } from '@/contexts/ThemeContext'
import { useTutorial } from '@/contexts/TutorialContext'
import AuthLayout from '@/components/AuthLayout'
import { Field, PrimaryButton } from '@/components/ui'
import i18n from '@/i18n'

export default function Login() {
  const params = useLocalSearchParams<{
    email?: string
    registered?: string
  }>()
  const [email, setEmail] = useState(params.email ?? '')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { colors } = useTheme()
  const tutorial = useTutorial()

  // Coming back from Register with a prefilled email
  useEffect(() => {
    if (params.email) {
      setEmail(params.email)
      setPassword('')
      setError('')
    }
  }, [params.email, params.registered])

  const handleLogin = async () => {
    if (isLoading) return
    if (!email || !password) {
      setError(i18n.t('auth.errorEmailPassword'))
      return
    }

    setError('')
    setIsLoading(true)
    try {
      const data = await login({ email, password })

      if (data.token) {
        await tutorial.startIfFirstTime()
        router.replace('/tasks')
      }
    } catch (err) {
      setError(getAuthErrorMessage(err, i18n.t('auth.errorLogin')))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title={i18n.t('auth.loginTitle')}
      notice={params.registered === '1' ? i18n.t('auth.successRegister') : undefined}
      error={error}
      footerText={i18n.t('auth.noAccount')}
      footerLink={i18n.t('auth.register')}
      onFooterPress={() => router.push('/auth/register')}
      button={
        <PrimaryButton
          label={isLoading ? i18n.t('auth.loggingIn') : i18n.t('auth.login')}
          icon={<ArrowRight size={20} color={colors.onTeal} />}
          onPress={handleLogin}
          disabled={isLoading}
          disabledOpacity={0.6}
        />
      }
    >
      <Field
        label={i18n.t('auth.email')}
        value={email}
        onChangeText={v => {
          setEmail(v)
          setError('')
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <Field
        label={i18n.t('auth.password')}
        value={password}
        onChangeText={v => {
          setPassword(v)
          setError('')
        }}
        secureTextEntry
        returnKeyType="go"
        onSubmitEditing={handleLogin}
      />
    </AuthLayout>
  )
}
