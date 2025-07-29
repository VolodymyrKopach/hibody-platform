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

${this.getAgeSpecificComponentGuidance(age)}

**LESSON PLAN CONTENT INTEGRATION:**
- Seamlessly integrate age-appropriate interactive elements into slide content descriptions
- Naturally weave teaching approaches and activities based on component guidance
- Consider cognitive load and attention span for ${age} year olds
- Balance interactive elements with content delivery
- Plan for progressive difficulty across slides
- Write educational content that teachers can directly implement

IMPORTANT:
- Use clear slide structure: "#### Slide X: [Title]"
- DO NOT include duration in slide titles (e.g. use "Introduction" not "Introduction (5 minutes)")
- Integrate teaching approaches naturally within slide descriptions
- Focus on pedagogical methods rather than technical specifications
- Write in educational language that emphasizes student engagement and learning outcomes

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
**Content:** [Detailed content description integrated with age-appropriate interactive elements and teaching approaches based on the component guidance above]

### Slide 2: Main Material - Part 1
**Type:** Educational
**Goal:** [Slide goal]
**Content:** [Detailed content description integrated with age-appropriate interactive elements and teaching approaches based on the component guidance above]

### Slide 3: Main Material - Part 2
**Type:** Educational
**Goal:** [Slide goal]
**Content:** [Detailed content description integrated with age-appropriate interactive elements and teaching approaches based on the component guidance above]

### Slide 4: Practical Task
**Type:** Activity
**Goal:** [Slide goal]
**Content:** [Detailed activity description integrated with age-appropriate interactive elements and teaching approaches based on the component guidance above]

### Slide 5: Summary and Reinforcement
**Type:** Summary
**Goal:** [Slide goal]
**Content:** [Detailed summary description integrated with age-appropriate interactive elements and teaching approaches based on the component guidance above]

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
- Each slide must contain detailed description (minimum 100 words)
- Adapt content for age ${age}
- Include interactive elements naturally within content descriptions
- Make the lesson engaging and educational
- DO NOT include duration or time information in slide titles (e.g. use "Introduction" not "Introduction (5 minutes)")
- Write content descriptions in natural, educational language that teachers can follow
- Integrate component recommendations seamlessly into teaching suggestions rather than as technical specifications
- Focus on pedagogical approaches and student engagement rather than technical implementation details`;
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
**AVAILABLE COMPONENTS FOR 2-3 YEARS (Choose appropriate ones for each slide):**

**🌟 SIMPLE, LARGE INTERACTIONS:**
- Use one very large, prominent button as the main focus - limit to ONE per slide
- Create large, central visual elements that capture attention
- Include basic shape recognition activities with large touch areas
- Use for: Primary interactions, main content display, shape recognition
- Teaching approach: Single-focus design with extra-large interactive elements

**🐾 FRIENDLY CHARACTER ENGAGEMENT:**
- Include animated animal characters that move and respond
- Use large, friendly buttons for simple interactions
- Focus on one character or element at a time
- Use for: Emotional connection, basic recognition, simple cause-effect
- Teaching approach: Character-based learning with simple, clear interactions

**🎵 AUDIO-FIRST LEARNING:**
- Sound buttons with visual waves
- Audio toggle always visible
- Large speaker elements
- Use for: Sound recognition, music play, audio feedback
- Component classes: .sound-button, .sound-wave, .audio-toggle

**🏆 IMMEDIATE REWARDS:**
- Large reward stars (120px) with sparkle animations
- Celebration bursts with spinning effects
- Progress visual with large progress bar
- Use for: Instant gratification, achievement recognition
- Component classes: .reward-star, .celebration-burst, .progress-visual

**🖼️ SIMPLE VISUAL LEARNING:**
- Hero images (400×300) for main content
- Story images (280×210) for narrative
- Activity images (200×200) for interactive elements
- Mini images (120×120) for small accents
- Use for: Visual recognition, simple storytelling, basic concepts
- Component classes: .hero-image, .story-image, .activity-image, .mini-image

**COMPONENT SELECTION GUIDELINES FOR 2-3 YEARS:**

**WELCOME SLIDES:**
- ONE giant button as primary focus
- Simple 1-3 word titles only
- Bright, high-contrast colors
- Floating decorations for visual interest

**LEARNING SLIDES:**
- Main visual circle for content focus
- Supporting hero image if needed
- Maximum 2 interactive elements total
- Audio feedback for every interaction

**ACTIVITY SLIDES:**
- Touch shapes for basic learning games
- Animal friends for character interaction
- Immediate audio/visual feedback
- Simple cause-and-effect interactions

**REWARD SLIDES:**
- Large celebration elements
- Progress visuals with animations
- Reward stars for achievement
- Positive audio reinforcement

**CRITICAL DESIGN RULES FOR 2-3 YEARS:**
- ONE main interactive element per slide maximum
- All touch targets minimum 180px size
- Maximum 3 words in any text element
- Bright, high-contrast colors only
- No complex navigation or multiple choices
- Immediate feedback for every action`;

    } else if (ageGroup === '4-6') {
      return `
**AVAILABLE COMPONENTS FOR 4-6 YEARS (Choose appropriate ones for each slide):**

**🎯 ENGAGING INTERACTION METHODS:**
- Use very large, prominent buttons for main activities
- Include medium-sized buttons for secondary choices
- Create educational cards that students can explore
- Add smaller interactive elements for specific tasks
- Use for: Primary interactions, learning activities, game elements
- Teaching approach: Size-graded interactions that guide student attention

**🎮 SKILL-BUILDING GAMES:**
- Create large, central visual elements to focus attention
- Design alphabet cards for letter recognition practice
- Use number blocks for counting and basic math concepts
- Include audio buttons for pronunciation and sound learning
- Use for: Active learning, skill practice, concept reinforcement
- Teaching approach: Game-based learning with focused skill development

**🏆 MOTIVATION & PROGRESS:**
- Progress visual with animated fill
- Reward stars with rotation effects
- Achievement medals with spin animations
- Points display for accomplishment tracking
- Use for: Goal setting, achievement recognition, engagement
- Component classes: .progress-visual, .reward-star, .medal, .points

**🖼️ VISUAL LEARNING COMPONENTS:**
- Hero images (400×300) for main educational content
- Story images (320×240) for narrative elements
- Activity images (240×240) for interactive exercises
- Learning images (180×180) for supporting content
- Use for: Visual learning, story telling, concept illustration
- Component classes: .hero-image, .story-image, .activity-image, .learning-image

**🎵 AUDIO & SOUND ELEMENTS:**
- Sound buttons with interactive effects
- Audio toggle for user control
- Animal sound triggers
- Musical elements for engagement
- Use for: Auditory learning, language development, engagement
- Component classes: .sound-button, .audio-toggle

**COMPONENT SELECTION GUIDELINES FOR 4-6 YEARS:**

**WELCOME/INTRODUCTION SLIDES:**
- Giant button as primary call-to-action
- Main title (max 5 words) with animations
- Hero image for topic introduction
- 4-6 floating decorations for visual appeal

**CONTENT/LEARNING SLIDES:**
- Main visual circle for central concept
- Supporting images (story or learning images)
- Learning cards for interactive exploration
- Audio elements for multi-sensory learning

**ACTIVITY/GAME SLIDES:**
- Interactive buttons for game mechanics
- Number blocks or alphabet cards for skill practice
- Progress tracking for motivation
- Reward elements for achievement

**PRACTICE SLIDES:**
- Multiple learning cards for concept practice
- Sound buttons for pronunciation/audio
- Visual feedback elements
- Achievement tracking systems

**ASSESSMENT/REVIEW SLIDES:**
- Simple choice elements (large buttons)
- Progress visuals showing completion
- Reward systems for encouragement
- Celebration elements for success

**DESIGN PRINCIPLES FOR 4-6 YEARS:**
- Maximum 5 words in titles and instructions
- Interactive elements minimum 120px size
- Bright but not overwhelming colors
- Clear visual hierarchy with 3-5 main elements
- Audio feedback for all interactions
- Simple navigation patterns`;

    } else if (ageGroup === '7-8') {
      return `
**AVAILABLE COMPONENTS FOR 7-8 YEARS (Choose appropriate ones for each slide):**

**🏗️ SLIDE TEMPLATE STRUCTURE:**
- Use .slide-container as main wrapper with proper layout structure
- Include .slide-header with .slide-title-area containing .slide-main-title and .slide-subtitle
- Use .slide-content with scrollable content area for main educational material
- Add .slide-footer for navigation controls and progress tracking
- Structure content in .content-section containers with .section-title headers
- Include .scroll-indicator to show when more content is available
- Use for: Professional slide organization, consistent layout, content-heavy presentations
- Teaching approach: Structured presentation with clear visual hierarchy and professional appearance

**✍️ TYPOGRAPHY SYSTEM:**
- Use .main-heading (32px) with gradient text for lesson titles
- Apply .section-heading (24px, underlined) for major sections with icons
- Include .sub-heading (20px) for detailed subsections
- Add .instruction-text-style (16px) for activity instructions with blue border
- Use .highlight-text with yellow background for important information
- Include .success-text (green) for correct feedback and .error-text (red) for errors
- Use .hint-text (gray italic) for helpful guidance and tips
- Include .reading-title and .reading-content for sustained reading passages
- Use .list-title with .learning-list and .list-item for organized content
- Add .educational-quote for inspirational or key concept text
- Use for: Clear text hierarchy, readable content, proper feedback, organized information
- Teaching approach: Visual text organization that guides student attention and comprehension

**🔢 SEQUENTIAL PROBLEM-SOLVING APPROACHES:**
- Use .step-container with .step-item elements for 4-step learning process
- Include .step-number, .step-title, .step-description for clear progression
- Add .step-check-btn for interactive confirmation of understanding
- Track completion with visual states showing progress
- Use for: Complex tasks, multi-step problems, structured learning sequences
- Teaching approach: Guided step-by-step learning with visual progress tracking and self-pacing

**📝 COMPREHENSIVE INTERACTIVE ELEMENTS:**
- Use .exercise-container with .exercise-text for problem presentation
- Include .answer-options with .option-btn for multiple choice questions
- Add .check-work-btn for answer validation and feedback
- Use .activity-area for containing interactive exercises and games
- Include .learning-objectives with .objective-item for goal listing
- Add hover effects and color changes (.correct, .incorrect) for feedback
- Use for: Active learning, concept reinforcement, skill practice, assessment
- Teaching approach: Hands-on interaction with immediate educational feedback

**💡 ADVANCED HINT & SUPPORT SYSTEMS:**
- Use .hint-system with .hint-btn for progressive hint delivery
- Include .mistake-analysis with .mistake-title and .mistake-explanation
- Add contextual help that appears when students struggle
- Provide multiple levels of guidance without giving away answers
- Use for: Challenging exercises, when students need guidance, building independence
- Teaching approach: Graduated support that encourages independent thinking while providing necessary assistance

**🧠 CRITICAL THINKING & ASSESSMENT:**
- Complex matching exercises with connecting visual elements
- True/False questions with comprehensive explanations in feedback text
- Memory games with flip-card mechanics and state management
- Story creation tools with guided choices and validation
- Note-taking areas for reflection and personal responses
- Use for: Critical thinking development, logical reasoning, creativity, comprehension assessment
- Teaching approach: Structured thinking exercises that build cognitive skills and analytical abilities

**🏆 MOTIVATION & PROGRESS TRACKING:**
- Visual progress indicators showing completion percentages
- Achievement recognition through color changes and animations
- Interactive feedback systems with immediate response
- Success validation with visual and textual confirmation
- Use for: Engagement, goal setting, progress visualization, motivation maintenance
- Teaching approach: Positive reinforcement with detailed progress tracking and achievement recognition

**📱 SCROLLING & NAVIGATION:**
- .slide-content with overflow-y: auto for scrollable content areas
- .scroll-indicator showing when more content is available below
- Keyboard navigation support (arrows for navigation/scrolling)
- Responsive design that adapts to different screen sizes and orientations
- Professional scrollbar styling that matches the educational theme
- Use for: Content-heavy slides, comprehensive lessons, professional presentation
- Teaching approach: Smooth user experience with intuitive navigation patterns

**🔊 AUDIO & ACCESSIBILITY:**
- .audio-toggle with .audio-status for user-controlled audio feedback
- Speech synthesis integration for all interactive elements and text
- Keyboard navigation support with clear focus indicators
- Screen reader friendly structure with proper semantic HTML
- ARIA labels and roles for accessibility compliance
- Use for: Multi-modal learning, accessibility compliance, inclusive design
- Teaching approach: Inclusive design supporting diverse learning needs and preferences

**⚙️ TECHNICAL SPECIFICATIONS FOR 7-8 YEARS:**
- Attention span: 15-25 minutes maximum per slide with scrollable content
- Text sizing: .main-heading (32px), .section-heading (24px), .section-text (16px)
- Minimum interactive element size: .option-btn with 50px height minimum
- Color contrast: 4.5:1 ratio minimum for accessibility compliance
- Animation timing: 0.3s transitions for professional, mature feel
- Data persistence: localStorage integration for progress saving
- Device optimization: tablets, desktops, laptops with responsive breakpoints
- Use for: Professional educational delivery with technical reliability
- Teaching approach: Age-appropriate technical implementation with reliability focus

**COMPONENT SELECTION GUIDELINES FOR 7-8 YEARS:**

**SLIDE TEMPLATE STRUCTURE USAGE:**
- Always wrap content in .slide-container for consistent layout
- Include .slide-header with proper title hierarchy (.slide-main-title, .slide-subtitle)
- Use .slide-content with .scroll-indicator for extensive material presentation
- Add .slide-footer for navigation and progress tracking elements

**WELCOME/INTRODUCTION SLIDES:**
- .slide-container with sequential problem-solving overview using .step-container
- Typography system with .main-heading for clear title hierarchy
- .content-section containers for organized information presentation
- Interactive .option-btn elements to set learning expectations

**CONTENT/LEARNING SLIDES:**
- .content-section containers with .section-title for organized information
- Typography components (.section-heading, .section-text) for clear text organization
- .learning-objectives with .objective-item for structured goal presentation
- .activity-area containers for interactive learning elements

**PRACTICE/ACTIVITY SLIDES:**
- .exercise-container with .exercise-text and .answer-options for structured activities
- .hint-system with .hint-btn and .hint-text for progressive guidance
- .check-work-btn with feedback through .success-text or .error-text
- .mistake-analysis for detailed learning support and explanation

**GAME/CHALLENGE SLIDES:**
- Interactive .option-btn elements with .correct/.incorrect state management
- .step-container for complex problem-solving workflows
- Achievement feedback through color changes and text updates
- .activity-area containers for complex interactive experiences

**ASSESSMENT/REVIEW SLIDES:**
- .learning-objectives with .objective-item for self-assessment checklists
- Multiple choice elements with comprehensive explanation feedback
- .step-container for multi-step validation processes
- Reflection areas using .instruction-text-style for guided responses

**MANDATORY DESIGN PRINCIPLES FOR 7-8 YEARS:**
- Use .slide-container structure for all content organization
- Apply typography system (.main-heading, .section-heading, .section-text) for text hierarchy
- Include .scroll-indicator and scrollable .slide-content for content-heavy presentations
- Implement .audio-toggle and .audio-status for accessibility controls
- Provide keyboard navigation support with proper focus management
- Use appropriate visual feedback (.success-text, .error-text, .highlight-text) for all interactions
- Maintain professional, age-appropriate design aesthetic with proper color contrast
- Balance challenge with support through .hint-system and .mistake-analysis components`;

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
} 