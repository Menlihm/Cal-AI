import { useApp } from '../context/AppContext'
import {
  calcBmr,
  calcDailyTargets,
  calcTdee,
  estimateCaloriesToGoal,
  weeklyChangeKg,
} from '../lib/nutrition'
import { ensureNotificationPermission } from '../lib/reminders'
import type { ActivityLevel, GoalPace, Sex } from '../types'

export function YouView({ onOpenPhotos }: { onOpenPhotos?: () => void }) {
  const { state, updateProfile, resetAll } = useApp()
  const { profile } = state
  const targets = calcDailyTargets(profile)
  const estimate = estimateCaloriesToGoal(profile)
  const weekly = weeklyChangeKg(profile)

  return (
    <div className="stack-lg">
      <header className="stack fade-up" style={{ gap: '0.35rem' }}>
        <div className="eyebrow">Profile</div>
        <h1 className="brand-mark" style={{ fontSize: '2.2rem' }}>
          {profile.name || 'You'}
        </h1>
        <p>
          BMR {Math.round(calcBmr(profile))} · TDEE {Math.round(calcTdee(profile))} · Target{' '}
          {targets.calories} kcal
        </p>
      </header>

      <section className="panel-solid stack fade-up">
        <h2 style={{ fontSize: '1.15rem' }}>Body & goal</h2>
        <div className="stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
          <div className="field">
            <label htmlFor="youName">Name</label>
            <input
              id="youName"
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Sex</label>
            <select
              value={profile.sex}
              onChange={(e) => {
                const sex = e.target.value as Sex
                updateProfile({ sex, tracksCycle: sex === 'female' ? profile.tracksCycle : false })
              }}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="youAge">Age</label>
            <input
              id="youAge"
              type="number"
              value={profile.age}
              onChange={(e) => updateProfile({ age: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label htmlFor="youHeight">Height (cm)</label>
            <input
              id="youHeight"
              type="number"
              value={profile.heightCm}
              onChange={(e) => updateProfile({ heightCm: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label htmlFor="youWeight">Weight (kg)</label>
            <input
              id="youWeight"
              type="number"
              step={0.1}
              value={profile.weightKg}
              onChange={(e) => updateProfile({ weightKg: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label htmlFor="youGoal">Goal (kg)</label>
            <input
              id="youGoal"
              type="number"
              step={0.1}
              value={profile.goalWeightKg}
              onChange={(e) => updateProfile({ goalWeightKg: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label>Activity</label>
            <select
              value={profile.activity}
              onChange={(e) => updateProfile({ activity: e.target.value as ActivityLevel })}
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very active</option>
            </select>
          </div>
          <div className="field">
            <label>Pace</label>
            <select
              value={profile.pace}
              onChange={(e) => updateProfile({ pace: e.target.value as GoalPace })}
            >
              <option value="gentle">Gentle</option>
              <option value="steady">Steady</option>
              <option value="focused">Focused</option>
            </select>
          </div>
        </div>
        <p className="tiny">
          About {weekly > 0 ? '+' : ''}
          {weekly} kg / week · ~{estimate.weeks} weeks for {estimate.kgLeft} kg. Floors stay at{' '}
          {profile.sex === 'female' ? 1200 : 1500} kcal for safer loss.
        </p>
      </section>

      <section className="panel stack fade-up-delay">
        <h2 style={{ fontSize: '1.15rem' }}>Reminders</h2>
        <p className="tiny">
          Cal AI nudges you in-app (and via browser notifications if allowed) when it’s been too
          long without a bite.
        </p>
        <div className="field">
          <label>Reminders</label>
          <div className="segmented">
            <button
              type="button"
              className={profile.remindersEnabled ? 'active' : ''}
              onClick={() => {
                updateProfile({ remindersEnabled: true })
                void ensureNotificationPermission()
              }}
            >
              On
            </button>
            <button
              type="button"
              className={!profile.remindersEnabled ? 'active' : ''}
              onClick={() => updateProfile({ remindersEnabled: false })}
            >
              Off
            </button>
          </div>
        </div>
        <div className="field">
          <label htmlFor="gap">Quiet gap before nudge</label>
          <select
            id="gap"
            value={profile.reminderMinutes}
            onChange={(e) => updateProfile({ reminderMinutes: Number(e.target.value) })}
          >
            <option value={120}>2 hours</option>
            <option value={180}>3 hours</option>
            <option value={240}>4 hours</option>
            <option value={300}>5 hours</option>
          </select>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => void ensureNotificationPermission()}
        >
          Enable browser notifications
        </button>
      </section>

      <section className="panel stack fade-up">
        <h2 style={{ fontSize: '1.15rem' }}>Mobile app</h2>
        <p className="tiny">
          Cal AI is a installable web app (PWA). On your phone, open this site in Chrome or Safari,
          then use <strong>Add to Home Screen</strong> / <strong>Install app</strong> for a
          full-screen mobile experience with GPS walk tracking.
        </p>
        {onOpenPhotos && (
          <button type="button" className="btn btn-secondary" onClick={onOpenPhotos}>
            Open photo check-ins
          </button>
        )}
      </section>

      <section className="panel-solid stack fade-up">
        <h2 style={{ fontSize: '1.15rem' }}>Daily nutrient snapshot</h2>
        <div className="stat-grid">
          <div className="stat">
            <strong>{targets.proteinG}g</strong>
            <span>Protein</span>
          </div>
          <div className="stat">
            <strong>{targets.fiberG}g</strong>
            <span>Fiber</span>
          </div>
          <div className="stat">
            <strong>{targets.waterMl}ml</strong>
            <span>Water</span>
          </div>
        </div>
        <p className="tiny">
          Vitamins & minerals on Today use sex- and age-aware RDAs (iron is higher for menstruating
          females under 51).
        </p>
      </section>

      <button
        type="button"
        className="btn btn-danger"
        onClick={() => {
          if (confirm('Reset all Cal AI data on this device?')) resetAll()
        }}
      >
        Reset local data
      </button>
    </div>
  )
}
