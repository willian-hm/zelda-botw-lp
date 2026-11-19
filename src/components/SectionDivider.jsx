import './SectionDivider.css'

/**
 * Contextual atmospheric bridges between contrasting worlds
 * (dark/nature/parchment/Sheikah tech/shadow).
 */
export default function SectionDivider({ variant = 'to-light' }) {
  if (variant === 'sheikah') {
    return (
      <div className="divider divider--sheikah" aria-hidden="true">
        <span className="divider__line" />
        <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
          <polygon points="14,2 26,14 14,26 2,14" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="14" cy="14" r="3.5" fill="currentColor" />
        </svg>
        <span className="divider__line" />
      </div>
    )
  }

  return (
    <div className={`divider divider--${variant}`} aria-hidden="true">
      <svg viewBox="0 0 1440 96" preserveAspectRatio="none">
        <path
          d="M0,70 C240,22 460,84 720,44 C980,4 1210,68 1440,28 L1440,96 L0,96 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}
