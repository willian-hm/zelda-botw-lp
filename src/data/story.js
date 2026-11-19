import awakening960 from '../assets/media/ch-awakening-960.webp'
import awakening1920 from '../assets/media/ch-awakening-1920.webp'
import awakeningRunMp4 from '../assets/media/awakening-run.mp4'
import awakeningRunPoster from '../assets/media/awakening-run.jpg'

import calamity960 from '../assets/media/ch-calamity-960.webp'
import calamity1920 from '../assets/media/ch-calamity-1920.webp'

import champions960 from '../assets/media/ch-champions-960.webp'
import champions1920 from '../assets/media/ch-champions-1920.webp'

import destiny960 from '../assets/media/ch-destiny-960.webp'
import destiny1920 from '../assets/media/ch-destiny-1920.webp'

export const CHAPTERS = [
  {
    id: 'despertar',
    numeral: 'I',
    eyebrow: 'Capítulo I · O Santuário da Ressurreição',
    title: 'O Despertar',
    subtitle: 'Cem anos de silêncio encerrados por uma única voz.',
    quote: '“Abra os olhos... Desperte, Link.”',
    body: 'Após um sono de cem anos nas profundezas do Santuário da Ressurreição, Link desperta sem memórias de quem foi ou do reino que jurou proteger. Guiado por uma voz familiar e armado apenas com a Pedra Sheikah, ele caminha em direção à luz da manhã — e descobre uma Hyrule selvagem, silenciosa e tomada pela natureza.',
    detail:
      'No alto do Grande Platô, ruínas cobertas de musgo contam a história de uma civilização interrompida. O vento sopra livre pelas planícies, anunciando que a jornada recomeçou.',
    atmosphere: 'awakening',
    media: {
      src: awakening960,
      srcSet: `${awakening960} 960w, ${awakening1920} 1920w`,
      alt: 'Link despertando no Santuário da Ressurreição iluminado pela luz azul Sheikah',
      video: awakeningRunMp4,
      videoPoster: awakeningRunPoster,
    },
    meta: [
      { label: 'Era', value: '100 anos depois' },
      { label: 'Local', value: 'Grande Platô' },
      { label: 'Relíquia', value: 'Pedra Sheikah' },
    ],
  },
  {
    id: 'calamidade',
    numeral: 'II',
    eyebrow: 'Capítulo II · A Queda do Reino',
    title: 'A Grande Calamidade',
    subtitle: 'Quando a esperança ancestral se voltou contra Hyrule.',
    quote: '“A sombra emergiu sob o Castelo, corrompendo tudo o que criamos para detê-la.”',
    body: 'Um século antes do despertar de Link, Hyrule escavou os Guardiões e as quatro Bestas Divinas — maravilhas tecnológicas forjadas pelos antigos Sheikah para selar o mal. Contudo, a Calamidade Ganon antecipou o plano: irrompendo em ondas de Malícia rubra, corrompeu as máquinas e voltou a defesa do reino contra seu próprio povo.',
    detail:
      'O Castelo de Hyrule caiu sob um céu escarlate. Os quatro Campeões tombaram dentro de suas Bestas, Link foi ferido à beira da morte e a Princesa Zelda conteve a Calamidade sozinha por cem anos.',
    atmosphere: 'calamity',
    media: {
      src: calamity960,
      srcSet: `${calamity960} 960w, ${calamity1920} 1920w`,
      alt: 'Princesa Zelda observando o Castelo de Hyrule envolvido pela Calamidade Ganon sob um céu carmesim',
    },
    meta: [
      { label: 'Ameaça', value: 'Malícia Ancestral' },
      { label: 'Epicentro', value: 'Castelo de Hyrule' },
      { label: 'Consequência', value: 'Queda dos Guardiões' },
    ],
  },
  {
    id: 'campeoes',
    numeral: 'III',
    eyebrow: 'Capítulo III · Os Quatro Cantos do Reino',
    title: 'Os Quatro Campeões',
    subtitle: 'Espíritos presos que aguardam o retorno do herói.',
    quote: '“Liberte as Bestas Divinas e nossas preces ecoarão novamente sobre o castelo.”',
    body: 'Para enfrentar Ganon em igualdade, Link precisa atravessar mares, vulcões, céus gelados e tempestades de areia para apaziguar as quatro Bestas Divinas, dominadas pelos espectros da Calamidade. A cada máquina purificada, o espírito de um Campeão é libertado e mira seu raio ancestral contra o coração de Hyrule.',
    detail:
      'Unidos além do tempo, Zora, Goron, Rito e Gerudo emprestam suas dádivas ao herói — prova de que o legado de Hyrule jamais se apagou.',
    atmosphere: 'champions',
    media: {
      src: champions960,
      srcSet: `${champions960} 960w, ${champions1920} 1920w`,
      alt: 'As quatro Bestas Divinas: Vah Ruta, Vah Rudania, Vah Medoh e Vah Naboris',
    },
    beasts: [
      {
        name: 'Vah Ruta',
        champion: 'Mipha',
        region: 'Domínio Zora',
        element: 'Água',
        color: '#49C5CE',
        summary: 'Colosso anfíbio que despejava chuvas incessantes sobre o reservatório oriental de Lanayru.',
      },
      {
        name: 'Vah Rudania',
        champion: 'Daruk',
        region: 'Montanha da Morte',
        element: 'Fogo',
        color: '#FF7A2F',
        summary: 'Colosso vulcânico que provocava erupções e chuvas de magma ao redor da Cidade Goron.',
      },
      {
        name: 'Vah Medoh',
        champion: 'Revali',
        region: 'Vila Rito',
        element: 'Vento',
        color: '#7EB6FF',
        summary: 'Fortaleza alada que dominava os céus gelados de Tabantha com barreiras de vento cortante.',
      },
      {
        name: 'Vah Naboris',
        champion: 'Urbosa',
        region: 'Deserto Gerudo',
        element: 'Relâmpago',
        color: '#E6C25A',
        summary: 'Gigante das dunas envolto por tempestades de areia e descargas elétricas no Deserto Gerudo.',
      },
    ],
    meta: [
      { label: 'Bestas Divinas', value: '4 Colossos Sheikah' },
      { label: 'Povos', value: 'Zora · Goron · Rito · Gerudo' },
      { label: 'Propósito', value: 'Purificação e Aliança' },
    ],
  },
  {
    id: 'destino',
    numeral: 'IV',
    eyebrow: 'Capítulo IV · A Luz que Rompe a Noite',
    title: 'O Destino de Hyrule',
    subtitle: 'A Espada que Sela a Escuridão encontra o poder da luz.',
    quote: '“Coragem não precisa ser lembrada — pois jamais é esquecida.”',
    body: 'No salão arruinado do Castelo de Hyrule, Link empunha a Espada Mestra diante da forma corrompida da Calamidade. Quando os quatro raios das Bestas Divinas rasgam o horizonte e o selo de Zelda enfim se abre em luz dourada, o confronto final decide se o reino permanecerá nas cinzas ou renascerá sob o sol.',
    detail:
      'Das ruínas nasce um novo amanhecer: uma Hyrule pronta para ser reconstruída, livre da sombra que a aprisionou por um século.',
    atmosphere: 'destiny',
    media: {
      src: destiny960,
      srcSet: `${destiny960} 960w, ${destiny1920} 1920w`,
      alt: 'Link empunhando a Espada Mestra no confronto final contra Calamidade Ganon no Castelo de Hyrule',
    },
    meta: [
      { label: 'Lâmina', value: 'Espada Mestra' },
      { label: 'Aliança', value: 'Luz e Coragem' },
      { label: 'Desfecho', value: 'Um Novo Amanhecer' },
    ],
  },
]
