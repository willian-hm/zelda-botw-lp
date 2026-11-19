import { KOROKS } from '../data/koroks'
import { scrollToTarget } from '../lib/gsap'
import { setState, toast, useStore } from '../lib/store'
import KorokSecret from '../components/KorokSecret'
import { ArrowIcon, CompassStarIcon } from '../components/Icons'
import './Footer.css'

export default function Footer() {
  const koroks = useStore((s) => s.koroks)
  const recipes = useStore((s) => s.recipes)
  const motion = useStore((s) => s.motion)

  const resetProgress = () => {
    setState({ koroks: [], recipes: [] })
    toast('Progresso de descobertas reiniciado.', { tone: 'sheikah' })
  }

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__crest" aria-hidden="true">
            <CompassStarIcon size={28} />
          </span>
          <div>
            <p className="display site-footer__title">HYRULE — The Wild Awaits</p>
            <p className="site-footer__note">
              <strong>Projeto conceitual de portfólio, independente e sem fins lucrativos</strong>, sem afiliação, patrocínio ou endosso da Nintendo. Todas as ilustrações, animações, simulações físicas, tipografia (licença SIL OFL) e trilha sonora procedural em Web Audio são criações originais produzidas para estudo de design e engenharia front-end.
            </p>
            <p className="site-footer__legal">
              Nomes, personagens e conceitos do universo <em>The Legend of Zelda: Breath of the Wild</em> são marcas e propriedades intelectuais da Nintendo Co., Ltd., referenciados apenas em caráter editorial de tributo não comercial.
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
