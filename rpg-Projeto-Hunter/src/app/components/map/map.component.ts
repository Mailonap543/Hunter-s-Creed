import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HunterService } from '../../services/hunter.service';
import { VoiceService } from '../../services/voice.service';
import { Hunter, Monster, Mission, Hero, HEROES } from '../../models/hunter.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="map-container" [class]="currentRegionClass">
      <div class="map-background">
        <div class="map-layer"></div>
        <div class="fog-layer"></div>
      </div>

      <header class="map-header">
        <button class="back-btn" (click)="goHome()">🏠 Hub</button>
        <div class="location-info">
          <span class="region-name">{{ getRegionName() }}</span>
          <span class="mission-name">{{ currentMission?.title || 'Nenhuma missão' }}</span>
        </div>
        <div class="stats">
          <span class="hearts">❤️ {{ hunter.hearts }}/5</span>
          <span class="xp">⭐ {{ hunter.xp }}</span>
        </div>
      </header>

      <div class="map-area">
        <canvas #gameCanvas class="game-canvas" 
          (keydown)="onKeyDown($event)"
          (keyup)="onKeyUp($event)"
          tabindex="0"></canvas>

        <div class="controls-hint">
          <span>⬆️⬇️⬅️➡️ Mover</span>
          <span>SPACE Atacar</span>
          <span>E Interagir</span>
        </div>
      </div>

      <div class="side-panel">
        <div class="hero-info">
          <div class="hero-icon">{{ selectedHero?.icon || '⚔️' }}</div>
          <div class="hero-details">
            <h3>{{ hunter.username }}</h3>
            <p>{{ selectedHero?.name || 'Herói' }}</p>
            <span class="level">Nível {{ hunter.level }}</span>
          </div>
        </div>

        <div class="mission-info" *ngIf="currentMission">
          <h4>📌 Missão Atual</h4>
          <p class="mission-title">{{ currentMission.title }}</p>
          <p class="mission-desc">{{ currentMission.description }}</p>
          <div class="mission-rewards">
            <span>+{{ currentMission.xpReward }} XP</span>
            <span>-{{ currentMission.heartPenalty }} ❤️</span>
          </div>
        </div>

        <div class="nearby-monsters">
          <h4>👹 Monstros Próximos</h4>
          <div class="monster-list">
            <div *ngFor="let monster of nearbyMonsters" 
              class="monster-item"
              [class.nearby]="isNearMonster(monster)"
              (click)="challengeMonster(monster)">
              <span class="monster-icon">{{ getMonsterIcon(monster.type) }}</span>
              <div class="monster-info">
                <span class="monster-name">{{ monster.name }}</span>
                <span class="monster-difficulty" [class]="monster.difficulty.toLowerCase()">
                  {{ monster.difficulty }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="action-btn fight" (click)="startCombat()" [disabled]="!nearbyMonsters.length">
            ⚔️ Lutarr!
          </button>
          <button class="action-btn heal" (click)="heal()" [disabled]="hunter.manaPoints < 20">
            💚 Curar (20 Mana)
          </button>
        </div>
      </div>

      <div class="voice-controls">
        <button class="voice-btn" (click)="speakLocation()">🎤 Onde estou?</button>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      font-family: 'Rajdhani', sans-serif;

      &.new-orleans {
        background: linear-gradient(180deg, #1a0f0a 0%, #2d1810 100%);
        .map-background { background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect fill="%231a0f0a"/><circle cx="200" cy="400" r="100" fill="%232d1810" opacity="0.5"/><circle cx="600" cy="300" r="150" fill="%232d1810" opacity="0.5"/></svg>') center/cover; }
      }

      &.tokyo {
        background: linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 100%);
        .map-background { background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect fill="%230a0a1a"/><rect x="100" y="200" width="50" height="200" fill="%23ff1493" opacity="0.3"/><rect x="300" y="100" width="80" height="300" fill="%2300ffff" opacity="0.2"/><rect x="600" y="150" width="60" height="250" fill="%23ff1493" opacity="0.3"/></svg>') center/cover; }
      }

      &.global {
        background: linear-gradient(180deg, #0d0d1a 0%, #1a0a2e 50%, #0d0d1a 100%);
      }
    }

    .map-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.3;

      .map-layer, .fog-layer {
        width: 100%;
        height: 100%;
      }

      .fog-layer {
        animation: fogDrift 30s linear infinite;
      }
    }

    @keyframes fogDrift {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 25px;
      background: rgba(0, 0, 0, 0.6);
      position: relative;
      z-index: 10;

      .back-btn {
        padding: 10px 20px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid #fff;
        border-radius: 10px;
        color: #fff;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }

      .location-info {
        text-align: center;

        .region-name {
          display: block;
          font-family: 'Creepster', cursive;
          font-size: 24px;
          color: #ff3366;
        }

        .mission-name {
          font-size: 14px;
          color: #b0b0b0;
        }
      }

      .stats {
        display: flex;
        gap: 20px;

        span {
          font-size: 18px;
          font-weight: 600;
        }

        .hearts { color: #ff3366; }
        .xp { color: #ffaa00; }
      }
    }

    .map-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 5;

      .game-canvas {
        flex: 1;
        background: transparent;
        outline: none;
      }

      .controls-hint {
        display: flex;
        justify-content: center;
        gap: 30px;
        padding: 10px;
        background: rgba(0, 0, 0, 0.5);
        color: #b0b0b0;
        font-size: 14px;
      }
    }

    .side-panel {
      position: absolute;
      right: 20px;
      top: 80px;
      width: 280px;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 15px;
      padding: 20px;
      z-index: 10;

      .hero-info {
        display: flex;
        align-items: center;
        gap: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 15px;

        .hero-icon {
          font-size: 40px;
        }

        .hero-details {
          h3 {
            color: #fff;
            margin: 0;
          }

          p {
            color: #b0b0b0;
            margin: 5px 0;
            font-size: 14px;
          }

          .level {
            background: #ff3366;
            padding: 2px 10px;
            border-radius: 10px;
            font-size: 12px;
          }
        }
      }

      .mission-info {
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        h4 {
          color: #ffaa00;
          margin: 0 0 10px;
        }

        .mission-title {
          color: #fff;
          font-weight: 600;
          margin: 0 0 5px;
        }

        .mission-desc {
          color: #b0b0b0;
          font-size: 13px;
          margin: 0 0 10px;
        }

        .mission-rewards {
          display: flex;
          gap: 15px;
          font-size: 13px;
          color: #00ff88;
        }
      }

      .nearby-monsters {
        margin-bottom: 15px;

        h4 {
          color: #ff3366;
          margin: 0 0 10px;
        }

        .monster-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .monster-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover, &.nearby {
            background: rgba(255, 51, 102, 0.2);
            border: 1px solid #ff3366;
          }

          .monster-icon {
            font-size: 24px;
          }

          .monster-info {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .monster-name {
              color: #fff;
              font-size: 14px;
            }

            .monster-difficulty {
              font-size: 10px;
              padding: 2px 8px;
              border-radius: 10px;

              &.easy { background: #00ff88; color: #000; }
              &.medium { background: #ffaa00; color: #000; }
              &.hard { background: #ff3366; color: #fff; }
              &.expert { background: #ff0000; color: #fff; }
            }
          }
        }
      }

      .actions {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .action-btn {
          padding: 12px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;

          &.fight {
            background: linear-gradient(135deg, #ff3366 0%, #4a0e4e 100%);
            color: #fff;

            &:hover:not(:disabled) {
              transform: scale(1.02);
            }

            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }

          &.heal {
            background: linear-gradient(135deg, #00ff88 0%, #00aa55 100%);
            color: #000;

            &:hover:not(:disabled) {
              transform: scale(1.02);
            }

            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }
        }
      }
    }

    .voice-controls {
      position: fixed;
      bottom: 30px;
      left: 30px;
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
export class MapComponent implements OnInit, OnDestroy {
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

  currentRegionClass = 'new-orleans';
  selectedHero: Hero | null = null;
  currentMission: Mission | null = null;
  nearbyMonsters: Monster[] = [];

  private playerPos = { x: 300, y: 300 };
  private keys: { [key: string]: boolean } = {};
  private animationFrame: number | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private hunterService: HunterService,
    private voiceService: VoiceService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.hunterService.getHunter().subscribe(hunter => {
        this.hunter = hunter;
        this.playerPos = { ...hunter.currentMapPosition };
        this.updateRegion();
        this.loadNearbyMonsters();
        this.loadCurrentMission();
      })
    );

    this.selectedHero = HEROES.find(h => h.id === this.hunter.heroId) || null;
    this.startGameLoop();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private updateRegion(): void {
    const region = this.hunter.currentRegion;
    this.currentRegionClass = region.toLowerCase().replace('_', '-');
  }

  private loadNearbyMonsters(): void {
    this.nearbyMonsters = this.hunterService.getMonstersByRegion(this.hunter.currentRegion)
      .slice(0, 4);
  }

  private loadCurrentMission(): void {
    const missionId = this.hunter.currentMissionId;
    if (missionId) {
      this.currentMission = this.hunterService.getMissionById(missionId) || null;
    } else {
      const missions = this.hunterService.getMissionsByRegion(this.hunter.currentRegion);
      this.currentMission = missions[0] || null;
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    this.keys[event.key] = true;
    if (event.key === ' ') {
      event.preventDefault();
      this.startCombat();
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    this.keys[event.key] = false;
  }

  private startGameLoop(): void {
    const update = () => {
      this.updatePlayerPosition();
      this.animationFrame = requestAnimationFrame(update);
    };
    update();
  }

  private updatePlayerPosition(): void {
    const speed = 5;
    let moved = false;

    if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
      this.playerPos.y = Math.max(50, this.playerPos.y - speed);
      moved = true;
    }
    if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
      this.playerPos.y = Math.min(550, this.playerPos.y + speed);
      moved = true;
    }
    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
      this.playerPos.x = Math.max(50, this.playerPos.x - speed);
      moved = true;
    }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
      this.playerPos.x = Math.min(750, this.playerPos.x + speed);
      moved = true;
    }

    if (moved) {
      this.hunterService.updateMapPosition(this.playerPos.x, this.playerPos.y);
    }
  }

  isNearMonster(monster: Monster): boolean {
    const monsterPositions = [
      { x: 150, y: 150 },
      { x: 650, y: 200 },
      { x: 200, y: 450 },
      { x: 600, y: 400 }
    ];
    const index = this.nearbyMonsters.indexOf(monster);
    const pos = monsterPositions[index] || { x: 400, y: 300 };
    const distance = Math.sqrt(
      Math.pow(this.playerPos.x - pos.x, 2) + 
      Math.pow(this.playerPos.y - pos.y, 2)
    );
    return distance < 100;
  }

  challengeMonster(monster: Monster): void {
    if (this.isNearMonster(monster)) {
      this.router.navigate(['/battle', monster.id]);
    }
  }

  startCombat(): void {
    if (this.nearbyMonsters.length > 0) {
      const nearestMonster = this.nearbyMonsters.find(m => this.isNearMonster(m)) || this.nearbyMonsters[0];
      this.router.navigate(['/battle', nearestMonster.id]);
    }
  }

  heal(): void {
    if (this.hunter.manaPoints >= 20) {
      this.hunterService.useMana(20);
      this.hunterService.healHearts(1);
      this.voiceService.speak('Você foi curado!');
    }
  }

  getRegionName(): string {
    const names: Record<string, string> = {
      'NEW_ORLEANS': '🌿 New Orleans',
      'TOKYO': '🗾 Tokyo',
      'GLOBAL': '🌑 Hub Central'
    };
    return names[this.hunter.currentRegion] || 'Desconhecido';
  }

  getMonsterIcon(type: string): string {
    const icons: Record<string, string> = {
      'YOKAI': '👺',
      'DEMON': '👹',
      'GHOST': '👻',
      'SPIRIT': '🔮',
      'BUG': '🐛'
    };
    return icons[type] || '👾';
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  speakLocation(): void {
    const message = `Você está em ${this.getRegionName()}. ${this.nearbyMonsters.length} monstros nas proximidades.`;
    this.voiceService.speakCharacter(message, 'glitch');
  }
}
