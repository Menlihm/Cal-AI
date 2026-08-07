import type { AppState, Profile } from '../types'

const KEY = 'calai.v1'
const LEGACY_KEY = 'trentree.v1'

export const defaultProfile: Profile = {
  name: '',
  sex: 'female',
  age: 28,
  heightCm: 165,
  weightKg: 70,
  goalWeightKg: 65,
  activity: 'light',
  pace: 'steady',
  tracksCycle: true,
  cycleLengthDays: 28,
  periodLengthDays: 5,
  lastPeriodStart: null,
  reminderMinutes: 180,
  remindersEnabled: true,
  stepGoal: 8000,
  onboardingComplete: false,
}

export const defaultState: AppState = {
  profile: defaultProfile,
  logs: {},
  photos: [],
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY)
    if (!raw) return structuredClone(defaultState)
    const parsed = JSON.parse(raw) as AppState
    const logs: AppState['logs'] = {}
    for (const [key, log] of Object.entries(parsed.logs ?? {})) {
      logs[key] = {
        date: log.date ?? key,
        foods: log.foods ?? [],
        vitaminsTaken: log.vitaminsTaken ?? [],
        waterGlasses: log.waterGlasses ?? 0,
        steps: log.steps ?? 0,
        workouts: log.workouts ?? [],
      }
    }
    return {
      ...defaultState,
      ...parsed,
      profile: { ...defaultProfile, ...parsed.profile },
      logs,
      photos: parsed.photos ?? [],
    }
  } catch {
    return structuredClone(defaultState)
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
  localStorage.removeItem(LEGACY_KEY)
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Resize/compress image for localStorage-friendly photo check-ins */
export function compressImage(file: File, maxSide = 900, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read image'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not decode image'))
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas unavailable'))
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}
