export type Sex = 'female' | 'male'

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active'

export type GoalPace = 'gentle' | 'steady' | 'focused'

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'unknown'

export type DietPreference = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian'

export type FitnessGoal = 'lose_fat' | 'build_muscle' | 'maintain' | 'recomp'

export type WorkoutType =
  | 'walking'
  | 'running'
  | 'cycling'
  | 'strength'
  | 'yoga'
  | 'swimming'
  | 'dance'
  | 'hiking'

export type Units = 'metric' | 'imperial'

export type ThemePref = 'system' | 'light' | 'dark'

export type AllergyTag =
  | 'gluten'
  | 'dairy'
  | 'nuts'
  | 'eggs'
  | 'soy'
  | 'shellfish'
  | 'fish'
  | 'sesame'

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
  stepGoal: number
  onboardingComplete: boolean
  dietPreference: DietPreference
  fitnessGoal: FitnessGoal
  workoutTypes: WorkoutType[]
  allergies: AllergyTag[]
  units: Units
  theme: ThemePref
  avatarDataUrl: string | null
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
  category?: string
  iconKey?: string
  servings?: number
  photoDataUrl?: string
}

export interface GeoPoint {
  lat: number
  lng: number
  t: number
}

export interface WorkoutActivity {
  id: string
  activityId: string
  label: string
  minutes: number
  caloriesBurned: number
  steps?: number
  distanceKm?: number
  at: string
  path?: GeoPoint[]
  source: 'manual' | 'gps_walk' | 'steps'
}

export interface PhotoCheckIn {
  id: string
  date: string
  dataUrl: string
  note: string
  weightKg?: number
}

export interface WeightEntry {
  date: string
  kg: number
}

export interface DayLog {
  date: string
  foods: FoodEntry[]
  vitaminsTaken: string[]
  waterGlasses: number
  steps: number
  workouts: WorkoutActivity[]
}

export interface AppState {
  profile: Profile
  logs: Record<string, DayLog>
  photos: PhotoCheckIn[]
  weights: WeightEntry[]
  favorites: string[]
  recents: string[]
}

export type TabId = 'today' | 'eat' | 'move' | 'cycle' | 'you'

export interface CravingSuggestion {
  title: string
  foods: string[]
  why: string
  nutrients: string[]
}
