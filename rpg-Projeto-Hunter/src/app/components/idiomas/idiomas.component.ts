import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HunterService, GlitchWardenService } from '../../services/hunter.service';
import { VoiceService } from '../../services/voice.service';
import { Hunter, Mission } from '../../models/hunter.model';

@Component({
  selector: 'app-idiomas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="idiomas-container">
      <div class="background-effects">
        <div class="particles"></div>
      </div>

      <header class="header">
        <button class="back-btn" (click)="goBack()">← Voltar</button>
        <h1>📚 Academia de Idiomas</h1>
        <div class="voice-btn" (click)="speakIntro()">🎤 Ouvir</div>
      </header>

      <main class="content">
        <div class="language-selection">
          <h2>Escolha o Idioma</h2>
          
          <div class="language-cards">
            <div 
              class="lang-card japanese"
              [class.selected]="selectedLanguage === 'JPN'"
              (click)="selectLanguage('JPN')">
              <div class="flag">🇯🇵</div>
              <h3>Japonês</h3>
              <p>Aprenda com os mestres de Tokyo!</p>
              <div class="progress">
                <span>Progresso: {{ getProgress('JPN') }}%</span>
                <div class="progress-bar">
                  <div class="fill" [style.width.%]="getProgress('JPN')"></div>
                </div>
              </div>
            </div>

            <div 
              class="lang-card english"
              [class.selected]="selectedLanguage === 'ENG'"
              (click)="selectLanguage('ENG')">
              <div class="flag">🇬🇧</div>
              <h3>Inglês</h3>
              <p>Prepare-se para o mundo!</p>
              <div class="progress">
                <span>Progresso: {{ getProgress('ENG') }}%</span>
                <div class="progress-bar">
                  <div class="fill" [style.width.%]="getProgress('ENG')"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lessons-section" *ngIf="selectedLanguage">
          <h2>{{ getLanguageName() }} - Lições</h2>
          
          <div class="lessons-list">
            <div 
              *ngFor="let lesson of getLessons()"
              class="lesson-card"
              [class.completed]="lesson.completed"
              [class.current]="lesson.current"
              (click)="startLesson(lesson)">
              <div class="lesson-number">{{ lesson.order }}</div>
              <div class="lesson-info">
                <h4>{{ lesson.title }}</h4>
                <p>{{ lesson.description }}</p>
                <span class="lesson-reward">+{{ lesson.xpReward }} XP</span>
              </div>
              <div class="lesson-status">
                <span *ngIf="lesson.completed">✓</span>
                <span *ngIf="lesson.current">▶️</span>
                <span *ngIf="!lesson.completed && !lesson.current">🔒</span>
              </div>
            </div>
          </div>
        </div>

        <div class="tutor-section" *ngIf="showTutor">
          <div class="tutor-avatar">
            <span>{{ isJapanese ? '👘' : '👨‍🏫' }}</span>
          </div>
          
          <div class="tutor-message">
            <p>{{ tutorMessage }}</p>
          </div>

          <div class="lesson-content" *ngIf="currentQuestion">
            <div class="word-to-learn">
              <span class="word">{{ currentQuestion.expectedAnswer }}</span>
              <span class="pronunciation">{{ currentQuestion.hints[0] }}</span>
            </div>

            <div class="meaning">
              <p>{{ getMeaning(currentQuestion.expectedAnswer) }}</p>
            </div>

            <div class="practice-area">
              <h4>Pratique a Pronúncia!</h4>
              
              <div class="input-modes">
                <button 
                  class="mode-btn" 
                  [class.active]="inputMode === 'text'"
                  (click)="inputMode = 'text'">
                  📝 Escrever
                </button>
                <button 
                  class="mode-btn voice" 
                  [class.active]="inputMode === 'voice'"
                  (click)="inputMode = 'voice'">
                  🎤 Falar
                </button>
              </div>

              <div class="answer-input" *ngIf="inputMode === 'text'">
                <input 
                  type="text" 
                  [(ngModel)]="playerAnswer"
                  [placeholder]="isJapanese ? 'Escreva em japonês...' : 'Escreva em inglês...'"
                  (keyup.enter)="checkAnswer()">
                <button class="submit-btn" (click)="checkAnswer()">Verificar</button>
              </div>

              <div class="voice-practice" *ngIf="inputMode === 'voice'">
                <button 
                  class="mic-btn"
                  [class.recording]="isRecording"
                  (mousedown)="startRecording()"
                  (mouseup)="stopRecording()">
                  {{ isRecording ? '🎙️ Gravando...' : '🎤 Segure para Falar' }}
                </button>
                <p class="transcription" *ngIf="recordedText">{{ recordedText }}</p>
              </div>
            </div>

            <div class="example-sentences" *ngIf="currentQuestion">
              <h4>Exemplos de Uso:</h4>
              <p *ngFor="let hint of currentQuestion.hints.slice(1)">{{ hint }}</p>
            </div>
          </div>
        </div>
      </main>

      <div class="ai-tutor-floating" (click)="speakTutorMessage()" *ngIf="showTutor">
        <span>🤖</span> IA Tutor
      </div>
    </div>
  `,
  styles: [`
    .idiomas-container {
      min-height: 100vh;
      background: linear-gradient(180deg, #0d1a2a 0%, #1a2a4a 50%, #0d1a2a 100%);
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
        background-image: radial-gradient(2px 2px at 20% 30%, #00bfff 0%, transparent 100%),
                          radial-gradient(2px 2px at 80% 70%, #ff69b4 0%, transparent 100%);
        animation: particles 15s linear infinite;
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
        color: #00bfff;
        font-size: 36px;
        text-shadow: 0 0 20px rgba(0, 191, 255, 0.5);
      }

      .back-btn, .voice-btn {
        padding: 10px 20px;
        background: rgba(0, 191, 255, 0.2);
        border: 2px solid #00bfff;
        border-radius: 10px;
        color: #fff;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.3s;

        &:hover {
          background: rgba(0, 191, 255, 0.4);
        }
      }
    }

    .content {
      position: relative;
      z-index: 10;
    }

    .language-selection {
      margin-bottom: 40px;

      h2 {
        color: #fff;
        text-align: center;
        margin-bottom: 25px;
      }
    }

    .language-cards {
      display: flex;
      gap: 30px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .lang-card {
      width: 300px;
      padding: 30px;
      background: linear-gradient(145deg, rgba(26, 42, 74, 0.9) 0%, rgba(13, 26, 42, 0.9) 100%);
      border: 3px solid #00bfff;
      border-radius: 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.4s;

      &:hover, &.selected {
        transform: translateY(-10px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4),
                    0 0 30px rgba(0, 191, 255, 0.5);
      }

      &.japanese {
        border-color: #ff69b4;
        &:hover, &.selected {
          box-shadow: 0 0 30px rgba(255, 105, 180, 0.5);
        }
      }

      &.english {
        border-color: #00bfff;
      }

      .flag {
        font-size: 60px;
        margin-bottom: 15px;
      }

      h3 {
        color: #fff;
        font-size: 24px;
        margin-bottom: 10px;
      }

      p {
        color: #b0b0b0;
        margin-bottom: 20px;
      }

      .progress {
        text-align: left;

        span {
          color: #00ff88;
          font-size: 14px;
        }

        .progress-bar {
          height: 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          margin-top: 8px;
          overflow: hidden;

          .fill {
            height: 100%;
            background: linear-gradient(90deg, #00bfff, #00ff88);
            border-radius: 4px;
          }
        }
      }
    }

    .lessons-section {
      h2 {
        color: #fff;
        text-align: center;
        margin-bottom: 25px;
      }
    }

    .lessons-list {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .lesson-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      background: rgba(0, 0, 0, 0.4);
      border: 2px solid #333;
      border-radius: 15px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover:not(.completed) {
        border-color: #00bfff;
        background: rgba(0, 191, 255, 0.1);
      }

      &.completed {
        border-color: #00ff88;
        opacity: 0.7;
      }

      &.current {
        border-color: #ffaa00;
        background: rgba(255, 170, 0, 0.1);
      }

      .lesson-number {
        width: 50px;
        height: 50px;
        background: #00bfff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: bold;
        color: #000;
      }

      .lesson-info {
        flex: 1;

        h4 {
          color: #fff;
          margin: 0 0 5px;
        }

        p {
          color: #b0b0b0;
          margin: 0;
          font-size: 14px;
        }

        .lesson-reward {
          color: #00ff88;
          font-size: 13px;
        }
      }

      .lesson-status {
        font-size: 24px;
      }
    }

    .tutor-section {
      max-width: 800px;
      margin: 40px auto;
      padding: 30px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 20px;
      border: 2px solid #00bfff;

      .tutor-avatar {
        text-align: center;
        margin-bottom: 20px;

        span {
          font-size: 80px;
          animation: float 3s ease-in-out infinite;
        }
      }

      .tutor-message {
        text-align: center;
        margin-bottom: 30px;

        p {
          color: #00ff88;
          font-size: 18px;
          font-style: italic;
        }
      }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .lesson-content {
      .word-to-learn {
        text-align: center;
        margin-bottom: 20px;

        .word {
          display: block;
          font-size: 48px;
          color: #fff;
          font-weight: bold;
        }

        .pronunciation {
          display: block;
          font-size: 24px;
          color: #ff69b4;
          margin-top: 10px;
        }
      }

      .meaning {
        text-align: center;
        margin-bottom: 30px;
        padding: 15px;
        background: rgba(0, 191, 255, 0.1);
        border-radius: 10px;

        p {
          color: #00bfff;
          font-size: 18px;
        }
      }

      .practice-area {
        margin-bottom: 25px;

        h4 {
          color: #fff;
          text-align: center;
          margin-bottom: 15px;
        }
      }

      .input-modes {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-bottom: 15px;

        .mode-btn {
          padding: 12px 24px;
          background: rgba(0, 191, 255, 0.2);
          border: 2px solid #00bfff;
          border-radius: 10px;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s;

          &.active, &:hover {
            background: rgba(0, 191, 255, 0.4);
          }

          &.voice.active {
            background: rgba(255, 105, 180, 0.4);
            border-color: #ff69b4;
          }
        }
      }

      .answer-input {
        display: flex;
        gap: 10px;
        max-width: 500px;
        margin: 0 auto;

        input {
          flex: 1;
          padding: 15px;
          background: rgba(0, 0, 0, 0.4);
          border: 2px solid #00bfff;
          border-radius: 10px;
          color: #fff;
          font-size: 18px;

          &:focus {
            outline: none;
            border-color: #00ff88;
          }
        }

        .submit-btn {
          padding: 15px 30px;
          background: linear-gradient(135deg, #00bfff 0%, #0066cc 100%);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-weight: bold;
          cursor: pointer;

          &:hover {
            transform: scale(1.05);
          }
        }
      }

      .voice-practice {
        text-align: center;

        .mic-btn {
          padding: 20px 40px;
          background: linear-gradient(135deg, #ff69b4 0%, #c71585 100%);
          border: none;
          border-radius: 50px;
          color: #fff;
          font-size: 18px;
          cursor: pointer;

          &.recording {
            animation: pulse 1s infinite;
          }
        }

        .transcription {
          color: #00ff88;
          margin-top: 15px;
          font-size: 18px;
        }
      }

      .example-sentences {
        margin-top: 25px;
        padding: 15px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 10px;

        h4 {
          color: #ffaa00;
          margin: 0 0 10px;
        }

        p {
          color: #b0b0b0;
          margin: 8px 0;
        }
      }
    }

    .ai-tutor-floating {
      position: fixed;
      bottom: 30px;
      right: 30px;
      padding: 15px 25px;
      background: linear-gradient(135deg, #ff69b4 0%, #c71585 100%);
      border-radius: 30px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 5px 20px rgba(255, 105, 180, 0.4);
      z-index: 100;

      span {
        margin-right: 8px;
      }
    }
  `]
})
export class IdiomasComponent implements OnInit, OnDestroy {
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
    currentRegion: 'GLOBAL',
    currentMapPosition: { x: 0, y: 0 },
    monstersDefeated: 0,
    currentMissionId: '',
    createdAt: new Date()
  };

  selectedLanguage: 'JPN' | 'ENG' | null = null;
  isJapanese = false;
  showTutor = false;
  tutorMessage = '';
  currentQuestion: any = null;
  playerAnswer = '';
  inputMode: 'text' | 'voice' = 'text';
  isRecording = false;
  recordedText = '';

  private subscriptions: Subscription[] = [];
  private completedLessons: string[] = [];

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

  selectLanguage(lang: 'JPN' | 'ENG'): void {
    this.selectedLanguage = lang;
    this.isJapanese = lang === 'JPN';
    this.showTutor = false;
    this.tutorMessage = this.getWelcomeMessage();
  }

  getLanguageName(): string {
    return this.selectedLanguage === 'JPN' ? 'Japonês' : 'Inglês';
  }

  getLessons(): any[] {
    if (!this.selectedLanguage) return [];
    
    const allMissions = this.hunterService.getAllMissions();
    return allMissions
      .filter((m: Mission) => m.skillName === this.selectedLanguage)
      .map((m: Mission, i: number) => ({
        ...m,
        order: i + 1,
        completed: this.completedLessons.includes(m.id),
        current: false
      }));
  }

  getProgress(lang: string): number {
    const lessons = this.getLessons();
    if (lessons.length === 0) return 0;
    const completed = lessons.filter(l => l.completed).length;
    return Math.round((completed / lessons.length) * 100);
  }

  startLesson(lesson: any): void {
    this.currentQuestion = lesson.questions[0];
    this.showTutor = true;
    this.tutorMessage = `Vamos aprender, ${this.hunter.username}! ${lesson.description}`;
    
    if (this.isJapanese) {
      this.voiceService.speakJapanese(this.currentQuestion.expectedAnswer);
    } else {
      this.voiceService.speakEnglish(this.currentQuestion.expectedAnswer);
    }
  }

  getMeaning(word: string): string {
    return this.glitchWardenService.getLanguageTeaching(word, this.selectedLanguage || 'ENG', this.hunter.username);
  }

  startRecording(): void {
    this.isRecording = true;
    const lang = this.isJapanese ? 'ja-JP' : 'en-US';
    
    this.voiceService.listen(lang).then(text => {
      this.recordedText = text;
      this.playerAnswer = text;
      this.isRecording = false;
    }).catch(() => {
      this.isRecording = false;
    });
  }

  stopRecording(): void {
    // Recording stops automatically
  }

  checkAnswer(): void {
    if (!this.currentQuestion || !this.playerAnswer.trim()) return;

    const isCorrect = this.playerAnswer.toLowerCase().trim() === 
      this.currentQuestion.expectedAnswer.toLowerCase().trim();

    if (isCorrect) {
      this.hunterService.addXp(this.currentQuestion.xpReward || 25);
      this.tutorMessage = `🎉 Correto, ${this.hunter.username}! Muito bem!`;
      this.completedLessons.push(this.currentQuestion.id);
      
      if (this.isJapanese) {
        this.voiceService.speakJapanese('Sugoi! (Incrível!)');
      } else {
        this.voiceService.speakEnglish('Excellent!');
      }

      setTimeout(() => {
        this.showTutor = false;
        this.playerAnswer = '';
      }, 2000);
    } else {
      this.hunterService.removeHeart(1);
      this.tutorMessage = `不完全 (不完全)! Tente novamente, ${this.hunter.username}!`;
      
      if (this.isJapanese) {
        this.voiceService.speakJapanese(this.currentQuestion.expectedAnswer);
      }
    }
  }

  getWelcomeMessage(): string {
    if (this.isJapanese) {
      return `${this.hunter.username}-san, bem-vindo à academia de japonês! Vamos aprender juntos?`;
    }
    return `Welcome to the English Academy, ${this.hunter.username}! Let's learn together!`;
  }

  speakIntro(): void {
    const message = this.getWelcomeMessage();
    if (this.isJapanese) {
      this.voiceService.speakJapanese(message);
    } else {
      this.voiceService.speakEnglish(message);
    }
  }

  speakTutorMessage(): void {
    if (this.tutorMessage) {
      if (this.isJapanese) {
        this.voiceService.speakJapanese(this.tutorMessage);
      } else {
        this.voiceService.speakEnglish(this.tutorMessage);
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
