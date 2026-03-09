import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HunterService, GlitchWardenService } from '../../services/hunter.service';
import { Hunter, Mission, PlayerAction, BattleResult, Region, Difficulty } from '../../models/hunter.model';

@Component({
  selector: 'app-new-orleans',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="region-container new-orleans-theme">
      <div class="bayou-fog"></div>
      
      <header class="region-header">
        <button class="back-btn" (click)="goHome()">← Voltar</button>
        <h1>🌿 New Orleans - The Bayou Code</h1>
        <div class="hearts">{{ getHeartsDisplay() }}</div>
      </header>

      <div class="status-bar">
        <div class="xp-display">
          <span>XP: {{ hunter.xp }}</span>
          <span class="level">Nível {{ hunter.level }}</span>
        </div>
        <div class="mission-info">
          <span class="mentor">S.A.M.: {{ narratorText }}</span>
        </div>
      </div>

      <main class="game-area" *ngIf="!gameOver && !victory">
        <div class="mission-card" *ngIf="currentMission">
          <h2>{{ currentMission.title }}</h2>
          <p class="mission-desc">{{ currentMission.description }}</p>
          
          <div class="difficulty-badge" [class]="currentMission.difficulty.toLowerCase()">
            {{ currentMission.difficulty }}
          </div>

          <div class="challenge-area">
            <div class="challenge-prompt">
              <p class="challenge-text">{{ currentChallenge }}</p>
            </div>

            <div class="input-modes">
              <button 
                class="mode-btn" 
                [class.active]="inputMode === 'text'"
                (click)="setInputMode('text')">
                📝 Escrita (+15 XP)
              </button>
              <button 
                class="mode-btn voice" 
                [class.active]="inputMode === 'voice'"
                (click)="setInputMode('voice')">
                🎤 Voz (+35 XP)
              </button>
            </div>

            <div class="answer-area" *ngIf="inputMode === 'text'">
              <input 
                type="text" 
                [(ngModel)]="playerAnswer" 
                placeholder="Digite sua resposta..."
                (keyup.enter)="submitAnswer()"
                class="answer-input">
              <button class="submit-btn" (click)="submitAnswer()">Atacar!</button>
            </div>

            <div class="voice-area" *ngIf="inputMode === 'voice'">
              <button 
                class="mic-btn" 
                [class.recording]="isRecording"
                (mousedown)="startRecording()"
                (mouseup)="stopRecording()">
                {{ isRecording ? '🎙️ Gravando...' : '🎤 Segure para Falar' }}
              </button>
              <p class="voice-hint">Fale a resposta claramente</p>
            </div>
          </div>
        </div>

        <div class="boss-area" *ngIf="showBoss">
          <div class="boss-visual">
            <span class="boss-icon">👹</span>
            <span class="boss-name">{{ bossName }}</span>
          </div>
          <div class="boss-health">
            <div class="health-fill" [style.width.%]="bossHealth"></div>
          </div>
        </div>
      </main>

      <div class="game-over" *ngIf="gameOver">
        <h2>💀 Você foi Derrotado!</h2>
        <p>Os demônios do Bayou conquistaram você...</p>
        <p class="final-score">XP Final: {{ hunter.xp }}</p>
        <button class="retry-btn" (click)="retry()">Tentar Novamente</button>
      </div>

      <div class="victory" *ngIf="victory">
        <h2>🎉 Área Limpa!</h2>
        <p>{{ victoryMessage }}</p>
        <p class="xp-gained">+{{ xpGained }} XP</p>
        <button class="continue-btn" (click)="continueGame()">Continuar</button>
      </div>
    </div>
  `,
  styles: [`
    .region-container {
      min-height: 100vh;
      background: linear-gradient(180deg, #1a0f0a 0%, #2d1810 50%, #0d0805 100%);
      position: relative;
      padding: 20px;
      font-family: 'Rajdhani', sans-serif;
    }

    .bayou-fog {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3"/></filter><rect width="100%" height="100%" filter="url(%23noise)" opacity="0.15"/></svg>');
      pointer-events: none;
      animation: fogDrift 30s linear infinite;
    }

    @keyframes fogDrift {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    .region-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        font-family: 'Creepster', cursive;
        color: #8b4513;
        font-size: 32px;
        text-shadow: 0 0 20px rgba(139, 69, 19, 0.5);
      }

      .back-btn {
        padding: 10px 20px;
        background: rgba(139, 69, 19, 0.3);
        border: 2px solid #8b4513;
        border-radius: 10px;
        color: #d4a574;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: rgba(139, 69, 19, 0.5);
        }
      }

      .hearts {
        font-size: 24px;
      }
    }

    .status-bar {
      display: flex;
      justify-content: space-between;
      padding: 15px 20px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 15px;
      margin-bottom: 30px;

      .xp-display {
        color: #00ff88;
        font-size: 18px;
        
        .level {
          margin-left: 15px;
          color: #d4a574;
        }
      }

      .mentor {
        color: #b0b0b0;
        font-style: italic;
      }
    }

    .mission-card {
      background: linear-gradient(145deg, rgba(45, 24, 16, 0.9) 0%, rgba(13, 8, 5, 0.9) 100%);
      border: 3px solid #8b4513;
      border-radius: 20px;
      padding: 30px;
      max-width: 600px;
      margin: 0 auto;

      h2 {
        font-family: 'Creepster', cursive;
        color: #d4a574;
        font-size: 28px;
        margin-bottom: 15px;
      }

      .mission-desc {
        color: #b0b0b0;
        font-size: 18px;
        margin-bottom: 20px;
      }

      .difficulty-badge {
        display: inline-block;
        padding: 8px 20px;
        border-radius: 20px;
        font-weight: 600;
        margin-bottom: 25px;

        &.easy { background: #00ff88; color: #000; }
        &.medium { background: #ffaa00; color: #000; }
        &.hard { background: #ff3366; color: #fff; }
      }
    }

    .challenge-area {
      .challenge-text {
        color: #d4a574;
        font-size: 20px;
        text-align: center;
        padding: 20px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
        margin-bottom: 20px;
      }
    }

    .input-modes {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-bottom: 20px;

      .mode-btn {
        padding: 12px 24px;
        background: rgba(139, 69, 19, 0.3);
        border: 2px solid #8b4513;
        border-radius: 10px;
        color: #d4a574;
        cursor: pointer;
        transition: all 0.3s;

        &.active, &:hover {
          background: rgba(139, 69, 19, 0.6);
          box-shadow: 0 0 15px rgba(139, 69, 19, 0.4);
        }

        &.voice.active, &.voice:hover {
          background: rgba(255, 51, 102, 0.3);
          border-color: #ff3366;
        }
      }
    }

    .answer-area {
      display: flex;
      gap: 10px;

      .answer-input {
        flex: 1;
        padding: 15px;
        background: rgba(0, 0, 0, 0.4);
        border: 2px solid #8b4513;
        border-radius: 10px;
        color: #fff;
        font-size: 16px;

        &:focus {
          outline: none;
          border-color: #d4a574;
        }
      }

      .submit-btn {
        padding: 15px 30px;
        background: linear-gradient(135deg, #8b4513 0%, #5a2d0a 100%);
        border: none;
        border-radius: 10px;
        color: #fff;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(139, 69, 19, 0.5);
        }
      }
    }

    .voice-area {
      text-align: center;

      .mic-btn {
        padding: 20px 40px;
        background: linear-gradient(135deg, #ff3366 0%, #4a0e4e 100%);
        border: none;
        border-radius: 50px;
        color: #fff;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.3s;

        &.recording {
          animation: pulse 1s infinite;
        }

        &:hover {
          transform: scale(1.05);
        }
      }

      .voice-hint {
        color: #666;
        margin-top: 10px;
      }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .boss-area {
      text-align: center;
      margin-top: 30px;

      .boss-icon {
        font-size: 80px;
        display: block;
        animation: float 3s ease-in-out infinite;
      }

      .boss-name {
        font-family: 'Creepster', cursive;
        color: #ff3366;
        font-size: 24px;
      }

      .boss-health {
        width: 300px;
        height: 20px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 10px;
        margin: 15px auto;
        overflow: hidden;

        .health-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff3366, #ff0000);
          transition: width 0.5s;
        }
      }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .game-over, .victory {
      text-align: center;
      padding: 50px;

      h2 {
        font-family: 'Creepster', cursive;
        font-size: 48px;
        margin-bottom: 20px;
      }

      .game-over h2 { color: #ff3366; }
      .victory h2 { color: #00ff88; }

      p {
        color: #b0b0b0;
        font-size: 20px;
        margin-bottom: 15px;
      }

      .final-score, .xp-gained {
        font-size: 32px;
        color: #00ff88;
        font-weight: 700;
      }

      .retry-btn, .continue-btn {
        margin-top: 30px;
        padding: 15px 40px;
        background: linear-gradient(135deg, #ff3366 0%, #4a0e4e 100%);
        border: none;
        border-radius: 10px;
        color: #fff;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;

        &:hover {
          transform: scale(1.05);
        }
      }
    }
  `]
})
export class NewOrleansComponent implements OnInit, OnDestroy {
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
    currentMapPosition: { x: 100, y: 300 },
    monstersDefeated: 0,
    currentMissionId: 'mission_no_01',
    createdAt: new Date()
  };

  currentMission: Mission | null = null;
  currentChallenge = '';
  playerAnswer = '';
  narratorText = 'Aguardando desafio...';
  
  inputMode: 'text' | 'voice' = 'text';
  isRecording = false;
  
  gameOver = false;
  victory = false;
  victoryMessage = '';
  xpGained = 0;
  
  showBoss = false;
  bossName = 'Spirit of NullPointer';
  bossHealth = 100;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hunterService: HunterService,
    private glitchWardenService: GlitchWardenService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.hunterService.getHunter().subscribe(hunter => {
        this.hunter = hunter;
        if (hunter.hearts <= 0) {
          this.gameOver = true;
        }
      }),
      this.hunterService.getMissions().subscribe(missions => {
        const newOrleansMissions = missions.filter(m => m.region === 'NEW_ORLEANS');
        if (newOrleansMissions.length > 0) {
          this.currentMission = newOrleansMissions[0];
          this.generateChallenge();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  generateChallenge(): void {
    if (!this.currentMission) return;

    const challenges: Record<string, string> = {
      'mission_01': 'O que é uma Variable em Java?',
      'mission_04': 'Qual anotação usamos para criar um Bean em Spring?',
    };

    this.currentChallenge = challenges[this.currentMission.id] || 'Resolva este desafio...';
    this.narratorText = this.glitchWardenService.getIntroNarrative('NEW_ORLEANS');
  }

  setInputMode(mode: 'text' | 'voice'): void {
    this.inputMode = mode;
  }

  startRecording(): void {
    this.isRecording = true;
  }

  stopRecording(): void {
    this.isRecording = false;
    this.playerAnswer = 'Resposta por voz (simulada)';
  }

  async submitAnswer(): Promise<void> {
    if (!this.currentMission || !this.playerAnswer.trim()) return;

    const expectedAnswers: Record<string, string> = {
      'mission_01': 'variável é um espaço na memória',
      'mission_04': '@Service',
    };

    const expected = expectedAnswers[this.currentMission.id] || 'resposta';
    const isVoice = this.inputMode === 'voice';

    const result: BattleResult = await this.glitchWardenService.validateAnswer({
      answer: this.playerAnswer,
      expectedAnswer: expected,
      isVoiceInput: isVoice,
      difficulty: this.currentMission.difficulty,
      region: 'NEW_ORLEANS',
      topic: this.currentMission.title,
      monsterId: this.currentMission?.monsterId || 'mon_01'
    });

    this.narratorText = result.feedbackNarrativo;

    if (result.status === 'success') {
      this.hunterService.addXp(result.xpGanha);
      this.victory = true;
      this.victoryMessage = result.proximoDesafio;
      this.xpGained = result.xpGanha;
    } else {
      const alive = this.hunterService.removeHeart(1);
      if (!alive) {
        this.gameOver = true;
      }
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  retry(): void {
    this.hunterService.healHearts(5);
    this.gameOver = false;
    this.playerAnswer = '';
  }

  continueGame(): void {
    this.victory = false;
    this.playerAnswer = '';
    this.hunterService.healHearts(1);
  }

  getHeartsDisplay(): string {
    return '❤️'.repeat(this.hunter.hearts) + '🖤'.repeat(this.hunter.maxHearts - this.hunter.hearts);
  }
}
