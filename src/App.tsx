import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { Onboarding } from './components/Onboarding'
import { BottomNav } from './components/BottomNav'
import { TodayView } from './components/TodayView'
import { EatView } from './components/EatView'
import { MoveView } from './components/MoveView'
import { CycleView } from './components/CycleView'
import { PhotosView } from './components/PhotosView'
import { YouView } from './components/YouView'
import type { TabId } from './types'

function Shell() {
  const { state } = useApp()
  const [tab, setTab] = useState<TabId>('today')
  const [showPhotos, setShowPhotos] = useState(false)

  if (!state.profile.onboardingComplete) {
    return (
      <div className="app-shell">
        <Onboarding />
      </div>
    )
  }

  return (
    <div className="app-shell">
      {showPhotos ? (
        <>
          <button
            type="button"
            className="btn btn-ghost fade-up"
            style={{ marginBottom: '0.75rem' }}
            onClick={() => setShowPhotos(false)}
          >
            ← Back
          </button>
          <PhotosView />
        </>
      ) : (
        <>
          {tab === 'today' && <TodayView onOpenPhotos={() => setShowPhotos(true)} onOpenMove={() => setTab('move')} />}
          {tab === 'eat' && <EatView />}
          {tab === 'move' && <MoveView />}
          {tab === 'cycle' && <CycleView />}
          {tab === 'you' && (
            <YouView onOpenPhotos={() => setShowPhotos(true)} />
          )}
        </>
      )}
      {!showPhotos && <BottomNav tab={tab} onChange={setTab} />}
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
