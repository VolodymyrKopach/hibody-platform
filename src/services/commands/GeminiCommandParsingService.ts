import { GoogleGenAI } from "@google/genai";
import { LessonSlide, SlideCommand } from '../../types/lesson';

export interface CommandParsingResult {
  command: SlideCommand;
  confidence: number;
  language: 'uk' | 'en';
}

/**
 * Gemini 2.5 Flash Lite service for fast and efficient command parsing
 * Replaces Claude Sonnet for natural language command interpretation
 */
export class GeminiCommandParsingService {
  private client: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.client = new GoogleGenAI({ 
      apiKey
    });
  }

  /**
   * Parse natural language commands into structured SlideCommand objects
   */
  async parseCommand(message: string, currentSlide?: LessonSlide): Promise<CommandParsingResult> {
    try {
      const prompt = this.buildCommandParsingPrompt(message, currentSlide);
      
      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash-lite-preview-06-17",
        contents: prompt
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('No response text from Gemini');
      }

      const result = this.parseGeminiResponse(responseText, message);
      
      return {
        command: result,
        confidence: this.calculateConfidence(result, message),
        language: 'uk' // Default to Ukrainian, Gemini will respond in user's language automatically
      };
      
    } catch (error) {
      console.error('Gemini command parsing error:', error);
      throw new Error('Помилка сервісу команд. Спробуйте пізніше.');
    }
  }

  /**
   * Build structured prompt for command parsing (in English for consistency)
   */
  private buildCommandParsingPrompt(message: string, currentSlide?: LessonSlide): string {
    const slideContext = currentSlide ? 
      `Current slide context: "${currentSlide.title}" (slide ${currentSlide.number}, type: ${currentSlide.type})` : 
      'No current slide context';

    return `You are an expert neural network for analyzing user commands related to educational slides in the HiBody platform.

CRITICAL REQUIREMENTS:
- Analyze ONLY the semantic meaning of the command
- Do NOT use pattern matching or regex
- Support ANY language input
- Understand context and intentions, not specific words
- Return responses in the same language as user input (${language})

SLIDE COMMAND TYPES:
1. edit_slide - edit existing slide content
2. improve_slide - enhance/improve slide quality  
3. create_slide - create new slide
4. delete_slide - delete slide
5. reorder_slides - change slide order
6. general - general command not specific to slides

${slideContext}

RESPONSE FORMAT (JSON only):
{
  "type": "edit_slide",
  "slideNumber": 1,
  "slideId": null,
  "instruction": "interpreted instruction in ${language}",
  "context": "${message}",
  "targetElement": "specific element to target or null"
}

EXAMPLES:
- "Покращ слайд 2" → {"type": "improve_slide", "slideNumber": 2, "instruction": "покращити слайд"}
- "Make the elephant bigger" → {"type": "edit_slide", "targetElement": "elephant", "instruction": "make the elephant bigger"}
- "Створи новий слайд про космос" → {"type": "create_slide", "instruction": "створити слайд про космос"}

Analyze this command: "${message}"

Return only valid JSON response:`;
  }

  /**
   * Parse Gemini API response and extract SlideCommand
   */
  private parseGeminiResponse(responseText: string, originalMessage: string): SlideCommand {
    try {
      // Find JSON in response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        type: parsed.type || 'general',
        slideNumber: parsed.slideNumber || null,
        slideId: parsed.slideId || null,
        instruction: parsed.instruction || originalMessage,
        context: parsed.context || originalMessage,
        targetElement: parsed.targetElement || null,
      };
      
    } catch (error) {
      console.error('Failed to parse Gemini JSON response:', error);
      throw new Error(`Invalid JSON response from Gemini: ${responseText}`);
    }
  }

  /**
   * Detect language of user message
   */
  private detectLanguage(message: string): 'uk' | 'en' {
    // Ukrainian language patterns
    const ukrainianPatterns = [
      /[іїєґ]/,
      /\b(і|в|на|з|до|від|про|при|для|під|над|між|через|серед|після|перед|біля)\b/,
      /(покращ|зроб|створ|видал|додай|змін|переміст)/i,
    ];

    // Check for Ukrainian characteristics
    const hasUkrainianChars = ukrainianPatterns.some(pattern => pattern.test(message));
    
    return hasUkrainianChars ? 'uk' : 'en';
  }

  /**
   * Calculate confidence score based on command parsing quality
   */
  private calculateConfidence(command: SlideCommand, originalMessage: string): number {
    let confidence = 0.5; // Base confidence
    
    // Higher confidence for specific commands
    if (command.type !== 'general') confidence += 0.2;
    if (command.slideNumber) confidence += 0.2;
    if (command.targetElement) confidence += 0.1;
    
    // Lower confidence for very short or unclear messages
    if (originalMessage.length < 5) confidence -= 0.2;
    if (command.instruction === originalMessage) confidence -= 0.1;
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }



  /**
   * Get quick command suggestions for UI
   */
  getQuickCommands(currentSlide?: LessonSlide, language: 'uk' | 'en' = 'uk'): string[] {
    const commands = language === 'uk' ? {
      improve: 'Покращ дизайн',
      color: 'Зміни колір фону', 
      animation: 'Додай анімацію',
      text: 'Зроби більшим текст',
      image: 'Додай зображення',
      specific: currentSlide ? `Підправ слайд ${currentSlide.number}` : null,
      gameEffects: 'Додай звукові ефекти',
      gameComplexity: 'Ускладни гру',
      examples: 'Додай приклади',
      interactive: 'Зроби інтерактивним'
    } : {
      improve: 'Improve design',
      color: 'Change background color',
      animation: 'Add animation', 
      text: 'Make text bigger',
      image: 'Add image',
      specific: currentSlide ? `Fix slide ${currentSlide.number}` : null,
      gameEffects: 'Add sound effects',
      gameComplexity: 'Make game harder',
      examples: 'Add examples',
      interactive: 'Make interactive'
    };

    const result = [
      commands.improve,
      commands.color,
      commands.animation,
      commands.text,
      commands.image
    ];

    if (commands.specific) {
      result.unshift(commands.specific);
    }

    if (currentSlide?.type === 'game') {
      result.push(commands.gameEffects, commands.gameComplexity);
    }

    if (currentSlide?.type === 'content') {
      result.push(commands.examples, commands.interactive);
    }

    return result;
  }
}

export default GeminiCommandParsingService; 