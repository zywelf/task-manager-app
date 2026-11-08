import { View, Text, Pressable, StyleSheet } from 'react-native'
import Toast, { ToastConfig } from 'react-native-toast-message'
import { useTheme } from '@/contexts/ThemeContext'
import { fonts, shadow } from '@/constants/fonts'
import i18n from '@/i18n'

type AppToastProps = { onUndo?: () => void }

function AppToast({ text, onUndo }: { text: string } & AppToastProps) {
  const { colors } = useTheme()

  return (
    <View style={styles.wrapper}>
      <View style={[styles.toast, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
        {onUndo && (
          <Pressable
            style={styles.undo}
            onPress={() => {
              Toast.hide()
              onUndo()
            }}
          >
            <Text style={[styles.undoText, { color: colors.teal }]}>{i18n.t('toast.undo')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

export const toastConfig: ToastConfig = {
  app: ({ text1, props }) => <AppToast text={text1 ?? ''} onUndo={(props as AppToastProps)?.onUndo} />,
}

export const showToast = (text: string, options: { duration?: number; onUndo?: () => void } = {}) => {
  Toast.show({
    type: 'app',
    text1: text,
    position: 'top',
    topOffset: 56,
    visibilityTime: options.duration ?? 1800,
    props: { onUndo: options.onUndo },
  })
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingHorizontal: 16,
  },
  toast: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingLeft: 16,
    paddingRight: 8,
    borderWidth: 1,
    borderRadius: 14,
    ...shadow,
  },
  text: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 15,
    paddingVertical: 14,
  },
  undo: {
    height: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  undoText: {
    fontFamily: fonts.extrabold,
    fontSize: 15,
  },
})
