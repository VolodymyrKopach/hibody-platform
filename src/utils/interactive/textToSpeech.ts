/**
 * Text-to-Speech utility using native Web Speech API
 * Simple, lightweight, no dependencies
 */

interface SpeechOptions {
  text: string;
  language?: 'uk-UA' | 'en-US' | 'ru-RU';
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
}

class TextToSpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.isSupported = true;
    }
  }

  /**
   * Check if TTS is supported in the browser
   */
  isAvailable(): boolean {
    return this.isSupported;
  }

  /**
   * Speak text with options
   */
  speak(options: SpeechOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported || !this.synthesis) {
        console.warn('[TTS] Speech synthesis not supported');
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.cancel();

      // Create utterance
      this.utterance = new SpeechSynthesisUtterance(options.text);

      // Set language
      this.utterance.lang = options.language || 'uk-UA';

      // Set voice parameters for toddlers (slower, higher pitch)
      this.utterance.rate = options.rate || 0.85; // Slower for kids
      this.utterance.pitch = options.pitch || 1.2; // Higher pitch
      this.utterance.volume = options.volume || 1.0;

      // Event listeners
      this.utterance.onend = () => {
        resolve();
      };

      this.utterance.onerror = (event) => {
        console.error('[TTS] Speech error:', event.error);
        reject(event.error);
      };

      // Speak
      try {
        this.synthesis.speak(this.utterance);
      } catch (error) {
        console.error('[TTS] Failed to speak:', error);
        reject(error);
      }
    });
  }

  /**
   * Stop current speech
   */
  cancel(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis?.speaking || false;
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  /**
   * Get voices for specific language
   */
  getVoicesForLanguage(language: string): SpeechSynthesisVoice[] {
    return this.getVoices().filter(voice => 
      voice.lang.startsWith(language.split('-')[0])
    );
  }

  /**
   * Presets for different age groups
   */
  speakForToddler(text: string, language: 'uk-UA' | 'en-US' | 'ru-RU' = 'uk-UA'): Promise<void> {
    return this.speak({
      text,
      language,
      rate: 0.8, // Slower
      pitch: 1.3, // Higher
      volume: 1.0,
    });
  }

  speakForPreschool(text: string, language: 'uk-UA' | 'en-US' | 'ru-RU' = 'uk-UA'): Promise<void> {
    return this.speak({
      text,
      language,
      rate: 0.9,
      pitch: 1.1,
      volume: 1.0,
    });
  }

  speakForElementary(text: string, language: 'uk-UA' | 'en-US' | 'ru-RU' = 'uk-UA'): Promise<void> {
    return this.speak({
      text,
      language,
      rate: 1.0, // Normal
      pitch: 1.0, // Normal
      volume: 1.0,
    });
  }
}

// Singleton instance
export const textToSpeech = new TextToSpeechService();

// Helper functions
export const speakText = (text: string, language?: 'uk-UA' | 'en-US' | 'ru-RU') => {
  return textToSpeech.speak({ text, language });
};

export const speakForAge = (
  text: string, 
  ageStyle: 'toddler' | 'preschool' | 'elementary',
  language?: 'uk-UA' | 'en-US' | 'ru-RU'
) => {
  const lang = language || 'uk-UA';
  
  switch (ageStyle) {
    case 'toddler':
      return textToSpeech.speakForToddler(text, lang);
    case 'preschool':
      return textToSpeech.speakForPreschool(text, lang);
    case 'elementary':
      return textToSpeech.speakForElementary(text, lang);
    default:
      return textToSpeech.speak({ text, language: lang });
  }
};

export const stopSpeaking = () => {
  textToSpeech.cancel();
};

export const isSpeechSupported = () => {
  return textToSpeech.isAvailable();
};

