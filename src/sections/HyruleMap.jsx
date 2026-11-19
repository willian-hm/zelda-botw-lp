import { useEffect, useRef, useState } from 'react'
import mapGeo from '../data/mapGeometry'
import { BIOMES, REGIONS } from '../data/regions'
import { gsap } from '../lib/gsap'
import { audio } from '../lib/audio'
import { useStore } from '../lib/store'
import KorokSecret from '../components/KorokSecret'
import { ArrowIcon, CompassIcon, ExternalIcon } from '../components/Icons'
import './HyruleMap.css'

export default function HyruleMap() {
  const [selectedId, setSelectedId] = useState('plateau')
  const [biome, setBiome] = useState('all')
  const [zoomed, setZoomed] = useState(false)
  const [showExternal, setShowExternal] = useState(false)

  const svgRef = useRef(null)
  const vbRef = useRef({ x: 0, y: 0, w: 1000, h: 720 })
  const motion = useStore((s) => s.motion)

  const current = REGIONS.find((r) => r.id === selectedId) || REGIONS[0]

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const [vx, vy, vw, vh] = mapGeo.viewBox
    let target = { x: vx, y: vy, w: vw, h: vh }
    if (zoomed) {
      const reg = mapGeo.regions[selectedId]
      if (reg) {
        const [sx, sy] = reg.seed
        const zw = 520
        const zh = 374
        target = {
          x: Math.max(0, Math.min(vw - zw, sx - zw / 2)),
          y: Math.max(0, Math.min(vh - zh, sy - zh / 2)),
          w: zw,
          h: zh,
        }
      }
    }
    if (motion === 'reduced') {
      vbRef.current = target
      svg.setAttribute('viewBox', `${target.x} ${target.y} ${target.w} ${target.h}`)
      return
    }
    const tween = gsap.to(vbRef.current, {
      ...target,
      duration: 0.65,
      ease: 'power3.inOut',
      onUpdate: () => {
        const { x, y, w, h } = vbRef.current
        svg.setAttribute('viewBox', `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`)
      },
    })
    return () => tween.kill()
  }, [zoomed, selectedId, motion])

  const selectRegion = (id) => {
    setSelectedId(id)
    audio.playSfx('select')
  }

  const nextRegion = () => {
    const list = biome === 'all' ? REGIONS : REGIONS.filter((r) => r.biome === biome)
    const idx = list.findIndex((r) => r.id === selectedId)
    const next = list[(idx + 1) % list.length] || REGIONS[0]
    selectRegion(next.id)
  }

  return (
    <section id="mapa" data-theme="light" className="section hmap" aria-labelledby="mapa-titulo">
      <div className="container">
        <div className="hmap__head">
          <div className="section-head">
            <p className="eyebrow">Cartografia Ilustrativa · 15 Regiões</p>
            <h2 id="mapa-titulo" className="display">
              Mapa de Hyrule
            </h2>
            <p className="lead">
              Explore os biomas e territórios do reino selecionando qualquer região no mapa ou pelos filtros abaixo.
            </p>
          </div>
          <div className="hmap__korok">
            <KorokSecret id="map-forest" tone="light" />
          </div>
        </div>

        {/* Biome filters + map toolbar */}
        <div className="hmap__toolbar">
          <div className="biome-filters" role="group" aria-label="Filtrar regiões por bioma">
            {BIOMES.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`biome-pill ${biome === b.id ? 'is-active' : ''}`}
                aria-pressed={biome === b.id}
                onClick={() => {
                  setBiome(b.id)
                  audio.playSfx('select')
                  if (b.id !== 'all') {
                    const match = REGIONS.find((r) => r.biome === b.id)
                    if (match) setSelectedId(match.id)
                  }
                }}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="hmap__zoom-actions">
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => {
                setZoomed((z) => !z)
                audio.playSfx('select')
              }}
              aria-pressed={zoomed}
            >
              <CompassIcon size={15} />
              <span>{zoomed ? 'Visão Geral' : 'Aproximar Região'}</span>
            </button>
          </div>
        </div>

        {/* Interactive SVG Atlas + Contextual Dossier */}
        <div className="hmap__layout">
          <div className="hmap__board">
            <svg
              ref={svgRef}
              viewBox="0 0 1000 720"
              className="hyrule-svg"
              role="img"
              aria-label="Mapa estilizado interativo das 15 regiões de Hyrule"
            >
              <defs>
                <clipPath id="hyrule-continent">
                  <path d={mapGeo.continent} />
                </clipPath>
                <pattern id="map-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M50 0H0V50" fill="none" stroke="rgba(27,36,34,0.08)" strokeWidth="1" />
                </pattern>
              </defs>

              {/* Sea & parchment grid */}
              <rect width="1000" height="720" fill="#B7C9CA" />
              <rect width="1000" height="720" fill="url(#map-grid)" />

              {/* Outer coast glow */}
              <path
                d={mapGeo.continent}
                fill="#DDD6C2"
                stroke="#29484B"
                strokeWidth="4"
                strokeLinejoin="round"
              />

              {/* Clipped selectable regions */}
              <g clipPath="url(#hyrule-continent)">
                {REGIONS.map((region) => {
                  const geo = mapGeo.regions[region.id]
                  if (!geo) return null
                  const isSelected = region.id === selectedId
                  const matchesBiome = biome === 'all' || region.biome === biome
                  return (
                    <g
                      key={region.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Selecionar região ${region.name}`}
                      aria-pressed={isSelected}
                      className={`map-region ${isSelected ? 'is-selected' : ''} ${!matchesBiome ? 'is-dimmed' : ''}`}
                      onClick={() => selectRegion(region.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          selectRegion(region.id)
                        }
                      }}
                    >
                      <path
                        d={geo.d}
                        fill={region.fill}
                        stroke={isSelected ? '#101B1B' : 'rgba(27, 36, 34, 0.36)'}
                        strokeWidth={isSelected ? 3.2 : 1.3}
                      />
                    </g>
                  )
                })}

                {/* Lake Hylia & rivers */}
                <path d={mapGeo.lake} fill="#6CA5B3" stroke="#366773" strokeWidth="1.5" pointerEvents="none" />
                {mapGeo.rivers.map((r, i) => (
                  <path
                    key={i}
                    d={r}
                    fill="none"
                    stroke="#6CA5B3"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    opacity="0.82"
                    pointerEvents="none"
                  />
                ))}

                {/* Region markers & subtle labels */}
                {REGIONS.map((region) => {
                  const geo = mapGeo.regions[region.id]
                  if (!geo) return null
                  const [sx, sy] = geo.seed
                  const isSelected = region.id === selectedId
                  const matchesBiome = biome === 'all' || region.biome === biome
                  return (
                    <g
                      key={`pin-${region.id}`}
                      transform={`translate(${sx}, ${sy})`}
                      className={`map-pin ${isSelected ? 'is-selected' : ''} ${!matchesBiome ? 'is-dimmed' : ''}`}
                      pointerEvents="none"
                    >
                      {isSelected && <circle r="18" className="map-pin__pulse" stroke={region.accent} />}
                      <circle
                        r={isSelected ? 7.5 : 4.5}
                        fill={isSelected ? '#49C5CE' : '#101B1B'}
                        stroke="#F4F1E8"
                        strokeWidth="2"
                      />
                      <text y={isSelected ? -14 : 17} textAnchor="middle" className="map-pin__label">
                        {region.name}
                      </text>
                    </g>
                  )
                })}
              </g>

              {/* Decorative Compass Rose tucked cleanly in bottom-left sea corner */}
              <g transform="translate(52, 668) scale(0.78)" opacity="0.78" pointerEvents="none">
                <circle r="30" fill="rgba(244,241,232,0.72)" stroke="#1B2422" strokeWidth="1.2" />
                <polygon points="0,-24 5,-4 0,-8 -5,-4" fill="#1B2422" />
                <polygon points="0,24 5,4 0,8 -5,4" fill="#748E69" />
                <polygon points="-24,0 -4,-5 -8,0 -4,5" fill="#748E69" />
                <polygon points="24,0 4,-5 8,0 4,5" fill="#748E69" />
                <text y="-34" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1B2422">
                  N
                </text>
              </g>
            </svg>

            <p className="hmap__disclaimer">
              Mapa artístico ilustrativo — traçado aproximado para navegação editorial, sem coordenadas oficiais.
            </p>
          </div>

          {/* Contextual Region Card */}
          <aside className="region-card" aria-live="polite">
            <figure className="region-card__media">
              <img src={current.image} alt={`Atmosfera visual da região ${current.name}`} loading="lazy" />
              <span className="region-card__climate">{current.climate}</span>
            </figure>

            <div className="region-card__body">
              <p className="eyebrow">Região Selecionada</p>
              <h3 className="display region-card__title">{current.name}</h3>
              <p className="region-card__summary">{current.summary}</p>

              <div className="region-card__pois">
                <span>Pontos de Interesse</span>
                <ul role="list">
                  {current.landmarks.map((lm) => (
                    <li key={lm}>{lm}</li>
                  ))}
                </ul>
              </div>

              <p className="region-card__note">{current.note}</p>

              <div className="region-card__actions">
                <button type="button" className="btn btn--solid btn--sm" onClick={nextRegion}>
                  <span>Próxima Região</span>
                  <ArrowIcon dir="right" size={14} />
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile-friendly quick region index */}
        <div className="hmap__quick-list" aria-label="Lista rápida de regiões">
          {REGIONS.filter((r) => biome === 'all' || r.biome === biome).map((r) => (
            <button
              key={r.id}
              type="button"
              className={`quick-region-btn ${r.id === selectedId ? 'is-active' : ''}`}
              onClick={() => selectRegion(r.id)}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* Optional External ZeldaMaps Explorer */}
        <div className="hmap__external">
          <div>
            <h3 className="display">Exploração Completa de Santuários &amp; Torres</h3>
            <p>
              Deseja consultar o mapa comunitário detalhado do ZeldaMaps? Você pode abri-lo aqui sob demanda ou em uma nova aba.
            </p>
          </div>
          <div className="hmap__external-btns">
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => {
                audio.playSfx('select')
                setShowExternal((v) => !v)
              }}
            >
              {showExternal ? 'Fechar Mapa Externo' : 'Abrir Mapa Completo Aqui'}
            </button>
            <a
              href="https://zeldamaps.com/?game=BotW"
              target="_blank"
              rel="noreferrer"
              className="btn btn--sm btn--solid"
            >
              <span>ZeldaMaps</span>
              <ExternalIcon size={14} />
            </a>
          </div>
        </div>

        {showExternal && (
          <div className="external-map-frame">
            <iframe
              src="https://zeldamaps.com/?game=BotW"
              title="Mapa completo interativo de Breath of the Wild no ZeldaMaps"
              loading="lazy"
            />
            <p className="external-map-frame__hint">
              Caso seu navegador ou bloqueador impeça a incorporação externa, utilize o botão ZeldaMaps acima para abrir em nova aba.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
