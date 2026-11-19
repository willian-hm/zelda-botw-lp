import { useRef, useState } from 'react'
import { CHAPTERS } from '../data/story'
import { gsap, ScrollTrigger, scrollToTarget, useGSAP } from '../lib/gsap'
import { audio } from '../lib/audio'
import { useStore } from '../lib/store'
import AmbientCanvas from '../components/AmbientCanvas'
import KorokSecret from '../components/KorokSecret'
import './Story.css'

export default function Story() {
  const sectionRef = useRef(null)
  const motion = useStore((s) => s.motion)

  const [activeChapter, setActiveChapter] = useState(CHAPTERS[0].id)
  const [activeBeast, setActiveBeast] = useState(0)

  useGSAP(
    () => {
      const cards = gsap.utils.toArray('.story-chapter')

      cards.forEach((card) => {
        const id = card.getAttribute('data-chapter')

        ScrollTrigger.create({
          trigger: card,
          start: 'top 48%',
          end: 'bottom 48%',
          onEnter: () => setActiveChapter(id),
          onEnterBack: () => setActiveChapter(id),
        })

        if (motion === 'reduced') return

        // Smooth camera parallax on single-frame story chapters
        const media = card.querySelector('.story-chapter__media-img')
        if (media && id !== 'campeoes') {
          gsap.fromTo(
            media,
            { scale: id === 'calamidade' ? 1.12 : 1.07, yPercent: -3 },
            {
              scale: 1,
              yPercent: 3,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          )
        }

        // Subtle upward arrival — always preserves high-contrast legibility
        const copyNodes = card.querySelectorAll('.story-reveal')
        if (copyNodes.length) {
          gsap.from(copyNodes, {
            y: 18,
            duration: 0.65,
            stagger: 0.06,
            ease: 'expo.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: card,
              start: 'top 92%',
              once: true,
            },
          })
        }

        if (id === 'calamidade') {
          const veil = card.querySelector('.calamity-veil')
          if (veil) {
            gsap.fromTo(
              veil,
              { opacity: 0.25 },
              {
                opacity: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: card,
                  start: 'top 80%',
                  end: 'center center',
                  scrub: true,
                },
              },
            )
          }
        }
      })
    },
    { scope: sectionRef, dependencies: [motion] },
  )

  const jumpChapter = (id) => {
    audio.playSfx('select')
    setActiveChapter(id)
    scrollToTarget(`#capitulo-${id}`, { reduced: motion === 'reduced', offset: 142 })
  }

  return (
    <section
      id="historia"
      ref={sectionRef}
      className={`story story--mood-${activeChapter}`}
      aria-labelledby="historia-titulo"
    >
      <div className="story__backdrop" aria-hidden="true" />

      <div className="story__intro container">
        <div className="section-head">
          <p className="eyebrow">Crônicas de Hyrule</p>
          <h2 id="historia-titulo" className="display">
            Cem anos entre a queda e o despertar
          </h2>
          <p className="lead">
            Role para percorrer os quatro atos da jornada — ou salte diretamente para qualquer capítulo a qualquer momento.
          </p>
        </div>
      </div>

      <nav className="chapter-rail" aria-label="Capítulos da história">
        <div className="chapter-rail__inner container">
          {CHAPTERS.map((ch) => (
            <button
              key={ch.id}
              type="button"
              className={`chapter-pill ${activeChapter === ch.id ? 'is-active' : ''}`}
              aria-current={activeChapter === ch.id ? 'step' : undefined}
              onClick={() => jumpChapter(ch.id)}
            >
              <span className="chapter-pill__num">{ch.numeral}</span>
              <span className="chapter-pill__name">{ch.title}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="story__chapters">
        {CHAPTERS.map((ch) => {
          const isCalamity = ch.id === 'calamidade'
          const isChampions = ch.id === 'campeoes'
          const isAwakening = ch.id === 'despertar'
          const isDestiny = ch.id === 'destino'

          return (
            <article
              key={ch.id}
              id={`capitulo-${ch.id}`}
              data-chapter={ch.id}
              className={`story-chapter story-chapter--${ch.atmosphere}`}
            >
              {isCalamity && (
                <div className="calamity-veil" aria-hidden="true">
                  <AmbientCanvas mode="malice" density={0.9} />
                  <div className="calamity-veil__tendrils" />
                </div>
              )}
              {isDestiny && (
                <div className="destiny-rays" aria-hidden="true">
                  <AmbientCanvas mode="light" density={0.65} />
                </div>
              )}

              <div className={`story-chapter__grid container ${isChampions || isDestiny ? 'story-chapter__grid--wide' : ''}`}>
                <div className="story-chapter__copy">
                  <span className="story-chapter__ghost-num display" aria-hidden="true">
                    {ch.numeral}
                  </span>
                  <p className="eyebrow story-reveal">{ch.eyebrow}</p>
                  <h3 className="display story-chapter__title story-reveal">{ch.title}</h3>
                  <p className="editorial story-chapter__quote story-reveal">{ch.quote}</p>
                  <p className="story-chapter__body story-reveal">{ch.body}</p>
                  <p className="story-chapter__detail story-reveal">{ch.detail}</p>

                  <dl className="story-chapter__meta story-reveal">
                    {ch.meta.map((m) => (
                      <div key={m.label}>
                        <dt>{m.label}</dt>
                        <dd>{m.value}</dd>
                      </div>
                    ))}
                  </dl>

                  {isAwakening && (
                    <div className="story-chapter__korok">
                      <KorokSecret id="story-awakening" tone="dark" />
                    </div>
                  )}
                </div>

                {/* Visual column */}
                <div className="story-chapter__visual">
                  {isChampions && ch.beasts ? (
                    <>
                      {/* 4 Separate Original Divine Beast Illustrations (impossible to misalign!) */}
                      <div className="beasts-quad" role="group" aria-label="As quatro Bestas Divinas">
                        {ch.beasts.map((b, idx) => (
                          <button
                            key={b.name}
                            type="button"
                            className={`beast-panel ${activeBeast === idx ? 'is-focused' : ''}`}
                            style={{ '--beast-color': b.color }}
                            aria-label={`Destacar ${b.name} (${b.champion})`}
                            aria-pressed={activeBeast === idx}
                            onMouseEnter={() => setActiveBeast(idx)}
                            onClick={() => {
                              setActiveBeast(idx)
                              audio.playSfx('select')
                            }}
                          >
                            <img
                              src={b.image}
                              srcSet={b.srcSet}
                              sizes="(max-width: 640px) 46vw, 18vw"
                              alt={b.alt}
                              loading="lazy"
                              decoding="async"
                            />
                            <span className="beast-panel__scrim" aria-hidden="true" />
                            <span className="beast-panel__tag">{b.name}</span>
                          </button>
                        ))}
                      </div>

                      <div
                        className="beast-spotlight"
                        style={{ '--beast-color': ch.beasts[activeBeast].color }}
                        aria-live="polite"
                      >
                        <span className="beast-spotlight__badge">
                          {ch.beasts[activeBeast].name} · {ch.beasts[activeBeast].champion} ({ch.beasts[activeBeast].region})
                        </span>
                        <p>{ch.beasts[activeBeast].summary}</p>
                      </div>

                      <div className="beasts-grid" role="tablist" aria-label="Selecionar Besta Divina">
                        {ch.beasts.map((b, idx) => (
                          <button
                            key={b.name}
                            type="button"
                            role="tab"
                            aria-selected={activeBeast === idx}
                            className={`beast-chip ${activeBeast === idx ? 'is-active' : ''}`}
                            style={{ '--beast-color': b.color }}
                            onMouseEnter={() => setActiveBeast(idx)}
                            onClick={() => {
                              setActiveBeast(idx)
                              audio.playSfx('select')
                            }}
                          >
                            <span className="beast-chip__dot" aria-hidden="true" />
                            <span className="beast-chip__main">
                              <strong>{b.name}</strong>
                              <small>
                                {b.champion} · {b.region}
                              </small>
                            </span>
                            <span className="beast-chip__el">{b.element}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <figure className={`story-frame ${isCalamity ? 'story-frame--malice' : ''}`}>
                        <img
                          src={ch.media.src}
                          srcSet={ch.media.srcSet}
                          sizes="(max-width: 960px) 100vw, 58vw"
                          alt={ch.media.alt}
                          loading="lazy"
                          decoding="async"
                          className="story-chapter__media-img"
                        />
                        <figcaption className="story-frame__caption">
                          <span>{ch.subtitle}</span>
                          <span className="story-frame__num">Ato {ch.numeral}</span>
                        </figcaption>
                      </figure>

                      {isAwakening && ch.media.insetImage && (
                        <div className="story-inset sheikah-frame">
                          <img src={ch.media.insetImage} alt={ch.media.insetAlt} loading="lazy" decoding="async" />
                          <span className="story-inset__label">Além do Santuário · Luz da Manhã</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
