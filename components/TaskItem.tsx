import { useRef } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable'
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { Check, ChevronRight, Trash2, Undo2 } from 'lucide-react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { fonts } from '@/constants/fonts'
import type { Task } from '@/hooks/useTasks'
import i18n from '@/i18n'

// Releasing past this distance triggers the action
const THRESHOLD = 90
// Width of the revealed underlay (max drag distance)
const ACTION_WIDTH = 160

type TaskItemProps = {
  item: Task
  onToggle: (task: Task) => void
  onDelete: (task: Task) => void
  onPress: (task: Task) => void
}

type SwipeActionProps = {
  translation: SharedValue<number>
  side: 'left' | 'right'
  backgroundColor: string
  children: React.ReactNode
}

/** Underlay at 0.7 opacity until the threshold is crossed, then fully opaque */
function SwipeAction({ translation, side, backgroundColor, children }: SwipeActionProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: Math.abs(translation.value) > THRESHOLD ? 1 : 0.7,
  }))

  return (
    <Animated.View
      style={[
        styles.action,
        {
          backgroundColor,
          justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
        },
        animatedStyle,
      ]}
    >
      {children}
    </Animated.View>
  )
}

export default function TaskItem({ item, onToggle, onDelete, onPress }: TaskItemProps) {
  const swipeableRef = useRef<SwipeableMethods>(null)
  const { colors } = useTheme()

  const labelStyle = [styles.actionLabel, { color: colors.onTeal }]

  return (
    <View style={[styles.wrapper, { borderBottomColor: colors.border }]}>
      <ReanimatedSwipeable
        ref={swipeableRef}
        friction={1}
        leftThreshold={THRESHOLD}
        rightThreshold={THRESHOLD}
        overshootLeft={false}
        overshootRight={false}
        onSwipeableWillOpen={direction => {
          // Act right away, then spring the row back
          if (direction === 'right') onToggle(item)
          if (direction === 'left') onDelete(item)
          swipeableRef.current?.close()
        }}
        renderLeftActions={(_progress, translation) => (
          <SwipeAction translation={translation} side="left" backgroundColor={colors.teal}>
            {item.completed ? (
              <Undo2 size={20} strokeWidth={2.4} color={colors.onTeal} />
            ) : (
              <Check size={20} strokeWidth={2.4} color={colors.onTeal} />
            )}
            <Text style={labelStyle}>
              {item.completed ? i18n.t('tasks.reopen') : i18n.t('tasks.complete')}
            </Text>
          </SwipeAction>
        )}
        renderRightActions={(_progress, translation) => (
          <SwipeAction translation={translation} side="right" backgroundColor={colors.red}>
            <Text style={labelStyle}>{i18n.t('tasks.delete')}</Text>
            <Trash2 size={20} strokeWidth={2.2} color={colors.onTeal} />
          </SwipeAction>
        )}
      >
        <Pressable style={[styles.row, { backgroundColor: colors.background }]} onPress={() => onPress(item)}>
          <Pressable
            style={styles.checkboxTouch}
            onPress={() => onToggle(item)}
            hitSlop={4}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.completed }}
          >
            <View
              style={[
                styles.checkbox,
                { borderColor: colors.teal },
                item.completed && { backgroundColor: colors.teal },
              ]}
            >
              {item.completed && <Check size={14} strokeWidth={3.2} color={colors.background} />}
            </View>
          </Pressable>

          <View style={styles.text}>
            <Text
              style={[
                styles.title,
                { color: item.completed ? colors.textMuted : colors.text },
                item.completed && styles.titleDone,
              ]}
            >
              {item.title}
            </Text>
            {!!item.description && (
              <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={1}>
                {item.description}
              </Text>
            )}
          </View>

          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>
      </ReanimatedSwipeable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  row: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 10,
    paddingRight: 16,
    paddingBottom: 10,
    paddingLeft: 12,
  },
  checkboxTouch: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 21,
  },
  titleDone: {
    textDecorationLine: 'line-through',
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  action: {
    width: ACTION_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  actionLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 14,
  },
})
