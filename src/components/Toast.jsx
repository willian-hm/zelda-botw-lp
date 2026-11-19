import { setState, useStore } from '../lib/store'
import { KorokLeafIcon, SheikahEyeIcon } from './Icons'
import './Toast.css'

export default function Toast() {
  const item = useStore((s) => s.toast)
  if (!item) return null

  return (
    <div
      key={item.id}
      role="status"
      aria-live="polite"
      className={`hyrule-toast hyrule-toast--${item.tone || 'sheikah'}`}
    >
      <span className="hyrule-toast__icon" aria-hidden="true">
        {item.tone === 'gold' ? <KorokLeafIcon size={20} /> : <SheikahEyeIcon size={20} />}
      </span>
      <div className="hyrule-toast__body">
        {item.title && <strong className="hyrule-toast__title">{item.title}</strong>}
        <p>{item.message}</p>
      </div>
      <button
        type="button"
        className="hyrule-toast__close"
        aria-label="Fechar aviso"
        onClick={() => setState({ toast: null })}
      >
        ×
      </button>
    </div>
  )
}
