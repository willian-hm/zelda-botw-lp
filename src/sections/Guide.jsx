import { useState } from 'react'
import {
  COMBAT_TACTICS,
  COMBAT_VISUAL,
  DISCOVERIES,
  EXPLORATION_ITEMS,
  GUIDE_TABS,
  GUIDE_VIDEO,
  INGREDIENTS,
  cookIngredients,
} from '../data/guide'
import { KOROKS } from '../data/koroks'
import { audio } from '../lib/audio'
import { setState, toast, useStore } from '../lib/store'
import KorokSecret from '../components/KorokSecret'
import { HeartIcon, IngredientIcon, PlayIcon } from '../components/Icons'
import './Guide.css'

const ELEMENTAL_MATRIX = [
  {
    id: 'fogo',
    name: 'Fogo',
    color: '#D95D2B',
    effect: 'Derrete gelo instantaneamente, incendeia grama seca para criar correntes térmicas e vence inimigos glaciais em um único acerto.',
  },
  {
    id: 'gelo',
    name: 'Gelo',
    color: '#3B9BB8',
    effect: 'Congela adversários no lugar (o próximo golpe físico causa dano triplo) e anula criaturas de fogo instantaneamente.',
  },
  {
    id: 'raio',
    name: 'Eletricidade',
    color: '#C7961A',
    effect: 'Desarma inimigos instantaneamente e se amplifica em larga escala quando atinge poças d’água, chuva ou equipamentos metálicos.',
  },
]

export default function Guide() {
  const [tab, setTab] = useState('exploracao')
  const [exploreIdx, setExploreIdx] = useState(0)
  const [elementId, setElementId] = useState('fogo')
  const [videoActive, setVideoActive] = useState(false)

  // Cooking Pot state
  const [pot, setPot] = useState(['apple', 'pepper'])
  const [cooking, setCooking] = useState(false)
  const [dish, setDish] = useState(null)

  const motion = useStore((s) => s.motion)
  const koroks = useStore((s) => s.koroks)
  const recipes = useStore((s) => s.recipes)

  const currentExplore = EXPLORATION_ITEMS[exploreIdx]
  const currentElement = ELEMENTAL_MATRIX.find((e) => e.id === elementId) || ELEMENTAL_MATRIX[0]

  const addIngredient = (id) => {
    if (cooking) return
    if (pot.length >= 5) {
      toast('A panela comporta até 5 ingredientes por receita.', { tone: 'gold' })
      return
    }
    audio.playSfx('select')
    setPot((prev) => [...prev, id])
  }

  const removeSlot = (index) => {
    if (cooking) return
    audio.playSfx('select')
    setPot((prev) => prev.filter((_, i) => i !== index))
  }

  const applyPreset = (ids) => {
    if (cooking) return
    audio.playSfx('select')
    setPot(ids)
    setDish(null)
  }

  const handleCook = () => {
    if (!pot.length || cooking) return
    const result = cookIngredients(pot)
    audio.playSfx('cook')

    const finish = () => {
      setCooking(false)
      setDish(result)
      if (result && !recipes.includes(result.id)) {
        const next = [...recipes, result.id]
        setState({ recipes: next })
        toast(`Nova receita registrada: ${result.name}!`, {
          tone: 'gold',
          title: 'Livro de Culinária',
        })
      }
    }

    if (motion === 'reduced') {
      finish()
      return
    }
    setCooking(true)
    setDish(null)
    setTimeout(finish, 620)
  }

  const staminaDash = 2 * Math.PI * 36
  const staminaOffset = staminaDash * (1 - currentExplore.staminaCost / 100)

  return (
    <section id="guia" data-theme="light" className="section guide" aria-labelledby="guia-titulo">
      <div className="container">
        <div className="guide__top">
          <div className="section-head">
            <p className="eyebrow">Diário de Campo · Luz do Dia em Hyrule</p>
            <h2 id="guia-titulo" className="display">
              Guia do Aventureiro
            </h2>
            <p className="lead">
              Em Hyrule, sobreviver significa ler o vento, respeitar o clima, improvisar em combate e transformar os frutos da terra em energia na beira da fogueira.
            </p>
          </div>
          <div className="guide__korok">
            <KorokSecret id="guide-camp" tone="light" />
          </div>
        </div>

        {/* Category selector */}
        <div className="guide-tabs" role="tablist" aria-label="Categorias do Guia do Aventureiro">
          {GUIDE_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              className={`guide-tab ${tab === t.id ? 'is-active' : ''}`}
              onClick={() => {
                setTab(t.id)
                audio.playSfx('select')
              }}
            >
              <span className="guide-tab__num">{t.numeral}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* PANEL 1: EXPLORATION */}
        {tab === 'exploracao' && (
          <div id="panel-exploracao" role="tabpanel" aria-labelledby="tab-exploracao" className="guide-panel guide-explore">
            <div className="guide-explore__list">
              {EXPLORATION_ITEMS.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  className={`explore-item ${exploreIdx === idx ? 'is-active' : ''}`}
                  onClick={() => {
                    setExploreIdx(idx)
                    audio.playSfx('select')
                  }}
                >
                  <span className="explore-item__tag">{item.tag}</span>
                  <strong className="display">{item.title}</strong>
                  <p>{item.summary}</p>
                </button>
              ))}
            </div>

            <div className="guide-explore__stage">
              <figure className="guide-photo">
                <img src={currentExplore.image} alt={currentExplore.alt} loading="lazy" decoding="async" />
                <div className="stamina-badge" aria-label={`Consumo estimado de vigor: ${currentExplore.staminaCost}%`}>
                  <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true">
                    <circle cx="42" cy="42" r="36" fill="rgba(16,27,27,0.72)" stroke="rgba(255,255,255,0.16)" strokeWidth="6" />
                    <circle
                      cx="42"
                      cy="42"
                      r="36"
                      fill="none"
                      stroke="#7FE066"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={staminaDash}
                      strokeDashoffset={staminaOffset}
                      transform="rotate(-90 42 42)"
                      className="stamina-badge__ring"
                    />
                  </svg>
                  <div className="stamina-badge__text">
                    <strong>{currentExplore.staminaCost}%</strong>
                    <span>Vigor</span>
                  </div>
                </div>
              </figure>
              <aside className="guide-tip">
                <span className="guide-tip__label">Nota de Campo</span>
                <p>{currentExplore.tip}</p>
              </aside>
            </div>
          </div>
        )}

        {/* PANEL 2: COMBAT */}
        {tab === 'combate' && (
          <div id="panel-combate" role="tabpanel" aria-labelledby="tab-combate" className="guide-panel guide-combat">
            <div className="guide-combat__cards">
              {COMBAT_TACTICS.map((tactic) => (
                <article key={tactic.id} className="tactic-card">
                  <span className="tactic-card__timing">{tactic.timing}</span>
                  <h3 className="display">{tactic.title}</h3>
                  <p>{tactic.description}</p>
                  <p className="tactic-card__sub">{tactic.elements}</p>
                </article>
              ))}
            </div>

            <div className="guide-combat__side">
              <div className="combat-showcase">
                <img src={COMBAT_VISUAL.scene} alt={COMBAT_VISUAL.altScene} className="combat-showcase__bg" loading="lazy" />
                <img src={COMBAT_VISUAL.hero} alt={COMBAT_VISUAL.altHero} className="combat-showcase__hero" loading="lazy" />
              </div>

              <div className="element-matrix">
                <p className="element-matrix__kicker">Interação Elemental — Selecione um elemento</p>
                <div className="element-matrix__pills" role="group" aria-label="Elementos de combate">
                  {ELEMENTAL_MATRIX.map((el) => (
                    <button
                      key={el.id}
                      type="button"
                      className={`element-pill ${elementId === el.id ? 'is-active' : ''}`}
                      style={{ '--el-color': el.color }}
                      aria-pressed={elementId === el.id}
                      onClick={() => {
                        setElementId(el.id)
                        audio.playSfx('select')
                      }}
                    >
                      <span className="element-pill__swatch" aria-hidden="true" />
                      {el.name}
                    </button>
                  ))}
                </div>
                <p className="element-matrix__desc">{currentElement.effect}</p>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 3: SURVIVAL & INTERACTIVE HYRULE COOKING */}
        {tab === 'sobrevivencia' && (
          <div id="panel-sobrevivencia" role="tabpanel" aria-labelledby="tab-sobrevivencia" className="guide-panel guide-cook">
            <div className="cook-pantry">
              <div className="cook-pantry__head">
                <div>
                  <h3 className="display">Culinária de Hyrule</h3>
                  <p>Escolha de 1 a 5 ingredientes e leve ao fogo para descobrir receitas e bônus de sobrevivência.</p>
                </div>
                <span className="cook-counter">
                  Receitas descobertas: <strong>{recipes.length}</strong>
                </span>
              </div>

              <div className="ingredient-grid">
                {INGREDIENTS.map((ing) => (
                  <button
                    key={ing.id}
                    type="button"
                    className="ingredient-btn"
                    onClick={() => addIngredient(ing.id)}
                    aria-label={`Adicionar ${ing.name} (${ing.tag}) à panela`}
                  >
                    <IngredientIcon id={ing.id} color={ing.color} size={30} />
                    <span className="ingredient-btn__name">{ing.name}</span>
                    <span className="ingredient-btn__tag">{ing.tag}</span>
                  </button>
                ))}
              </div>

              <div className="cook-presets">
                <span>Combinações rápidas:</span>
                <button type="button" className="preset-chip" onClick={() => applyPreset(['meat', 'pepper', 'shroom'])}>
                  Contra o Frio
                </button>
                <button type="button" className="preset-chip" onClick={() => applyPreset(['apple', 'honey'])}>
                  Vigor Extra
                </button>
                <button type="button" className="preset-chip" onClick={() => applyPreset(['radish', 'radish'])}>
                  Corações Dourados
                </button>
                <button type="button" className="preset-chip" onClick={() => applyPreset(['apple', 'screw'])}>
                  Mistura Suspeita
                </button>
              </div>
            </div>

            <div className="cook-cauldron">
              <div className={`cauldron-stage ${cooking ? 'is-cooking' : ''}`}>
                <div className="cauldron-slots" aria-label="Ingredientes selecionados na panela">
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const id = pot[idx]
                    const ing = INGREDIENTS.find((i) => i.id === id)
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`cauldron-slot ${ing ? 'is-filled' : ''}`}
                        disabled={!ing || cooking}
                        onClick={() => removeSlot(idx)}
                        aria-label={ing ? `Remover ${ing.name} da panela` : `Espaço vazio ${idx + 1}`}
                        title={ing ? `Clique para remover ${ing.name}` : 'Vazio'}
                      >
                        {ing ? <IngredientIcon id={ing.id} color={ing.color} size={24} /> : <span>+</span>}
                      </button>
                    )
                  })}
                </div>

                {/* Stylised Campfire Cauldron SVG */}
                <div className="cauldron-pot" aria-hidden="true">
                  <svg width="160" height="110" viewBox="0 0 160 110" fill="none">
                    <ellipse cx="80" cy="96" rx="46" ry="8" fill="rgba(27,36,34,0.18)" />
                    <path d="M52 94c4-14 14-20 28-20s24 6 28 20" fill="#E86A2C" fillOpacity="0.82" className="cauldron-flame" />
                    <path d="M64 94c3-10 8-14 16-14s13 4 16 14" fill="#F5D05A" className="cauldron-flame" />
                    <path d="M36 42h88c0 28-16 42-44 42S36 70 36 42Z" fill="#2A3331" stroke="#1B2422" strokeWidth="2.5" />
                    <ellipse cx="80" cy="42" rx="44" ry="9" fill="#3D4946" stroke="#1B2422" strokeWidth="2.5" />
                    <ellipse cx="80" cy="42" rx="35" ry="5.5" fill={cooking ? '#E88F3C' : '#586963'} />
                    <path d="M28 45c-6 0-8 8-2 12M132 45c6 0 8 8 2 12" stroke="#1B2422" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="cauldron-actions">
                  <button
                    type="button"
                    className="btn btn--solid cook-btn"
                    disabled={!pot.length || cooking}
                    onClick={handleCook}
                  >
                    {cooking ? 'Cozinhando...' : `Cozinhar (${pot.length}/5)`}
                  </button>
                  <button
                    type="button"
                    className="btn btn--sm"
                    disabled={!pot.length || cooking}
                    onClick={() => {
                      setPot([])
                      setDish(null)
                    }}
                  >
                    Limpar
                  </button>
                </div>
              </div>

              <div className="dish-result" aria-live="polite">
                {dish ? (
                  <div className="dish-card">
                    <div className="dish-card__head">
                      <span className="dish-card__rarity">{dish.rarity}</span>
                      <span className="dish-card__buff" style={{ '--buff-color': dish.buffColor }}>
                        {dish.buff}
                      </span>
                    </div>
                    <h4 className="display">{dish.name}</h4>
                    <div className="dish-card__hearts" aria-label={`Recupera ${dish.hearts} corações`}>
                      {Array.from({ length: Math.min(10, Math.ceil(dish.hearts)) }).map((_, i) => (
                        <HeartIcon key={i} size={15} color="#C83E4D" />
                      ))}
                      <span>+{dish.hearts} corações</span>
                    </div>
                    <p>{dish.description}</p>
                  </div>
                ) : (
                  <p className="dish-placeholder">
                    Selecione ingredientes ao lado e acenda a panela para preparar sua refeição de viagem.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 4: DISCOVERIES */}
        {tab === 'descobertas' && (
          <div id="panel-descobertas" role="tabpanel" aria-labelledby="tab-descobertas" className="guide-panel guide-discoveries">
            {DISCOVERIES.map((item) => (
              <article key={item.id} className="discovery-card">
                <figure className="discovery-card__media">
                  <img src={item.image} alt={item.alt} loading="lazy" decoding="async" />
                </figure>
                <div className="discovery-card__body">
                  <span className="discovery-card__count">
                    {item.linksToKoroks ? `${koroks.length} de ${KOROKS.length} encontrados aqui` : item.count}
                  </span>
                  <h3 className="display">{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Complementary On-Demand YouTube Video Facade */}
        <div className="guide-video">
          <div className="guide-video__copy">
            <p className="eyebrow">Conteúdo Externo · YouTube</p>
            <h3 className="display">Guia em Vídeo no YouTube</h3>
            <p>
              Embed externo carregado apenas sob demanda ao clicar — nenhum vídeo de terceiros é hospedado neste repositório.
            </p>
          </div>

          <div className="guide-video__frame">
            {videoActive ? (
              <iframe
                src={`https://www.youtube.com/embed/${GUIDE_VIDEO.youtubeId}?autoplay=1&rel=0`}
                title={GUIDE_VIDEO.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                className="video-facade"
                data-cursor="ASSISTIR"
                onClick={() => {
                  audio.playSfx('select')
                  setVideoActive(true)
                }}
                aria-label="Carregar e reproduzir vídeo do Guia do Aventureiro no YouTube"
              >
                <img src={GUIDE_VIDEO.poster} alt="" loading="lazy" />
                <span className="video-facade__scrim" aria-hidden="true" />
                <span className="video-facade__play">
                  <PlayIcon size={24} />
                  <span>Assistir ao Vídeo</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
