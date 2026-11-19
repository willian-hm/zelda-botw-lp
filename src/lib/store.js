import { useSyncExternalStore } from 'react'

/**
 * Tiny global store (no extra dependency). Holds visitor preferences and
 * exploration progress; persisted to localStorage.
 */
const KEY = 'hyrule-experience:v1'

const reducedMotionQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

function detectLowPower() {
  if (typeof navigator === 'undefined') return false
  const conn = navigator.connection
  if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return true
  const cores = navigator.hardwareConcurrency || 8
  const mem = navigator.deviceMemory || 8
  return cores <= 2 || mem <= 2
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

const saved = typeof window !== 'undefined' ? load() : {}

let state = {
  music: saved.music ?? false, // never autoplay: the visitor opts in
  sfx: saved.sfx ?? false,
  motion: saved.motion ?? (reducedMotionQuery?.matches ? 'reduced' : 'full'), // 'full' | 'reduced'
  lite: saved.lite ?? detectLowPower(), // lighter particles/effects
  koroks: saved.koroks ?? [],
  recipes: saved.recipes ?? [],
  started: false,
  activeSection: 'inicio',
  toast: null,
}

const listeners = new Set()

function persist() {
  try {
    const { music, sfx, motion, lite, koroks, recipes } = state
    localStorage.setItem(KEY, JSON.stringify({ music, sfx, motion, lite, koroks, recipes }))
  } catch {
    /* storage may be unavailable (private mode) */
  }
}

export function getState() {
  return state
}

export function setState(patch) {
  const next = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...next }
  persist()
  listeners.forEach((l) => l())
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useStore(selector = (s) => s) {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  )
}

/* ---- Helpers --------------------------------------------------------- */
let toastTimer
export function toast(message, { tone = 'sheikah', duration = 3200, title } = {}) {
  clearTimeout(toastTimer)
  setState({ toast: { message, tone, title, id: Date.now() } })
  toastTimer = setTimeout(() => setState({ toast: null }), duration)
}

export const isReduced = () => state.motion === 'reduced'
export const isLite = () => state.lite || state.motion === 'reduced'

// keep in sync if the OS preference changes while the page is open
reducedMotionQuery?.addEventListener?.('change', (e) => {
  setState({ motion: e.matches ? 'reduced' : 'full' })
})
