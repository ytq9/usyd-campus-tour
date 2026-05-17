import React from 'react'

export type HotspotIconKey =
  | 'default'
  | 'arrow'
  | 'info'
  | 'pin'
  | 'star'
  | 'building'
  | 'academic'
  | 'camera'
  | 'question'

export const HOTSPOT_ICON_OPTIONS: { value: HotspotIconKey; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'arrow', label: 'Arrow' },
  { value: 'info', label: 'Info' },
  { value: 'pin', label: 'Pin' },
  { value: 'star', label: 'Star' },
  { value: 'building', label: 'Building' },
  { value: 'academic', label: 'Academic' },
  { value: 'camera', label: 'Camera' },
  { value: 'question', label: 'Question' },
]

type PathSet = string[]

const PATHS: Record<Exclude<HotspotIconKey, 'default'>, PathSet> = {
  arrow: [
    'M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3',
  ],
  info: [
    'M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z',
  ],
  pin: [
    'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    'M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z',
  ],
  star: [
    'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z',
  ],
  building: [
    'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z',
  ],
  academic: [
    'M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5',
  ],
  camera: [
    'M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z',
    'M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z',
  ],
  question: [
    'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z',
  ],
}

type IconProps = {
  iconKey?: HotspotIconKey | string | null
  hotspotType?: 'info' | 'scene' | string
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
  style?: React.CSSProperties
}

function resolveKey(iconKey: IconProps['iconKey'], hotspotType: IconProps['hotspotType']): HotspotIconKey {
  const key = (iconKey || 'default') as HotspotIconKey
  if (key !== 'default') return key
  return hotspotType === 'scene' ? 'arrow' : 'info'
}

export function HotspotIcon({
  iconKey,
  hotspotType,
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className,
  style,
}: IconProps) {
  const key = resolveKey(iconKey, hotspotType) as Exclude<HotspotIconKey, 'default'>
  const paths: PathSet = PATHS[key]

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      stroke={color}
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
    >
      {paths.map((d: string, idx: number) => (
        <path key={idx} strokeLinecap="round" strokeLinejoin="round" d={d} />
      ))}
    </svg>
  )
}
