import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { showToast } from '@/components/AppToast'
import { useTutorial } from '@/contexts/TutorialContext'
import i18n from '@/i18n'

export type Task = {
  id: number
  title: string
  description?: string | null
  completed: boolean
}

export const TASKS_KEY = ['tasks']

// Temporary ids for optimistic creates are negative so they never clash with server ids
let tempId = -1
const nextTempId = () => tempId--

const showError = () => showToast(i18n.t('tasks.toastError'), { duration: 2000 })

/**
 * Task list plus the mutations used by the Tasks and Task details screens.
 * Every mutation updates the cache optimistically so swipes feel instant,
 * then swaps in the server response. On error the list is refetched.
 */
export function useTasks() {
  const queryClient = useQueryClient()
  const tutorial = useTutorial()

  const query = useQuery({
    queryKey: TASKS_KEY,
    // Newest first, so a freshly added task stays on top after a refetch
    queryFn: async () => {
      const tasks: Task[] = await api.get({ endpoint: '/api/tasks' })
      return [...tasks].sort((a, b) => b.id - a.id)
    },
  })

  const getTasks = () => queryClient.getQueryData<Task[]>(TASKS_KEY) ?? []
  const setTasks = (updater: (tasks: Task[]) => Task[]) =>
    queryClient.setQueryData<Task[]>(TASKS_KEY, (old = []) => updater(old))
  const replaceTask = (id: number, task: Task) => setTasks(tasks => tasks.map(t => (t.id === id ? task : t)))
  const resync = () => {
    showError()
    queryClient.invalidateQueries({ queryKey: TASKS_KEY })
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: Partial<Omit<Task, 'id'>> }): Promise<Task> =>
      api.put({ endpoint: `/api/tasks/${id}`, body: changes }),
    onMutate: async ({ id, changes }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY })
      setTasks(tasks => tasks.map(t => (t.id === id ? { ...t, ...changes } : t)))
    },
    onSuccess: (updated, { id }) => replaceTask(id, updated),
    onError: resync,
  })

  const createMutation = useMutation({
    mutationFn: async ({ task }: { task: Task; index: number }): Promise<Task> => {
      const created: Task = await api.post({
        endpoint: '/api/tasks',
        body: { title: task.title, description: task.description || undefined },
      })
      // Restored tasks keep their completed state
      if (task.completed) {
        return api.put({
          endpoint: `/api/tasks/${created.id}`,
          body: { completed: true },
        })
      }
      return created
    },
    onMutate: async ({ task, index }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY })
      setTasks(tasks => {
        const next = [...tasks]
        next.splice(Math.min(index, next.length), 0, task)
        return next
      })
    },
    onSuccess: (created, { task }) => replaceTask(task.id, created),
    onError: resync,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete({ endpoint: `/api/tasks/${id}` }),
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY })
      setTasks(tasks => tasks.filter(t => t.id !== id))
    },
    onError: resync,
  })

  // A task with a temporary id is still being created on the server
  const isSaved = (task: Task) => task.id > 0

  const toggleTask = (task: Task) => {
    if (!isSaved(task)) return
    const completed = !task.completed
    updateMutation.mutate({ id: task.id, changes: { completed } })
    if (completed) tutorial.onTaskCompleted()
    showToast(completed ? i18n.t('tasks.toastCompleted') : i18n.t('tasks.toastReopened'), { duration: 2000 })
  }

  const createTask = (title: string, description: string) => {
    const task: Task = {
      id: nextTempId(),
      title,
      description: description || null,
      completed: false,
    }
    createMutation.mutate({ task, index: 0 })
    showToast(i18n.t('tasks.toastAdded'))
  }

  const saveTask = (id: number, title: string, description: string) => {
    updateMutation.mutate({ id, changes: { title, description } })
    showToast(i18n.t('tasks.toastSaved'))
  }

  const deleteTask = (task: Task) => {
    const index = getTasks().findIndex(t => t.id === task.id)
    if (index < 0 || !isSaved(task)) return
    deleteMutation.mutate(task.id)
    tutorial.onTaskDeleted()
    showToast(i18n.t('tasks.toastDeleted'), {
      duration: 4500,
      // The server has no restore endpoint: re-create the task at its old position
      onUndo: () => {
        createMutation.mutate({ task: { ...task, id: nextTempId() }, index })
        showToast(i18n.t('tasks.toastRestored'))
      },
    })
  }

  return {
    ...query,
    tasks: query.data ?? [],
    isSaved,
    toggleTask,
    createTask,
    saveTask,
    deleteTask,
  }
}
