import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { CravingSuggestion, CyclePhase, Profile } from '../types'

/**
 * Cycle-phase food guidance based on common clinical nutrition themes:
 * - Menstrual: replace iron/loss, magnesium for cramps, anti-inflammatory foods
 * - Follicular: rising estrogen — lean protein, fermented foods, lighter meals
 * - Ovulatory: fiber + cruciferous veggies to support hormone metabolism
 * - Luteal: progesterone ↑ can increase appetite/cravings; complex carbs,
 *   magnesium, B6, calcium, and serotonin-friendly snacks help
 *
 * Sources synthesized from NIH micronutrient RDAs, ACOG menstrual health
 * education themes, and peer-reviewed nutrition reviews on PMS/cycle diet.
 * Not medical advice — personalized clinical care may differ.
 */

export function getCycleDay(profile: Profile, today = new Date()): number | null {
  if (!profile.tracksCycle || !profile.lastPeriodStart) return null
  const start = parseISO(profile.lastPeriodStart)
  const diff = differenceInCalendarDays(today, start)
  if (diff < 0) return null
  const length = Math.max(21, Math.min(40, profile.cycleLengthDays || 28))
  return (diff % length) + 1
}

export function getCyclePhase(profile: Profile, today = new Date()): CyclePhase {
  const day = getCycleDay(profile, today)
  if (day == null) return 'unknown'

  const periodLen = Math.max(2, Math.min(10, profile.periodLengthDays || 5))
  if (day <= periodLen) return 'menstrual'
  if (day <= periodLen + 7) return 'follicular'
  if (day <= periodLen + 10) return 'ovulatory'
  return 'luteal'
}

export function phaseLabel(phase: CyclePhase): string {
  switch (phase) {
    case 'menstrual':
      return 'Menstrual'
    case 'follicular':
      return 'Follicular'
    case 'ovulatory':
      return 'Ovulatory'
    case 'luteal':
      return 'Luteal'
    default:
      return 'Not tracking'
  }
}

export function phaseBlurb(phase: CyclePhase): string {
  switch (phase) {
    case 'menstrual':
      return 'Energy may dip. Warm, iron-rich, anti-inflammatory meals feel best.'
    case 'follicular':
      return 'Energy often rises. Fresh, lighter plates and lean protein land well.'
    case 'ovulatory':
      return 'Peak energy for many. Fiber-rich and colorful plates support balance.'
    case 'luteal':
      return 'Appetite and cravings can climb. Steady carbs + magnesium help.'
    default:
      return 'Log your period start to unlock phase-aware food ideas.'
  }
}

const PHASE_SUGGESTIONS: Record<Exclude<CyclePhase, 'unknown'>, CravingSuggestion[]> = {
  menstrual: [
    {
      title: 'Warm & iron-replenishing',
      foods: ['Lentil stew', 'Spinach omelette', 'Beef + sweet potato', 'Fortified cereal + berries'],
      why: 'Blood loss raises iron needs. Pair plant iron with vitamin C for better absorption.',
      nutrients: ['Iron', 'Vitamin C', 'Protein'],
    },
    {
      title: 'Cramp-soothing comfort',
      foods: ['Dark chocolate (70%+)', 'Banana + yogurt', 'Chamomile tea + oats', 'Salmon + quinoa'],
      why: 'Magnesium and omega-3s are linked with lower menstrual discomfort in nutrition research.',
      nutrients: ['Magnesium', 'Omega-3', 'B6'],
    },
  ],
  follicular: [
    {
      title: 'Light & vibrant',
      foods: ['Greek yogurt parfait', 'Chicken grain bowl', 'Kimchi + rice', 'Citrus + avocado toast'],
      why: 'Rising estrogen often pairs with better insulin sensitivity — fresh, protein-forward meals fit.',
      nutrients: ['Probiotics', 'Protein', 'Folate'],
    },
    {
      title: 'Build-the-week fuel',
      foods: ['Eggs + greens', 'Berry smoothie', 'Turkey wrap', 'Edamame snack'],
      why: 'Support training and recovery while appetite is often more predictable.',
      nutrients: ['B vitamins', 'Zinc', 'Fiber'],
    },
  ],
  ovulatory: [
    {
      title: 'Colorful & fiber-rich',
      foods: ['Broccoli stir-fry', 'Brussels + salmon', 'Berry chia pudding', 'Kale salad + chickpeas'],
      why: 'Cruciferous veggies and fiber support healthy estrogen metabolism around ovulation.',
      nutrients: ['Fiber', 'Folate', 'Antioxidants'],
    },
    {
      title: 'Hydrating peak-energy plates',
      foods: ['Watermelon + feta', 'Cold soba + tofu', 'Cucumber hummus plate', 'Citrus water'],
      why: 'Stay light but nourished; hydration supports energy and skin.',
      nutrients: ['Potassium', 'Vitamin C', 'Water'],
    },
  ],
  luteal: [
    {
      title: 'Smart carb cravings',
      foods: ['Oatmeal + peanut butter', 'Sweet potato + cottage cheese', 'Whole-grain toast + egg', 'Popcorn + dark chocolate'],
      why: 'Progesterone can increase appetite and carb desire. Complex carbs help serotonin without a sugar crash.',
      nutrients: ['Complex carbs', 'Tryptophan', 'Fiber'],
    },
    {
      title: 'PMS-supportive picks',
      foods: ['Pumpkin seeds', 'Banana smoothie', 'Leafy greens + tahini', 'Yogurt + berries'],
      why: 'Magnesium, calcium, and B6 are commonly studied for PMS symptom support.',
      nutrients: ['Magnesium', 'Calcium', 'B6'],
    },
  ],
}

export function getCravingSuggestions(phase: CyclePhase): CravingSuggestion[] {
  if (phase === 'unknown') {
    return [
      {
        title: 'Everyday balanced snacks',
        foods: ['Apple + cheese', 'Handful of almonds', 'Greek yogurt', 'Hummus + carrots'],
        why: 'Protein + fiber snacks keep blood sugar steadier between meals.',
        nutrients: ['Protein', 'Fiber', 'Healthy fat'],
      },
    ]
  }
  return PHASE_SUGGESTIONS[phase]
}

export function cycleProgress(profile: Profile): { day: number | null; length: number; pct: number } {
  const day = getCycleDay(profile)
  const length = Math.max(21, Math.min(40, profile.cycleLengthDays || 28))
  const pct = day == null ? 0 : Math.min(100, Math.round((day / length) * 100))
  return { day, length, pct }
}
