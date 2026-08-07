import { useState } from 'react'
import { format, parseISO } from 'date-fns'
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
import { guessFoodVisual } from '../lib/foods'
import { Icon, type IconName } from './ui/Icon'
import { Card, EmptyState, SectionHeader, Sheet } from './ui/primitives'
import { FoodThumb } from './FoodThumb'
import type { CyclePhase } from '../types'

const PHASES: {
  id: Exclude<CyclePhase, 'unknown'>
  title: string
  tip: string
  color: string
  icon: IconName
}[] = [
  {
    id: 'menstrual',
    title: 'Menstrual',
    tip: 'Iron, magnesium, warmth, anti-inflammatory omega-3s.',
    color: '#ff5f6d',
    icon: 'droplet',
  },
  {
    id: 'follicular',
    title: 'Follicular',
    tip: 'Lean protein, fermented foods, lighter vibrant plates.',
    color: '#14b87a',
    icon: 'leaf',
  },
  {
    id: 'ovulatory',
    title: 'Ovulatory',
    tip: 'Fiber, cruciferous veggies, colorful antioxidants.',
    color: '#ffb020',
    icon: 'sun',
  },
  {
    id: 'luteal',
    title: 'Luteal',
    tip: 'Complex carbs, magnesium, calcium, B6 for craving waves.',
    color: '#a77bff',
    icon: 'moon',
  },
]

export function CycleView() {
  const { state, updateProfile, markPeriodStarted, addFood } = useApp()
  const { profile } = state
  const phase = getCyclePhase(profile)
  const day = getCycleDay(profile)
  const progress = cycleProgress(profile)
  const suggestions = getCravingSuggestions(phase)
  const [logOpen, setLogOpen] = useState(false)
  const [date, setDate] = useState(profile.lastPeriodStart ?? todayKey())

  if (profile.sex !== 'female') {
    return (
      <div className="screen stack-lg">
        <header className="topbar">
          <div>
            <span className="eyebrow">Rhythm</span>
            <h1 className="title" style={{ marginTop: 2 }}>
              Cycle
            </h1>
          </div>
        </header>
        <Card>
          <EmptyState
            icon="cycle"
            title="Not part of your profile"
            body="Cycle tracking and phase-based food ideas turn on when your profile is set to female. Everything else in Cal AI works the same."
          />
        </Card>
      </div>
    )
  }

  const periodLen = profile.periodLengthDays || 5
  const cycleLen = progress.length
  const activePhase = PHASES.find((p) => p.id === phase)

  return (
    <div className="screen stack-lg">
      <header className="topbar">
        <div>
          <span className="eyebrow">Rhythm</span>
          <h1 className="title" style={{ marginTop: 2 }}>
            Cycle
          </h1>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setLogOpen(true)}>
          <Icon name="droplet" size={16} />
          Log period
        </button>
      </header>

      <Card hero className="rise">
        <div className="cycle-wheel">
          <CycleWheel
            cycleLength={cycleLen}
            periodLength={periodLen}
            day={day}
            size={228}
          />
          <div className="cw-center">
            <span className="eyebrow" style={{ color: activePhase?.color }}>
              {phaseLabel(phase)}
            </span>
            <span className="display" style={{ fontSize: '3rem' }}>
              {day ?? '—'}
            </span>
            <span className="rv-label">day of {cycleLen}</span>
          </div>
        </div>
        <p className="caption" style={{ textAlign: 'center', marginTop: 12 }}>
          {phaseBlurb(phase)}
        </p>
      </Card>

      <Card className="rise rise-1">
        <SectionHeader title="Phase map" icon="cycle" />
        <div className="stack" style={{ gap: 8, marginTop: 6 }}>
          {PHASES.map((p) => (
            <div key={p.id} className={`phase-card ${phase === p.id ? 'current' : ''}`}>
              <span
                className="thumb"
                style={{
                  background: `color-mix(in srgb, ${p.color} 18%, transparent)`,
                  color: p.color,
                  flex: '0 0 42px',
                  width: 42,
                  height: 42,
                }}
              >
                <Icon name={p.icon} size={20} />
              </span>
              <div className="grow">
                <div className="row" style={{ gap: 6 }}>
                  <span className="lr-title">{p.title}</span>
                  {phase === p.id && <span className="badge badge-brand">Now</span>}
                </div>
                <div className="lr-sub">{p.tip}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rise rise-2">
        <SectionHeader title="What you could feel like eating" icon="heart" />
        <p className="caption" style={{ marginBottom: 10 }}>
          Themes from micronutrient RDAs and menstrual-nutrition research. Listen to your body —
          this isn’t a diagnosis.
        </p>
        {suggestions.map((s) => (
          <div key={s.title} style={{ marginTop: 10 }}>
            <div className="row-between" style={{ marginBottom: 8 }}>
              <strong style={{ fontSize: '0.94rem' }}>{s.title}</strong>
              <span className="badge">{s.nutrients.join(' · ')}</span>
            </div>
            <div className="food-scroll">
              {s.foods.map((food) => {
                const v = guessFoodVisual(food)
                return (
                  <button
                    key={food}
                    type="button"
                    className="food-card"
                    onClick={() =>
                      addFood({
                        name: food,
                        calories: 240,
                        proteinG: 14,
                        carbsG: 24,
                        fatG: 9,
                        category: v.category,
                      })
                    }
                  >
                    <FoodThumb name={food} icon={v.icon} tint={v.tint} size="tile" />
                    <span className="fc-name">{food}</span>
                    <span className="fc-kcal">Add</span>
                  </button>
                )
              })}
            </div>
            <p className="caption" style={{ marginTop: 6 }}>
              {s.why}
            </p>
          </div>
        ))}
      </Card>

      <Card className="rise rise-3">
        <SectionHeader title="Your rhythm" icon="clock" />
        <div className="list">
          <div className="list-row">
            <span className="thumb" style={{ background: 'var(--tint)', color: 'var(--text-secondary)' }}>
              <Icon name="clock" size={20} />
            </span>
            <div className="grow">
              <div className="lr-title">Last period start</div>
              <div className="lr-sub">
                {profile.lastPeriodStart
                  ? format(parseISO(profile.lastPeriodStart), 'MMM d, yyyy')
                  : 'Not logged yet'}
              </div>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLogOpen(true)}>
              Edit
            </button>
          </div>
        </div>
        <div className="field-inline" style={{ marginTop: 12 }}>
          <div className="field">
            <label htmlFor="cy-len">Cycle length</label>
            <input
              id="cy-len"
              type="number"
              min={21}
              max={40}
              value={profile.cycleLengthDays}
              onChange={(e) => updateProfile({ cycleLengthDays: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label htmlFor="pe-len">Period length</label>
            <input
              id="pe-len"
              type="number"
              min={2}
              max={10}
              value={profile.periodLengthDays}
              onChange={(e) => updateProfile({ periodLengthDays: Number(e.target.value) })}
            />
          </div>
        </div>
      </Card>

      <Sheet open={logOpen} onClose={() => setLogOpen(false)} title="Log period start">
        <div className="stack-lg">
          <div className="field">
            <label htmlFor="period-date">Start date</label>
            <input
              id="period-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => {
              markPeriodStarted(date)
              setLogOpen(false)
            }}
          >
            <Icon name="check" size={18} strokeWidth={3} />
            Save
          </button>
        </div>
      </Sheet>
    </div>
  )
}

function CycleWheel({
  cycleLength,
  periodLength,
  day,
  size,
}: {
  cycleLength: number
  periodLength: number
  day: number | null
  size: number
}) {
  const stroke = 18
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const center = size / 2

  const segments = [
    { len: periodLength, color: '#ff5f6d' },
    { len: 7, color: '#14b87a' },
    { len: 3, color: '#ffb020' },
    { len: Math.max(1, cycleLength - periodLength - 10), color: '#a77bff' },
  ]

  let offsetDays = 0
  const arcs = segments.map((s, i) => {
    const start = offsetDays
    offsetDays += s.len
    const frac = s.len / cycleLength
    const startFrac = start / cycleLength
    return {
      key: i,
      color: s.color,
      dash: `${c * frac - 3} ${c}`,
      offset: -c * startFrac,
    }
  })

  const markerAngle = day != null ? ((day - 1) / cycleLength) * 360 - 90 : null
  const markerX =
    markerAngle != null ? center + r * Math.cos((markerAngle * Math.PI) / 180) : 0
  const markerY =
    markerAngle != null ? center + r * Math.sin((markerAngle * Math.PI) / 180) : 0

  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }} role="img" aria-label="Cycle phases">
      <g transform={`rotate(-90 ${center} ${center})`}>
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="var(--ring-track)"
          strokeWidth={stroke}
        />
        {arcs.map((a) => (
          <circle
            key={a.key}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={a.dash}
            strokeDashoffset={a.offset}
            opacity="0.9"
          />
        ))}
      </g>
      {markerAngle != null && (
        <>
          <circle cx={markerX} cy={markerY} r={11} fill="var(--bg-elev)" opacity="0.95" />
          <circle
            cx={markerX}
            cy={markerY}
            r={7}
            fill="var(--text)"
            style={{ transition: 'all 600ms cubic-bezier(0.22,1,0.36,1)' }}
          />
        </>
      )}
    </svg>
  )
}
