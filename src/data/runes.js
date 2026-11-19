import stasisMp4 from '../assets/media/rune-stasis.mp4'
import stasisPoster from '../assets/media/rune-stasis.jpg'
import magnesisMp4 from '../assets/media/rune-magnesis.mp4'
import magnesisPoster from '../assets/media/rune-magnesis.jpg'
import cryonisMp4 from '../assets/media/rune-cryonis.mp4'
import cryonisPoster from '../assets/media/rune-cryonis.jpg'
import bombMp4 from '../assets/media/rune-bomb.mp4'
import bombPoster from '../assets/media/rune-bomb.jpg'
import cameraImg from '../assets/media/rune-camera-736.webp'
import amiiboMp4 from '../assets/media/rune-amiibo.mp4'
import amiiboPoster from '../assets/media/rune-amiibo.jpg'
import motoMp4 from '../assets/media/rune-moto.mp4'
import motoPoster from '../assets/media/rune-moto.jpg'

export const LAB_RUNES = [
  {
    id: 'stasis',
    name: 'Stasis',
    jpTag: 'ESTASE TEMPORAL',
    accent: '#F0C84B',
    summary:
      'Interrompe o fluxo do tempo em um objeto. Enquanto congelado, cada impacto acumula energia cinética — liberada de uma só vez quando a runa expira.',
    controls: 'Clique/toque na esfera (ou Espaço) para congelar · Clique ou pressione Enter várias vezes para carregar impacto.',
    video: stasisMp4,
    poster: stasisPoster,
  },
  {
    id: 'magnesis',
    name: 'Magnesis',
    jpTag: 'CAMPO MAGNÉTICO',
    accent: '#E04D6B',
    summary:
      'Manipula objetos metálicos à distância por meio de um feixe eletromagnético Sheikah — ideal para atravessar abismos, mover baús e acionar mecanismos.',
    controls: 'Arraste o bloco metálico com mouse/toque (ou use as setas) até encaixá-lo no pedestal azul para ativar o selo.',
    video: magnesisMp4,
    poster: magnesisPoster,
  },
  {
    id: 'cryonis',
    name: 'Cryonis',
    jpTag: 'CRISTALIZAÇÃO',
    accent: '#7CE4FF',
    summary:
      'Ergue pilares sólidos de gelo instantaneamente sobre superfícies aquáticas. Permite criar pontes, abrir passagem ou elevar estruturas submersas.',
    controls: 'Clique/toque na água (ou setas + Espaço) para erguer até 3 pilares · Clique em um pilar existente para estilhaçá-lo.',
    video: cryonisMp4,
    poster: cryonisPoster,
  },
  {
    id: 'bombs',
    name: 'Bombas Remotas',
    jpTag: 'CARGA DE ÉTER',
    accent: '#49C5CE',
    summary:
      'Materializa cargas de energia ancestral em formato esférico (rola em declives) ou cúbico (permanece imóvel), detonadas à distância quando desejar.',
    controls: 'Escolha Esférica ou Cúbica · Clique na arena para lançar (ou Espaço) · Detone com o botão ou tecla D.',
    video: bombMp4,
    poster: bombPoster,
  },
]

export const EXTRA_RUNES = [
  {
    id: 'camera',
    name: 'Câmera Sheikah',
    tag: 'Registro de Campo',
    description:
      'Cataloga criaturas, armas, materiais e monstros no Compêndio de Hyrule, além de registrar paisagens das memórias perdidas.',
    image: cameraImg,
    alt: 'Link utilizando a runa Câmera da Pedra Sheikah',
  },
  {
    id: 'amiibo',
    name: 'Amiibo',
    tag: 'Invocação Especial',
    description:
      'Permite invocar suprimentos, baús misteriosos e equipamentos lendários inspirados em outras eras da saga Zelda.',
    video: amiiboMp4,
    poster: amiiboPoster,
    alt: 'Demonstração da runa Amiibo invocando suprimentos em Hyrule',
  },
  {
    id: 'moto',
    name: 'Master Cycle Zero',
    tag: 'Relíquia da DLC',
    description:
      'A Besta Divina pessoal do herói: uma relíquia mecânica movida a materiais ancestrais para cruzar planícies e trilhas em alta velocidade.',
    video: motoMp4,
    poster: motoPoster,
    alt: 'Link pilotando a Master Cycle Zero pelas planícies de Hyrule',
  },
]
