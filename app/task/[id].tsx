import { useEffect, useMemo, useRef, useState } from 'react'
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, Check, Trash2, Undo2 } from 'lucide-react-native'
import { useTasks } from '@/hooks/useTasks'
import { useTheme, Colors } from '@/contexts/ThemeContext'
import { fonts } from '@/constants/fonts'
import { PrimaryButton, SecondaryButton } from '@/components/ui'
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible'
import i18n from '@/i18n'

export default function TaskDetails() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { tasks, isPending, toggleTask, saveTask, deleteTask } = useTasks()
  const task = tasks.find(t => t.id === Number(id))

  const { colors, theme } = useTheme()
  const insets = useSafeAreaInsets()
  const styles = useMemo(() => getStyles(colors), [colors])

  const [editTitle, setEditTitle] = useState(task?.title ?? '')
  const [editDescription, setEditDescription] = useState(task?.description ?? '')
  const [titleFocused, setTitleFocused] = useState(false)
  const [descriptionFocused, setDescriptionFocused] = useState(false)
  const keyboardVisible = useKeyboardVisible()
  const scrollRef = useRef<ScrollView>(null)
  const descriptionRef = useRef<TextInput>(null)
  const descriptionY = useRef(0)

  // Bring the description box into view once the keyboard has opened
  const revealDescription = () =>
    setTimeout(
      () => scrollRef.current?.scrollTo({ y: Math.max(0, descriptionY.current - 12), animated: true }),
      150,
    )

  // Guards against navigating back twice (e.g. Delete, then the task disappears from the cache)
  const leaving = useRef(false)
  const goBack = () => {
    if (leaving.current) return
    leaving.current = true
    if (router.canGoBack()) router.back()
    else router.replace('/tasks')
  }

  // The task no longer exists (deleted elsewhere): leave the screen
  const missing = !isPending && !task
  useEffect(() => {
    if (missing && !leaving.current) {
      leaving.current = true
      router.replace('/tasks')
    }
  }, [missing])

  if (!task) return <View style={styles.container} />

  const handleDelete = () => {
    goBack()
    deleteTask(task)
  }

  const handleSave = () => {
    const title = editTitle.trim()
    if (!title) return
    saveTask(task.id, title, editDescription.trim())
    goBack()
  }

  return (
    // Edge-to-edge Android doesn't resize for the keyboard: pad on both platforms
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]} behavior="padding">
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.topBar}>
        <Pressable style={styles.topButton} onPress={goBack}>
          <ArrowLeft size={20} color={colors.text} />
          <Text style={styles.backLabel}>{i18n.t('details.back')}</Text>
        </Pressable>
        <Pressable style={styles.topButton} onPress={handleDelete}>
          <Trash2 size={18} color={colors.red} />
          <Text style={styles.deleteLabel}>{i18n.t('details.delete')}</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        // Taps outside an input close the keyboard
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.tagRow}>
          <Text
            style={[
              styles.tag,
              task.completed
                ? { backgroundColor: colors.teal, color: colors.onTeal }
                : { backgroundColor: colors.tealTint, color: colors.teal },
            ]}
          >
            {task.completed ? i18n.t('details.statusCompleted') : i18n.t('details.statusActive')}
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{i18n.t('details.titleLabel')}</Text>
          <TextInput
            style={[styles.titleInput, { borderBottomColor: titleFocused ? colors.teal : colors.border }]}
            value={editTitle}
            onChangeText={v => setEditTitle(v.replace(/\n/g, ''))}
            multiline
            // Return moves to the description instead of adding a newline
            submitBehavior="submit"
            returnKeyType="next"
            onSubmitEditing={() => descriptionRef.current?.focus()}
            cursorColor={colors.teal}
            selectionColor={colors.teal}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
          />
        </View>

        <View style={styles.field} onLayout={e => (descriptionY.current = e.nativeEvent.layout.y)}>
          <Text style={styles.label}>{i18n.t('details.descriptionLabel')}</Text>
          <TextInput
            ref={descriptionRef}
            style={[
              styles.descriptionInput,
              { borderColor: descriptionFocused ? colors.teal : colors.border },
            ]}
            value={editDescription}
            onChangeText={setEditDescription}
            placeholder={i18n.t('details.descriptionPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            cursorColor={colors.teal}
            selectionColor={colors.teal}
            // Last field: Return saves
            returnKeyType="done"
            submitBehavior="submit"
            onSubmitEditing={handleSave}
            onFocus={() => {
              setDescriptionFocused(true)
              revealDescription()
            }}
            onBlur={() => setDescriptionFocused(false)}
          />
        </View>

        <SecondaryButton
          label={task.completed ? i18n.t('details.reopen') : i18n.t('details.markCompleted')}
          icon={
            task.completed ? <Undo2 size={20} color={colors.text} /> : <Check size={20} color={colors.text} />
          }
          onPress={() => toggleTask(task)}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: keyboardVisible ? 12 : 30 + insets.bottom }]}>
        <PrimaryButton
          label={i18n.t('details.save')}
          icon={<Check size={20} strokeWidth={2.4} color={colors.onTeal} />}
          onPress={handleSave}
          disabled={!editTitle.trim()}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
    },
    topButton: {
      height: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
    },
    backLabel: {
      fontFamily: fonts.semibold,
      fontSize: 15,
      color: colors.text,
    },
    deleteLabel: {
      fontFamily: fonts.extrabold,
      fontSize: 15,
      color: colors.red,
    },
    scroll: {
      flex: 1,
    },
    body: {
      flexGrow: 1,
      padding: 24,
      gap: 20,
    },
    tagRow: {
      flexDirection: 'row',
    },
    tag: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 999,
      overflow: 'hidden',
      fontFamily: fonts.semibold,
      fontSize: 11,
      letterSpacing: 0.9,
      textTransform: 'uppercase',
    },
    field: {
      gap: 6,
    },
    label: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
    },
    titleInput: {
      // 2 rows of 34
      minHeight: 78,
      paddingTop: 0,
      paddingBottom: 10,
      paddingHorizontal: 0,
      fontFamily: fonts.extrabold,
      fontSize: 30,
      lineHeight: 34,
      letterSpacing: -0.45,
      color: colors.text,
      borderBottomWidth: 2,
      textAlignVertical: 'top',
    },
    descriptionInput: {
      // 5 rows of 24
      minHeight: 5 * 24 + 24,
      paddingVertical: 12,
      paddingHorizontal: 14,
      fontFamily: fonts.regular,
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderRadius: 12,
    },
    footer: {
      paddingTop: 12,
      paddingHorizontal: 24,
      borderTopWidth: 2,
      borderTopColor: colors.border,
    },
  })
