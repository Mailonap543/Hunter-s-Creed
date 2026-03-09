export type HunterTitle = 'Curioso' | 'Iniciante' | 'Aprendiz' | 'Caçador' | 'Caçador Sênior' | 'Mestre Caçador' | 'Lendário' | 'Lenda Viva';
export type SkillName = 'JAVA' | 'ANGULAR' | 'SPRING' | 'REACT' | 'TYPESCRIPT' | 'NODE' | 'PYTHON' | 'JPN' | 'ENG' | 'SPA';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type Region = 'NEW_ORLEANS' | 'TOKYO' | 'GLOBAL';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface Hero {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  skills: string[];
  weapon: string;
  specialty: string;
  unlocked: boolean;
}

export interface Monster {
  id: string;
  name: string;
  type: 'YOKAI' | 'DEMON' | 'GHOST' | 'SPIRIT' | 'BUG';
  region: Region;
  difficulty: Difficulty;
  hp: number;
  xpReward: number;
  description: string;
  weakness: SkillName[];
}

export interface Hunter {
  id: string;
  userId: string;
  username: string;
  email?: string;
  heroId: string;
  xp: number;
  level: number;
  title: HunterTitle;
  hearts: number;
  maxHearts: number;
  manaPoints: number;
  maxManaPoints: number;
  currentRegion: Region;
  currentMapPosition: { x: number; y: number };
  monstersDefeated: number;
  currentMissionId: string;
  createdAt: Date;
}

export interface HunterSkill {
  id: string;
  hunterId: string;
  skillName: SkillName;
  skillPoints: number;
  currentDifficulty: Difficulty;
}

export interface HuntLog {
  id: string;
  hunterId: string;
  missionId: string;
  topic: string;
  region: Region;
  monsterId: string;
  errorDescription: string;
  playerAnswer: string;
  expectedAnswer: string;
  wasVoiceAttempt: boolean;
  isCorrect: boolean;
  xpEarned: number;
  heartsLost: number;
  feedbackNarrativo: string;
  feedbackTecnico: string;
  createdAt: Date;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  region: Region;
  skillName: SkillName;
  difficulty: Difficulty;
  xpReward: number;
  heartPenalty: number;
  voiceBonus: number;
  monsterId: string;
  questions: Question[];
  order: number;
}

export interface Question {
  id: string;
  question: string;
  expectedAnswer: string;
  hints: string[];
  codeSnippet?: string | null;
}

export interface BattleResult {
  status: 'success' | 'fail';
  feedbackNarrativo: string;
  feedbackTecnico: string;
  xpGanha: number;
  coracoesRestantes: number;
  proximoDesafio: string;
  monsterDefeated: boolean;
}

export interface PlayerAction {
  answer: string;
  expectedAnswer: string;
  isVoiceInput: boolean;
  difficulty: Difficulty;
  region: Region;
  topic: string;
  monsterId: string;
}

export const HEROES: Hero[] = [
  {
    id: 'hero_01',
    name: 'Code Knight',
    description: 'Um guerreiro que domina a espada do Java e o escudo do Spring.',
    icon: '⚔️',
    color: '#ff6b6b',
    skills: ['JAVA', 'SPRING'],
    weapon: 'Espada de Código',
    specialty: 'Combate corpo a corpo',
    unlocked: true
  },
  {
    id: 'hero_02',
    name: 'React Ranger',
    description: 'Arqueira ágil especializada em magia visual e componentes.',
    icon: '🏹',
    color: '#4ecdc4',
    skills: ['REACT', 'TYPESCRIPT'],
    weapon: 'Arco de Componentes',
    specialty: 'Ataques à distância',
    unlocked: true
  },
  {
    id: 'hero_03',
    name: 'Angular Ninja',
    description: 'Silencioso e mortal, domina as artes do routing e services.',
    icon: '🥷',
    color: '#a855f7',
    skills: ['ANGULAR', 'TYPESCRIPT'],
    weapon: 'Katanas duplas',
    specialty: 'Velocidade e precisão',
    unlocked: true
  },
  {
    id: 'hero_04',
    name: 'Node Shaman',
    description: 'Conecta o mundo físico com o digital através do backend.',
    icon: '🔮',
    color: '#22c55e',
    skills: ['NODE', 'PYTHON'],
    weapon: 'Cajado Místico',
    specialty: 'Magia de suporte',
    unlocked: false
  },
  {
    id: 'hero_05',
    name: 'FullStack Samurai',
    description: 'Mestre de todas as artes, equilibra frontend e backend.',
    icon: '🎌',
    color: '#f59e0b',
    skills: ['JAVA', 'ANGULAR', 'REACT', 'SPRING'],
    weapon: 'Katana Lendária',
    specialty: 'Versatilidade total',
    unlocked: false
  }
];

export const MONSTERS: Monster[] = [
  // New Orleans - Java/Spring
  { id: 'mon_01', name: 'NullPointer Ghoul', type: 'BUG', region: 'NEW_ORLEANS', difficulty: 'EASY', hp: 30, xpReward: 15, description: 'Um espírito que surge de referências nulas', weakness: ['JAVA'] },
  { id: 'mon_02', name: 'Spring Demon', type: 'DEMON', region: 'NEW_ORLEANS', difficulty: 'MEDIUM', hp: 50, xpReward: 30, description: 'Demônio que quebra Injeção de Dependência', weakness: ['SPRING'] },
  { id: 'mon_03', name: 'SQL Vampire', type: 'GHOST', region: 'NEW_ORLEANS', difficulty: 'MEDIUM', hp: 45, xpReward: 25, description: 'Extrai seus dados através de queries infinitas', weakness: ['JAVA'] },
  { id: 'mon_04', name: 'Legacy Poltergeist', type: 'SPIRIT', region: 'NEW_ORLEANS', difficulty: 'HARD', hp: 70, xpReward: 50, description: 'Código legado assombrado que não quer ser refatorado', weakness: ['SPRING', 'JAVA'] },
  { id: 'mon_05', name: 'Bayou Witch Doctor', type: 'DEMON', region: 'NEW_ORLEANS', difficulty: 'EXPERT', hp: 100, xpReward: 80, description: 'O boss final de New Orleans - código vodu', weakness: ['JAVA', 'SPRING', 'NODE'] },
  
  // Tokyo - Angular/React
  { id: 'mon_06', name: 'Tengu Scout', type: 'YOKAI', region: 'TOKYO', difficulty: 'EASY', hp: 25, xpReward: 15, description: 'Espião仙 que observa seus componentes', weakness: ['ANGULAR'] },
  { id: 'mon_07', name: 'Kitsune Mage', type: 'YOKAI', region: 'TOKYO', difficulty: 'MEDIUM', hp: 55, xpReward: 35, description: 'Raposa de nove caudas que distrai com ilusões', weakness: ['REACT'] },
  { id: 'mon_08', name: 'Kappa Stream', type: 'YOKAI', region: 'TOKYO', difficulty: 'MEDIUM', hp: 40, xpReward: 25, description: 'Espírito d\'água que corrompe streams', weakness: ['TYPESCRIPT'] },
  { id: 'mon_09', name: 'Oni Compiler', type: 'DEMON', region: 'TOKYO', difficulty: 'HARD', hp: 80, xpReward: 55, description: 'Demônio que compila código incorreto', weakness: ['ANGULAR', 'REACT'] },
  { id: 'mon_10', name: 'Jorōgumo Boss', type: 'YOKAI', region: 'TOKYO', difficulty: 'EXPERT', hp: 120, xpReward: 100, description: 'A spider queen de Shibuya - boss final', weakness: ['ANGULAR', 'REACT', 'TYPESCRIPT'] },

  // Idiomas
  { id: 'mon_11', name: 'Grammar Goblin', type: 'SPIRIT', region: 'GLOBAL', difficulty: 'EASY', hp: 20, xpReward: 10, description: 'Fada que bagunça sua gramática', weakness: ['ENG'] },
  { id: 'mon_12', name: 'Kanji Kraken', type: 'YOKAI', region: 'GLOBAL', difficulty: 'MEDIUM', hp: 45, xpReward: 25, description: 'Monstro marinho dos ideogramas japoneses', weakness: ['JPN'] }
];

export const MISSIONS: Mission[] = [
  // New Orleans - Java/Spring
  {
    id: 'mission_no_01',
    title: 'O Selo de Ferro',
    description: 'Aprenda o básico de Variáveis em Java para selar o primeiro portal.',
    region: 'NEW_ORLEANS',
    skillName: 'JAVA',
    difficulty: 'EASY',
    xpReward: 25,
    heartPenalty: 0,
    voiceBonus: 10,
    monsterId: 'mon_01',
    order: 1,
    questions: [
      { id: 'q1', question: 'O que é uma variável em Java?', expectedAnswer: 'espaço na memória para armazenar dados', hints: ['Pense em uma caixa...', 'Guarda valores'], codeSnippet: 'int x = 5;' },
      { id: 'q2', question: 'Qual o tipo para texto em Java?', expectedAnswer: 'String', hints: ['Com S maiúsculo', 'Usado para palavras'], codeSnippet: 'String nome = "Caçador";' }
    ]
  },
  {
    id: 'mission_no_02',
    title: 'A Masmorra Spring',
    description: 'Domine a Injeção de Dependência para atravessar a masmorra.',
    region: 'NEW_ORLEANS',
    skillName: 'SPRING',
    difficulty: 'MEDIUM',
    xpReward: 50,
    heartPenalty: 1,
    voiceBonus: 15,
    monsterId: 'mon_02',
    order: 2,
    questions: [
      { id: 'q1', question: 'Qual anotação cria um Bean em Spring?', expectedAnswer: '@Service', hints: ['Começa com @', 'Indica serviço'], codeSnippet: '@Service\npublic class...' },
      { id: 'q2', question: 'Como injetar um dependência?', expectedAnswer: '@Autowired', hints: ['Injeção automática', 'Sobre a propriedade'], codeSnippet: '@Autowired\nprivate Servicio service;' }
    ]
  },
  {
    id: 'mission_no_03',
    title: 'O Vampiro SQL',
    description: 'Derrote o Vampiro com queries corretas.',
    region: 'NEW_ORLEANS',
    skillName: 'JAVA',
    difficulty: 'MEDIUM',
    xpReward: 45,
    heartPenalty: 1,
    voiceBonus: 15,
    monsterId: 'mon_03',
    order: 3,
    questions: [
      { id: 'q1', question: 'Como buscar todos os registros em JPQL?', expectedAnswer: 'SELECT FROM', hints: ['Pega tudo', 'Sem where'], codeSnippet: 'SELECT u FROM Usuario u' },
      { id: 'q2', question: 'O que faz o @Entity?', expectedAnswer: 'mapeia para tabela', hints: ['Liga classe ao banco', 'Transforma em tabela'] }
    ]
  },
  {
    id: 'mission_no_04',
    title: 'O Espírito Legado',
    description: 'Refatore o código assombrado para descansar em paz.',
    region: 'NEW_ORLEANS',
    skillName: 'SPRING',
    difficulty: 'HARD',
    xpReward: 70,
    heartPenalty: 2,
    voiceBonus: 20,
    monsterId: 'mon_04',
    order: 4,
    questions: [
      { id: 'q1', question: 'O que é Dependency Injection?', expectedAnswer: 'injeção de dependência', hints: ['Inverter controle', 'Receber dependências'], codeSnippet: 'constructor(private service: Service)' },
      { id: 'q2', question: 'Qual a diferença entre @Component e @Service?', expectedAnswer: 'semântica', hints: ['Funcionam igual', 'Apenas convenção'] }
    ]
  },
  {
    id: 'mission_no_05',
    title: 'O Witch Doctor',
    description: 'Boss Final de New Orleans - Derrote o código vodu!',
    region: 'NEW_ORLEANS',
    skillName: 'JAVA',
    difficulty: 'EXPERT',
    xpReward: 100,
    heartPenalty: 3,
    voiceBonus: 30,
    monsterId: 'mon_05',
    order: 5,
    questions: [
      { id: 'q1', question: 'O que é Polimorfismo em Java?', expectedAnswer: 'múltiplas formas', hints: ['Uma classe, muitos comportamentos', 'Override'], codeSnippet: 'class Animal { void sound() {} }' },
      { id: 'q2', question: 'Qual a diferença entre Interface e Classe Abstrata?', expectedAnswer: 'pode ter implementação', hints: ['Abstract pode ter método concreto', 'Interface só contratos'] }
    ]
  },

  // Tokyo - Angular/React
  {
    id: 'mission_tk_01',
    title: 'O Portão Torii',
    description: 'Aprenda a diferença entre let, const e var.',
    region: 'TOKYO',
    skillName: 'ANGULAR',
    difficulty: 'EASY',
    xpReward: 25,
    heartPenalty: 0,
    voiceBonus: 10,
    monsterId: 'mon_06',
    order: 1,
    questions: [
      { id: 'q1', question: 'Qual a diferença entre let e const?', expectedAnswer: 'const não pode ser reatribuído', hints: ['const é constante', 'let muda'], codeSnippet: 'const x = 1;\nlet y = 2;' },
      { id: 'q2', question: 'O que acontece se tentar mudar um const?', expectedAnswer: 'erro', hints: ['TypeError', 'Não permite'] }
    ]
  },
  {
    id: 'mission_tk_02',
    title: 'A Mage Kitsune',
    description: 'Domine React Hooks para derrotar a mage raposa.',
    region: 'TOKYO',
    skillName: 'REACT',
    difficulty: 'MEDIUM',
    xpReward: 50,
    heartPenalty: 1,
    voiceBonus: 15,
    monsterId: 'mon_07',
    order: 2,
    questions: [
      { id: 'q1', question: 'Qual hookgerencia estado em React?', expectedAnswer: 'useState', hints: ['Começa com use', 'Para variáveis'], codeSnippet: 'const [count, setCount] = useState(0);' },
      { id: 'q2', question: 'Para que serve o useEffect?', expectedAnswer: 'efeitos colaterais', hints: ['Side effects', 'Quando algo muda'], codeSnippet: 'useEffect(() => {}, []);' }
    ]
  },
  {
    id: 'mission_tk_03',
    title: 'O Kappa Stream',
    description: 'Corrja streams e observables para atravessar o rio.',
    region: 'TOKYO',
    skillName: 'TYPESCRIPT',
    difficulty: 'MEDIUM',
    xpReward: 45,
    heartPenalty: 1,
    voiceBonus: 15,
    monsterId: 'mon_08',
    order: 3,
    questions: [
      { id: 'q1', question: 'O que é um Observable?', expectedAnswer: 'fluxo de dados', hints: ['Stream de valores', 'Pode ser assíncrono'], codeSnippet: 'new Observable(observer => {})' },
      { id: 'q2', question: 'Como cancelar uma subscription?', expectedAnswer: 'unsubscribe', hints: ['Desinscrever', 'cleanup'], codeSnippet: 'subscription.unsubscribe();' }
    ]
  },
  {
    id: 'mission_tk_04',
    title: 'O Oni Compiler',
    description: 'Derrote o demônio que compila código errado.',
    region: 'TOKYO',
    skillName: 'ANGULAR',
    difficulty: 'HARD',
    xpReward: 70,
    heartPenalty: 2,
    voiceBonus: 20,
    monsterId: 'mon_09',
    order: 4,
    questions: [
      { id: 'q1', question: 'Qual decorator cria um componente Angular?', expectedAnswer: '@Component', hints: ['Começa com @', 'Meta dados'], codeSnippet: '@Component({...})\nexport class...' },
      { id: 'q2', question: 'Para que serve o @Input?', expectedAnswer: 'dados vindos do pai', hints: ['Property binding', 'Pai para filho'], codeSnippet: '@Input() data: any;' }
    ]
  },
  {
    id: 'mission_tk_05',
    title: 'A Jorōgumo',
    description: 'Boss Final de Tokyo - A Rainha Aranha de Shibuya!',
    region: 'TOKYO',
    skillName: 'ANGULAR',
    difficulty: 'EXPERT',
    xpReward: 120,
    heartPenalty: 3,
    voiceBonus: 35,
    monsterId: 'mon_10',
    order: 5,
    questions: [
      { id: 'q1', question: 'O que é RxJS e para que serve?', expectedAnswer: 'programação reativa', hints: ['Reactive extensions', 'Manipula streams'], codeSnippet: 'import { of, map } from "rxjs";' },
      { id: 'q2', question: 'Explique o ciclo de vida ngOnInit', expectedAnswer: 'inicialização do componente', hints: ['Quando cria', 'Após construtor'], codeSnippet: 'ngOnInit() { ... }' }
    ]
  },

  // Idiomas - Japonês
  {
    id: 'mission_jpn_01',
    title: 'Primeiro Contato',
    description: 'Aprenda a cumprimentar no Japão.',
    region: 'TOKYO',
    skillName: 'JPN',
    difficulty: 'EASY',
    xpReward: 20,
    heartPenalty: 0,
    voiceBonus: 15,
    monsterId: 'mon_12',
    order: 1,
    questions: [
      { id: 'q1', question: 'Como se diz "Olá" em japonês?', expectedAnswer: 'こんにちは', hints: ['Kon-ni-chi-wa', 'Durante o dia'],       codeSnippet: undefined },
      { id: 'q2', question: 'Como se apresenta? "Eu sou [nome]"', expectedAnswer: ' 저는 [nome] 입니다', hints: ['Watashi wa... desu', 'Formol polite'], codeSnippet: null }
    ]
  },
  {
    id: 'mission_jpn_02',
    title: 'Números Japonês',
    description: 'Conte até 10 para negociar com os Yokais.',
    region: 'TOKYO',
    skillName: 'JPN',
    difficulty: 'EASY',
    xpReward: 25,
    heartPenalty: 0,
    voiceBonus: 15,
    monsterId: 'mon_12',
    order: 2,
    questions: [
      { id: 'q1', question: 'Como se diz "um" em japonês?', expectedAnswer: '一', hints: ['Ichi', 'O primeiro'],       codeSnippet: undefined },
      { id: 'q2', question: 'E "três"?', expectedAnswer: '三', hints: ['San', 'Depois de dois'], codeSnippet: null }
    ]
  },
  {
    id: 'mission_jpn_03',
    title: 'Pedindo Ajuda',
    description: 'Frases essenciais para sobreviver em Tokyo.',
    region: 'TOKYO',
    skillName: 'JPN',
    difficulty: 'MEDIUM',
    xpReward: 40,
    heartPenalty: 1,
    voiceBonus: 20,
    monsterId: 'mon_12',
    order: 3,
    questions: [
      { id: 'q1', question: 'Como dizer "Desculpe" em japonês?', expectedAnswer: 'すみません', hints: ['Su-mi-ma-sen', 'Formal'],       codeSnippet: undefined },
      { id: 'q2', question: 'Como perguntar "Onde fica...?"', expectedAnswer: '在哪里', hints: ['...wa doko desu ka', 'Locação'], codeSnippet: null }
    ]
  },

  // Idiomas - Inglês
  {
    id: 'mission_eng_01',
    title: 'Basic Greetings',
    description: 'Aprenda cumprimentos essenciais em inglês.',
    region: 'NEW_ORLEANS',
    skillName: 'ENG',
    difficulty: 'EASY',
    xpReward: 20,
    heartPenalty: 0,
    voiceBonus: 15,
    monsterId: 'mon_11',
    order: 1,
    questions: [
      { id: 'q1', question: 'Como dizer "Olá, tudo bem?" em inglês?', expectedAnswer: 'Hello, how are you?', hints: ['How are you', 'Cumprimento comum'],       codeSnippet: undefined },
      { id: 'q2', question: 'Resposta: "Eu estou bem, obrigado"', expectedAnswer: 'I am fine, thank you', hints: ['Fine, thank you', 'Resposta educada'], codeSnippet: null }
    ]
  },
  {
    id: 'mission_eng_02',
    title: 'Tech Vocabulary',
    description: 'Vocabulário técnico para caçadores.',
    region: 'NEW_ORLEANS',
    skillName: 'ENG',
    difficulty: 'MEDIUM',
    xpReward: 40,
    heartPenalty: 1,
    voiceBonus: 20,
    monsterId: 'mon_11',
    order: 2,
    questions: [
      { id: 'q1', question: 'O que é "debug" em inglês?', expectedAnswer: 'depurar', hints: ['Remover erros', 'Finding bugs'],       codeSnippet: undefined },
      { id: 'q2', question: 'O que significa "deploy"?', expectedAnswer: 'implantar', hints: ['Colocar em produção', 'Launch'], codeSnippet: null }
    ]
  }
];

export const INITIAL_HUNTER: Hunter = {
  id: '',
  userId: '',
  username: 'Caçador',
  heroId: 'hero_01',
  xp: 0,
  level: 1,
  title: 'Curioso',
  hearts: 5,
  maxHearts: 5,
  manaPoints: 100,
  maxManaPoints: 100,
  currentRegion: 'NEW_ORLEANS',
  currentMapPosition: { x: 100, y: 300 },
  monstersDefeated: 0,
  currentMissionId: 'mission_no_01',
  createdAt: new Date()
};

export const TITLE_THRESHOLDS: { title: HunterTitle; minLevel: number }[] = [
  { title: 'Curioso', minLevel: 0 },
  { title: 'Iniciante', minLevel: 5 },
  { title: 'Aprendiz', minLevel: 15 },
  { title: 'Caçador', minLevel: 30 },
  { title: 'Caçador Sênior', minLevel: 50 },
  { title: 'Mestre Caçador', minLevel: 70 },
  { title: 'Lendário', minLevel: 90 },
  { title: 'Lenda Viva', minLevel: 100 }
];

export function calculateTitle(level: number): HunterTitle {
  let title: HunterTitle = 'Curioso';
  for (const t of TITLE_THRESHOLDS) {
    if (level >= t.minLevel) {
      title = t.title;
    }
  }
  return title;
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}
