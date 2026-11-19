import { useEffect, useRef, useState } from 'react'
import skyImg from '../assets/media/hero-sky.webp'
import skySmImg from '../assets/media/hero-sky-sm.webp'
import landImg from '../assets/media/hero-land.webp'
import landSmImg from '../assets/media/hero-land-sm.webp'
import heroMp4 from '../assets/media/hero.mp4'
import heroPoster from '../assets/media/hero-poster.jpg'
import { gsap, scrollToTarget, useGSAP } from '../lib/gsap'
import { audio } from '../lib/audio'
import { setState, useStore } from '../lib/store'
import AmbientCanvas from '../components/AmbientCanvas'
import KorokSecret from '../components/KorokSecret'
import { ArrowIcon, MusicIcon, SheikahEyeIcon } from '../components/Icons'
import './Hero.css'

export default function Hero() {
  const heroRef = useRef(null)
  const skyRef = useRef(null)
  const wordRef = useRef(null)
  const landRef = useRef(null)
  const videoWrapRef = useRef(null)
  const videoElRef = useRef(null)
  const sunRef = useRef(null)

  const motion = useStore((s) => s.motion)
  const lite = useStore((s) => s.lite)
  const music = useStore((s) => s.music)

  const [entering, setEntering] = useState(false)
  // Preserve the iconic entrance video by default when motion is full; fallback gracefully in reduced/lite mode
  const [showVideo, setShowVideo] = useState(() => motion !== 'reduced' && !lite)
  const [videoReady, setVideoReady] = useState(false)

  const videoActive = showVideo && motion !== 'reduced'

  // Pause entrance video automatically when scrolled out of viewport to save CPU/GPU
  useEffect(() => {
    const vid = videoElRef.current
    if (!vid || !videoActive) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          vid.play().catch(() => {})
        } else {
          vid.pause()
        }
      },
      { threshold: 0.05 },
    )
    io.observe(vid)
    return () => io.disconnect()
  }, [videoActive])

  // Fast, crisp entrance + scroll parallax
  useGSAP(
    () => {
      if (motion === 'reduced') return

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.fromTo(
        '.hero__eyebrow',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55 },
        0.04,
      )
        .fromTo(
          '.hero__depth-word',
          { y: 26, opacity: 0 },
          { y: 0, opacity: 0.94, duration: 0.8 },
          0.08,
        )
        .fromTo(
          '.hero__tagline',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65 },
          0.16,
        )
        .fromTo(
          '.hero__actions',
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          0.22,
        )

      // Multi-layer depth parallax while scrolling down
      gsap.to(skyRef.current, {
        yPercent: 12,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.to(wordRef.current, {
        yPercent: 28,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.to(landRef.current, {
        yPercent: 4,
        scale: 1.05,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      if (videoWrapRef.current) {
        gsap.to(videoWrapRef.current, {
          yPercent: 10,
          scale: 1.08,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
    },
    { scope: heroRef, dependencies: [motion] },
  )

  // Subtle pointer-driven camera parallax on fine-pointer desktops
  useEffect(() => {
    if (motion === 'reduced' || lite) return
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!mq.matches || window.innerWidth < 1024) return

    const el = heroRef.current
    if (!el) return

    const setSkyX = gsap.quickTo(skyRef.current, 'x', { duration: 1.1, ease: 'power3.out' })
    const setSkyY = gsap.quickTo(skyRef.current, 'y', { duration: 1.1, ease: 'power3.out' })
    const setWordX = gsap.quickTo(wordRef.current, 'x', { duration: 1.0, ease: 'power3.out' })
    const setLandX = gsap.quickTo(landRef.current, 'x', { duration: 0.9, ease: 'power3.out' })
    const setVidX = videoWrapRef.current
      ? gsap.quickTo(videoWrapRef.current, 'x', { duration: 1.0, ease: 'power3.out' })
      : null
    const setSunX = gsap.quickTo(sunRef.current, 'x', { duration: 1.4, ease: 'power2.out' })

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const nx = (e.clientX - rect.left) / rect.width - 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5
      setSkyX(nx * -12)
      setSkyY(ny * -8)
      setWordX(nx * -22)
      setLandX(nx * -34)
      setVidX?.(nx * -20)
      setSunX(nx * 28)
    }

    el.addEventListener('pointermove', onMove, { passive: true })
    return () => el.removeEventListener('pointermove', onMove)
  }, [motion, lite, videoActive])

  const startAdventure = ({ withSound = false } = {}) => {
    setState({ started: true })
    if (withSound) {
      audio.setSfx(true)
      audio.setMusic(true)
      audio.playStartChime()
    } else if (music) {
      audio.playStartChime()
    }

    if (motion === 'reduced') {
      scrollToTarget('#historia', { reduced: true })
      return
    }

    // Brief immersive Sheikah veil — NEVER depends on audio finishing
    setEntering(true)
    setTimeout(() => {
      scrollToTarget('#historia', { reduced: false, duration: 1.05 })
    }, 150)
    setTimeout(() => {
      setEntering(false)
    }, 680)
  }

  return (
    <section
      id="inicio"
      ref={heroRef}
      className={`hero ${videoActive ? 'is-video-mode' : 'is-parallax-mode'}`}
      aria-label="Abertura cinematográfica de Hyrule"
    >
      {/* Visual Stage */}
      <div className="hero__stage" aria-hidden="true">
        {/* Layer 0: Dawn Sky (instant fallback & parallax base) */}
        <div ref={skyRef} className="hero__layer hero__layer--sky">
          <img
            src={skyImg}
            srcSet={`${skySmImg} 640w, ${skyImg} 1280w`}
            sizes="100vw"
            alt=""
            className="hero__img"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        {/* Golden sunrise rim light */}
        <div ref={sunRef} className="hero__sun" />

        {/* Layer 1: Monumental display wordmark (behind mountains in parallax mode, above video in video mode) */}
        <div ref={wordRef} className="hero__depth-wrap">
          <span className="hero__depth-word display">HYRULE</span>
        </div>

        {/* Layer 2: Mountains, valley & Link on the Great Plateau cliff */}
        <div ref={landRef} className="hero__layer hero__layer--land">
          <img
            src={landImg}
            srcSet={`${landSmImg} 640w, ${landImg} 1280w`}
            sizes="100vw"
            alt="Link no alto de um penhasco no Grande Platô contemplando o vasto reino de Hyrule ao amanhecer"
            className="hero__img"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        {/* Layer 3 (Video Entrance): Full-viewport cinematic Hyrule opening video */}
        {videoActive && (
          <div ref={videoWrapRef} className={`hero__layer hero__layer--video ${videoReady ? 'is-ready' : ''}`}>
            <video
              ref={videoElRef}
              className="hero__video"
              src={heroMp4}
              poster={heroPoster}
              autoPlay
              loop
              muted
              playsInline
              onCanPlay={() => setVideoReady(true)}
            />
          </div>
        )}

        {/* Cinematic atmospheric scrim & golden pollen particles */}
        <div className="hero__scrim" />
        <AmbientCanvas mode="pollen" className="hero__particles" density={0.85} />
      </div>

      {/* Foreground editorial content */}
      <div className="hero__content container">
        <div className="hero__top-copy">
          <p className="eyebrow hero__eyebrow">Tributo Interativo · Breath of the Wild</p>
          <h1 className="visually-hidden">Hyrule — The Wild Awaits</h1>
        </div>

        <div className="hero__bottom-copy">
          <p className="hero__tagline">
            <span className="editorial hero__wild">The Wild Awaits.</span>
            <span>
              Desperte após um século de silêncio e atravesse planícies, santuários ancestrais e segredos perdidos sob o céu aberto de Hyrule.
            </span>
          </p>

          <div className="hero__actions">
            <button
              type="button"
              className="btn-adventure"
              onClick={() => startAdventure({ withSound: false })}
            >
              <span className="btn-adventure__bg" aria-hidden="true" />
              <span className="btn-adventure__ring" aria-hidden="true" />
              <SheikahEyeIcon size={20} className="btn-adventure__icon" />
              <span>Iniciar Aventura</span>
              <ArrowIcon dir="down" size={16} />
            </button>

            <button
              type="button"
              className="btn hero__sound-btn"
              onClick={() => startAdventure({ withSound: true })}
              aria-label="Iniciar aventura ativando trilha sonora e efeitos sonoros"
            >
              <MusicIcon size={16} />
              <span>Entrar com Som</span>
            </button>

            {motion !== 'reduced' && (
              <button
                type="button"
                className={`btn btn--ghost btn--sm hero__cinema-btn ${videoActive ? 'is-active' : ''}`}
                onClick={() => {
                  audio.playSfx('select')
                  setShowVideo((v) => !v)
                }}
                aria-pressed={videoActive}
              >
                {videoActive ? 'Ver Camadas Parallax' : 'Vídeo de Entrada'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Korok #1 tucked gently in the cliffside corner */}
      <div className="hero__korok">
        <KorokSecret id="hero-cliff" tone="dark" />
      </div>

      {/* Scroll prompt */}
      <div className="hero__scroll-cue" aria-hidden="true">
        <span>Role para explorar</span>
        <span className="hero__scroll-line" />
      </div>

      {/* Brief Sheikah light veil during transition */}
      <div className={`hero__veil ${entering ? 'is-active' : ''}`} aria-hidden="true">
        <SheikahEyeIcon size={44} />
      </div>
    </section>
  )
}
