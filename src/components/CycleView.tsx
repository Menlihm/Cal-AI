import { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  cycleProgress,
  getCravingSuggestions,
  getCycleDay,
  getCyclePhase,
  phaseBlurb,
  phaseLabel,
} from '../lib/cycle'
import { todayKey } from '../lib/storage'

const PHASES = [
  {
    id: 'menstrual',
    title: 'Menstrual',
    tip: 'Iron, magnesium, warmth, anti-inflammatory omega-3s.',
  },
  {
    id: 'follicular',
    title: 'Follicular',
    tip: 'Lean protein, fermented foods, lighter vibrant plates.',
  },
  {
    id: 'ovulatory',
    title: 'Ovulatory',
    tip: 'Fiber, cruciferous veggies, colorful antioxidants.',
  },
  {
    id: 'luteal',
    title: 'Luteal',
    tip: 'Complex carbs, magnesium, calcium, B6 for craving waves.',
  },
] as const

export function CycleView() {
  const { state, updateProfile, markPeriodStarted } = useApp()
  const { profile } = state
  const phase = getCyclePhase(profile)
  const day = getCycleDay(profile)
  const progress = cycleProgress(profile)
  const suggestions = getCravingSuggestions(phase)
  const [date, setDate] = useState(profile.lastPeriodStart ?? todayKey())

  if (profile.sex !== 'female') {
    return (
      <div className="stack-lg fade-up">
        <header className="stack" style={{ gap: '0.35rem' }}>
          <div className="eyebrow">Cycle</div>
          <h1 style={{ fontSize: '2rem' }}>Not needed for your profile</h1>
          <p>
            Cycle tracking and phase food ideas are available when your profile is set to female.
            You still get full calorie, vitamin, photo, and reminder tools.
          </p>
        </header>
      </div>
    )
  }

  return (
    <div className="stack-lg">
      <header className="stack fade-up" style={{ gap: '0.35rem' }}>
        <div className="eyebrow">Rhythm</div>
        <h1 style={{ fontSize: '2rem' }}>Menstrual cycle</h1>
        <p>Log your period and get food ideas matched to how many people feel in each phase.</p>
      </header>

      <section className="panel-solid stack fade-up">
        <div className="between">
          <div>
            <div className="eyebrow">Current phase</div>
            <h2 style={{ fontSize: '1.8rem', marginTop: '0.2rem' }}>{phaseLabel(phase)}</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--forest)' }}>
              {day ?? '—'}
            </strong>
            <div className="tiny muted">cycle day</div>
          </div>
        </div>
        <div className="phase-bar">
          <span style={{ width: `${progress.pct}%` }} />
        </div>
        <p>{phaseBlurb(phase)}</p>
        <div className="row">
          <div className="field" style={{ flex: 1, minWidth: 180 }}>
            <label htmlFor="periodDate">Period started</label>
            <input
              id="periodDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ alignSelf: 'end' }}
            onClick={() => markPeriodStarted(date)}
          >
            Save start
          </button>
        </div>
        <div className="stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
          <div className="field">
            <label htmlFor="cLen">Typical cycle length</label>
            <input
              id="cLen"
              type="number"
              min={21}
              max={40}
              value={profile.cycleLengthDays}
              onChange={(e) => updateProfile({ cycleLengthDays: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label htmlFor="pLen">Period length</label>
            <input
              id="pLen"
              type="number"
              min={2}
              max={10}
              value={profile.periodLengthDays}
              onChange={(e) => updateProfile({ periodLengthDays: Number(e.target.value) })}
            />
          </div>
        </div>
      </section>

      <section className="panel stack fade-up-delay">
        <h2 style={{ fontSize: '1.15rem' }}>Phase map</h2>
        {PHASES.map((p) => (
          <div key={p.id} className="list-row">
            <div>
              <strong style={{ color: phase === p.id ? 'var(--leaf)' : 'var(--forest-deep)' }}>
                {p.title}
                {phase === p.id ? ' · now' : ''}
              </strong>
              <div className="tiny muted">{p.tip}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="panel-solid stack fade-up">
        <h2 style={{ fontSize: '1.15rem' }}>What you could feel like eating</h2>
        <p className="tiny">
          Based on widely shared nutrition research themes for menstrual health (NIH micronutrients,
          PMS nutrient reviews, and cycle-synced diet education). Listen to your body; this isn’t a
          diagnosis.
        </p>
        {suggestions.map((s) => (
          <div key={s.title} className="suggestion">
            <h3>{s.title}</h3>
            <p className="tiny">{s.why}</p>
            <div className="chip-row">
              {s.foods.map((f) => (
                <span key={f} className="chip">
                  {f}
                </span>
              ))}
            </div>
            <p className="tiny" style={{ marginTop: '0.5rem' }}>
              Nutrients: {s.nutrients.join(', ')}
            </p>
          </div>
        ))}
      </section>
    </div>
  )
}
