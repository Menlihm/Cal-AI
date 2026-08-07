import { Icon, type IconName } from './ui/Icon'
import { guessFoodVisual } from '../lib/foods'

export function FoodThumb({
  name,
  icon,
  tint,
  photoDataUrl,
  size = 'md',
}: {
  name: string
  icon?: IconName
  tint?: string
  photoDataUrl?: string
  size?: 'sm' | 'md' | 'lg' | 'tile'
}) {
  const guess = guessFoodVisual(name)
  const useIcon = icon ?? guess.icon
  const useTint = tint ?? guess.tint

  const cls =
    size === 'tile' ? 'food-tile-img' : size === 'lg' ? 'thumb thumb-lg' : 'thumb'
  const iconSize = size === 'lg' || size === 'tile' ? 28 : 22

  if (photoDataUrl) {
    return (
      <span className={cls}>
        <img src={photoDataUrl} alt={name} />
      </span>
    )
  }

  return (
    <span
      className={cls}
      style={{
        background: `linear-gradient(140deg, color-mix(in srgb, ${useTint} 30%, transparent), color-mix(in srgb, ${useTint} 12%, transparent))`,
        color: useTint,
      }}
      aria-hidden="true"
    >
      <Icon name={useIcon} size={iconSize} strokeWidth={1.8} />
    </span>
  )
}
