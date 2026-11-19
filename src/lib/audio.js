import { getState, setState } from './store'

/**
 * 100% Original Procedural Audio & Soundscape Engine (Web Audio API).
 * Zero third-party copyrighted MP3 recordings — synthesizes live open-air
 * pentatonic acoustic ambience, gentle wind bed, and interactive SFX.
 *
 * Strictly opt-in: never autoplays before visitor interaction.
 */
class AudioEngine {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.musicGain = null
    this.delayNode = null
    this.windSource = null
    this.windGain = null
    this.noteTimer = null
    this.currentMood = 'theme' // 'theme' (open dawn piano) | 'kass' (warm camp harp)
    this.stepIndex = 0
  }

  _ensureCtx() {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      this.ctx = new AC()

      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = 0.85
      this.masterGain.connect(this.ctx.destination)

      this.musicGain = this.ctx.createGain()
      this.musicGain.gain.value = 0.0001

      // Soft stereo-feel ambient echo tail
      this.delayNode = this.ctx.createDelay(1.2)
      this.delayNode.delayTime.value = 0.42
      const fb = this.ctx.createGain()
      fb.gain.value = 0.34
      const echoFilter = this.ctx.createBiquadFilter()
      echoFilter.type = 'lowpass'
      echoFilter.frequency.value = 1800

      this.musicGain.connect(this.masterGain)
      this.musicGain.connect(this.delayNode)
      this.delayNode.connect(echoFilter)
      echoFilter.connect(fb)
      fb.connect(this.delayNode)
      echoFilter.connect(this.masterGain)
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  _startWind(ctx) {
    if (this.windSource) return
    const len = ctx.sampleRate * 3
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < len; i++) {
      // Gentle pink-ish filtered breeze
      const white = Math.random() * 2 - 1
      last = (last + 0.025 * white) / 1.025
      data[i] = last * 2.4
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 420
    filter.Q.value = 0.9

    const wg = ctx.createGain()
    wg.gain.value = 0.032

    src.connect(filter)
    filter.connect(wg)
    wg.connect(this.musicGain)
    src.start()

    this.windSource = src
    this.windGain = wg
  }

  _stopWind() {
    if (this.windSource) {
      try {
        this.windSource.stop()
      } catch {
        /* ignore */
      }
      this.windSource.disconnect()
      this.windSource = null
    }
  }

  _playAmbientNote(freq, { duration = 3.2, gain = 0.055, wave = 'triangle', detune = 0 } = {}) {
    if (!this.ctx || !this.musicGain) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const overtone = this.ctx.createOscillator()
    const filter = this.ctx.createBiquadFilter()
    const env = this.ctx.createGain()

    osc.type = wave
    osc.frequency.setValueAtTime(freq, now)
    osc.detune.setValueAtTime(detune, now)

    overtone.type = 'sine'
    overtone.frequency.setValueAtTime(freq * 2, now)

    const overGain = this.ctx.createGain()
    overGain.gain.value = 0.14

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2400, now)
    filter.frequency.exponentialRampToValueAtTime(620, now + duration)

    env.gain.setValueAtTime(0.0001, now)
    env.gain.linearRampToValueAtTime(gain, now + 0.045)
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc.connect(filter)
    overtone.connect(overGain)
    overGain.connect(filter)
    filter.connect(env)
    env.connect(this.musicGain)

    osc.start(now)
    overtone.start(now)
    osc.stop(now + duration + 0.08)
    overtone.stop(now + duration + 0.08)
  }

  _scheduleNextPhrase() {
    if (!getState().music) return
    const ctx = this._ensureCtx()
    if (!ctx) return

    // Original contemplative D-major / B-minor9 pentatonic motifs
    const dawnNotes = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 659.25, 739.99]
    const campNotes = [261.63, 329.63, 392.0, 440.0, 523.25, 659.25, 783.99]

    if (this.currentMood === 'theme') {
      // Sparse open-air piano impressionism
      const root = dawnNotes[this.stepIndex % dawnNotes.length]
      const fifth = dawnNotes[(this.stepIndex + 3) % dawnNotes.length]
      this._playAmbientNote(root, { duration: 4.2, gain: 0.055, wave: 'triangle' })
      if (this.stepIndex % 2 === 0) {
        setTimeout(() => {
          if (getState().music) {
            this._playAmbientNote(fifth, { duration: 3.6, gain: 0.038, wave: 'sine', detune: 3 })
          }
        }, 480)
      }
      if (this.stepIndex % 4 === 0) {
        this._playAmbientNote(root / 2, { duration: 5.5, gain: 0.04, wave: 'sine' })
      }
      this.stepIndex += 1 + (this.stepIndex % 2)
      const nextMs = 2400 + Math.random() * 1700
      this.noteTimer = setTimeout(() => this._scheduleNextPhrase(), nextMs)
    } else {
      // Warm pastoral arpeggio for Guide / Lab / Map
      const n1 = campNotes[this.stepIndex % campNotes.length]
      const n2 = campNotes[(this.stepIndex + 2) % campNotes.length]
      this._playAmbientNote(n1, { duration: 2.8, gain: 0.05, wave: 'triangle' })
      setTimeout(() => {
        if (getState().music) {
          this._playAmbientNote(n2, { duration: 2.6, gain: 0.035, wave: 'triangle', detune: -3 })
        }
      }, 360)
      this.stepIndex += 1
      const nextMs = 1550 + Math.random() * 750
      this.noteTimer = setTimeout(() => this._scheduleNextPhrase(), nextMs)
    }
  }

  setMusic(enabled) {
    setState({ music: enabled })
    clearTimeout(this.noteTimer)
    if (!enabled) {
      if (this.ctx && this.musicGain) {
        const now = this.ctx.currentTime
        this.musicGain.gain.cancelScheduledValues(now)
        this.musicGain.gain.setTargetAtTime(0.0001, now, 0.25)
      }
      setTimeout(() => {
        if (!getState().music) this._stopWind()
      }, 700)
      return
    }

    const ctx = this._ensureCtx()
    if (!ctx) {
      setState({ music: false })
      return
    }
    this._startWind(ctx)
    const now = ctx.currentTime
    this.musicGain.gain.cancelScheduledValues(now)
    this.musicGain.gain.setTargetAtTime(0.85, now, 0.45)
    this._scheduleNextPhrase()
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
    this.currentMood = key === 'kass' ? 'kass' : 'theme'
  }

  playStartChime() {
    if (!getState().sfx && !getState().music) return
    const ctx = this._ensureCtx()
    if (!ctx) return
    // Original warm resonant golden chord swell
    const chord = [293.66, 440.0, 587.33, 739.99, 880.0]
    chord.forEach((f, i) => {
      this._tone(ctx, f, 1.35, { type: i < 2 ? 'triangle' : 'sine', gain: 0.045, delay: i * 0.06 })
    })
  }

  _tone(ctx, freq, dur, { type = 'sine', gain = 0.08, delay = 0, slideTo = null } = {}) {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, now + delay)
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + delay + dur)
    }
    g.gain.setValueAtTime(0.0001, now + delay)
    g.gain.exponentialRampToValueAtTime(gain, now + delay + 0.015)
    g.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur)
    osc.connect(g)
    g.connect(this.masterGain || ctx.destination)
    osc.start(now + delay)
    osc.stop(now + delay + dur + 0.03)
  }

  playSfx(type) {
    if (!getState().sfx) return
    const ctx = this._ensureCtx()
    if (!ctx) return
    const now = ctx.currentTime

    switch (type) {
      case 'sheikah':
        this._tone(ctx, 880, 0.14, { type: 'sine', gain: 0.06 })
        this._tone(ctx, 1320, 0.22, { type: 'triangle', gain: 0.05, delay: 0.06 })
        break
      case 'stasis-lock':
        this._tone(ctx, 520, 0.16, { type: 'triangle', gain: 0.09, slideTo: 260 })
        this._tone(ctx, 1040, 0.28, { type: 'sine', gain: 0.06, delay: 0.05 })
        break
      case 'stasis-hit':
        this._tone(ctx, 340, 0.09, { type: 'square', gain: 0.05, slideTo: 720 })
        break
      case 'stasis-launch':
        this._tone(ctx, 220, 0.26, { type: 'sawtooth', gain: 0.07, slideTo: 880 })
        break
      case 'magnesis':
        this._tone(ctx, 190, 0.22, { type: 'triangle', gain: 0.07, slideTo: 245 })
        break
      case 'cryonis':
        this._tone(ctx, 980, 0.18, { type: 'sine', gain: 0.06, slideTo: 1560 })
        this._tone(ctx, 1480, 0.24, { type: 'triangle', gain: 0.04, delay: 0.05 })
        break
      case 'shatter':
        this._tone(ctx, 1600, 0.09, { type: 'triangle', gain: 0.05, slideTo: 420 })
        this._tone(ctx, 1100, 0.11, { type: 'sine', gain: 0.04, delay: 0.03, slideTo: 300 })
        break
      case 'bomb': {
        this._tone(ctx, 120, 0.45, { type: 'sine', gain: 0.15, slideTo: 32 })
        const bufferSize = Math.floor(ctx.sampleRate * 0.28)
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
        g.connect(this.masterGain || ctx.destination)
        noise.start(now)
        break
      }
      case 'cook':
        ;[523.25, 587.33, 659.25, 783.99, 1046.5].forEach((f, i) => {
          this._tone(ctx, f, 0.18, { type: 'triangle', gain: 0.07, delay: i * 0.09 })
        })
        break
      case 'korok':
        ;[659.25, 783.99, 987.77, 1318.5].forEach((f, i) => {
          this._tone(ctx, f, 0.16, { type: 'sine', gain: 0.08, delay: i * 0.085 })
        })
        break
      case 'select':
      default:
        this._tone(ctx, 640, 0.09, { type: 'sine', gain: 0.045, slideTo: 820 })
        break
    }
  }
}

export const audio = new AudioEngine()
