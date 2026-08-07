import type { ReactNode, SVGProps } from 'react'

export type IconName =
  | 'home'
  | 'fork'
  | 'activity'
  | 'cycle'
  | 'user'
  | 'flame'
  | 'protein'
  | 'carbs'
  | 'fat'
  | 'water'
  | 'steps'
  | 'walk'
  | 'run'
  | 'bike'
  | 'hike'
  | 'stairs'
  | 'dumbbell'
  | 'yoga'
  | 'dance'
  | 'swim'
  | 'pin'
  | 'camera'
  | 'plus'
  | 'minus'
  | 'check'
  | 'close'
  | 'chevronRight'
  | 'chevronLeft'
  | 'search'
  | 'star'
  | 'clock'
  | 'bell'
  | 'moon'
  | 'sun'
  | 'scale'
  | 'target'
  | 'trend'
  | 'sparkle'
  | 'leaf'
  | 'fish'
  | 'egg'
  | 'meat'
  | 'grain'
  | 'fruit'
  | 'veggie'
  | 'snack'
  | 'drink'
  | 'dairy'
  | 'pill'
  | 'heart'
  | 'droplet'
  | 'sofa'
  | 'shield'
  | 'trash'
  | 'share'
  | 'phone'
  | 'compare'
  | 'female'
  | 'male'
  | 'trophy'
  | 'muscle'
  | 'balance'

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
}

const PATHS: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.8V19a1 1 0 0 0 1 1h3.5v-4.5h3V20H17a1 1 0 0 0 1-1V9.8" />
    </>
  ),
  fork: (
    <>
      <path d="M7 3v6a2.5 2.5 0 0 0 5 0V3" />
      <path d="M9.5 11.5V21" />
      <path d="M17 3c-1.6 1.7-2.2 3.8-2 6 .1 1.2.8 2 2 2.2V21" />
    </>
  ),
  activity: (
    <>
      <path d="M3 13h3.6l2.2-6 3.4 11 2.6-8 1.8 3H21" />
    </>
  ),
  cycle: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 1 8 8" strokeWidth="2.6" />
      <circle cx="20" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M4.8 20c1.3-3.7 4-5.6 7.2-5.6s5.9 1.9 7.2 5.6" />
    </>
  ),
  flame: (
    <>
      <path d="M12 3c.6 3.4-1.6 4.6-2.8 6.3A6.6 6.6 0 0 0 8 13.4 4.3 4.3 0 0 0 12 21a4.3 4.3 0 0 0 4-7.6c-.5-1-1.3-1.7-1.7-2.6" />
      <path d="M12 21a2.2 2.2 0 0 1-2-3.3c.4-.8 1.4-1.3 1.6-2.6.7.8 2.4 1.9 2.4 3.6A2.2 2.2 0 0 1 12 21Z" />
    </>
  ),
  protein: (
    <>
      <path d="M14.5 4.2a4.4 4.4 0 0 1 5.3 5.3c-.5 2-2.4 3.3-4.2 4.4-2 1.3-3.4 2.6-4.6 4.3a4.2 4.2 0 0 1-6.5-5.3c1.2-1.8 3-2.8 4.9-3.9 1.8-1 3.5-2.2 5.1-4.8Z" />
    </>
  ),
  carbs: (
    <>
      <path d="M5.5 15.5c0-4.4 2.9-8 6.5-8s6.5 3.6 6.5 8" />
      <path d="M4 15.5h16v1.8a2.7 2.7 0 0 1-2.7 2.7H6.7A2.7 2.7 0 0 1 4 17.3Z" />
      <path d="M9 11.5h.01M12 10h.01M15 11.5h.01" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  fat: (
    <>
      <circle cx="9.5" cy="9.5" r="4" />
      <circle cx="15.5" cy="15" r="3.2" />
      <circle cx="16" cy="7.5" r="2" />
    </>
  ),
  water: (
    <>
      <path d="M12 3.5c3.6 4 6 6.9 6 9.9a6 6 0 0 1-12 0c0-3 2.4-5.9 6-9.9Z" />
    </>
  ),
  steps: (
    <>
      <path d="M7.5 4c1.7 0 2.6 1.4 2.6 3.4 0 1.7-.6 2.6-.6 4 0 1.2.4 1.9.4 2.9 0 1.4-1 2.2-2.4 2.2s-2.4-.8-2.4-2.2c0-1 .4-1.7.4-2.9 0-1.4-.6-2.3-.6-4C4.9 5.4 5.8 4 7.5 4Z" />
      <path d="M16.5 8c1.7 0 2.6 1.4 2.6 3.4 0 1.7-.6 2.6-.6 4 0 1.2.4 1.9.4 2.9 0 1.4-1 2.2-2.4 2.2s-2.4-.8-2.4-2.2c0-1 .4-1.7.4-2.9 0-1.4-.6-2.3-.6-4 0-2 .9-3.4 2.6-3.4Z" />
    </>
  ),
  walk: (
    <>
      <circle cx="13" cy="4.4" r="1.9" />
      <path d="M11 21l1.6-5.2-2.2-2.3.8-4.3 3.2 1.4 1.4 2.9 2.2.8" />
      <path d="M10.2 9.2 7.6 11l-1 3.4" />
      <path d="m12.6 15.8 2.4 5.2" />
    </>
  ),
  run: (
    <>
      <circle cx="15.5" cy="4.6" r="1.9" />
      <path d="m8 21 3-5-2.4-2.6 1.4-4.6 3.6 1.6 1.2 3 3.2 1" />
      <path d="m9.9 9.4-3.4 1.4L4.8 14" />
      <path d="m13.8 15.2 1.6 5.8" />
    </>
  ),
  bike: (
    <>
      <circle cx="5.8" cy="17" r="3.2" />
      <circle cx="18.2" cy="17" r="3.2" />
      <path d="M8.5 8.2h3.2l2.6 8.8M11 8.2 8 17M14.4 8.2h2.8l1 8.8" />
      <circle cx="15.6" cy="4.6" r="1.5" />
    </>
  ),
  hike: (
    <>
      <path d="M3 20h18" />
      <path d="m6 20 5-11 3.4 6.2L16.5 12 21 20" />
      <circle cx="11" cy="5.2" r="1.6" />
    </>
  ),
  stairs: (
    <>
      <path d="M4 20h4v-4h4v-4h4V8h4" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10" />
    </>
  ),
  yoga: (
    <>
      <circle cx="12" cy="4.6" r="1.9" />
      <path d="M12 8v5m0 0-4.5 2.6M12 13l4.5 2.6M6 20h12" />
    </>
  ),
  dance: (
    <>
      <circle cx="13.5" cy="4.4" r="1.9" />
      <path d="M13 8 9.6 12l2.4 2.2-1.4 6.4M12 14.2l4.4 1.6 1.8 4.8M13.2 9.6 17.5 8" />
    </>
  ),
  swim: (
    <>
      <path d="M3 17.5c1.6 0 1.6 1.4 3.2 1.4s1.6-1.4 3.2-1.4 1.6 1.4 3.2 1.4 1.6-1.4 3.2-1.4 1.6 1.4 3.2 1.4" />
      <path d="M6.5 14.6 12 11l4 2" />
      <circle cx="17.4" cy="7.4" r="1.8" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8.5h3l1.4-2.2h7.2L17 8.5h3a1 1 0 0 1 1 1v8.2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.5" r="3.4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="m5 12.8 4.2 4.2L19 7.2" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chevronRight: <path d="m9 5 7 7-7 7" />,
  chevronLeft: <path d="m15 5-7 7 7 7" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.4" />
      <path d="m16 16 4.4 4.4" />
    </>
  ),
  star: (
    <path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9L3.5 9.8l5.9-.8Z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.4V12l3.2 2" />
    </>
  ),
  bell: (
    <>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.3 5.4 1.9 6H4.6c.6-.6 1.9-2 1.9-6Z" />
      <path d="M10.2 19.2a2 2 0 0 0 3.6 0" />
    </>
  ),
  moon: <path d="M20 14.2A8.4 8.4 0 0 1 9.8 4 8.6 8.6 0 1 0 20 14.2Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" />
    </>
  ),
  scale: (
    <>
      <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="3.4" />
      <path d="M8.4 10.6a3.8 3.8 0 0 1 7.2 0" />
      <path d="M12 10.6 13.6 8" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  trend: (
    <>
      <path d="M3.5 16.5 9 11l3.4 3.2L20 6.6" />
      <path d="M15.4 6.6H20v4.6" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.4 13.7 9l5.6 1.7-5.6 1.7L12 18l-1.7-5.6L4.7 10.7 10.3 9Z" />
      <path d="M18.4 16.4l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7Z" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4c0 8.4-4.2 13-9.4 13A4.6 4.6 0 0 1 6 12.4C6 7.6 11.6 4.6 20 4Z" />
      <path d="M4.5 20c1.6-4.4 4.6-7.6 9-9.6" />
    </>
  ),
  fish: (
    <>
      <path d="M3.6 12c2.6-3.6 5.8-5.4 9.4-5.4 3.2 0 5.9 1.8 7.4 5.4-1.5 3.6-4.2 5.4-7.4 5.4-3.6 0-6.8-1.8-9.4-5.4Z" />
      <path d="m20.4 12 .1-4.4-3.6 2.6M16.6 10.4h.01" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  egg: <path d="M12 3.4c3.4 0 6 5 6 9a6 6 0 0 1-12 0c0-4 2.6-9 6-9Z" />,
  meat: (
    <>
      <path d="M6.8 17.2c-2.6-2.6-2.3-7 .8-10s7.4-3.4 10 .8-.5 8.2-3.4 10c-2.4 1.5-5.2 1.4-7.4-.8Z" />
      <circle cx="9.6" cy="14.4" r="2.2" />
    </>
  ),
  grain: (
    <>
      <path d="M12 21V8" />
      <path d="M12 12c-3 0-4.6-1.8-4.6-4.4C10.2 7.6 12 9 12 12ZM12 12c3 0 4.6-1.8 4.6-4.4C13.8 7.6 12 9 12 12ZM12 17c-3 0-4.6-1.6-4.6-4.2C10.2 12.8 12 14 12 17ZM12 17c3 0 4.6-1.6 4.6-4.2C13.8 12.8 12 14 12 17Z" />
    </>
  ),
  fruit: (
    <>
      <path d="M12 8c-1.2-1.4-3-2-4.6-1.2C5.4 7.8 4.6 10.4 5.4 13c1 3.4 3.6 7 6.6 7s5.6-3.6 6.6-7c.8-2.6 0-5.2-2-6.2C14.9 6 13.2 6.6 12 8Z" />
      <path d="M12 7.4c.2-1.6 1-2.8 2.6-3.4" />
    </>
  ),
  veggie: (
    <>
      <path d="M8 20c-3 0-4.6-3-4-6.4.5-2.8 2.6-4.6 5.2-4.6 1.2 0 2 .4 2.8.4s1.6-.4 2.8-.4c2.6 0 4.7 1.8 5.2 4.6.6 3.4-1 6.4-4 6.4-1.6 0-2.6-.8-4-.8s-2.4.8-4 .8Z" />
      <path d="M12 9V6.2c0-1.4 1.2-2.6 3-2.8" />
    </>
  ),
  snack: (
    <>
      <path d="M5 10.5h14l-1.4 8.2a2 2 0 0 1-2 1.7H8.4a2 2 0 0 1-2-1.7Z" />
      <path d="M8.6 10.5c-1-3.4.6-6.4 3.4-6.4s4.4 3 3.4 6.4" />
    </>
  ),
  drink: (
    <>
      <path d="M6.4 5h11.2l-1.3 13.4a2 2 0 0 1-2 1.8h-4.6a2 2 0 0 1-2-1.8Z" />
      <path d="M6.9 10.4h10.2" />
    </>
  ),
  dairy: (
    <>
      <path d="M9 3h6v2.4l2 3.2V20a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8.6l2-3.2Z" />
      <path d="M7 11.6h10" />
    </>
  ),
  pill: (
    <>
      <rect x="3.2" y="9" width="17.6" height="6" rx="3" transform="rotate(-45 12 12)" />
      <path d="M9.2 9.2 14.8 14.8" />
    </>
  ),
  heart: (
    <path d="M12 20s-7.4-4.4-7.4-9.4A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.4 3c0 5-7.4 9.4-7.4 9.4Z" />
  ),
  droplet: <path d="M12 3.5c3.6 4 6 6.9 6 9.9a6 6 0 0 1-12 0c0-3 2.4-5.9 6-9.9Z" />,
  sofa: (
    <>
      <path d="M4 12.5V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3.5" />
      <path d="M3 13.4a2 2 0 0 1 4 0V16h10v-2.6a2 2 0 0 1 4 0V19H3Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.4 19 6v5.6c0 4.4-3 7.4-7 8.9-4-1.5-7-4.5-7-8.9V6Z" />
      <path d="m9.2 12 2 2 3.6-3.8" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 7h15M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
      <path d="M6.6 7 7.5 19a1.6 1.6 0 0 0 1.6 1.5h5.8A1.6 1.6 0 0 0 16.5 19L17.4 7" />
    </>
  ),
  share: (
    <>
      <path d="M12 15V4m0 0L8.4 7.6M12 4l3.6 3.6" />
      <path d="M5 13v5.4a1.6 1.6 0 0 0 1.6 1.6h10.8a1.6 1.6 0 0 0 1.6-1.6V13" />
    </>
  ),
  phone: (
    <>
      <rect x="6.5" y="2.6" width="11" height="18.8" rx="3" />
      <path d="M10.6 18.4h2.8" />
    </>
  ),
  compare: (
    <>
      <rect x="3" y="5" width="7.4" height="14" rx="2" />
      <rect x="13.6" y="5" width="7.4" height="14" rx="2" />
    </>
  ),
  female: (
    <>
      <circle cx="12" cy="8.6" r="5" />
      <path d="M12 13.6V21M9 18h6" />
    </>
  ),
  male: (
    <>
      <circle cx="10.2" cy="13.8" r="5" />
      <path d="M14.4 9.6 20 4m0 0h-4.6M20 4v4.6" />
    </>
  ),
  trophy: (
    <>
      <path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0Z" />
      <path d="M7.5 5.6H5a2.4 2.4 0 0 0 2.5 3.6M16.5 5.6H19a2.4 2.4 0 0 1-2.5 3.6" />
      <path d="M12 13.5V17m-3 3h6" />
    </>
  ),
  muscle: (
    <>
      <path d="M4.5 12.6c0-3 1.5-5.6 4.2-5.6 2 0 3 1.4 4.2 2.8 1.2 1.4 2.4 2 4 2 2 0 3.1 1.6 3.1 3.4 0 2.6-2.2 4.8-5.6 4.8H8.3c-2.4 0-3.8-1.6-3.8-3.6Z" />
      <path d="M9.5 13.6c1.6 0 2.8 1 2.8 2.6" />
    </>
  ),
  balance: (
    <>
      <path d="M12 4v16M6 8h12" />
      <path d="M4 15a3 3 0 0 0 6 0L7 8Zm10 0a3 3 0 0 0 6 0l-3-7Z" />
    </>
  ),
}

export function Icon({ name, size = 22, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}
