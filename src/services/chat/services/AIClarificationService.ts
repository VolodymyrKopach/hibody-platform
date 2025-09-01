import { GoogleGenAI } from "@google/genai";

export type ClarificationScenario = 
  | 'invalid_slide_number'
  | 'missing_lesson_context'
  | 'unclear_slide_selection'
  | 'no_valid_slides'
  | 'batch_edit_error'
  | 'general_confusion';

export interface ClarificationContext {
  requestedSlide?: number;
  availableSlides?: number;
  slidesList?: Array<{ title: string; id: string | number }>;
  operation?: 'edit' | 'improve' | 'regenerate' | 'batch_edit';
  userMessage?: string;
  lessonTopic?: string;
  totalSlides?: number;
}

export class AIClarificationService {
  private genAI: GoogleGenAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required for AIClarificationService');
    }
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generateClarification(
    scenario: ClarificationScenario,
    context: ClarificationContext
  ): Promise<string> {
    try {
      const prompt = this.buildClarificationPrompt(scenario, context);
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash-lite-preview-06-17",
        contents: prompt
      });
      
      const clarification = response.text || '';

      return clarification.trim();
    } catch (error) {
      console.error('❌ [AI CLARIFICATION] Error generating clarification:', error);
      return this.getFallbackMessage(scenario, context);
    }
  }

  private buildClarificationPrompt(scenario: ClarificationScenario, context: ClarificationContext): string {
    const basePrompt = `
You are a friendly AI teaching assistant helping users create educational lessons. 
When users make requests that can't be fulfilled, instead of showing errors, you should ask friendly clarifying questions or provide gentle guidance.

IMPORTANT RULES:
- Never use error language like "❌", "Error", "Failed"
- Always be encouraging and helpful
- Use emojis sparingly and naturally
- Respond in the same language as the user's message
- Keep tone conversational and warm
- Offer specific, actionable suggestions
- Make the user feel like this is a normal part of the conversation

CONTEXT:
- User's operation: ${context.operation || 'unknown'}
- User's message: "${context.userMessage || 'not provided'}"
- Lesson topic: ${context.lessonTopic || 'not specified'}
`;

    switch (scenario) {
      case 'invalid_slide_number':
        return `${basePrompt}

SITUATION: User requested to ${context.operation} slide ${context.requestedSlide}, but the lesson only has ${context.availableSlides} slides.

Available slides:
${context.slidesList?.map((slide, index) => `${index + 1}. ${slide.title}`).join('\n') || 'No slides listed'}

Generate a friendly response that:
1. Acknowledges what they want to do
2. Gently mentions the available options
3. Asks which slide they meant
4. Keeps it conversational and helpful

Example tone: "I see you want to edit a slide, let's clarify which one..."`;

      case 'missing_lesson_context':
        return `${basePrompt}

SITUATION: User wants to ${context.operation} a slide, but there's no active lesson in the conversation.

Generate a friendly response that:
1. Acknowledges their request
2. Explains we need to start with creating a lesson first
3. Offers to help create a lesson
4. Suggests what they can do next

Example tone: "Looks like you want to work with slides. Let's create a lesson first..."`;

      case 'unclear_slide_selection':
        return `${basePrompt}

SITUATION: User wants to ${context.operation} a slide but didn't specify which one. The lesson has ${context.availableSlides} slides.

Available slides:
${context.slidesList?.map((slide, index) => `${index + 1}. ${slide.title}`).join('\n') || 'Multiple slides available'}

Generate a friendly response that:
1. Shows understanding of their intent
2. Lists the available slides in a nice format
3. Asks them to specify which one
4. Gives an example of how to specify

Example tone: "I understand you want to change a slide. Your lesson has several slides..."`;

      case 'no_valid_slides':
        return `${basePrompt}

SITUATION: User tried to do batch editing but no valid slides were found for the operation.

Generate a friendly response that:
1. Acknowledges their batch editing intent
2. Explains that we need to clarify which slides to edit
3. Suggests how they can specify slides (all, specific numbers, ranges)
4. Gives examples

Example tone: "I understand you want to change multiple slides at once. Let's clarify..."`;

      case 'batch_edit_error':
        return `${basePrompt}

SITUATION: Something went wrong with batch editing operation.

Generate a friendly response that:
1. Acknowledges they wanted to edit multiple slides
2. Suggests trying a different approach
3. Offers to help with individual slides instead
4. Keeps it positive and solution-focused

Example tone: "Let's try a different approach to editing slides..."`;

      case 'general_confusion':
      default:
        return `${basePrompt}

SITUATION: Something unclear happened and we need to ask for clarification.

Generate a friendly response that:
1. Acknowledges their request
2. Asks for clarification in a helpful way
3. Suggests what they might want to do
4. Offers specific examples

Example tone: "Not quite clear what you want to do. Could you clarify..."`;
    }
  }

  private getFallbackMessage(scenario: ClarificationScenario, context: ClarificationContext): string {
    // Detect user language from context
    const isUkrainian = context.userMessage ? /[а-яіїєґ]/.test(context.userMessage) : false;
    
    switch (scenario) {
      case 'invalid_slide_number':
        return isUkrainian
          ? `🤔 Я бачу, ви хочете ${context.operation === 'edit' ? 'редагувати' : 'покращити'} слайд ${context.requestedSlide}, але у вашому уроці поки що ${context.availableSlides} ${this.getSlidesWord(context.availableSlides || 0)}.\n\nМожете уточнити, який саме слайд ви мали на увазі? Наприклад: "${context.operation} slide 1"`
          : `🤔 I see you want to ${context.operation} slide ${context.requestedSlide}, but your lesson currently has ${context.availableSlides} slides.\n\nCould you clarify which slide you meant? For example: "${context.operation} slide 1"`;

      case 'missing_lesson_context':
        return isUkrainian
          ? `🌟 Схоже, ви хочете працювати зі слайдами! Давайте спочатку створимо урок.\n\nПро що хочете зробити урок? Наприклад: "Створи урок про динозаврів для дітей 6-8 років"`
          : `🌟 Looks like you want to work with slides! Let's create a lesson first.\n\nWhat topic would you like? For example: "Create a lesson about dinosaurs for 6-8 year olds"`;

      case 'unclear_slide_selection':
        const slidesList = context.slidesList?.map((slide, index) => `${index + 1}. ${slide.title}`).join('\n') || '';
        return isUkrainian
          ? `🤔 Розумію, що ви хочете ${context.operation === 'edit' ? 'змінити' : 'покращити'} слайд. У вашому уроці є ${context.availableSlides} слайди:\n\n${slidesList}\n\nЯкий саме хочете змінити? Наприклад: "${context.operation} slide 2"`
          : `🤔 I understand you want to ${context.operation} a slide. Your lesson has ${context.availableSlides} slides:\n\n${slidesList}\n\nWhich one would you like to change? For example: "${context.operation} slide 2"`;

      case 'no_valid_slides':
        return isUkrainian
          ? `🎯 Я розумію, що ви хочете змінити кілька слайдів одразу. Давайте уточнимо які саме?\n\nМожете сказати:\n• "edit all slides" - для всіх слайдів\n• "edit slides 1-3" - для діапазону\n• "edit slides 2 and 4" - для конкретних`
          : `🎯 I understand you want to change multiple slides at once. Let's clarify which ones?\n\nYou can say:\n• "edit all slides" - for all slides\n• "edit slides 1-3" - for a range\n• "edit slides 2 and 4" - for specific ones`;

      case 'batch_edit_error':
        return isUkrainian
          ? `🔄 Давайте спробуємо інший підхід. Можемо відредагувати слайди по одному або уточнити, що саме ви хочете змінити?\n\nНаприклад: "зроби всі заголовки більшими" або "edit slide 1"`
          : `🔄 Let's try a different approach. We can edit slides one by one or clarify what exactly you want to change?\n\nFor example: "make all titles bigger" or "edit slide 1"`;

      case 'general_confusion':
      default:
        return isUkrainian
          ? `🤗 Не зовсім зрозуміло, що саме ви хочете зробити. Можете уточнити?\n\nНаприклад:\n• "створи урок про..." - для нового уроку\n• "edit slide 2" - для редагування слайду\n• "покращи слайд 1" - для покращення`
          : `🤗 Not quite clear what you want to do. Could you clarify?\n\nFor example:\n• "create lesson about..." - for new lesson\n• "edit slide 2" - for editing slide\n• "improve slide 1" - for improvement`;
    }
  }

  private getSlidesWord(count: number): string {
    if (count === 1) return 'слайд';
    if (count >= 2 && count <= 4) return 'слайди';
    return 'слайдів';
  }
}
