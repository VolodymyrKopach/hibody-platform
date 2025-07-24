// Service for content generation using Gemini 2.5 Flash
import { GoogleGenAI } from '@google/genai';
import { processSlideWithImages, type ProcessedSlideData } from '@/utils/slideImageProcessor';
import { ageComponentTemplatesService } from '@/services/templates/AgeComponentTemplatesService';
import { AgeGroup } from '@/types/generation';

export class GeminiContentService {
  private client: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    // Pass the API key explicitly to the Google GenAI client
    this.client = new GoogleGenAI({ apiKey });
  }

  async generateLessonPlan(
    topic: string, 
    age: string, 
    language: string = 'uk', 
    conversationContext?: string
  ): Promise<string> {
    const prompt = this.buildLessonPlanPrompt(topic, age, language, conversationContext);

    console.log('📝 Generated prompt length:', prompt.length);
    console.log('🎯 API request details:', {
      model: 'gemini-2.5-flash',
      hasConversationContext: !!conversationContext
    });

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disable thinking for faster generation
          },
          temperature: 0.7
        }
      });

      const content = response.text;

      if (!content) {
        throw new Error('No content in Gemini response');
      }

      console.log(`📏 Generated lesson plan length: ${content.length} characters`);
      
      // Check for common truncation indicators
      if (content.includes('[TRUNCATED]') || 
          (content.includes('...') && content.length > 3000) ||
          !content.includes('Рекомендації') ||
          !content.includes('матеріали')) {
        console.warn('⚠️ Content appears to be truncated or incomplete');
        console.warn('📝 Content ending:', content.slice(-200));
      }

      return content;
    } catch (error) {
      console.error('Gemini content generation error:', error);
      throw error;
    }
  }

  private buildLessonPlanPrompt(topic: string, age: string, language: string, conversationContext?: string): string {
    let contextSection = '';
    
    // === ADD CONVERSATION CONTEXT TO LESSON PLAN GENERATION ===
    if (conversationContext) {
      contextSection = `
CONVERSATION HISTORY:
${conversationContext}

Based on this conversation history, consider the user's preferences, style, and any specific requirements mentioned throughout the conversation when creating the lesson plan.
`;
    }

    if (language === 'en') {
      return `You are an expert in developing educational programs for children. Create a detailed and engaging lesson plan.

${contextSection}

INPUT DATA:
- Topic: ${topic}
- Children's age: ${age}
- Language: English

LESSON PLAN REQUIREMENTS:
1. Create an engaging title
2. Clear learning objectives
3. Age-appropriate content structure
4. Interactive elements and activities
5. Assessment methods
6. Required materials

STRUCTURE:
## 📚 [Lesson Title]

**Target Audience:** ${age}
**Duration:** 30-45 minutes
**Subject:** [Subject area]

### 🎯 Learning Objectives
- [Objective 1]
- [Objective 2]
- [Objective 3]

### 📋 Lesson Plan

#### Slide 1: Introduction
- [Content description]
- [Interactive element]

#### Slide 2: Main Content
- [Content description]
- [Activities]

[Continue with more slides...]

### 🎮 Interactive Activities
- [Activity 1]
- [Activity 2]

### 📊 Assessment
- [Assessment method]

### 📚 Required Materials
- [Material 1]
- [Material 2]

### 💡 Recommendations
- [Teaching tips]
- [Adaptation suggestions]

IMPORTANT:
- Use clear slide structure: "#### Slide X: [Title]"
- DO NOT include duration in slide titles (e.g. use "Introduction" not "Introduction (5 minutes)")

Create a complete, detailed lesson plan that is engaging and educational for the specified age group.`;
    }

    // English prompt (default - changed from Ukrainian)
    return `You are an expert in developing educational programs for children. Create a detailed and engaging lesson plan.

${contextSection}

INPUT DATA:
- Topic: ${topic}
- Children's age: ${age}
- Language: English

MANDATORY LESSON PLAN STRUCTURE:

# [Lesson Title]

**Target Audience:** ${age}
**Duration:** 30-45 minutes
**Lesson Goal:** [Main goal]

## 🎯 Learning Objectives
- [Objective 1]
- [Objective 2]
- [Objective 3]

## 📋 Lesson Structure

### Slide 1: Greeting and Introduction to Topic
**Type:** Introduction
**Goal:** [Slide goal]
**Content:** [Detailed content description]
**Interactive Elements:** [Description of interactivity]

### Slide 2: Main Material - Part 1
**Type:** Educational
**Goal:** [Slide goal]
**Content:** [Detailed content description]
**Interactive Elements:** [Description of interactivity]

### Slide 3: Main Material - Part 2
**Type:** Educational
**Goal:** [Slide goal]
**Content:** [Detailed content description]
**Interactive Elements:** [Description of interactivity]

### Slide 4: Practical Task
**Type:** Activity
**Goal:** [Slide goal]
**Content:** [Detailed activity description]
**Interactive Elements:** [Description of game elements]

### Slide 5: Summary and Reinforcement
**Type:** Summary
**Goal:** [Slide goal]
**Content:** [Detailed summary description]
**Interactive Elements:** [Description of interactivity]

## 🎮 Game Elements
- [Game/activity 1]
- [Game/activity 2]

## 📚 Required Materials
- [Material 1]
- [Material 2]

## 💡 Teacher Recommendations
- [Recommendation 1]
- [Recommendation 2]

IMPORTANT:
- STRICTLY follow the structure "### Slide X: [Title]"
- Each slide must contain detailed description (minimum 100 words)
- Adapt content for age ${age}
- Include interactive elements for each slide
- Make the lesson engaging and educational
- DO NOT include duration or time information in slide titles (e.g. use "Introduction" not "Introduction (5 minutes)")`;
  }

  async generateSlideContent(slideDescription: string, topic: string, age: string): Promise<string> {
    const prompt = await this.buildSlideContentPrompt(slideDescription, topic, age);

    try {
      console.log('🎯 Generating slide HTML with Gemini...');
      
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disable thinking for faster generation
          },
          temperature: 0.7
        }
      });

      let content = response.text;

      if (!content) {
        throw new Error('No content in Gemini response');
      }

      // Очищаємо HTML від markdown обгортки
      content = this.cleanHtmlFromMarkdown(content);
      console.log('✅ Base slide HTML generated, length:', content.length);

      // НОВИЙ ЕТАП: Обробляємо зображення
      console.log('🎨 Processing images in slide...');
      const imageProcessingResult: ProcessedSlideData = await processSlideWithImages(content);
      
      console.log('🎨 Image processing result:', {
        originalLength: content.length,
        processedLength: imageProcessingResult.htmlWithImages.length,
        imagesGenerated: imageProcessingResult.generatedImages?.length || 0,
        processingErrors: imageProcessingResult.processingErrors?.length || 0
      });

      // Повертаємо оброблений контент з реальними зображеннями
      return imageProcessingResult.htmlWithImages;

    } catch (error) {
      console.error('Gemini slide generation error:', error);
      throw error;
    }
  }

  private async buildSlideContentPrompt(slideDescription: string, topic: string, age: string): Promise<string> {
    // Get age-specific template components
    let ageTemplate = '';
    try {
      const ageGroup = this.mapAgeToAgeGroup(age);
      ageTemplate = await ageComponentTemplatesService.getTemplateForAge(ageGroup);
      console.log(`✅ Loaded age template for ${ageGroup}, length: ${ageTemplate.length}`);
    } catch (error) {
      console.warn('Failed to load age template:', error);
      ageTemplate = '<!-- No age-specific template available -->';
    }

    return `You are an expert in creating interactive HTML slides for children.

**TASK:** Create a complete HTML slide for children aged ${age} based on the description.

**SLIDE DESCRIPTION:**
${slideDescription}

**CONTEXT:**
- Lesson topic: ${topic}
- Target audience: children aged ${age}

**AGE-SPECIFIC COMPONENT EXAMPLES:**
Use the following component examples as reference for creating appropriate visual elements:

${ageTemplate}

**TEMPLATE USAGE INSTRUCTIONS:**
- Study the styles and components from the example above
- Adapt the design to your content
- Use similar colors, fonts, and sizes
- Repeat interactive patterns (hover effects, animations)
- Maintain button and interface element styles
- Adapt complexity to age group

**TECHNICAL REQUIREMENTS:**
1. Create a COMPLETE HTML document with <!DOCTYPE html>
2. Use CSS-in-style for all styling
3. Add JavaScript for interactivity
4. Format: 4:3 (800x600px or similar)
5. Large, readable fonts for children
6. Bright colors and attractive design

**IMAGE GENERATION:**
INSTEAD of adding real images, use SPECIAL COMMENTS for each place where an image is needed:

**IMAGE COMMENT FORMAT:**
<!-- IMAGE_PROMPT: "detailed image description in English" WIDTH: XXX HEIGHT: YYY -->

**IMAGE RULES:**
1. WIDTH and HEIGHT MUST be multiples of 16 (e.g.: 512, 528, 640, 768, 800)
2. Minimum size: 256x256
3. Maximum size: 1536x1536
4. Prompt MUST be in English
5. Prompt should be detailed and describe:
   - What is depicted
   - Style (cartoon, illustration, realistic)
   - Colors and mood
   - Age group (for children aged X-Y)

**CORRECT COMMENT EXAMPLES:**
<!-- IMAGE_PROMPT: "colorful cartoon illustration of happy children counting numbers 1 to 10, bright colors, educational style, for children aged 6-8" WIDTH: 640 HEIGHT: 480 -->
<!-- IMAGE_PROMPT: "cute animated animals learning mathematics, cartoon style, bright and friendly, educational illustration for kids" WIDTH: 512 HEIGHT: 384 -->
<!-- IMAGE_PROMPT: "simple geometric shapes in vibrant colors, educational poster style, clean and child-friendly design" WIDTH: 800 HEIGHT: 600 -->

**COMMENT PLACEMENT:**
- Place comments where images should appear in the layout
- DO NOT add placeholder divs after IMAGE_PROMPT comments - images will be inserted automatically
- Example placement:
  <!-- IMAGE_PROMPT: "description" WIDTH: 640 HEIGHT: 480 -->
- The system will automatically replace this comment with a properly contained image

**MANDATORY ELEMENTS:**
- Slide title
- Main content according to description
- MINIMUM 1-2 images via IMAGE_PROMPT comments
- Minimum 2-3 interactive elements (buttons, animations, games)
- Navigation or action buttons
- Tablet responsiveness

**MANDATORY IMAGE USAGE:**
- Each slide MUST contain at least 1 image
- For educational slides add 2-3 images
- Images must be relevant to the content
- Use images to illustrate key concepts
- Place images logically in the layout

**DESIGN STYLE:**
- Child-friendly, bright, welcoming
- Large buttons and touch elements
- Animations and visual effects
- Game elements appropriate to age

**INTERACTIVITY:**
- Buttons with hover effects
- Click animations
- Interaction possibilities (drag&drop, click, hover)
- Sound effects (when possible)

**RESPONSE STRUCTURE:**
Provide only the ready HTML code without any explanations. The code must be completely self-contained and ready for immediate use.

**ATTENTION:** 
- DO NOT use external libraries (jQuery, Bootstrap, etc.)
- All styles - inline or in <style> section
- All JavaScript - in <script> section
- Ready for immediate display in browser`;
  }

  private cleanHtmlFromMarkdown(content: string): string {
    // Remove markdown code blocks
    let cleaned = content.replace(/```html\s*/g, '').replace(/```\s*$/g, '');
    
    // Remove any remaining markdown formatting
    cleaned = cleaned.replace(/```.*$/gm, '');
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  /**
   * === SOLID: SRP - Маппінг віку на вікову групу ===
   */
  private mapAgeToAgeGroup(age: string): AgeGroup {
    // Витягуємо числове значення з рядка
    const ageNumber = parseInt(age.match(/\d+/)?.[0] || '6');
    
    if (ageNumber <= 3) return '2-3';
    if (ageNumber <= 6) return '4-6';
    if (ageNumber <= 8) return '7-8';
    return '9-10';
  }

  async generateEditedPlan(
    currentPlan: string, 
    userChanges: string, 
    topic: string, 
    age: string,
    conversationContext?: string
  ): Promise<string> {
    
    let contextSection = '';
    
    // === ADD CONVERSATION CONTEXT TO PLAN EDITING ===
    if (conversationContext) {
      contextSection = `
CONVERSATION HISTORY:
${conversationContext}

Consider the conversation history when making edits to ensure consistency with user preferences and previous discussions.
`;
    }

    const prompt = `You are an expert in creating educational programs for children. You need to update an existing lesson plan based on user requests.

${contextSection}

CURRENT LESSON PLAN:
${currentPlan}

USER CHANGES:
${userChanges}

CONTEXT:
- Topic: ${topic}
- Children's age: ${age}

**INSTRUCTIONS:**
1. Analyze the current plan and user changes
2. Make appropriate modifications while preserving structure and quality
3. Ensure the plan remains pedagogically sound
4. Maintain age-appropriate complexity level
5. If changes contradict pedagogical principles, suggest alternatives

**RESPONSE FORMAT:**
Provide the updated plan in the same format as the original, with clear slide structure 1-6, teacher recommendations, required materials, and expected outcomes.

**ADDITIONAL REQUIREMENTS:**
- Ensure optimal content display on different devices
- All interactive elements must be child-friendly and easy to use

**UPDATED LESSON PLAN:**`;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disable thinking for faster generation
          },
          temperature: 0.7
        }
      });

      const content = response.text;

      if (!content) {
        throw new Error('No content in Gemini response');
      }

      console.log(`📏 Generated edited plan length: ${content.length} characters`);

      return content;
    } catch (error) {
      console.error('Gemini plan editing error:', error);
      throw error;
    }
  }
} 