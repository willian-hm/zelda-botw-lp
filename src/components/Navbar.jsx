import { useEffect, useState } from 'react'
import logoSrc from '../assets/media/logo-480.webp'
import { KOROKS } from '../data/koroks'
import { scrollToTarget } from '../lib/gsap'
import { audio } from '../lib/audio'
import { setState, toast, useStore } from '../lib/store'
import { KorokLeafIcon, MusicIcon, SfxIcon } from './Icons'
import './Navbar.css'

const NAV_ITEMS = [
  { id: 'inicio', label: 'Início' },
  { id: 'historia', label: 'História' },
  { id: 'guia', label: 'Guia' },
  { id: 'runas', label: 'Runas' },
  { id: 'personagens', label: 'Personagens' },
  { id: 'mapa', label: 'Mapa' },
]

export default function Navbar() {
  const music = useStore((s) => s.music)
  const sfx = useStore((s) => s.sfx)
  const motion = useStore((s) => s.motion)
  const koroks = useStore((s) => s.koroks)
  const activeSection = useStore((s) => s.activeSection)

  const [progress, setProgress] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const ratio = Math.min(1, Math.max(0, window.scrollY / max))
      setProgress(ratio)
      setScrolled(window.scrollY > 40)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Section observer for active nav link & contextual music switching
  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean)
    if (!sections.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) {
          const id = visible[0].target.id
          setState({ activeSection: id })
          // Subtle soundtrack shift: epic theme on Hero/Story/Characters, Kass's accordion on Guide/Lab/Map
          audio.switchTrack(['guia', 'runas', 'mapa'].includes(id) ? 'kass' : 'theme')
        }
      },
      { rootMargin: '-28% 0px -48% 0px', threshold: [0.05, 0.25, 0.5] },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (id) => {
    setDrawerOpen(false)
    audio.playSfx('select')
    scrollToTarget(`#${id}`, { reduced: motion === 'reduced', offset: id === 'inicio' ? 0 : 12 })
  }

  const toggleMotion = () => {
    const next = motion === 'reduced' ? 'full' : 'reduced'
    setState({ motion: next })
    toast(
      next === 'reduced'
        ? 'Modo movimento reduzido ativado — transições simplificadas.'
        : 'Animações cinematográficas reativadas.',
      { tone: 'sheikah' },
    )
  }

  const showKorokHint = () => {
    audio.playSfx('select')
    const remaining = KOROKS.length - koroks.length
    toast(
      remaining === 0
        ? 'Você descobriu todos os 7 Koroks escondidos por Hyrule!'
        : `Você encontrou ${koroks.length} de ${KOROKS.length} Koroks. Procure pequenos brilhos dourados espalhados pelas seções!`,
      { tone: 'gold', title: 'Sementes Korok' },
    )
  }

  return (
    <>
      <a href="#conteudo-principal" className="skip-link">
        Pular para o conteúdo principal
      </a>

      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`} role="banner">
        <div className="progress-rail" aria-hidden="true">
          <div className="progress-rail__fill" style={{ transform: `scaleX(${progress})` }} />
        </div>

        <div className="site-header__inner container">
          <a
            href="#inicio"
            className="brand"
            onClick={(e) => {
              e.preventDefault()
              go('inicio')
            }}
            aria-label="Voltar ao início — Hyrule Experience"
          >
            <img src={logoSrc} alt="The Legend of Zelda: Breath of the Wild" width="96" height="75" />
          </a>

          <nav className="desktop-nav" aria-label="Navegação principal">
            <ul role="list">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`nav-link ${activeSection === item.id ? 'is-active' : ''}`}
                    aria-current={activeSection === item.id ? 'location' : undefined}
                    onClick={(e) => {
                      e.preventDefault()
                      go(item.id)
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-controls">
            <button
              type="button"
              className={`korok-pill ${koroks.length === KOROKS.length ? 'is-complete' : ''}`}
              onClick={showKorokHint}
              aria-label={`Koroks encontrados: ${koroks.length} de ${KOROKS.length}`}
              title="Koroks escondidos encontrados"
            >
              <KorokLeafIcon size={16} />
              <span>
                {koroks.length}/{KOROKS.length}
              </span>
            </button>

            <button
              type="button"
              className={`ctrl-btn ${music ? 'is-on' : ''}`}
              onClick={() => audio.toggleMusic()}
              aria-pressed={music}
              aria-label={music ? 'Pausar música de fundo' : 'Ativar música de fundo'}
              title={music ? 'Música: ligada' : 'Música: desligada'}
            >
              <MusicIcon off={!music} />
              <span className="ctrl-btn__label">Música</span>
            </button>

            <button
              type="button"
              className={`ctrl-btn ${sfx ? 'is-on' : ''}`}
              onClick={() => audio.toggleSfx()}
              aria-pressed={sfx}
              aria-label={sfx ? 'Desativar efeitos sonoros' : 'Ativar efeitos sonoros'}
              title={sfx ? 'Efeitos sonoros: ligados' : 'Efeitos sonoros: desligados'}
            >
              <SfxIcon off={!sfx} />
              <span className="ctrl-btn__label">SFX</span>
            </button>

            <button
              type="button"
              className={`ctrl-btn ctrl-btn--motion ${motion === 'reduced' ? 'is-on' : ''}`}
              onClick={toggleMotion}
              aria-pressed={motion === 'reduced'}
              aria-label={motion === 'reduced' ? 'Reativar animações completas' : 'Ativar modo movimento reduzido'}
              title={motion === 'reduced' ? 'Movimento reduzido ativo' : 'Alternar movimento reduzido'}
            >
              <span className="motion-dot" aria-hidden="true" />
              <span className="ctrl-btn__label">{motion === 'reduced' ? 'Leve' : 'Motion'}</span>
            </button>

            <button
              type="button"
              className="menu-toggle"
              onClick={() => setDrawerOpen((o) => !o)}
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              aria-label={drawerOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
            >
              <span className={`hamburger ${drawerOpen ? 'is-open' : ''}`} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-drawer"
        className={`mobile-drawer ${drawerOpen ? 'is-open' : ''}`}
        aria-hidden={!drawerOpen}
      >
        <div className="mobile-drawer__backdrop" onClick={() => setDrawerOpen(false)} />
        <nav className="mobile-drawer__panel" aria-label="Menu móvel">
          <div className="mobile-drawer__top">
            <p className="eyebrow">Mapa da Jornada</p>
            <button
              type="button"
              className="btn btn--sm"
              tabIndex={drawerOpen ? 0 : -1}
              onClick={() => setDrawerOpen(false)}
              aria-label="Fechar menu"
            >
              Fechar ×
            </button>
          </div>
          <ul role="list" className="mobile-drawer__links">
            {NAV_ITEMS.map((item, idx) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  tabIndex={drawerOpen ? 0 : -1}
                  className={activeSection === item.id ? 'is-active' : ''}
                  onClick={(e) => {
                    e.preventDefault()
                    go(item.id)
                  }}
                >
                  <span className="mobile-drawer__idx">0{idx + 1}</span>
                  <span className="display">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mobile-drawer__prefs">
            <button type="button" className="btn btn--sm" tabIndex={drawerOpen ? 0 : -1} onClick={() => audio.toggleMusic()}>
              <MusicIcon off={!music} size={15} />
              {music ? 'Música Ligada' : 'Ativar Música'}
            </button>
            <button type="button" className="btn btn--sm" tabIndex={drawerOpen ? 0 : -1} onClick={() => audio.toggleSfx()}>
              <SfxIcon off={!sfx} size={15} />
              {sfx ? 'Efeitos Ligados' : 'Ativar Efeitos'}
            </button>
            <button type="button" className="btn btn--sm" tabIndex={drawerOpen ? 0 : -1} onClick={toggleMotion}>
              {motion === 'reduced' ? 'Animações: Leve' : 'Animações: Completa'}
            </button>
          </div>
        </nav>
      </div>
    </>
  )
}
