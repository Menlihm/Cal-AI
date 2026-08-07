import { useApp } from '../context/AppContext'
import { calcDailyTargets, getVitaminTargets } from '../lib/nutrition'
import { getCravingSuggestions, getCyclePhase, phaseBlurb, phaseLabel } from '../lib/cycle'
import { formatDuration, minutesSinceLastBite } from '../lib/reminders'

export function TodayView() {
  const { state, todayLog, nudgeMessage, toggleVitamin, addWater, addFood } = useApp()
  const { profile } = state
  const targets = calcDailyTargets(profile)
  const eaten = todayLog.foods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      proteinG: acc.proteinG + f.proteinG,
      carbsG: acc.carbsG + f.carbsG,
      fatG: acc.fatG + f.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  )
  const remaining = Math.max(0, targets.calories - eaten.calories)
  const pct = Math.min(100, Math.round((eaten.calories / targets.calories) * 100))
  const vitamins = getVitaminTargets(profile.sex, profile.age)
  const phase = getCyclePhase(profile)
  const suggestions = getCravingSuggestions(phase)
  const mins = minutesSinceLastBite(todayLog)
  const waterGoal = Math.max(6, Math.round(targets.waterMl / 250))

  return (
    <div className="stack-lg">
      <header className="fade-up stack" style={{ gap: '0.35rem' }}>
        <div className="eyebrow">Today grows with you</div>
        <h1 className="brand-mark" style={{ fontSize: 'clamp(2.2rem, 7vw, 3.2rem)' }}>
          Cal AI
        </h1>
        <p>
          Hi {profile.name || 'friend'} — {remaining} kcal left ·{' '}
          {profile.tracksCycle && phase !== 'unknown'
            ? `${phaseLabel(phase)} phase`
            : 'steady fuel day'}
        </p>
      </header>

      {nudgeMessage && (
        <div className="nudge">
          <div>
            <strong>Eat something small</strong>
            <p style={{ marginTop: '0.25rem', color: 'var(--forest-deep)' }}>{nudgeMessage}</p>
            <div className="chip-row" style={{ marginTop: '0.7rem' }}>
              <button
                type="button"
                className="chip active"
                onClick={() =>
                  addFood({
                    name: 'Quick snack',
                    calories: 120,
                    proteinG: 5,
                    carbsG: 12,
                    fatG: 5,
                  })
                }
              >
                Log a 120 kcal snack
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="two-col">
        <section className="panel-solid fade-up stack" style={{ justifyItems: 'center' }}>
          <div className="progress-ring" style={{ ['--pct' as string]: pct }}>
            <div className="inner">
              <strong>{remaining}</strong>
              <span>kcal left</span>
            </div>
          </div>
          <div className="stat-grid" style={{ width: '100%' }}>
            <div className="stat">
              <strong>{Math.round(eaten.proteinG)}g</strong>
              <span>Protein / {targets.proteinG}g</span>
            </div>
            <div className="stat">
              <strong>{Math.round(eaten.carbsG)}g</strong>
              <span>Carbs / {targets.carbsG}g</span>
            </div>
            <div className="stat">
              <strong>{Math.round(eaten.fatG)}g</strong>
              <span>Fat / {targets.fatG}g</span>
            </div>
          </div>
          <p className="tiny">
            Last bite:{' '}
            {mins == null ? 'none yet today' : `${formatDuration(mins)} ago`}
            {' · '}Water {todayLog.waterGlasses}/{waterGoal} glasses
          </p>
          <button type="button" className="btn btn-secondary" onClick={addWater}>
            + Glass of water
          </button>
        </section>

        <section className="panel fade-up-delay stack">
          <div className="between">
            <h2 style={{ fontSize: '1.25rem' }}>What you may feel like</h2>
          </div>
          <p className="tiny">{phaseBlurb(phase)}</p>
          {suggestions.slice(0, 1).map((s) => (
            <div key={s.title} className="suggestion">
              <h3>{s.title}</h3>
              <p className="tiny">{s.why}</p>
              <div className="food-pills">
                {s.foods.map((food) => (
                  <button
                    key={food}
                    type="button"
                    onClick={() =>
                      addFood({
                        name: food,
                        calories: 220,
                        proteinG: 12,
                        carbsG: 22,
                        fatG: 8,
                      })
                    }
                  >
                    + {food}
                  </button>
                ))}
              </div>
              <p className="tiny">Focus: {s.nutrients.join(' · ')}</p>
            </div>
          ))}
        </section>
      </div>

      <section className="panel-solid stack fade-up">
        <div className="between">
          <h2 style={{ fontSize: '1.25rem' }}>Daily vitamins & minerals</h2>
          <span className="tiny muted">
            {todayLog.vitaminsTaken.length}/{vitamins.length} checked
          </span>
        </div>
        <p className="tiny">
          Targets use NIH-style RDAs for {profile.sex}, age {profile.age}. Tap when you’ve covered
          them via food or a multi.
        </p>
        <div className="vitamin-grid">
          {vitamins.map((v) => {
            const taken = todayLog.vitaminsTaken.includes(v.id)
            return (
              <button
                key={v.id}
                type="button"
                className={`vitamin ${taken ? 'taken' : ''}`}
                onClick={() => toggleVitamin(v.id)}
                title={v.why}
              >
                <strong>
                  {taken ? '✓ ' : ''}
                  {v.name}
                </strong>
                <span>
                  {v.amount} {v.unit}
                </span>
                <span>{v.why}</span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
