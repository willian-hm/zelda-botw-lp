import themeSrc from '../assets/media/theme.mp3'
import kassSrc from '../assets/media/kass.mp3'
import startSrc from '../assets/media/start.mp3'
import { getState, setState } from './store'

/**
 * Audio & sound-design controller.
 * - Never autoplays on load (respects browser policies & visitor preference).
 * - Crossfades between Main Theme (hero/story) and Kass's Theme (exploration).
 * - Synthesizes crisp, zero-payload Web Audio SFX for Sheikah runes, cooking & Koroks.
 */
class AudioEngine {
  constructor() {
    this.ctx = null
    this.tracks = {}
    this.currentKey = 'theme'
    this.startAudio = null
    this.fadeTimer = null
  }

  _ensureCtx() {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (AC) this.ctx = new AC()
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  _getTrack(key) {
    if (!this.tracks[key]) {
      const src = key === 'kass' ? kassSrc : themeSrc
      const el = new Audio(src)
      el.loop = true
      el.preload = 'none'
      el.volume = 0
      this.tracks[key] = el
    }
    return this.tracks[key]
  }

  _ramp(audio, target, ms = 700, onDone) {
    const start = audio.volume
    const t0 = performance.now()
    const step = (now) => {
      const p = Math.min(1, (now - t0) / ms)
      audio.volume = Math.max(0, Math.min(1, start + (target - start) * p))
      if (p < 1) {
        requestAnimationFrame(step)
      } else if (onDone) {
        onDone()
      }
    }
    requestAnimationFrame(step)
  }

  setMusic(enabled) {
    setState({ music: enabled })
    if (!enabled) {
      Object.values(this.tracks).forEach((t) => {
        if (!t.paused) {
          this._ramp(t, 0, 450, () => t.pause())
        }
      })
      return
    }
    const track = this._getTrack(this.currentKey)
    track.play().then(() => {
      this._ramp(track, 0.38, 900)
    }).catch(() => {
      // Autoplay rejected — keep state honest so UI doesn't lie
      setState({ music: false })
    })
  }

  toggleMusic() {
    this.setMusic(!getState().music)
  }

  setSfx(enabled) {
    setState({ sfx: enabled })
    if (enabled) this.playSfx('sheikah')
  }

  toggleSfx() {
    this.setSfx(!getState().sfx)
  }

  switchTrack(key) {
    if (key === this.currentKey) return
    const prev = this.tracks[this.currentKey]
    this.currentKey = key
    if (!getState().music) return
    const next = this._getTrack(key)
    if (prev && !prev.paused) {
      this._ramp(prev, 0, 750, () => prev.pause())
    }
    next.play().then(() => {
      this._ramp(next, 0.36, 950)
    }).catch(() => {})
  }

  playStartChime() {
    if (!getState().sfx && !getState().music) return
    try {
      if (!this.startAudio) {
        this.startAudio = new Audio(startSrc)
        this.startAudio.volume = 0.45
      }
      this.startAudio.currentTime = 0
      this.startAudio.play().catch(() => {})
    } catch {
      /* non-blocking */
    }
  }

  playSfx(type) {
    if (!getState().sfx) return
    const ctx = this._ensureCtx()
    if (!ctx) return
    const now = ctx.currentTime

    const tone = (freq, dur, { type: oscType = 'sine', gain = 0.08, delay = 0, slideTo = null } = {}) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = oscType
      osc.frequency.setValueAtTime(freq, now + delay)
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, now + delay + dur)
      }
      g.gain.setValueAtTime(0.0001, now + delay)
      g.gain.exponentialRampToValueAtTime(gain, now + delay + 0.015)
      g.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur)
      osc.connect(g)
      g.connect(ctx.destination)
      osc.start(now + delay)
      osc.stop(now + delay + dur + 0.02)
    }

    switch (type) {
      case 'sheikah':
        tone(880, 0.14, { type: 'sine', gain: 0.06 })
        tone(1320, 0.22, { type: 'triangle', gain: 0.05, delay: 0.06 })
        break
      case 'stasis-lock':
        tone(520, 0.16, { type: 'triangle', gain: 0.09, slideTo: 260 })
        tone(1040, 0.28, { type: 'sine', gain: 0.06, delay: 0.05 })
        break
      case 'stasis-hit':
        tone(340, 0.09, { type: 'square', gain: 0.05, slideTo: 720 })
        break
      case 'stasis-launch':
        tone(220, 0.26, { type: 'sawtooth', gain: 0.07, slideTo: 880 })
        break
      case 'magnesis':
        tone(190, 0.22, { type: 'triangle', gain: 0.07, slideTo: 245 })
        break
      case 'cryonis':
        tone(980, 0.18, { type: 'sine', gain: 0.06, slideTo: 1560 })
        tone(1480, 0.24, { type: 'triangle', gain: 0.04, delay: 0.05 })
        break
      case 'shatter':
        tone(1600, 0.09, { type: 'triangle', gain: 0.05, slideTo: 420 })
        tone(1100, 0.11, { type: 'sine', gain: 0.04, delay: 0.03, slideTo: 300 })
        break
      case 'bomb': {
        // Low impact boom + filtered noise burst
        tone(120, 0.45, { type: 'sine', gain: 0.15, slideTo: 32 })
        const bufferSize = ctx.sampleRate * 0.28
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2)
        }
        const noise = ctx.createBufferSource()
        noise.buffer = buffer
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(900, now)
        const g = ctx.createGain()
        g.gain.setValueAtTime(0.11, now)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)
        noise.connect(filter)
        filter.connect(g)
        g.connect(ctx.destination)
        noise.start(now)
        break
      }
      case 'cook':
        // Playful ascending BotW-inspired pentatonic fanfare
        ;[523.25, 587.33, 659.25, 783.99, 1046.5].forEach((f, i) => {
          tone(f, 0.18, { type: 'triangle', gain: 0.07, delay: i * 0.09 })
        })
        break
      case 'korok':
        // Bright wooden marimba "Ya-ha-ha!" motif
        ;[659.25, 783.99, 987.77, 1318.5].forEach((f, i) => {
          tone(f, 0.16, { type: 'sine', gain: 0.08, delay: i * 0.085 })
        })
        break
      case 'select':
      default:
        tone(640, 0.09, { type: 'sine', gain: 0.045, slideTo: 820 })
        break
    }
  }
}

export const audio = new AudioEngine()
