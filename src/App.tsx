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
    return <Onboarding />
  }

  const openPhotos = () => setShowPhotos(true)
  const tabs: TabId[] =
    state.profile.sex === 'female'
      ? ['today', 'eat', 'move', 'cycle', 'you']
      : ['today', 'eat', 'move', 'you']

  return (
    <div className="shell">
      {showPhotos ? (
        <PhotosView onBack={() => setShowPhotos(false)} />
      ) : (
        <>
          {tab === 'today' && (
            <TodayView
              onOpenPhotos={openPhotos}
              onOpenMove={() => setTab('move')}
              onOpenEat={() => setTab('eat')}
            />
          )}
          {tab === 'eat' && <EatView />}
          {tab === 'move' && <MoveView />}
          {tab === 'cycle' && <CycleView />}
          {tab === 'you' && <YouView onOpenPhotos={openPhotos} />}
        </>
      )}
      {!showPhotos && <BottomNav tab={tab} onChange={setTab} tabs={tabs} />}
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
