import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HunterService, GlitchWardenService } from '../../services/hunter.service';
import { Hunter, Mission, BattleResult, Region } from '../../models/hunter.model';

@Component({
  selector: 'app-tokyo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="region-container tokyo-theme">
      <div class="neon-lights"></div>
      
      <header class="region-header">
        <button class="back-btn" (click)="goHome()">← Voltar</button>
        <h1>🗾 Tokyo - Neon Spirits</h1>
        <div class="hearts">{{ getHeartsDisplay() }}</div>
      </header>

      <div class="status-bar">
        <div class="xp-display">
          <span>XP: {{ hunter.xp }}</span>
          <span class="level">Nível {{ hunter.level }}</span>
        </div>
        <div class="mission-info">
          <span class="mentor">Kitsune-AI: {{ narratorText }}</span>
        </div>
      </div>

      <main class="game-area" *ngIf="!gameOver && !victory">
        <div class="mission-card" *ngIf="currentMission">
          <h2>{{ currentMission.title }}</h2>
          <p class="mission-desc">{{ currentMission.description }}</p>
          
          <div class="difficulty-badge" [class]="currentMission.difficulty.toLowerCase()">
            {{ currentMission.difficulty }}
          </div>

          <div class="yokai-display">
            <span class="yokai-icon">{{ currentYokai }}</span>
            <span class="yokai-name">{{ currentYokaiName }}</span>
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
              <p class="voice-hint">Diga em japonês ou código!</p>
            </div>
          </div>
        </div>

        <div class="shibuya-crosswalk">
          <div class="light vertical"></div>
          <div class="light horizontal"></div>
        </div>
      </main>

      <div class="game-over" *ngIf="gameOver">
        <h2>💀 Você foi Derrotado!</h2>
        <p>Os Yokais de Tokyo te encontraram...</p>
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
      background: linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 50%, #0d0015 100%);
      position: relative;
      padding: 20px;
      font-family: 'Rajdhani', sans-serif;
      overflow: hidden;
    }

    .neon-lights {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 20% 30%, rgba(255, 0, 128, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(0, 255, 255, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, rgba(255, 0, 255, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    .region-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      position: relative;
      z-index: 10;

      h1 {
        font-family: 'Creepster', cursive;
        color: #ff1493;
        font-size: 32px;
        text-shadow: 0 0 20px rgba(255, 20, 147, 0.5),
                     0 0 40px rgba(255, 20, 147, 0.3);
        animation: neonFlicker 3s infinite;
      }

      .back-btn {
        padding: 10px 20px;
        background: rgba(255, 20, 147, 0.2);
        border: 2px solid #ff1493;
        border-radius: 10px;
        color: #ff69b4;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: rgba(255, 20, 147, 0.4);
          box-shadow: 0 0 20px rgba(255, 20, 147, 0.4);
        }
      }

      .hearts {
        font-size: 24px;
      }
    }

    @keyframes neonFlicker {
      0%, 100% { opacity: 1; }
      92% { opacity: 1; }
      93% { opacity: 0.8; }
      94% { opacity: 1; }
      96% { opacity: 0.9; }
      97% { opacity: 1; }
    }

    .status-bar {
      display: flex;
      justify-content: space-between;
      padding: 15px 20px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 15px;
      margin-bottom: 30px;
      position: relative;
      z-index: 10;

      .xp-display {
        color: #00ff88;
        font-size: 18px;
        
        .level {
          margin-left: 15px;
          color: #ff69b4;
        }
      }

      .mentor {
        color: #b0b0b0;
        font-style: italic;
      }
    }

    .mission-card {
      background: linear-gradient(145deg, rgba(26, 10, 46, 0.95) 0%, rgba(13, 0, 21, 0.95) 100%);
      border: 3px solid #ff1493;
      border-radius: 20px;
      padding: 30px;
      max-width: 600px;
      margin: 0 auto;
      position: relative;
      z-index: 10;

      h2 {
        font-family: 'Creepster', cursive;
        color: #ff69b4;
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

    .yokai-display {
      text-align: center;
      margin: 20px 0;

      .yokai-icon {
        font-size: 60px;
        display: block;
        animation: float 3s ease-in-out infinite;
      }

      .yokai-name {
        font-family: 'Creepster', cursive;
        color: #ff1493;
        font-size: 20px;
      }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .challenge-area {
      .challenge-text {
        color: #ff69b4;
        font-size: 20px;
        text-align: center;
        padding: 20px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
        margin-bottom: 20px;
        border: 1px solid rgba(255, 20, 147, 0.3);
      }
    }

    .input-modes {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-bottom: 20px;

      .mode-btn {
        padding: 12px 24px;
        background: rgba(255, 20, 147, 0.2);
        border: 2px solid #ff1493;
        border-radius: 10px;
        color: #ff69b4;
        cursor: pointer;
        transition: all 0.3s;

        &.active, &:hover {
          background: rgba(255, 20, 147, 0.4);
          box-shadow: 0 0 15px rgba(255, 20, 147, 0.4);
        }

        &.voice.active, &.voice:hover {
          background: rgba(0, 255, 255, 0.3);
          border-color: #00ffff;
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
        border: 2px solid #ff1493;
        border-radius: 10px;
        color: #fff;
        font-size: 16px;

        &:focus {
          outline: none;
          border-color: #00ffff;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        }
      }

      .submit-btn {
        padding: 15px 30px;
        background: linear-gradient(135deg, #ff1493 0%, #8b008b 100%);
        border: none;
        border-radius: 10px;
        color: #fff;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(255, 20, 147, 0.5);
        }
      }
    }

    .voice-area {
      text-align: center;

      .mic-btn {
        padding: 20px 40px;
        background: linear-gradient(135deg, #00ffff 0%, #008b8b 100%);
        border: none;
        border-radius: 50px;
        color: #000;
        font-size: 18px;
        font-weight: 600;
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

    .shibuya-crosswalk {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 150px;
      opacity: 0.3;
      pointer-events: none;

      .light {
        position: absolute;
        background: rgba(255, 255, 255, 0.1);
        
        &.vertical {
          width: 50%;
          height: 100%;
          left: 0;
        }
        
        &.horizontal {
          width: 100%;
          height: 50%;
          top: 0;
        }
      }
    }

    .game-over, .victory {
      text-align: center;
      padding: 50px;
      position: relative;
      z-index: 10;

      h2 {
        font-family: 'Creepster', cursive;
        font-size: 48px;
        margin-bottom: 20px;
      }

      .game-over h2 { color: #ff3366; text-shadow: 0 0 20px rgba(255, 51, 102, 0.5); }
      .victory h2 { color: #00ff88; text-shadow: 0 0 20px rgba(0, 255, 136, 0.5); }

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
        background: linear-gradient(135deg, #ff1493 0%, #8b008b 100%);
        border: none;
        border-radius: 10px;
        color: #fff;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(255, 20, 147, 0.5);
        }
      }
    }
  `]
})
export class TokyoComponent implements OnInit, OnDestroy {
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
    currentRegion: 'TOKYO',
    currentMapPosition: { x: 100, y: 300 },
    monstersDefeated: 0,
    currentMissionId: 'mission_tk_01',
    createdAt: new Date()
  };

  currentMission: Mission | null = null;
  currentChallenge = '';
  playerAnswer = '';
  narratorText = 'Aguardando desafio...';
  
  currentYokai = '👺';
  currentYokaiName = 'Tengu';
  
  inputMode: 'text' | 'voice' = 'text';
  isRecording = false;
  
  gameOver = false;
  victory = false;
  victoryMessage = '';
  xpGained = 0;

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
        const tokyoMissions = missions.filter(m => m.region === 'TOKYO');
        if (tokyoMissions.length > 0) {
          this.currentMission = tokyoMissions[0];
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

    const yokais = ['👺', '👻', '🦊', '🐉', '👹'];
    const names = ['Tengu', 'Yurei', 'Kitsune', 'Ryuu', 'Oni'];
    
    const index = Math.floor(Math.random() * yokais.length);
    this.currentYokai = yokais[index];
    this.currentYokaiName = names[index];

    const challenges: Record<string, string> = {
      'mission_02': 'Qual a diferença entre let e const em Angular/JS?',
      'mission_03': 'Diga "Olá" em japonês (Konnichiwa)',
      'mission_05': 'Como corrigir um erro de Observable em Angular?',
    };

    this.currentChallenge = challenges[this.currentMission.id] || 'Resolva este desafio...';
    this.narratorText = this.glitchWardenService.getIntroNarrative('TOKYO');
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
      'mission_02': 'const não pode ser reatribuído',
      'mission_03': 'こんにちは',
      'mission_05': 'subscribe',
    };

    const expected = expectedAnswers[this.currentMission.id] || 'resposta';
    const isVoice = this.inputMode === 'voice';

    const result: BattleResult = await this.glitchWardenService.validateAnswer({
      answer: this.playerAnswer,
      expectedAnswer: expected,
      isVoiceInput: isVoice,
      difficulty: this.currentMission.difficulty,
      region: 'TOKYO',
      topic: this.currentMission.title,
      monsterId: this.currentMission?.monsterId || 'mon_06'
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
