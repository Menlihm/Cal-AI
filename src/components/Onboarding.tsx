import { useState } from 'react'
import type { ActivityLevel, GoalPace, Profile, Sex } from '../types'
import { defaultProfile } from '../lib/storage'
import { calcDailyTargets, estimateCaloriesToGoal } from '../lib/nutrition'
import { useApp } from '../context/AppContext'

const ACTIVITIES: { id: ActivityLevel; label: string }[] = [
  { id: 'sedentary', label: 'Mostly sitting' },
  { id: 'light', label: 'Light walks' },
  { id: 'moderate', label: '3–4 workouts / wk' },
  { id: 'active', label: 'Almost daily training' },
  { id: 'very_active', label: 'Athlete / labor' },
]

const PACES: { id: GoalPace; label: string; hint: string }[] = [
  { id: 'gentle', label: 'Gentle', hint: '~0.25 kg / week' },
  { id: 'steady', label: 'Steady', hint: '~0.5 kg / week' },
  { id: 'focused', label: 'Focused', hint: '~0.7 kg / week' },
]

export function Onboarding() {
  const { completeOnboarding } = useApp()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Profile>({ ...defaultProfile, name: '' })

  const patch = (p: Partial<Profile>) => setForm((f) => ({ ...f, ...p }))
  const preview = calcDailyTargets(form)
  const estimate = estimateCaloriesToGoal(form)

  const canNext =
    step === 0
      ? form.name.trim().length > 0
      : step === 1
        ? form.age > 0 && form.heightCm > 0 && form.weightKg > 0 && form.goalWeightKg > 0
        : true

  return (
    <div className="hero-landing">
      <div className="fade-up">
        <div className="eyebrow">Daily nourishment</div>
        <div className="brand-mark" style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', lineHeight: 0.9 }}>
          TrenTree
        </div>
      </div>

      {step === 0 && (
        <div className="stack-lg fade-up-delay" style={{ maxWidth: 440 }}>
          <p className="lede">
            Calories, vitamins, gentle eat reminders, photo check-ins, and cycle-aware food ideas —
            grown for healthy weight loss.
          </p>
          <div className="field">
            <label htmlFor="name">What should we call you?</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Your name"
              autoFocus
            />
          </div>
          <div className="field">
            <label>I am</label>
            <div className="segmented">
              {(['female', 'male'] as Sex[]).map((sex) => (
                <button
                  key={sex}
                  type="button"
                  className={form.sex === sex ? 'active' : ''}
                  onClick={() =>
                    patch({
                      sex,
                      tracksCycle: sex === 'female',
                    })
                  }
                >
                  {sex === 'female' ? 'Female' : 'Male'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="stack-lg fade-up" style={{ maxWidth: 520 }}>
          <h2>Your body & goal</h2>
          <p>We use Mifflin–St Jeor to set a safe calorie target, never below clinical floors.</p>
          <div className="stack" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid' }}>
            <div className="field">
              <label htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                min={14}
                max={90}
                value={form.age}
                onChange={(e) => patch({ age: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label htmlFor="height">Height (cm)</label>
              <input
                id="height"
                type="number"
                min={120}
                max={230}
                value={form.heightCm}
                onChange={(e) => patch({ heightCm: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label htmlFor="weight">Current weight (kg)</label>
              <input
                id="weight"
                type="number"
                min={35}
                max={250}
                step={0.1}
                value={form.weightKg}
                onChange={(e) => patch({ weightKg: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label htmlFor="goal">Goal weight (kg)</label>
              <input
                id="goal"
                type="number"
                min={35}
                max={250}
                step={0.1}
                value={form.goalWeightKg}
                onChange={(e) => patch({ goalWeightKg: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="field">
            <label>Activity</label>
            <div className="chip-row">
              {ACTIVITIES.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`chip ${form.activity === a.id ? 'active' : ''}`}
                  onClick={() => patch({ activity: a.id })}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Pace</label>
            <div className="chip-row">
              {PACES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`chip ${form.pace === p.id ? 'active' : ''}`}
                  onClick={() => patch({ pace: p.id })}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="stack-lg fade-up" style={{ maxWidth: 520 }}>
          <h2>{form.sex === 'female' ? 'Cycle & reminders' : 'Eat reminders'}</h2>
          <p>
            Stay fueled with gentle nudges so long gaps don’t stall your metabolism or mood.
          </p>

          {form.sex === 'female' && (
            <>
              <div className="field">
                <label>Track menstrual cycle for food ideas?</label>
                <div className="segmented">
                  <button
                    type="button"
                    className={form.tracksCycle ? 'active' : ''}
                    onClick={() => patch({ tracksCycle: true })}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={!form.tracksCycle ? 'active' : ''}
                    onClick={() => patch({ tracksCycle: false })}
                  >
                    Not now
                  </button>
                </div>
              </div>
              {form.tracksCycle && (
                <div className="stack" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid' }}>
                  <div className="field">
                    <label htmlFor="cycleLen">Cycle length (days)</label>
                    <input
                      id="cycleLen"
                      type="number"
                      min={21}
                      max={40}
                      value={form.cycleLengthDays}
                      onChange={(e) => patch({ cycleLengthDays: Number(e.target.value) })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="periodLen">Period length</label>
                    <input
                      id="periodLen"
                      type="number"
                      min={2}
                      max={10}
                      value={form.periodLengthDays}
                      onChange={(e) => patch({ periodLengthDays: Number(e.target.value) })}
                    />
                  </div>
                  <div className="field" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="lastPeriod">Last period start</label>
                    <input
                      id="lastPeriod"
                      type="date"
                      value={form.lastPeriodStart ?? ''}
                      onChange={(e) => patch({ lastPeriodStart: e.target.value || null })}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="field">
            <label htmlFor="remind">Remind me if I haven’t eaten for</label>
            <select
              id="remind"
              value={form.reminderMinutes}
              onChange={(e) => patch({ reminderMinutes: Number(e.target.value) })}
            >
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
              <option value={240}>4 hours</option>
              <option value={300}>5 hours</option>
            </select>
          </div>

          <div className="panel-solid">
            <div className="eyebrow">Your daily target</div>
            <h2 style={{ fontSize: '2.4rem', marginTop: '0.35rem' }}>{preview.calories} kcal</h2>
            <p className="tiny" style={{ marginTop: '0.4rem' }}>
              Protein {preview.proteinG}g · Carbs {preview.carbsG}g · Fat {preview.fatG}g
            </p>
            <p className="tiny" style={{ marginTop: '0.55rem' }}>
              About {estimate.weeks} weeks to move {estimate.kgLeft} kg at this pace — adjustable anytime.
            </p>
          </div>
        </div>
      )}

      <div className="row fade-up-delay">
        {step > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
        )}
        {step < 2 ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => completeOnboarding(form)}
          >
            Start growing with TrenTree
          </button>
        )}
      </div>
    </div>
  )
}
