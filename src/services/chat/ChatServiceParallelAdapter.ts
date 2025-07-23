import { ParallelSlideGenerationService, ParallelGenerationCallbacks } from './ParallelSlideGenerationService';
import { SlideDescription, SimpleLesson, SlideGenerationProgress, SimpleSlide } from '@/types/chat';
import { ConversationHistory, ChatResponse } from './types';
import { GeminiContentService } from '@/services/content/GeminiContentService';

export class ChatServiceParallelAdapter {
  private parallelService: ParallelSlideGenerationService;
  private contentService: GeminiContentService;

  constructor() {
    this.parallelService = new ParallelSlideGenerationService();
    this.contentService = new GeminiContentService();
  }

//   /**
//    * Approves plan with PARALLEL slide generation
//    */
//   async handleApprovePlanParallel(
//     conversationHistory: ConversationHistory,
//     callbacks?: ParallelGenerationCallbacks
//   ): Promise<ChatResponse> {
//     if (!conversationHistory?.planningResult) {
//       throw new Error('No plan to approve');
//     }
//
//     console.log('🎨 Starting PARALLEL slide generation...');
//
//     try {
//       // === STEP 1: Extract all slide descriptions from the plan ===
//       const slideDescriptions = this.extractAllSlideDescriptions(conversationHistory.planningResult);
//       console.log(`📄 Extracted ${slideDescriptions.length} slide descriptions from plan`);
//
//       // === STEP 2: Initialize lesson ===
//       const lesson: SimpleLesson = {
//         id: `lesson_${Date.now()}`,
//         title: conversationHistory.lessonTopic || 'New Lesson',
//         description: `Lesson about ${conversationHistory.lessonTopic} for children ${conversationHistory.lessonAge}`,
//         subject: 'General Education',
//         ageGroup: conversationHistory.lessonAge || '8-9 years',
//         duration: 30,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         authorId: 'ai-chat',
//         slides: []
//       };
//
//       // === STEP 3: Initialize progress state ===
//       const initialProgress: SlideGenerationProgress[] = slideDescriptions.map(desc => ({
//         slideNumber: desc.slideNumber,
//         title: desc.title,
//         status: 'pending',
//         progress: 0
//       }));
//
//       const newConversationHistory: ConversationHistory = {
//         ...conversationHistory,
//         step: 'bulk_generation',
//         slideDescriptions,
//         slideGenerationProgress: initialProgress,
//         bulkGenerationStartTime: new Date(),
//         isGeneratingAllSlides: true,
//         currentLesson: lesson
//       };
//
//       // === STEP 4: Start PARALLEL generation ===
//       if (callbacks) {
//         // Background generation with callbacks
//         this.parallelService.generateAllSlidesParallel(
//           slideDescriptions,
//           conversationHistory.lessonTopic || 'lesson',
//           conversationHistory.lessonAge || '6-8 years',
//           lesson,
//           callbacks
//         ).catch(error => {
//           console.error('❌ Parallel generation error:', error);
//           callbacks.onError('Generation failed', 0);
//         });
//       }
//
//       // === STEP 5: Return initial message ===
//       const initialMessage = `🎨 **Starting PARALLEL generation of all slides!**
//
// 📊 **Generation plan:**
// ${slideDescriptions.map(desc => `${desc.slideNumber}. ${desc.title} (${desc.type})`).join('\n')}
//
// ⚡ **Benefits of parallel generation:**
// • All ${slideDescriptions.length} slides are generated simultaneously
// • Slides will appear in the right panel as they become ready
// • Significantly faster than sequential generation
//
// 🎯 **Estimated time:** ${Math.ceil(slideDescriptions.length * 15 / 4)} seconds (instead of ${slideDescriptions.length * 30})`;
//
//       return {
//         success: true,
//         message: initialMessage,
//         conversationHistory: newConversationHistory,
//         actions: [
//           {
//             action: 'cancel_generation',
//             label: '⏹️ Cancel generation',
//             description: 'Stop the slide generation process'
//           }
//         ],
//         lesson: lesson
//       };
//
//     } catch (error) {
//       console.error('❌ Error in parallel approval:', error);
//
//       return {
//         success: false,
//         message: `😔 An error occurred while initiating parallel generation.\n\n**Error:** ${error instanceof Error ? error.message : 'Unknown error'}`,
//         conversationHistory,
//         error: error instanceof Error ? error.message : 'Unknown error'
//       };
//     }
//   }

  /**
   * Extracts all slide descriptions from the plan (simplified version)
   */
  private extractAllSlideDescriptions(planningResult: string): SlideDescription[] {
    console.log('📄 Extracting all slide descriptions from plan...');
    
    const slides: SlideDescription[] = [];
    
    // Patterns for recognizing slides
    const patterns = [
      /###\s*Слайд\s+(\d+):\s*([^\n]+)/gi,
      /Слайд\s*(\d+)[\.:]?\s*([^\n]+)/gi,
      /(\d+)\.\s*([^\n]+)/gi
    ];

    let found = false;
    
    for (const pattern of patterns) {
      const matches = Array.from(planningResult.matchAll(pattern));
      
      if (matches.length > 0) {
        console.log(`✅ Found ${matches.length} slides using pattern: ${pattern.source}`);
        
        matches.forEach(match => {
          const slideNumber = parseInt(match[1]);
          const title = match[2].trim();
          
          if (slideNumber && title && slideNumber <= 10) {
            slides.push({
              slideNumber,
              title,
              description: `Create slide "${title}" for the lesson`,
              type: slideNumber === 1 ? 'welcome' : 
                    slideNumber === matches.length ? 'summary' : 'content'
            });
          }
        });
        
        found = true;
        break;
      }
    }

    // Fallback to standard structure
    if (!found || slides.length === 0) {
      console.log('🔄 Using fallback slide structure');
      
      const defaultSlides = [
        { title: 'Introduction', type: 'welcome' as const },
        { title: 'Main part', type: 'content' as const },
        { title: 'Practical task', type: 'content' as const },
        { title: 'Summary', type: 'summary' as const }
      ];

      defaultSlides.forEach((slide, index) => {
        slides.push({
          slideNumber: index + 1,
          title: slide.title,
          description: `Create slide "${slide.title}" for the lesson`,
          type: slide.type
        });
      });
    }

    // Sort by slide number
    slides.sort((a, b) => a.slideNumber - b.slideNumber);
    
    console.log('📋 Extracted slides:', slides.map(s => `${s.slideNumber}. ${s.title}`));
    
    return slides;
  }
} 