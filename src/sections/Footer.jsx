import { KOROKS } from '../data/koroks'
import { scrollToTarget } from '../lib/gsap'
import { setState, toast, useStore } from '../lib/store'
import KorokSecret from '../components/KorokSecret'
import { ArrowIcon, TriforceIcon } from '../components/Icons'
import './Footer.css'

export default function Footer() {
  const koroks = useStore((s) => s.koroks)
  const recipes = useStore((s) => s.recipes)
  const motion = useStore((s) => s.motion)

  const resetProgress = () => {
    setState({ koroks: [], recipes: [] })
    toast('Progresso de Koroks e receitas reiniciado.', { tone: 'sheikah' })
  }

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__crest" aria-hidden="true">
            <TriforceIcon size={28} />
          </span>
          <div>
            <p className="display site-footer__title">HYRULE — The Wild Awaits</p>
            <p className="site-footer__note">
              Projeto conceitual interativo inspirado em The Legend of Zelda: Breath of the Wild. Todos os personagens, universos e marcas pertencem à Nintendo.
            </p>
          </div>
        </div>

        <div className="site-footer__progress">
          <div className="footer-stat">
            <span>Koroks encontrados</span>
            <strong>
              {koroks.length} / {KOROKS.length}
            </strong>
          </div>
          <div className="footer-stat">
            <span>Receitas descobertas</span>
            <strong>{recipes.length}</strong>
          </div>
          <KorokSecret id="footer-stone" tone="dark" />
        </div>

        <div className="site-footer__bottom">
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => scrollToTarget('#inicio', { reduced: motion === 'reduced' })}
          >
            <ArrowIcon dir="up" size={14} />
            <span>Voltar ao Topo</span>
          </button>

          {(koroks.length > 0 || recipes.length > 0) && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={resetProgress}>
              Reiniciar Descobertas
            </button>
          )}
        </div>
      </div>
    </footer>
  )
}
