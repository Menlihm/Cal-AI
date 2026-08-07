import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { Onboarding } from './components/Onboarding'
import { BottomNav } from './components/BottomNav'
import { TodayView } from './components/TodayView'
import { EatView } from './components/EatView'
import { CycleView } from './components/CycleView'
import { PhotosView } from './components/PhotosView'
import { YouView } from './components/YouView'
import type { TabId } from './types'

function Shell() {
  const { state } = useApp()
  const [tab, setTab] = useState<TabId>('today')

  if (!state.profile.onboardingComplete) {
    return (
      <div className="app-shell">
        <Onboarding />
      </div>
    )
  }

  return (
    <div className="app-shell">
      {tab === 'today' && <TodayView />}
      {tab === 'eat' && <EatView />}
      {tab === 'cycle' && <CycleView />}
      {tab === 'photos' && <PhotosView />}
      {tab === 'you' && <YouView />}
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
