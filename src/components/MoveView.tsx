import { useEffect, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import { useApp } from '../context/AppContext'
import {
  ACTIVITIES,
  caloriesFromMet,
  distanceFromStepsKm,
  estimateWalkBurn,
  pathDistanceKm,
  previewActivityBurn,
  projectGoalSpeed,
  totalBurnedToday,
} from '../lib/fitness'
import type { GeoPoint } from '../types'
import { todayKey } from '../lib/storage'

export function MoveView() {
  const { state, todayLog, setSteps, addSteps, addWorkout, removeWorkout, updateProfile } =
    useApp()
  const { profile } = state
  const [stepInput, setStepInput] = useState(String(todayLog.steps || ''))
  const [activityId, setActivityId] = useState('walk_brisk')
  const [minutes, setMinutes] = useState(30)
  const [tracking, setTracking] = useState(false)
  const [livePath, setLivePath] = useState<GeoPoint[]>([])
  const [liveError, setLiveError] = useState<string | null>(null)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [tick, setTick] = useState(0)
  const watchRef = useRef<number | null>(null)

  const burn = totalBurnedToday(
    todayLog.workouts ?? [],
    todayLog.steps ?? 0,
    profile.weightKg,
  )
  const preview = previewActivityBurn(activityId, minutes, profile.weightKg)
  const stepGoal = profile.stepGoal || 8000
  const stepPct = Math.min(100, Math.round(((todayLog.steps || 0) / stepGoal) * 100))

  const avgExercise = useMemo(() => {
    const keys = Object.keys(state.logs).sort().slice(-7)
    if (!keys.length) return burn.total
    const sum = keys.reduce((acc, key) => {
      const log = state.logs[key]
      return (
        acc +
        totalBurnedToday(log.workouts ?? [], log.steps ?? 0, profile.weightKg).total
      )
    }, 0)
    return sum / keys.length
  }, [state.logs, profile.weightKg, burn.total])

  const projections = projectGoalSpeed(profile, avgExercise)

  useEffect(() => {
    setStepInput(String(todayLog.steps || ''))
  }, [todayLog.steps])

  useEffect(() => {
    if (!tracking) return
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [tracking])

  useEffect(() => {
    return () => {
      if (watchRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchRef.current)
      }
    }
  }, [])

  const liveMinutes =
    tracking && startedAt != null
      ? Math.max(1, Math.round((Date.now() - startedAt) / 60000) || 1)
      : 0
  const liveDistance = pathDistanceKm(livePath)
  const liveEstimate =
    tracking && startedAt != null
      ? estimateWalkBurn({
          weightKg: profile.weightKg,
          heightCm: profile.heightCm,
          minutes: Math.max(liveMinutes, Math.max(1, Math.round((Date.now() - startedAt) / 60000))),
          distanceKm: liveDistance,
        })
      : null

  // keep tick referenced so live clock re-renders
  void tick

  const startWalk = () => {
    setLiveError(null)
    if (!navigator.geolocation) {
      setLiveError('Location is not available in this browser. Log a walk manually below.')
      return
    }
    setLivePath([])
    setStartedAt(Date.now())
    setTracking(true)
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const point: GeoPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          t: Date.now(),
        }
        setLivePath((prev) => {
          const last = prev[prev.length - 1]
          if (
            last &&
            Math.abs(last.lat - point.lat) < 0.00001 &&
            Math.abs(last.lng - point.lng) < 0.00001
          ) {
            return prev
          }
          return [...prev, point].slice(-2000)
        })
      },
      (err) => {
        setLiveError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Allow GPS for outdoor tracking, or log manually.'
            : 'Could not read GPS. Try again outdoors with a clear signal.',
        )
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    )
  }

  const stopWalk = () => {
    if (watchRef.current != null) {
      navigator.geolocation.clearWatch(watchRef.current)
      watchRef.current = null
    }
    const elapsedMs = startedAt != null ? Date.now() - startedAt : 0
    const mins = Math.max(1, Math.round(elapsedMs / 60000))
    const distanceKm = pathDistanceKm(livePath)
    const estimate = estimateWalkBurn({
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      minutes: mins,
      distanceKm: distanceKm || 0.05 * mins,
    })
    addWorkout({
      activityId: 'walk_brisk',
      label: 'Outdoor GPS walk',
      minutes: mins,
      caloriesBurned: estimate.calories,
      steps: estimate.steps,
      distanceKm: distanceKm || estimate.paceKmh * (mins / 60),
      path: livePath,
      source: 'gps_walk',
    })
    setTracking(false)
    setStartedAt(null)
    setLivePath([])
  }

  return (
    <div className="stack-lg">
      <header className="stack fade-up" style={{ gap: '0.35rem' }}>
        <div className="eyebrow">Move & burn</div>
        <h1 style={{ fontSize: '2rem' }}>Fitness tracker</h1>
        <p>
          Steps, outdoor walks with location, and activity calories — see how fast you can reach
          your goal.
        </p>
      </header>

      <section className="panel-solid fade-up stack" style={{ justifyItems: 'center' }}>
        <div className="progress-ring" style={{ ['--pct' as string]: stepPct }}>
          <div className="inner">
            <strong>{todayLog.steps || 0}</strong>
            <span>steps</span>
          </div>
        </div>
        <div className="stat-grid" style={{ width: '100%' }}>
          <div className="stat">
            <strong>{burn.total}</strong>
            <span>kcal burned</span>
          </div>
          <div className="stat">
            <strong>{burn.workoutKcal}</strong>
            <span>from workouts</span>
          </div>
          <div className="stat">
            <strong>{distanceFromStepsKm(todayLog.steps || 0, profile.heightCm)} km</strong>
            <span>est. distance</span>
          </div>
        </div>
        <p className="tiny">
          Goal {stepGoal.toLocaleString()} steps · extra step burn {burn.stepKcal} kcal (workouts
          not double-counted)
        </p>
      </section>

      <section className="panel stack fade-up">
        <h2 style={{ fontSize: '1.15rem' }}>Daily steps</h2>
        <p className="tiny">
          Enter steps from your phone health app, watch, or pedometer. Cal AI estimates calories
          from your weight.
        </p>
        <div className="row">
          <div className="field" style={{ flex: 1, minWidth: 140 }}>
            <label htmlFor="steps">Steps today</label>
            <input
              id="steps"
              type="number"
              min={0}
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ alignSelf: 'end' }}
            onClick={() => setSteps(Number(stepInput) || 0)}
          >
            Save steps
          </button>
        </div>
        <div className="chip-row">
          {[500, 1000, 2000, 5000].map((n) => (
            <button key={n} type="button" className="chip" onClick={() => addSteps(n)}>
              +{n.toLocaleString()}
            </button>
          ))}
        </div>
        <div className="field">
          <label htmlFor="stepGoal">Daily step goal</label>
          <select
            id="stepGoal"
            value={stepGoal}
            onChange={(e) => updateProfile({ stepGoal: Number(e.target.value) })}
          >
            <option value={5000}>5,000</option>
            <option value={8000}>8,000</option>
            <option value={10000}>10,000</option>
            <option value={12000}>12,000</option>
          </select>
        </div>
      </section>

      <section className={`panel-solid stack fade-up ${tracking ? 'nudge' : ''}`}>
        <div className="between">
          <h2 style={{ fontSize: '1.15rem' }}>Outdoor walk · GPS</h2>
          {tracking && <span className="eyebrow">Live</span>}
        </div>
        <p className="tiny">
          Uses your phone’s location to track distance and estimate calories burned on outdoor
          walks. Best with GPS permission on mobile.
        </p>
        {tracking ? (
          <>
            <div className="stat-grid">
              <div className="stat">
                <strong>
                  {startedAt
                    ? formatDurationClock(Date.now() - startedAt)
                    : '0:00'}
                </strong>
                <span>time</span>
              </div>
              <div className="stat">
                <strong>{liveDistance.toFixed(2)} km</strong>
                <span>distance</span>
              </div>
              <div className="stat">
                <strong>{liveEstimate?.calories ?? 0}</strong>
                <span>kcal est.</span>
              </div>
            </div>
            <p className="tiny">
              Pace ~{liveEstimate?.paceKmh ?? 0} km/h · {livePath.length} GPS points ·{' '}
              {todayKey()}
            </p>
            <button type="button" className="btn btn-primary" onClick={stopWalk}>
              Finish & save walk
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-primary" onClick={startWalk}>
            Start outdoor walk
          </button>
        )}
        {liveError && <p style={{ color: '#9a3040' }}>{liveError}</p>}
      </section>

      <section className="panel stack fade-up-delay">
        <h2 style={{ fontSize: '1.15rem' }}>Activity calorie calculator</h2>
        <p className="tiny">Pick what you did — Cal AI uses MET × your body weight × time.</p>
        <div className="chip-row">
          {ACTIVITIES.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`chip ${activityId === a.id ? 'active' : ''}`}
              onClick={() => setActivityId(a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>
        <div className="field">
          <label htmlFor="mins">Minutes</label>
          <input
            id="mins"
            type="number"
            min={5}
            max={300}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value) || 0)}
          />
        </div>
        <div className="panel" style={{ padding: '0.9rem' }}>
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--forest)' }}>
            ~{preview} kcal
          </strong>
          <p className="tiny" style={{ marginTop: '0.25rem' }}>
            {ACTIVITIES.find((a) => a.id === activityId)?.hint} ·{' '}
            {caloriesFromMet(
              ACTIVITIES.find((a) => a.id === activityId)?.met ?? 4.3,
              profile.weightKg,
              minutes,
            )}{' '}
            burned at your {profile.weightKg} kg
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            const act = ACTIVITIES.find((a) => a.id === activityId)!
            addWorkout({
              activityId: act.id,
              label: act.label,
              minutes,
              caloriesBurned: preview,
              source: 'manual',
            })
          }}
        >
          Log this activity
        </button>
      </section>

      <section className="panel-solid stack fade-up">
        <h2 style={{ fontSize: '1.15rem' }}>How fast can I reach my goal?</h2>
        <p className="tiny">
          Suggestions combine your diet deficit with extra movement. ~7,700 kcal ≈ 1 kg. Safe pace
          is usually 0.25–1 kg / week.
        </p>
        {projections.map((p) => (
          <div key={p.label} className="list-row">
            <div>
              <strong style={{ color: 'var(--forest-deep)' }}>{p.label}</strong>
              <div className="tiny muted">{p.detail}</div>
              <div className="tiny" style={{ marginTop: '0.25rem' }}>
                ~{p.combinedDaily} kcal/day deficit · {p.weeklyKg} kg/week
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong style={{ fontFamily: 'var(--font-display)', color: 'var(--leaf)' }}>
                {p.weeks || '—'}
              </strong>
              <div className="tiny muted">weeks</div>
            </div>
          </div>
        ))}
      </section>

      <section className="panel stack fade-up">
        <h2 style={{ fontSize: '1.15rem' }}>Today’s workouts</h2>
        {(todayLog.workouts ?? []).length === 0 ? (
          <p>No workouts yet — start a GPS walk or log an activity.</p>
        ) : (
          (todayLog.workouts ?? [])
            .slice()
            .reverse()
            .map((w) => (
              <div key={w.id} className="list-row">
                <div>
                  <strong style={{ color: 'var(--forest-deep)' }}>{w.label}</strong>
                  <div className="tiny muted">
                    {format(new Date(w.at), 'h:mm a')} · {w.minutes} min · {w.caloriesBurned} kcal
                    {w.distanceKm != null ? ` · ${w.distanceKm.toFixed(2)} km` : ''}
                    {w.steps != null ? ` · ${w.steps} steps` : ''}
                    {w.source === 'gps_walk' ? ' · GPS' : ''}
                  </div>
                </div>
                <button type="button" className="btn btn-ghost" onClick={() => removeWorkout(w.id)}>
                  Undo
                </button>
              </div>
            ))
        )}
      </section>
    </div>
  )
}

function formatDurationClock(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
