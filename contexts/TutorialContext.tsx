import { createContext, useCallback, useContext, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

// 0 = no tutorial, 1..3 = current step
export type TutorialStep = 0 | 1 | 2 | 3

const STORAGE_KEY = 'tutorialDone'

type TutorialContextType = {
  step: TutorialStep
  /** Starts the tutorial after login if the user has never finished it */
  startIfFirstTime: () => Promise<void>
  /** Restarts at step 1 (from the How it works dialog) */
  replay: () => void
  /** Ends the tutorial and remembers it */
  finish: () => void
  /** Hides the tutorial without marking it done (logout) */
  reset: () => void
  onTaskCompleted: () => void
  onTaskDeleted: () => void
  onSheetOpened: () => void
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState<TutorialStep>(0)

  const finish = useCallback(() => {
    setStep(0)
    AsyncStorage.setItem(STORAGE_KEY, 'true').catch(() => {})
  }, [])

  const startIfFirstTime = useCallback(async () => {
    const done = await AsyncStorage.getItem(STORAGE_KEY).catch(() => null)
    setStep(done === 'true' ? 0 : 1)
  }, [])

  const value: TutorialContextType = {
    step,
    startIfFirstTime,
    finish,
    replay: () => setStep(1),
    reset: () => setStep(0),
    onTaskCompleted: () => setStep(s => (s === 1 ? 2 : s)),
    onTaskDeleted: () => setStep(s => (s === 2 ? 3 : s)),
    onSheetOpened: () => {
      if (step === 3) finish()
    },
  }

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (!context) throw new Error('useTutorial must be used within TutorialProvider')
  return context
}
