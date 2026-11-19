import { useState } from 'react'
import { KOROKS } from '../data/koroks'
import { setState, toast, useStore } from '../lib/store'
import { audio } from '../lib/audio'
import { KorokLeafIcon } from './Icons'
import './KorokSecret.css'

/**
 * Interactive hidden Korok spot placed tastefully across sections.
 * Accessible via click, touch and keyboard focus.
 */
export default function KorokSecret({ id, className = '', tone = 'dark' }) {
  const koroks = useStore((s) => s.koroks)
  const [burst, setBurst] = useState(false)
  const found = koroks.includes(id)
  const meta = KOROKS.find((k) => k.id === id) || KOROKS[0]

  const discover = () => {
    if (found) {
      audio.playSfx('korok')
      toast(`Korok já descoberto (${koroks.length}/${KOROKS.length}) — ${meta.location}`, {
        tone: 'gold',
        title: 'Yahaha!',
      })
      return
    }
    const next = [...koroks, id]
    setState({ koroks: next })
    audio.playSfx('korok')
    setBurst(true)
    setTimeout(() => setBurst(false), 1100)

    if (next.length === KOROKS.length) {
      toast('Todos os 7 Koroks de Hyrule foram encontrados! A Grande Árvore Deku celebra sua jornada.', {
        tone: 'gold',
        title: 'Semente Dourada Desbloqueada!',
        duration: 5200,
      })
    } else {
      toast(`${meta.line} (${next.length}/${KOROKS.length})`, {
        tone: 'gold',
        title: 'Korok Encontrado!',
        duration: 3800,
      })
    }
  }

  return (
    <button
      type="button"
      onClick={discover}
      data-cursor="SEGREDO"
      className={`korok-spot korok-spot--${tone} ${found ? 'is-found' : ''} ${burst ? 'is-burst' : ''} ${className}`}
      aria-label={found ? `Korok encontrado em ${meta.location}` : 'Investigar brilho misterioso na folhagem'}
      title={found ? `Korok encontrado (${meta.location})` : 'Algo brilha suavemente aqui...'}
    >
      <span className="korok-spot__ring" aria-hidden="true" />
      <span className="korok-spot__icon" aria-hidden="true">
        {found ? (
          <KorokLeafIcon size={20} />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3l2.2 6.2L20 12l-5.8 2.8L12 21l-2.2-6.2L4 12l5.8-2.8L12 3Z"
              fill="currentColor"
              fillOpacity="0.85"
            />
          </svg>
        )}
      </span>
      {burst && <span className="korok-spot__yahaha" aria-hidden="true">Yahaha!</span>}
    </button>
  )
}
