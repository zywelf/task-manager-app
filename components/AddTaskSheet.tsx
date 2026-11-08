import { useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Plus, X } from 'lucide-react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { fonts } from '@/constants/fonts'
import { Field, PrimaryButton } from '@/components/ui'
import i18n from '@/i18n'

const EASE = Easing.bezier(0.2, 0.8, 0.2, 1)

type AddTaskSheetProps = {
  open: boolean
  title: string
  description: string
  onChangeTitle: (v: string) => void
  onChangeDescription: (v: string) => void
  onClose: () => void
  onSubmit: () => void
}

export default function AddTaskSheet({
  open,
  title,
  description,
  onChangeTitle,
  onChangeDescription,
  onClose,
  onSubmit,
}: AddTaskSheetProps) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const titleRef = useRef<TextInput>(null)
  // The Modal stays mounted until the closing animation ends
  const [mounted, setMounted] = useState(open)
  const progress = useSharedValue(0)
  const sheetHeight = useSharedValue(600)

  useEffect(() => {
    if (open) {
      setMounted(true)
      progress.value = withTiming(1, { duration: 320, easing: EASE })
      const focus = setTimeout(() => titleRef.current?.focus(), 320)
      return () => clearTimeout(focus)
    }
    progress.value = withTiming(0, { duration: 250, easing: EASE }, finished => {
      if (finished) scheduleOnRN(setMounted, false)
    })
  }, [open, progress])

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }))
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * sheetHeight.value * 1.05 }],
  }))

  const canAdd = !!title.trim()

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={styles.fill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          onLayout={e => (sheetHeight.value = e.nativeEvent.layout.height)}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              paddingBottom: 34 + insets.bottom,
            },
            sheetStyle,
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{i18n.t('sheet.title')}</Text>
            <Pressable style={styles.close} onPress={onClose} accessibilityLabel="Close">
              <X size={22} color={colors.text} />
            </Pressable>
          </View>

          <Field
            ref={titleRef}
            label={i18n.t('sheet.titleLabel')}
            placeholder={i18n.t('sheet.titlePlaceholder')}
            value={title}
            onChangeText={onChangeTitle}
            returnKeyType="done"
            submitBehavior="submit"
            onSubmitEditing={onSubmit}
          />
          <Field
            label={i18n.t('sheet.descriptionLabel')}
            placeholder={i18n.t('sheet.descriptionPlaceholder')}
            value={description}
            onChangeText={onChangeDescription}
            rows={3}
          />

          <PrimaryButton
            label={i18n.t('sheet.addButton')}
            icon={<Plus size={22} strokeWidth={2.4} color={colors.onTeal} />}
            onPress={onSubmit}
            disabled={!canAdd}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: 'rgba(32,30,29,0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 24,
    gap: 16,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 999,
    alignSelf: 'center',
    marginTop: -8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 26,
    letterSpacing: -0.4,
  },
  close: {
    width: 44,
    height: 44,
    marginRight: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
