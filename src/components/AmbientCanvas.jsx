import { useEffect, useRef } from 'react'
import { useStore } from '../lib/store'

/**
 * Visibility-gated ambient particle canvas.
 * Pauses automatically off-screen, respects prefers-reduced-motion, and reduces
 * particle density in lite mode.
 */
export default function AmbientCanvas({
  mode = 'pollen',
  className = '',
  density = 1,
}) {
  const canvasRef = useRef(null)
  const motion = useStore((s) => s.motion)
  const lite = useStore((s) => s.lite)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || motion === 'reduced') return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let visible = true
    let w = 0
    let h = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 1.75)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = Math.max(1, rect.width)
      h = Math.max(1, rect.height)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
      },
      { threshold: 0.01 },
    )
    io.observe(canvas)

    const baseCount = Math.round((lite ? 18 : 42) * density)
    const particles = Array.from({ length: baseCount }, () => makeParticle(mode, w, h, true))
    let bolt = null
    let boltCooldown = 90

    const draw = (t) => {
      raf = requestAnimationFrame(draw)
      if (!visible || document.hidden) return

      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx + Math.sin(t * 0.001 * p.freq + p.phase) * p.sway
        p.y += p.vy
        p.rot += p.vrot
        p.life += 1

        // wrap around cleanly
        if (p.y < -30) {
          Object.assign(p, makeParticle(mode, w, h, false, 'bottom'))
        } else if (p.y > h + 30) {
          Object.assign(p, makeParticle(mode, w, h, false, 'top'))
        }
        if (p.x > w + 40) p.x = -30
        if (p.x < -40) p.x = w + 30

        const alpha = p.alpha * (0.65 + 0.35 * Math.sin(t * 0.002 + p.phase))
        ctx.save()
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha))

        if (mode === 'leaves') {
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot)
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.ellipse(0, 0, p.size * 2.2, p.size * 0.85, 0, 0, Math.PI * 2)
          ctx.fill()
        } else if (mode === 'wind') {
          ctx.strokeStyle = p.color
          ctx.lineWidth = p.size * 0.65
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.quadraticCurveTo(p.x - p.len * 0.5, p.y - 6, p.x - p.len, p.y + 2)
          ctx.stroke()
        } else if (mode === 'water') {
          ctx.strokeStyle = p.color
          ctx.lineWidth = 1.1
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.stroke()
          ctx.fillStyle = 'rgba(255,255,255,0.45)'
          ctx.beginPath()
          ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.25, 0, Math.PI * 2)
          ctx.fill()
        } else if (mode === 'sheikah') {
          ctx.translate(p.x, p.y)
          ctx.rotate(Math.PI / 4)
          ctx.strokeStyle = p.color
          ctx.lineWidth = 1.1
          ctx.strokeRect(-p.size, -p.size, p.size * 2, p.size * 2)
        } else {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.4)
          grad.addColorStop(0, p.color)
          grad.addColorStop(1, 'transparent')
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 2.4, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      }

      // Urbosa intermittent subtle desert lightning arc
      if (mode === 'lightning') {
        boltCooldown -= 1
        if (boltCooldown <= 0 && !bolt) {
          bolt = createBolt(w, h)
          boltCooldown = lite ? 240 : 140 + Math.random() * 140
        }
        if (bolt) {
          ctx.save()
          ctx.globalAlpha = bolt.alpha
          ctx.strokeStyle = '#FFF4B8'
          ctx.shadowColor = '#F5D05A'
          ctx.shadowBlur = 18
          ctx.lineWidth = 1.8
          ctx.beginPath()
          bolt.pts.forEach(([x, y], idx) => (idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
          ctx.stroke()
          ctx.restore()
          bolt.alpha -= 0.055
          if (bolt.alpha <= 0) bolt = null
        }
      }
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [mode, motion, lite, density])

  if (motion === 'reduced') return null

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}

function createBolt(w, h) {
  let x = w * (0.2 + Math.random() * 0.6)
  let y = h * 0.04
  const pts = [[x, y]]
  const steps = 8
  for (let i = 0; i < steps; i++) {
    x += (Math.random() - 0.5) * 75
    y += (h * 0.65) / steps
    pts.push([x, y])
  }
  return { pts, alpha: 0.72 }
}

function makeParticle(mode, w, h, randomY, spawnEdge = 'bottom') {
  const x = Math.random() * w
  const y = randomY ? Math.random() * h : spawnEdge === 'bottom' ? h + 12 : -12
  const phase = Math.random() * Math.PI * 2
  const freq = 0.6 + Math.random() * 1.2

  switch (mode) {
    case 'pollen':
      return {
        x, y, phase, freq, rot: 0, vrot: 0, life: 0,
        vx: 0.25 + Math.random() * 0.45,
        vy: -0.15 - Math.random() * 0.25,
        sway: 0.25,
        size: 1.6 + Math.random() * 2.4,
        alpha: 0.3 + Math.random() * 0.5,
        color: Math.random() > 0.35 ? 'rgba(255, 240, 195, 0.9)' : 'rgba(130, 224, 232, 0.85)',
      }
    case 'leaves':
      return {
        x, y, phase, freq, rot: Math.random() * 6, vrot: (Math.random() - 0.5) * 0.04, life: 0,
        vx: 0.6 + Math.random() * 0.9,
        vy: 0.2 + Math.random() * 0.35,
        sway: 0.55,
        size: 2.2 + Math.random() * 2.4,
        alpha: 0.35 + Math.random() * 0.4,
        color: Math.random() > 0.4 ? '#9AC78A' : '#E6CF98',
      }
    case 'light':
      return {
        x, y, phase, freq, rot: 0, vrot: 0, life: 0,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.35 - Math.random() * 0.5,
        sway: 0.2,
        size: 1.8 + Math.random() * 3.2,
        alpha: 0.35 + Math.random() * 0.5,
        color: Math.random() > 0.3 ? 'rgba(255, 236, 168, 0.95)' : 'rgba(255, 255, 255, 0.9)',
      }
    case 'water':
      return {
        x, y, phase, freq, rot: 0, vrot: 0, life: 0,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -0.45 - Math.random() * 0.65,
        sway: 0.4,
        size: 2 + Math.random() * 4.5,
        alpha: 0.25 + Math.random() * 0.45,
        color: Math.random() > 0.25 ? 'rgba(116, 226, 246, 0.85)' : 'rgba(255, 255, 255, 0.7)',
      }
    case 'wind':
      return {
        x, y, phase, freq, rot: 0, vrot: 0, life: 0,
        vx: 2.2 + Math.random() * 2.8,
        vy: -0.4 - Math.random() * 0.5,
        sway: 0.3,
        len: 26 + Math.random() * 44,
        size: 1.4 + Math.random() * 1.6,
        alpha: 0.2 + Math.random() * 0.35,
        color: Math.random() > 0.4 ? 'rgba(185, 240, 217, 0.75)' : 'rgba(140, 196, 255, 0.7)',
      }
    case 'embers':
      return {
        x, y, phase, freq, rot: 0, vrot: 0, life: 0,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.8 - Math.random() * 1.4,
        sway: 0.6,
        size: 1.8 + Math.random() * 2.8,
        alpha: 0.45 + Math.random() * 0.5,
        color: Math.random() > 0.4 ? 'rgba(255, 134, 58, 0.95)' : 'rgba(255, 216, 120, 0.9)',
      }
    case 'lightning':
      return {
        x, y, phase, freq, rot: 0, vrot: 0, life: 0,
        vx: 1.1 + Math.random() * 1.4,
        vy: -0.15 + Math.random() * 0.3,
        sway: 0.25,
        size: 1.3 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.4,
        color: Math.random() > 0.3 ? 'rgba(245, 208, 90, 0.85)' : 'rgba(222, 179, 108, 0.75)',
      }
    case 'malice':
      return {
        x, y, phase, freq, rot: 0, vrot: 0, life: 0,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.55 - Math.random() * 0.95,
        sway: 0.85,
        size: 2.2 + Math.random() * 3.8,
        alpha: 0.4 + Math.random() * 0.5,
        color: Math.random() > 0.35 ? 'rgba(224, 40, 84, 0.95)' : 'rgba(130, 18, 66, 0.85)',
      }
    case 'sheikah':
    default:
      return {
        x, y, phase, freq, rot: 0, vrot: 0, life: 0,
        vx: 0,
        vy: -0.25 - Math.random() * 0.35,
        sway: 0.15,
        size: 2.2 + Math.random() * 2.8,
        alpha: 0.2 + Math.random() * 0.35,
        color: Math.random() > 0.25 ? 'rgba(73, 197, 206, 0.7)' : 'rgba(200, 169, 107, 0.65)',
      }
  }
}
