import type { GeoPoint, Profile, WorkoutActivity } from '../types'
import { calcDailyTargets, calcTdee } from './nutrition'

/** Compendium-style MET values for common activities */
export const ACTIVITIES = [
  {
    id: 'walk_easy',
    label: 'Easy walk',
    met: 2.8,
    hint: 'Strolling outdoors ~3 km/h',
    outdoor: true,
  },
  {
    id: 'walk_brisk',
    label: 'Brisk outdoor walk',
    met: 4.3,
    hint: 'Power walk ~5–5.5 km/h',
    outdoor: true,
  },
  {
    id: 'hike',
    label: 'Hiking',
    met: 6.0,
    hint: 'Trails / hills',
    outdoor: true,
  },
  {
    id: 'jog',
    label: 'Jogging',
    met: 7.0,
    hint: 'Easy jog',
    outdoor: true,
  },
  {
    id: 'run',
    label: 'Running',
    met: 9.8,
    hint: 'Steady run',
    outdoor: true,
  },
  {
    id: 'cycle_easy',
    label: 'Cycling (easy)',
    met: 4.0,
    hint: 'Leisure bike ride',
    outdoor: true,
  },
  {
    id: 'cycle_mod',
    label: 'Cycling (moderate)',
    met: 6.8,
    hint: 'Steady outdoor ride',
    outdoor: true,
  },
  {
    id: 'stairs',
    label: 'Stairs / hills',
    met: 8.0,
    hint: 'Climbing effort',
    outdoor: false,
  },
  {
    id: 'strength',
    label: 'Strength training',
    met: 5.0,
    hint: 'Weights / bodyweight',
    outdoor: false,
  },
  {
    id: 'yoga',
    label: 'Yoga / stretch',
    met: 2.5,
    hint: 'Flow or mobility',
    outdoor: false,
  },
  {
    id: 'dance',
    label: 'Dancing',
    met: 5.5,
    hint: 'Aerobic dance',
    outdoor: false,
  },
  {
    id: 'swim',
    label: 'Swimming',
    met: 6.0,
    hint: 'Moderate laps',
    outdoor: false,
  },
] as const

export type ActivityId = (typeof ACTIVITIES)[number]['id']

export function getActivity(id: string) {
  return ACTIVITIES.find((a) => a.id === id) ?? ACTIVITIES[1]
}

/** kcal ≈ MET × body weight (kg) × hours */
export function caloriesFromMet(met: number, weightKg: number, minutes: number): number {
  return Math.round(met * weightKg * (minutes / 60))
}

export function strideLengthMeters(heightCm: number): number {
  return (heightCm / 100) * 0.415
}

export function stepsFromDistanceKm(distanceKm: number, heightCm: number): number {
  const stride = strideLengthMeters(heightCm)
  if (stride <= 0) return 0
  return Math.round((distanceKm * 1000) / stride)
}

export function distanceFromStepsKm(steps: number, heightCm: number): number {
  return Math.round(((steps * strideLengthMeters(heightCm)) / 1000) * 100) / 100
}

/** Rough step energy cost scaled by body weight */
export function caloriesFromSteps(steps: number, weightKg: number): number {
  // ~0.04 kcal/step at 70kg baseline, scaled linearly
  return Math.round(steps * 0.04 * (weightKg / 70))
}

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)))
}

export function pathDistanceKm(path: GeoPoint[]): number {
  if (path.length < 2) return 0
  let total = 0
  for (let i = 1; i < path.length; i++) {
    const seg = haversineKm(path[i - 1], path[i])
    // Ignore GPS jumps over 100m between samples
    if (seg < 0.1) total += seg
  }
  return Math.round(total * 100) / 100
}

export function metFromPace(kmPerHour: number): number {
  if (kmPerHour < 3.2) return 2.5
  if (kmPerHour < 4.5) return 3.5
  if (kmPerHour < 5.5) return 4.3
  if (kmPerHour < 6.5) return 5.0
  if (kmPerHour < 8) return 7.0
  return 9.0
}

export function estimateWalkBurn(opts: {
  weightKg: number
  heightCm: number
  minutes: number
  distanceKm: number
}): { calories: number; steps: number; paceKmh: number; met: number } {
  const hours = Math.max(opts.minutes / 60, 1 / 60)
  const paceKmh = opts.distanceKm > 0 ? opts.distanceKm / hours : 5
  const met = metFromPace(paceKmh)
  const calories = caloriesFromMet(met, opts.weightKg, opts.minutes)
  const steps = stepsFromDistanceKm(opts.distanceKm || paceKmh * hours, opts.heightCm)
  return { calories, steps, paceKmh: Math.round(paceKmh * 10) / 10, met }
}

export function totalBurnedToday(
  workouts: WorkoutActivity[],
  steps: number,
  weightKg: number,
): { workoutKcal: number; stepKcal: number; total: number } {
  const workoutKcal = workouts.reduce((s, w) => s + w.caloriesBurned, 0)
  const workoutSteps = workouts.reduce((s, w) => s + (w.steps ?? 0), 0)
  const extraSteps = Math.max(0, steps - workoutSteps)
  const stepKcal = caloriesFromSteps(extraSteps, weightKg)
  return { workoutKcal, stepKcal, total: workoutKcal + stepKcal }
}

export interface GoalProjection {
  dietDeficit: number
  exercisePerDay: number
  combinedDaily: number
  weeklyKg: number
  weeks: number
  label: string
  detail: string
}

export function projectGoalSpeed(
  profile: Profile,
  avgExerciseKcalPerDay: number,
): GoalProjection[] {
  const tdee = calcTdee(profile)
  const target = calcDailyTargets(profile)
  const dietDeficit = Math.max(0, Math.round(tdee - target.calories))
  const kgLeft = Math.abs(profile.weightKg - profile.goalWeightKg)
  const losing = profile.weightKg > profile.goalWeightKg

  const scenarios: { label: string; exercise: number; detail: string }[] = [
    {
      label: 'Diet only',
      exercise: 0,
      detail: 'Stick to your calorie target without extra logged movement',
    },
    {
      label: 'Current average burn',
      exercise: Math.round(avgExerciseKcalPerDay),
      detail: 'Based on your recent logged steps & workouts',
    },
    {
      label: '+ Daily brisk 30-min walk',
      exercise: caloriesFromMet(4.3, profile.weightKg, 30),
      detail: 'Add one outdoor brisk walk most days',
    },
    {
      label: '+ 8,000 steps / day',
      exercise: caloriesFromSteps(8000, profile.weightKg),
      detail: 'Step-focused plan on top of daily living',
    },
    {
      label: '+ Walk 45 min + light strength',
      exercise:
        caloriesFromMet(4.3, profile.weightKg, 45) +
        caloriesFromMet(5.0, profile.weightKg, 20),
      detail: 'Higher activity days for a faster timeline',
    },
  ]

  return scenarios.map((s) => {
    const combined = losing ? dietDeficit + s.exercise : Math.max(0, s.exercise - dietDeficit)
    const weeklyKg = Math.round(((combined * 7) / 7700) * 100) / 100
    const weeks =
      weeklyKg <= 0 ? 0 : Math.max(1, Math.ceil(kgLeft / Math.max(weeklyKg, 0.05)))
    return {
      dietDeficit,
      exercisePerDay: s.exercise,
      combinedDaily: combined,
      weeklyKg: losing ? -weeklyKg : weeklyKg,
      weeks,
      label: s.label,
      detail: s.detail,
    }
  })
}

export function previewActivityBurn(
  activityId: string,
  minutes: number,
  weightKg: number,
): number {
  return caloriesFromMet(getActivity(activityId).met, weightKg, minutes)
}
