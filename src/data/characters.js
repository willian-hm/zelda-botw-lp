import link640 from '../assets/media/char-link-640.webp'
import link1200 from '../assets/media/char-link-1200.webp'
import zelda640 from '../assets/media/char-zelda-640.webp'
import zelda1200 from '../assets/media/char-zelda-1200.webp'
import mipha640 from '../assets/media/char-mipha-640.webp'
import mipha1200 from '../assets/media/char-mipha-1200.webp'
import revali640 from '../assets/media/char-revali-640.webp'
import revali1200 from '../assets/media/char-revali-1200.webp'
import daruk640 from '../assets/media/char-daruk-640.webp'
import daruk1200 from '../assets/media/char-daruk-1200.webp'
import urbosa640 from '../assets/media/char-urbosa-640.webp'
import urbosa1200 from '../assets/media/char-urbosa-1200.webp'
import ganon640 from '../assets/media/char-ganon-640.webp'
import ganon1200 from '../assets/media/char-ganon-1200.webp'

export const CHARACTERS = [
  {
    id: 'link',
    name: 'Link',
    role: 'O Campeão Hyliano',
    race: 'Hyliano',
    affiliation: 'Portador da Espada Mestra',
    blessing: 'Coragem Silenciosa',
    quote: 'O silêncio de quem carrega o destino de um reino inteiro nos ombros.',
    bio: 'Escolhido pela Espada que Sela a Escuridão, Link era o cavaleiro pessoal da Princesa Zelda antes da Grande Calamidade. Após cem anos em repouso no Santuário da Ressurreição, ele percorre cada vale e montanha de Hyrule para recuperar suas memórias e restaurar a paz.',
    effect: 'leaves',
    palette: {
      bg: '#10212b',
      bgAccent: '#1c3b4a',
      accent: '#49C5CE',
      secondary: '#9AC78A',
      glow: 'rgba(73, 197, 206, 0.35)',
    },
    image: {
      src: link640,
      srcSet: `${link640} 640w, ${link1200} 1200w`,
      alt: 'Link, o herói de Hyrule pronto para a aventura',
    },
  },
  {
    id: 'zelda',
    name: 'Zelda',
    role: 'Princesa de Hyrule',
    race: 'Hyliana',
    affiliation: 'Família Real de Hyrule',
    blessing: 'Poder Sagrado da Luz',
    quote: 'Por cem anos ela conteve a escuridão sozinha, aguardando o retorno do herói.',
    bio: 'Estudiosa incansável da tecnologia ancestral Sheikah e herdeira do sangue da deusa, Zelda lutou contra a dúvida e o peso do dever até despertar seu verdadeiro poder sagrado no momento mais sombrio do reino — selando Ganon no coração do castelo até que Link estivesse pronto.',
    effect: 'light',
    palette: {
      bg: '#1c1912',
      bgAccent: '#362d1a',
      accent: '#E9C46A',
      secondary: '#FFF1C1',
      glow: 'rgba(233, 196, 106, 0.38)',
    },
    image: {
      src: zelda640,
      srcSet: `${zelda640} 640w, ${zelda1200} 1200w`,
      alt: 'Princesa Zelda de Hyrule com vestes azuis dos Campeões',
    },
  },
  {
    id: 'mipha',
    name: 'Mipha',
    role: 'Campeã Zora · Vah Ruta',
    race: 'Zora',
    affiliation: 'Domínio Zora',
    blessing: 'Graça de Mipha',
    quote: '“É um prazer ajudar. Sempre estarei aqui para curar suas feridas.”',
    bio: 'Princesa serena e habilidosa com o Tridente da Escama de Luz, Mipha possuía o raro dom da cura. Sua devoção silenciosa a Link e ao povo das águas vive na Graça de Mipha, capaz de restaurar a vida do herói mesmo diante da derrota iminente.',
    effect: 'water',
    palette: {
      bg: '#0d1e29',
      bgAccent: '#16384d',
      accent: '#5ED7EE',
      secondary: '#D8465C',
      glow: 'rgba(94, 215, 238, 0.36)',
    },
    image: {
      src: mipha640,
      srcSet: `${mipha640} 640w, ${mipha1200} 1200w`,
      alt: 'Mipha, Princesa Zora e Campeã da Besta Divina Vah Ruta',
    },
  },
  {
    id: 'revali',
    name: 'Revali',
    role: 'Campeão Rito · Vah Medoh',
    race: 'Rito',
    affiliation: 'Vila Rito · Tabantha',
    blessing: 'Vendaval de Revali',
    quote: '“O céu pertence a quem ousa criar seus próprios ventos.”',
    bio: 'Mestre arqueiro de precisão incomparável e orgulho indomável, Revali treinou incansavelmente até criar sua própria corrente ascendente. Apesar da rivalidade declarada com Link, sua bravura nos céus de Tabantha garantiu que a liberdade dos ventos jamais fosse calada.',
    effect: 'wind',
    palette: {
      bg: '#10192b',
      bgAccent: '#1f3052',
      accent: '#8CC4FF',
      secondary: '#B9F0D9',
      glow: 'rgba(140, 196, 255, 0.34)',
    },
    image: {
      src: revali640,
      srcSet: `${revali640} 640w, ${revali1200} 1200w`,
      alt: 'Revali, Campeão Rito com seu Grande Arco da Águia',
    },
  },
  {
    id: 'daruk',
    name: 'Daruk',
    role: 'Campeão Goron · Vah Rudania',
    race: 'Goron',
    affiliation: 'Cidade Goron · Eldin',
    blessing: 'Proteção de Daruk',
    quote: '“Deixe comigo, amigão! Nenhuma rocha ou golpe vai derrubar você.”',
    bio: 'Guerreiro colossal de coração tão caloroso quanto a lava da Montanha da Morte, Daruk empunhava o Quebra-Pedras com leveza surpreendente. Leal até o fim, sua barreira escarlate defende Link de qualquer impacto como um escudo inabalável.',
    effect: 'embers',
    palette: {
      bg: '#1f120d',
      bgAccent: '#3d1e12',
      accent: '#FF883E',
      secondary: '#F5C16C',
      glow: 'rgba(255, 136, 62, 0.38)',
    },
    image: {
      src: daruk640,
      srcSet: `${daruk640} 640w, ${daruk1200} 1200w`,
      alt: 'Daruk, o imponente Campeão Goron da Montanha da Morte',
    },
  },
  {
    id: 'urbosa',
    name: 'Urbosa',
    role: 'Campeã Gerudo · Vah Naboris',
    race: 'Gerudo',
    affiliation: 'Cidade Gerudo · Deserto',
    blessing: 'Fúria de Urbosa',
    quote: '“Mostre a essa Calamidade que o espírito de Hyrule ainda arde em relâmpagos.”',
    bio: 'Líder destemida do deserto e amiga íntima da mãe de Zelda, Urbosa unia sabedoria maternal a uma ferocidade elétrica em combate. Com um único estalar de dedos, invocava tempestades capazes de fulminar hordas inteiras sob as areias douradas.',
    effect: 'lightning',
    palette: {
      bg: '#1d170c',
      bgAccent: '#382a12',
      accent: '#F5D05A',
      secondary: '#D9933B',
      glow: 'rgba(245, 208, 90, 0.38)',
    },
    image: {
      src: urbosa640,
      srcSet: `${urbosa640} 640w, ${urbosa1200} 1200w`,
      alt: 'Urbosa, líder e Campeã Gerudo empunhando sua cimitarra e escudo',
    },
  },
  {
    id: 'ganon',
    name: 'Calamidade Ganon',
    role: 'O Mal Ancestral',
    race: 'Malícia Encarnada',
    affiliation: 'Castelo de Hyrule (Corrompido)',
    blessing: 'Aura de Malícia',
    quote: 'Ódio puro nascido de eras esquecidas, decidido a devorar a luz do reino.',
    bio: 'Mais do que um soberano sombrio, a Calamidade Ganon é uma força cataclísmica que retorna através das eras. Envolto em espirais de Malícia carmesim, ele corrompeu a tecnologia Sheikah e mantém o Castelo de Hyrule sob cerco eterno, à espera do confronto decisivo.',
    effect: 'malice',
    palette: {
      bg: '#14060a',
      bgAccent: '#330816',
      accent: '#E02854',
      secondary: '#FF7096',
      glow: 'rgba(224, 40, 84, 0.45)',
    },
    image: {
      src: ganon640,
      srcSet: `${ganon640} 640w, ${ganon1200} 1200w`,
      alt: 'Calamidade Ganon envolvendo o Castelo de Hyrule em espirais de Malícia vermelha',
    },
  },
]
