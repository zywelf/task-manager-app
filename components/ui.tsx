import { forwardRef, useState } from 'react'
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { fonts } from '@/constants/fonts'

type ButtonProps = {
  label: string
  onPress: () => void
  icon?: React.ReactNode
  disabled?: boolean
  /** Opacity used while disabled (0.45 for empty forms, 0.6 while loading) */
  disabledOpacity?: number
  height?: number
  style?: StyleProp<ViewStyle>
}

/** Teal button, label on the left and an optional icon on the right */
export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled,
  disabledOpacity = 0.45,
  height = 54,
  style,
}: ButtonProps) {
  const { colors } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { height, backgroundColor: pressed ? colors.tealPressed : colors.teal },
        disabled && { opacity: disabledOpacity },
        style,
      ]}
    >
      <Text style={[styles.primaryLabel, { color: colors.onTeal }]}>{label}</Text>
      {icon}
    </Pressable>
  )
}

/** Bordered button, label on the left and an optional icon on the right */
export function SecondaryButton({ label, onPress, icon, height = 52, style }: ButtonProps) {
  const { colors } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles.secondary,
        {
          height,
          borderColor: colors.border,
          backgroundColor: pressed ? colors.card : 'transparent',
        },
        style,
      ]}
    >
      <Text style={[styles.secondaryLabel, { color: colors.text }]}>{label}</Text>
      {icon}
    </Pressable>
  )
}

type FieldProps = TextInputProps & {
  label: string
  /** Number of visible rows for a multiline field */
  rows?: number
}

/** Label + card input whose border turns teal on focus */
export const Field = forwardRef<TextInput, FieldProps>(function Field(
  { label, rows, style, onFocus, onBlur, ...props },
  ref,
) {
  const { colors } = useTheme()
  const [focused, setFocused] = useState(false)
  const lineHeight = 23

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textMuted}
        cursorColor={colors.teal}
        selectionColor={colors.teal}
        multiline={!!rows}
        textAlignVertical={rows ? 'top' : 'center'}
        onFocus={e => {
          setFocused(true)
          onFocus?.(e)
        }}
        onBlur={e => {
          setFocused(false)
          onBlur?.(e)
        }}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: focused ? colors.teal : colors.border,
          },
          rows
            ? {
                height: rows * lineHeight + 24,
                paddingVertical: 12,
                lineHeight,
              }
            : { height: 50 },
          style,
        ]}
        {...props}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondary: {
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  primaryLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 16,
  },
  secondaryLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 15,
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
})
