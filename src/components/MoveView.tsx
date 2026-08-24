import { useEffect, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import { useApp } from '../context/AppContext'
import {
  ACTIVITIES,
  distanceFromStepsKm,
  estimateWalkBurn,
  pathDistanceKm,
  previewActivityBurn,
  projectGoalSpeed,
  totalBurnedToday,
} from '../lib/fitness'
import type { GeoPoint } from '../types'
import { distanceUnit, kmToDisplay } from '../lib/units'
import { Icon, type IconName } from './ui/Icon'
import {
  Card,
  CountUp,
  EmptyState,
  Ring,
  SectionHeader,
  Sheet,
  Slider,
  StatTile,
  Stepper,
} from './ui/primitives'

const ACTIVITY_ICONS: Record<string, IconName> = {
  walk_easy: 'walk',
  walk_brisk: 'walk',
  hike: 'hike',
  jog: 'run',
  run: 'run',
  cycle_easy: 'bike',
  cycle_mod: 'bike',
  stairs: 'stairs',
  strength: 'dumbbell',
  yoga: 'yoga',
  dance: 'dance',
  swim: 'swim',
}

export function MoveView() {
  const { state, todayLog, setSteps, addSteps, addWorkout, removeWorkout, updateProfile } = useApp()
  const { profile } = state
  const [activityId, setActivityId] = useState('walk_brisk')
  const [minutes, setMinutes] = useState(30)
  const [tracking, setTracking] = useState(false)
  const [livePath, setLivePath] = useState<GeoPoint[]>([])
  const [liveError, setLiveError] = useState<string | null>(null)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [, setTick] = useState(0)
  const [stepsOpen, setStepsOpen] = useState(false)
  const [stepDraft, setStepDraft] = useState(todayLog.steps || 0)
  const [activityOpen, setActivityOpen] = useState(false)
  const watchRef = useRef<number | null>(null)

  const burn = totalBurnedToday(todayLog.workouts ?? [], todayLog.steps ?? 0, profile.weightKg)
  const preview = previewActivityBurn(activityId, minutes, profile.weightKg)
  const stepGoal = profile.stepGoal || 8000
  const units = profile.units

  const avgExercise = useMemo(() => {
    const keys = Object.keys(state.logs).sort().slice(-7)
    if (!keys.length) return burn.total
    const sum = keys.reduce((acc, key) => {
      const log = state.logs[key]
      return acc + totalBurnedToday(log.workouts ?? [], log.steps ?? 0, profile.weightKg).total
    }, 0)
    return sum / keys.length
  }, [state.logs, profile.weightKg, burn.total])

  const projections = projectGoalSpeed(profile, avgExercise)

  useEffect(() => {
    setStepDraft(todayLog.steps || 0)
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

  const liveDistance = pathDistanceKm(livePath)
  const liveMinutes = startedAt != null ? Math.max(1, Math.round((Date.now() - startedAt) / 60000)) : 0
  const liveEstimate =
    tracking && startedAt != null
      ? estimateWalkBurn({
          weightKg: profile.weightKg,
          heightCm: profile.heightCm,
          minutes: liveMinutes,
          distanceKm: liveDistance,
        })
      : null

  const startWalk = () => {
    setLiveError(null)
    if (!navigator.geolocation) {
      setLiveError('Location is not available here. Log a walk manually instead.')
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

  const preferred = ACTIVITIES.filter((a) =>
    profile.workoutTypes.some((w) => a.id.startsWith(w.slice(0, 4))),
  )
  const orderedActivities = [...preferred, ...ACTIVITIES.filter((a) => !preferred.includes(a))]

  return (
    <div className="screen stack-lg">
      <header className="topbar">
        <div>
          <span className="eyebrow">Move & burn</span>
          <h1 className="title" style={{ marginTop: 2 }}>
            Activity
          </h1>
        </div>
        <span className="badge badge-brand">
          <Icon name="flame" size={13} />
          {burn.total} kcal
        </span>
      </header>

      <Card hero className="rise">
        <div style={{ display: 'grid', justifyItems: 'center', gap: 14 }}>
          <Ring
            value={todayLog.steps || 0}
            max={stepGoal}
            size={186}
            thickness={16}
            color="var(--accent-move)"
            gradientTo="#5ff0b6"
            ariaLabel="Steps today"
          >
            <span className="rv-num" style={{ fontSize: '2.5rem' }}>
              <CountUp value={todayLog.steps || 0} />
            </span>
            <span className="rv-label">of {stepGoal.toLocaleString()} steps</span>
          </Ring>
          <div className="row" style={{ gap: 8, width: '100%' }}>
            <button
              type="button"
              className="btn btn-secondary grow"
              onClick={() => setStepsOpen(true)}
            >
              <Icon name="steps" size={18} />
              Edit steps
            </button>
            {[1000, 2000].map((n) => (
              <button key={n} type="button" className="btn btn-secondary" onClick={() => addSteps(n)}>
                +{n / 1000}k
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="stat-grid rise rise-1">
        <StatTile icon="flame" value={burn.total} label="kcal burned" color="#ff7a45" />
        <StatTile icon="dumbbell" value={burn.workoutKcal} label="from workouts" color="var(--accent-fat)" />
        <StatTile
          icon="pin"
          value={kmToDisplay(distanceFromStepsKm(todayLog.steps || 0, profile.heightCm), units)}
          decimals={2}
          label={`est. ${distanceUnit(units)}`}
          color="var(--brand-500)"
        />
      </div>

      <Card className={`rise rise-1 ${tracking ? 'pop' : ''}`}>
        <SectionHeader
          title="Outdoor walk"
          icon="pin"
          action={
            tracking ? (
              <span className="badge" style={{ gap: 7 }}>
                <span className="live-dot" />
                Live
              </span>
            ) : (
              <span className="badge">GPS</span>
            )
          }
        />
        {tracking ? (
          <div className="stack" style={{ marginTop: 8 }}>
            <div className="stat-grid">
              <StatTile icon="clock" value={liveMinutes} label="minutes" color="var(--accent-move)" />
              <StatTile
                icon="pin"
                value={kmToDisplay(liveDistance, units)}
                decimals={2}
                label={distanceUnit(units)}
                color="var(--brand-500)"
              />
              <StatTile icon="flame" value={liveEstimate?.calories ?? 0} label="kcal" color="#ff7a45" />
            </div>
            <p className="caption">
              Pace ~{liveEstimate?.paceKmh ?? 0} km/h · {livePath.length} GPS points
            </p>
            <button type="button" className="btn btn-primary btn-block" onClick={stopWalk}>
              <Icon name="check" size={18} strokeWidth={3} />
              Finish & save walk
            </button>
          </div>
        ) : (
          <div className="stack" style={{ marginTop: 8 }}>
            <p className="caption">
              Track distance, pace, and calories on a real walk using your phone’s location.
            </p>
            <button type="button" className="btn btn-primary btn-block" onClick={startWalk}>
              <Icon name="walk" size={18} />
              Start outdoor walk
            </button>
          </div>
        )}
        {liveError && (
          <p style={{ color: '#e0435a', fontSize: '0.85rem', marginTop: 8 }}>{liveError}</p>
        )}
      </Card>

      <Card className="rise rise-2">
        <SectionHeader
          title="Log an activity"
          icon="dumbbell"
          action={
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setActivityOpen(true)}>
              All
              <Icon name="chevronRight" size={15} />
            </button>
          }
        />
        <div className="food-scroll">
          {orderedActivities.slice(0, 8).map((a) => (
            <button
              key={a.id}
              type="button"
              className="food-card"
              style={{ flexBasis: 110 }}
              onClick={() => {
                setActivityId(a.id)
                setActivityOpen(true)
              }}
            >
              <span
                className="food-tile-img"
                style={{
                  background: 'var(--tint)',
                  color: 'var(--brand-600)',
                }}
              >
                <Icon name={ACTIVITY_ICONS[a.id] ?? 'activity'} size={26} />
              </span>
              <span className="fc-name">{a.label}</span>
              <span className="fc-kcal">
                {previewActivityBurn(a.id, 30, profile.weightKg)} / 30m
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="rise rise-2">
        <SectionHeader title="How fast can I reach my goal?" icon="trend" />
        <p className="caption" style={{ marginBottom: 8 }}>
          Diet deficit plus movement. ~7,700 kcal ≈ 1 kg. Safe pace is usually 0.25–1 kg / week.
        </p>
        <div className="list">
          {projections.map((p) => (
            <div key={p.label} className="list-row">
              <span
                className="thumb"
                style={{ background: 'var(--tint)', color: 'var(--brand-600)' }}
              >
                <Icon name="target" size={19} />
              </span>
              <div className="grow">
                <div className="lr-title">{p.label}</div>
                <div className="lr-sub">
                  {p.combinedDaily} kcal/day · {p.weeklyKg} kg/week
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="metric-sm">{p.weeks || '—'}</div>
                <div className="lr-sub">weeks</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rise rise-3">
        <SectionHeader
          title="Today’s workouts"
          icon="clock"
          action={<span className="badge">{(todayLog.workouts ?? []).length}</span>}
        />
        {(todayLog.workouts ?? []).length === 0 ? (
          <EmptyState
            icon="activity"
            title="No movement logged"
            body="Start a GPS walk or log an activity — even 15 minutes shifts your daily burn."
            action={
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setActivityOpen(true)}>
                <Icon name="plus" size={16} />
                Log activity
              </button>
            }
          />
        ) : (
          <div className="list">
            {(todayLog.workouts ?? [])
              .slice()
              .reverse()
              .map((w) => (
                <div key={w.id} className="list-row">
                  <span
                    className="thumb"
                    style={{ background: 'rgba(35,201,255,0.14)', color: 'var(--accent-move)' }}
                  >
                    <Icon name={ACTIVITY_ICONS[w.activityId] ?? 'activity'} size={20} />
                  </span>
                  <div className="grow">
                    <div className="lr-title">{w.label}</div>
                    <div className="lr-sub">
                      {format(new Date(w.at), 'h:mm a')} · {w.minutes} min
                      {w.distanceKm != null
                        ? ` · ${kmToDisplay(w.distanceKm, units)} ${distanceUnit(units)}`
                        : ''}
                      {w.source === 'gps_walk' ? ' · GPS' : ''}
                    </div>
                  </div>
                  <span className="metric-sm">{w.caloriesBurned}</span>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => removeWorkout(w.id)}
                    aria-label="Remove workout"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* steps sheet */}
      <Sheet open={stepsOpen} onClose={() => setStepsOpen(false)} title="Steps today">
        <div className="stack-lg">
          <p className="caption">
            Enter the total from your phone health app, watch, or pedometer. Cal AI estimates
            calories from your body weight.
          </p>
          <Stepper value={stepDraft} onChange={setStepDraft} step={250} min={0} max={60000} suffix="steps" />
          <Slider
            min={0}
            max={25000}
            step={100}
            value={Math.min(stepDraft, 25000)}
            onChange={setStepDraft}
            label="Adjust"
            format={(v) => v.toLocaleString()}
          />
          <Slider
            label="Daily step goal"
            min={2000}
            max={20000}
            step={500}
            value={stepGoal}
            onChange={(v) => updateProfile({ stepGoal: v })}
            format={(v) => v.toLocaleString()}
          />
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => {
              setSteps(stepDraft)
              setStepsOpen(false)
            }}
          >
            <Icon name="check" size={18} strokeWidth={3} />
            Save steps
          </button>
        </div>
      </Sheet>

      {/* activity sheet */}
      <Sheet open={activityOpen} onClose={() => setActivityOpen(false)} title="Log activity">
        <div className="stack-lg">
          <div className="chip-row">
            {orderedActivities.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`chip ${activityId === a.id ? 'active' : ''}`}
                onClick={() => setActivityId(a.id)}
              >
                <Icon name={ACTIVITY_ICONS[a.id] ?? 'activity'} size={15} />
                {a.label}
              </button>
            ))}
          </div>
          <Slider
            label="Duration"
            min={5}
            max={180}
            step={5}
            value={minutes}
            onChange={setMinutes}
            format={(v) => `${v} min`}
          />
          <div className="card card-flat" style={{ display: 'grid', gap: 4 }}>
            <span className="eyebrow">Estimated burn</span>
            <span className="metric">
              <CountUp value={preview} /> <span style={{ fontSize: '0.9rem' }}>kcal</span>
            </span>
            <span className="caption">
              {ACTIVITIES.find((a) => a.id === activityId)?.hint} · MET ×{' '}
              {Math.round(profile.weightKg)} kg × {minutes} min
            </span>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => {
              const act = ACTIVITIES.find((a) => a.id === activityId)!
              addWorkout({
                activityId: act.id,
                label: act.label,
                minutes,
                caloriesBurned: preview,
                source: 'manual',
              })
              setActivityOpen(false)
            }}
          >
            <Icon name="plus" size={18} />
            Log activity
          </button>
        </div>
      </Sheet>
    </div>
  )
}
