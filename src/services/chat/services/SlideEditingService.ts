import { GeminiSimpleEditService } from '@/services/content/GeminiSimpleEditService';
import { GeminiContentService } from '@/services/content/GeminiContentService';
import { type SimpleSlide } from '@/types/chat';
import { ISlideEditingService } from '../interfaces/IChatServices';
import { getThumbnailUpdateService } from '../../slides/ThumbnailUpdateService';

// === SOLID: Single Responsibility - Slide Editing ===
export class SlideEditingService implements ISlideEditingService {
  private thumbnailUpdateService = getThumbnailUpdateService();
  
  constructor(private simpleEditService: GeminiSimpleEditService) {}

  async editSlide(slide: SimpleSlide, instruction: string, topic: string, age: string, sessionId?: string): Promise<SimpleSlide> {
    const editedHTML = await this.simpleEditService.editSlide(
      slide.htmlContent || slide.content,
      instruction,
      topic,
      age
    );

    const updatedSlide = {
      ...slide,
      htmlContent: editedHTML,
      content: `${slide.content} (edited: ${instruction})`,
      updatedAt: new Date()
    };

    // Regenerate thumbnail after editing (only on client-side)
    if (typeof document !== 'undefined') {
      try {
        console.log(`🎨 [SLIDE EDITING] Regenerating thumbnail for slide ${slide.id}`);
        await this.thumbnailUpdateService.regenerateThumbnail(
          slide.id,
          editedHTML,
          { forceRegenerate: true, fast: true }
        );
        console.log(`✅ [SLIDE EDITING] Thumbnail regenerated for slide ${slide.id}`);
      } catch (error) {
        console.error(`❌ [SLIDE EDITING] Failed to regenerate thumbnail for slide ${slide.id}:`, error);
        // Don't fail the entire operation if thumbnail generation fails
      }
    } else {
      console.log(`💻 [SLIDE EDITING] Server-side: Skipping thumbnail regeneration for slide ${slide.id}`);
    }

    return updatedSlide;
  }

  async regenerateSlide(slide: SimpleSlide, topic: string, age: string, sessionId?: string): Promise<SimpleSlide> {
    // Use the original description with regeneration instruction
    const regenerationInstruction = `${slide.content}. Create a NEW version of this slide with a different design and approach.`;
    
    const contentService = new GeminiContentService();
    const newSlideHTML = await contentService.generateSlideContent(
      regenerationInstruction, 
      topic, 
      age, 
      { sessionId, useTemporaryStorage: true }
    );

    const updatedSlide = {
      ...slide,
      htmlContent: newSlideHTML,
      content: `${slide.content} (regenerated)`,
      updatedAt: new Date()
    };

    // Regenerate thumbnail after regeneration (only on client-side)
    if (typeof document !== 'undefined') {
      try {
        console.log(`🎨 [SLIDE EDITING] Regenerating thumbnail for regenerated slide ${slide.id}`);
        await this.thumbnailUpdateService.regenerateThumbnail(
          slide.id,
          newSlideHTML,
          { forceRegenerate: true, fast: true }
        );
        console.log(`✅ [SLIDE EDITING] Thumbnail regenerated for regenerated slide ${slide.id}`);
      } catch (error) {
        console.error(`❌ [SLIDE EDITING] Failed to regenerate thumbnail for regenerated slide ${slide.id}:`, error);
      }
    } else {
      console.log(`💻 [SLIDE EDITING] Server-side: Skipping thumbnail regeneration for regenerated slide ${slide.id}`);
    }

    return updatedSlide;
  }

  async improveSlide(slide: SimpleSlide, instruction: string, topic: string, age: string, sessionId?: string): Promise<SimpleSlide> {
    const improvementPrompt = `Improve the design and interactivity of the existing slide: "${instruction}". \n    \nCurrent HTML content of the slide for improvement:\n${slide.htmlContent?.substring(0, 1000)}...\n\nCreate an improved version with better design, animations and interactivity.`; // Translated

    const contentService = new GeminiContentService();
    const improvedHTML = await contentService.generateSlideContent(
      improvementPrompt, 
      topic, 
      age, 
      { sessionId, useTemporaryStorage: true }
    );

    const updatedSlide = {
      ...slide,
      htmlContent: improvedHTML,
      content: `${slide.content} (improved: ${instruction})`,
      updatedAt: new Date()
    };

    // Regenerate thumbnail after improvement (only on client-side)
    if (typeof document !== 'undefined') {
      try {
        console.log(`🎨 [SLIDE EDITING] Regenerating thumbnail for improved slide ${slide.id}`);
        await this.thumbnailUpdateService.regenerateThumbnail(
          slide.id,
          improvedHTML,
          { forceRegenerate: true, fast: true }
        );
        console.log(`✅ [SLIDE EDITING] Thumbnail regenerated for improved slide ${slide.id}`);
      } catch (error) {
        console.error(`❌ [SLIDE EDITING] Failed to regenerate thumbnail for improved slide ${slide.id}:`, error);
      }
    } else {
      console.log(`💻 [SLIDE EDITING] Server-side: Skipping thumbnail regeneration for improved slide ${slide.id}`);
    }

    return updatedSlide;
  }
} 