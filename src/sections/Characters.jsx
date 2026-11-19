import { useRef, useState } from 'react'
import { CHARACTERS } from '../data/characters'
import { gsap, useGSAP } from '../lib/gsap'
import { audio } from '../lib/audio'
import { useStore } from '../lib/store'
import AmbientCanvas from '../components/AmbientCanvas'
import KorokSecret from '../components/KorokSecret'
import { ArrowIcon } from '../components/Icons'
import './Characters.css'

export default function Characters() {
  const [index, setIndex] = useState(0)
  const stageRef = useRef(null)
  const motion = useStore((s) => s.motion)

  const current = CHARACTERS[index]

  const select = (nextIndex) => {
    const wrapped = (nextIndex + CHARACTERS.length) % CHARACTERS.length
    setIndex(wrapped)
    audio.playSfx('select')
  }

  useGSAP(
    () => {
      if (motion === 'reduced') return
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.fromTo(
        '.char-portrait__img',
        { opacity: 0, y: 28, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.78 },
        0,
      )
        .fromTo(
          '.char-watermark',
          { opacity: 0, x: -24 },
          { opacity: 0.08, x: 0, duration: 0.9 },
          0.04,
        )
        .fromTo(
          '.char-seq',
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.62, stagger: 0.06 },
          0.08,
        )
    },
    { scope: stageRef, dependencies: [index, motion] },
  )

  const onTabsKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      select(index + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      select(index - 1)
    }
  }

  return (
    <section
      id="personagens"
      ref={stageRef}
      className={`section characters ${current.id === 'ganon' ? 'is-malice' : ''}`}
      style={{
        '--char-bg': current.palette.bg,
        '--char-bg-accent': current.palette.bgAccent,
        '--char-accent': current.palette.accent,
        '--char-secondary': current.palette.secondary,
        '--char-glow': current.palette.glow,
      }}
      aria-labelledby="personagens-titulo"
    >
      {/* Dynamic elemental canvas tailored per character */}
      <AmbientCanvas key={current.effect} mode={current.effect} density={0.95} />

      <div className="characters__aura" aria-hidden="true" />

      <div className="container characters__inner">
        <div className="characters__header">
          <div className="section-head">
            <p className="eyebrow">Almas de Hyrule</p>
            <h2 id="personagens-titulo" className="display">
              Campeões &amp; Lendas
            </h2>
          </div>

          <div className="characters__controls">
            <KorokSecret id="characters-stage" tone="dark" />
            <span className="characters__counter" aria-live="polite">
              0{index + 1} / 0{CHARACTERS.length}
            </span>
            <button
              type="button"
              className="icon-btn char-arrow"
              onClick={() => select(index - 1)}
              aria-label="Personagem anterior"
            >
              <ArrowIcon dir="left" size={18} />
            </button>
            <button
              type="button"
              className="icon-btn char-arrow"
              onClick={() => select(index + 1)}
              aria-label="Próximo personagem"
            >
              <ArrowIcon dir="right" size={18} />
            </button>
          </div>
        </div>

        {/* Main Cinematic Stage */}
        <div className="char-stage" key={current.id}>
          <span className="char-watermark display" aria-hidden="true">
            {current.name}
          </span>

          <div className="char-info">
            <p className="char-role char-seq">{current.role}</p>
            <h3 className="display char-name char-seq">{current.name}</h3>
            <blockquote className="editorial char-quote char-seq">{current.quote}</blockquote>
            <p className="char-bio char-seq">{current.bio}</p>

            <dl className="char-traits char-seq">
              <div>
                <dt>Povo</dt>
                <dd>{current.race}</dd>
              </div>
              <div>
                <dt>Vínculo</dt>
                <dd>{current.affiliation}</dd>
              </div>
              <div>
                <dt>Dom / Legado</dt>
                <dd>{current.blessing}</dd>
              </div>
            </dl>
          </div>

          <figure className="char-portrait">
            <div className="char-portrait__halo" aria-hidden="true" />
            <img
              src={current.image.src}
              srcSet={current.image.srcSet}
              sizes="(max-width: 900px) 86vw, 44vw"
              alt={current.image.alt}
              className="char-portrait__img"
              decoding="async"
            />
          </figure>
        </div>

        {/* Portrait Rail Selector */}
        <div
          className="char-rail"
          role="tablist"
          aria-label="Escolher personagem"
          onKeyDown={onTabsKeyDown}
        >
          {CHARACTERS.map((char, idx) => (
            <button
              key={char.id}
              type="button"
              role="tab"
              aria-selected={idx === index}
              className={`char-thumb ${idx === index ? 'is-active' : ''}`}
              style={{ '--thumb-accent': char.palette.accent }}
              onClick={() => select(idx)}
              data-cursor="VER"
            >
              <span className="char-thumb__avatar">
                <img src={char.image.src} alt="" loading="lazy" />
              </span>
              <span className="char-thumb__label">
                <strong>{char.name}</strong>
                <small>{char.race}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
