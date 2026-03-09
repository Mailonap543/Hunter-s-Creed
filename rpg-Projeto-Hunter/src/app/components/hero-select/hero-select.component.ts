import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { HunterService, GlitchWardenService } from '../../services/hunter.service';
import { VoiceService } from '../../services/voice.service';
import { Hunter, Hero } from '../../models/hunter.model';

@Component({
  selector: 'app-hero-select',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="hero-select-container">
      <div class="background-effects">
        <div class="particles"></div>
      </div>
      
      <header class="header">
        <button class="back-btn" (click)="goBack()">← Voltar</button>
        <h1>🎮 Escolha seu Herói</h1>
        <div class="sound-btn" (click)="toggleSound()">
          {{ soundOn ? '🔊' : '🔇' }}
        </div>
      </header>

      <main class="hero-selection">
        <p class="intro-text">Escolha seu Caçador, {{ hunter.username }}!</p>
        
        <div class="heroes-grid">
          <div 
            *ngFor="let hero of heroes"
            class="hero-card"
            [class.selected]="selectedHero?.id === hero.id"
            [class.locked]="!hero.unlocked"
            [style.--hero-color]="hero.color"
            (click)="selectHero(hero)">
            
            <div class="hero-visual">
              <div class="hero-3d">
                <span class="hero-icon">{{ hero.icon }}</span>
                <div class="hero-shadow"></div>
              </div>
              <div class="hero-weapon">{{ hero.weapon }}</div>
            </div>
            
            <div class="hero-info">
              <h2>{{ hero.name }}</h2>
              <p class="description">{{ hero.description }}</p>
              
              <div class="hero-skills">
                <span *ngFor="let skill of hero.skills" class="skill-badge">
                  {{ skill }}
                </span>
              </div>
              
              <div class="hero-specialty">
                <strong>Especialidade:</strong> {{ hero.specialty }}
              </div>
            </div>
            
            <div class="select-indicator" *ngIf="selectedHero?.id === hero.id">
              ✓ Selecionado
            </div>
            
            <div class="locked-overlay" *ngIf="!hero.unlocked">
              <span>🔒</span>
              <p>Em breve</p>
            </div>
          </div>
        </div>

        <div class="confirm-section" *ngIf="selectedHero">
          <button class="confirm-btn" (click)="confirmHero()">
            Confirmar {{ selectedHero.name }} 🚀
          </button>
        </div>
      </main>

      <div class="voice-toggle">
        <button class="voice-btn" (click)="speakIntro()">
          🎤 Ouvir narração
        </button>
      </div>
    </div>
  `,
  styles: [`
    .hero-select-container {
      min-height: 100vh;
      background: linear-gradient(180deg, #0d0d1a 0%, #1a0a2e 50%, #0d0d1a 100%);
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
      overflow: hidden;
      
      .particles {
        width: 100%;
        height: 100%;
        background-image: 
          radial-gradient(2px 2px at 20% 30%, #00ff88 0%, transparent 100%),
          radial-gradient(2px 2px at 40% 70%, #ff3366 0%, transparent 100%),
          radial-gradient(2px 2px at 60% 20%, #00ff88 0%, transparent 100%),
          radial-gradient(2px 2px at 80% 50%, #ffaa00 0%, transparent 100%);
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
        color: #ff3366;
        font-size: 36px;
        text-shadow: 0 0 20px rgba(255, 51, 102, 0.5);
      }

      .back-btn, .sound-btn {
        padding: 10px 20px;
        background: rgba(255, 51, 102, 0.2);
        border: 2px solid #ff3366;
        border-radius: 10px;
        color: #fff;
        cursor: pointer;
        font-size: 18px;
        transition: all 0.3s;

        &:hover {
          background: rgba(255, 51, 102, 0.4);
        }
      }
    }

    .hero-selection {
      position: relative;
      z-index: 10;

      .intro-text {
        text-align: center;
        color: #b0b0b0;
        font-size: 24px;
        margin-bottom: 30px;
      }
    }

    .heroes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero-card {
      background: linear-gradient(145deg, rgba(26, 10, 46, 0.9) 0%, rgba(13, 13, 26, 0.9) 100%);
      border: 3px solid var(--hero-color);
      border-radius: 20px;
      padding: 25px;
      cursor: pointer;
      transition: all 0.4s ease;
      position: relative;
      overflow: hidden;

      &:hover:not(.locked) {
        transform: translateY(-10px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4),
                    0 0 30px var(--hero-color);
      }

      &.selected {
        border-color: #00ff88;
        box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
      }

      &.locked {
        opacity: 0.6;
        cursor: not-allowed;
        filter: grayscale(0.5);
      }
    }

    .hero-visual {
      text-align: center;
      margin-bottom: 20px;

      .hero-3d {
        position: relative;
        
        .hero-icon {
          font-size: 80px;
          display: block;
          animation: float 3s ease-in-out infinite;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
        }

        .hero-shadow {
          width: 80px;
          height: 20px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%);
          margin: -10px auto 0;
        }
      }

      .hero-weapon {
        margin-top: 15px;
        color: var(--hero-color);
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }

    .hero-info {
      text-align: center;

      h2 {
        font-family: 'Creepster', cursive;
        color: var(--hero-color);
        font-size: 24px;
        margin-bottom: 10px;
      }

      .description {
        color: #b0b0b0;
        font-size: 14px;
        margin-bottom: 15px;
        line-height: 1.5;
      }

      .hero-skills {
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: 15px;

        .skill-badge {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid var(--hero-color);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          color: var(--hero-color);
        }
      }

      .hero-specialty {
        color: #666;
        font-size: 13px;
      }
    }

    .select-indicator {
      position: absolute;
      top: 15px;
      right: 15px;
      background: #00ff88;
      color: #000;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }

    .locked-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
      span {
        font-size: 48px;
        margin-bottom: 10px;
      }
      
      p {
        color: #ffaa00;
        font-weight: 600;
      }
    }

    .confirm-section {
      text-align: center;
      margin-top: 40px;

      .confirm-btn {
        padding: 20px 50px;
        background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
        border: none;
        border-radius: 50px;
        color: #000;
        font-size: 20px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
        }
      }
    }

    .voice-toggle {
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 100;

      .voice-btn {
        padding: 15px 25px;
        background: linear-gradient(135deg, #ff3366 0%, #4a0e4e 100%);
        border: none;
        border-radius: 30px;
        color: #fff;
        font-size: 16px;
        cursor: pointer;
        box-shadow: 0 5px 20px rgba(255, 51, 102, 0.4);

        &:hover {
          transform: scale(1.05);
        }
      }
    }
  `]
})
export class HeroSelectComponent implements OnInit, OnDestroy {
  heroes: Hero[] = [];
  selectedHero: Hero | null = null;
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
    currentMissionId: '',
    createdAt: new Date()
  };

  soundOn = true;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private hunterService: HunterService,
    private glitchWardenService: GlitchWardenService,
    private voiceService: VoiceService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.hunterService.getHeroes().subscribe(heroes => {
        this.heroes = heroes;
      }),
      this.hunterService.getHunter().subscribe(hunter => {
        this.hunter = hunter;
        const selected = this.heroes.find(h => h.id === hunter.heroId);
        if (selected) {
          this.selectedHero = selected;
        }
      })
    );

    if (this.soundOn) {
      setTimeout(() => this.speakIntro(), 1000);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  selectHero(hero: Hero): void {
    if (!hero.unlocked) return;
    this.selectedHero = hero;
    if (this.soundOn) {
      this.voiceService.speak(`Você escolheu ${hero.name}!`);
    }
  }

  confirmHero(): void {
    if (!this.selectedHero) return;
    this.hunterService.setHero(this.selectedHero.id);
    this.router.navigate(['/map']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  toggleSound(): void {
    this.soundOn = !this.soundOn;
    if (!this.soundOn) {
      this.voiceService.stop();
    }
  }

  speakIntro(): void {
    const intro = this.glitchWardenService.getIntroNarrative('GLOBAL', this.hunter.username);
    this.voiceService.speakCharacter(intro, 'glitch');
  }
}
