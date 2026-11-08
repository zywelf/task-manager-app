import { useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native'
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import { Info, LogOut, Moon, Plus, Search, Sun } from 'lucide-react-native'
import { logout } from '@/services/auth'
import { queryClient } from '@/services/queryClient'
import { Task, useTasks } from '@/hooks/useTasks'
import { useTheme, Colors } from '@/contexts/ThemeContext'
import { useTutorial } from '@/contexts/TutorialContext'
import { fonts } from '@/constants/fonts'
import TaskItem from '@/components/TaskItem'
import CustomAlert from '@/components/CustomAlert'
import AddTaskSheet from '@/components/AddTaskSheet'
import CoachCard from '@/components/CoachCard'
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible'
import i18n from '@/i18n'

type Filter = 'all' | 'active' | 'completed'
const FILTER_ORDER: Filter[] = ['all', 'active', 'completed']
const TAB_EASE = { duration: 250, easing: Easing.inOut(Easing.ease) }

export default function Tasks() {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [showInfo, setShowInfo] = useState(false)

  const { colors, toggleTheme, theme } = useTheme()
  const tutorial = useTutorial()
  const insets = useSafeAreaInsets()
  const styles = useMemo(() => getStyles(colors), [colors])
  const { tasks, isPending, error, isSaved, toggleTask, createTask, deleteTask } = useTasks()

  // Derived values
  const total = tasks.length
  const done = tasks.filter(t => t.completed).length
  const active = total - done
  const pct = total ? Math.round((done / total) * 100) : 0
  const q = query.trim().toLowerCase()
  const visible = tasks.filter(
    t =>
      (filter === 'all' || (filter === 'active' ? !t.completed : t.completed)) &&
      (!q || t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q)),
  )

  // Progress bar width animates over 400ms
  const trackWidth = useSharedValue(0)
  const pctValue = useSharedValue(pct)
  useEffect(() => {
    pctValue.value = withTiming(pct, { duration: 400 })
  }, [pct, pctValue])
  const fillStyle = useAnimatedStyle(() => ({
    width: (trackWidth.value * pctValue.value) / 100,
  }))

  const toggleSearch = () => {
    if (searchOpen) setQuery('')
    setSearchOpen(!searchOpen)
  }

  const openSheet = () => {
    tutorial.onSheetOpened()
    setSheetOpen(true)
  }

  const addTask = () => {
    const title = newTitle.trim()
    if (!title) return
    Keyboard.dismiss()
    createTask(title, newDescription.trim())
    setSheetOpen(false)
    setNewTitle('')
    setNewDescription('')
    if (filter === 'completed') setFilter('all')
    setQuery('')
  }

  const replayTutorial = () => {
    setShowInfo(false)
    setFilter('all')
    setQuery('')
    tutorial.replay()
  }

  const handleLogout = async () => {
    await logout()
    tutorial.reset()
    queryClient.clear()
    router.replace('/auth/login')
  }

  const openDetails = (task: Task) => {
    if (!isSaved(task)) return
    router.push({ pathname: '/task/[id]', params: { id: String(task.id) } })
  }

  // Sliding underline under the selected tab
  const tabLayouts = useRef<Partial<Record<Filter, { x: number; width: number }>>>({})
  const indicatorX = useSharedValue(0)
  const indicatorWidth = useSharedValue(0)
  const indicatorStyle = useAnimatedStyle(() => ({ left: indicatorX.value, width: indicatorWidth.value }))
  useEffect(() => {
    const layout = tabLayouts.current[filter]
    if (!layout) return
    indicatorX.value = withTiming(layout.x, TAB_EASE)
    indicatorWidth.value = withTiming(layout.width, TAB_EASE)
  }, [filter, indicatorX, indicatorWidth])

  // Horizontal swipe on the header or tabs changes tab (not on the list: rows use swipes)
  const changeFilterBy = (step: number) => {
    const next = FILTER_ORDER[FILTER_ORDER.indexOf(filter) + step]
    if (next) setFilter(next)
  }
  const tabSwipe = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .runOnJS(true)
    .onEnd(e => {
      if (e.translationX < -50 || e.velocityX < -500) changeFilterBy(1)
      else if (e.translationX > 50 || e.velocityX > 500) changeFilterBy(-1)
    })

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: i18n.t('tasks.filterAll'), count: total },
    { key: 'active', label: i18n.t('tasks.filterActive'), count: active },
    { key: 'completed', label: i18n.t('tasks.filterCompleted'), count: done },
  ]

  const empty = q
    ? {
        title: i18n.t('tasks.noMatchesTitle'),
        body: i18n.t('tasks.noMatchesBody', { query: query.trim() }),
      }
    : total === 0
      ? { title: i18n.t('tasks.emptyTitle'), body: i18n.t('tasks.emptyBody') }
      : {
          title: filter === 'active' ? i18n.t('tasks.emptyActiveTitle') : i18n.t('tasks.emptyCompletedTitle'),
          body: i18n.t('tasks.emptyFilterBody'),
        }

  const keyboardVisible = useKeyboardVisible()
  // With the keyboard open the bar sits right on top of it
  const barBottom = keyboardVisible ? 12 : 26 + insets.bottom

  return (
    <View style={styles.container}>
      {/* Content on the teal header follows onTeal */}
      <StatusBar style={theme === 'dark' ? 'dark' : 'light'} />

      {/* Edge-to-edge Android doesn't resize for the keyboard: pad on both platforms.
          Overlays (coach card, sheet, dialog) stay outside so they aren't shifted twice. */}
      <KeyboardAvoidingView style={styles.main} behavior="padding">
        <GestureDetector gesture={tabSwipe}>
          <View>
            {/* a. Teal header field */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
              <View style={styles.headerTop}>
                <Text style={styles.kicker}>{i18n.t('tasks.title')}</Text>
                <View style={styles.headerIcons}>
                  <Pressable
                    style={styles.iconButton}
                    onPress={toggleTheme}
                    accessibilityLabel="Toggle theme"
                  >
                    {theme === 'dark' ? (
                      <Sun size={22} color={colors.onTeal} />
                    ) : (
                      <Moon size={22} color={colors.onTeal} />
                    )}
                  </Pressable>
                  <Pressable
                    style={styles.iconButton}
                    onPress={() => setShowInfo(true)}
                    accessibilityLabel="How it works"
                  >
                    <Info size={22} color={colors.onTeal} />
                  </Pressable>
                  <Pressable style={styles.iconButton} onPress={handleLogout} accessibilityLabel="Log out">
                    <LogOut size={22} color={colors.onTeal} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.pct} numberOfLines={1} adjustsFontSizeToFit>
                  {pct}%
                </Text>
                <Text style={styles.progressLabel}>{i18n.t('tasks.progress', { done, total })}</Text>
              </View>

              <View style={styles.track} onLayout={e => (trackWidth.value = e.nativeEvent.layout.width)}>
                <Animated.View style={[styles.fill, fillStyle]} />
              </View>
            </View>

            {/* b. Filter tabs */}
            <View style={styles.tabs}>
              {filters.map(f => {
                const selected = filter === f.key
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    onLayout={e => {
                      const { x, width } = e.nativeEvent.layout
                      tabLayouts.current[f.key] = { x, width }
                      // Place the underline without animation the first time
                      if (f.key === filter) {
                        indicatorX.value = x
                        indicatorWidth.value = width
                      }
                    }}
                    style={styles.tab}
                  >
                    <Text style={[styles.tabLabel, { color: selected ? colors.text : colors.textMuted }]}>
                      {f.label}
                    </Text>
                    <Text style={[styles.tabCount, { color: selected ? colors.text : colors.textMuted }]}>
                      {f.count}
                    </Text>
                  </Pressable>
                )
              })}
              <Pressable style={styles.searchButton} onPress={toggleSearch} accessibilityLabel="Search">
                <Search size={22} color={colors.text} />
              </Pressable>
              <Animated.View style={[styles.tabIndicator, indicatorStyle]} />
            </View>
          </View>
        </GestureDetector>

        {searchOpen && (
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder={i18n.t('tasks.searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              cursorColor={colors.teal}
              selectionColor={colors.teal}
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
          </View>
        )}

        {/* c. List */}
        {isPending ? (
          <View style={styles.list}>
            <Text style={styles.status}>{i18n.t('tasks.loading')}</Text>
          </View>
        ) : error ? (
          <View style={styles.list}>
            <Text style={styles.status}>{i18n.t('tasks.error')}</Text>
          </View>
        ) : (
          <FlatList
            data={visible}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeIn.delay(index * 100)}>
                <TaskItem item={item} onToggle={toggleTask} onDelete={deleteTask} onPress={openDetails} />
              </Animated.View>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>{empty.title}</Text>
                <Text style={styles.emptyBody}>{empty.body}</Text>
              </View>
            }
          />
        )}

        {/* d. Quick-add bar */}
        <View style={[styles.bar, { paddingBottom: barBottom }]}>
          <Pressable style={styles.barButton} onPress={openSheet}>
            <Text style={styles.barPlaceholder}>{i18n.t('tasks.addPlaceholder')}</Text>
            <View style={styles.barPlus}>
              <Plus size={22} strokeWidth={2.4} color={colors.onTeal} />
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {!sheetOpen && <CoachCard bottom={108 + insets.bottom} />}

      <AddTaskSheet
        open={sheetOpen}
        title={newTitle}
        description={newDescription}
        onChangeTitle={setNewTitle}
        onChangeDescription={setNewDescription}
        onClose={() => setSheetOpen(false)}
        onSubmit={addTask}
      />

      <CustomAlert visible={showInfo} onClose={() => setShowInfo(false)} onReplayTutorial={replayTutorial} />
    </View>
  )
}

const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.teal,
      paddingHorizontal: 24,
      paddingBottom: 22,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerTop: {
      height: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    kicker: {
      fontFamily: fonts.semibold,
      fontSize: 11,
      letterSpacing: 1.3,
      textTransform: 'uppercase',
      color: colors.onTeal,
    },
    headerIcons: {
      flexDirection: 'row',
      marginRight: -10,
    },
    iconButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12,
    },
    pct: {
      flexShrink: 1,
      fontFamily: fonts.extrabold,
      fontSize: 104,
      lineHeight: 104,
      letterSpacing: -5,
      color: colors.onTeal,
      includeFontPadding: false,
      // Pull the line box in so the digits sit like lineHeight ~90
      marginTop: -8,
      marginBottom: -6,
    },
    progressLabel: {
      fontFamily: fonts.semibold,
      fontSize: 14,
      lineHeight: 18,
      textAlign: 'right',
      paddingBottom: 4,
      color: colors.onTeal,
    },
    track: {
      height: 8,
      marginTop: 18,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: 'rgba(255,255,255,0.32)',
    },
    fill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: colors.onTeal,
    },
    tabs: {
      height: 52,
      flexDirection: 'row',
      alignItems: 'stretch',
      paddingLeft: 24,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginRight: 22,
    },
    // Teal 3px line over the 2px divider, slides between tabs
    tabIndicator: {
      position: 'absolute',
      bottom: -2,
      height: 3,
      backgroundColor: colors.teal,
    },
    tabLabel: {
      fontFamily: fonts.extrabold,
      fontSize: 15,
    },
    tabCount: {
      fontFamily: fonts.regular,
      fontSize: 12,
    },
    searchButton: {
      marginLeft: 'auto',
      width: 56,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchRow: {
      height: 52,
      paddingHorizontal: 24,
      justifyContent: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchInput: {
      height: '100%',
      fontFamily: fonts.regular,
      fontSize: 17,
      color: colors.text,
    },
    status: {
      fontFamily: fonts.regular,
      color: colors.textMuted,
      fontSize: 16,
      paddingVertical: 48,
      paddingHorizontal: 24,
    },
    empty: {
      paddingVertical: 48,
      paddingHorizontal: 24,
      gap: 6,
    },
    emptyTitle: {
      fontFamily: fonts.extrabold,
      fontSize: 20,
      color: colors.text,
    },
    emptyBody: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: colors.textMuted,
    },
    main: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
    // Last row of the screen (not floating), so the keyboard padding lifts it
    bar: {
      paddingTop: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.background,
    },
    barButton: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 20,
      paddingRight: 10,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    barPlaceholder: {
      fontFamily: fonts.regular,
      fontSize: 17,
      color: colors.textMuted,
    },
    barPlus: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.teal,
    },
  })
