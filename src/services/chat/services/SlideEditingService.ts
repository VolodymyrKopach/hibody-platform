import { GeminiSimpleEditService } from '@/services/content/GeminiSimpleEditService';
import { GeminiContentService } from '@/services/content/GeminiContentService';
import { type SimpleSlide } from '@/types/chat';
import { type ProcessedSlideData, processSlideWithImages } from '@/utils/slideImageProcessor';
import { ISlideEditingService } from '../interfaces/IChatServices';

// === SOLID: Single Responsibility - Slide Editing ===
export class SlideEditingService implements ISlideEditingService {
  constructor(private simpleEditService: GeminiSimpleEditService) {}

  async editSlide(slide: SimpleSlide, instruction: string, topic: string, age: string): Promise<SimpleSlide> {
    const editedHTML = await this.simpleEditService.editSlide(
      slide.htmlContent || slide.content,
      instruction,
      topic,
      age
    );

    // Process images after editing
    const imageProcessingResult: ProcessedSlideData = await processSlideWithImages(editedHTML);
    const finalSlideHTML = imageProcessingResult.htmlWithImages;

    return {
      ...slide,
      htmlContent: finalSlideHTML,
      content: `${slide.content} (edited: ${instruction})`,
      updatedAt: new Date()
    };
  }

  async regenerateSlide(slide: SimpleSlide, topic: string, age: string): Promise<SimpleSlide> {
    // Use the original description with regeneration instruction
    const regenerationInstruction = `${slide.content}. Create a NEW version of this slide with a different design and approach.`;
    
    const contentService = new GeminiContentService();
    const newSlideHTML = await contentService.generateSlideContent(regenerationInstruction, topic, age);

    return {
      ...slide,
      htmlContent: newSlideHTML,
      content: `${slide.content} (regenerated)`, // Translated
      updatedAt: new Date()
    };
  }

  async improveSlide(slide: SimpleSlide, instruction: string, topic: string, age: string): Promise<SimpleSlide> {
    const improvementPrompt = `Improve the design and interactivity of the existing slide: "${instruction}". \n    \nCurrent HTML content of the slide for improvement:\n${slide.htmlContent?.substring(0, 1000)}...\n\nCreate an improved version with better design, animations and interactivity.`; // Translated

    const contentService = new GeminiContentService();
    const improvedHTML = await contentService.generateSlideContent(improvementPrompt, topic, age);

    return {
      ...slide,
      htmlContent: improvedHTML,
      content: `${slide.content} (improved: ${instruction})`, // Translated
      updatedAt: new Date()
    };
  }
} 