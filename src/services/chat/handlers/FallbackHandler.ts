import { IIntentHandler } from './IIntentHandler';
import { ConversationHistory, ChatResponse } from '../types';
import { IntentDetectionResult, UserIntent } from '../../intent/IIntentDetectionService';
import { GeminiContentService } from '../../content/GeminiContentService';

// Single Responsibility: Обробка невідомих намірів
export class FallbackHandler implements IIntentHandler {
  private contentService: GeminiContentService | null = null;

  private getContentService(): GeminiContentService {
    if (!this.contentService) {
      this.contentService = new GeminiContentService();
    }
    return this.contentService;
  }
  
  canHandle(intent: IntentDetectionResult): boolean {
    return intent.intent === UserIntent.FREE_CHAT || intent.confidence < 0.5;
  }

  async handle(intent: IntentDetectionResult, conversationHistory?: ConversationHistory): Promise<ChatResponse> {
    // All responses are now AI-generated based on intent type
    const userMessage = intent.parameters.rawMessage || '';
    const isFriendlyChat = intent.intent === UserIntent.FREE_CHAT && intent.confidence >= 0.7;
    
    let message: string;
    
    try {
      // Use Gemini 2.5 Flash for all responses with conversation context
      message = await this.generateAIResponse(intent.language, userMessage, isFriendlyChat, conversationHistory);
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      // Ultimate fallback - simple error message
      message = this.getEmergencyFallback(intent.language);
    }

    return {
      success: true,
      message,
      conversationHistory,
      actions: [
        {
          action: 'help',
          label: intent.language === 'uk' ? '❓ Допомога' : intent.language === 'ru' ? '❓ Помощь' : '❓ Help',
          description: intent.language === 'uk' ? 'Показати доступні команди' : intent.language === 'ru' ? 'Показать доступные команды' : 'Show available commands'
        }
      ]
    };
  }

  private async generateAIResponse(language: string, userMessage: string, isFriendlyChat: boolean, conversationHistory?: ConversationHistory): Promise<string> {
    const prompt = this.buildUniversalPrompt(language, userMessage, isFriendlyChat, conversationHistory);
    
    try {
      return await this.callGeminiAPI(prompt);
    } catch (error) {
      console.error('Gemini AI response generation error:', error);
      throw error;
    }
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    // Import GoogleGenAI directly
    const { GoogleGenAI } = await import('@google/genai');
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    const client = new GoogleGenAI({ apiKey });
    
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disable thinking for faster generation
        },
        temperature: 0.8 // Higher temperature for more creative responses
      }
    });

    const content = response.text;
    if (!content) {
      throw new Error('No content in Gemini response');
    }

    return content.trim();
  }

  private buildUniversalPrompt(language: string, userMessage: string, isFriendlyChat: boolean, conversationHistory?: ConversationHistory): string {
    // Determine response language based on user's language
    let responseLanguage = 'in English';
    let exampleCommands = [
      '"Create lesson about [topic] for [age] year old children"',
      '"Help" - to see all commands',
      '"Improve slide [number]" - for editing'
    ];
    
    if (language === 'uk') {
      responseLanguage = 'українською мовою';
      exampleCommands = [
        '"Створи урок про [тема] для дітей [вік] років"',
        '"Допоможи" - для перегляду всіх команд',
        '"Покращ слайд [номер]" - для редагування'
      ];
    } else if (language === 'ru') {
      responseLanguage = 'на русском языке';
      exampleCommands = [
        '"Создай урок о [тема] для детей [возраст] лет"',
        '"Помощь" - для просмотра всех команд',
        '"Улучши слайд [номер]" - для редактирования'
      ];
    }

    const chatType = isFriendlyChat ? 'friendly_chat' : 'unclear_request';
    
    // Build conversation context
    let contextInfo = '';
    if (conversationHistory) {
      contextInfo = `
**CONVERSATION CONTEXT:**
- Current step: ${conversationHistory.step || 'none'}
- Active lesson: ${conversationHistory.currentLesson ? `YES - "${conversationHistory.currentLesson.title}"` : 'NO'}
- Lesson topic: ${conversationHistory.lessonTopic || 'none'}
- Children age: ${conversationHistory.lessonAge || 'none'}
- Generated slides: ${conversationHistory.currentLesson?.slides?.length || 0}
- Has lesson plan: ${conversationHistory.planningResult ? 'YES' : 'NO'}
`;
      
      // === ADD CONVERSATION CONTEXT FOR REFERENCE RESOLUTION ===
      if (conversationHistory.conversationContext) {
        contextInfo += `
**RECENT CONVERSATION:**
${conversationHistory.conversationContext}

**IMPORTANT**: Use this conversation history to understand what the user might be referring to when they say "it", "that", "this topic", etc.
`;
      }
    }
    
    return `You are a knowledgeable teacher assistant who loves education and helping people learn.

**CONTEXT:**
- User wrote: "${userMessage}"
- Chat type: ${chatType}
- User language: ${language}
${contextInfo}

**TASK:**
Respond ${responseLanguage} based on the chat type:

     ${isFriendlyChat ? `
**FRIENDLY CHAT RESPONSE:**
You are a passionate teacher assistant who approaches every conversation with educational enthusiasm. Your response should:

1. **Answer educationally** - Provide informative, well-explained answers with educational context
2. **Teach while chatting** - Turn any topic into a learning opportunity with interesting facts
3. **Use teacher language** - Phrases like "Did you know?", "Let me explain", "That's a great question!"
4. **Encourage curiosity** - Ask thought-provoking follow-up questions
5. **Connect to learning** - Show how topics relate to broader educational concepts
6. **Mention lesson creation** - As a teacher, naturally suggest creating educational content

**EXAMPLES OF TEACHER ASSISTANT RESPONSES:**
- If they ask about dinosaurs → Explain with educational enthusiasm, fun facts, and suggest creating a paleontology lesson
- If they say "hello" → Greet like a friendly teacher, ask what they'd like to learn about today
- If they ask about cooking → Teach cooking science, nutrition facts, and suggest a cooking lesson for kids
- If they ask about science → Explain concepts clearly, use analogies, and offer to create science lessons

**TEACHER ASSISTANT LANGUAGE:**
- "That's a fascinating question!"
- "Let me explain this in a way that's easy to understand..."
- "Did you know that...?"
- "This reminds me of..."
- "You might find it interesting that..."
- "As an educator, I love helping people discover..."

**MARKDOWN USAGE:**
- Use **bold** for key educational concepts and important facts
- Use *italic* for interesting details and emphasis
- Use ## headers for main educational topics
- Use - bullet lists for learning points
- Use > blockquotes for important educational notes or "teacher tips"

**STYLE:** Educational, enthusiastic, encouraging, teacher-like, passionate about learning
` : `
**UNCLEAR REQUEST RESPONSE:**
Create a helpful teacher-like response that:
1. **Acknowledge with patience** (use 🤔 emoji and phrases like "Let me help clarify")
2. **Check for contextual references** - If user said "it", "that", "this", try to identify what they mean from conversation history
3. **Provide helpful suggestions** - If you can guess what they want, offer specific examples
4. **Teach clear communication** - Show them how to phrase their request more clearly  
5. **Give educational examples**: ${exampleCommands.join(', ')}
6. **Reference current context** - Mention active lessons, recent topics, or what you've been discussing
7. **Encourage with teacher enthusiasm** - Use phrases like "Let's work together on this" or "I'm here to help you succeed"
8. **Use markdown formatting** with ## headers, **bold** examples, and - bullet lists

**HANDLING AMBIGUOUS REFERENCES:**
- If user says "about it" or "about that" → Look for topics in recent conversation
- If user mentions "the same thing" → Reference what was discussed before  
- If unclear → Ask specific clarifying questions with examples
- Always try to be helpful rather than just saying "I don't understand"

**STYLE:** Patient, educational, encouraging, teacher-like, helpful, well-formatted
`}

**UNIVERSAL CONSTRAINTS:**
- Respond ONLY ${responseLanguage}
- Maximum 200-300 words (educational explanations can be longer)
- Use emojis naturally (educational ones like 🎓📚🔬🌟 when appropriate)
- **USE markdown formatting** for better readability (**bold**, *italic*, ## headers, - lists, etc.)
- Be educational, enthusiastic, and teacher-like in your approach
- Focus on teaching and making learning enjoyable
- **Use conversation context** - Reference active lessons, current topics, or previous interactions when relevant
- For friendly chat: Educate about their topic, then suggest creating lessons or building on current work
- Approach everything from an educator's perspective
- Structure your response like a mini-lesson with clear educational value

**RESPONSE:**`;
  }

  private getEmergencyFallback(language: string): string {
    // Ultra-simple fallback when AI completely fails
    switch (language) {
      case 'uk':
        return `🤖 Вибачте, виникла технічна проблема. Спробуйте "Допоможи" або "Створи урок про [тема]".`;
      case 'ru':
        return `🤖 Извините, возникла техническая проблема. Попробуйте "Помощь" или "Создай урок о [тема]".`;
      default:
        return `🤖 Sorry, technical issue occurred. Try "Help" or "Create lesson about [topic]".`;
    }
  }

} 