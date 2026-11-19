import { useState } from 'react'
import { EXTRA_RUNES, LAB_RUNES } from '../data/runes'
import sheikahPanel from '../assets/media/sheikah-panel-1600.webp'
import { audio } from '../lib/audio'
import { useStore } from '../lib/store'
import AmbientCanvas from '../components/AmbientCanvas'
import RuneCanvas from '../components/RuneCanvas'
import KorokSecret from '../components/KorokSecret'
import { PlayIcon, RuneIcon, SheikahEyeIcon } from '../components/Icons'
import './SheikahLab.css'

export default function SheikahLab() {
  const [selectedId, setSelectedId] = useState(LAB_RUNES[0].id)
  const [showFieldClip, setShowFieldClip] = useState(false)
  const [playingExtra, setPlayingExtra] = useState({})
  const motion = useStore((s) => s.motion)

  const current = LAB_RUNES.find((r) => r.id === selectedId) || LAB_RUNES[0]

  const selectRune = (id) => {
    setSelectedId(id)
    setShowFieldClip(false)
    audio.playSfx('sheikah')
  }

  return (
    <section
      id="runas"
      className="section lab"
      style={{ '--rune-accent': current.accent }}
      aria-labelledby="runas-titulo"
    >
      {/* Subtle Sheikah topographic backdrop */}
      <div
        className="lab__bg"
        style={{ backgroundImage: `url(${sheikahPanel})` }}
        aria-hidden="true"
      />
      <AmbientCanvas mode="sheikah" density={0.55} />

      <div className="container lab__inner">
        <div className="lab__head">
          <div className="section-head">
            <p className="eyebrow">Pedra Sheikah · Tecnologia Ancestral</p>
            <h2 id="runas-titulo" className="display">
              Laboratório Sheikah
            </h2>
            <p className="lead">
              Experimente as quatro runas essenciais diretamente nesta câmara interativa — compatível com mouse, toque e teclado.
            </p>
          </div>
          <div className="lab__korok">
            <KorokSecret id="lab-slate" tone="dark" />
          </div>
        </div>

        {/* Sheikah Slate Console */}
        <div className="slate-console">
          {/* Rune Selector Rail */}
          <div className="slate-selector" role="tablist" aria-label="Selecionar runa Sheikah">
            {LAB_RUNES.map((rune) => (
              <button
                key={rune.id}
                type="button"
                role="tab"
                aria-selected={rune.id === current.id}
                className={`rune-tile ${rune.id === current.id ? 'is-active' : ''}`}
                style={{ '--tile-accent': rune.accent }}
                onClick={() => selectRune(rune.id)}
                data-cursor="RUNA"
              >
                <span className="rune-tile__glyph">
                  <RuneIcon id={rune.id} size={28} />
                </span>
                <span className="rune-tile__text">
                  <strong className="display">{rune.name}</strong>
                  <small>{rune.jpTag}</small>
                </span>
              </button>
            ))}
          </div>

          {/* Interactive Lab Stage + Briefing */}
          <div className="slate-stage">
            <div className="slate-brief">
              <div className="slate-brief__badge">
                <SheikahEyeIcon size={18} />
                <span>{current.jpTag}</span>
              </div>
              <h3 className="display slate-brief__name">{current.name}</h3>
              <p className="slate-brief__desc">{current.summary}</p>
              <div className="slate-brief__howto">
                <span>Como interagir</span>
                <p>{current.controls}</p>
              </div>

              <button
                type="button"
                className="btn btn--sm slate-clip-toggle"
                onClick={() => {
                  audio.playSfx('select')
                  setShowFieldClip((v) => !v)
                }}
              >
                <PlayIcon size={14} />
                <span>{showFieldClip ? 'Voltar ao Simulador' : 'Ver Registro em Jogo'}</span>
              </button>
            </div>

            <div className="slate-demo">
              {showFieldClip ? (
                <div className="rune-field-clip sheikah-frame">
                  <video
                    key={current.id}
                    src={current.video}
                    poster={current.poster}
                    autoPlay={motion !== 'reduced'}
                    loop
                    muted
                    playsInline
                    controls
                    aria-label={`Demonstração em jogo da runa ${current.name}`}
                  />
                </div>
              ) : (
                <RuneCanvas runeId={current.id} />
              )}
            </div>
          </div>
        </div>

        {/* Complementary Sheikah Slate Modules (Camera, Amiibo, Master Cycle Zero) */}
        <div className="extra-runes">
          <p className="eyebrow">Módulos Complementares</p>
          <div className="extra-runes__grid">
            {EXTRA_RUNES.map((item) => {
              const isPlaying = !!playingExtra[item.id]
              return (
                <article key={item.id} className="extra-rune-card">
                  <div className="extra-rune-card__media">
                    {item.video ? (
                      isPlaying ? (
                        <video
                          src={item.video}
                          poster={item.poster}
                          autoPlay
                          loop
                          muted
                          playsInline
                          aria-label={item.alt}
                        />
                      ) : (
                        <button
                          type="button"
                          className="extra-poster"
                          onClick={() => {
                            audio.playSfx('select')
                            setPlayingExtra((p) => ({ ...p, [item.id]: true }))
                          }}
                          aria-label={`Reproduzir demonstração de ${item.name}`}
                        >
                          <img src={item.poster} alt={item.alt} loading="lazy" decoding="async" />
                          <span className="extra-poster__play" aria-hidden="true">
                            <PlayIcon size={18} />
                          </span>
                        </button>
                      )
                    ) : (
                      <img src={item.image} alt={item.alt} loading="lazy" decoding="async" />
                    )}
                  </div>
                  <div className="extra-rune-card__body">
                    <span>{item.tag}</span>
                    <h3 className="display">{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
