import { useMemo, useRef, useState } from 'react'
import { parseISO } from 'date-fns'
import { useApp } from '../context/AppContext'
import {
  calcBmr,
  calcDailyTargets,
  calcTdee,
  estimateCaloriesToGoal,
  weeklyChangeKg,
} from '../lib/nutrition'
import { ensureNotificationPermission } from '../lib/reminders'
import { compressImage } from '../lib/storage'
import {
  displayToKg,
  formatWeight,
  heightLabel,
  kgToDisplay,
  weightUnit,
} from '../lib/units'
import { ALLERGY_TAGS } from '../lib/foods'
import type {
  ActivityLevel,
  AllergyTag,
  DietPreference,
  FitnessGoal,
  GoalPace,
  Sex,
  ThemePref,
  Units,
} from '../types'
import { Icon, type IconName } from './ui/Icon'
import {
  Card,
  CountUp,
  EmptyState,
  LineChart,
  SectionHeader,
  Segmented,
  Sheet,
  Slider,
  StatTile,
  Switch,
} from './ui/primitives'

const DIETS: { id: DietPreference; label: string; icon: IconName }[] = [
  { id: 'omnivore', label: 'Omnivore', icon: 'fork' },
  { id: 'vegetarian', label: 'Vegetarian', icon: 'veggie' },
  { id: 'vegan', label: 'Vegan', icon: 'leaf' },
  { id: 'pescatarian', label: 'Pescatarian', icon: 'fish' },
]

const GOALS: { id: FitnessGoal; label: string }[] = [
  { id: 'lose_fat', label: 'Lose fat' },
  { id: 'build_muscle', label: 'Build muscle' },
  { id: 'maintain', label: 'Maintain' },
  { id: 'recomp', label: 'Recomp' },
]

export function YouView({ onOpenPhotos }: { onOpenPhotos?: () => void }) {
  const { state, updateProfile, recordWeight, resetAll } = useApp()
  const { profile } = state
  const targets = calcDailyTargets(profile)
  const estimate = estimateCaloriesToGoal(profile)
  const weekly = weeklyChangeKg(profile)
  const avatarRef = useRef<HTMLInputElement>(null)
  const [bodyOpen, setBodyOpen] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [weighOpen, setWeighOpen] = useState(false)
  const [newWeight, setNewWeight] = useState(kgToDisplay(profile.weightKg, profile.units))

  const chartPoints = useMemo(() => {
    const entries = state.weights.length
      ? state.weights
      : [{ date: new Date().toISOString().slice(0, 10), kg: profile.weightKg }]
    return entries.slice(-30).map((w) => ({
      x: parseISO(w.date).getTime(),
      y: kgToDisplay(w.kg, profile.units),
      label: w.date,
    }))
  }, [state.weights, profile.weightKg, profile.units])

  const first = state.weights[0]?.kg ?? profile.weightKg
  const changed = profile.weightKg - first
  const initials = (profile.name || 'You').trim().charAt(0).toUpperCase()

  const onAvatar = async (file: File | null) => {
    if (!file) return
    try {
      const dataUrl = await compressImage(file, 320, 0.8)
      updateProfile({ avatarDataUrl: dataUrl })
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="screen stack-lg">
      <header className="topbar">
        <div>
          <span className="eyebrow">Profile</span>
          <h1 className="title" style={{ marginTop: 2 }}>
            You
          </h1>
        </div>
        <button type="button" className="icon-btn" onClick={() => setPrefsOpen(true)} aria-label="Preferences">
          <Icon name="sparkle" size={19} />
        </button>
      </header>

      <Card hero className="rise">
        <div className="row" style={{ gap: 16 }}>
          <button
            type="button"
            className="avatar avatar-lg"
            onClick={() => avatarRef.current?.click()}
            aria-label="Change photo"
            style={{ border: 'none', padding: 0 }}
          >
            {profile.avatarDataUrl ? <img src={profile.avatarDataUrl} alt="" /> : initials}
          </button>
          <input
            ref={avatarRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => void onAvatar(e.target.files?.[0] ?? null)}
          />
          <div className="grow">
            <h2 className="title" style={{ fontSize: '1.35rem' }}>
              {profile.name || 'Your profile'}
            </h2>
            <p className="caption" style={{ marginTop: 3 }}>
              {profile.age} yrs · {heightLabel(profile.heightCm, profile.units)} ·{' '}
              {GOALS.find((g) => g.id === profile.fitnessGoal)?.label}
            </p>
            <div className="row" style={{ gap: 6, marginTop: 8 }}>
              <span className="badge badge-brand">
                <Icon name="target" size={12} />
                {formatWeight(profile.goalWeightKg, profile.units)}
              </span>
              <span className="badge">
                <Icon name="clock" size={12} />~{estimate.weeks} wks
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="stat-grid rise rise-1">
        <StatTile
          icon="scale"
          value={kgToDisplay(profile.weightKg, profile.units)}
          decimals={1}
          label={`current ${weightUnit(profile.units)}`}
          color="var(--brand-500)"
        />
        <StatTile icon="flame" value={targets.calories} label="daily kcal" color="#ff7a45" />
        <StatTile icon="protein" value={targets.proteinG} label="protein g" color="var(--accent-protein)" />
        <StatTile icon="steps" value={profile.stepGoal} label="step goal" color="var(--accent-move)" />
      </div>

      <Card className="rise rise-1">
        <SectionHeader
          title="Weight trend"
          icon="trend"
          action={
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setWeighOpen(true)}>
              <Icon name="plus" size={15} />
              Log
            </button>
          }
        />
        {state.weights.length < 2 ? (
          <EmptyState
            icon="trend"
            title="Not enough data yet"
            body="Log your weight a few times and your trend line will appear here."
            action={
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setWeighOpen(true)}>
                Log today’s weight
              </button>
            }
          />
        ) : (
          <>
            <div className="row" style={{ gap: 10, marginBottom: 4 }}>
              <span className="metric">
                <CountUp value={kgToDisplay(profile.weightKg, profile.units)} decimals={1} />
                <span style={{ fontSize: '0.9rem' }}> {weightUnit(profile.units)}</span>
              </span>
              <span
                className="badge"
                style={{
                  color: changed <= 0 ? 'var(--brand-600)' : 'var(--text-secondary)',
                  background: changed <= 0 ? 'var(--brand-glow)' : 'var(--tint)',
                }}
              >
                <Icon name="trend" size={12} />
                {changed > 0 ? '+' : ''}
                {kgToDisplay(changed, profile.units)} {weightUnit(profile.units)}
              </span>
            </div>
            <LineChart
              points={chartPoints}
              goal={kgToDisplay(profile.goalWeightKg, profile.units)}
              formatValue={(v) => `${v}`}
            />
          </>
        )}
      </Card>

      <Card className="rise rise-2">
        <SectionHeader title="Energy math" icon="flame" />
        <div className="list">
          <Row label="BMR" value={`${Math.round(calcBmr(profile))} kcal`} icon="heart" />
          <Row label="TDEE" value={`${Math.round(calcTdee(profile))} kcal`} icon="activity" />
          <Row label="Daily target" value={`${targets.calories} kcal`} icon="target" />
          <Row
            label="Projected pace"
            value={`${weekly > 0 ? '+' : ''}${weekly} kg / week`}
            icon="trend"
          />
        </div>
        <p className="caption" style={{ marginTop: 8 }}>
          Floors stay at {profile.sex === 'female' ? 1200 : 1500} kcal for safer loss.
        </p>
      </Card>

      <Card className="rise rise-2" onClick={() => setBodyOpen(true)}>
        <div className="row" style={{ gap: 14 }}>
          <span className="thumb" style={{ background: 'var(--tint)', color: 'var(--text-secondary)' }}>
            <Icon name="user" size={21} />
          </span>
          <div className="grow">
            <div className="lr-title">Body & goal</div>
            <div className="lr-sub">Age, height, weight, activity, pace</div>
          </div>
          <Icon name="chevronRight" size={18} style={{ color: 'var(--text-tertiary)' }} />
        </div>
      </Card>

      {onOpenPhotos && (
        <Card className="rise rise-3" onClick={onOpenPhotos}>
          <div className="row" style={{ gap: 14 }}>
            <span className="thumb" style={{ background: 'rgba(167,123,255,0.16)', color: '#a77bff' }}>
              <Icon name="camera" size={21} />
            </span>
            <div className="grow">
              <div className="lr-title">Photo check-ins</div>
              <div className="lr-sub">
                {state.photos.length} saved · compare any two
              </div>
            </div>
            <Icon name="chevronRight" size={18} style={{ color: 'var(--text-tertiary)' }} />
          </div>
        </Card>
      )}

      <Card className="rise rise-3">
        <SectionHeader title="Reminders" icon="bell" />
        <div className="list">
          <div className="list-row">
            <span className="thumb" style={{ background: 'rgba(255,176,32,0.16)', color: '#c98b12' }}>
              <Icon name="bell" size={20} />
            </span>
            <div className="grow">
              <div className="lr-title">Eat nudges</div>
              <div className="lr-sub">Gentle prompt after a long gap</div>
            </div>
            <Switch
              checked={profile.remindersEnabled}
              label="Eat reminders"
              onChange={(v) => {
                updateProfile({ remindersEnabled: v })
                if (v) void ensureNotificationPermission()
              }}
            />
          </div>
        </div>
        {profile.remindersEnabled && (
          <div style={{ marginTop: 12 }}>
            <span className="label">Nudge after</span>
            <div style={{ marginTop: 6 }}>
              <Segmented
                value={profile.reminderMinutes}
                onChange={(v) => updateProfile({ reminderMinutes: v })}
                options={[
                  { value: 120, label: '2h' },
                  { value: 180, label: '3h' },
                  { value: 240, label: '4h' },
                  { value: 300, label: '5h' },
                ]}
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-block btn-sm"
              style={{ marginTop: 10 }}
              onClick={() => void ensureNotificationPermission()}
            >
              <Icon name="bell" size={16} />
              Enable browser notifications
            </button>
          </div>
        )}
      </Card>

      <Card className="rise rise-4">
        <SectionHeader title="Appearance & units" icon="moon" />
        <div className="stack" style={{ marginTop: 8 }}>
          <div>
            <span className="label">Theme</span>
            <div style={{ marginTop: 6 }}>
              <Segmented
                value={profile.theme}
                onChange={(v) => updateProfile({ theme: v as ThemePref })}
                options={[
                  { value: 'system', label: 'Auto' },
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ]}
              />
            </div>
          </div>
          <div>
            <span className="label">Units</span>
            <div style={{ marginTop: 6 }}>
              <Segmented
                value={profile.units}
                onChange={(v) => updateProfile({ units: v as Units })}
                options={[
                  { value: 'metric', label: 'kg · cm' },
                  { value: 'imperial', label: 'lb · ft' },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="rise rise-4">
        <SectionHeader title="Mobile app" icon="phone" />
        <p className="caption">
          Cal AI installs like a native app. On your phone open this site in Chrome or Safari, then
          tap <strong>Add to Home Screen</strong> for full-screen mode with GPS walk tracking.
        </p>
      </Card>

      <button
        type="button"
        className="btn btn-danger btn-block"
        onClick={() => {
          if (confirm('Reset all Cal AI data on this device?')) resetAll()
        }}
      >
        <Icon name="trash" size={17} />
        Reset local data
      </button>

      {/* body & goal sheet */}
      <Sheet open={bodyOpen} onClose={() => setBodyOpen(false)} title="Body & goal">
        <div className="stack-lg">
          <div className="field">
            <label htmlFor="y-name">Name</label>
            <input
              id="y-name"
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
            />
          </div>
          <div>
            <span className="label">Sex</span>
            <div style={{ marginTop: 6 }}>
              <Segmented
                value={profile.sex}
                onChange={(v) =>
                  updateProfile({
                    sex: v as Sex,
                    tracksCycle: v === 'female' ? profile.tracksCycle : false,
                  })
                }
                options={[
                  { value: 'female', label: 'Female' },
                  { value: 'male', label: 'Male' },
                ]}
              />
            </div>
          </div>
          <Slider
            label="Age"
            min={14}
            max={90}
            value={profile.age}
            onChange={(v) => updateProfile({ age: v })}
            format={(v) => `${v} yrs`}
          />
          <Slider
            label="Height"
            min={130}
            max={215}
            value={profile.heightCm}
            onChange={(v) => updateProfile({ heightCm: v })}
            format={(v) => heightLabel(v, profile.units)}
          />
          <Slider
            label="Current weight"
            min={profile.units === 'metric' ? 35 : 77}
            max={profile.units === 'metric' ? 200 : 440}
            step={0.5}
            value={kgToDisplay(profile.weightKg, profile.units)}
            onChange={(v) => updateProfile({ weightKg: displayToKg(v, profile.units) })}
            format={(v) => `${v} ${weightUnit(profile.units)}`}
          />
          <Slider
            label="Goal weight"
            min={profile.units === 'metric' ? 35 : 77}
            max={profile.units === 'metric' ? 200 : 440}
            step={0.5}
            value={kgToDisplay(profile.goalWeightKg, profile.units)}
            onChange={(v) => updateProfile({ goalWeightKg: displayToKg(v, profile.units) })}
            format={(v) => `${v} ${weightUnit(profile.units)}`}
          />
          <div>
            <span className="label">Activity</span>
            <div className="chip-row" style={{ marginTop: 6 }}>
              {(
                [
                  ['sedentary', 'Sitting'],
                  ['light', 'Light'],
                  ['moderate', 'Moderate'],
                  ['active', 'Active'],
                  ['very_active', 'Athlete'],
                ] as [ActivityLevel, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`chip ${profile.activity === id ? 'active' : ''}`}
                  onClick={() => updateProfile({ activity: id })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="label">Pace</span>
            <div style={{ marginTop: 6 }}>
              <Segmented
                value={profile.pace}
                onChange={(v) => updateProfile({ pace: v as GoalPace })}
                options={[
                  { value: 'gentle', label: 'Gentle' },
                  { value: 'steady', label: 'Steady' },
                  { value: 'focused', label: 'Focused' },
                ]}
              />
            </div>
          </div>
          <button type="button" className="btn btn-primary btn-block" onClick={() => setBodyOpen(false)}>
            Done
          </button>
        </div>
      </Sheet>

      {/* preferences sheet */}
      <Sheet open={prefsOpen} onClose={() => setPrefsOpen(false)} title="Food preferences">
        <div className="stack-lg">
          <div>
            <span className="label">Diet</span>
            <div className="chip-row" style={{ marginTop: 6 }}>
              {DIETS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`chip ${profile.dietPreference === d.id ? 'active' : ''}`}
                  onClick={() => updateProfile({ dietPreference: d.id })}
                >
                  <Icon name={d.icon} size={15} />
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="label">Goal</span>
            <div className="chip-row" style={{ marginTop: 6 }}>
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`chip ${profile.fitnessGoal === g.id ? 'active' : ''}`}
                  onClick={() => updateProfile({ fitnessGoal: g.id })}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="label">Allergies & intolerances</span>
            <div className="chip-row" style={{ marginTop: 6 }}>
              {ALLERGY_TAGS.map((a) => {
                const on = profile.allergies.includes(a.id)
                return (
                  <button
                    key={a.id}
                    type="button"
                    className={`chip ${on ? 'active' : ''}`}
                    onClick={() =>
                      updateProfile({
                        allergies: on
                          ? profile.allergies.filter((x) => x !== a.id)
                          : [...profile.allergies, a.id as AllergyTag],
                      })
                    }
                  >
                    {on && <Icon name="check" size={13} strokeWidth={3} />}
                    {a.label}
                  </button>
                )
              })}
            </div>
          </div>
          <Slider
            label="Daily step goal"
            min={2000}
            max={20000}
            step={500}
            value={profile.stepGoal}
            onChange={(v) => updateProfile({ stepGoal: v })}
            format={(v) => v.toLocaleString()}
          />
          <button type="button" className="btn btn-primary btn-block" onClick={() => setPrefsOpen(false)}>
            Done
          </button>
        </div>
      </Sheet>

      {/* weigh-in sheet */}
      <Sheet open={weighOpen} onClose={() => setWeighOpen(false)} title="Log weight">
        <div className="stack-lg">
          <Slider
            label="Weight today"
            min={profile.units === 'metric' ? 35 : 77}
            max={profile.units === 'metric' ? 200 : 440}
            step={0.1}
            value={newWeight}
            onChange={setNewWeight}
            format={(v) => `${v.toFixed(1)} ${weightUnit(profile.units)}`}
          />
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => {
              recordWeight(displayToKg(newWeight, profile.units))
              setWeighOpen(false)
            }}
          >
            <Icon name="check" size={18} strokeWidth={3} />
            Save weigh-in
          </button>
        </div>
      </Sheet>
    </div>
  )
}

function Row({ label, value, icon }: { label: string; value: string; icon: IconName }) {
  return (
    <div className="list-row">
      <span className="thumb" style={{ background: 'var(--tint)', color: 'var(--text-secondary)' }}>
        <Icon name={icon} size={19} />
      </span>
      <div className="grow">
        <div className="lr-title">{label}</div>
      </div>
      <span className="metric-sm">{value}</span>
    </div>
  )
}
