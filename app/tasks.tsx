import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Keyboard } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, { FadeIn } from 'react-native-reanimated'
import { router } from 'expo-router'
import { logout } from '../services/auth'
import { api } from '../services/api'
import TaskItem from '@/components/TaskItem'
import Toast from 'react-native-toast-message'
import CustomAlert from '@/components/CustomAlert'
import i18n from '@/i18n'
import { useTheme } from '@/contexts/ThemeContext'
import { Info, Sun, Moon } from 'lucide-react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

type Task = {
  id: number
  title: string
  description?: string
  completed: boolean
}

export default function Tasks() {
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [showInfo, setShowInfo] = useState(false)
  const { colors, toggleTheme, theme } = useTheme()
  const styles = getStyles(colors)
  const queryClient = useQueryClient()

  const {
    data: tasks = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get({ endpoint: '/api/tasks' }),
  })

  const toggleMutation = useMutation({
    mutationFn: (task: Task) =>
      api.put({ endpoint: `/api/tasks/${task.id}`, body: { completed: !task.completed } }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      Toast.show({
        type: updated.completed ? 'success' : 'info',
        text1: updated.completed ? i18n.t('tasks.toastCompleted') : i18n.t('tasks.toastReopened'),
        visibilityTime: 2000,
        position: 'bottom',
      })
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: i18n.t('tasks.toastError'),
        visibilityTime: 2000,
        position: 'bottom',
      })
    },
  })

  const toggleTask = (task: Task) => toggleMutation.mutate(task)

  const createMutation = useMutation({
    mutationFn: () =>
      api.post({
        endpoint: '/api/tasks',
        body: {
          title: newTitle,
          description: newDescription.trim() || undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setNewTitle('')
      setNewDescription('')
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: i18n.t('tasks.toastError'),
        visibilityTime: 2000,
        position: 'bottom',
      })
    },
  })

  const createTask = () => {
    if (!newTitle.trim()) return
    Keyboard.dismiss()
    createMutation.mutate()
  }

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete({ endpoint: `/api/tasks/${id}` }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      Toast.show({
        type: 'error',
        text1: i18n.t('tasks.toastDeleted'),
        visibilityTime: 2000,
        position: 'bottom',
      })
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: i18n.t('tasks.toastError'),
        visibilityTime: 2000,
        position: 'bottom',
      })
    },
  })

  const deleteTask = (id: number) => deleteMutation.mutate(id)

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{i18n.t('tasks.title')}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <TouchableOpacity onPress={toggleTheme}>
              {theme === 'dark' ? (
                <Sun size={22} color={colors.textMuted} />
              ) : (
                <Moon size={22} color={colors.textMuted} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowInfo(true)}>
              <Info size={22} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logout}>{i18n.t('tasks.logout')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={i18n.t('tasks.titlePlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            style={styles.input}
            placeholder={i18n.t('tasks.descriptionPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={newDescription}
            onChangeText={setNewDescription}
          />
          <TouchableOpacity
            style={[styles.addButton, !newTitle.trim() && styles.addButtonDisabled]}
            onPress={createTask}
            disabled={!newTitle.trim()}
          >
            <Text style={styles.addButtonText}>{i18n.t('tasks.addButton')}</Text>
          </TouchableOpacity>
        </View>
        {isPending ? (
          <Text style={styles.emptyText}>{i18n.t('tasks.loading')}</Text>
        ) : error ? (
          <Text style={styles.emptyText}>{i18n.t('tasks.error')}</Text>
        ) : (
          <Animated.View>
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeIn.delay(index * 100)}>
                  <TaskItem item={item} toggleTask={toggleTask} deleteTask={deleteTask} />
                </Animated.View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>{i18n.t('tasks.empty')}</Text>}
            />
          </Animated.View>
        )}
      </View>
      <CustomAlert
        visible={showInfo}
        title={i18n.t('info.title')}
        message={[i18n.t('info.swipeRight'), i18n.t('info.swipeLeft')]}
        buttonText={i18n.t('info.button')}
        onClose={() => setShowInfo(false)}
      />
    </GestureHandlerRootView>
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
      padding: 24,
      paddingTop: 60,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    logout: {
      color: colors.teal,
      fontSize: 16,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      fontSize: 16,
    },
    addButton: {
      backgroundColor: colors.teal,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    addButtonText: {
      color: colors.background,
      fontWeight: 'bold',
      fontSize: 16,
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 48,
      fontSize: 16,
    },
    inputContainer: {
      marginBottom: 24,
      gap: 8,
    },
    addButtonDisabled: {
      opacity: 0.4,
    },
  })
