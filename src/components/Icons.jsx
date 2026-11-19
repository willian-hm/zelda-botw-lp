export function BrandEmblem({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="9" stroke="currentColor" strokeOpacity="0.38" strokeWidth="1.4" />
      <path
        d="M20 7L23.6 16.4L33 20L23.6 23.6L20 33L16.4 23.6L7 20L16.4 16.4L20 7Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="20" r="3" fill="#49C5CE" />
    </svg>
  )
}

export function SheikahEyeIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <polygon points="24,6 42,24 24,42 6,24" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
      <polygon points="24,13 35,24 24,35 13,24" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="3.4" fill="currentColor" />
    </svg>
  )
}

export function CompassStarIcon({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
      <path
        d="M18 3L21.5 14.5L33 18L21.5 21.5L18 33L14.5 21.5L3 18L14.5 14.5L18 3Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="18" r="2.8" fill="currentColor" />
    </svg>
  )
}

export function KorokLeafIcon({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
      <path
        d="M18 4c5.5 2.5 11 8.5 11 16.5 0 5.2-3.7 9.5-11 11.5-7.3-2-11-6.3-11-11.5C7 12.5 12.5 6.5 18 4Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="14.2" cy="18" r="1.7" fill="currentColor" />
      <circle cx="21.8" cy="18" r="1.7" fill="currentColor" />
      <path d="M18 21.5c-1.5 0-2.2 1.2-2.2 2.2s1 1.8 2.2 1.8 2.2-.8 2.2-1.8-.7-2.2-2.2-2.2Z" fill="currentColor" />
      <path d="M18 4V1.5M14 7.5l-2.5-2.5M22 7.5l2.5-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function RuneIcon({ id, size = 28, className = '' }) {
  switch (id) {
    case 'stasis':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="9" y="17" width="22" height="17" rx="3" stroke="currentColor" strokeWidth="2.2" />
          <path d="M14 17v-4a6 6 0 1 1 12 0v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="20" cy="25.5" r="3" stroke="currentColor" strokeWidth="2" />
          <path d="M5 12h4M31 12h4M20 3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'magnesis':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <path d="M11 10v11a9 9 0 0 0 18 0V10" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M8 14h6M26 14h6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M15 5c3-2 7-2 10 0M17.5 8.5c1.5-1 3.5-1 5 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'cryonis':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <polygon points="20,5 30,14 27,31 13,31 10,14" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M20 5v26M10 14h20M6 34c4-2 8-2 12 0s8 2 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'bombs':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <circle cx="20" cy="22" r="11" stroke="currentColor" strokeWidth="2.2" />
          <circle cx="20" cy="22" r="5" stroke="currentColor" strokeWidth="1.7" strokeDasharray="3 3" />
          <path d="M17 11l3-5 3 5M20 2v2M29 10l3-2M11 10L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return <SheikahEyeIcon size={size} className={className} />
  }
}

export function MusicIcon({ off = false, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18V6l11-2v12" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="17.5" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.9" />
      {off && <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  )
}

export function SfxIcon({ off = false, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      {!off ? (
        <>
          <path d="M16.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M19.2 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </>
      ) : (
        <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      )}
    </svg>
  )
}

export function HeartIcon({ size = 16, filled = true, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.7-9.5-9.2C1 7.8 3.3 4.5 6.8 4.5c2 0 3.7 1.1 5.2 2.8 1.5-1.7 3.2-2.8 5.2-2.8 3.5 0 5.8 3.3 4.3 6.8-2 4.5-9.5 9.2-9.5 9.2Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IngredientIcon({ id, color, size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      {id === 'apple' && (
        <>
          <path d="M18 11c-5.5 0-9.5 4.2-9.5 10s4 10 9.5 10 9.5-4.2 9.5-10-4-10-9.5-10Z" fill={color} fillOpacity="0.22" stroke={color} strokeWidth="2" />
          <path d="M18 11c0-3 2-5 4-6M18 10c-2-2-4-2.5-6-1.5" stroke="#5d8a4b" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {id === 'pepper' && (
        <>
          <path d="M23 9c2 6 1 16-9 20-3 1-5-1-3-4 4-4 5-10 6-15 1-2 5-3 6-1Z" fill={color} fillOpacity="0.24" stroke={color} strokeWidth="2" strokeLinejoin="round" />
          <path d="M21 8l2-3" stroke="#5d8a4b" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {id === 'shroom' && (
        <>
          <path d="M7 19c0-6.5 5-11 11-11s11 4.5 11 11H7Z" fill={color} fillOpacity="0.24" stroke={color} strokeWidth="2" strokeLinejoin="round" />
          <path d="M14.5 19v9a3.5 3.5 0 0 0 7 0v-9" stroke={color} strokeWidth="2" />
        </>
      )}
      {id === 'radish' && (
        <>
          <path d="M18 12c-5 0-8.5 3.5-8.5 8.5S15 29 18 31c3-2 8.5-5.5 8.5-10.5S23 12 18 12Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2" />
          <path d="M18 12V6M15 9l-3-3M21 9l3-3" stroke="#5d8a4b" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {id === 'chill' && (
        <>
          <path d="M18 6v24M9 11l18 14M27 11L9 25" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx="18" cy="18" r="3" fill={color} />
        </>
      )}
      {id === 'meat' && (
        <>
          <ellipse cx="18" cy="18" rx="11" ry="8" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2" />
          <circle cx="14" cy="18" r="2.8" fill="#f4f1e8" stroke={color} strokeWidth="1.8" />
        </>
      )}
      {id === 'honey' && (
        <>
          <polygon points="18,6 27,11.5 27,22.5 18,28 9,22.5 9,11.5" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2" />
          <polygon points="18,12 22.5,14.7 22.5,20.3 18,23 13.5,20.3 13.5,14.7" stroke={color} strokeWidth="1.6" />
        </>
      )}
      {id === 'princess' && (
        <>
          <path d="M18 7c3 4 3 8 0 11-3-3-3-7 0-11ZM18 18c4-3 8-3 11 0-3 3-7 3-11 0ZM18 18c-4-3-8-3-11 0 3 3 7 3 11 0ZM18 18c3 4 3 8 0 11-3-3-3-7 0-11Z" fill={color} fillOpacity="0.24" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="18" cy="18" r="2.2" fill="#e6cf98" />
        </>
      )}
      {id === 'bass' && (
        <>
          <path d="M7 18c4-6 12-7 18-1l4-4v10l-4-4c-6 6-14 5-18-1Z" fill={color} fillOpacity="0.24" stroke={color} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="13" cy="16.5" r="1.4" fill={color} />
        </>
      )}
      {id === 'screw' && (
        <>
          <circle cx="18" cy="18" r="9" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2" strokeDasharray="4 2.5" />
          <circle cx="18" cy="18" r="4" stroke={color} strokeWidth="2" />
        </>
      )}
    </svg>
  )
}

export function CompassIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <polygon points="15.5,8.5 13.2,13.2 8.5,15.5 10.8,10.8" fill="currentColor" />
    </svg>
  )
}

export function ArrowIcon({ dir = 'right', size = 16 }) {
  const rot = { right: 0, down: 90, left: 180, up: -90 }[dir] || 0
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      style={{ transform: `rotate(${rot}deg)` }}
      aria-hidden="true"
    >
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PlayIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="7,4 20,12 7,20" />
    </svg>
  )
}

export function ExternalIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M11 4h5v5M16 4l-7 7M14 11v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
