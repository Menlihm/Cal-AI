import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useApp } from '../context/AppContext'
import { calcDailyTargets } from '../lib/nutrition'
import { getCravingSuggestions, getCyclePhase, phaseLabel } from '../lib/cycle'
import {
  FOODS,
  FOOD_CATEGORIES,
  filterFoods,
  guessFoodVisual,
  type FoodCategory,
  type FoodItem,
} from '../lib/foods'
import { Icon } from './ui/Icon'
import {
  Card,
  CountUp,
  EmptyState,
  Ring,
  SectionHeader,
  Sheet,
  Slider,
  Stepper,
} from './ui/primitives'
import { FoodThumb } from './FoodThumb'

export function EatView() {
  const { state, todayLog, addFood, removeFood, toggleFavorite } = useApp()
  const { profile } = state
  const targets = calcDailyTargets(profile)
  const phase = getCyclePhase(profile)
  const suggestions = getCravingSuggestions(phase)

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FoodCategory | 'all'>('all')
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [servings, setServings] = useState(1)
  const [customOpen, setCustomOpen] = useState(false)
  const [custom, setCustom] = useState({
    name: '',
    calories: 250,
    proteinG: 15,
    carbsG: 25,
    fatG: 9,
  })

  const eatenCals = todayLog.foods.reduce((s, f) => s + f.calories, 0)

  const results = useMemo(
    () =>
      filterFoods({
        query,
        category,
        diet: profile.dietPreference,
        allergies: profile.allergies,
      }),
    [query, category, profile.dietPreference, profile.allergies],
  )

  const favorites = state.favorites
    .map((id) => FOODS.find((f) => f.id === id))
    .filter(Boolean) as FoodItem[]
  const recents = state.recents
    .map((id) => FOODS.find((f) => f.id === id))
    .filter(Boolean) as FoodItem[]

  const open = (food: FoodItem) => {
    setSelected(food)
    setServings(1)
  }

  const confirmAdd = () => {
    if (!selected) return
    addFood({
      name: selected.name,
      calories: Math.round(selected.calories * servings),
      proteinG: Math.round(selected.proteinG * servings),
      carbsG: Math.round(selected.carbsG * servings),
      fatG: Math.round(selected.fatG * servings),
      category: selected.category,
      iconKey: selected.id,
      servings,
    })
    setSelected(null)
  }

  return (
    <div className="screen stack-lg">
      <header className="topbar">
        <div>
          <span className="eyebrow">Food log</span>
          <h1 className="title" style={{ marginTop: 2 }}>
            Eat
          </h1>
        </div>
        <Ring value={eatenCals} max={targets.calories} size={62} thickness={7}>
          <span className="rv-num" style={{ fontSize: '0.82rem' }}>
            {Math.round((eatenCals / targets.calories) * 100)}%
          </span>
        </Ring>
      </header>

      <Card className="rise">
        <div className="row-between">
          <div>
            <span className="eyebrow">Eaten today</span>
            <div className="metric" style={{ marginTop: 3 }}>
              <CountUp value={eatenCals} /> <span style={{ fontSize: '0.9rem' }}>/ {targets.calories} kcal</span>
            </div>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCustomOpen(true)}>
            <Icon name="plus" size={16} />
            Custom
          </button>
        </div>
        <div className="bar" style={{ marginTop: 12 }}>
          <span style={{ width: `${Math.min(100, (eatenCals / targets.calories) * 100)}%` }} />
        </div>
      </Card>

      <div className="search-field rise rise-1">
        <Icon name="search" size={19} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods…"
          aria-label="Search foods"
        />
      </div>

      <div className="chip-scroll rise rise-1">
        <button
          type="button"
          className={`chip ${category === 'all' ? 'active' : ''}`}
          onClick={() => setCategory('all')}
        >
          <Icon name="sparkle" size={15} />
          All
        </button>
        {FOOD_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip ${category === c.id ? 'active' : ''}`}
            onClick={() => setCategory(c.id)}
          >
            <Icon name={c.icon} size={15} />
            {c.label}
          </button>
        ))}
      </div>

      {!query && category === 'all' && favorites.length > 0 && (
        <Card className="rise rise-2">
          <SectionHeader title="Favorites" icon="star" />
          <div className="food-scroll">
            {favorites.map((f) => (
              <button key={f.id} type="button" className="food-card" onClick={() => open(f)}>
                <FoodThumb name={f.name} icon={f.icon} tint={f.tint} size="tile" />
                <span className="fc-name">{f.name}</span>
                <span className="fc-kcal">{f.calories} kcal</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {!query && category === 'all' && recents.length > 0 && (
        <Card className="rise rise-2">
          <SectionHeader title="Recent" icon="clock" />
          <div className="food-scroll">
            {recents.map((f) => (
              <button key={f.id} type="button" className="food-card" onClick={() => open(f)}>
                <FoodThumb name={f.name} icon={f.icon} tint={f.tint} size="tile" />
                <span className="fc-name">{f.name}</span>
                <span className="fc-kcal">{f.calories} kcal</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card className="rise rise-2">
        <SectionHeader
          title={query ? 'Search results' : category === 'all' ? 'All foods' : FOOD_CATEGORIES.find((c) => c.id === category)!.label}
          icon="fork"
          action={<span className="badge">{results.length}</span>}
        />
        {results.length === 0 ? (
          <EmptyState
            icon="search"
            title="No matches"
            body="Try another search, switch category, or log it as a custom item."
            action={
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCustomOpen(true)}>
                Add custom food
              </button>
            }
          />
        ) : (
          <div className="list">
            {results.map((f) => {
              const fav = state.favorites.includes(f.id)
              return (
                <div key={f.id} className="list-row">
                  <FoodThumb name={f.name} icon={f.icon} tint={f.tint} />
                  <button
                    type="button"
                    className="grow"
                    style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0 }}
                    onClick={() => open(f)}
                  >
                    <div className="lr-title">{f.name}</div>
                    <div className="lr-sub">
                      {f.serving} · {f.calories} kcal · P{f.proteinG} C{f.carbsG} F{f.fatG}
                    </div>
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => toggleFavorite(f.id)}
                    aria-label={fav ? 'Remove favorite' : 'Add favorite'}
                    style={fav ? { color: '#ffb020', background: 'rgba(255,176,32,0.16)' } : undefined}
                  >
                    <Icon name="star" size={17} fill={fav ? 'currentColor' : 'none'} />
                  </button>
                  <button type="button" className="icon-btn" onClick={() => open(f)} aria-label={`Add ${f.name}`}>
                    <Icon name="plus" size={18} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card className="rise rise-3">
        <SectionHeader title={`Ideas for your ${phaseLabel(phase).toLowerCase()} phase`} icon="heart" />
        {suggestions.map((s) => (
          <div key={s.title} style={{ marginTop: 8 }}>
            <div className="row-between" style={{ marginBottom: 6 }}>
              <strong style={{ fontSize: '0.93rem' }}>{s.title}</strong>
              <span className="badge badge-brand">{s.nutrients[0]}</span>
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
                    <span className="fc-kcal">~240 kcal</span>
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
        <SectionHeader title="Today’s log" icon="clock" />
        {todayLog.foods.length === 0 ? (
          <EmptyState
            icon="fork"
            title="Your log is empty"
            body="Add your first bite and Cal AI keeps your macros in balance for the rest of the day."
          />
        ) : (
          <div className="list">
            {todayLog.foods
              .slice()
              .reverse()
              .map((f) => {
                const v = guessFoodVisual(f.name)
                return (
                  <div key={f.id} className="list-row">
                    <FoodThumb name={f.name} icon={v.icon} tint={v.tint} photoDataUrl={f.photoDataUrl} />
                    <div className="grow">
                      <div className="lr-title">{f.name}</div>
                      <div className="lr-sub">
                        {format(new Date(f.at), 'h:mm a')} · {f.calories} kcal
                        {f.servings && f.servings !== 1 ? ` · ${f.servings}×` : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => removeFood(f.id)}
                      aria-label={`Remove ${f.name}`}
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  </div>
                )
              })}
          </div>
        )}
      </Card>

      {/* portion sheet */}
      <Sheet open={selected != null} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && (
          <div className="stack-lg">
            <div className="row" style={{ gap: 14 }}>
              <FoodThumb name={selected.name} icon={selected.icon} tint={selected.tint} size="lg" />
              <div className="grow">
                <div className="lr-title">{selected.serving} per serving</div>
                <div className="lr-sub">
                  {selected.calories} kcal · P{selected.proteinG} C{selected.carbsG} F{selected.fatG}
                </div>
              </div>
            </div>

            <div className="card card-flat" style={{ display: 'grid', gap: 14 }}>
              <div className="row-between">
                <span className="label">Portion</span>
                <span className="metric" style={{ fontSize: '1.35rem' }}>
                  <CountUp value={Math.round(selected.calories * servings)} /> kcal
                </span>
              </div>
              <Stepper
                value={servings}
                onChange={setServings}
                step={0.5}
                min={0.5}
                max={6}
                decimals={1}
                suffix="serv."
              />
              <Slider
                min={0.5}
                max={4}
                step={0.25}
                value={servings}
                onChange={setServings}
                label="Fine tune"
                format={(v) => `${v}×`}
              />
            </div>

            <div className="stat-grid">
              <div className="stat-tile">
                <span className="st-value">{Math.round(selected.proteinG * servings)}g</span>
                <span className="st-label">Protein</span>
              </div>
              <div className="stat-tile">
                <span className="st-value">{Math.round(selected.carbsG * servings)}g</span>
                <span className="st-label">Carbs</span>
              </div>
              <div className="stat-tile">
                <span className="st-value">{Math.round(selected.fatG * servings)}g</span>
                <span className="st-label">Fat</span>
              </div>
            </div>

            <div className="row" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => toggleFavorite(selected.id)}
              >
                <Icon
                  name="star"
                  size={17}
                  fill={state.favorites.includes(selected.id) ? 'currentColor' : 'none'}
                />
                {state.favorites.includes(selected.id) ? 'Saved' : 'Save'}
              </button>
              <button type="button" className="btn btn-primary grow" onClick={confirmAdd}>
                <Icon name="check" size={18} strokeWidth={3} />
                Add to today
              </button>
            </div>
          </div>
        )}
      </Sheet>

      {/* custom food sheet */}
      <Sheet open={customOpen} onClose={() => setCustomOpen(false)} title="Custom food">
        <div className="stack-lg">
          <div className="field">
            <label htmlFor="cf-name">Name</label>
            <input
              id="cf-name"
              value={custom.name}
              onChange={(e) => setCustom((c) => ({ ...c, name: e.target.value }))}
              placeholder="e.g. Grandma’s soup"
            />
          </div>
          <Slider
            label="Calories"
            min={20}
            max={1200}
            step={10}
            value={custom.calories}
            onChange={(v) => setCustom((c) => ({ ...c, calories: v }))}
            format={(v) => `${v} kcal`}
          />
          <Slider
            label="Protein"
            min={0}
            max={80}
            value={custom.proteinG}
            onChange={(v) => setCustom((c) => ({ ...c, proteinG: v }))}
            format={(v) => `${v} g`}
          />
          <Slider
            label="Carbs"
            min={0}
            max={150}
            value={custom.carbsG}
            onChange={(v) => setCustom((c) => ({ ...c, carbsG: v }))}
            format={(v) => `${v} g`}
          />
          <Slider
            label="Fat"
            min={0}
            max={80}
            value={custom.fatG}
            onChange={(v) => setCustom((c) => ({ ...c, fatG: v }))}
            format={(v) => `${v} g`}
          />
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={!custom.name.trim()}
            onClick={() => {
              addFood({ ...custom, name: custom.name.trim() })
              setCustom((c) => ({ ...c, name: '' }))
              setCustomOpen(false)
            }}
          >
            <Icon name="plus" size={18} />
            Add to today
          </button>
        </div>
      </Sheet>
    </div>
  )
}
