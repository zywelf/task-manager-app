import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ArrowLeft } from 'lucide-react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { fonts } from '@/constants/fonts'
import i18n from '@/i18n'

type AuthLayoutProps = {
  title: string
  onBack?: () => void
  notice?: string
  error?: string
  button: React.ReactNode
  footerText: string
  footerLink: string
  onFooterPress: () => void
  children: React.ReactNode
}

export default function AuthLayout({
  title,
  onBack,
  notice,
  error,
  button,
  footerText,
  footerLink,
  onFooterPress,
  children,
}: AuthLayoutProps) {
  const { colors, theme } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topRow, { borderBottomColor: colors.border }]}>
          <Pressable style={styles.brand} onPress={onBack} disabled={!onBack} hitSlop={12}>
            {onBack && <ArrowLeft size={16} color={colors.text} />}
            <Text style={[styles.kicker, { color: colors.text }]}>{i18n.t('auth.appName')}</Text>
          </Pressable>
          <View style={[styles.dot, { backgroundColor: colors.teal }]} />
        </View>

        <View style={styles.spacer} />

        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

        {!!notice && (
          <Text style={[styles.notice, { backgroundColor: colors.tealTint, color: colors.teal }]}>
            {notice}
          </Text>
        )}

        <View style={styles.fields}>{children}</View>

        {!!error && <Text style={[styles.error, { color: colors.teal }]}>{error}</Text>}

        <View style={styles.button}>{button}</View>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>{footerText} </Text>
          <Pressable onPress={onFooterPress} hitSlop={12}>
            <Text style={[styles.footerLink, { color: colors.teal }]}>{footerLink}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-end',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 2,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 24,
  },
  kicker: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  spacer: {
    flex: 1,
    minHeight: 32,
  },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 44,
    lineHeight: 45,
    letterSpacing: -0.9,
    marginBottom: 12,
  },
  notice: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  fields: {
    gap: 16,
    marginTop: 12,
  },
  error: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    marginTop: 16,
  },
  button: {
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 2,
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  footerLink: {
    fontFamily: fonts.extrabold,
    fontSize: 14,
  },
})
