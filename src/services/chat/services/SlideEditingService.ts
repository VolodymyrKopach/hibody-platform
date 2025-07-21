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
      content: `${slide.content} (відредаговано: ${instruction})`,
      updatedAt: new Date()
    };
  }

  async regenerateSlide(slide: SimpleSlide, topic: string, age: string): Promise<SimpleSlide> {
    // Use the original description with regeneration instruction
    const regenerationInstruction = `${slide.content}. Створіть НОВИЙ варіант цього слайду з іншим дизайном та підходом.`;
    
    const contentService = new GeminiContentService();
    const newSlideHTML = await contentService.generateSlideContent(regenerationInstruction, topic, age);

    return {
      ...slide,
      htmlContent: newSlideHTML,
      content: `${slide.content} (перегенеровано)`,
      updatedAt: new Date()
    };
  }

  async improveSlide(slide: SimpleSlide, instruction: string, topic: string, age: string): Promise<SimpleSlide> {
    const improvementPrompt = `Покращити дизайн та інтерактивність існуючого слайду: "${instruction}". 
    
Поточний HTML контент слайду для покращення:
${slide.htmlContent?.substring(0, 1000)}...

Створіть покращену версію з кращим дизайном, анімаціями та інтерактивністю.`;

    const contentService = new GeminiContentService();
    const improvedHTML = await contentService.generateSlideContent(improvementPrompt, topic, age);

    return {
      ...slide,
      htmlContent: improvedHTML,
      content: `${slide.content} (покращено: ${instruction})`,
      updatedAt: new Date()
    };
  }
} 