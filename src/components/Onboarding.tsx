import { useMemo, useRef, useState } from 'react'
import type {
  ActivityLevel,
  AllergyTag,
  DietPreference,
  FitnessGoal,
  GoalPace,
  Profile,
  Sex,
  Units,
  WorkoutType,
} from '../types'
import { defaultProfile } from '../lib/storage'
import { calcDailyTargets, estimateCaloriesToGoal } from '../lib/nutrition'
import { useApp } from '../context/AppContext'
import { Icon, type IconName } from './ui/Icon'
import {
  CountUp,
  MacroRing,
  ProgressDots,
  SelectCard,
  Slider,
  TileCard,
} from './ui/primitives'
import { ALLERGY_TAGS } from '../lib/foods'
import { displayToCm, kgToDisplay, displayToKg, weightUnit } from '../lib/units'

const ACTIVITIES: { id: ActivityLevel; label: string; desc: string; icon: IconName }[] = [
  { id: 'sedentary', label: 'Mostly sitting', desc: 'Desk work, little movement', icon: 'sofa' },
  { id: 'light', label: 'Lightly active', desc: 'Walks or light chores most days', icon: 'walk' },
  { id: 'moderate', label: 'Moderately active', desc: '3–4 workouts a week', icon: 'activity' },
  { id: 'active', label: 'Very active', desc: 'Training almost daily', icon: 'run' },
  { id: 'very_active', label: 'Athlete', desc: 'Two-a-days or physical job', icon: 'trophy' },
]

const PACES: { id: GoalPace; label: string; desc: string; icon: IconName }[] = [
  { id: 'gentle', label: 'Gentle', desc: '~0.25 kg / week · easiest to sustain', icon: 'leaf' },
  { id: 'steady', label: 'Steady', desc: '~0.5 kg / week · balanced pace', icon: 'target' },
  { id: 'focused', label: 'Focused', desc: '~0.7 kg / week · needs discipline', icon: 'flame' },
]

const GOALS: { id: FitnessGoal; label: string; desc: string; icon: IconName }[] = [
  { id: 'lose_fat', label: 'Lose fat', desc: 'Drop body fat, keep muscle', icon: 'flame' },
  { id: 'build_muscle', label: 'Build muscle', desc: 'Grow strength and size', icon: 'muscle' },
  { id: 'maintain', label: 'Maintain', desc: 'Hold my weight, eat better', icon: 'balance' },
  { id: 'recomp', label: 'Recomp', desc: 'Lose fat and gain muscle', icon: 'trend' },
]

const DIETS: { id: DietPreference; label: string; desc: string; icon: IconName }[] = [
  { id: 'omnivore', label: 'Omnivore', desc: 'I eat everything', icon: 'fork' },
  { id: 'vegetarian', label: 'Vegetarian', desc: 'No meat or fish', icon: 'veggie' },
  { id: 'vegan', label: 'Vegan', desc: 'Fully plant-based', icon: 'leaf' },
  { id: 'pescatarian', label: 'Pescatarian', desc: 'Fish, no other meat', icon: 'fish' },
]

const WORKOUTS: { id: WorkoutType; label: string; icon: IconName }[] = [
  { id: 'walking', label: 'Walking', icon: 'walk' },
  { id: 'running', label: 'Running', icon: 'run' },
  { id: 'cycling', label: 'Cycling', icon: 'bike' },
  { id: 'strength', label: 'Strength', icon: 'dumbbell' },
  { id: 'yoga', label: 'Yoga', icon: 'yoga' },
  { id: 'swimming', label: 'Swimming', icon: 'swim' },
  { id: 'dance', label: 'Dance', icon: 'dance' },
  { id: 'hiking', label: 'Hiking', icon: 'hike' },
]

export function Onboarding() {
  const { completeOnboarding } = useApp()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState<'next' | 'prev'>('next')
  const [form, setForm] = useState<Profile>({ ...defaultProfile })
  const touchX = useRef<number | null>(null)

  const patch = (p: Partial<Profile>) => setForm((f) => ({ ...f, ...p }))
  const preview = useMemo(() => calcDailyTargets(form), [form])
  const estimate = useMemo(() => estimateCaloriesToGoal(form), [form])

  const steps: { key: string; valid: boolean; node: React.ReactNode }[] = [
    {
      key: 'welcome',
      valid: form.name.trim().length > 0,
      node: (
        <StepShell
          eyebrow="Welcome"
          title="Let’s build your plan"
          sub="A few quick questions and Cal AI tailors your daily calories, macros, and nudges."
        >
          <div className="field">
            <label htmlFor="ob-name">What should we call you?</label>
            <input
              id="ob-name"
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Your name"
              autoFocus
            />
          </div>
          <div className="select-grid select-grid-2">
            {(['female', 'male'] as Sex[]).map((sex) => (
              <TileCard
                key={sex}
                icon={sex === 'female' ? 'female' : 'male'}
                title={sex === 'female' ? 'Female' : 'Male'}
                desc={sex === 'female' ? 'Cycle features on' : 'Standard targets'}
                active={form.sex === sex}
                onClick={() => patch({ sex, tracksCycle: sex === 'female' })}
              />
            ))}
          </div>
        </StepShell>
      ),
    },
    {
      key: 'goal',
      valid: true,
      node: (
        <StepShell
          eyebrow="Your focus"
          title="What are you working toward?"
          sub="This shapes your calorie split and protein target."
        >
          <div className="select-grid">
            {GOALS.map((g) => (
              <SelectCard
                key={g.id}
                icon={g.icon}
                title={g.label}
                desc={g.desc}
                active={form.fitnessGoal === g.id}
                onClick={() => patch({ fitnessGoal: g.id })}
              />
            ))}
          </div>
        </StepShell>
      ),
    },
    {
      key: 'body',
      valid: form.age > 0 && form.heightCm > 0 && form.weightKg > 0,
      node: (
        <StepShell
          eyebrow="About you"
          title="Your body basics"
          sub="Used for Mifflin–St Jeor energy needs. Everything stays on your device."
        >
          <div className="segmented" style={{ marginBottom: 4 }}>
            {(['metric', 'imperial'] as Units[]).map((u) => (
              <button
                key={u}
                type="button"
                className={form.units === u ? 'active' : ''}
                onClick={() => patch({ units: u })}
              >
                {u === 'metric' ? 'kg · cm' : 'lb · ft'}
              </button>
            ))}
          </div>
          <Slider
            label="Age"
            min={14}
            max={90}
            value={form.age}
            onChange={(v) => patch({ age: v })}
            format={(v) => `${v} yrs`}
          />
          {form.units === 'metric' ? (
            <Slider
              label="Height"
              min={130}
              max={215}
              value={form.heightCm}
              onChange={(v) => patch({ heightCm: v })}
              format={(v) => `${v} cm`}
            />
          ) : (
            <Slider
              label="Height"
              min={52}
              max={84}
              value={Math.round(form.heightCm / 2.54)}
              onChange={(v) => patch({ heightCm: displayToCm(0, v) })}
              format={(v) => `${Math.floor(v / 12)}' ${v % 12}"`}
            />
          )}
          <Slider
            label="Current weight"
            min={form.units === 'metric' ? 35 : 77}
            max={form.units === 'metric' ? 200 : 440}
            step={form.units === 'metric' ? 0.5 : 1}
            value={kgToDisplay(form.weightKg, form.units)}
            onChange={(v) => patch({ weightKg: displayToKg(v, form.units) })}
            format={(v) => `${v} ${weightUnit(form.units)}`}
          />
          <Slider
            label="Goal weight"
            min={form.units === 'metric' ? 35 : 77}
            max={form.units === 'metric' ? 200 : 440}
            step={form.units === 'metric' ? 0.5 : 1}
            value={kgToDisplay(form.goalWeightKg, form.units)}
            onChange={(v) => patch({ goalWeightKg: displayToKg(v, form.units) })}
            format={(v) => `${v} ${weightUnit(form.units)}`}
          />
        </StepShell>
      ),
    },
    {
      key: 'activity',
      valid: true,
      node: (
        <StepShell
          eyebrow="Daily movement"
          title="How active is a normal day?"
          sub="Be honest — you can always adjust later."
        >
          <div className="select-grid">
            {ACTIVITIES.map((a) => (
              <SelectCard
                key={a.id}
                icon={a.icon}
                title={a.label}
                desc={a.desc}
                active={form.activity === a.id}
                onClick={() => patch({ activity: a.id })}
              />
            ))}
          </div>
        </StepShell>
      ),
    },
    {
      key: 'workouts',
      valid: true,
      node: (
        <StepShell
          eyebrow="Training"
          title="What do you enjoy?"
          sub="We’ll put your favourites first in the Move tab. Pick any number."
        >
          <div className="select-grid select-grid-2">
            {WORKOUTS.map((w) => (
              <TileCard
                key={w.id}
                icon={w.icon}
                title={w.label}
                active={form.workoutTypes.includes(w.id)}
                onClick={() =>
                  patch({
                    workoutTypes: form.workoutTypes.includes(w.id)
                      ? form.workoutTypes.filter((t) => t !== w.id)
                      : [...form.workoutTypes, w.id],
                  })
                }
              />
            ))}
          </div>
        </StepShell>
      ),
    },
    {
      key: 'pace',
      valid: true,
      node: (
        <StepShell
          eyebrow="Timeline"
          title="How fast do you want to go?"
          sub="Slower paces are easier to keep and protect muscle."
        >
          <div className="select-grid">
            {PACES.map((p) => (
              <SelectCard
                key={p.id}
                icon={p.icon}
                title={p.label}
                desc={p.desc}
                active={form.pace === p.id}
                onClick={() => patch({ pace: p.id })}
              />
            ))}
          </div>
        </StepShell>
      ),
    },
    {
      key: 'diet',
      valid: true,
      node: (
        <StepShell
          eyebrow="Food style"
          title="How do you eat?"
          sub="Food suggestions will respect this."
        >
          <div className="select-grid">
            {DIETS.map((d) => (
              <SelectCard
                key={d.id}
                icon={d.icon}
                title={d.label}
                desc={d.desc}
                active={form.dietPreference === d.id}
                onClick={() => patch({ dietPreference: d.id })}
              />
            ))}
          </div>
        </StepShell>
      ),
    },
    {
      key: 'allergies',
      valid: true,
      node: (
        <StepShell
          eyebrow="Safety"
          title="Anything to avoid?"
          sub="Tap any allergies or intolerances — we’ll hide those foods."
        >
          <div className="chip-row">
            {ALLERGY_TAGS.map((a) => {
              const on = form.allergies.includes(a.id)
              return (
                <button
                  key={a.id}
                  type="button"
                  className={`chip ${on ? 'active' : ''}`}
                  onClick={() =>
                    patch({
                      allergies: on
                        ? form.allergies.filter((x) => x !== a.id)
                        : [...form.allergies, a.id as AllergyTag],
                    })
                  }
                >
                  {on && <Icon name="check" size={14} strokeWidth={3} />}
                  {a.label}
                </button>
              )
            })}
          </div>
          <div className="card card-flat" style={{ marginTop: 4 }}>
            <div className="row" style={{ gap: 10 }}>
              <Icon name="shield" size={20} style={{ color: 'var(--brand-500)' }} />
              <p className="caption" style={{ margin: 0 }}>
                Nothing leaves your phone. Cal AI stores all data locally.
              </p>
            </div>
          </div>
        </StepShell>
      ),
    },
    {
      key: 'cycle',
      valid: true,
      node: (
        <StepShell
          eyebrow={form.sex === 'female' ? 'Cycle & reminders' : 'Reminders'}
          title={form.sex === 'female' ? 'Track your cycle?' : 'Gentle eat reminders'}
          sub="Cal AI nudges you if it’s been too long without a bite."
        >
          {form.sex === 'female' && (
            <>
              <div className="select-grid select-grid-2">
                <TileCard
                  icon="cycle"
                  title="Yes, track it"
                  desc="Phase-based food ideas"
                  active={form.tracksCycle}
                  onClick={() => patch({ tracksCycle: true })}
                />
                <TileCard
                  icon="close"
                  title="Not now"
                  desc="Skip cycle features"
                  active={!form.tracksCycle}
                  onClick={() => patch({ tracksCycle: false })}
                />
              </div>
              {form.tracksCycle && (
                <>
                  <div className="field-inline">
                    <div className="field">
                      <label htmlFor="ob-cyclelen">Cycle length</label>
                      <input
                        id="ob-cyclelen"
                        type="number"
                        min={21}
                        max={40}
                        value={form.cycleLengthDays}
                        onChange={(e) => patch({ cycleLengthDays: Number(e.target.value) })}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="ob-periodlen">Period length</label>
                      <input
                        id="ob-periodlen"
                        type="number"
                        min={2}
                        max={10}
                        value={form.periodLengthDays}
                        onChange={(e) => patch({ periodLengthDays: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="ob-lastperiod">Last period start</label>
                    <input
                      id="ob-lastperiod"
                      type="date"
                      value={form.lastPeriodStart ?? ''}
                      onChange={(e) => patch({ lastPeriodStart: e.target.value || null })}
                    />
                  </div>
                </>
              )}
            </>
          )}
          <div className="field">
            <label htmlFor="ob-remind">Nudge me after</label>
            <select
              id="ob-remind"
              value={form.reminderMinutes}
              onChange={(e) => patch({ reminderMinutes: Number(e.target.value) })}
            >
              <option value={120}>2 hours without food</option>
              <option value={180}>3 hours without food</option>
              <option value={240}>4 hours without food</option>
              <option value={300}>5 hours without food</option>
            </select>
          </div>
        </StepShell>
      ),
    },
    {
      key: 'summary',
      valid: true,
      node: (
        <StepShell
          eyebrow="Your plan"
          title={`Ready, ${form.name.trim() || 'friend'}`}
          sub="Here’s your starting point — everything stays adjustable."
        >
          <div className="card card-hero" style={{ display: 'grid', gap: 14 }}>
            <div>
              <span className="eyebrow">Daily target</span>
              <div className="display" style={{ marginTop: 4 }}>
                <CountUp value={preview.calories} /> <span style={{ fontSize: '1.2rem' }}>kcal</span>
              </div>
            </div>
            <div className="macro-rings">
              <MacroRing label="Protein" value={preview.proteinG} max={preview.proteinG} color="var(--accent-protein)" />
              <MacroRing label="Carbs" value={preview.carbsG} max={preview.carbsG} color="var(--accent-carb)" />
              <MacroRing label="Fat" value={preview.fatG} max={preview.fatG} color="var(--accent-fat)" />
            </div>
            <div className="row" style={{ gap: 8 }}>
              <span className="badge badge-brand">
                <Icon name="target" size={13} />
                {estimate.kgLeft} kg to go
              </span>
              <span className="badge">
                <Icon name="clock" size={13} />~{estimate.weeks} weeks
              </span>
            </div>
          </div>
        </StepShell>
      ),
    },
  ]

  const total = steps.length
  const current = steps[step]

  const go = (delta: number) => {
    const next = step + delta
    if (next < 0 || next >= total) return
    if (delta > 0 && !current.valid) return
    setDir(delta > 0 ? 'next' : 'prev')
    setStep(next)
  }

  return (
    <div
      className="shell"
      style={{ minHeight: '100dvh', display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: 16 }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1)
        touchX.current = null
      }}
    >
      <header className="row-between" style={{ paddingTop: 4 }}>
        <button
          type="button"
          className="icon-btn"
          onClick={() => go(-1)}
          style={{ opacity: step === 0 ? 0 : 1, pointerEvents: step === 0 ? 'none' : 'auto' }}
          aria-label="Back"
        >
          <Icon name="chevronLeft" size={18} />
        </button>
        <ProgressDots total={total} index={step} />
        <span className="badge" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {step + 1}/{total}
        </span>
      </header>

      <div key={current.key} className={dir === 'next' ? 'slide-next' : 'slide-prev'}>
        {current.node}
      </div>

      <footer className="stack" style={{ gap: 8, paddingBottom: 8 }}>
        {step < total - 1 ? (
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={!current.valid}
            onClick={() => go(1)}
          >
            Continue
            <Icon name="chevronRight" size={18} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => completeOnboarding(form)}
          >
            <Icon name="sparkle" size={18} />
            Start with Cal AI
          </button>
        )}
        <p className="caption" style={{ textAlign: 'center' }}>
          Swipe or tap to move between steps
        </p>
      </footer>
    </div>
  )
}

function StepShell({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow: string
  title: string
  sub?: string
  children: React.ReactNode
}) {
  return (
    <div className="stack-lg" style={{ alignContent: 'start' }}>
      <div className="stack" style={{ gap: 6 }}>
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="title" style={{ fontSize: 'clamp(1.75rem, 7vw, 2.3rem)', lineHeight: 1.08 }}>
          {title}
        </h1>
        {sub && <p style={{ fontSize: '0.94rem' }}>{sub}</p>}
      </div>
      <div className="stack">{children}</div>
    </div>
  )
}
