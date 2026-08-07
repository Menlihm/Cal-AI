import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AppState, DayLog, FoodEntry, PhotoCheckIn, Profile } from '../types'
import { loadState, saveState, todayKey } from '../lib/storage'
import { ensureNotificationPermission, sendEatReminder, shouldNudge } from '../lib/reminders'

interface AppContextValue {
  state: AppState
  today: string
  todayLog: DayLog
  updateProfile: (patch: Partial<Profile>) => void
  completeOnboarding: (profile: Profile) => void
  addFood: (food: Omit<FoodEntry, 'id' | 'at'> & { at?: string }) => void
  removeFood: (id: string) => void
  toggleVitamin: (id: string) => void
  addWater: () => void
  addPhoto: (photo: Omit<PhotoCheckIn, 'id'>) => void
  removePhoto: (id: string) => void
  markPeriodStarted: (date: string) => void
  resetAll: () => void
  nudgeMessage: string | null
}

const AppContext = createContext<AppContextValue | null>(null)

function emptyLog(date: string): DayLog {
  return { date, foods: [], vitaminsTaken: [], waterGlasses: 0 }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState())
  const today = todayKey()
  const [nudgeMessage, setNudgeMessage] = useState<string | null>(null)

  useEffect(() => {
    saveState(state)
  }, [state])

  const todayLog = state.logs[today] ?? emptyLog(today)

  useEffect(() => {
    if (!state.profile.onboardingComplete || !state.profile.remindersEnabled) return

    let lastSent = 0
    const tick = () => {
      const log = loadState().logs[todayKey()]
      const profile = loadState().profile
      const { nudge, message } = shouldNudge(profile, log)
      setNudgeMessage(nudge ? message : null)
      if (nudge && Date.now() - lastSent > 45 * 60 * 1000) {
        sendEatReminder(message)
        lastSent = Date.now()
      }
    }

    void ensureNotificationPermission()
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [state.profile.onboardingComplete, state.profile.remindersEnabled, state.profile.reminderMinutes, todayLog.foods.length])

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }))
  }, [])

  const completeOnboarding = useCallback((profile: Profile) => {
    setState((s) => ({
      ...s,
      profile: { ...profile, onboardingComplete: true },
    }))
  }, [])

  const mutateToday = useCallback((fn: (log: DayLog) => DayLog) => {
    const key = todayKey()
    setState((s) => {
      const current = s.logs[key] ?? emptyLog(key)
      return { ...s, logs: { ...s.logs, [key]: fn(current) } }
    })
  }, [])

  const addFood = useCallback(
    (food: Omit<FoodEntry, 'id' | 'at'> & { at?: string }) => {
      mutateToday((log) => ({
        ...log,
        foods: [
          ...log.foods,
          {
            ...food,
            id: crypto.randomUUID(),
            at: food.at ?? new Date().toISOString(),
          },
        ],
      }))
      setNudgeMessage(null)
    },
    [mutateToday],
  )

  const removeFood = useCallback(
    (id: string) => {
      mutateToday((log) => ({
        ...log,
        foods: log.foods.filter((f) => f.id !== id),
      }))
    },
    [mutateToday],
  )

  const toggleVitamin = useCallback(
    (id: string) => {
      mutateToday((log) => {
        const has = log.vitaminsTaken.includes(id)
        return {
          ...log,
          vitaminsTaken: has
            ? log.vitaminsTaken.filter((v) => v !== id)
            : [...log.vitaminsTaken, id],
        }
      })
    },
    [mutateToday],
  )

  const addWater = useCallback(() => {
    mutateToday((log) => ({ ...log, waterGlasses: log.waterGlasses + 1 }))
  }, [mutateToday])

  const addPhoto = useCallback((photo: Omit<PhotoCheckIn, 'id'>) => {
    setState((s) => ({
      ...s,
      photos: [{ ...photo, id: crypto.randomUUID() }, ...s.photos].slice(0, 60),
    }))
  }, [])

  const removePhoto = useCallback((id: string) => {
    setState((s) => ({ ...s, photos: s.photos.filter((p) => p.id !== id) }))
  }, [])

  const markPeriodStarted = useCallback((date: string) => {
    setState((s) => ({
      ...s,
      profile: { ...s.profile, lastPeriodStart: date, tracksCycle: true },
    }))
  }, [])

  const resetAll = useCallback(() => {
    localStorage.removeItem('calai.v1')
    localStorage.removeItem('trentree.v1')
    setState(loadState())
  }, [])

  const value = useMemo(
    () => ({
      state,
      today,
      todayLog,
      updateProfile,
      completeOnboarding,
      addFood,
      removeFood,
      toggleVitamin,
      addWater,
      addPhoto,
      removePhoto,
      markPeriodStarted,
      resetAll,
      nudgeMessage,
    }),
    [
      state,
      today,
      todayLog,
      updateProfile,
      completeOnboarding,
      addFood,
      removeFood,
      toggleVitamin,
      addWater,
      addPhoto,
      removePhoto,
      markPeriodStarted,
      resetAll,
      nudgeMessage,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
