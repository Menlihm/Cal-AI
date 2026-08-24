import { format } from 'date-fns'
import { useApp } from '../context/AppContext'
import { calcDailyTargets, getVitaminTargets } from '../lib/nutrition'
import { getCravingSuggestions, getCyclePhase, phaseBlurb, phaseLabel } from '../lib/cycle'
import { formatDuration, minutesSinceLastBite } from '../lib/reminders'
import { projectGoalSpeed, totalBurnedToday } from '../lib/fitness'
import { FOODS, filterFoods, guessFoodVisual } from '../lib/foods'
import { Icon } from './ui/Icon'
import {
  Card,
  CountUp,
  EmptyState,
  MacroRing,
  Ring,
  SectionHeader,
  StatTile,
} from './ui/primitives'
import { FoodThumb } from './FoodThumb'

export function TodayView({
  onOpenPhotos,
  onOpenMove,
  onOpenEat,
}: {
  onOpenPhotos?: () => void
  onOpenMove?: () => void
  onOpenEat?: () => void
}) {
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

  const burn = totalBurnedToday(todayLog.workouts ?? [], todayLog.steps ?? 0, profile.weightKg)
  const budget = targets.calories + burn.total
  const remaining = Math.max(0, budget - eaten.calories)
  const vitamins = getVitaminTargets(profile.sex, profile.age)
  const phase = getCyclePhase(profile)
  const suggestions = getCravingSuggestions(phase)
  const mins = minutesSinceLastBite(todayLog)
  const waterGoal = Math.max(6, Math.round(targets.waterMl / 250))
  const stepGoal = profile.stepGoal || 8000
  const goalHint = projectGoalSpeed(profile, burn.total)[2]
  const takenCount = todayLog.vitaminsTaken.length

  const quickPicks = filterFoods({
    diet: profile.dietPreference,
    allergies: profile.allergies,
  })
  const recentPicks = state.recents
    .map((id) => FOODS.find((f) => f.id === id))
    .filter(Boolean)
    .slice(0, 4) as typeof FOODS
  const shownPicks = [...recentPicks, ...quickPicks.filter((f) => !recentPicks.includes(f))].slice(
    0,
    10,
  )

  const initials = (profile.name || 'You').trim().charAt(0).toUpperCase()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="screen stack-lg">
      <header className="topbar">
        <div>
          <span className="eyebrow">{greeting}</span>
          <h1 className="title" style={{ marginTop: 2 }}>
            {profile.name || 'Friend'}
          </h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {onOpenPhotos && (
            <button type="button" className="icon-btn" onClick={onOpenPhotos} aria-label="Photo check-in">
              <Icon name="camera" size={19} />
            </button>
          )}
          <div className="avatar">
            {profile.avatarDataUrl ? <img src={profile.avatarDataUrl} alt="" /> : initials}
          </div>
        </div>
      </header>

      {nudgeMessage && (
        <div className="banner">
          <span
            className="thumb"
            style={{ background: 'rgba(255,176,32,0.2)', color: '#c98b12', flex: '0 0 44px', width: 44, height: 44 }}
          >
            <Icon name="bell" size={21} />
          </span>
          <div className="grow">
            <strong style={{ fontSize: '0.95rem' }}>Time for a small bite</strong>
            <p className="caption" style={{ marginTop: 3, color: 'var(--text-secondary)' }}>
              {nudgeMessage}
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ marginTop: 10 }}
              onClick={() =>
                addFood({
                  name: 'Quick snack',
                  calories: 120,
                  proteinG: 5,
                  carbsG: 12,
                  fatG: 5,
                  category: 'snacks',
                })
              }
            >
              <Icon name="plus" size={16} />
              Log a 120 kcal snack
            </button>
          </div>
        </div>
      )}

      <Card hero className="rise">
        <div style={{ display: 'grid', justifyItems: 'center', gap: 16 }}>
          <Ring
            value={eaten.calories}
            max={budget}
            size={196}
            thickness={17}
            color="var(--brand-500)"
            gradientTo="var(--brand-400)"
            ariaLabel="Calories remaining"
          >
            <span className="rv-num" style={{ fontSize: '2.9rem' }}>
              <CountUp value={remaining} />
            </span>
            <span className="rv-label">kcal left</span>
            <span className="badge badge-brand" style={{ marginTop: 8 }}>
              <Icon name="flame" size={12} />
              {Math.round(eaten.calories)} / {budget}
            </span>
          </Ring>

          <div className="macro-rings" style={{ width: '100%' }}>
            <MacroRing
              label="Protein"
              value={eaten.proteinG}
              max={targets.proteinG}
              color="var(--accent-protein)"
            />
            <MacroRing
              label="Carbs"
              value={eaten.carbsG}
              max={targets.carbsG}
              color="var(--accent-carb)"
            />
            <MacroRing label="Fat" value={eaten.fatG} max={targets.fatG} color="var(--accent-fat)" />
          </div>
        </div>
      </Card>

      <div className="stat-grid rise rise-1">
        <StatTile icon="flame" value={burn.total} label="Burned" color="#ff7a45" />
        <StatTile icon="steps" value={todayLog.steps || 0} label={`of ${stepGoal.toLocaleString()}`} color="var(--accent-move)" />
        <StatTile
          icon="water"
          value={todayLog.waterGlasses}
          label={`of ${waterGoal} glasses`}
          color="#39a9ff"
        />
        <StatTile icon="pill" value={takenCount} label={`of ${vitamins.length} nutrients`} color="#a77bff" />
      </div>

      <div className="row rise rise-1" style={{ gap: 8 }}>
        <button type="button" className="btn btn-secondary grow" onClick={addWater}>
          <Icon name="water" size={18} />
          Water
        </button>
        {onOpenMove && (
          <button type="button" className="btn btn-secondary grow" onClick={onOpenMove}>
            <Icon name="walk" size={18} />
            Move
          </button>
        )}
        {onOpenEat && (
          <button type="button" className="btn btn-primary grow" onClick={onOpenEat}>
            <Icon name="plus" size={18} />
            Food
          </button>
        )}
      </div>

      <Card className="rise rise-2">
        <SectionHeader
          title="Quick add"
          icon="sparkle"
          action={
            onOpenEat && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={onOpenEat}>
                Browse
                <Icon name="chevronRight" size={15} />
              </button>
            )
          }
        />
        <div className="food-scroll">
          {shownPicks.map((f) => (
            <button
              key={f.id}
              type="button"
              className="food-card"
              onClick={() =>
                addFood({
                  name: f.name,
                  calories: f.calories,
                  proteinG: f.proteinG,
                  carbsG: f.carbsG,
                  fatG: f.fatG,
                  category: f.category,
                  iconKey: f.id,
                  servings: 1,
                })
              }
            >
              <FoodThumb name={f.name} icon={f.icon} tint={f.tint} size="tile" />
              <span className="fc-name">{f.name}</span>
              <span className="fc-kcal">{f.calories} kcal</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="rise rise-2">
        <SectionHeader
          title="Today’s meals"
          icon="fork"
          action={<span className="badge">{todayLog.foods.length} logged</span>}
        />
        {todayLog.foods.length === 0 ? (
          <EmptyState
            icon="fork"
            title="Nothing logged yet"
            body="Even one small thing counts. Tap a quick-add card above to start your day."
            action={
              onOpenEat && (
                <button type="button" className="btn btn-primary btn-sm" onClick={onOpenEat}>
                  <Icon name="plus" size={16} />
                  Add food
                </button>
              )
            }
          />
        ) : (
          <div className="list">
            {todayLog.foods
              .slice()
              .reverse()
              .map((f) => {
                const visual = guessFoodVisual(f.name)
                return (
                  <div key={f.id} className="list-row">
                    <FoodThumb
                      name={f.name}
                      icon={visual.icon}
                      tint={visual.tint}
                      photoDataUrl={f.photoDataUrl}
                    />
                    <div className="grow">
                      <div className="lr-title">{f.name}</div>
                      <div className="lr-sub">
                        {format(new Date(f.at), 'h:mm a')} · P{Math.round(f.proteinG)} · C
                        {Math.round(f.carbsG)} · F{Math.round(f.fatG)}
                      </div>
                    </div>
                    <span className="metric-sm">{f.calories}</span>
                  </div>
                )
              })}
          </div>
        )}
        <p className="caption" style={{ marginTop: 8 }}>
          Last bite {mins == null ? '— none yet today' : `${formatDuration(mins)} ago`}
        </p>
      </Card>

      <Card className="rise rise-3">
        <SectionHeader title="What you may feel like" icon="heart" />
        <p className="caption" style={{ marginBottom: 8 }}>
          {phaseBlurb(phase)}
          {profile.tracksCycle && phase !== 'unknown' ? ` · ${phaseLabel(phase)} phase` : ''}
        </p>
        {suggestions.slice(0, 1).map((s) => (
          <div key={s.title}>
            <div className="row-between" style={{ marginBottom: 8 }}>
              <strong style={{ fontSize: '0.95rem' }}>{s.title}</strong>
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
                        calories: 220,
                        proteinG: 12,
                        carbsG: 22,
                        fatG: 8,
                        category: v.category,
                      })
                    }
                  >
                    <FoodThumb name={food} icon={v.icon} tint={v.tint} size="tile" />
                    <span className="fc-name">{food}</span>
                    <span className="fc-kcal">~220 kcal</span>
                  </button>
                )
              })}
            </div>
            <p className="caption" style={{ marginTop: 8 }}>
              {s.why}
            </p>
          </div>
        ))}
      </Card>

      {goalHint && (
        <Card className="rise rise-3" onClick={onOpenMove}>
          <div className="row" style={{ gap: 14 }}>
            <span
              className="thumb"
              style={{ background: 'rgba(20,184,122,0.16)', color: 'var(--brand-600)' }}
            >
              <Icon name="trend" size={22} />
            </span>
            <div className="grow">
              <div className="lr-title">Goal pace</div>
              <div className="lr-sub">
                ~{goalHint.weeks} weeks at {goalHint.weeklyKg} kg/week · {goalHint.label}
              </div>
            </div>
            <Icon name="chevronRight" size={18} style={{ color: 'var(--text-tertiary)' }} />
          </div>
        </Card>
      )}

      <Card className="rise rise-4">
        <SectionHeader
          title="Vitamins & minerals"
          icon="pill"
          action={
            <span className="badge">
              {takenCount}/{vitamins.length}
            </span>
          }
        />
        <div className="bar" style={{ margin: '6px 0 12px' }}>
          <span style={{ width: `${(takenCount / vitamins.length) * 100}%` }} />
        </div>
        <div className="chip-row">
          {vitamins.map((v) => {
            const taken = todayLog.vitaminsTaken.includes(v.id)
            return (
              <button
                key={v.id}
                type="button"
                className={`chip ${taken ? 'active' : ''}`}
                onClick={() => toggleVitamin(v.id)}
                title={`${v.amount} ${v.unit} · ${v.why}`}
              >
                {taken ? <Icon name="check" size={13} strokeWidth={3} /> : <Icon name="pill" size={13} />}
                {v.name}
              </button>
            )
          })}
        </div>
        <p className="caption" style={{ marginTop: 10 }}>
          NIH-style targets for {profile.sex}, age {profile.age}. Tap once covered by food or a
          supplement.
        </p>
      </Card>
    </div>
  )
}
