/**
 * Sound Service for Interactive Worksheets
 * Uses Web Audio API to generate sounds programmatically (no external files needed)
 */

export type SoundEffect = 
  | 'success'
  | 'tap'
  | 'drop'
  | 'wrong'
  | 'celebration'
  | 'animal-cat'
  | 'animal-dog'
  | 'animal-cow'
  | 'animal-bird'
  | 'praise-great'
  | 'praise-wonderful'
  | 'praise-youdid it';

export interface SoundConfig {
  volume?: number; // 0-1
  loop?: boolean;
  playbackRate?: number; // 0.5-2.0
}

class SoundService {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private globalVolume: number = 0.7;

  constructor() {
    this.initAudioContext();
  }

  /**
   * Initialize Web Audio API context
   */
  private initAudioContext(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      } else {
        console.warn('Web Audio API not supported in this browser');
        this.enabled = false;
      }
    } catch (error) {
      console.warn('Failed to initialize Web Audio API:', error);
      this.enabled = false;
    }
  }

  /**
   * Resume audio context (required for user interaction in some browsers)
   */
  private async resumeContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Create oscillator with envelope (ADSR)
   */
  private playTone(
    frequency: number,
    duration: number,
    volume: number = 1,
    type: OscillatorType = 'sine',
    attack: number = 0.01,
    release: number = 0.1
  ): void {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    const now = this.audioContext.currentTime;
    const adjustedVolume = volume * this.globalVolume;

    // ADSR envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(adjustedVolume, now + attack);
    gainNode.gain.setValueAtTime(adjustedVolume, now + duration - release);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  /**
   * Play success sound (happy chord)
   */
  private playSuccessSound(): void {
    // C major chord (C5, E5, G5)
    this.playTone(523.25, 0.3, 0.3, 'sine'); // C5
    this.playTone(659.25, 0.3, 0.2, 'sine'); // E5
    this.playTone(783.99, 0.3, 0.2, 'sine'); // G5
  }

  /**
   * Play tap sound (short click)
   */
  private playTapSound(): void {
    this.playTone(800, 0.05, 0.2, 'square', 0.001, 0.01);
  }

  /**
   * Play drop sound (falling pitch)
   */
  private playDropSound(): void {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    oscillator.frequency.setValueAtTime(600, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.2);

    gainNode.gain.setValueAtTime(0.3 * this.globalVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }

  /**
   * Play wrong sound (dissonant)
   */
  private playWrongSound(): void {
    this.playTone(200, 0.2, 0.3, 'sawtooth');
    setTimeout(() => this.playTone(180, 0.2, 0.2, 'sawtooth'), 50);
  }

  /**
   * Play celebration sound (happy melody)
   */
  private playCelebrationSound(): void {
    const notes = [
      { freq: 523.25, time: 0 },    // C5
      { freq: 587.33, time: 0.15 },  // D5
      { freq: 659.25, time: 0.3 },   // E5
      { freq: 783.99, time: 0.45 },  // G5
      { freq: 1046.5, time: 0.6 },   // C6
    ];

    notes.forEach(({ freq, time }) => {
      setTimeout(() => this.playTone(freq, 0.2, 0.25, 'sine'), time * 1000);
    });
  }

  /**
   * Play animal sounds (synthesized approximations)
   */
  private playAnimalSound(animal: 'cat' | 'dog' | 'cow' | 'bird'): void {
    if (!this.audioContext || !this.enabled) return;

    switch (animal) {
      case 'cat':
        // Meow approximation (high pitch with vibrato)
        this.playTone(800, 0.3, 0.3, 'triangle');
        setTimeout(() => this.playTone(600, 0.2, 0.2, 'triangle'), 100);
        break;

      case 'dog':
        // Bark approximation (low gruff sound)
        this.playTone(180, 0.15, 0.4, 'sawtooth');
        setTimeout(() => this.playTone(200, 0.15, 0.3, 'sawtooth'), 150);
        break;

      case 'cow':
        // Moo approximation (low sustained tone)
        this.playTone(220, 0.5, 0.3, 'sawtooth');
        setTimeout(() => this.playTone(200, 0.3, 0.25, 'sawtooth'), 200);
        break;

      case 'bird':
        // Chirp approximation (high quick notes)
        this.playTone(2000, 0.08, 0.2, 'sine');
        setTimeout(() => this.playTone(2400, 0.08, 0.2, 'sine'), 80);
        setTimeout(() => this.playTone(1800, 0.08, 0.15, 'sine'), 160);
        break;
    }
  }

  /**
   * Play praise sound (cheerful trill)
   */
  private playPraiseSound(variant: number = 1): void {
    const patterns = [
      [523.25, 659.25, 783.99], // C major arpeggio
      [587.33, 739.99, 880.0],  // D major arpeggio
      [659.25, 830.61, 987.77], // E major arpeggio
    ];

    const pattern = patterns[variant % patterns.length];
    pattern.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 0.2, 'sine'), i * 100);
    });
  }

  /**
   * Play a sound by ID
   */
  async play(soundId: string, config: SoundConfig = {}): Promise<void> {
    if (!this.enabled || !this.audioContext) return;

    try {
      await this.resumeContext();

      const effect = soundId as SoundEffect;
      
      switch (effect) {
        case 'success':
          this.playSuccessSound();
          break;
        case 'tap':
          this.playTapSound();
          break;
        case 'drop':
          this.playDropSound();
          break;
        case 'wrong':
          this.playWrongSound();
          break;
        case 'celebration':
          this.playCelebrationSound();
          break;
        case 'animal-cat':
          this.playAnimalSound('cat');
          break;
        case 'animal-dog':
          this.playAnimalSound('dog');
          break;
        case 'animal-cow':
          this.playAnimalSound('cow');
          break;
        case 'animal-bird':
          this.playAnimalSound('bird');
          break;
        case 'praise-great':
          this.playPraiseSound(0);
          break;
        case 'praise-wonderful':
          this.playPraiseSound(1);
          break;
        case 'praise-youdid it':
          this.playPraiseSound(2);
          break;
        default:
          console.warn(`Unknown sound effect: ${soundId}`);
      }
    } catch (error) {
      console.error(`❌ [SoundService] Failed to play ${soundId}:`, error);
    }
  }

  /**
   * Preload a sound (not needed for Web Audio API, but kept for compatibility)
   */
  async preload(soundId: string, url?: string): Promise<void> {
    // Web Audio API generates sounds on-the-fly, no preloading needed
    console.log(`✅ [SoundService] Sound ready: ${soundId}`);
  }

  /**
   * Preload multiple sounds (kept for compatibility)
   */
  async preloadMultiple(sounds: Array<{ id: string; url?: string }>): Promise<void> {
    // No-op for Web Audio API
    console.log(`✅ [SoundService] All sounds ready`);
  }

  /**
   * Stop all sounds
   */
  stopAll(): void {
    // Web Audio API sounds are self-terminating
    // This method is kept for compatibility but doesn't need to do anything
  }

  /**
   * Set global volume
   */
  setVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Enable/disable sound
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  /**
   * Is sound enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Text-to-speech (using Web Speech API)
   */
  speak(text: string, options: {
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        console.warn('Text-to-speech not supported');
        reject(new Error('TTS not supported'));
        return;
      }

      if (!this.enabled) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate || 0.9; // Slightly slower for children
      utterance.pitch = options.pitch || 1.2; // Slightly higher for children
      utterance.volume = (options.volume || 1) * this.globalVolume;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => {
        console.error('[SoundService] TTS error:', error);
        reject(error);
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Stop speaking
   */
  stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Play random praise sound
   */
  async playRandomPraise(): Promise<void> {
    const praiseSounds: SoundEffect[] = [
      'praise-great',
      'praise-wonderful',
      'praise-youdid it',
    ];
    const randomSound = praiseSounds[Math.floor(Math.random() * praiseSounds.length)];
    await this.play(randomSound);
  }

  /**
   * Play correct answer sound
   */
  async playCorrect(): Promise<void> {
    await this.play('success');
  }

  /**
   * Play error/wrong answer sound
   */
  async playError(): Promise<void> {
    await this.play('wrong');
  }

  /**
   * Play success/completion sound
   */
  async playSuccess(): Promise<void> {
    await this.play('celebration');
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Singleton instance
export const soundService = new SoundService();

export default soundService;

