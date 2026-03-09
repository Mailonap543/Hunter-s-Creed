import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { 
  Hunter, 
  HunterSkill, 
  HuntLog, 
  BattleResult, 
  PlayerAction, 
  Mission,
  Hero,
  Monster,
  INITIAL_HUNTER,
  calculateTitle,
  calculateLevel,
  Region,
  SkillName,
  Difficulty,
  HEROES,
  MONSTERS,
  MISSIONS
} from '../models/hunter.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HunterService {
  private hunter$ = new BehaviorSubject<Hunter>(INITIAL_HUNTER);
  private skills$ = new BehaviorSubject<HunterSkill[]>([]);
  private logs$ = new BehaviorSubject<HuntLog[]>([]);
  private missions$ = new BehaviorSubject<Mission[]>(MISSIONS);
  private heroes$ = new BehaviorSubject<Hero[]>(HEROES);
  private monsters$ = new BehaviorSubject<Monster[]>(MONSTERS);

  constructor(private authService: AuthService) {
    this.initializeHunter();
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.loadHunterData();
      }
    });
  }

  private initializeHunter(): void {
    const savedHunter = localStorage.getItem('shadowCode_hunter');
    if (savedHunter) {
      this.hunter$.next(JSON.parse(savedHunter));
    }
  }

  private loadHunterData(): void {
    const savedHunter = localStorage.getItem('shadowCode_hunter');
    if (savedHunter) {
      this.hunter$.next(JSON.parse(savedHunter));
    }
  }

  getHunter(): Observable<Hunter> {
    return this.hunter$.asObservable();
  }

  getSkills(): Observable<HunterSkill[]> {
    return this.skills$.asObservable();
  }

  getLogs(): Observable<HuntLog[]> {
    return this.logs$.asObservable();
  }

  getMissions(): Observable<Mission[]> {
    return this.missions$.asObservable();
  }

  getAllMissions(): Mission[] {
    return this.missions$.value;
  }

  getHeroes(): Observable<Hero[]> {
    return this.heroes$.asObservable();
  }

  getAllHeroes(): Hero[] {
    return this.heroes$.value;
  }

  getMonsters(): Observable<Monster[]> {
    return this.monsters$.asObservable();
  }

  getAllMonsters(): Monster[] {
    return this.monsters$.value;
  }

  getMonstersByRegion(region: Region): Monster[] {
    return MONSTERS.filter(m => m.region === region || m.region === 'GLOBAL');
  }

  getMissionsByRegion(region: Region): Mission[] {
    return MISSIONS.filter(m => m.region === region).sort((a, b) => a.order - b.order);
  }

  getMissionById(id: string): Mission | undefined {
    return MISSIONS.find(m => m.id === id);
  }

  getCurrentMission(): Mission | undefined {
    const current = this.hunter$.value;
    return this.getMissionById(current.currentMissionId);
  }

  private saveHunter(): void {
    localStorage.setItem('shadowCode_hunter', JSON.stringify(this.hunter$.value));
  }

  setHero(heroId: string): void {
    const current = this.hunter$.value;
    this.hunter$.next({ ...current, heroId });
    this.saveHunter();
  }

  updateMapPosition(x: number, y: number): void {
    const current = this.hunter$.value;
    this.hunter$.next({ 
      ...current, 
      currentMapPosition: { x, y } 
    });
    this.saveHunter();
  }

  addXp(amount: number): void {
    const current = this.hunter$.value;
    const newXp = current.xp + amount;
    const newLevel = calculateLevel(newXp);
    const newTitle = calculateTitle(newLevel);
    
    this.hunter$.next({
      ...current,
      xp: newXp,
      level: newLevel,
      title: newTitle
    });
    this.saveHunter();
  }

  removeHeart(amount: number = 1): boolean {
    const current = this.hunter$.value;
    const newHearts = Math.max(0, current.hearts - amount);
    
    this.hunter$.next({
      ...current,
      hearts: newHearts
    });
    this.saveHunter();
    
    return newHearts > 0;
  }

  healHearts(amount: number): void {
    const current = this.hunter$.value;
    this.hunter$.next({
      ...current,
      hearts: Math.min(current.maxHearts, current.hearts + amount)
    });
    this.saveHunter();
  }

  useMana(amount: number): boolean {
    const current = this.hunter$.value;
    if (current.manaPoints >= amount) {
      this.hunter$.next({
        ...current,
        manaPoints: current.manaPoints - amount
      });
      this.saveHunter();
      return true;
    }
    return false;
  }

  restoreMana(): void {
    const current = this.hunter$.value;
    this.hunter$.next({
      ...current,
      manaPoints: current.maxManaPoints
    });
    this.saveHunter();
  }

  setRegion(region: Region): void {
    const current = this.hunter$.value;
    const missions = this.getMissionsByRegion(region);
    const firstMission = missions[0]?.id || '';
    
    this.hunter$.next({
      ...current,
      currentRegion: region,
      currentMissionId: firstMission
    });
    this.saveHunter();
  }

  completeMission(missionId: string): void {
    const current = this.hunter$.value;
    const region = current.currentRegion;
    const missions = this.getMissionsByRegion(region);
    const currentIndex = missions.findIndex(m => m.id === missionId);
    
    if (currentIndex >= 0 && currentIndex < missions.length - 1) {
      const nextMission = missions[currentIndex + 1];
      this.hunter$.next({
        ...current,
        currentMissionId: nextMission.id,
        monstersDefeated: current.monstersDefeated + 1
      });
    } else {
      this.hunter$.next({
        ...current,
        monstersDefeated: current.monstersDefeated + 1
      });
    }
    this.saveHunter();
  }

  resetHunter(): void {
    const user = this.authService.getCurrentUser();
    this.hunter$.next(INITIAL_HUNTER);
    this.saveHunter();
  }
}

@Injectable({
  providedIn: 'root'
})
export class GlitchWardenService {
  private systemPrompt = `Atue como o "The Glitch Warden", o mestre de um RPG de terror tecnológico inspirado em Supernatural e Folclore Japonês.

👤 Personalidade:
Sombrio, cínico, porém mentor. Você acredita que o código mal escrito é a brecha para demônios invadirem o mundo real. Use termos de caçador (sal, ferro frio, selos, ritos) misturados com termos de TI (deploy, bugs, runtime, injeção).

📋 Regras de Validação:
Analise o Input: O jogador enviará um texto ou uma transcrição de áudio.

Diferenciação de XP:
- Se a resposta for Escrita: Valide o acerto e conceda 10-15 XP.
- Se a resposta for Voz (Pronúncia): Seja rigoroso com a clareza. Se estiver correto e claro, conceda 25-35 XP.

Feedback de Erro: Nunca diga apenas "Errado". Explique o erro técnico ou linguístico com uma metáfora de terror.
Exemplo: "Você errou o @Service do Spring. Sem essa anotação, o servidor é uma casa sem sal nas portas; o demônio entrou. -1 Coração."

Sistema de Vida: O jogador começa com 5 corações. Cada erro retira 1. Ao chegar a 0, declare Game Over.

🌏 Contexto de Localização:
- Tokyo: Foco em Yokais, Angular, React, TypeScript e Japonês.
- New Orleans: Foco em Demônios, Java, Spring Boot e Inglês.
- Idiomas: Foco em aprendizado de línguas.

🛠️ Formato de Saída (JSON):
{
  "status": "success/fail",
  "feedback_narrativo": "Sua voz tremeu ao dizer...",
  "feedback_tecnico": "A resposta correta é...",
  "xp_ganho": 25,
  "coracoes_restantes": 4,
  "proximo_desafio": "O próximo monstro aparece...",
  "monster_defeated": true/false
}`;

  private regionPrompts: Record<Region, string> = {
    'NEW_ORLEANS': `Você está em New Orleans - The Bayou Code. Monstros baseados em lendas urbanas e Voodoo. O "Boss" final pode ser um código legado assombrado. O mentor IA se chama "S.A.M." (Systemic Automated Mentor). Foco: Java, Spring Boot, SQL, Inglês.`,
    'TOKYO': `Você está em Tokyo - Neon Spirits. Os Yokais (como o Kappa ou a Kuchisake-onna) aparecem em bairros como Shibuya. O mentor IA se chama "Kitsune-AI". Foco: Angular, React, TypeScript, Japonês.`,
    'GLOBAL': `Você está no Hub Central. Aqui você pode acessar ambas as regiões e verificar seu progresso.`
  };

  private idiomaPrompts: Record<string, string> = {
    'JPN': `Você é um professor de japonês paciente. Ensine o significado, a pronúncia correta (romaji) e quando usar cada frase. Use exemplos simples. O nome do jogador deve ser incluído na explicação.`,
    'ENG': `Você é um professor de inglês. Ensine gramática e vocabulário de forma clara. O nome do jogador deve ser incluído nos exemplos.`
  };

  async validateAnswer(action: PlayerAction): Promise<BattleResult> {
    const regionContext = this.regionPrompts[action.region];
    
    const prompt = `${this.systemPrompt}\n\n${regionContext}\n\nDesafio atual: ${action.topic}\nResposta esperada: ${action.expectedAnswer}\nResposta do jogador: ${action.answer}\nTipo de entrada: ${action.isVoiceInput ? 'Voz' : 'Escrita'}\nDificuldade: ${action.difficulty}`;

    const isCorrect = this.checkAnswer(action.answer, action.expectedAnswer);
    
    const xpBase = action.isVoiceInput ? 35 : 15;
    const xpGanha = isCorrect ? xpBase : 0;
    const heartsPerdidos = !isCorrect ? 1 : 0;
    const monsterDefeated = isCorrect;

    const monster = MONSTERS.find(m => m.id === action.monsterId);

    return {
      status: isCorrect ? 'success' : 'fail',
      feedbackNarrativo: isCorrect 
        ? this.getSuccessNarrative(action.region)
        : this.getErrorNarrative(action.topic, action.region),
      feedbackTecnico: isCorrect
        ? `✓ Correto! +${xpGanha} XP`
        : `✗ A resposta correta seria: ${action.expectedAnswer}`,
      xpGanha,
      coracoesRestantes: 5 - heartsPerdidos,
      proximoDesafio: monsterDefeated 
        ? this.getNextChallenge(action.region)
        : 'O monstro ainda está de pé! Tente novamente!',
      monsterDefeated
    };
  }

  private checkAnswer(answer: string, expected: string): boolean {
    const normalize = (s: string) => s.toLowerCase().trim()
      .replace(/\s+/g, ' ')
      .replace(/[.,!?]/g, '')
      .replace(/@/g, '')
      .replace(/[()]/g, '');
    
    const normalizedAnswer = normalize(answer);
    const normalizedExpected = normalize(expected);
    
    return normalizedAnswer.includes(normalizedExpected) || 
           normalizedExpected.includes(normalizedAnswer);
  }

  private getSuccessNarrative(region: Region): string {
    const narratives = {
      'NEW_ORLEANS': [
        'A área está limpa. Seus commits foram aceitos pelo destino.',
        'O demônio foi banido! New Orleans干杯!',
        'O Código Sombrio recua diante do seu conhecimento.',
        'O Bayou reconhece sua sabedoria, Caçador!'
      ],
      'TOKYO': [
        'O Yokai desaparece em fumaça. A área está segura.',
        'Seu código brilha como as luzes de Shibuya.',
        'A Kitsune-AI approve sua técnica!',
        'O véu de东京 se abre para você!'
      ],
      'GLOBAL': [
        'Checkpoint alcançado! Você recuperou 1 coração.',
        'A sessão foi um sucesso. O véu está seguro.'
      ]
    };
    const list = narratives[region];
    return list[Math.floor(Math.random() * list.length)];
  }

  private getErrorNarrative(topic: string, region: Region): string {
    const narratives = {
      'NEW_ORLEANS': [
        'Sinto muito... esse NullPointerException invocou um Ghoul. -1 Coração.',
        'O demônio avançou! Sem a anotação correta, seu código é uma casa sem sal.',
        'O Bayou consome seu erro. -1 Coração.'
      ],
      'TOKYO': [
        'Sua pronúncia ou resposta não convenceu o Yokai. -1 Coração.',
        'O Kappa bloqueou seu caminho! Tente novamente.',
        'O véu de Tokyo se fecha mais apertado. -1 Coração.'
      ],
      'GLOBAL': [
        'O erro ecoa pelo vazio digital. -1 Coração.',
        'A resposta está incorreta. O Glitch Warden observa você.'
      ]
    };
    const list = narratives[region];
    return list[Math.floor(Math.random() * list.length)];
  }

  private getNextChallenge(region: Region): string {
    const challenges = {
      'NEW_ORLEANS': [
        'Um novo desafio emerge do pântano...',
        'O próximo demônio já está à espreita...',
        'Prepare-se para a próxima masmorra!'
      ],
      'TOKYO': [
        'As luzes de Shibuya revelam um novo caminho...',
        'Outro Yokai apareceu em Tokyo!',
        'O próximo desafio está em Tokyo!'
      ],
      'GLOBAL': [
        'Escolha sua próxima missão!',
        'O portal se abre para novas arenas...'
      ]
    };
    const list = challenges[region];
    return list[Math.floor(Math.random() * list.length)];
  }

  getIntroNarrative(region: Region, username: string = 'Caçador'): string {
    const intros = {
      'NEW_ORLEANS': `Bem-vindo ao Bayou, ${username}! O código que você ignora hoje será o demônio que te caçará amanhã. Escolha sua arma: Java ou Spring Boot?`,
      'TOKYO': `Konnichiwa, ${username}! Os Yokais estão ativos em Shibuya. Prepare seu Angular e sua pronúncia. O que você vai enfrentar?`,
      'GLOBAL': `Bem-vindo ao submundo, ${username}! O código que você ignora hoje será o demônio que te caçará amanhã. Escolha sua arena: New Orleans, Tokyo, ou aprenda idiomas!`
    };
    return intros[region];
  }

  getLanguageTeaching(palavra: string, idioma: 'JPN' | 'ENG', playerName: string): string {
    const teachings: Record<string, Record<string, string>> = {
      'JPN': {
        'こんにちは': `Olá! "Konnichiwa" (こんにちは) é usado para cumprimentar durante o dia. ${playerName}-san, pratique dizendo: Konnichiwa, minna-san! (Olá a todos!)`,
        'すみません': `"Sumimasen" (すみません) significa "desculpe" ou "com licença". É muito importante no Japão! Use quando precisar de atenção de alguém.`,
        'ありがとう': `"Arigatou" (ありがとう) significa "obrigado". A forma mais educada é "Arigatou gozaimasu" (ありがとうございます).`,
        'はい': `"Hai" (はい) significa "sim". É importante responder com educação!`,
        'いいえ': `"Iie" (いいえ) significa "não". Use para negativas!`
      },
      'ENG': {
        'hello': `"Hello" é a forma mais comum de cumprimentar. ${playerName}, practice: Hello, how are you doing today?`,
        'thank you': `"Thank you" é o básico de gratidão. Para ser mais formal: Thank you very much!`,
        'sorry': `"Sorry" significa "desculpe". Muito útil para pedir desculpas!`,
        'yes': `"Yes" é a forma de affirmation. Use com confiança!`,
        'no': `"No" é a forma negativa. Aprenda a usar para recusar educadamente!`
      }
    };

    return teachings[idioma]?.[palavra.toLowerCase()] || 
      `Vamos aprender juntos, ${playerName}! Repetindo: ${palavra}. Muito bem!`;
  }
}
