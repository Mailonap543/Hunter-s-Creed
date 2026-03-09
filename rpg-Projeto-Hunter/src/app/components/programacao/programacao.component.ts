import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HunterService, GlitchWardenService } from '../../services/hunter.service';
import { VoiceService } from '../../services/voice.service';
import { Hunter, Mission, Monster, SkillName } from '../../models/hunter.model';

@Component({
  selector: 'app-programacao',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="programacao-container">
      <div class="background-effects">
        <div class="particles"></div>
      </div>

      <header class="header">
        <button class="back-btn" (click)="goBack()">← Voltar</button>
        <h1>💻 Academia de Programação</h1>
        <div class="voice-btn" (click)="speakIntro()">🎤 Ouvir</div>
      </header>

      <main class="content">
        <div class="skill-selection">
          <h2>Escolha a Tecnologia</h2>
          
          <div class="skill-cards">
            <div 
              *ngFor="let skill of programmingSkills"
              class="skill-card"
              [class.selected]="selectedSkill === skill.id"
              [style.--skill-color]="skill.color"
              (click)="selectSkill(skill)">
              <div class="skill-icon">{{ skill.icon }}</div>
              <h3>{{ skill.name }}</h3>
              <p>{{ skill.description }}</p>
              <div class="skill-stats">
                <span>Missions: {{ getMissionCount(skill.id) }}</span>
                <span>Dificuldade: {{ skill.difficulty }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="missions-section" *ngIf="selectedSkill">
          <h2>{{ getSkillName() }} - Missões</h2>
          
          <div class="missions-grid">
            <div 
              *ngFor="let mission of getMissions()"
              class="mission-card"
              [class.completed]="mission.completed"
              [style.--monster-color]="getMonsterColor(mission)">
              
              <div class="mission-header">
                <span class="mission-order">#{{ mission.order }}</span>
                <span class="mission-difficulty" [class]="mission.difficulty.toLowerCase()">
                  {{ mission.difficulty }}
                </span>
              </div>

              <div class="mission-content">
                <h3>{{ mission.title }}</h3>
                <p>{{ mission.description }}</p>
                
                <div class="monster-preview">
                  <span class="monster-icon">{{ getMonsterIcon(mission.monsterId) }}</span>
                  <span class="monster-name">{{ getMonsterName(mission.monsterId) }}</span>
                </div>
              </div>

              <div class="mission-footer">
                <span class="xp-reward">+{{ mission.xpReward }} XP</span>
                <button 
                  class="start-btn"
                  [disabled]="mission.locked"
                  (click)="startMission(mission)">
                  {{ mission.completed ? 'Repetir' : 'Iniciar' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="battle-section" *ngIf="showBattle">
          <div class="battle-arena">
            <div class="player-side">
              <div class="player-avatar">{{ playerHero?.icon || '⚔️' }}</div>
              <div class="player-info">
                <h3>{{ hunter.username }}</h3>
                <div class="hearts">❤️{{ '❤️'.repeat(hunter.hearts) }}</div>
              </div>
            </div>

            <div class="vs">VS</div>

            <div class="monster-side">
              <div class="monster-avatar">{{ currentMonsterIcon }}</div>
              <div class="monster-info">
                <h3>{{ currentMonster?.name || 'Monstro' }}</h3>
                <p>{{ currentMonster?.description }}</p>
                <div class="weakness">
                  <span>Fraquezas:</span>
                  <span *ngFor="let w of currentMonster?.weakness" class="weakness-badge">
                    {{ w }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="code-battle">
            <div class="question-area">
              <h4>📝 Desafio</h4>
              <p class="question-text">{{ currentQuestion?.question }}</p>
              <div class="code-snippet" *ngIf="currentQuestion?.codeSnippet">
                <code>{{ currentQuestion.codeSnippet }}</code>
              </div>
            </div>

            <div class="answer-area">
              <div class="input-modes">
                <button 
                  class="mode-btn" 
                  [class.active]="inputMode === 'text'"
                  (click)="inputMode = 'text'">
                  📝 Código
                </button>
                <button 
                  class="mode-btn voice" 
                  [class.active]="inputMode === 'voice'"
                  (click)="inputMode = 'voice'">
                  🎤 Explicar
                </button>
              </div>

              <div class="text-input" *ngIf="inputMode === 'text'">
                <textarea 
                  [(ngModel)]="playerAnswer"
                  placeholder="Digite sua resposta..."
                  rows="4"></textarea>
                <button class="submit-btn" (click)="submitAnswer()">
                  ⚔️ Atacar!
                </button>
              </div>

              <div class="voice-input" *ngIf="inputMode === 'voice'">
                <button 
                  class="mic-btn"
                  [class.recording]="isRecording"
                  (mousedown)="startRecording()"
                  (mouseup)="stopRecording()">
                  {{ isRecording ? '🎙️ Ouvindo...' : '🎤 Segure para Explicar' }}
                </button>
                <p class="transcription" *ngIf="recordedText">{{ recordedText }}</p>
              </div>

              <div class="hints" *ngIf="showHints">
                <h5>💡 Dicas:</h5>
                <ul>
                  <li *ngFor="let hint of currentQuestion?.hints">{{ hint }}</li>
                </ul>
              </div>

              <button class="hint-btn" (click)="showHints = !showHints">
                {{ showHints ? '� Hide Dicas' : '💡 Ver Dicas' }}
              </button>
            </div>
          </div>

          <div class="battle-result" *ngIf="battleResult">
            <div class="result-content" [class.success]="battleResult.status === 'success'" [class.fail]="battleResult.status === 'fail'">
              <h3>{{ battleResult.status === 'success' ? '🎉 Vitória!' : '💀 Derrota!' }}</h3>
              <p>{{ battleResult.feedbackNarrativo }}</p>
              <p class="xp-result" *ngIf="battleResult.xpGanha > 0">+{{ battleResult.xpGanha }} XP</p>
              <button class="continue-btn" (click)="continueBattle()">
                {{ battleResult.status === 'success' ? 'Próximo →' : 'Tentar Novamente' }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .programacao-container {
      min-height: 100vh;
      background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%);
      position: relative;
      padding: 20px;
      font-family: 'Rajdhani', sans-serif;
    }

    .background-effects {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;

      .particles {
        width: 100%;
        height: 100%;
        background-image: radial-gradient(2px 2px at 20% 30%, #a855f7 0%, transparent 100%),
                          radial-gradient(2px 2px at 80% 70%, #00ff88 0%, transparent 100%),
                          radial-gradient(2px 2px at 50% 80%, #ff6b6b 0%, transparent 100%);
        animation: particles 20s linear infinite;
      }
    }

    @keyframes particles {
      0% { transform: translateY(0); }
      100% { transform: translateY(-100%); }
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      position: relative;
      z-index: 10;

      h1 {
        font-family: 'Creepster', cursive;
        color: #a855f7;
        font-size: 36px;
        text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
      }

      .back-btn, .voice-btn {
        padding: 10px 20px;
        background: rgba(168, 85, 247, 0.2);
        border: 2px solid #a855f7;
        border-radius: 10px;
        color: #fff;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: rgba(168, 85, 247, 0.4);
        }
      }
    }

    .content {
      position: relative;
      z-index: 10;
    }

    .skill-selection {
      margin-bottom: 40px;

      h2 {
        color: #fff;
        text-align: center;
        margin-bottom: 25px;
      }
    }

    .skill-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .skill-card {
      padding: 25px;
      background: linear-gradient(145deg, rgba(26, 26, 46, 0.9) 0%, rgba(10, 10, 26, 0.9) 100%);
      border: 3px solid var(--skill-color);
      border-radius: 15px;
      text-align: center;
      cursor: pointer;
      transition: all 0.4s;

      &:hover, &.selected {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4),
                    0 0 20px var(--skill-color);
      }

      .skill-icon {
        font-size: 50px;
        margin-bottom: 15px;
      }

      h3 {
        color: var(--skill-color);
        margin-bottom: 10px;
      }

      p {
        color: #b0b0b0;
        font-size: 14px;
        margin-bottom: 15px;
      }

      .skill-stats {
        display: flex;
        justify-content: space-around;
        font-size: 12px;
        color: #666;
      }
    }

    .missions-section {
      h2 {
        color: #fff;
        text-align: center;
        margin-bottom: 25px;
      }
    }

    .missions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .mission-card {
      background: rgba(0, 0, 0, 0.5);
      border: 2px solid var(--monster-color);
      border-radius: 15px;
      overflow: hidden;

      .mission-header {
        display: flex;
        justify-content: space-between;
        padding: 15px;
        background: rgba(0, 0, 0, 0.3);

        .mission-order {
          color: #fff;
          font-weight: bold;
        }

        .mission-difficulty {
          padding: 2px 10px;
          border-radius: 10px;
          font-size: 12px;

          &.easy { background: #00ff88; color: #000; }
          &.medium { background: #ffaa00; color: #000; }
          &.hard { background: #ff3366; color: #fff; }
          &.expert { background: #ff0000; color: #fff; }
        }
      }

      .mission-content {
        padding: 20px;

        h3 {
          color: #fff;
          margin-bottom: 10px;
        }

        p {
          color: #b0b0b0;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .monster-preview {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;

          .monster-icon {
            font-size: 30px;
          }

          .monster-name {
            color: var(--monster-color);
          }
        }
      }

      .mission-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background: rgba(0, 0, 0, 0.3);

        .xp-reward {
          color: #00ff88;
          font-weight: bold;
        }

        .start-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, var(--monster-color) 0%, #000 100%);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-weight: bold;
          cursor: pointer;

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          &:hover:not(:disabled) {
            transform: scale(1.05);
          }
        }
      }

      &.completed {
        opacity: 0.7;
      }
    }

    .battle-section {
      max-width: 900px;
      margin: 40px auto;
    }

    .battle-arena {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 20px;
      margin-bottom: 30px;

      .player-side, .monster-side {
        text-align: center;

        .player-avatar, .monster-avatar {
          font-size: 60px;
          margin-bottom: 15px;
        }

        h3 {
          color: #fff;
          margin-bottom: 10px;
        }
      }

      .vs {
        font-family: 'Creepster', cursive;
        font-size: 40px;
        color: #ff3366;
      }

      .monster-side {
        .weakness {
          margin-top: 10px;

          span:first-child {
            color: #666;
            margin-right: 10px;
          }

          .weakness-badge {
            background: rgba(255, 51, 102, 0.3);
            padding: 2px 8px;
            border-radius: 5px;
            font-size: 12px;
            color: #ff3366;
            margin: 0 3px;
          }
        }
      }
    }

    .code-battle {
      background: rgba(0, 0, 0, 0.5);
      border-radius: 20px;
      padding: 30px;

      .question-area {
        margin-bottom: 25px;

        h4 {
          color: #a855f7;
          margin-bottom: 10px;
        }

        .question-text {
          color: #fff;
          font-size: 18px;
          margin-bottom: 15px;
        }

        .code-snippet {
          background: #1e1e1e;
          padding: 15px;
          border-radius: 10px;
          overflow-x: auto;

          code {
            color: #00ff88;
            font-family: 'Courier New', monospace;
          }
        }
      }

      .input-modes {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-bottom: 15px;

        .mode-btn {
          padding: 12px 24px;
          background: rgba(168, 85, 247, 0.2);
          border: 2px solid #a855f7;
          border-radius: 10px;
          color: #fff;
          cursor: pointer;

          &.active, &:hover {
            background: rgba(168, 85, 247, 0.4);
          }
        }
      }

      .text-input {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 15px;

        textarea {
          padding: 15px;
          background: #1e1e1e;
          border: 2px solid #a855f7;
          border-radius: 10px;
          color: #fff;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          resize: vertical;

          &:focus {
            outline: none;
            border-color: #00ff88;
          }
        }

        .submit-btn {
          padding: 15px;
          background: linear-gradient(135deg, #ff3366 0%, #4a0e4e 100%);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;

          &:hover {
            transform: scale(1.02);
          }
        }
      }

      .voice-input {
        text-align: center;
        margin-bottom: 15px;

        .mic-btn {
          padding: 20px 40px;
          background: linear-gradient(135deg, #00ff88 0%, #00aa55 100%);
          border: none;
          border-radius: 50px;
          color: #000;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;

          &.recording {
            animation: pulse 1s infinite;
          }
        }

        .transcription {
          color: #00ff88;
          margin-top: 15px;
        }
      }

      .hint-btn {
        display: block;
        margin: 15px auto 0;
        padding: 10px 20px;
        background: transparent;
        border: 2px solid #ffaa00;
        border-radius: 8px;
        color: #ffaa00;
        cursor: pointer;
      }

      .hints {
        margin-top: 15px;
        padding: 15px;
        background: rgba(255, 170, 0, 0.1);
        border-radius: 10px;

        h5 {
          color: #ffaa00;
          margin: 0 0 10px;
        }

        ul {
          margin: 0;
          padding-left: 20px;
          color: #b0b0b0;
        }
      }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .battle-result {
      margin-top: 30px;

      .result-content {
        text-align: center;
        padding: 40px;
        border-radius: 20px;

        &.success {
          background: rgba(0, 255, 136, 0.1);
          border: 2px solid #00ff88;
        }

        &.fail {
          background: rgba(255, 51, 102, 0.1);
          border: 2px solid #ff3366;
        }

        h3 {
          font-size: 36px;
          margin-bottom: 15px;
        }

        .success h3 { color: #00ff88; }
        .fail h3 { color: #ff3366; }

        p {
          color: #b0b0b0;
          margin-bottom: 10px;
        }

        .xp-result {
          color: #ffaa00;
          font-size: 24px;
          font-weight: bold;
        }

        .continue-btn {
          margin-top: 20px;
          padding: 15px 40px;
          background: linear-gradient(135deg, #a855f7 0%, #4a0e4e 100%);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
        }
      }
    }
  `]
})
export class ProgramacaoComponent implements OnInit, OnDestroy {
  hunter: Hunter = {
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
    currentMapPosition: { x: 0, y: 0 },
    monstersDefeated: 0,
    currentMissionId: '',
    createdAt: new Date()
  };

  playerHero: any = null;

  programmingSkills = [
    { id: 'JAVA', name: 'Java', icon: '☕', color: '#ff6b6b', description: 'Programação Orientada a Objetos', difficulty: 'Iniciante' },
    { id: 'SPRING', name: 'Spring Boot', icon: '🌸', color: '#22c55e', description: 'Framework Backend', difficulty: 'Intermediário' },
    { id: 'ANGULAR', name: 'Angular', icon: '🅰️', color: '#a855f7', description: 'Framework Frontend', difficulty: 'Intermediário' },
    { id: 'REACT', name: 'React', icon: '⚛️', color: '#4ecdc4', description: 'Biblioteca UI', difficulty: 'Iniciante' },
    { id: 'TYPESCRIPT', name: 'TypeScript', icon: '📘', color: '#3b82f6', description: 'Superconjunto de JS', difficulty: 'Iniciante' },
    { id: 'NODE', name: 'Node.js', icon: '🟢', color: '#22c55e', description: 'Runtime JavaScript', difficulty: 'Intermediário' }
  ];

  selectedSkill: string | null = null;
  missions: any[] = [];
  completedMissions: string[] = [];

  showBattle = false;
  currentMonster: Monster | null = null;
  currentQuestion: any = null;
  playerAnswer = '';
  inputMode: 'text' | 'voice' = 'text';
  isRecording = false;
  recordedText = '';
  showHints = false;
  battleResult: any = null;
  currentMonsterIcon = '👾';

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private hunterService: HunterService,
    private glitchWardenService: GlitchWardenService,
    private voiceService: VoiceService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.hunterService.getHunter().subscribe(hunter => {
        this.hunter = hunter;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  selectSkill(skill: any): void {
    this.selectedSkill = skill.id;
    this.loadMissions();
  }

  getSkillName(): string {
    const skill = this.programmingSkills.find(s => s.id === this.selectedSkill);
    return skill?.name || '';
  }

  getMissionCount(skillId: string): number {
    return this.hunterService.getAllMissions()
      .filter((m: Mission) => m.skillName === skillId).length;
  }

  loadMissions(): void {
    if (!this.selectedSkill) return;
    
    this.missions = this.hunterService.getAllMissions()
      .filter((m: Mission) => m.skillName === this.selectedSkill)
      .sort((a: Mission, b: Mission) => a.order - b.order)
      .map((m: Mission, i: number) => ({
        ...m,
        order: i + 1,
        completed: this.completedMissions.includes(m.id),
        locked: i > 0 && !this.completedMissions.includes(this.missions[i-1]?.id || '')
      }));
  }

  getMissions(): any[] {
    return this.missions;
  }

  getMonsterColor(mission: any): string {
    const monster = this.hunterService.getAllMonsters()
      .find((m: Monster) => m.id === mission.monsterId);
    return monster ? '#ff3366' : '#a855f7';
  }

  getMonsterIcon(monsterId: string): string {
    const icons: Record<string, string> = {
      'mon_01': '🐛', 'mon_02': '👹', 'mon_03': '🧛', 'mon_04': '👻', 'mon_05': '🧙',
      'mon_06': '👺', 'mon_07': '🦊', 'mon_08': '🌊', 'mon_09': '👹', 'mon_10': '🕷️'
    };
    return icons[monsterId] || '👾';
  }

  getMonsterName(monsterId: string): string {
    const monster = this.hunterService.getAllMonsters()
      .find((m: Monster) => m.id === monsterId);
    return monster?.name || 'Desconhecido';
  }

  startMission(mission: any): void {
    this.currentMonster = this.hunterService.getAllMonsters()
      .find((m: Monster) => m.id === mission.monsterId) || null;
    this.currentQuestion = mission.questions[0];
    this.showBattle = true;
    this.battleResult = null;
    this.playerAnswer = '';
    this.showHints = false;

    if (this.currentMonster) {
      this.currentMonsterIcon = this.getMonsterIcon(this.currentMonster.id);
    }
  }

  startRecording(): void {
    this.isRecording = true;
    this.voiceService.listen('pt-BR').then(text => {
      this.recordedText = text;
      this.playerAnswer = text;
      this.isRecording = false;
    }).catch(() => {
      this.isRecording = false;
    });
  }

  stopRecording(): void {}

  async submitAnswer(): Promise<void> {
    if (!this.currentQuestion || !this.playerAnswer.trim()) return;

    const isCorrect = this.playerAnswer.toLowerCase().trim()
      .includes(this.currentQuestion.expectedAnswer.toLowerCase().trim());

    if (isCorrect) {
      this.hunterService.addXp(this.currentQuestion.xpReward || 25);
      this.completedMissions.push(this.currentQuestion.id);
      this.battleResult = {
        status: 'success',
        feedbackNarrativo: 'Vitória! O monstro foi derrotado!',
        xpGanha: this.currentQuestion.xpReward || 25
      };
    } else {
      this.hunterService.removeHeart(1);
      this.battleResult = {
        status: 'fail',
        feedbackNarrativo: 'Errado! O monstro contra-atacou! -1 Coração',
        xpGanha: 0
      };
    }
  }

  continueBattle(): void {
    this.battleResult = null;
    this.playerAnswer = '';
    this.showBattle = false;
    this.loadMissions();
  }

  speakIntro(): void {
    this.voiceService.speak('Bem-vindo à Academia de Programação! Escolha uma tecnologia para começar.');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
