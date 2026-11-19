export const LAB_RUNES = [
  {
    id: 'stasis',
    name: 'Stasis',
    jpTag: 'ESTASE TEMPORAL',
    accent: '#F0C84B',
    summary:
      'Interrompe o fluxo do tempo em um objeto. Enquanto congelado, cada impacto acumula energia cinética — liberada de uma só vez quando a runa expira.',
    controls: 'Clique/toque na esfera (ou Espaço) para congelar · Clique ou pressione Enter várias vezes para carregar impacto.',
    specs: [
      { label: 'Princípio', value: 'Bloqueio inercial temporário' },
      { label: 'Acúmulo', value: 'Vetor cinético até 6 impactos' },
      { label: 'Duração', value: '4,5 segundos por ciclo' },
    ],
  },
  {
    id: 'magnesis',
    name: 'Magnesis',
    jpTag: 'CAMPO MAGNÉTICO',
    accent: '#E04D6B',
    summary:
      'Manipula objetos metálicos à distância por meio de um feixe eletromagnético ancestral — ideal para atravessar abismos, mover baús e acionar mecanismos.',
    controls: 'Arraste o bloco metálico com mouse/toque (ou use as setas) até encaixá-lo no pedestal azul para ativar o selo.',
    specs: [
      { label: 'Alvo', value: 'Ligas ferrosas e blocos metálicos' },
      { label: 'Controle', value: 'Arraste livre ou setas do teclado' },
      { label: 'Objetivo', value: 'Ativar o pedestal de pressão' },
    ],
  },
  {
    id: 'cryonis',
    name: 'Cryonis',
    jpTag: 'CRISTALIZAÇÃO',
    accent: '#7CE4FF',
    summary:
      'Ergue pilares sólidos de gelo instantaneamente sobre superfícies aquáticas. Permite criar pontes, abrir passagem ou elevar estruturas submersas.',
    controls: 'Clique/toque na água (ou botão Erguer Pilar) para criar até 3 pilares · Clique em um pilar existente para estilhaçá-lo.',
    specs: [
      { label: 'Superfície', value: 'Qualquer corpo d’água navegável' },
      { label: 'Limite', value: 'Até 3 pilares simultâneos' },
      { label: 'Bônus', value: 'Ergue o baú flutuante sobre o pilar' },
    ],
  },
  {
    id: 'bombs',
    name: 'Bombas Remotas',
    jpTag: 'CARGA DE ÉTER',
    accent: '#49C5CE',
    summary:
      'Materializa cargas de energia ancestral em formato esférico (rola em declives) ou cúbico (permanece imóvel), detonadas à distância quando desejar.',
    controls: 'Escolha Esférica ou Cúbica · Clique na arena para lançar (ou Espaço) · Detone com o botão ou tecla D.',
    specs: [
      { label: 'Esférica', value: 'Rola em declives por gravidade' },
      { label: 'Cúbica', value: 'Fixação estável em rampas' },
      { label: 'Impacto', value: 'Onda radial de 165 u. sobre blocos' },
    ],
  },
]

export const EXTRA_RUNES = [
  {
    id: 'camera',
    name: 'Câmera Ancestral',
    tag: 'Registro de Campo',
    accent: '#49C5CE',
    actionLabel: 'Testar Disparo',
    feedback: 'Registro salvo no Compêndio de Campo!',
    description:
      'Cataloga flora, fauna, relíquias e cenários históricos de Hyrule, auxiliando na reconstrução das memórias perdidas.',
  },
  {
    id: 'relic',
    name: 'Invocação Rúnica',
    tag: 'Sinal de Ressonância',
    accent: '#C8A96B',
    actionLabel: 'Emitir Pulso',
    feedback: 'Sinal ressonante emitido na câmara!',
    description:
      'Módulo cerimonial capaz de materializar suprimentos raros e ecos antigos de eras passadas por meio de ressonância rúnica.',
  },
  {
    id: 'cycle',
    name: 'Relíquia Veloz',
    tag: 'Propulsão Ancestral',
    accent: '#7CE4FF',
    actionLabel: 'Acelerar Núcleo',
    feedback: 'Núcleo ancestral em potência máxima!',
    description:
      'Mecanismo pessoal de deslocamento movido a energia ancestral para cruzar planícies, colinas e trilhas em alta velocidade.',
  },
]
