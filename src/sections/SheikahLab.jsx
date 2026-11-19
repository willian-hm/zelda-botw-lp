import { useState } from 'react'
import { EXTRA_RUNES, LAB_RUNES } from '../data/runes'
import { audio } from '../lib/audio'
import { toast } from '../lib/store'
import AmbientCanvas from '../components/AmbientCanvas'
import RuneCanvas from '../components/RuneCanvas'
import KorokSecret from '../components/KorokSecret'
import { RuneIcon, SheikahEyeIcon } from '../components/Icons'
import './SheikahLab.css'

function BlueprintGraphic({ id, active }) {
  if (id === 'camera') {
    return (
      <svg viewBox="0 0 320 180" className={`blueprint-svg ${active ? 'is-triggered' : ''}`} aria-hidden="true">
        <rect x="24" y="20" width="272" height="140" rx="6" fill="none" stroke="rgba(73,197,206,0.35)" strokeWidth="1.2" />
        <path d="M40 48V32h18M280 48V32h-18M40 132v16h18M280 132v16h-18" stroke="#49C5CE" strokeWidth="2.2" fill="none" />
        <circle cx="160" cy="90" r="34" fill="none" stroke="#49C5CE" strokeWidth="1.5" strokeDasharray="5 4" />
        <circle cx="160" cy="90" r="14" fill="rgba(73,197,206,0.16)" stroke="#E6CF98" strokeWidth="1.6" />
        <path d="M160 44v14M160 122v14M114 90h14M192 90h14" stroke="#49C5CE" strokeWidth="1.4" />
      </svg>
    )
  }
  if (id === 'relic') {
    return (
      <svg viewBox="0 0 320 180" className={`blueprint-svg ${active ? 'is-triggered' : ''}`} aria-hidden="true">
        <circle cx="160" cy="90" r="62" fill="none" stroke="rgba(200,169,107,0.35)" strokeWidth="1.2" strokeDasharray="4 6" />
        <circle cx="160" cy="90" r="42" fill="none" stroke="#C8A96B" strokeWidth="1.6" />
        <polygon points="160,42 200,90 160,138 120,90" fill="rgba(200,169,107,0.14)" stroke="#E6CF98" strokeWidth="1.8" />
        <circle cx="160" cy="90" r="7" fill="#49C5CE" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 320 180" className={`blueprint-svg ${active ? 'is-triggered' : ''}`} aria-hidden="true">
      <path d="M52 128h216" stroke="rgba(124,228,255,0.28)" strokeWidth="1.4" />
      <circle cx="102" cy="116" r="24" fill="none" stroke="#7CE4FF" strokeWidth="2.2" />
      <circle cx="102" cy="116" r="9" fill="rgba(124,228,255,0.2)" stroke="#E6CF98" strokeWidth="1.5" />
      <circle cx="222" cy="116" r="24" fill="none" stroke="#7CE4FF" strokeWidth="2.2" />
      <circle cx="222" cy="116" r="9" fill="rgba(124,228,255,0.2)" stroke="#E6CF98" strokeWidth="1.5" />
      <path d="M102 116L144 74h52l26 42M144 74l-14-18h28M174 74l-20 42h42" fill="none" stroke="#E6CF98" strokeWidth="2" strokeLinejoin="round" />
      <path d="M56 76h38M44 90h30" stroke="#49C5CE" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

export default function SheikahLab() {
  const [selectedId, setSelectedId] = useState(LAB_RUNES[0].id)
  const [triggered, setTriggered] = useState({})

  const current = LAB_RUNES.find((r) => r.id === selectedId) || LAB_RUNES[0]

  const selectRune = (id) => {
    setSelectedId(id)
    audio.playSfx('sheikah')
  }

  const triggerExtra = (item) => {
    audio.playSfx('sheikah')
    setTriggered((prev) => ({ ...prev, [item.id]: true }))
    toast(item.feedback, { tone: 'sheikah', title: item.name, duration: 2400 })
    setTimeout(() => {
      setTriggered((prev) => ({ ...prev, [item.id]: false }))
    }, 650)
  }

  return (
    <section
      id="runas"
      className="section lab"
      style={{ '--rune-accent': current.accent }}
      aria-labelledby="runas-titulo"
    >
      {/* Procedural geometric circuit grid (100% original CSS, zero external raster) */}
      <div className="lab__bg" aria-hidden="true" />
      <AmbientCanvas mode="sheikah" density={0.55} />

      <div className="container lab__inner">
        <div className="lab__head">
          <div className="section-head">
            <p className="eyebrow">Pedra Sheikah · Tecnologia Ancestral</p>
            <h2 id="runas-titulo" className="display">
              Laboratório Sheikah
            </h2>
            <p className="lead">
              Experimente as quatro runas essenciais diretamente nesta câmara de física interativa — compatível com mouse, toque e teclado.
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

          {/* Interactive Lab Stage + Technical Briefing */}
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

              <dl className="slate-specs">
                {current.specs.map((spec) => (
                  <div key={spec.label}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="slate-demo">
              <RuneCanvas runeId={current.id} />
            </div>
          </div>
        </div>

        {/* Complementary Original Blueprint Modules */}
        <div className="extra-runes">
          <p className="eyebrow">Módulos Complementares · Esquemáticos Originais</p>
          <div className="extra-runes__grid">
            {EXTRA_RUNES.map((item) => {
              const isActive = !!triggered[item.id]
              return (
                <article
                  key={item.id}
                  className="extra-rune-card"
                  style={{ '--extra-accent': item.accent }}
                >
                  <div className="extra-rune-card__media extra-rune-card__blueprint">
                    <BlueprintGraphic id={item.id} active={isActive} />
                  </div>
                  <div className="extra-rune-card__body">
                    <span>{item.tag}</span>
                    <h3 className="display">{item.name}</h3>
                    <p>{item.description}</p>
                    <button
                      type="button"
                      className="btn btn--sm extra-rune-card__btn"
                      onClick={() => triggerExtra(item)}
                    >
                      {item.actionLabel}
                    </button>
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
