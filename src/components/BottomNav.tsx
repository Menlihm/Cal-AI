import { Icon, type IconName } from './ui/Icon'
import type { TabId } from '../types'

const TABS: { id: TabId; label: string; icon: IconName }[] = [
  { id: 'today', label: 'Today', icon: 'home' },
  { id: 'eat', label: 'Eat', icon: 'fork' },
  { id: 'move', label: 'Move', icon: 'activity' },
  { id: 'cycle', label: 'Cycle', icon: 'cycle' },
  { id: 'you', label: 'You', icon: 'user' },
]

export function BottomNav({
  tab,
  onChange,
  tabs = TABS.map((t) => t.id),
}: {
  tab: TabId
  onChange: (tab: TabId) => void
  tabs?: TabId[]
}) {
  const visible = TABS.filter((t) => tabs.includes(t.id))
  return (
    <nav className="tabbar" aria-label="Main navigation">
      {visible.map((t) => (
        <button
          key={t.id}
          type="button"
          className={tab === t.id ? 'active' : ''}
          onClick={() => onChange(t.id)}
          aria-current={tab === t.id ? 'page' : undefined}
        >
          <span className="tab-pill" />
          <Icon name={t.icon} size={22} strokeWidth={tab === t.id ? 2.1 : 1.7} />
          {t.label}
        </button>
      ))}
    </nav>
  )
}
