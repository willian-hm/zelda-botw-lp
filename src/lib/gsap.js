import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, useGSAP)

gsap.defaults({ ease: 'expo.out', duration: 1 })
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger, ScrollToPlugin, SplitText, useGSAP }

/** Scrolls to an element/selector honoring the motion preference. */
export function scrollToTarget(target, { reduced = false, offset = 0, duration } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  if (reduced) {
    const y = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo(0, y)
    return
  }
  const distance = Math.abs(el.getBoundingClientRect().top)
  gsap.to(window, {
    duration: duration ?? Math.min(1.6, 0.6 + distance / 4000),
    ease: 'power3.inOut',
    scrollTo: { y: el, offsetY: offset, autoKill: true },
  })
}
