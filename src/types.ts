export type Sex = 'female' | 'male'

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active'

export type GoalPace = 'gentle' | 'steady' | 'focused'

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'unknown'

export interface Profile {
  name: string
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  goalWeightKg: number
  activity: ActivityLevel
  pace: GoalPace
  tracksCycle: boolean
  cycleLengthDays: number
  periodLengthDays: number
  lastPeriodStart: string | null
  reminderMinutes: number
  remindersEnabled: boolean
  onboardingComplete: boolean
}

export interface MacroTargets {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG: number
  waterMl: number
}

export interface NutrientTarget {
  id: string
  name: string
  amount: number
  unit: string
  why: string
}

export interface FoodEntry {
  id: string
  name: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  at: string
  note?: string
}

export interface PhotoCheckIn {
  id: string
  date: string
  dataUrl: string
  note: string
  weightKg?: number
}

export interface DayLog {
  date: string
  foods: FoodEntry[]
  vitaminsTaken: string[]
  waterGlasses: number
}

export interface AppState {
  profile: Profile
  logs: Record<string, DayLog>
  photos: PhotoCheckIn[]
}

export type TabId = 'today' | 'eat' | 'cycle' | 'photos' | 'you'

export interface CravingSuggestion {
  title: string
  foods: string[]
  why: string
  nutrients: string[]
}
