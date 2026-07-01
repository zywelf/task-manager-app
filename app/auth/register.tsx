import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { register } from '../../services/auth'
import i18n from '@/i18n'
import { useTheme } from '@/contexts/ThemeContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { colors } = useTheme()
  const styles = getStyles(colors)

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert(i18n.t('auth.errorTitle'), i18n.t('auth.errorFields'))
      return
    }

    setIsLoading(true)
    try {
      const data = await register({ name, email, password })

      if (data.user) {
        Alert.alert(i18n.t('auth.successTitle'), i18n.t('auth.successRegister'), [
          {
            text: 'OK',
            onPress: () => router.push('/auth/login'),
          },
        ])
      } else if (data.errors) {
        const messages = data.errors.map((e: { message: string }) => e.message).join('\n')
        Alert.alert(i18n.t('auth.errorValidation'), messages)
      } else {
        Alert.alert(i18n.t('auth.errorTitle'), data.message || i18n.t('auth.errorRegister'))
      }
    } catch {
      Alert.alert(i18n.t('auth.errorTitle'), i18n.t('auth.errorConnection'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('auth.loginTitle')}</Text>
      <Text style={styles.subtitle}>{i18n.t('auth.registerSubtitle')}</Text>

      <TextInput
        style={styles.input}
        placeholder={i18n.t('auth.name')}
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder={i18n.t('auth.email')}
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder={i18n.t('auth.password')}
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? i18n.t('auth.registering') : i18n.t('auth.register')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text style={styles.link}>{i18n.t('auth.hasAccount')}</Text>
      </TouchableOpacity>
    </View>
  )
}

const getStyles = (colors: {
  background: string
  card: string
  border: string
  text: string
  textMuted: string
  teal: string
  red: string
}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      padding: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.teal,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textMuted,
      marginBottom: 32,
      textAlign: 'center',
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 16,
      color: colors.text,
      marginBottom: 16,
      fontSize: 16,
    },
    button: {
      backgroundColor: colors.teal,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: colors.background,
      fontWeight: 'bold',
      fontSize: 16,
    },
    link: {
      color: colors.teal,
      textAlign: 'center',
      fontSize: 14,
    },
  })
