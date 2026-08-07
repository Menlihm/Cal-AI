import { useState } from 'react'
import { format } from 'date-fns'
import { useApp } from '../context/AppContext'
import { QUICK_FOODS, calcDailyTargets } from '../lib/nutrition'
import { getCravingSuggestions, getCyclePhase, phaseLabel } from '../lib/cycle'

export function EatView() {
  const { state, todayLog, addFood, removeFood } = useApp()
  const targets = calcDailyTargets(state.profile)
  const phase = getCyclePhase(state.profile)
  const suggestions = getCravingSuggestions(phase)
  const [custom, setCustom] = useState({
    name: '',
    calories: 200,
    proteinG: 10,
    carbsG: 20,
    fatG: 8,
  })

  const eatenCals = todayLog.foods.reduce((s, f) => s + f.calories, 0)

  return (
    <div className="stack-lg">
      <header className="stack fade-up" style={{ gap: '0.35rem' }}>
        <div className="eyebrow">Fuel log</div>
        <h1 style={{ fontSize: '2rem' }}>Eat & track</h1>
        <p>
          {eatenCals} / {targets.calories} kcal today
          {state.profile.tracksCycle ? ` · ${phaseLabel(phase)} ideas below` : ''}
        </p>
      </header>

      <section className="panel-solid stack fade-up">
        <h2 style={{ fontSize: '1.15rem' }}>Quick add</h2>
        <div className="food-pills">
          {QUICK_FOODS.map((f) => (
            <button
              key={f.name}
              type="button"
              onClick={() =>
                addFood({
                  name: f.name,
                  calories: f.calories,
                  proteinG: f.proteinG,
                  carbsG: f.carbsG,
                  fatG: f.fatG,
                })
              }
            >
              {f.name} · {f.calories}
            </button>
          ))}
        </div>
      </section>

      <section className="panel stack fade-up-delay">
        <h2 style={{ fontSize: '1.15rem' }}>Custom bite</h2>
        <div className="stack" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.65rem' }}>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="foodName">Name</label>
            <input
              id="foodName"
              value={custom.name}
              onChange={(e) => setCustom((c) => ({ ...c, name: e.target.value }))}
              placeholder="e.g. Homemade salad"
            />
          </div>
          {(['calories', 'proteinG', 'carbsG', 'fatG'] as const).map((key) => (
            <div className="field" key={key}>
              <label htmlFor={key}>
                {key === 'calories' ? 'Calories' : key.replace('G', ' (g)')}
              </label>
              <input
                id={key}
                type="number"
                min={0}
                value={custom[key]}
                onChange={(e) => setCustom((c) => ({ ...c, [key]: Number(e.target.value) }))}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!custom.name.trim()}
          onClick={() => {
            addFood({ ...custom, name: custom.name.trim() })
            setCustom((c) => ({ ...c, name: '' }))
          }}
        >
          Add to today
        </button>
      </section>

      <section className="panel-solid stack fade-up">
        <h2 style={{ fontSize: '1.15rem' }}>Research-backed for your phase</h2>
        <p className="tiny">
          Ideas drawn from common menstrual-nutrition guidance (iron/magnesium in menses; complex
          carbs + B6/Ca/Mg in luteal; fiber-rich plates around ovulation). Not medical advice.
        </p>
        {suggestions.map((s) => (
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
                      calories: 240,
                      proteinG: 14,
                      carbsG: 24,
                      fatG: 9,
                    })
                  }
                >
                  + {food}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="panel stack fade-up">
        <h2 style={{ fontSize: '1.15rem' }}>Today’s log</h2>
        {todayLog.foods.length === 0 ? (
          <p>Nothing logged yet — even one small thing helps.</p>
        ) : (
          todayLog.foods
            .slice()
            .reverse()
            .map((f) => (
              <div key={f.id} className="list-row">
                <div>
                  <strong style={{ color: 'var(--forest-deep)' }}>{f.name}</strong>
                  <div className="tiny muted">
                    {format(new Date(f.at), 'h:mm a')} · {f.calories} kcal · P{f.proteinG} C
                    {f.carbsG} F{f.fatG}
                  </div>
                </div>
                <button type="button" className="btn btn-ghost" onClick={() => removeFood(f.id)}>
                  Undo
                </button>
              </div>
            ))
        )}
      </section>
    </div>
  )
}
