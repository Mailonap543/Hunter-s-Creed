import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as THREE from 'three';

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Yokai {
  name: string;
  hp: number;
  model: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameState {
  score: number;
  hearts: number;
  phase: number;
  currentQuestion: Question | null;
  currentYokai: Yokai | null;
  isPlaying: boolean;
}

@Component({
  selector: 'app-game-3d',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-3d.component.html',
  styleUrls: ['./game-3d.component.scss']
})
export class Game3dComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') gameCanvas!: ElementRef<HTMLCanvasElement>;
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private yokaiMesh!: THREE.Group;
  private animationId!: number;
  
  gameState: GameState = {
    score: 0,
    hearts: 5,
    phase: 1,
    currentQuestion: null,
    currentYokai: null,
    isPlaying: false
  };
  
  categories = ['japanese', 'english', 'programming'];
  currentCategory = 'programming';
  
  yokais: Yokai[] = [
    { name: 'Kappa', hp: 1, model: 'kappa', difficulty: 'easy' },
    { name: 'Tanuki', hp: 1, model: 'tanuki', difficulty: 'easy' },
    { name: 'Oni', hp: 2, model: 'oni', difficulty: 'medium' },
    { name: 'Yurei', hp: 2, model: 'yurei', difficulty: 'medium' },
    { name: 'Tengu', hp: 3, model: 'tengu', difficulty: 'hard' },
    { name: 'Gashadokuro', hp: 5, model: 'gashadokuro', difficulty: 'hard' }
  ];
  
  questions: Question[] = [
    {
      id: 1,
      question: 'Qual é a saída deste código Java?\n\nString s = "Hunter";\nSystem.out.println(s.length());',
      options: ['4', '5', '6', '7'],
      correctAnswer: 2,
      explanation: 'O método length() retorna o número de caracteres. "Hunter" tem 6 letras.',
      category: 'java',
      difficulty: 'easy'
    },
    {
      id: 2,
      question: 'No Angular, qual decorator é usado para injetar um serviço?',
      options: ['@Injectable()', '@Component()', '@Input()', '@Output()'],
      correctAnswer: 0,
      explanation: '@Injectable() marca a classe como disponível para injeção de dependência.',
      category: 'angular',
      difficulty: 'easy'
    },
    {
      id: 3,
      question: 'Qual hook do React é usado para efeitos colaterais?',
      options: ['useState', 'useEffect', 'useContext', 'useReducer'],
      correctAnswer: 1,
      explanation: 'useEffect é usado para executar código após a renderização (side effects).',
      category: 'react',
      difficulty: 'easy'
    },
    {
      id: 4,
      question: 'No Spring Boot, qual anotação cria um endpoint REST?',
      options: ['@Service', '@Repository', '@RestController', '@Component'],
      correctAnswer: 2,
      explanation: '@RestController combina @Controller e @ResponseBody para APIs REST.',
      category: 'spring',
      difficulty: 'medium'
    },
    {
      id: 5,
      question: 'O que faz o método stream() em Java Collections?',
      options: ['Cria uma lista', 'Permite operações funcionais', 'Ordena a lista', 'Remove duplicatas'],
      correctAnswer: 1,
      explanation: 'stream() permite operações funcionals como map, filter, reduce.',
      category: 'java',
      difficulty: 'medium'
    }
  ];
  
  japaneseQuestions: Question[] = [
    {
      id: 101,
      question: 'Como se diz "gato" em japonês?',
      options: ['いぬ', 'ねこ', 'とり', 'さかな'],
      correctAnswer: 1,
      explanation: 'ねこ (neko) significa gato em japonês.',
      category: 'japanese',
      difficulty: 'easy'
    },
    {
      id: 102,
      question: 'Qual é o romaji de " água"?',
      options: ['mizu', 'hi', 'kaze', 'yuki'],
      correctAnswer: 0,
      explanation: '水 (mizu) significa água.',
      category: 'japanese',
      difficulty: 'easy'
    }
  ];
  
  englishQuestions: Question[] = [
    {
      id: 201,
      question: 'Complete: "She ___ to the store yesterday."',
      options: ['go', 'goes', 'went', 'going'],
      correctAnswer: 2,
      explanation: '"Went" é o passado de "go".',
      category: 'english',
      difficulty: 'easy'
    }
  ];
  
  showExplanation = false;
  explanationText = '';
  showVoiceUI = false;
  voiceText = '';
  isListening = false;
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    this.gameState.hearts = 5;
    this.gameState.score = 0;
    this.gameState.phase = 1;
  }
  
  ngAfterViewInit(): void {
    this.initThreeJS();
    this.startGame();
  }
  
  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
  
  private initThreeJS(): void {
    const canvas = this.gameCanvas.nativeElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d0d1a);
    this.scene.fog = new THREE.FogExp2(0x1a0a2e, 0.02);
    
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 2, 5);
    this.camera.lookAt(0, 1, 0);
    
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    
    const ambientLight = new THREE.AmbientLight(0x4a0e4e, 0.5);
    this.scene.add(ambientLight);
    
    const moonLight = new THREE.DirectionalLight(0xff3366, 1);
    moonLight.position.set(5, 10, 5);
    moonLight.castShadow = true;
    this.scene.add(moonLight);
    
    const redLight = new THREE.PointLight(0xff0000, 0.5, 20);
    redLight.position.set(-3, 2, 0);
    this.scene.add(redLight);
    
    this.createEnvironment();
    this.createYokai('Kappa');
    
    this.animate();
  }
  
  private createEnvironment(): void {
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a0a2e,
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    const treeGeometry = new THREE.CylinderGeometry(0.1, 0.3, 4, 8);
    const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x2a1a3e });
    
    for (let i = 0; i < 20; i++) {
      const tree = new THREE.Mesh(treeGeometry, treeMaterial);
      tree.position.set(
        (Math.random() - 0.5) * 30,
        2,
        (Math.random() - 0.5) * 30 - 10
      );
      tree.castShadow = true;
      this.scene.add(tree);
    }
    
    const toriiGeometry = new THREE.BoxGeometry(4, 0.2, 0.3);
    const toriiMaterial = new THREE.MeshStandardMaterial({ color: 0xff3366 });
    const torii = new THREE.Mesh(toriiGeometry, toriiMaterial);
    torii.position.set(0, 3, -8);
    this.scene.add(torii);
  }
  
  private createYokai(name: string): void {
    if (this.yokaiMesh) {
      this.scene.remove(this.yokaiMesh);
    }
    
    this.yokaiMesh = new THREE.Group();
    
    const colors: { [key: string]: number } = {
      'Kappa': 0x00ff88,
      'Tanuki': 0xffaa00,
      'Oni': 0xff0000,
      'Yurei': 0x88ccff,
      'Tengu': 0xff4444,
      'Gashadokuro': 0x888888
    };
    
    const bodyGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: colors[name] || 0xff0000,
      emissive: colors[name] || 0xff0000,
      emissiveIntensity: 0.3,
      roughness: 0.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.2;
    body.castShadow = true;
    this.yokaiMesh.add(body);
    
    const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.8
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 1.4, 0.6);
    this.yokaiMesh.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 1.4, 0.6);
    this.yokaiMesh.add(rightEye);
    
    const pupilGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const pupilMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x000000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5
    });
    
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.3, 1.4, 0.7);
    this.yokaiMesh.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.3, 1.4, 0.7);
    this.yokaiMesh.add(rightPupil);
    
    this.scene.add(this.yokaiMesh);
  }
  
  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    if (this.yokaiMesh) {
      this.yokaiMesh.position.y = 1 + Math.sin(Date.now() * 0.002) * 0.1;
      this.yokaiMesh.rotation.y += 0.01;
    }
    
    this.renderer.render(this.scene, this.camera);
  }
  
  startGame(): void {
    this.gameState.isPlaying = true;
    this.nextQuestion();
  }
  
  setCategory(category: string): void {
    this.currentCategory = category;
    this.showVoiceUI = category === 'japanese';
    this.nextQuestion();
  }
  
  nextQuestion(): void {
    let questionPool = this.questions;
    
    if (this.currentCategory === 'japanese') {
      questionPool = this.japaneseQuestions;
    } else if (this.currentCategory === 'english') {
      questionPool = this.englishQuestions;
    }
    
    const randomIndex = Math.floor(Math.random() * questionPool.length);
    this.gameState.currentQuestion = questionPool[randomIndex];
    this.showExplanation = false;
    
    const randomYokai = this.yokais[Math.floor(Math.random() * 3)];
    this.gameState.currentYokai = { ...randomYokai };
    this.createYokai(randomYokai.name);
  }
  
  selectAnswer(index: number): void {
    if (!this.gameState.currentQuestion || this.showExplanation) return;
    
    const isCorrect = index === this.gameState.currentQuestion.correctAnswer;
    
    if (isCorrect) {
      this.gameState.score += 10;
      this.animateAttack();
      setTimeout(() => {
        if (this.gameState.currentYokai) {
          this.gameState.currentYokai.hp--;
          if (this.gameState.currentYokai.hp <= 0) {
            this.yokaiDefeated();
          } else {
            this.nextQuestion();
          }
        }
      }, 1000);
    } else {
      this.gameState.hearts--;
      this.explanationText = this.gameState.currentQuestion.explanation;
      this.showExplanation = true;
      this.speakExplication(this.gameState.currentQuestion.explanation);
      
      if (this.gameState.hearts <= 0) {
        this.gameOver();
      }
    }
  }
  
  private animateAttack(): void {
    if (this.yokaiMesh) {
      const originalColor = (this.yokaiMesh.children[0] as THREE.Mesh).material;
      (this.yokaiMesh.children[0] as THREE.Mesh).material = 
        new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 1 });
      
      setTimeout(() => {
        if (this.yokaiMesh && this.yokaiMesh.children[0]) {
          (this.yokaiMesh.children[0] as THREE.Mesh).material = originalColor;
        }
      }, 500);
    }
  }
  
  yokaiDefeated(): void {
    if (this.yokaiMesh) {
      this.yokaiMesh.scale.set(0, 0, 0);
    }
    
    if (this.gameState.score >= this.gameState.phase * 10) {
      this.gameState.phase++;
    }
    
    setTimeout(() => {
      this.nextQuestion();
    }, 1500);
  }
  
  private speakExplication(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }
  
  startListening(): void {
    if (!('webkitSpeechRecognition' in window)) {
      this.voiceText = 'Reconhecimento de voz não suportado';
      return;
    }
    
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    
    this.isListening = true;
    
    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      this.voiceText = result;
      this.evaluatePronunciation(result);
    };
    
    recognition.onerror = () => {
      this.isListening = false;
      this.voiceText = 'Erro no reconhecimento';
    };
    
    recognition.onend = () => {
      this.isListening = false;
    };
    
    recognition.start();
  }
  
  private evaluatePronunciation(spoken: string): void {
    const expected = this.gameState.currentQuestion?.options[this.gameState.currentQuestion.correctAnswer] || '';
    
    if (spoken.toLowerCase().includes(expected.toLowerCase())) {
      this.gameState.score += 10;
      this.voiceText = 'Excelente! Muito bem!';
      setTimeout(() => this.nextQuestion(), 1500);
    } else {
      this.gameState.hearts--;
      this.voiceText = `Tente novamente. A pronúncia correta é: ${expected}`;
      if (this.gameState.hearts <= 0) {
        this.gameOver();
      }
    }
  }
  
  gameOver(): void {
    this.gameState.isPlaying = false;
    this.router.navigate(['/game-over'], { 
      queryParams: { score: this.gameState.score, phase: this.gameState.phase } 
    });
  }
  
  returnToMenu(): void {
    this.router.navigate(['/']);
  }
  
  getHearts(): number[] {
    return Array(5).fill(0).map((_, i) => i < this.gameState.hearts ? 1 : 0);
  }
}
