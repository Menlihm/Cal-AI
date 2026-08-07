import type { ReactNode } from 'react'
import type { TabId } from '../types'

const TABS: { id: TabId; label: string; icon: ReactNode }[] = [
  {
    id: 'today',
    label: 'Today',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3c0 8-6 11-6 16a6 6 0 0 0 12 0c0-5-6-8-6-16Z" />
      </svg>
    ),
  },
  {
    id: 'eat',
    label: 'Eat',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 3v8a2 2 0 0 0 4 0V3" strokeLinecap="round" />
        <path d="M10 13v8" strokeLinecap="round" />
        <path d="M16 3v18" strokeLinecap="round" />
        <path d="M16 3c2 2 2 5 0 7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'cycle',
    label: 'Cycle',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4a8 8 0 0 1 8 8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'photos',
    label: 'Photos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <circle cx="9" cy="11" r="2" />
        <path d="m13 15 2-2 4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'you',
    label: 'You',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5" strokeLinecap="round" />
      </svg>
    ),
  },
]

export function BottomNav({
  tab,
  onChange,
}: {
  tab: TabId
  onChange: (tab: TabId) => void
}) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={tab === t.id ? 'active' : ''}
          onClick={() => onChange(t.id)}
          aria-current={tab === t.id ? 'page' : undefined}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </nav>
  )
}
