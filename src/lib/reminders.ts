import type { DayLog, Profile } from '../types'

export function minutesSinceLastBite(log: DayLog | undefined, now = Date.now()): number | null {
  if (!log?.foods.length) return null
  const latest = Math.max(...log.foods.map((f) => new Date(f.at).getTime()))
  return Math.floor((now - latest) / 60000)
}

export function shouldNudge(
  profile: Profile,
  log: DayLog | undefined,
  now = new Date(),
): { nudge: boolean; minutes: number | null; message: string } {
  if (!profile.remindersEnabled) {
    return { nudge: false, minutes: null, message: '' }
  }

  const hour = now.getHours()
  // Quiet overnight
  if (hour < 7 || hour >= 22) {
    return { nudge: false, minutes: null, message: '' }
  }

  const mins = minutesSinceLastBite(log, now.getTime())
  const gap = profile.reminderMinutes || 180

  if (!log?.foods.length) {
    if (hour >= 9) {
      return {
        nudge: true,
        minutes: null,
        message: 'No bites logged yet — even a small snack counts. Your body likes steady fuel.',
      }
    }
    return { nudge: false, minutes: null, message: '' }
  }

  if (mins != null && mins >= gap) {
    return {
      nudge: true,
      minutes: mins,
      message: `It's been about ${formatDuration(mins)} since your last bite. Have something small.`,
    }
  }

  return { nudge: false, minutes: mins, message: '' }
}

export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function sendEatReminder(body: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    new Notification('Cal AI — time for a small bite', {
      body,
      icon: '/favicon.svg',
      tag: 'calai-eat-reminder',
    })
  } catch {
    // ignore unsupported environments
  }
}
