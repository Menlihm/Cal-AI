import { useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useApp } from '../context/AppContext'
import { compressImage, todayKey } from '../lib/storage'

export function PhotosView() {
  const { state, addPhoto, removePhoto, updateProfile } = useApp()
  const inputRef = useRef<HTMLInputElement>(null)
  const [note, setNote] = useState('')
  const [weight, setWeight] = useState(String(state.profile.weightKg))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onPick = async (file: File | null) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const dataUrl = await compressImage(file)
      const w = Number(weight)
      addPhoto({
        date: todayKey(),
        dataUrl,
        note: note.trim(),
        weightKg: Number.isFinite(w) ? w : undefined,
      })
      if (Number.isFinite(w) && w > 0) {
        updateProfile({ weightKg: w })
      }
      setNote('')
    } catch {
      setError('Could not process that photo. Try another image.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="stack-lg">
      <header className="stack fade-up" style={{ gap: '0.35rem' }}>
        <div className="eyebrow">Progress lens</div>
        <h1 style={{ fontSize: '2rem' }}>Daily photo check-ins</h1>
        <p>Same light, same pose when you can — photos often tell the story before the scale does.</p>
      </header>

      <section className="panel-solid stack fade-up">
        <div className="field">
          <label htmlFor="photoNote">Today’s note</label>
          <input
            id="photoNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Feeling stronger / less bloated / proud"
          />
        </div>
        <div className="field">
          <label htmlFor="photoWeight">Optional weight (kg)</label>
          <input
            id="photoWeight"
            type="number"
            step={0.1}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
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
          className="btn btn-primary"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? 'Saving…' : 'Upload today’s photo'}
        </button>
        {error && <p style={{ color: '#9a3040' }}>{error}</p>}
      </section>

      <section className="stack fade-up-delay">
        {state.photos.length === 0 ? (
          <div className="panel">
            <p>No check-ins yet. Your first photo starts the gallery.</p>
          </div>
        ) : (
          <div className="photo-grid">
            {state.photos.map((p) => (
              <figure key={p.id} className="photo-tile">
                <img src={p.dataUrl} alt={`Check-in ${p.date}`} />
                <figcaption className="meta">
                  <div>{format(parseISO(p.date), 'MMM d, yyyy')}</div>
                  {p.weightKg != null && <div>{p.weightKg} kg</div>}
                  {p.note && <div>{p.note}</div>}
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{
                      marginTop: '0.4rem',
                      padding: '0.35rem 0.7rem',
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.35)',
                    }}
                    onClick={() => removePhoto(p.id)}
                  >
                    Delete
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
