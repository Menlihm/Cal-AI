import type {
  ActivityLevel,
  GoalPace,
  MacroTargets,
  NutrientTarget,
  Profile,
  Sex,
} from '../types'

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const PACE_DEFICIT: Record<GoalPace, number> = {
  gentle: 300,
  steady: 500,
  focused: 700,
}

/** Mifflin–St Jeor BMR */
export function calcBmr(profile: Pick<Profile, 'sex' | 'age' | 'heightCm' | 'weightKg'>): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age
  return profile.sex === 'male' ? base + 5 : base - 161
}

export function calcTdee(profile: Profile): number {
  return calcBmr(profile) * ACTIVITY_MULTIPLIER[profile.activity]
}

export function calcDailyTargets(profile: Profile): MacroTargets {
  const tdee = calcTdee(profile)
  const losing = profile.weightKg > profile.goalWeightKg
  const gaining = profile.weightKg < profile.goalWeightKg
  let calories = tdee

  if (losing) {
    calories = tdee - PACE_DEFICIT[profile.pace]
  } else if (gaining) {
    calories = tdee + PACE_DEFICIT[profile.pace] * 0.6
  }

  const floor = profile.sex === 'female' ? 1200 : 1500
  calories = Math.max(floor, Math.round(calories))

  // Higher protein supports satiety and lean mass during fat loss
  const proteinG = Math.round(profile.weightKg * (losing ? 1.8 : 1.6))
  const fatG = Math.round((calories * 0.28) / 9)
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4))
  const fiberG = profile.sex === 'female' ? 25 : 38
  const waterMl = Math.round(profile.weightKg * 35)

  return { calories, proteinG, carbsG, fatG, fiberG, waterMl }
}

export function weeklyChangeKg(profile: Profile): number {
  const tdee = calcTdee(profile)
  const targets = calcDailyTargets(profile)
  const dailyDelta = targets.calories - tdee
  return Math.round((dailyDelta * 7) / 7700 * 100) / 100
}

export function getVitaminTargets(sex: Sex, age: number): NutrientTarget[] {
  const female = sex === 'female'
  return [
    {
      id: 'vitamin_a',
      name: 'Vitamin A',
      amount: female ? 700 : 900,
      unit: 'mcg',
      why: 'Eyes, skin, and immune support',
    },
    {
      id: 'vitamin_c',
      name: 'Vitamin C',
      amount: female ? 75 : 90,
      unit: 'mg',
      why: 'Collagen, immunity, iron absorption',
    },
    {
      id: 'vitamin_d',
      name: 'Vitamin D',
      amount: age >= 70 ? 20 : 15,
      unit: 'mcg',
      why: 'Bones, mood, and hormone balance',
    },
    {
      id: 'vitamin_e',
      name: 'Vitamin E',
      amount: 15,
      unit: 'mg',
      why: 'Antioxidant cell protection',
    },
    {
      id: 'vitamin_k',
      name: 'Vitamin K',
      amount: female ? 90 : 120,
      unit: 'mcg',
      why: 'Blood clotting and bone health',
    },
    {
      id: 'thiamin',
      name: 'Thiamin (B1)',
      amount: female ? 1.1 : 1.2,
      unit: 'mg',
      why: 'Energy from carbs',
    },
    {
      id: 'riboflavin',
      name: 'Riboflavin (B2)',
      amount: female ? 1.1 : 1.3,
      unit: 'mg',
      why: 'Energy metabolism',
    },
    {
      id: 'niacin',
      name: 'Niacin (B3)',
      amount: female ? 14 : 16,
      unit: 'mg',
      why: 'Nervous system and digestion',
    },
    {
      id: 'b6',
      name: 'Vitamin B6',
      amount: age > 50 ? (female ? 1.5 : 1.7) : (female ? 1.3 : 1.3),
      unit: 'mg',
      why: 'Mood, PMS support, protein metabolism',
    },
    {
      id: 'folate',
      name: 'Folate',
      amount: 400,
      unit: 'mcg',
      why: 'Cell growth and red blood cells',
    },
    {
      id: 'b12',
      name: 'Vitamin B12',
      amount: 2.4,
      unit: 'mcg',
      why: 'Nerves and energy',
    },
    {
      id: 'calcium',
      name: 'Calcium',
      amount: age > 50 ? (female ? 1200 : 1000) : 1000,
      unit: 'mg',
      why: 'Bones; rises in luteal phase needs',
    },
    {
      id: 'iron',
      name: 'Iron',
      amount: female && age < 51 ? 18 : 8,
      unit: 'mg',
      why: female ? 'Higher needs with menstruation' : 'Oxygen transport',
    },
    {
      id: 'magnesium',
      name: 'Magnesium',
      amount: female ? (age > 30 ? 320 : 310) : age > 30 ? 420 : 400,
      unit: 'mg',
      why: 'Sleep, cramps, stress, blood sugar',
    },
    {
      id: 'zinc',
      name: 'Zinc',
      amount: female ? 8 : 11,
      unit: 'mg',
      why: 'Immunity, hormones, wound healing',
    },
    {
      id: 'potassium',
      name: 'Potassium',
      amount: 3400,
      unit: 'mg',
      why: 'Fluid balance and blood pressure',
    },
    {
      id: 'omega3',
      name: 'Omega-3 (ALA)',
      amount: female ? 1.1 : 1.6,
      unit: 'g',
      why: 'Inflammation and heart health',
    },
  ]
}

export const QUICK_FOODS = [
  { name: 'Greek yogurt + berries', calories: 180, proteinG: 17, carbsG: 18, fatG: 4 },
  { name: 'Banana + peanut butter', calories: 250, proteinG: 7, carbsG: 30, fatG: 12 },
  { name: 'Apple + cheese stick', calories: 170, proteinG: 7, carbsG: 20, fatG: 7 },
  { name: 'Handful of almonds', calories: 160, proteinG: 6, carbsG: 6, fatG: 14 },
  { name: 'Boiled eggs (2)', calories: 140, proteinG: 12, carbsG: 1, fatG: 10 },
  { name: 'Oatmeal with milk', calories: 280, proteinG: 12, carbsG: 42, fatG: 7 },
  { name: 'Chicken + rice bowl', calories: 450, proteinG: 35, carbsG: 45, fatG: 12 },
  { name: 'Salmon + veggies', calories: 420, proteinG: 34, carbsG: 12, fatG: 24 },
  { name: 'Lentil soup bowl', calories: 320, proteinG: 18, carbsG: 45, fatG: 6 },
  { name: 'Smoothie (protein)', calories: 300, proteinG: 25, carbsG: 30, fatG: 8 },
  { name: 'Whole-grain toast + avocado', calories: 280, proteinG: 8, carbsG: 28, fatG: 16 },
  { name: 'Cottage cheese cup', calories: 160, proteinG: 20, carbsG: 6, fatG: 5 },
  { name: 'Dark chocolate square (70%)', calories: 90, proteinG: 1, carbsG: 8, fatG: 6 },
  { name: 'Hummus + carrot sticks', calories: 180, proteinG: 6, carbsG: 18, fatG: 10 },
] as const

export function estimateCaloriesToGoal(profile: Profile): {
  weeks: number
  kgLeft: number
} {
  const kgLeft = Math.abs(profile.weightKg - profile.goalWeightKg)
  const weekly = Math.abs(weeklyChangeKg(profile)) || 0.25
  const weeks = Math.ceil(kgLeft / weekly)
  return { weeks, kgLeft: Math.round(kgLeft * 10) / 10 }
}
