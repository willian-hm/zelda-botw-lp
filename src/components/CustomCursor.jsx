import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import './CustomCursor.css'

/**
 * Minimal Sheikah reticle cursor — active ONLY on fine-pointer hover devices
 * and disabled under reduced-motion preference. Never interferes with native
 * hit-testing or inputs.
 */
export default function CustomCursor() {
  const motion = useStore((s) => s.motion)
  const [enabled, setEnabled] = useState(false)
  const [label, setLabel] = useState('')
  const [state, setState] = useState('idle') // idle | hover | down | hidden
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setEnabled(mq.matches && window.innerWidth >= 1024 && motion !== 'reduced')
    sync()
    mq.addEventListener?.('change', sync)
    window.addEventListener('resize', sync)
    return () => {
      mq.removeEventListener?.('change', sync)
      window.removeEventListener('resize', sync)
    }
  }, [motion])

  useEffect(() => {
    if (!enabled) return
    let mx = -100
    let my = -100
    let rx = -100
    let ry = -100
    let raf = 0

    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
      const target = e.target
      if (!target || target.tagName === 'IFRAME') {
        setState('hidden')
        return
      }
      const interactive = target.closest?.('a, button, [role="tab"], [role="button"], input, select, summary, canvas')
      if (interactive) {
        setLabel('')
        setState('hover')
      } else {
        setLabel('')
        setState('idle')
      }
    }

    const onDown = () => setState((prev) => (prev === 'hidden' ? prev : 'down'))
    const onUp = () => setState((prev) => (prev === 'down' ? 'hover' : prev))
    const onLeave = () => setState('hidden')

    const loop = () => {
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div
        ref={ringRef}
        className={`hyrule-cursor-ring is-${state} ${label ? 'has-label' : ''}`}
        aria-hidden="true"
      >
        {label && <span className="hyrule-cursor-label">{label}</span>}
      </div>
      <div ref={dotRef} className={`hyrule-cursor-dot is-${state}`} aria-hidden="true" />
    </>
  )
}
