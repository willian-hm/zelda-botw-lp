# HYRULE — The Wild Awaits

Experiência digital cinematográfica e interativa inspirada em **The Legend of Zelda: Breath of the Wild**, construída com React, Vite, GSAP + ScrollTrigger, Canvas 2D e Web Audio API.

## Principais Experiências

- **Abertura Cinematográfica em Parallax**: composição multicamadas (`hero-sky` + tipografia monumental `HYRULE` atrás do horizonte + `hero-land` com Link no Grande Platô), partículas sutis de pólen, opção de cena em movimento e transição não-bloqueante.
- **História — Cinematic Scrollytelling**: 4 capítulos navegáveis por scroll ou barra de capítulos direta (*O Despertar*, *A Grande Calamidade* com transição de atmosfera e malícia rubra, *Os Quatro Campeões* com seletor interativo das Bestas Divinas e *O Destino de Hyrule*).
- **Guia do Aventureiro (Modo Pergaminho Claro)**: 4 categorias interativas (*Exploração* com roda de vigor, *Combate* com matriz elemental, *Sobrevivência & Culinária de Hyrule* com panela funcional e descoberta de receitas, e *Descobertas*), além do vídeo original carregado sob demanda.
- **Laboratório Sheikah**: simulações funcionais em Canvas 2D para **Stasis**, **Magnesis**, **Cryonis** e **Bombas Remotas** (esférica e cúbica), compatíveis com mouse, toque e teclado, mais registros em vídeo otimizados e módulos complementares (Câmera, Amiibo, Master Cycle Zero).
- **Galeria Cinematográfica de Personagens**: Link, Zelda, Mipha, Revali, Daruk, Urbosa e Calamidade Ganon com atmosferas cromáticas próprias e partículas ambientais dedicadas.
- **Mapa Estilizado de Hyrule**: cartografia artística interativa das 15 regiões com filtros de bioma, aproximação e opção de abrir o ZeldaMaps completo sob demanda.
- **Detalhes Especiais**: 7 Koroks escondidos pelo site, barra de progresso da aventura, controle independente de Música e SFX (Web Audio), cursor Sheikah em dispositivos com ponteiro preciso e suporte completo a `prefers-reduced-motion` / modo leve.

## Como Executar

```bash
npm install
npm run dev
```

## Build e Deploy (GitHub Pages)

```bash
npm run build
npm run preview
```

O projeto utiliza `base: './'` no `vite.config.js` e inclui workflow pronto em `.github/workflows/deploy.yml` para publicação automática no GitHub Pages.
