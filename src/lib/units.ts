import type { Units } from '../types'

export const KG_PER_LB = 0.45359237

export function kgToDisplay(kg: number, units: Units): number {
  return units === 'imperial' ? Math.round((kg / KG_PER_LB) * 10) / 10 : Math.round(kg * 10) / 10
}

export function displayToKg(value: number, units: Units): number {
  return units === 'imperial' ? Math.round(value * KG_PER_LB * 10) / 10 : value
}

export function weightUnit(units: Units): string {
  return units === 'imperial' ? 'lb' : 'kg'
}

export function formatWeight(kg: number, units: Units): string {
  return `${kgToDisplay(kg, units)} ${weightUnit(units)}`
}

export function cmToDisplay(cm: number, units: Units): { primary: number; secondary?: number } {
  if (units === 'metric') return { primary: Math.round(cm) }
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches - feet * 12)
  return { primary: feet, secondary: inches }
}

export function displayToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54)
}

export function heightLabel(cm: number, units: Units): string {
  if (units === 'metric') return `${Math.round(cm)} cm`
  const { primary, secondary } = cmToDisplay(cm, units)
  return `${primary}' ${secondary ?? 0}"`
}

export function kmToDisplay(km: number, units: Units): number {
  return units === 'imperial' ? Math.round(km * 0.621371 * 100) / 100 : Math.round(km * 100) / 100
}

export function distanceUnit(units: Units): string {
  return units === 'imperial' ? 'mi' : 'km'
}
