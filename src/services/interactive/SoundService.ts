/**
 * Sound Service for Interactive Worksheets
 * Manages sound effects, voice instructions, and audio playback
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
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private globalVolume: number = 0.7;
  
  // Preset sound URLs (these would be replaced with actual audio files)
  private presets: Record<SoundEffect, string> = {
    success: '/sounds/success.mp3',
    tap: '/sounds/tap.mp3',
    drop: '/sounds/drop.mp3',
    wrong: '/sounds/wrong.mp3',
    celebration: '/sounds/celebration.mp3',
    'animal-cat': '/sounds/animals/cat.mp3',
    'animal-dog': '/sounds/animals/dog.mp3',
    'animal-cow': '/sounds/animals/cow.mp3',
    'animal-bird': '/sounds/animals/bird.mp3',
    'praise-great': '/sounds/praise/great.mp3',
    'praise-wonderful': '/sounds/praise/wonderful.mp3',
    'praise-youdid it': '/sounds/praise/you-did-it.mp3',
  };

  constructor() {
    this.checkAudioSupport();
  }

  /**
   * Check if browser supports audio
   */
  private checkAudioSupport(): boolean {
    try {
      const audio = new Audio();
      return !!audio.canPlayType;
    } catch (error) {
      console.warn('Audio not supported in this browser');
      this.enabled = false;
      return false;
    }
  }

  /**
   * Preload a sound
   */
  async preload(soundId: string, url?: string): Promise<void> {
    if (!this.enabled) return;

    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url || this.presets[soundId as SoundEffect] || '';
      
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', reject, { once: true });
      });

      this.sounds.set(soundId, audio);
      console.log(`✅ [SoundService] Preloaded: ${soundId}`);
    } catch (error) {
      console.error(`❌ [SoundService] Failed to preload ${soundId}:`, error);
    }
  }

  /**
   * Preload multiple sounds
   */
  async preloadMultiple(sounds: Array<{ id: string; url?: string }>): Promise<void> {
    const promises = sounds.map(({ id, url }) => this.preload(id, url));
    await Promise.allSettled(promises);
  }

  /**
   * Play a sound
   */
  async play(soundId: string, config: SoundConfig = {}): Promise<void> {
    if (!this.enabled) return;

    try {
      let audio = this.sounds.get(soundId);

      // If not preloaded, create and play immediately
      if (!audio) {
        audio = new Audio(this.presets[soundId as SoundEffect] || '');
        this.sounds.set(soundId, audio);
      }

      // Reset audio to beginning
      audio.currentTime = 0;

      // Apply config
      audio.volume = (config.volume ?? 1) * this.globalVolume;
      audio.loop = config.loop ?? false;
      audio.playbackRate = config.playbackRate ?? 1.0;

      // Play
      await audio.play();
    } catch (error) {
      console.error(`❌ [SoundService] Failed to play ${soundId}:`, error);
    }
  }

  /**
   * Stop a sound
   */
  stop(soundId: string): void {
    const audio = this.sounds.get(soundId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /**
   * Stop all sounds
   */
  stopAll(): void {
    this.sounds.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
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
    this.sounds.clear();
  }
}

// Singleton instance
export const soundService = new SoundService();

export default soundService;

