import { useRef, useState } from 'react'
import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { useApp } from '../context/AppContext'
import { compressImage, todayKey } from '../lib/storage'
import { Icon } from './ui/Icon'
import { Card, EmptyState, SectionHeader, Sheet, Slider } from './ui/primitives'
import { formatWeight, kgToDisplay, displayToKg, weightUnit } from '../lib/units'

export function PhotosView({ onBack }: { onBack?: () => void }) {
  const { state, addPhoto, removePhoto, recordWeight } = useApp()
  const { profile } = state
  const inputRef = useRef<HTMLInputElement>(null)
  const [note, setNote] = useState('')
  const [weight, setWeight] = useState(kgToDisplay(profile.weightKg, profile.units))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [picked, setPicked] = useState<string[]>([])

  const onPick = async (file: File | null) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const dataUrl = await compressImage(file)
      const kg = displayToKg(weight, profile.units)
      addPhoto({ date: todayKey(), dataUrl, note: note.trim(), weightKg: kg })
      if (Number.isFinite(kg) && kg > 0) recordWeight(kg)
      setNote('')
      setAddOpen(false)
    } catch {
      setError('Could not process that photo. Try another image.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const togglePick = (id: string) => {
    setPicked((p) => {
      if (p.includes(id)) return p.filter((x) => x !== id)
      if (p.length === 2) return [p[1], id]
      return [...p, id]
    })
  }

  const [a, b] = picked.map((id) => state.photos.find((p) => p.id === id))
  const canCompare = a && b
  const daysApart =
    a && b ? Math.abs(differenceInCalendarDays(parseISO(a.date), parseISO(b.date))) : 0
  const weightDelta =
    a?.weightKg != null && b?.weightKg != null ? b.weightKg - a.weightKg : null

  return (
    <div className="screen stack-lg">
      <header className="topbar">
        <div className="row" style={{ gap: 10 }}>
          {onBack && (
            <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
              <Icon name="chevronLeft" size={19} />
            </button>
          )}
          <div>
            <span className="eyebrow">Progress lens</span>
            <h1 className="title" style={{ marginTop: 2 }}>
              Photos
            </h1>
          </div>
        </div>
        <button
          type="button"
          className={`icon-btn ${compareMode ? 'active' : ''}`}
          onClick={() => {
            setCompareMode((c) => !c)
            setPicked([])
          }}
          aria-label="Compare photos"
          style={
            compareMode
              ? { background: 'var(--brand-glow)', color: 'var(--brand-600)' }
              : undefined
          }
        >
          <Icon name="compare" size={19} />
        </button>
      </header>

      <Card className="rise" onClick={() => setAddOpen(true)}>
        <div className="row" style={{ gap: 14 }}>
          <span
            className="thumb thumb-lg"
            style={{ background: 'var(--brand-glow)', color: 'var(--brand-600)' }}
          >
            <Icon name="camera" size={26} />
          </span>
          <div className="grow">
            <div className="lr-title">New check-in</div>
            <div className="lr-sub">Same light, same pose — the story shows up over weeks</div>
          </div>
          <Icon name="chevronRight" size={18} style={{ color: 'var(--text-tertiary)' }} />
        </div>
      </Card>

      {compareMode && (
        <Card className="rise rise-1">
          <SectionHeader
            title="Compare"
            icon="compare"
            action={<span className="badge">{picked.length}/2 selected</span>}
          />
          {canCompare ? (
            <div className="stack">
              <div className="compare-grid">
                {[a, b].map((p, i) => (
                  <figure key={p!.id} className="compare-cell" style={{ margin: 0 }}>
                    <img src={p!.dataUrl} alt={`Check-in ${p!.date}`} />
                    <figcaption className="pt-meta" style={{ position: 'absolute', inset: 'auto 0 0 0' }}>
                      {format(parseISO(p!.date), 'MMM d')}
                      {p!.weightKg != null ? ` · ${formatWeight(p!.weightKg, profile.units)}` : ''}
                      <span className="pt-badge" style={{ top: 6, left: 6, right: 'auto' }}>
                        {i === 0 ? 'A' : 'B'}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
              <div className="stat-grid">
                <div className="stat-tile">
                  <span className="st-value">{daysApart}</span>
                  <span className="st-label">days apart</span>
                </div>
                {weightDelta != null && (
                  <div className="stat-tile">
                    <span className="st-value" style={{ color: weightDelta <= 0 ? 'var(--brand-600)' : 'var(--text)' }}>
                      {weightDelta > 0 ? '+' : ''}
                      {kgToDisplay(weightDelta, profile.units)}
                    </span>
                    <span className="st-label">{weightUnit(profile.units)} change</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="caption">Tap two photos below to see them side by side.</p>
          )}
        </Card>
      )}

      <Card className="rise rise-2">
        <SectionHeader
          title="Check-ins"
          icon="camera"
          action={<span className="badge">{state.photos.length}</span>}
        />
        {state.photos.length === 0 ? (
          <EmptyState
            icon="camera"
            title="No check-ins yet"
            body="Your first photo starts the gallery. Progress is easier to see side by side than on a scale."
            action={
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}>
                <Icon name="plus" size={16} />
                Add photo
              </button>
            }
          />
        ) : (
          <div className="photo-grid" style={{ marginTop: 8 }}>
            {state.photos.map((p) => {
              const idx = picked.indexOf(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`photo-tile ${idx >= 0 ? 'selected' : ''}`}
                  onClick={() => (compareMode ? togglePick(p.id) : removePhotoConfirm(p.id, removePhoto))}
                >
                  <img src={p.dataUrl} alt={`Check-in ${p.date}`} />
                  {idx >= 0 && <span className="pt-badge">{idx === 0 ? 'A' : 'B'}</span>}
                  <span className="pt-meta">
                    {format(parseISO(p.date), 'MMM d')}
                    {p.weightKg != null ? ` · ${kgToDisplay(p.weightKg, profile.units)}${weightUnit(profile.units)}` : ''}
                  </span>
                </button>
              )
            })}
          </div>
        )}
        <p className="caption" style={{ marginTop: 10 }}>
          {compareMode ? 'Tap two photos to compare.' : 'Tap a photo to delete it.'}
        </p>
      </Card>

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Today’s check-in">
        <div className="stack-lg">
          <div className="field">
            <label htmlFor="photo-note">How do you feel?</label>
            <input
              id="photo-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Stronger, less bloated, proud…"
            />
          </div>
          <Slider
            label="Weight today"
            min={profile.units === 'metric' ? 35 : 77}
            max={profile.units === 'metric' ? 200 : 440}
            step={profile.units === 'metric' ? 0.1 : 0.2}
            value={weight}
            onChange={setWeight}
            format={(v) => `${v.toFixed(1)} ${weightUnit(profile.units)}`}
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => void onPick(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <Icon name="camera" size={18} />
            {busy ? 'Saving…' : 'Take or choose photo'}
          </button>
          {error && <p style={{ color: '#e0435a' }}>{error}</p>}
        </div>
      </Sheet>
    </div>
  )
}

function removePhotoConfirm(id: string, remove: (id: string) => void) {
  if (confirm('Delete this check-in photo?')) remove(id)
}
