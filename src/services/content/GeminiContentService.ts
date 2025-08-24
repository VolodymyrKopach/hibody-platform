// Service for content generation using Gemini 2.5 Flash
import { GoogleGenAI } from '@google/genai';
import { processSlideWithTempImages, type ProcessedSlideDataWithTemp } from '@/utils/slideImageProcessor';
import { ageComponentTemplatesService } from '@/services/templates/AgeComponentTemplatesService';
import { AgeGroup } from '@/types/generation';
import type { SupabaseClient } from '@supabase/supabase-js';

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
    language: string = 'en', 
    conversationContext?: string,
    slideCount: number = 5
  ): Promise<string> {
    const prompt = this.buildLessonPlanPrompt(topic, age, language, conversationContext, slideCount);

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

  private buildLessonPlanPrompt(topic: string, age: string, language: string, conversationContext?: string, slideCount: number = 5): string {
    let contextSection = '';
    
    // === ADD CONVERSATION CONTEXT TO LESSON PLAN GENERATION ===
    if (conversationContext) {
      contextSection = `
CONVERSATION HISTORY:
${conversationContext}

Based on this conversation history, consider the user's preferences, style, and any specific requirements mentioned throughout the conversation when creating the lesson plan.
`;
    }

    // Always use English prompt
    return `You are an expert in developing educational programs for children. Create a detailed and engaging lesson plan.

${contextSection}

INPUT DATA:
- Topic: ${topic}
- Children's age: ${age}
- Number of slides requested: ${slideCount}
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

${this.generateSlideStructure(slideCount)}

## 🎮 Game Elements
- [Game/activity 1]
- [Game/activity 2]

## 📚 Required Materials
- [Material 1]
- [Material 2]

## 💡 Teacher Recommendations
- [Recommendation 1]
- [Recommendation 2]

${this.getAgeSpecificComponentGuidance(age)}

**LESSON PLAN CONTENT INTEGRATION:**
- Seamlessly integrate age-appropriate interactive elements into slide content descriptions
- Naturally weave teaching approaches and activities based on the component guidance above
- Consider cognitive load and attention span appropriate for ${age} year olds
- Balance interactive elements with content delivery for optimal learning
- Plan for progressive difficulty and complexity across slides
- Ensure teaching methods align with educational goals and developmental stage
- Write content descriptions that educators can directly implement without technical jargon

IMPORTANT:
- STRICTLY follow the structure "### Slide X: [Title]"
- Generate EXACTLY ${slideCount} slides as requested
- Each slide must contain detailed description (minimum 100 words)
- Adapt content for age ${age}
- Include interactive elements naturally within content descriptions
- Make the lesson engaging and educational
- DO NOT include duration or time information in slide titles (e.g. use "Introduction" not "Introduction (5 minutes)")
- Write content descriptions in natural, educational language that teachers can follow
- Integrate component recommendations seamlessly into teaching suggestions rather than as technical specifications
- Focus on pedagogical approaches and student engagement rather than technical implementation details`;
  }

  private generateSlideStructure(slideCount: number): string {
    const slideTypes = [
      { type: 'Introduction', title: 'Greeting and Introduction to Topic', description: 'To warmly greet children and introduce the topic, sparking their initial interest.' },
      { type: 'Educational', title: 'Main Material - Part 1', description: 'To introduce core concepts and engage children with interactive elements.' },
      { type: 'Educational', title: 'Main Material - Part 2', description: 'To expand knowledge and reinforce learning through varied activities.' },
      { type: 'Activity', title: 'Practical Task', description: 'To reinforce learning through hands-on activities and interactive games.' },
      { type: 'Summary', title: 'Summary and Reinforcement', description: 'To review learned concepts and celebrate children\'s participation and learning.' }
    ];

    let structure = '';
    
    for (let i = 0; i < slideCount; i++) {
      const slideNum = i + 1;
      let slideInfo;
      
      if (i === 0) {
        // First slide is always introduction
        slideInfo = slideTypes[0];
      } else if (i === slideCount - 1) {
        // Last slide is always summary
        slideInfo = slideTypes[4];
      } else if (i === slideCount - 2 && slideCount > 2) {
        // Second to last slide is activity (if we have more than 2 slides)
        slideInfo = slideTypes[3];
      } else {
        // Middle slides are educational content
        const partNum = i;
        slideInfo = {
          type: 'Educational',
          title: `Main Material - Part ${partNum}`,
          description: 'To introduce and explore key concepts through engaging, age-appropriate activities.'
        };
      }

      structure += `### Slide ${slideNum}: ${slideInfo.title}
**Type:** ${slideInfo.type}
**Goal:** ${slideInfo.description}
**Content:** [Detailed content description integrated with age-appropriate interactive elements and teaching approaches based on the component guidance above]

`;
    }
    
    return structure;
  }

  async generateSlideContent(
    slideDescription: string, 
    topic: string, 
    age: string, 
    options: { sessionId?: string; useTemporaryStorage?: boolean; supabaseClient?: SupabaseClient } = {}
  ): Promise<string> {
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

      // НОВИЙ ЕТАП: Обробляємо зображення з підтримкою temporary storage
      console.log('🎨 Processing images in slide...');
      
      // Use enhanced processor with temporary storage
      console.log('🔄 Using enhanced image processor with temporary storage');
      
      const imageProcessingResult: ProcessedSlideDataWithTemp = await processSlideWithTempImages(
        content,
        options.sessionId,
        {
          useTemporaryStorage: options.useTemporaryStorage ?? true,
          supabaseClient: options.supabaseClient
        }
      );
      
      console.log('🎨 Enhanced image processing result:', {
        originalLength: content.length,
        processedLength: imageProcessingResult.htmlWithImages.length,
        imagesGenerated: imageProcessingResult.generatedImages?.length || 0,
        tempImagesStored: imageProcessingResult.temporaryImages?.length || 0,
        processingErrors: imageProcessingResult.processingErrors?.length || 0,
        sessionId: imageProcessingResult.sessionId
      });

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

${this.getAgeSpecificComponentGuidance(age)}

**TEMPLATE USAGE INSTRUCTIONS:**
- Study the styles and components from the example above
- Choose 3-5 components that match your slide's learning objectives
- Adapt the design to your content while maintaining age-appropriate complexity
- Use similar colors, fonts, and sizes as shown in the template
- Repeat interactive patterns (hover effects, animations)
- Maintain button and interface element styles
- Always include at least one self-assessment or validation component

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

**STANDARDIZED IMAGE SIZES:**
Use these EXACT standardized sizes based on image type and context:

**HERO IMAGES (Main slide visuals):**
- Ages 2-3: WIDTH: 640 HEIGHT: 480
- Ages 4-6: WIDTH: 640 HEIGHT: 480  
- Ages 7-8: WIDTH: 800 HEIGHT: 600
- Ages 9-10: WIDTH: 800 HEIGHT: 600

**CONTENT IMAGES (Supporting illustrations):**
- Ages 2-3: WIDTH: 512 HEIGHT: 384
- Ages 4-6: WIDTH: 512 HEIGHT: 384
- Ages 7-8: WIDTH: 640 HEIGHT: 480
- Ages 9-10: WIDTH: 640 HEIGHT: 480

**ACTIVITY IMAGES (Interactive elements):**
- Ages 2-3: WIDTH: 400 HEIGHT: 400 (square format)
- Ages 4-6: WIDTH: 400 HEIGHT: 400 (square format)
- Ages 7-8: WIDTH: 512 HEIGHT: 512 (square format)
- Ages 9-10: WIDTH: 512 HEIGHT: 512 (square format)

**DECORATION IMAGES (Small visual elements):**
- Ages 2-3: WIDTH: 256 HEIGHT: 256
- Ages 4-6: WIDTH: 256 HEIGHT: 256
- Ages 7-8: WIDTH: 320 HEIGHT: 320
- Ages 9-10: WIDTH: 320 HEIGHT: 320

**IMAGE RULES:**
1. ALWAYS use the standardized sizes above - NO custom dimensions
2. Choose the appropriate size category based on image purpose:
   - Hero: Main slide illustration, central visual
   - Content: Supporting educational illustration  
   - Activity: Interactive game elements, clickable items
   - Decoration: Small visual accents, icons, borders
3. Prompt MUST be in English
4. Prompt should be detailed and describe:
   - What is depicted
   - Style (cartoon, illustration, realistic)
   - Colors and mood
   - Age group (for children aged X-Y)
   - Educational purpose

**STANDARDIZED EXAMPLES:**
<!-- IMAGE_PROMPT: "colorful cartoon illustration of happy children counting numbers 1 to 10, bright colors, educational style, for children aged 6-8" WIDTH: 640 HEIGHT: 480 -->
<!-- IMAGE_PROMPT: "cute animated animals learning mathematics, cartoon style, bright and friendly, educational illustration for kids aged 4-6" WIDTH: 512 HEIGHT: 384 -->
<!-- IMAGE_PROMPT: "simple geometric shapes in vibrant colors, educational poster style, clean and child-friendly design for ages 7-8" WIDTH: 400 HEIGHT: 400 -->
<!-- IMAGE_PROMPT: "small decorative star with sparkles, golden color, reward symbol for children aged 2-3" WIDTH: 256 HEIGHT: 256 -->

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

  /**
   * === SOLID: SRP - Отримання специфічних для віку інструкцій по компонентах ===
   */
  private getAgeSpecificComponentGuidance(age: string): string {
    const ageGroup = this.mapAgeToAgeGroup(age);
    
    // Детальні інструкції для кожної вікової групи
    if (ageGroup === '2-3') {
      return `
**AVAILABLE INTERACTIVE COMPONENTS FOR 2-3 YEARS:**

**🌟 LARGE ACTION BUTTONS:**
- Giant buttons that children can easily touch and click
- One main button per slide that does something when pressed
- Makes sounds and gives visual feedback when touched
- Perfect for starting activities or moving to next content

**🐾 FRIENDLY ANIMAL CHARACTERS:**
- Cute animal friends that respond when children touch them
- Animals make their characteristic sounds (cats meow, dogs bark)
- Characters can bounce, move, or change when interacted with
- Helps create emotional connection and engagement

**🎵 SOUND AND MUSIC ELEMENTS:**
- Buttons that play sounds, music, or spoken words
- Audio controls so children (or teachers) can turn sound on/off
- Everything responds with audio feedback when touched
- Supports learning through hearing and sound recognition

**🏆 REWARD AND CELEBRATION COMPONENTS:**
- Sparkling stars that appear when children complete tasks
- Celebration animations with confetti and spinning effects
- Progress bars that fill up to show accomplishment
- Makes children feel successful and encourages continued learning

**🔺 SIMPLE LEARNING GAMES:**
- Large shapes (circles, squares, triangles) for basic recognition
- Touch-and-respond activities for cause-and-effect learning
- Color recognition and simple pattern games
- One concept per activity to avoid overwhelming young minds

**🖼️ EDUCATIONAL IMAGES:**
- Large, colorful pictures that support the lesson topic
- Images can be touched to trigger sounds or animations
- Simple illustrations that clearly show one main idea
- Visual learning support for concepts being taught

**TEACHING APPROACH FOR 2-3 YEARS:**
- Only one main activity per slide to maintain focus
- Everything should be large and easy for small fingers to touch
- Immediate positive feedback for every interaction
- Simple, clear language with maximum 3 words at a time
- Bright, happy colors that attract and hold attention
- Audio support for all learning content`;

    } else if (ageGroup === '4-6') {
      return `
**AVAILABLE INTERACTIVE COMPONENTS FOR 4-6 YEARS:**

**🎮 EDUCATIONAL LEARNING CARDS:**
- Interactive cards that flip and respond when touched
- Each card teaches one concept (letters, words, objects)
- Cards have titles and visual elements children can recognize
- Perfect for vocabulary building and concept recognition

**🔤 ALPHABET AND LETTER LEARNING:**
- Letter cards that show both the letter and a word (A - Apple)
- Each letter makes sounds and speaks the word aloud
- Children can practice letter recognition and phonics
- Interactive elements that help with reading readiness

**🔢 NUMBER AND COUNTING ACTIVITIES:**
- Colorful number blocks that children can click and explore
- Each number speaks its name and shows counting examples
- Numbers have different colors to help with visual recognition
- Supports early math skills and number familiarity

**🎵 SOUND AND MUSIC INTERACTIONS:**
- Animal sound buttons that make realistic animal noises
- Musical elements for rhythm and audio learning
- Audio controls so sounds can be turned on or off
- Supports language development and listening skills

**🏆 ACHIEVEMENT AND MOTIVATION ELEMENTS:**
- Reward stars that sparkle when children complete tasks
- Achievement medals that spin and celebrate success
- Progress bars that fill up to show learning advancement
- Point counters that track accomplishments and encourage continued learning

**🎯 LARGE ACTION BUTTONS:**
- Main activity buttons for starting lessons or games
- Different types: learning activities, games, and achievements
- Large enough for easy touching and interaction
- Each button type has distinctive colors and sounds

**🖼️ EDUCATIONAL IMAGES AND STORIES:**
- Large hero images that tell stories or show main concepts
- Story images for narrative and imagination development
- Activity images for interactive learning exercises
- Supporting learning images that illustrate specific topics

**TEACHING APPROACH FOR 4-6 YEARS:**
- Multiple learning activities per slide (up to 5 elements)
- Interactive elements are medium to large sized for developing fine motor skills
- Simple language with maximum 5 words per instruction
- Combination of visual, audio, and tactile learning
- Progressive difficulty with rewards for motivation
- Bright, engaging colors that support focus and attention`;

    } else if (ageGroup === '7-8') {
      return `
**AVAILABLE INTERACTIVE COMPONENTS FOR 7-8 YEARS:**

**📚 PROFESSIONAL SLIDE STRUCTURE:**
- Well-organized slides with clear headers, main content areas, and navigation
- Scrollable content sections that can hold extensive educational material
- Professional layout that looks more mature and sophisticated than younger age groups
- Progress tracking and navigation controls to help students manage their learning

**✍️ ADVANCED TEXT AND READING ELEMENTS:**
- Multiple text styles for different purposes: main titles, section headings, body text
- Special highlighting for important information that needs attention
- Success and error feedback text that helps students understand their progress
- Inspirational quotes and educational tips to motivate learning
- Extended reading passages with comfortable formatting for longer texts
- Organized lists with checkmarks to track learning objectives

**🔢 STEP-BY-STEP PROBLEM SOLVING:**
- Multi-step learning processes that break complex tasks into manageable parts
- Sequential workflow where students complete one step before moving to the next
- Visual progress tracking that shows which steps are completed
- Self-pacing controls that let students work at their own speed
- Guided learning that builds independence and confidence

**📝 COMPLEX INTERACTIVE ACTIVITIES:**
- Multiple choice questions with detailed explanations for both correct and incorrect answers
- Text input exercises where students can type their own responses
- Comprehensive feedback systems that help students understand mistakes
- Interactive exercises that require critical thinking and analysis
- Activities that connect to real-world applications and practical skills

**💡 INTELLIGENT HINT AND HELP SYSTEMS:**
- Progressive hint system that provides help without giving away answers
- Mistake analysis that explains why an answer is wrong and how to improve
- Multiple levels of support for students who need extra guidance
- Contextual help that appears when students struggle with specific concepts
- Encouraging feedback that builds confidence while providing necessary assistance

**🧠 CRITICAL THINKING AND REASONING ACTIVITIES:**
- Complex problem-solving exercises that require analytical thinking
- Activities that encourage students to explain their reasoning
- Connections between different concepts and subjects
- Creative exercises that allow personal expression and unique solutions
- Assessment activities that measure deeper understanding rather than memorization

**🏆 DETAILED PROGRESS AND ACHIEVEMENT TRACKING:**
- Visual progress indicators that show learning advancement
- Achievement recognition for completing difficult tasks
- Detailed feedback that explains what students did well and areas for improvement
- Motivation systems that encourage continued learning and persistence
- Goal-setting features that help students plan their learning journey

**🖼️ EDUCATIONAL IMAGES AND MEDIA:**
- Hero images that illustrate complex concepts and main lesson topics
- Story images for narrative content and creative thinking exercises
- Activity images that support interactive learning and hands-on exercises
- Supporting educational images that clarify difficult concepts

**🔊 COMPREHENSIVE AUDIO SUPPORT:**
- High-quality speech synthesis that reads content aloud for auditory learners
- Audio feedback for all interactions and activities
- Educational content narration that supports reading comprehension
- Audio hints and guidance system for additional learning support
- User-controlled audio settings so students can customize their experience

**TEACHING APPROACH FOR 7-8 YEARS:**
- Complex, multi-step learning activities that challenge students appropriately
- Professional presentation style that treats students as capable learners
- Extensive content that can be explored through scrolling and navigation
- Self-directed learning opportunities with guidance available when needed
- Critical thinking emphasis with reasoning and explanation requirements
- Mistake analysis and learning from errors as part of the educational process
- Integration of multiple learning modalities: visual, auditory, and kinesthetic
- Real-world applications and practical skill development`;

    } else if (ageGroup === '9-10') {
      return `
**AVAILABLE COMPONENTS FOR 9-10 YEARS (Choose appropriate ones for each slide):**

**🎓 ADVANCED LEARNING SYSTEMS:**
- Complex multi-step problem solving with branching paths
- Advanced self-assessment with detailed rubrics
- Peer collaboration simulation tools
- Research and investigation frameworks
- Use for: Independent learning, complex reasoning, advanced skill development
- Component classes: .advanced-steps, .detailed-assessment, .collaboration-tools

**🔬 CRITICAL THINKING COMPONENTS:**
- Hypothesis formation and testing interfaces
- Cause-and-effect analysis tools
- Compare and contrast frameworks
- Evidence evaluation systems
- Use for: Scientific thinking, logical reasoning, analytical skills
- Component classes: .hypothesis-builder, .analysis-tools, .comparison-matrix

**📊 DATA & RESEARCH ELEMENTS:**
- Interactive charts and graphs
- Data collection interfaces
- Statistical analysis tools
- Information synthesis components
- Use for: Math concepts, science experiments, research projects
- Component classes: .data-visualization, .collection-tools, .synthesis-panels

**🎯 PROJECT-BASED LEARNING:**
- Long-term project tracking
- Portfolio development tools
- Presentation builders
- Reflection and documentation systems
- Use for: Complex projects, skill portfolios, creative work
- Component classes: .project-tracker, .portfolio-builder, .presentation-tools

**🤝 COLLABORATIVE LEARNING:**
- Group work simulation
- Peer review systems
- Discussion and debate frameworks
- Team challenge components
- Use for: Social learning, communication skills, teamwork
- Component classes: .group-simulator, .peer-review, .discussion-tools

**COMPONENT SELECTION GUIDELINES FOR 9-10 YEARS:**

**INTRODUCTION SLIDES:**
- Advanced learning system overview
- Complex project introductions
- Goal-setting and planning tools
- Independent learning frameworks

**CONTENT SLIDES:**
- Critical thinking components for analysis
- Data visualization for complex concepts
- Research tools for investigation
- Advanced self-assessment for understanding

**PRACTICE SLIDES:**
- Multi-step problem solving with validation
- Hypothesis testing and analysis
- Collaborative learning simulations
- Portfolio development activities

**PROJECT SLIDES:**
- Long-term tracking and planning
- Documentation and reflection tools
- Presentation and sharing systems
- Peer collaboration frameworks

**ASSESSMENT SLIDES:**
- Comprehensive self-evaluation
- Evidence-based reasoning
- Project portfolio review
- Goal reflection and planning`;
    }
    
    // Для інших вікових груп - базові інструкції
    return `
**COMPONENT USAGE GUIDANCE:**
- Use age-appropriate interactive elements from the template above
- Focus on components suitable for ${age} year old children
- Choose 2-4 components that match your slide's learning objectives
- Maintain appropriate complexity level for this age group`;
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

  async editLessonPlan(
    currentPlan: string,
    editInstruction: string,
    topic: string,
    age: string,
    language: string = 'en',
    conversationContext?: string
  ): Promise<string> {
    const prompt = this.buildEditPlanPrompt(currentPlan, editInstruction, topic, age, language, conversationContext);

    console.log('🔧 Editing lesson plan with instruction:', editInstruction);
    console.log('📝 Edit prompt length:', prompt.length);

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

  async summarizePlanChanges(
    originalPlan: string,
    updatedPlan: string,
    editInstruction: string,
    language: string = 'en'
  ): Promise<string> {
    const prompt = this.buildChangesSummaryPrompt(originalPlan, updatedPlan, editInstruction, language);

    console.log('📋 Summarizing plan changes');

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0,
          },
          temperature: 0.5 // Lower temperature for more consistent summaries
        }
      });

      const content = response.text;

      if (!content) {
        throw new Error('No content in Gemini response');
      }

      return content;
    } catch (error) {
      console.error('Gemini changes summary error:', error);
      throw error;
    }
  }

  private buildEditPlanPrompt(
    currentPlan: string,
    editInstruction: string,
    topic: string,
    age: string,
    language: string,
    conversationContext?: string
  ): string {
    let contextSection = '';
    if (conversationContext) {
      contextSection = `
CONVERSATION CONTEXT:
${conversationContext}

Use this context to better understand the user's intent and provide more relevant edits.
`;
    }

    return `You are an expert educational content creator specializing in lesson plans for children.

${contextSection}

TASK: Edit the existing lesson plan based on the user's instructions.

CURRENT LESSON PLAN:
${currentPlan}

USER'S EDIT INSTRUCTION:
"${editInstruction}"

LESSON DETAILS:
- Topic: ${topic}
- Age Group: ${age}
- Language: English

EDITING GUIDELINES:
1. Carefully analyze the user's instruction to understand what changes they want
2. Make ONLY the requested changes - don't modify unrelated parts
3. Maintain the same structure and format as the original plan
4. Keep the same slide numbering format (## Слайд X: or ## Slide X:)
5. Ensure all changes are age-appropriate for ${age}
6. Preserve the educational quality and coherence of the plan
7. If adding new slides, number them appropriately
8. If removing slides, adjust numbering accordingly

COMMON EDIT TYPES:
- Add new slides: Insert new content with proper numbering
- Remove slides: Delete specified content and renumber
- Modify existing slides: Update content while keeping structure
- Change focus/theme: Adjust content to new direction
- Make shorter/longer: Add or remove content as needed
- Change difficulty: Adjust complexity for age group

RESPONSE FORMAT:
Return ONLY the updated lesson plan in the same format as the original.
Respond in English.

Do NOT include explanations, just the updated plan.`;
  }

  private buildChangesSummaryPrompt(
    originalPlan: string,
    updatedPlan: string,
    editInstruction: string,
    language: string
  ): string {
    return `You are an expert at analyzing changes in educational content.

TASK: Compare the original and updated lesson plans and provide a concise summary of what was changed.

ORIGINAL PLAN:
${originalPlan}

UPDATED PLAN:
${updatedPlan}

USER'S INSTRUCTION WAS:
"${editInstruction}"

ANALYSIS GUIDELINES:
1. Identify what specific changes were made
2. Focus on the most important modifications
3. Be concise but informative
4. Use bullet points for clarity
5. Mention if slides were added, removed, or modified
6. Note any changes in content focus or difficulty

RESPONSE FORMAT:
Provide a brief summary in English using bullet points.
Examples:
• Added new slide about carnivorous dinosaurs
• Modified first slide - made more interactive
• Removed slide about herbivorous dinosaurs
• Shortened plan from 5 to 3 slides

Keep it under 5 bullet points and focus on the most significant changes.`;
  }
} 