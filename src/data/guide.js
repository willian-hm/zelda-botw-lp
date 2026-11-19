import scene1 from '../assets/media/scene1-1600.webp'
import scene2 from '../assets/media/scene2-1600.webp'
import scene3 from '../assets/media/scene3-1600.webp'
import scene4 from '../assets/media/scene4-1600.webp'
import scene5 from '../assets/media/scene5-1600.webp'
import scene6 from '../assets/media/scene6-1600.webp'
import linkBow from '../assets/media/link-bow-386.webp'

export const GUIDE_TABS = [
  { id: 'exploracao', label: 'Exploração', numeral: '01' },
  { id: 'combate', label: 'Combate', numeral: '02' },
  { id: 'sobrevivencia', label: 'Sobrevivência & Culinária', numeral: '03' },
  { id: 'descobertas', label: 'Descobertas', numeral: '04' },
]

export const EXPLORATION_ITEMS = [
  {
    id: 'escalada',
    title: 'Escalada Livre & Vigor',
    tag: 'Terreno Vertical',
    summary:
      'Quase toda superfície em Hyrule pode ser escalada. Observe a inclinação da encosta, planeje pequenas saliências para recuperar o fôlego e evite escalar sob chuva forte.',
    staminaCost: 65,
    tip: 'Pular durante a escalada acelera a subida, mas consome muito mais vigor — reserve o salto para o último trecho antes do topo.',
    image: scene3,
    alt: 'Link no topo de um penhasco observando as montanhas e planícies de Hyrule',
  },
  {
    id: 'paraglider',
    title: 'Paraglider & Correntes Térmicas',
    tag: 'Liberdade Aérea',
    summary:
      'Dos cumes mais altos às torres Sheikah, o paraglider transforma altitude em alcance. Fogo na relva gera correntes ascendentes instantâneas para ganhar altura em segundos.',
    staminaCost: 42,
    tip: 'Atirar uma flecha de fogo na grama seca antes de saltar cria uma térmica improvisada mesmo longe de ventos naturais.',
    image: scene1,
    alt: 'Campos abertos de Hyrule com uma Silent Princess em primeiro plano',
  },
  {
    id: 'clima',
    title: 'Clima Dinâmico & Relâmpagos',
    tag: 'Ambiente Vivo',
    summary:
      'Tempestades elétricas atraem armas, escudos e arcos metálicos. O frio das montanhas e o calor extremo do deserto exigem roupas adequadas ou refeições preparadas.',
    staminaCost: 28,
    tip: 'Durante tempestades, equipe armas de madeira ou ancestrais — ou arremesse uma arma metálica perto de inimigos no instante do raio.',
    image: scene4,
    alt: 'Horizonte de Hyrule ao entardecer com nuvens e ruínas antigas',
  },
]

export const COMBAT_TACTICS = [
  {
    id: 'flurry',
    title: 'Esquiva Perfeita (Flurry Rush)',
    timing: 'No instante exato do golpe',
    description:
      'Saltar para o lado contra estocadas ou para trás contra golpes horizontais desacelera o tempo e abre uma sequência devastadora de ataques.',
    elements: 'Funciona contra quase todos os ataques corpo a corpo — inclusive Lynels.',
  },
  {
    id: 'parry',
    title: 'Defesa Perfeita (Parry)',
    timing: 'Quando o feixe pisca em azul',
    description:
      'Um golpe de escudo sincronizado desarma inimigos e reflete diretamente o laser dos Guardiões de volta contra seus próprios olhos.',
    elements: 'Não consome durabilidade do escudo quando executado no tempo perfeito.',
  },
  {
    id: 'elements',
    title: 'Química Elemental',
    timing: 'Sempre ativo no mundo',
    description:
      'O combate em Hyrule obedece às leis da natureza: gelo congela oponentes para ataques triplicados; eletricidade se propaga na água e desarma inimigos; fogo incendeia barris e relva.',
    elements: 'Fogo derrota Gelo instantaneamente · Gelo apaga Fogo · Raio domina Água e Metal.',
  },
]

export const COMBAT_VISUAL = {
  hero: linkBow,
  scene: scene5,
  altHero: 'Link mirando com arco em postura de combate',
  altScene: 'Ruínas antigas de Hyrule sob céu luminoso',
}

export const INGREDIENTS = [
  { id: 'apple', name: 'Maçã', tag: 'Fruta', color: '#D94F4F', hearts: 1, effect: null },
  { id: 'pepper', name: 'Pimenta Picante', tag: 'Aquecimento', color: '#E86A2C', hearts: 1, effect: 'cold' },
  { id: 'shroom', name: 'Cogumelo Hyliano', tag: 'Fungo', color: '#C69763', hearts: 1.5, effect: null },
  { id: 'radish', name: 'Rabanete Vigoroso', tag: 'Vigor Máx.', color: '#E6B951', hearts: 4, effect: 'hearty' },
  { id: 'chill', name: 'Erva Gélida', tag: 'Refrescante', color: '#58C4DD', hearts: 0.5, effect: 'heat' },
  { id: 'meat', name: 'Carne Crua', tag: 'Proteína', color: '#B8544A', hearts: 2.5, effect: null },
  { id: 'honey', name: 'Mel de Abelha', tag: 'Energia', color: '#E9B949', hearts: 2, effect: 'stamina' },
  { id: 'princess', name: 'Princesa Silenciosa', tag: 'Furtividade', color: '#78D6E4', hearts: 1, effect: 'stealth' },
  { id: 'bass', name: 'Robalo de Hyrule', tag: 'Peixe', color: '#4B8FB3', hearts: 2, effect: null },
  { id: 'screw', name: 'Peça Ancestral', tag: 'Sheikah', color: '#49C5CE', hearts: 0, effect: 'monster' },
]

export function cookIngredients(ids) {
  if (!ids.length) return null
  const items = ids.map((id) => INGREDIENTS.find((i) => i.id === id)).filter(Boolean)
  const hasMonster = items.some((i) => i.effect === 'monster')
  const hasFood = items.some((i) => i.effect !== 'monster')

  // Mixing ancient/monster parts with food yields Dubious Food (classic BotW!)
  if (hasMonster && hasFood) {
    return {
      id: 'dubious-food',
      name: 'Comida Duvidosa',
      hearts: 1,
      buff: 'Nenhum · Melhor não perguntar',
      buffColor: '#9A8899',
      description:
        'Misturar peças ancestrais com ingredientes frescos produziu algo... pixelado e suspeito. Ainda recupera um coração em emergências.',
      rarity: 'clássico',
    }
  }
  if (hasMonster && !hasFood) {
    return {
      id: 'rock-hard',
      name: 'Prato Duro como Pedra',
      hearts: 0.5,
      buff: 'Apenas para estômagos Goron',
      buffColor: '#8E7D6B',
      description:
        'Cozinhar engrenagens Sheikah sem criaturas medicinais rende uma refeição impossível de mastigar — mas curiosamente comestível.',
      rarity: 'inusitado',
    }
  }

  const effects = items.map((i) => i.effect).filter(Boolean)
  const uniqueEffects = [...new Set(effects)]
  const totalHearts = Math.min(20, Math.round(items.reduce((s, i) => s + i.hearts, 0) * 1.8))

  // Specific iconic recipes
  const has = (id) => ids.includes(id)
  if (has('apple') && has('honey') && !has('meat') && !has('bass')) {
    return {
      id: 'honeyed-apples',
      name: 'Maçãs Caramelizadas ao Mel',
      hearts: Math.max(4, totalHearts),
      buff: 'Restaura Vigor (+1 roda)',
      buffColor: '#E9B949',
      description: 'Maçãs assadas no mel silvestre de Hyrule — crocantes, aromáticas e ideais antes de longas escaladas.',
      rarity: 'especial',
    }
  }
  if (has('meat') && has('pepper')) {
    return {
      id: 'spicy-meat-skewer',
      name: 'Espetinho Picante das Montanhas',
      hearts: Math.max(5, totalHearts),
      buff: 'Resistência ao Frio · 06:30',
      buffColor: '#E86A2C',
      description: 'Carne grelhada na brasa com pimentas quentes. Essencial para explorar os picos congelados de Hebra e do Grande Platô.',
      rarity: 'essencial',
    }
  }
  if (has('bass') && has('chill')) {
    return {
      id: 'chilly-seafood',
      name: 'Robalo Refrescante do Oásis',
      hearts: Math.max(5, totalHearts),
      buff: 'Resistência ao Calor · 06:00',
      buffColor: '#58C4DD',
      description: 'Peixe preparado com ervas gélidas que aliviam até o sol escaldante do Deserto Gerudo.',
      rarity: 'especial',
    }
  }
  if (has('radish') && uniqueEffects.length === 1) {
    return {
      id: 'hearty-simmered',
      name: 'Cozido Vigoroso Dourado',
      hearts: 12,
      buff: 'Recuperação Total + Corações Extras',
      buffColor: '#E6B951',
      description: 'O prato favorito de qualquer viajante experiente: restaura toda a vitalidade e acrescenta corações dourados extras.',
      rarity: 'lendária',
    }
  }
  if (has('princess') && uniqueEffects.length === 1) {
    return {
      id: 'sneaky-steamed',
      name: 'Infusão da Princesa Silenciosa',
      hearts: Math.max(4, totalHearts),
      buff: 'Furtividade Elevada · 05:00',
      buffColor: '#78D6E4',
      description: 'Delicada refeição perfumada com a flor rara de Hyrule. Seus passos tornam-se quase inaudíveis na relva.',
      rarity: 'rara',
    }
  }
  if (has('shroom') && has('meat')) {
    return {
      id: 'meat-mushroom-skewer',
      name: 'Espetinho de Carne e Cogumelos',
      hearts: Math.max(5, totalHearts),
      buff: uniqueEffects.length === 1 ? effectLabel(uniqueEffects[0]) : 'Refeição Nutritiva',
      buffColor: '#C69763',
      description: 'O cheiro inconfundível de acampamentos ao entardecer em Hyrule. Simples, farto e reconfortante.',
      rarity: 'clássico',
    }
  }
  if (uniqueEffects.length > 1) {
    return {
      id: 'mixed-medley',
      name: 'Mistura Selvagem de Hyrule',
      hearts: Math.max(3, totalHearts),
      buff: 'Efeitos conflitantes cancelados',
      buffColor: '#748E69',
      description:
        'Dica de culinária: combinar efeitos diferentes na mesma panela anula os bônus elementais, mas o prato ainda recupera bastante energia!',
      rarity: 'dica',
    }
  }
  if (uniqueEffects.length === 1) {
    const eff = uniqueEffects[0]
    const titles = {
      cold: 'Sauté Picante do Viajante',
      heat: 'Refresco Herbal das Dunas',
      stamina: 'Doce Energético da Floresta',
      stealth: 'Salada Silenciosa do Crepúsculo',
      hearty: 'Prato Vigoroso da Planície',
    }
    return {
      id: `effect-${eff}`,
      name: titles[eff] || 'Prato do Aventureiro',
      hearts: Math.max(3, totalHearts),
      buff: effectLabel(eff),
      buffColor: items.find((i) => i.effect === eff)?.color || '#C8A96B',
      description: 'Ingredientes harmonizados com perfeição no fogo de acampamento, preservando todo o efeito natural.',
      rarity: 'equilibrada',
    }
  }
  return {
    id: 'simmered-feast',
    name: has('meat') ? 'Assado do Aventureiro' : has('bass') ? 'Peixe Grelhado na Brasa' : 'Frutas e Fungos Cozidos',
    hearts: Math.max(2, totalHearts),
    buff: 'Vitalidade Restaurada',
    buffColor: '#748E69',
    description: 'Preparo rústico e delicioso de beira de estrada — muito mais nutritivo do que comer ingredientes crus.',
    rarity: 'clássico',
  }
}

function effectLabel(eff) {
  return (
    {
      cold: 'Resistência ao Frio · 05:00',
      heat: 'Resistência ao Calor · 05:00',
      stamina: 'Restaura Vigor',
      stealth: 'Furtividade · 04:30',
      hearty: 'Vitalidade Total + Extras',
    }[eff] || 'Vitalidade'
  )
}

export const DISCOVERIES = [
  {
    id: 'santuarios',
    title: 'Santuários Ancestrais',
    count: '120 desafios',
    description:
      'Espalhados por todo o reino, testam lógica, combate e domínio das runas Sheikah. Cada Orbe Espiritual fortalece o coração ou o vigor de Link.',
    image: scene2,
    alt: 'Ruínas antigas rodeadas por flores brancas sob luz solar',
  },
  {
    id: 'koroks',
    title: 'Segredos dos Koroks',
    count: 'Escondidos por todo lado',
    description:
      'Círculos incompletos de pedras, cata-ventos solitários e folhas brilhantes escondem pequenos espíritos da floresta. Olhe com atenção — há 7 deles escondidos neste próprio site.',
    image: scene6,
    alt: 'Clareira arborizada de Hyrule repleta de ruínas e vegetação',
    linksToKoroks: true,
  },
  {
    id: 'memorias',
    title: 'Memórias Perdidas',
    count: 'Fragmentos de há 100 anos',
    description:
      'Fotografias preservadas na Pedra Sheikah revelam cenários exatos do passado. Reencontrar cada lugar devolve a Link a verdade sobre Zelda e os Campeões.',
    image: scene1,
    alt: 'Vale verdejante de Hyrule com o Castelo ao horizonte',
  },
]

export const GUIDE_VIDEO = {
  youtubeId: 'iJI34WIp6OA',
  title: 'Guia em Vídeo — Sobrevivência e Exploração em Breath of the Wild',
  poster: scene1,
}
