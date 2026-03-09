import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private synth: SpeechSynthesis;
  private recognition: any = null;
  private isSpeaking = false;
  private isListening = false;

  constructor() {
    this.synth = window.speechSynthesis;
    this.initRecognition();
  }

  private initRecognition(): void {
    const SpeechRecognition = (window as any)['SpeechRecognition'] || (window as any)['webkitSpeechRecognition'];
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'pt-BR';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  isRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  speak(text: string, lang: string = 'pt-BR'): void {
    if (!this.isSupported()) return;

    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = this.synth.getVoices();
    const voice = voices.find((v: SpeechSynthesisVoice) => v.lang.includes(lang.split('-')[0])) || voices[0];
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => { this.isSpeaking = true; };
    utterance.onend = () => { this.isSpeaking = false; };
    utterance.onerror = () => { this.isSpeaking = false; };

    this.synth.speak(utterance);
  }

  speakCharacter(text: string, character: 'glitch' | 'sam' | 'kitsune' = 'glitch'): void {
    const configs: Record<string, { lang: string; rate: number; pitch: number }> = {
      'glitch': { lang: 'pt-BR', rate: 0.85, pitch: 0.9 },
      'sam': { lang: 'en-US', rate: 0.8, pitch: 1.1 },
      'kitsune': { lang: 'ja-JP', rate: 0.9, pitch: 1.2 }
    };

    const config = configs[character];
    
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = config.lang;
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = 1;

    const voices = this.synth.getVoices();
    const voice = voices.find((v: SpeechSynthesisVoice) => v.lang.includes(config.lang.split('-')[0])) || voices[0];
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => { this.isSpeaking = true; };
    utterance.onend = () => { this.isSpeaking = false; };
    utterance.onerror = () => { this.isSpeaking = false; };

    this.synth.speak(utterance);
  }

  speakJapanese(text: string): void {
    this.speak(text, 'ja-JP');
  }

  speakEnglish(text: string): void {
    this.speak(text, 'en-US');
  }

  speakPortuguese(text: string): void {
    this.speak(text, 'pt-BR');
  }

  stop(): void {
    this.synth.cancel();
    this.isSpeaking = false;
  }

  listen(lang: string = 'pt-BR'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      this.recognition.lang = lang;
      this.isListening = true;

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(new Error(event.error));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
    });
  }

  listenJapanese(): Promise<string> {
    return this.listen('ja-JP');
  }

  listenEnglish(): Promise<string> {
    return this.listen('en-US');
  }

  listenPortuguese(): Promise<string> {
    return this.listen('pt-BR');
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}
