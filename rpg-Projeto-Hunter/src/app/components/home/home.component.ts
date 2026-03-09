import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { HunterService, GlitchWardenService } from '../../services/hunter.service';
import { VoiceService } from '../../services/voice.service';
import { Hunter, Hero } from '../../models/hunter.model';

interface GameCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  difficulty: string;
  lore: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  gameCards: GameCard[] = [
    {
      id: 'new-orleans',
      title: '🌿 New Orleans',
      description: 'The Bayou Code - Java, Spring Boot e Inglês. Derrote demônios de código legado!',
      icon: '🦇',
      color: '#8b4513',
      route: '/map',
      difficulty: 'Java • Spring Boot • SQL',
      lore: 'O Bayou esconde segredos sombrios...'
    },
    {
      id: 'tokyo',
      title: '🗾 Tokyo',
      description: 'Neon Spirits - Angular, React e Japonês. Os espíritos de Shibuya te aguardam!',
      icon: '🏮',
      color: '#ff1493',
      route: '/map',
      difficulty: 'Angular • React • TypeScript',
      lore: 'As luzes de Shibuya ocultam perigos...'
    },
    {
      id: 'programacao',
      title: '💻 Programação',
      description: 'Academia Fullstack - Java, Spring, Angular, React, Node e mais!',
      icon: '⚡',
      color: '#a855f7',
      route: '/programacao',
      difficulty: 'Java • Angular • React • Spring • Node',
      lore: 'O conhecimento é poder...'
    },
    {
      id: 'idiomas',
      title: '📚 Idiomas',
      description: 'Academia de Línguas - Japonês e Inglês com IA tutora!',
      icon: '🎓',
      color: '#00bfff',
      route: '/idiomas',
      difficulty: 'Japonês • Inglês',
      lore: 'As palavras têm poder...'
    }
  ];

  achievements = [
    { id: 'first_blood', name: 'Primeiro Sangue', icon: '🗡️', unlocked: true },
    { id: 'study_intensive', name: 'Estudo Intensivo', icon: '📚', unlocked: true },
    { id: 'polyglot', name: 'Poliglota', icon: '🌍', unlocked: false },
    { id: 'code_wizard', name: 'Mago do Código', icon: '🧙', unlocked: false },
    { id: 'survivor', name: 'Sobrevivente', icon: '💀', unlocked: false },
    { id: 'master_hunter', name: 'Caçador Mestre', icon: '👑', unlocked: false },
    { id: 'glitch_slayer', name: 'Caçador de Glitches', icon: '👾', unlocked: false },
    { id: 'voice_hero', name: 'Herói da Voz', icon: '🎤', unlocked: false }
  ];

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

  currentNarratorText = '';
  showLoginModal = false;
  showProfileModal = false;
  loginData = { email: '', password: '' };
  registerData = { username: '', email: '', password: '' };
  isRegisterMode = false;
  isPlaying = false;
  isLoggedIn = false;
  soundOn = true;
  selectedHero: Hero | null = null;

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
      this.authService.getIsLoggedIn().subscribe(loggedIn => {
        this.isLoggedIn = loggedIn;
        if (loggedIn) {
          this.loadHunterData();
        }
      }),
      this.authService.getCurrentUser().subscribe(user => {
        if (user) {
          this.hunter.username = user.username;
        }
      }),
      this.hunterService.getHunter().subscribe(hunter => {
        this.hunter = hunter;
        this.updateNarratorText();
      }),
      this.hunterService.getHeroes().subscribe(heroes => {
        this.selectedHero = heroes.find(h => h.id === this.hunter.heroId) || null;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadHunterData(): void {
    const savedHunter = localStorage.getItem('shadowCode_hunter');
    if (savedHunter) {
      this.hunter = JSON.parse(savedHunter);
    }
  }

  private updateNarratorText(): void {
    if (!this.isLoggedIn) {
      this.currentNarratorText = 'Bem-vindo ao Shadow Code! Faça login para começar sua jornada.';
    } else {
      this.currentNarratorText = this.glitchWardenService.getIntroNarrative('GLOBAL', this.hunter.username);
    }
  }

  selectCard(card: GameCard): void {
    if (!this.isLoggedIn) {
      this.showLoginModal = true;
      return;
    }

    if (!this.hunter.heroId) {
      this.router.navigate(['/hero-select']);
      return;
    }

    this.isPlaying = true;
    this.hunterService.setRegion(card.id === 'new-orleans' ? 'NEW_ORLEANS' : card.id === 'tokyo' ? 'TOKYO' : 'GLOBAL');
    this.currentNarratorText = `${card.lore} Preparando acesso a ${card.title}...`;

    setTimeout(() => {
      this.router.navigate([card.route], { queryParams: { region: card.id } });
      this.isPlaying = false;
    }, 1500);
  }

  openLoginModal(): void {
    this.showLoginModal = true;
    this.isRegisterMode = false;
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  toggleRegisterMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
  }

  login(): void {
    if (!this.loginData.email || !this.loginData.password) {
      alert('Preencha todos os campos!');
      return;
    }

    const success = this.authService.login(this.loginData.email, this.loginData.password);
    if (success) {
      this.showLoginModal = false;
      this.loginData = { email: '', password: '' };
      if (this.soundOn) {
        this.voiceService.speak(`Bem-vindo de volta, ${this.hunter.username}!`);
      }
    } else {
      alert('Email ou senha incorretos!');
    }
  }

  register(): void {
    if (!this.registerData.username || !this.registerData.email || !this.registerData.password) {
      alert('Preencha todos os campos!');
      return;
    }

    const success = this.authService.register(this.registerData.username, this.registerData.email, this.registerData.password);
    if (success) {
      this.showLoginModal = false;
      this.registerData = { username: '', email: '', password: '' };
      this.router.navigate(['/hero-select']);
      if (this.soundOn) {
        this.voiceService.speak(`Bem-vindo, ${this.hunter.username}! Escolha seu herói.`);
      }
    } else {
      alert('Este email já está cadastrado!');
    }
  }

  openProfile(): void {
    this.showProfileModal = true;
  }

  closeProfile(): void {
    this.showProfileModal = false;
  }

  logout(): void {
    this.authService.logout();
    this.showProfileModal = false;
    this.router.navigate(['/']);
  }

  goToHeroSelect(): void {
    this.router.navigate(['/hero-select']);
  }

  getUnlockedAchievements(): number {
    return this.achievements.filter(a => a.unlocked).length;
  }

  getXpProgress(): number {
    const xpForNextLevel = this.hunter.level * 100;
    const xpInCurrentLevel = this.hunter.xp % 100;
    return (xpInCurrentLevel / xpForNextLevel) * 100;
  }

  getHeartsDisplay(): string {
    return '❤️'.repeat(this.hunter.hearts) + '🖤'.repeat(this.hunter.maxHearts - this.hunter.hearts);
  }

  getManaDisplay(): number {
    return Math.round((this.hunter.manaPoints / this.hunter.maxManaPoints) * 100);
  }

  getRegionName(region: string): string {
    const names: Record<string, string> = {
      'NEW_ORLEANS': 'New Orleans',
      'TOKYO': 'Tokyo',
      'GLOBAL': 'Hub Central'
    };
    return names[region] || 'Hub Central';
  }

  toggleSound(): void {
    this.soundOn = !this.soundOn;
    if (!this.soundOn) {
      this.voiceService.stop();
    }
  }
}
