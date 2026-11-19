import { useEffect, useRef, useState } from 'react'
import { audio } from '../lib/audio'
import { useStore } from '../lib/store'

/**
 * Real interactive HTML5 Canvas simulations for the 4 core Sheikah Runes:
 * - stasis: freeze moving boulder -> strike to store kinetic energy -> launch!
 * - magnesis: drag (mouse/touch) or arrow-key move metal crate onto shrine switch!
 * - cryonis: click/tap water (or arrows+Space) to erupt up to 3 ice pillars lifting a chest!
 * - bombs: choose Sphere (rolls) or Cube (fixed), spawn near cracked blocks, detonate!
 */
export default function RuneCanvas({ runeId }) {
  const canvasRef = useRef(null)
  const motion = useStore((s) => s.motion)

  // Reactive HUD states mirrored out to accessible controls below the canvas
  const [stasisState, setStasisState] = useState({ frozen: false, hits: 0 })
  const [magSolved, setMagSolved] = useState(false)
  const [cryoCount, setCryoCount] = useState(0)
  const [bombShape, setBombShape] = useState('sphere')
  const [bombActive, setBombActive] = useState(false)
  const [blocksLeft, setBlocksLeft] = useState(3)

  // Command bridge ref so UI buttons & keyboard can invoke canvas actions cleanly
  const actionsRef = useRef({})

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 720
    const H = 400
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let raf = 0
    let last = performance.now()
    let particles = []

    const spawnSparks = (x, y, color, count = 14, speed = 160) => {
      if (motion === 'reduced') return
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2
        const v = (0.35 + Math.random() * 0.65) * speed
        particles.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          life: 0.45 + Math.random() * 0.35,
          maxLife: 0.8,
          r: 2 + Math.random() * 2.5,
          color,
        })
      }
    }

    const drawGrid = (accent = 'rgba(73, 197, 206, 0.08)') => {
      ctx.fillStyle = '#081215'
      ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = accent
      ctx.lineWidth = 1
      for (let x = 0; x <= W; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
      }
      for (let y = 0; y <= H; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }
    }

    const toCanvasCoords = (e) => {
      const rect = canvas.getBoundingClientRect()
      return {
        x: ((e.clientX - rect.left) / rect.width) * W,
        y: ((e.clientY - rect.top) / rect.height) * H,
      }
    }

    // =========================================================================
    // 1. STASIS SIMULATION
    // =========================================================================
    if (runeId === 'stasis') {
      const orb = {
        x: 200,
        y: 225,
        r: 34,
        vx: 155,
        vy: 0,
        frozen: false,
        timer: 0,
        maxTimer: 4.5,
        hits: 0,
        angle: -0.25,
        trail: [],
      }
      setStasisState({ frozen: false, hits: 0 })

      const freezeOrStrike = (clickPt) => {
        if (!orb.frozen) {
          orb.frozen = true
          orb.timer = orb.maxTimer
          orb.hits = 0
          orb.angle = orb.vx >= 0 ? -0.22 : Math.PI + 0.22
          audio.playSfx('stasis-lock')
          spawnSparks(orb.x, orb.y, '#F0C84B', 18, 130)
          setStasisState({ frozen: true, hits: 0 })
        } else {
          if (orb.hits < 6) orb.hits += 1
          if (clickPt) {
            // Aim away from the strike point (true to BotW!)
            const dx = orb.x - clickPt.x
            const dy = orb.y - clickPt.y
            if (Math.hypot(dx, dy) > 8) {
              orb.angle = Math.atan2(dy, dx)
            }
          } else {
            orb.angle = -0.28 + (Math.random() - 0.5) * 0.25
          }
          audio.playSfx('stasis-hit')
          const col = orb.hits >= 5 ? '#FF4B4B' : orb.hits >= 3 ? '#FF9A3C' : '#F0C84B'
          spawnSparks(orb.x, orb.y, col, 14, 170)
          setStasisState({ frozen: true, hits: orb.hits })
        }
      }

      const releaseStasis = () => {
        if (!orb.frozen) return
        orb.frozen = false
        if (orb.hits > 0) {
          const power = 210 + orb.hits * 115
          orb.vx = Math.cos(orb.angle) * power
          orb.vy = Math.sin(orb.angle) * power
          audio.playSfx('stasis-launch')
          spawnSparks(orb.x, orb.y, '#FF7A2F', 26, 240)
        } else if (Math.abs(orb.vx) < 90) {
          orb.vx = 155
        }
        orb.hits = 0
        setStasisState({ frozen: false, hits: 0 })
      }

      actionsRef.current = {
        primary: () => freezeOrStrike(null),
        secondary: releaseStasis,
      }

      const onPointerDown = (e) => {
        const pt = toCanvasCoords(e)
        freezeOrStrike(pt)
      }

      const onKey = (e) => {
        if (e.code === 'Space') {
          e.preventDefault()
          if (!orb.frozen) freezeOrStrike(null)
          else releaseStasis()
        } else if (e.key === 'Enter' && orb.frozen) {
          e.preventDefault()
          freezeOrStrike(null)
        }
      }

      canvas.addEventListener('pointerdown', onPointerDown)
      canvas.addEventListener('keydown', onKey)

      const loop = (now) => {
        raf = requestAnimationFrame(loop)
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now

        drawGrid('rgba(240, 200, 75, 0.06)')

        // Floor & track
        ctx.fillStyle = '#122024'
        ctx.fillRect(0, 316, W, H - 316)
        ctx.strokeStyle = 'rgba(240, 200, 75, 0.3)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(40, 316)
        ctx.lineTo(W - 40, 316)
        ctx.stroke()

        // Physics update
        if (orb.frozen) {
          orb.timer -= dt
          if (orb.timer <= 0) releaseStasis()
        } else {
          orb.vy += 520 * dt
          orb.x += orb.vx * dt
          orb.y += orb.vy * dt
          if (orb.y + orb.r > 316) {
            orb.y = 316 - orb.r
            orb.vy = -orb.vy * 0.58
            orb.vx *= 0.992
            if (Math.abs(orb.vx) < 120) orb.vx = Math.sign(orb.vx || 1) * 145
          }
          if (orb.x - orb.r < 36) {
            orb.x = 36 + orb.r
            orb.vx = Math.abs(orb.vx) * 0.88
            spawnSparks(orb.x - orb.r, orb.y, '#49C5CE', 8, 90)
          }
          if (orb.x + orb.r > W - 36) {
            orb.x = W - 36 - orb.r
            orb.vx = -Math.abs(orb.vx) * 0.88
            spawnSparks(orb.x + orb.r, orb.y, '#49C5CE', 8, 90)
          }
          if (orb.y - orb.r < 32) {
            orb.y = 32 + orb.r
            orb.vy = Math.abs(orb.vy) * 0.75
          }
          orb.trail.push({ x: orb.x, y: orb.y })
          if (orb.trail.length > 14) orb.trail.shift()
        }

        // Motion trail
        for (let i = 0; i < orb.trail.length; i++) {
          const t = orb.trail[i]
          ctx.fillStyle = `rgba(240, 200, 75, ${(i / orb.trail.length) * 0.2})`
          ctx.beginPath()
          ctx.arc(t.x, t.y, orb.r * (0.4 + (i / orb.trail.length) * 0.5), 0, Math.PI * 2)
          ctx.fill()
        }

        // Kinetic vector arrow when frozen & struck
        if (orb.frozen && orb.hits > 0) {
          const arrowLen = 48 + orb.hits * 22
          const col = orb.hits >= 5 ? '#FF4B4B' : orb.hits >= 3 ? '#FF9A3C' : '#F0C84B'
          const ex = orb.x + Math.cos(orb.angle) * arrowLen
          const ey = orb.y + Math.sin(orb.angle) * arrowLen
          ctx.save()
          ctx.strokeStyle = col
          ctx.fillStyle = col
          ctx.shadowColor = col
          ctx.shadowBlur = 16
          ctx.lineWidth = 5
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(orb.x, orb.y)
          ctx.lineTo(ex, ey)
          ctx.stroke()
          // Arrowhead
          ctx.translate(ex, ey)
          ctx.rotate(orb.angle)
          ctx.beginPath()
          ctx.moveTo(12, 0)
          ctx.lineTo(-8, -9)
          ctx.lineTo(-8, 9)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
        }

        // Draw orb
        ctx.save()
        const fillCol = orb.frozen
          ? orb.hits >= 5
            ? '#FF4B4B'
            : orb.hits >= 3
              ? '#FF9A3C'
              : '#F0C84B'
          : '#385760'
        const grad = ctx.createRadialGradient(orb.x - 10, orb.y - 10, 4, orb.x, orb.y, orb.r)
        grad.addColorStop(0, orb.frozen ? '#FFF6C9' : '#6F98A3')
        grad.addColorStop(1, fillCol)
        ctx.fillStyle = grad
        ctx.shadowColor = orb.frozen ? fillCol : 'rgba(73,197,206,0.35)'
        ctx.shadowBlur = orb.frozen ? 28 : 12
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2)
        ctx.fill()

        // Ancient Sheikah concentric glyph inside orb
        ctx.strokeStyle = orb.frozen ? 'rgba(20, 14, 4, 0.5)' : 'rgba(73, 197, 206, 0.7)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.r * 0.56, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()

        // Stasis countdown chains & ring
        if (orb.frozen) {
          const ratio = Math.max(0, orb.timer / orb.maxTimer)
          ctx.save()
          ctx.strokeStyle = '#F0C84B'
          ctx.lineWidth = 3.5
          ctx.beginPath()
          ctx.arc(orb.x, orb.y, orb.r + 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio)
          ctx.stroke()

          // Energy chains anchoring to floor
          ctx.strokeStyle = 'rgba(240, 200, 75, 0.55)'
          ctx.setLineDash([6, 5])
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(orb.x - 24, orb.y + 18)
          ctx.lineTo(orb.x - 54, 316)
          ctx.moveTo(orb.x + 24, orb.y + 18)
          ctx.lineTo(orb.x + 54, 316)
          ctx.stroke()
          ctx.restore()
        }

        // Subtle HUD hint inside chamber
        ctx.save()
        ctx.fillStyle = 'rgba(233, 228, 213, 0.62)'
        ctx.font = '600 12px Manrope, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(
          orb.frozen
            ? 'CONGELADO · Clique na esfera ou pressione Enter para acumular força'
            : 'Clique na arena ou pressione Espaço para congelar a esfera no tempo',
          22,
          28,
        )
        ctx.restore()

        drawParticles(ctx, particles, dt)
        particles = particles.filter((p) => p.life > 0)
      }

      raf = requestAnimationFrame(loop)
      return () => {
        cancelAnimationFrame(raf)
        canvas.removeEventListener('pointerdown', onPointerDown)
        canvas.removeEventListener('keydown', onKey)
      }
    }

    // =========================================================================
    // 2. MAGNESIS SIMULATION
    // =========================================================================
    if (runeId === 'magnesis') {
      const crate = { x: 145, y: 245, size: 64, vx: 0, vy: 0, grabbed: false }
      const target = { x: 565, y: 286, w: 96, h: 16 }
      const pointer = { x: crate.x, y: crate.y }
      let solved = false
      setMagSolved(false)

      const reset = () => {
        crate.x = 145
        crate.y = 245
        crate.vx = 0
        crate.vy = 0
        crate.grabbed = false
        solved = false
        setMagSolved(false)
        audio.playSfx('select')
      }

      actionsRef.current = { reset }

      const onDown = (e) => {
        const pt = toCanvasCoords(e)
        if (Math.hypot(pt.x - crate.x, pt.y - crate.y) < 76) {
          crate.grabbed = true
          pointer.x = pt.x
          pointer.y = pt.y
          canvas.setPointerCapture?.(e.pointerId)
          audio.playSfx('magnesis')
        }
      }

      const onMove = (e) => {
        if (!crate.grabbed) return
        const pt = toCanvasCoords(e)
        pointer.x = Math.max(54, Math.min(W - 54, pt.x))
        pointer.y = Math.max(54, Math.min(266, pt.y))
      }

      const onUp = () => {
        crate.grabbed = false
      }

      const onKey = (e) => {
        const step = 28
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
          e.preventDefault()
          crate.grabbed = true
          if (e.key === 'ArrowLeft') pointer.x = Math.max(54, crate.x - step)
          if (e.key === 'ArrowRight') pointer.x = Math.min(W - 54, crate.x + step)
          if (e.key === 'ArrowUp') pointer.y = Math.max(54, crate.y - step)
          if (e.key === 'ArrowDown') pointer.y = Math.min(266, crate.y + step)
          audio.playSfx('magnesis')
        } else if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault()
          crate.grabbed = false
        }
      }

      canvas.addEventListener('pointerdown', onDown)
      canvas.addEventListener('pointermove', onMove)
      canvas.addEventListener('pointerup', onUp)
      canvas.addEventListener('pointercancel', onUp)
      canvas.addEventListener('keydown', onKey)

      const loop = (now) => {
        raf = requestAnimationFrame(loop)
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now

        drawGrid('rgba(224, 77, 107, 0.06)')

        // Left & right ledges with central chasm
        ctx.fillStyle = '#122024'
        ctx.fillRect(0, 302, 260, H - 302)
        ctx.fillRect(455, 302, W - 455, H - 302)
        // Chasm mist
        const mist = ctx.createLinearGradient(0, 302, 0, H)
        mist.addColorStop(0, 'rgba(10, 22, 26, 0.2)')
        mist.addColorStop(1, 'rgba(73, 197, 206, 0.14)')
        ctx.fillStyle = mist
        ctx.fillRect(260, 302, 195, H - 302)

        // Pressure pedestal on right ledge
        ctx.save()
        ctx.fillStyle = solved ? '#49C5CE' : '#1E3C42'
        ctx.shadowColor = solved ? '#49C5CE' : 'transparent'
        ctx.shadowBlur = solved ? 22 : 0
        ctx.fillRect(target.x - target.w / 2, target.y, target.w, target.h)
        ctx.strokeStyle = '#49C5CE'
        ctx.lineWidth = 2
        ctx.strokeRect(target.x - target.w / 2, target.y, target.w, target.h)
        ctx.fillStyle = solved ? '#49C5CE' : 'rgba(233, 228, 213, 0.65)'
        ctx.font = '700 11px Manrope, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(solved ? 'SELO ATIVADO' : 'PEDESTAL SHEIKAH', target.x, target.y + 38)
        ctx.restore()

        // Physics
        if (crate.grabbed) {
          crate.vx = (pointer.x - crate.x) * 10
          crate.vy = (pointer.y - crate.y) * 10
          crate.x += crate.vx * dt
          crate.y += crate.vy * dt
        } else {
          crate.vy += 680 * dt
          crate.vx *= 0.92
          crate.x += crate.vx * dt
          crate.y += crate.vy * dt
          // Floor check (left ledge or right ledge)
          const overLeft = crate.x < 268
          const overRight = crate.x > 448
          const floorY = overRight && Math.abs(crate.x - target.x) < 62 ? target.y : 302
          if ((overLeft || overRight) && crate.y + crate.size / 2 > floorY) {
            crate.y = floorY - crate.size / 2
            crate.vy = 0
          }
          // If dropped into chasm, respawn gracefully on left ledge
          if (crate.y > H + 60) {
            crate.x = 145
            crate.y = 120
            crate.vx = 0
            crate.vy = 0
          }
        }

        // Check activation
        const onPedestal = Math.abs(crate.x - target.x) < 42 && Math.abs(crate.y + crate.size / 2 - target.y) < 16
        if (onPedestal && !solved) {
          solved = true
          setMagSolved(true)
          audio.playSfx('sheikah')
          spawnSparks(target.x, target.y, '#49C5CE', 26, 200)
        }

        // Magnetic beam when grabbed
        if (crate.grabbed) {
          const ex = 80
          const ey = 290
          ctx.save()
          ctx.strokeStyle = 'rgba(224, 77, 107, 0.78)'
          ctx.shadowColor = '#E04D6B'
          ctx.shadowBlur = 18
          ctx.lineWidth = 3.5
          ctx.beginPath()
          ctx.moveTo(ex, ey)
          ctx.quadraticCurveTo((ex + crate.x) / 2, Math.min(ey, crate.y) - 42, crate.x, crate.y)
          ctx.stroke()

          // Pulsing field rings around crate
          const pulse = (Math.sin(now * 0.008) + 1) * 0.5
          ctx.strokeStyle = `rgba(224, 77, 107, ${0.35 + pulse * 0.35})`
          ctx.lineWidth = 1.8
          ctx.beginPath()
          ctx.arc(crate.x, crate.y, crate.size * 0.78 + pulse * 8, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()
        }

        // Draw metallic Sheikah cube
        ctx.save()
        const half = crate.size / 2
        ctx.fillStyle = crate.grabbed ? '#592030' : '#26363D'
        ctx.strokeStyle = crate.grabbed ? '#FF6B8A' : solved ? '#49C5CE' : '#C8A96B'
        ctx.shadowColor = crate.grabbed ? '#E04D6B' : solved ? '#49C5CE' : 'transparent'
        ctx.shadowBlur = crate.grabbed || solved ? 22 : 0
        ctx.lineWidth = 2.5
        ctx.fillRect(crate.x - half, crate.y - half, crate.size, crate.size)
        ctx.strokeRect(crate.x - half, crate.y - half, crate.size, crate.size)
        // Cross ribs
        ctx.strokeStyle = crate.grabbed ? 'rgba(255,150,175,0.65)' : 'rgba(200,169,107,0.45)'
        ctx.lineWidth = 1.5
        ctx.strokeRect(crate.x - half + 10, crate.y - half + 10, crate.size - 20, crate.size - 20)
        ctx.restore()

        // Magnesis HUD hint
        ctx.save()
        ctx.fillStyle = solved ? '#49C5CE' : 'rgba(233, 228, 213, 0.64)'
        ctx.font = '600 12px Manrope, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(
          solved
            ? 'Selo Sheikah ativado! Clique em Reiniciar Câmara para testar novamente'
            : 'Arraste o bloco metálico (ou use as setas) sobre o abismo até o pedestal azul',
          22,
          28,
        )
        ctx.restore()

        drawParticles(ctx, particles, dt)
        particles = particles.filter((p) => p.life > 0)
      }

      raf = requestAnimationFrame(loop)
      return () => {
        cancelAnimationFrame(raf)
        canvas.removeEventListener('pointerdown', onDown)
        canvas.removeEventListener('pointermove', onMove)
        canvas.removeEventListener('pointerup', onUp)
        canvas.removeEventListener('pointercancel', onUp)
        canvas.removeEventListener('keydown', onKey)
      }
    }

    // =========================================================================
    // 3. CRYONIS SIMULATION
    // =========================================================================
    if (runeId === 'cryonis') {
      const waterY = 278
      const pillars = [] // { x, w, h, targetH }
      const chest = { x: 470, y: waterY - 12, w: 54, h: 36 }
      let aimX = 240
      setCryoCount(0)

      const togglePillarAt = (x) => {
        const clampedX = Math.max(70, Math.min(W - 70, x))
        // If clicking an existing pillar -> shatter it
        const existingIdx = pillars.findIndex((p) => Math.abs(p.x - clampedX) < p.w * 0.6)
        if (existingIdx !== -1) {
          const removed = pillars.splice(existingIdx, 1)[0]
          audio.playSfx('shatter')
          spawnSparks(removed.x, waterY - removed.h * 0.5, '#A9ECFF', 20, 170)
          setCryoCount(pillars.length)
          return
        }
        // Max 3 pillars (oldest shatters, faithful to BotW!)
        if (pillars.length >= 3) {
          const old = pillars.shift()
          spawnSparks(old.x, waterY - old.h * 0.5, '#A9ECFF', 16, 140)
        }
        pillars.push({ x: clampedX, w: 72, h: 4, targetH: 112 })
        audio.playSfx('cryonis')
        spawnSparks(clampedX, waterY, '#9FE3FF', 16, 130)
        setCryoCount(pillars.length)
      }

      const clearAll = () => {
        pillars.forEach((p) => spawnSparks(p.x, waterY - p.h * 0.5, '#A9ECFF', 12, 130))
        pillars.length = 0
        audio.playSfx('shatter')
        setCryoCount(0)
      }

      actionsRef.current = {
        primary: () => {
          // If the cursor is already sitting on an existing pillar, pick the next clear water spot
          // (including right under the floating chest!) so button presses reliably build up to 3 pillars.
          let targetX = aimX
          if (pillars.some((p) => Math.abs(p.x - targetX) < p.w * 0.6)) {
            const presets = [170, 320, chest.x, 580]
            targetX = presets.find((px) => !pillars.some((p) => Math.abs(p.x - px) < p.w * 0.6)) ?? chest.x
            aimX = targetX
          }
          togglePillarAt(targetX)
        },
        reset: clearAll,
      }

      const onDown = (e) => {
        const pt = toCanvasCoords(e)
        aimX = pt.x
        togglePillarAt(pt.x)
      }

      const onMove = (e) => {
        aimX = toCanvasCoords(e).x
      }

      const onKey = (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          aimX = Math.max(70, aimX - 42)
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          aimX = Math.min(W - 70, aimX + 42)
        } else if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault()
          togglePillarAt(aimX)
        }
      }

      canvas.addEventListener('pointerdown', onDown)
      canvas.addEventListener('pointermove', onMove)
      canvas.addEventListener('keydown', onKey)

      const loop = (now) => {
        raf = requestAnimationFrame(loop)
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now

        drawGrid('rgba(124, 228, 255, 0.06)')

        // Aiming reticle on water
        ctx.save()
        ctx.strokeStyle = 'rgba(124, 228, 255, 0.65)'
        ctx.setLineDash([5, 5])
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.ellipse(aimX, waterY, 34, 8, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()

        // Animate pillars rising
        let chestTargetY = waterY - 12 + Math.sin(now * 0.003) * 4
        pillars.forEach((p) => {
          p.h += (p.targetH - p.h) * Math.min(1, dt * 11)
          if (Math.abs(p.x - chest.x) < p.w * 0.65) {
            chestTargetY = waterY - p.h - chest.h * 0.5
          }
          // Faceted ice pillar
          ctx.save()
          const grad = ctx.createLinearGradient(p.x - p.w / 2, waterY - p.h, p.x + p.w / 2, waterY)
          grad.addColorStop(0, '#D4F7FF')
          grad.addColorStop(0.45, '#7CE4FF')
          grad.addColorStop(1, '#2D8FB0')
          ctx.fillStyle = grad
          ctx.shadowColor = 'rgba(124, 228, 255, 0.45)'
          ctx.shadowBlur = 16
          ctx.fillRect(p.x - p.w / 2, waterY - p.h, p.w, p.h + 14)
          ctx.strokeStyle = '#E8FAFF'
          ctx.lineWidth = 2
          ctx.strokeRect(p.x - p.w / 2, waterY - p.h, p.w, p.h + 14)
          // Inner crystal facets
          ctx.strokeStyle = 'rgba(255,255,255,0.45)'
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.moveTo(p.x, waterY - p.h)
          ctx.lineTo(p.x - 16, waterY - p.h * 0.45)
          ctx.lineTo(p.x + 12, waterY)
          ctx.stroke()
          ctx.restore()
        })

        // Floating / lifted wooden ancient chest
        chest.y += (chestTargetY - chest.y) * Math.min(1, dt * 8)
        ctx.save()
        ctx.fillStyle = '#6B4A2D'
        ctx.strokeStyle = '#E6CF98'
        ctx.lineWidth = 2.2
        ctx.fillRect(chest.x - chest.w / 2, chest.y - chest.h / 2, chest.w, chest.h)
        ctx.strokeRect(chest.x - chest.w / 2, chest.y - chest.h / 2, chest.w, chest.h)
        ctx.fillStyle = '#E6CF98'
        ctx.fillRect(chest.x - 6, chest.y - 4, 12, 10)
        ctx.restore()

        // Water basin foreground
        ctx.save()
        const waterGrad = ctx.createLinearGradient(0, waterY, 0, H)
        waterGrad.addColorStop(0, 'rgba(42, 148, 179, 0.72)')
        waterGrad.addColorStop(1, 'rgba(12, 46, 61, 0.94)')
        ctx.fillStyle = waterGrad
        ctx.beginPath()
        ctx.moveTo(0, H)
        for (let x = 0; x <= W; x += 24) {
          const wy = waterY + Math.sin(x * 0.025 + now * 0.0035) * 3.5
          ctx.lineTo(x, wy)
        }
        ctx.lineTo(W, H)
        ctx.closePath()
        ctx.fill()

        ctx.strokeStyle = 'rgba(195, 245, 255, 0.7)'
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let x = 0; x <= W; x += 24) {
          const wy = waterY + Math.sin(x * 0.025 + now * 0.0035) * 3.5
          if (x === 0) ctx.moveTo(x, wy)
          else ctx.lineTo(x, wy)
        }
        ctx.stroke()
        ctx.restore()

        // Cryonis HUD hint
        ctx.save()
        ctx.fillStyle = 'rgba(233, 228, 213, 0.66)'
        ctx.font = '600 12px Manrope, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(
          pillars.length === 0
            ? 'Clique na água (ou sob o baú flutuante) para erguer pilares de gelo'
            : `Pilares ativos: ${pillars.length}/3 · Clique em um pilar para estilhaçá-lo`,
          22,
          28,
        )
        ctx.restore()

        drawParticles(ctx, particles, dt)
        particles = particles.filter((p) => p.life > 0)
      }

      raf = requestAnimationFrame(loop)
      return () => {
        cancelAnimationFrame(raf)
        canvas.removeEventListener('pointerdown', onDown)
        canvas.removeEventListener('pointermove', onMove)
        canvas.removeEventListener('keydown', onKey)
      }
    }

    // =========================================================================
    // 4. REMOTE BOMBS SIMULATION
    // =========================================================================
    let shape = bombShape
    let bomb = null // { x, y, vx, vy, shape }
    let shockwaves = []
    let shake = 0
    const makeBlocks = () => [
      { x: 520, y: 294, w: 46, h: 46, alive: true },
      { x: 572, y: 294, w: 46, h: 46, alive: true },
      { x: 546, y: 244, w: 46, h: 46, alive: true },
    ]
    let blocks = makeBlocks()
    setBombActive(false)
    setBlocksLeft(3)

    const floorHeightAt = (x) => {
      // Gentle slope on left (rolls Sphere bomb toward cracked blocks!)
      if (x < 340) return 225 + (x / 340) * 115
      return 340
    }

    const spawnBomb = (x = 180, y = 160) => {
      bomb = {
        x: Math.max(46, Math.min(W - 46, x)),
        y: Math.max(46, Math.min(floorHeightAt(x) - 24, y)),
        vx: shape === 'sphere' ? 50 : 0,
        vy: 0,
        shape,
      }
      setBombActive(true)
      audio.playSfx('sheikah')
      spawnSparks(bomb.x, bomb.y, '#49C5CE', 12, 100)
    }

    const detonate = () => {
      if (!bomb) return
      const bx = bomb.x
      const by = bomb.y
      bomb = null
      setBombActive(false)
      audio.playSfx('bomb')
      shockwaves.push({ x: bx, y: by, r: 10, maxR: 175, alpha: 0.95 })
      spawnSparks(bx, by, '#7BF0FA', 32, 260)
      spawnSparks(bx, by, '#FFFFFF', 14, 180)
      if (motion !== 'reduced') shake = 10

      blocks.forEach((b) => {
        if (!b.alive) return
        const d = Math.hypot(b.x + b.w / 2 - bx, b.y + b.h / 2 - by)
        if (d < 170) {
          b.alive = false
          spawnSparks(b.x + b.w / 2, b.y + b.h / 2, '#C8A96B', 18, 210)
        }
      })
      setBlocksLeft(blocks.filter((b) => b.alive).length)
    }

    const rebuild = () => {
      blocks = makeBlocks()
      setBlocksLeft(3)
      audio.playSfx('select')
    }

    actionsRef.current = {
      setShape: (s) => {
        shape = s
        setBombShape(s)
      },
      spawn: () => spawnBomb(170, 150),
      detonate,
      reset: rebuild,
    }

    const onDown = (e) => {
      const pt = toCanvasCoords(e)
      spawnBomb(pt.x, pt.y)
    }

    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        spawnBomb(170, 150)
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'Enter') {
        e.preventDefault()
        detonate()
      }
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('keydown', onKey)

    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      ctx.save()
      if (shake > 0.3) {
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake)
        shake *= 0.86
      }

      drawGrid('rgba(73, 197, 206, 0.07)')

      // Sloped chamber floor
      ctx.fillStyle = '#122024'
      ctx.beginPath()
      ctx.moveTo(0, 225)
      ctx.lineTo(340, 340)
      ctx.lineTo(W, 340)
      ctx.lineTo(W, H)
      ctx.lineTo(0, H)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = 'rgba(73, 197, 206, 0.35)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, 225)
      ctx.lineTo(340, 340)
      ctx.lineTo(W, 340)
      ctx.stroke()

      // Cracked destructible blocks
      blocks.forEach((b) => {
        if (!b.alive) return
        ctx.save()
        ctx.fillStyle = '#3A3A35'
        ctx.strokeStyle = '#C8A96B'
        ctx.lineWidth = 2
        ctx.fillRect(b.x, b.y, b.w, b.h)
        ctx.strokeRect(b.x, b.y, b.w, b.h)
        // Cracks
        ctx.strokeStyle = 'rgba(16, 20, 20, 0.78)'
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(b.x + 10, b.y + 8)
        ctx.lineTo(b.x + 24, b.y + 24)
        ctx.lineTo(b.x + 36, b.y + 18)
        ctx.moveTo(b.x + 24, b.y + 24)
        ctx.lineTo(b.x + 18, b.y + 39)
        ctx.stroke()
        ctx.restore()
      })

      // Bomb physics
      if (bomb) {
        bomb.vy += 640 * dt
        bomb.x += bomb.vx * dt
        bomb.y += bomb.vy * dt
        const fy = floorHeightAt(bomb.x)
        const radius = 20
        if (bomb.y + radius > fy) {
          bomb.y = fy - radius
          bomb.vy = -bomb.vy * (bomb.shape === 'sphere' ? 0.35 : 0.08)
          if (bomb.shape === 'sphere') {
            if (bomb.x < 340) bomb.vx += 240 * dt
            else bomb.vx *= 0.985
          } else {
            bomb.vx *= 0.72
          }
        }
        bomb.x = Math.max(30, Math.min(W - 30, bomb.x))

        // Subtle blast radius preview ring so player sees when blocks are in range
        ctx.save()
        ctx.strokeStyle = 'rgba(73, 197, 206, 0.28)'
        ctx.setLineDash([6, 6])
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.arc(bomb.x, bomb.y, 165, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()

        ctx.save()
        ctx.shadowColor = '#49C5CE'
        ctx.shadowBlur = 24
        ctx.fillStyle = '#49C5CE'
        ctx.strokeStyle = '#D9FCFF'
        ctx.lineWidth = 2.4
        if (bomb.shape === 'sphere') {
          ctx.beginPath()
          ctx.arc(bomb.x, bomb.y, radius, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        } else {
          ctx.fillRect(bomb.x - 18, bomb.y - 18, 36, 36)
          ctx.strokeRect(bomb.x - 18, bomb.y - 18, 36, 36)
        }
        // Pulsing core
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(bomb.x, bomb.y, 5 + Math.sin(now * 0.014) * 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      ctx.save()
      ctx.fillStyle = 'rgba(233, 228, 213, 0.65)'
      ctx.font = '600 12px Manrope, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(
        bomb
          ? 'Pressione D ou clique em Detonar quando os blocos estiverem dentro do raio azul'
          : 'Clique na rampa ou perto dos blocos rachados para materializar uma bomba',
        22,
        28,
      )
      ctx.restore()

      // Detonation shockwaves
      shockwaves.forEach((s) => {
        s.r += 540 * dt
        s.alpha -= 2.1 * dt
        if (s.alpha <= 0) return
        ctx.save()
        ctx.strokeStyle = `rgba(123, 240, 250, ${s.alpha})`
        ctx.fillStyle = `rgba(73, 197, 206, ${s.alpha * 0.25})`
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      })
      shockwaves = shockwaves.filter((s) => s.alpha > 0)

      drawParticles(ctx, particles, dt)
      particles = particles.filter((p) => p.life > 0)
      ctx.restore()
    }

    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('keydown', onKey)
    }
  }, [runeId, motion])

  return (
    <div className="rune-sim">
      <div className="rune-sim__viewport sheikah-frame">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          className="rune-sim__canvas"
          data-cursor="INTERAGIR"
          aria-label={`Simulador interativo da runa ${runeId}`}
        />
      </div>

      {/* Accessible companion action bar for mouse, touch & keyboard */}
      <div className="rune-sim__bar">
        {runeId === 'stasis' && (
          <>
            <button type="button" className="btn btn--solid btn--sm" onClick={() => actionsRef.current.primary?.()}>
              {stasisState.frozen ? `Golpear (${stasisState.hits}/6)` : 'Congelar Esfera (Espaço)'}
            </button>
            {stasisState.frozen && (
              <button type="button" className="btn btn--sm" onClick={() => actionsRef.current.secondary?.()}>
                Liberar Agora
              </button>
            )}
            <span className="rune-sim__status">
              {stasisState.frozen ? `Energia cinética: ${stasisState.hits}/6` : 'Esfera em movimento'}
            </span>
          </>
        )}

        {runeId === 'magnesis' && (
          <>
            <span className="rune-sim__status">
              {magSolved
                ? 'Selo Sheikah ativado com sucesso!'
                : 'Arraste o cubo metálico (ou use as setas do teclado) até o pedestal.'}
            </span>
            <button type="button" className="btn btn--sm" onClick={() => actionsRef.current.reset?.()}>
              Reiniciar Câmara
            </button>
          </>
        )}

        {runeId === 'cryonis' && (
          <>
            <button type="button" className="btn btn--solid btn--sm" onClick={() => actionsRef.current.primary?.()}>
              Erguer Pilar (Espaço)
            </button>
            <button type="button" className="btn btn--sm" onClick={() => actionsRef.current.reset?.()}>
              Estilhaçar Todos
            </button>
            <span className="rune-sim__status">Pilares ativos: {cryoCount}/3</span>
          </>
        )}

        {runeId === 'bombs' && (
          <>
            <div className="bomb-toggle" role="group" aria-label="Formato da bomba">
              <button
                type="button"
                className={`btn btn--sm ${bombShape === 'sphere' ? 'btn--solid' : ''}`}
                aria-pressed={bombShape === 'sphere'}
                onClick={() => actionsRef.current.setShape?.('sphere')}
              >
                Esférica
              </button>
              <button
                type="button"
                className={`btn btn--sm ${bombShape === 'cube' ? 'btn--solid' : ''}`}
                aria-pressed={bombShape === 'cube'}
                onClick={() => actionsRef.current.setShape?.('cube')}
              >
                Cúbica
              </button>
            </div>
            <button type="button" className="btn btn--sm" onClick={() => actionsRef.current.spawn?.()}>
              Lançar Bomba
            </button>
            <button
              type="button"
              className="btn btn--solid btn--sm"
              disabled={!bombActive}
              onClick={() => actionsRef.current.detonate?.()}
            >
              Detonar (D)
            </button>
            {blocksLeft < 3 && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => actionsRef.current.reset?.()}>
                Reconstruir Blocos
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function drawParticles(ctx, list, dt) {
  for (let i = 0; i < list.length; i++) {
    const p = list[i]
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy += 260 * dt
    p.life -= dt
    if (p.life <= 0) continue
    ctx.save()
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife)
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}
