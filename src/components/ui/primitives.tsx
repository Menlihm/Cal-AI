import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { Icon, type IconName } from './Icon'

/* ------------------------------------------------------------------ count-up */

export function CountUp({
  value,
  duration = 700,
  decimals = 0,
  className,
}: {
  value: number
  duration?: number
  decimals?: number
  className?: string
}) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const from = fromRef.current
    const delta = value - from
    if (delta === 0) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      fromRef.current = value
      setDisplay(value)
      return
    }
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + delta * eased)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        fromRef.current = value
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      fromRef.current = value
    }
  }, [value, duration])

  const shown =
    decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()
  return <span className={className}>{shown}</span>
}

/* ------------------------------------------------------------------ rings */

export function Ring({
  value,
  max,
  size = 168,
  thickness = 14,
  color = 'var(--brand-500)',
  trackColor,
  gradientTo,
  children,
  ariaLabel,
}: {
  value: number
  max: number
  size?: number
  thickness?: number
  color?: string
  trackColor?: string
  gradientTo?: string
  children?: ReactNode
  ariaLabel?: string
}) {
  const id = useMemo(() => `rg-${Math.random().toString(36).slice(2, 9)}`, [])
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0
  const [drawn, setDrawn] = useState(0)

  useEffect(() => {
    const t = window.setTimeout(() => setDrawn(pct), 60)
    return () => window.clearTimeout(t)
  }, [pct])

  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={ariaLabel}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={gradientTo ?? color} />
          </linearGradient>
        </defs>
        <circle
          className="ring-track-c"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          stroke={trackColor ?? 'var(--ring-track)'}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          stroke={`url(#${id})`}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - drawn)}
          style={{
            transition: 'stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))',
          }}
        />
      </svg>
      <div className="ring-value">{children}</div>
    </div>
  )
}

export function MacroRing({
  label,
  value,
  max,
  unit = 'g',
  color,
}: {
  label: string
  value: number
  max: number
  unit?: string
  color: string
}) {
  return (
    <div className="macro-ring">
      <Ring value={value} max={max} size={72} thickness={7} color={color} ariaLabel={label}>
        <span className="rv-num" style={{ fontSize: '0.92rem' }}>
          <CountUp value={Math.round(value)} />
        </span>
      </Ring>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 1 }}>
        <span className="mr-name">{label}</span>
        <span className="mr-sub">
          of {max}
          {unit}
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ cards */

export function Card({
  children,
  className = '',
  hero = false,
  style,
  onClick,
}: {
  children: ReactNode
  className?: string
  hero?: boolean
  style?: CSSProperties
  onClick?: () => void
}) {
  const cls = `card ${hero ? 'card-hero' : ''} ${onClick ? 'card-tap' : ''} ${className}`.trim()
  if (onClick) {
    return (
      <button type="button" className={cls} style={{ ...style, textAlign: 'left', width: '100%' }} onClick={onClick}>
        {children}
      </button>
    )
  }
  return (
    <section className={cls} style={style}>
      {children}
    </section>
  )
}

export function SectionHeader({
  title,
  action,
  icon,
}: {
  title: string
  action?: ReactNode
  icon?: IconName
}) {
  return (
    <div className="row-between" style={{ marginBottom: 2 }}>
      <div className="row" style={{ gap: 8 }}>
        {icon && <Icon name={icon} size={18} style={{ color: 'var(--text-tertiary)' }} />}
        <h2 className="section-title">{title}</h2>
      </div>
      {action}
    </div>
  )
}

/* ------------------------------------------------------------------ selection */

export function SelectCard({
  icon,
  title,
  desc,
  active,
  onClick,
  accent,
}: {
  icon: IconName
  title: string
  desc?: string
  active: boolean
  onClick: () => void
  accent?: string
}) {
  return (
    <button type="button" className={`select-card ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="sc-icon" style={active && accent ? { background: accent, color: '#fff' } : undefined}>
        <Icon name={icon} size={22} />
      </span>
      <span className="sc-body">
        <span className="sc-title">{title}</span>
        {desc && <span className="sc-desc">{desc}</span>}
      </span>
      <span className="sc-check">
        <Icon name="check" size={14} strokeWidth={3} />
      </span>
    </button>
  )
}

export function TileCard({
  icon,
  title,
  desc,
  active,
  onClick,
}: {
  icon: IconName
  title: string
  desc?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button type="button" className={`tile-card ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="tc-icon">
        <Icon name={icon} size={26} />
      </span>
      <span className="tc-title">{title}</span>
      {desc && <span className="tc-desc">{desc}</span>}
    </button>
  )
}

/* ------------------------------------------------------------------ controls */

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
  suffix = '',
  decimals = 0,
}: {
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  max?: number
  suffix?: string
  decimals?: number
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v))
  return (
    <div className="stepper">
      <button
        type="button"
        className="icon-btn"
        onClick={() => onChange(clamp(Number((value - step).toFixed(2))))}
        aria-label="Decrease"
      >
        <Icon name="minus" size={18} />
      </button>
      <span className="sp-value">
        {decimals > 0 ? value.toFixed(decimals) : Math.round(value)}
        {suffix && <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}> {suffix}</span>}
      </span>
      <button
        type="button"
        className="icon-btn"
        onClick={() => onChange(clamp(Number((value + step).toFixed(2))))}
        aria-label="Increase"
      >
        <Icon name="plus" size={18} />
      </button>
    </div>
  )
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  format,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  label?: string
  format?: (v: number) => string
}) {
  return (
    <div className="stack" style={{ gap: 4 }}>
      {label && (
        <div className="row-between">
          <span className="label">{label}</span>
          <span className="metric-sm">{format ? format(value) : value}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}) {
  return (
    <button
      type="button"
      className={`switch ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span />
    </button>
  )
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className={value === o.value ? 'active' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function ProgressDots({ total, index }: { total: number; index: number }) {
  return (
    <div className="dots" aria-label={`Step ${index + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={i === index ? 'active' : i < index ? 'done' : ''} />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ feedback */

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="empty">
      <div className="empty-art">
        <Icon name={icon} size={34} />
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  )
}

export function StatTile({
  icon,
  value,
  label,
  color = 'var(--brand-500)',
  decimals = 0,
  suffix,
}: {
  icon: IconName
  value: number
  label: string
  color?: string
  decimals?: number
  suffix?: string
}) {
  return (
    <div className="stat-tile">
      <span
        className="st-icon"
        style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
      >
        <Icon name={icon} size={17} />
      </span>
      <span className="st-value">
        <CountUp value={value} decimals={decimals} />
        {suffix && <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{suffix}</span>}
      </span>
      <span className="st-label">{label}</span>
    </div>
  )
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  // Portal to body: animated ancestors create containing blocks that would
  // otherwise trap this fixed-position overlay inside the scrolling screen.
  return createPortal(
    <div className="sheet-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grabber" />
        {title && (
          <div className="row-between" style={{ marginBottom: 12 }}>
            <h2 className="title" style={{ fontSize: '1.25rem' }}>
              {title}
            </h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <Icon name="close" size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}

/* ------------------------------------------------------------------ chart */

export function LineChart({
  points,
  height = 150,
  color = 'var(--brand-500)',
  goal,
  formatValue,
}: {
  points: { x: number; y: number; label?: string }[]
  height?: number
  color?: string
  goal?: number
  formatValue?: (v: number) => string
}) {
  const id = useMemo(() => `lc-${Math.random().toString(36).slice(2, 9)}`, [])
  const width = 320

  if (points.length === 0) return null

  const ys = points.map((p) => p.y)
  const allY = goal != null ? [...ys, goal] : ys
  const minY = Math.min(...allY)
  const maxY = Math.max(...allY)
  const pad = Math.max(0.6, (maxY - minY) * 0.18)
  const lo = minY - pad
  const hi = maxY + pad
  const spanY = hi - lo || 1

  const xs = points.map((p) => p.x)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const spanX = maxX - minX || 1

  const px = (x: number) => 8 + ((x - minX) / spanX) * (width - 16)
  const py = (y: number) => height - 18 - ((y - lo) / spanY) * (height - 34)

  const coords = points.map((p) => ({ x: px(p.x), y: py(p.y), raw: p }))

  const line = coords
    .map((c, i) => {
      if (i === 0) return `M ${c.x} ${c.y}`
      const prev = coords[i - 1]
      const cx = (prev.x + c.x) / 2
      return `C ${cx} ${prev.y}, ${cx} ${c.y}, ${c.x} ${c.y}`
    })
    .join(' ')

  const area = `${line} L ${coords[coords.length - 1].x} ${height - 10} L ${coords[0].x} ${height - 10} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      role="img"
      aria-label="Weight trend"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {goal != null && (
        <>
          <line
            x1="8"
            x2={width - 8}
            y1={py(goal)}
            y2={py(goal)}
            stroke="var(--text-tertiary)"
            strokeWidth="1"
            strokeDasharray="4 5"
            opacity="0.7"
          />
          <text
            x={width - 10}
            y={py(goal) - 5}
            textAnchor="end"
            fontSize="9"
            fill="var(--text-tertiary)"
            fontWeight="700"
          >
            goal {formatValue ? formatValue(goal) : goal}
          </text>
        </>
      )}
      <path d={area} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 1000,
          strokeDashoffset: 0,
          animation: 'none',
        }}
      />
      {coords.map((c, i) => (
        <circle
          key={i}
          cx={c.x}
          cy={c.y}
          r={i === coords.length - 1 ? 4.5 : 2.6}
          fill={i === coords.length - 1 ? color : 'var(--bg-elev)'}
          stroke={color}
          strokeWidth="2"
        />
      ))}
    </svg>
  )
}
