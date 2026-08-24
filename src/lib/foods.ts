import type { IconName } from '../components/ui/Icon'
import type { AllergyTag, DietPreference } from '../types'

export type FoodCategory =
  | 'protein'
  | 'carbs'
  | 'veggies'
  | 'fruit'
  | 'dairy'
  | 'snacks'
  | 'drinks'

export interface FoodItem {
  id: string
  name: string
  category: FoodCategory
  icon: IconName
  /** per serving */
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  serving: string
  tint: string
  diets: DietPreference[]
  allergens?: AllergyTag[]
}

export const FOOD_CATEGORIES: {
  id: FoodCategory
  label: string
  icon: IconName
  color: string
}[] = [
  { id: 'protein', label: 'Protein', icon: 'meat', color: '#ff5f6d' },
  { id: 'carbs', label: 'Carbs', icon: 'grain', color: '#ffb020' },
  { id: 'veggies', label: 'Veggies', icon: 'veggie', color: '#14b87a' },
  { id: 'fruit', label: 'Fruit', icon: 'fruit', color: '#ff8f4d' },
  { id: 'dairy', label: 'Dairy', icon: 'dairy', color: '#7b7bff' },
  { id: 'snacks', label: 'Snacks', icon: 'snack', color: '#e0715f' },
  { id: 'drinks', label: 'Drinks', icon: 'drink', color: '#23c9ff' },
]

export function categoryMeta(cat?: string) {
  return FOOD_CATEGORIES.find((c) => c.id === cat) ?? FOOD_CATEGORIES[0]
}

const ALL: DietPreference[] = ['omnivore', 'vegetarian', 'vegan', 'pescatarian']
const VEG: DietPreference[] = ['omnivore', 'vegetarian', 'pescatarian']
const MEAT: DietPreference[] = ['omnivore']
const SEA: DietPreference[] = ['omnivore', 'pescatarian']

export const FOODS: FoodItem[] = [
  // protein
  { id: 'chicken_breast', name: 'Grilled chicken breast', category: 'protein', icon: 'meat', calories: 220, proteinG: 41, carbsG: 0, fatG: 5, serving: '150 g', tint: '#ff5f6d', diets: MEAT },
  { id: 'salmon', name: 'Baked salmon', category: 'protein', icon: 'fish', calories: 310, proteinG: 34, carbsG: 0, fatG: 19, serving: '150 g', tint: '#ff8f6d', diets: SEA, allergens: ['fish'] },
  { id: 'eggs', name: 'Boiled eggs', category: 'protein', icon: 'egg', calories: 140, proteinG: 12, carbsG: 1, fatG: 10, serving: '2 eggs', tint: '#ffc247', diets: VEG, allergens: ['eggs'] },
  { id: 'tofu', name: 'Pan-fried tofu', category: 'protein', icon: 'leaf', calories: 190, proteinG: 18, carbsG: 5, fatG: 11, serving: '150 g', tint: '#14b87a', diets: ALL, allergens: ['soy'] },
  { id: 'lentils', name: 'Lentil bowl', category: 'protein', icon: 'grain', calories: 230, proteinG: 18, carbsG: 40, fatG: 1, serving: '1 bowl', tint: '#c98b3a', diets: ALL },
  { id: 'turkey', name: 'Turkey slices', category: 'protein', icon: 'meat', calories: 150, proteinG: 26, carbsG: 2, fatG: 4, serving: '120 g', tint: '#e0715f', diets: MEAT },
  { id: 'shrimp', name: 'Garlic shrimp', category: 'protein', icon: 'fish', calories: 170, proteinG: 30, carbsG: 2, fatG: 4, serving: '150 g', tint: '#ff7f9e', diets: SEA, allergens: ['shellfish'] },
  { id: 'beans', name: 'Black beans', category: 'protein', icon: 'grain', calories: 210, proteinG: 13, carbsG: 38, fatG: 1, serving: '1 cup', tint: '#8a6a4f', diets: ALL },

  // carbs
  { id: 'oatmeal', name: 'Oatmeal with milk', category: 'carbs', icon: 'grain', calories: 280, proteinG: 12, carbsG: 42, fatG: 7, serving: '1 bowl', tint: '#ffb020', diets: VEG, allergens: ['dairy', 'gluten'] },
  { id: 'rice', name: 'Steamed rice', category: 'carbs', icon: 'grain', calories: 205, proteinG: 4, carbsG: 45, fatG: 0, serving: '1 cup', tint: '#e8c96a', diets: ALL },
  { id: 'sweet_potato', name: 'Sweet potato', category: 'carbs', icon: 'veggie', calories: 180, proteinG: 4, carbsG: 41, fatG: 0, serving: '1 medium', tint: '#ff8f4d', diets: ALL },
  { id: 'toast_avocado', name: 'Avocado toast', category: 'carbs', icon: 'grain', calories: 280, proteinG: 8, carbsG: 28, fatG: 16, serving: '1 slice', tint: '#9bc76a', diets: ALL, allergens: ['gluten'] },
  { id: 'quinoa', name: 'Quinoa', category: 'carbs', icon: 'grain', calories: 222, proteinG: 8, carbsG: 39, fatG: 4, serving: '1 cup', tint: '#d5a85f', diets: ALL },
  { id: 'pasta', name: 'Whole-grain pasta', category: 'carbs', icon: 'grain', calories: 320, proteinG: 13, carbsG: 62, fatG: 3, serving: '1 plate', tint: '#e3b169', diets: ALL, allergens: ['gluten'] },

  // veggies
  { id: 'salad', name: 'Green salad', category: 'veggies', icon: 'veggie', calories: 90, proteinG: 3, carbsG: 10, fatG: 5, serving: '1 bowl', tint: '#14b87a', diets: ALL },
  { id: 'broccoli', name: 'Steamed broccoli', category: 'veggies', icon: 'veggie', calories: 55, proteinG: 4, carbsG: 11, fatG: 1, serving: '1 cup', tint: '#3f9b5f', diets: ALL },
  { id: 'spinach', name: 'Sautéed spinach', category: 'veggies', icon: 'leaf', calories: 70, proteinG: 5, carbsG: 7, fatG: 3, serving: '1 cup', tint: '#2f8f57', diets: ALL },
  { id: 'roast_veg', name: 'Roasted veggies', category: 'veggies', icon: 'veggie', calories: 140, proteinG: 4, carbsG: 20, fatG: 6, serving: '1 plate', tint: '#7fae4e', diets: ALL },

  // fruit
  { id: 'banana', name: 'Banana', category: 'fruit', icon: 'fruit', calories: 105, proteinG: 1, carbsG: 27, fatG: 0, serving: '1 medium', tint: '#f5c449', diets: ALL },
  { id: 'apple', name: 'Apple', category: 'fruit', icon: 'fruit', calories: 95, proteinG: 0, carbsG: 25, fatG: 0, serving: '1 medium', tint: '#f0645c', diets: ALL },
  { id: 'berries', name: 'Mixed berries', category: 'fruit', icon: 'fruit', calories: 70, proteinG: 1, carbsG: 17, fatG: 0, serving: '1 cup', tint: '#c05fd0', diets: ALL },
  { id: 'orange', name: 'Orange', category: 'fruit', icon: 'fruit', calories: 80, proteinG: 2, carbsG: 19, fatG: 0, serving: '1 large', tint: '#ff9a3d', diets: ALL },

  // dairy
  { id: 'greek_yogurt', name: 'Greek yogurt + berries', category: 'dairy', icon: 'dairy', calories: 180, proteinG: 17, carbsG: 18, fatG: 4, serving: '1 cup', tint: '#7b7bff', diets: VEG, allergens: ['dairy'] },
  { id: 'cottage', name: 'Cottage cheese', category: 'dairy', icon: 'dairy', calories: 160, proteinG: 20, carbsG: 6, fatG: 5, serving: '1 cup', tint: '#8f8ff5', diets: VEG, allergens: ['dairy'] },
  { id: 'cheese_stick', name: 'Cheese stick', category: 'dairy', icon: 'dairy', calories: 80, proteinG: 6, carbsG: 1, fatG: 6, serving: '1 stick', tint: '#f2c14e', diets: VEG, allergens: ['dairy'] },
  { id: 'milk', name: 'Glass of milk', category: 'dairy', icon: 'drink', calories: 120, proteinG: 8, carbsG: 12, fatG: 5, serving: '250 ml', tint: '#a3b8ff', diets: VEG, allergens: ['dairy'] },

  // snacks
  { id: 'almonds', name: 'Handful of almonds', category: 'snacks', icon: 'snack', calories: 160, proteinG: 6, carbsG: 6, fatG: 14, serving: '28 g', tint: '#c08a5a', diets: ALL, allergens: ['nuts'] },
  { id: 'dark_choc', name: 'Dark chocolate 70%', category: 'snacks', icon: 'snack', calories: 90, proteinG: 1, carbsG: 8, fatG: 6, serving: '2 squares', tint: '#7b4a2d', diets: ALL },
  { id: 'hummus', name: 'Hummus + carrots', category: 'snacks', icon: 'snack', calories: 180, proteinG: 6, carbsG: 18, fatG: 10, serving: '1 plate', tint: '#d3a45e', diets: ALL, allergens: ['sesame'] },
  { id: 'pb_banana', name: 'Banana + peanut butter', category: 'snacks', icon: 'snack', calories: 250, proteinG: 7, carbsG: 30, fatG: 12, serving: '1 serving', tint: '#c98d43', diets: ALL, allergens: ['nuts'] },
  { id: 'popcorn', name: 'Air-popped popcorn', category: 'snacks', icon: 'snack', calories: 110, proteinG: 3, carbsG: 22, fatG: 1, serving: '3 cups', tint: '#e8c96a', diets: ALL },
  { id: 'protein_bar', name: 'Protein bar', category: 'snacks', icon: 'snack', calories: 210, proteinG: 20, carbsG: 21, fatG: 7, serving: '1 bar', tint: '#8a6a4f', diets: VEG },

  // drinks
  { id: 'protein_shake', name: 'Protein shake', category: 'drinks', icon: 'drink', calories: 300, proteinG: 25, carbsG: 30, fatG: 8, serving: '1 shake', tint: '#23c9ff', diets: VEG, allergens: ['dairy'] },
  { id: 'smoothie', name: 'Fruit smoothie', category: 'drinks', icon: 'drink', calories: 220, proteinG: 5, carbsG: 45, fatG: 2, serving: '400 ml', tint: '#ff7fae', diets: ALL },
  { id: 'coffee_milk', name: 'Latte', category: 'drinks', icon: 'drink', calories: 120, proteinG: 7, carbsG: 11, fatG: 5, serving: '250 ml', tint: '#a97a4f', diets: VEG, allergens: ['dairy'] },
  { id: 'tea', name: 'Herbal tea', category: 'drinks', icon: 'drink', calories: 2, proteinG: 0, carbsG: 0, fatG: 0, serving: '1 cup', tint: '#7fae4e', diets: ALL },
]

export function findFood(id: string): FoodItem | undefined {
  return FOODS.find((f) => f.id === id)
}

export function filterFoods(opts: {
  query?: string
  category?: FoodCategory | 'all'
  diet?: DietPreference
  allergies?: AllergyTag[]
}): FoodItem[] {
  const q = opts.query?.trim().toLowerCase()
  return FOODS.filter((f) => {
    if (opts.category && opts.category !== 'all' && f.category !== opts.category) return false
    if (q && !f.name.toLowerCase().includes(q)) return false
    if (opts.diet && !f.diets.includes(opts.diet)) return false
    if (opts.allergies?.length && f.allergens?.some((a) => opts.allergies!.includes(a))) {
      return false
    }
    return true
  })
}

export const ALLERGY_TAGS: { id: AllergyTag; label: string }[] = [
  { id: 'gluten', label: 'Gluten' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'nuts', label: 'Nuts' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'soy', label: 'Soy' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'fish', label: 'Fish' },
  { id: 'sesame', label: 'Sesame' },
]

/** Best-effort icon + tint for a free-text or suggestion food name */
export function guessFoodVisual(name: string): { icon: IconName; tint: string; category: FoodCategory } {
  const n = name.toLowerCase()
  const match = FOODS.find((f) => n.includes(f.name.toLowerCase().split(' ')[0]))
  if (match) return { icon: match.icon, tint: match.tint, category: match.category }

  const rules: [RegExp, IconName, string, FoodCategory][] = [
    [/salmon|fish|tuna|sardine/, 'fish', '#ff8f6d', 'protein'],
    [/chicken|beef|turkey|steak|meat|pork/, 'meat', '#ff5f6d', 'protein'],
    [/egg/, 'egg', '#ffc247', 'protein'],
    [/yogurt|cheese|milk|latte/, 'dairy', '#7b7bff', 'dairy'],
    [/oat|rice|bread|toast|pasta|quinoa|cereal|grain|soba/, 'grain', '#ffb020', 'carbs'],
    [/salad|broccoli|spinach|kale|veg|greens|cucumber|brussels/, 'veggie', '#14b87a', 'veggies'],
    [/banana|apple|berry|berries|orange|citrus|watermelon|fruit/, 'fruit', '#ff8f4d', 'fruit'],
    [/smoothie|shake|tea|water|juice|drink/, 'drink', '#23c9ff', 'drinks'],
    [/chocolate|nut|almond|seed|popcorn|snack|hummus|bar/, 'snack', '#c08a5a', 'snacks'],
    [/tofu|lentil|bean|chickpea|edamame/, 'leaf', '#14b87a', 'protein'],
  ]
  for (const [re, icon, tint, category] of rules) {
    if (re.test(n)) return { icon, tint, category }
  }
  return { icon: 'fork', tint: '#8a94a6', category: 'snacks' }
}
