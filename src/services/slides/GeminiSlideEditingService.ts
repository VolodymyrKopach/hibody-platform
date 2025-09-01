import { GoogleGenAI } from '@google/genai';
import { SimpleSlide } from '@/types/chat';
import { SlideComment } from '@/types/templates';
import { processSlideWithTempImages } from '@/utils/slideImageProcessor';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface SlideEditingResult {
  editedSlide: SimpleSlide;
  slideChanges: {
    slideId: string;
    changes: {
      section: string;
      shortDescription: string;
      detailedDescription: string;
      appliedComment: SlideComment;
    }[];
    summary: {
      totalChanges: number;
      affectedSections: string[];
      improvementAreas: string[];
    };
    imageProcessing?: {
      imagesGenerated: number;
      temporaryImages: number;
      processingErrors: string[];
      sessionId: string | null;
    };
  };
}

export interface SlideEditingContext {
  ageGroup: string;
  topic: string;
  lessonObjectives?: string[];
  slidePosition?: number;
  totalSlides?: number;
}

/**
 * Professional slide editing service using Gemini 2.5 Flash
 * No fallback - either works or throws error for snackbar display
 */
export class GeminiSlideEditingService {
  private client: GoogleGenAI;
  private supabaseClient?: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required for slide editing');
    }
    this.client = new GoogleGenAI({ apiKey });
    this.supabaseClient = supabaseClient;
  }

  /**
   * Edit a slide based on user comments using Gemini AI
   */
  async editSlide(
    slide: SimpleSlide,
    comments: SlideComment[],
    context: SlideEditingContext
  ): Promise<SlideEditingResult> {
    console.log('🤖 [GEMINI_SLIDE_EDITING] Starting AI slide editing', {
      slideId: slide.id,
      slideTitle: slide.title,
      commentsCount: comments.length,
      context,
      htmlContentLength: slide.htmlContent?.length || 0
    });

    // Build comprehensive prompt for slide editing
    const prompt = this.buildEditingPrompt(slide, comments, context);
    
    console.log('📝 [GEMINI_SLIDE_EDITING] Generated prompt', {
      promptLength: prompt.length,
      slideId: slide.id,
      htmlContentLength: slide.htmlContent?.length || 0
    });

    // Call Gemini AI with maximum token limit
    const response = await this.callGeminiAPI(prompt);
    
    console.log('🎯 [GEMINI_SLIDE_EDITING] Received AI response', {
      responseLength: response.length,
      slideId: slide.id,
      endsWithHtml: response.includes('</html>'),
      endsWithClosingBrace: response.trim().endsWith('}'),
      lastChars: response.slice(-200)
    });

    // Parse and validate response
    const result = this.parseEditingResponse(response, slide, comments);
    
    console.log('✅ [GEMINI_SLIDE_EDITING] Successfully processed slide editing', {
      slideId: slide.id,
      changesApplied: result.slideChanges.changes.length,
      affectedSections: result.slideChanges.summary.affectedSections,
      finalHtmlLength: result.editedSlide.htmlContent?.length || 0,
      htmlComplete: result.editedSlide.htmlContent?.includes('</html>') || false
    });

    // Process image prompts in the edited slide
    const processedResult = await this.processImagePrompts(result, slide.id);
    
    return processedResult;
  }

  /**
   * Build comprehensive prompt for slide editing
   */
  private buildEditingPrompt(
    slide: SimpleSlide,
    comments: SlideComment[],
    context: SlideEditingContext
  ): string {
    const commentsText = comments.map(comment => 
      `• ${comment.sectionType.toUpperCase()} (${comment.priority} priority): ${comment.comment}`
    ).join('\n');

    return `You are an expert educational content editor. Edit this slide based on user feedback and return the COMPLETE result.

**SLIDE TO EDIT:**
Title: "${slide.title}"
Content: ${slide.content || 'No text content'}

**USER FEEDBACK:**
${commentsText}

**CONTEXT:** Age: ${context.ageGroup}, Topic: ${context.topic}

**CURRENT HTML (EDIT THIS COMPLETELY):**
${slide.htmlContent || 'No HTML content'}

**TASK:** Apply the user feedback and return the complete edited slide.

**IMPORTANT LANGUAGE GUIDELINES:**
- User-facing content (titles, instructions, text for children): Can be in any language appropriate for the target audience
- System content (image prompts, alt attributes, CSS classes, data attributes): MUST be in ENGLISH
- Example: data-image-prompt="happy cartoon cow in green meadow" (ENGLISH)
- Example: alt="cartoon cow" (ENGLISH)  
- Example: <h1>Корівка каже МУ!</h1> (user content can be Ukrainian/other languages)

**IMAGE INTEGRATION:**
- You can add new images by using IMAGE_PROMPT comments in this EXACT format:
  <!-- IMAGE_PROMPT: "description of image" WIDTH: 400 HEIGHT: 400 -->
- These comments will be automatically replaced with actual generated images
- Image prompts MUST be in ENGLISH and descriptive
- ALWAYS include quotes around the description and WIDTH/HEIGHT parameters
- Example: <!-- IMAGE_PROMPT: "colorful cartoon elephant playing with children in a playground" WIDTH: 400 HEIGHT: 400 -->
- Place IMAGE_PROMPT comments where you want images to appear in the HTML

**RETURN FORMAT - PURE JSON ONLY (NO MARKDOWN):**
{
  "editedTitle": "new title",
  "editedContent": "new content", 
  "editedHtmlContent": "COMPLETE HTML - start with <!DOCTYPE html> and end with </html>",
  "changes": [{"section": "general", "shortDescription": "what changed", "detailedDescription": "detailed explanation"}],
  "improvementAreas": ["what was improved"]
}

**CRITICAL REQUIREMENTS:**
1. editedHtmlContent MUST be the COMPLETE HTML document from <!DOCTYPE to </html>
2. Apply ALL user feedback 
3. Keep age-appropriate for ${context.ageGroup}
4. Return ONLY valid JSON - NO markdown blocks, NO \`\`\`json, NO extra text
5. Do NOT truncate the HTML - return everything
6. Start response immediately with { and end with }
7. **JSON ESCAPING RULES:**
   - Escape all quotes inside strings with \"
   - Escape all backslashes with \\\\
   - Escape newlines with \\n, tabs with \\t
   - NO unescaped quotes or backslashes in JSON strings
8. **LANGUAGE RULES:**
   - ALL image prompts, alt texts, and system-related content MUST be in ENGLISH
   - Only user-facing content (titles, instructions, text for children) can be in other languages
   - CSS classes, IDs, data attributes, and technical elements MUST remain in ENGLISH
   - Image generation prompts in data-image-prompt attributes MUST be in ENGLISH
   - IMAGE_PROMPT comments MUST be in ENGLISH
9. **IMAGE PROCESSING:**
   - Use IMAGE_PROMPT comments in EXACT format: <!-- IMAGE_PROMPT: "description" WIDTH: 400 HEIGHT: 400 -->
   - MUST include quotes around description and WIDTH/HEIGHT parameters
   - Existing images will be preserved unless specifically requested to change
   - New IMAGE_PROMPT comments will be automatically converted to actual images

Generate pure JSON now:`;
  }

  /**
   * Call Gemini API with the editing prompt (with retry logic)
   */
  private async callGeminiAPI(prompt: string, retryCount = 0): Promise<string> {
    const maxRetries = 3;
    
    console.log('🚀 [GEMINI_API] Calling Gemini with maximum token limits', {
      promptLength: prompt.length,
      maxOutputTokens: 65536,
      attempt: retryCount + 1,
      maxRetries
    });

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 65536,
          topP: 0.9,
          topK: 50
        }
      });

      const content = response.text;
      if (!content) {
        throw new Error('Empty response from Gemini API');
      }

      console.log('📡 [GEMINI_API] Response received successfully', {
        responseLength: content.length,
        approximateTokens: Math.ceil(content.length / 3.5),
        endsWithHtml: content.includes('</html>'),
        endsWithBrace: content.trim().endsWith('}'),
        attempt: retryCount + 1
      });

      return content.trim();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.error(`❌ [GEMINI_API] Attempt ${retryCount + 1} failed`, {
        error: errorMessage,
        retryCount,
        maxRetries
      });

      // Check if it's a retryable error
      const isRetryable = errorMessage.includes('overloaded') || 
                         errorMessage.includes('503') ||
                         errorMessage.includes('UNAVAILABLE') ||
                         errorMessage.includes('quota');

      if (isRetryable && retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`⏳ [GEMINI_API] Retrying in ${delay}ms (attempt ${retryCount + 2}/${maxRetries + 1})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callGeminiAPI(prompt, retryCount + 1);
      }

      // If not retryable or max retries reached, throw the error
      throw error;
    }
  }

  /**
   * Parse and validate Gemini response - no fallback, just throw errors
   */
  private parseEditingResponse(
    response: string,
    originalSlide: SimpleSlide,
    comments: SlideComment[]
  ): SlideEditingResult {
    // Clean response - remove markdown formatting if present
    let cleanResponse = response.trim();
    
    // Remove markdown code blocks
    if (cleanResponse.includes('```json')) {
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    } else if (cleanResponse.includes('```')) {
      cleanResponse = cleanResponse.replace(/```\s*/g, '');
    }
    
    // Remove any trailing markdown or extra characters
    cleanResponse = cleanResponse.trim();

    console.log('🔍 [GEMINI_SLIDE_EDITING] Cleaned response preview', {
      length: cleanResponse.length,
      startsWithBrace: cleanResponse.startsWith('{'),
      endsWithBrace: cleanResponse.endsWith('}'),
      lastChars: cleanResponse.slice(-200)
    });

    // Try to fix incomplete JSON by finding the last complete object
    if (!cleanResponse.endsWith('}')) {
      console.log('🔧 [GEMINI_SLIDE_EDITING] Attempting to fix incomplete JSON');
      
      // Find the last complete field ending with quote and comma or quote and newline
      const lastCompleteField = Math.max(
        cleanResponse.lastIndexOf('",'),
        cleanResponse.lastIndexOf('"\n'),
        cleanResponse.lastIndexOf('"')
      );
      
      if (lastCompleteField > -1) {
        // Find the position after the last quote
        let cutPosition = lastCompleteField + 1;
        if (cleanResponse[lastCompleteField + 1] === ',') {
          cutPosition = lastCompleteField + 1;
        }
        
        cleanResponse = cleanResponse.substring(0, cutPosition) + '\n}';
        console.log('🔧 [GEMINI_SLIDE_EDITING] Fixed incomplete JSON');
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('❌ [GEMINI_SLIDE_EDITING] JSON parsing failed', {
        error: parseError instanceof Error ? parseError.message : String(parseError),
        responsePreview: cleanResponse.substring(0, 500) + '...',
        responseLength: cleanResponse.length
      });

      // Try to fix common JSON escaping issues
      console.log('🔧 [GEMINI_SLIDE_EDITING] Attempting to fix JSON escaping issues');
      
      let fixedResponse = cleanResponse;
      
      // Fix common escaping issues
      fixedResponse = fixedResponse
        // Fix unescaped quotes in strings
        .replace(/(?<!\\)"/g, (match, offset) => {
          // Don't escape quotes that are part of JSON structure (field names, start/end of strings)
          const before = cleanResponse.substring(Math.max(0, offset - 10), offset);
          const after = cleanResponse.substring(offset + 1, Math.min(cleanResponse.length, offset + 11));
          
          // If it's a field name or string delimiter, keep it
          if (before.match(/[,{]\s*$/) || after.match(/^\s*:/) || 
              before.match(/:\s*$/) || after.match(/^\s*[,}]/)) {
            return match;
          }
          
          // Otherwise escape it
          return '\\"';
        })
        // Fix unescaped backslashes
        .replace(/(?<!\\)\\(?!["\\/bfnrt])/g, '\\\\')
        // Fix unescaped newlines in strings
        .replace(/(?<!\\)\n/g, '\\n')
        .replace(/(?<!\\)\r/g, '\\r')
        .replace(/(?<!\\)\t/g, '\\t');

      try {
        console.log('🔧 [GEMINI_SLIDE_EDITING] Trying to parse fixed JSON');
        parsed = JSON.parse(fixedResponse);
        console.log('✅ [GEMINI_SLIDE_EDITING] Successfully parsed fixed JSON');
      } catch (secondError) {
        console.error('❌ [GEMINI_SLIDE_EDITING] Failed to parse even after fixing', {
          originalError: parseError instanceof Error ? parseError.message : String(parseError),
          fixedError: secondError instanceof Error ? secondError.message : String(secondError),
          fixedPreview: fixedResponse.substring(0, 500) + '...'
        });
        throw new Error(`Failed to parse AI response as JSON even after fixing: ${secondError instanceof Error ? secondError.message : String(secondError)}`);
      }
    }

    // Validate required fields - throw error if missing
    if (!parsed.editedContent && !parsed.editedHtmlContent) {
      throw new Error('AI did not provide edited content');
    }

    // Check if HTML content is truncated - throw error if truncated
    if (parsed.editedHtmlContent && !parsed.editedHtmlContent.includes('</html>')) {
      throw new Error('AI response was truncated - HTML incomplete');
    }

    // Create edited slide
    const editedSlide: SimpleSlide = {
      ...originalSlide,
      title: parsed.editedTitle || originalSlide.title,
      content: parsed.editedContent || originalSlide.content,
      htmlContent: parsed.editedHtmlContent || originalSlide.htmlContent,
      updatedAt: new Date()
    };

    // Create slide changes with proper typing
    const changes: Array<{
      section: string;
      shortDescription: string;
      detailedDescription: string;
      appliedComment: SlideComment;
    }> = (parsed.changes || []).map((change: any, index: number) => ({
      section: String(change.section || 'general'),
      shortDescription: String(change.shortDescription || `Change ${index + 1}`),
      detailedDescription: String(change.detailedDescription || 'Content updated based on feedback'),
      appliedComment: comments[index] || comments[0]
    }));

    const slideChanges = {
      slideId: originalSlide.id,
      changes,
      summary: {
        totalChanges: changes.length,
        affectedSections: Array.from(new Set(changes.map(c => c.section))),
        improvementAreas: (parsed.improvementAreas || ['Content updated']).map((area: any) => String(area))
      }
    };

    return { editedSlide, slideChanges };
  }

  /**
   * Process image prompts in edited slide HTML and replace with actual images
   */
  private async processImagePrompts(
    result: SlideEditingResult, 
    slideId: string
  ): Promise<SlideEditingResult> {
    if (!result.editedSlide.htmlContent) {
      console.log('🖼️ [GEMINI_SLIDE_EDITING] No HTML content to process for images');
      return result;
    }

    console.log('🖼️ [GEMINI_SLIDE_EDITING] Processing image prompts in edited slide', {
      slideId,
      htmlLength: result.editedSlide.htmlContent.length,
      htmlPreview: result.editedSlide.htmlContent.substring(0, 500) + '...',
      containsImagePrompt: result.editedSlide.htmlContent.includes('IMAGE_PROMPT')
    });

    try {
      // Generate session ID for image processing
      const sessionId = `slide_edit_${slideId}_${Date.now()}`;
      
      // Process slide with temporary image storage
      const processedData = await processSlideWithTempImages(
        result.editedSlide.htmlContent,
        sessionId,
        {
          useTemporaryStorage: true,
          supabaseClient: this.supabaseClient
        }
      );

      console.log('✅ [GEMINI_SLIDE_EDITING] Image processing completed', {
        slideId,
        imagesGenerated: processedData.generatedImages.length,
        temporaryImages: processedData.temporaryImages.length,
        processingErrors: processedData.processingErrors.length,
        sessionId: processedData.sessionId
      });

      // Update the edited slide with processed HTML
      const updatedSlide = {
        ...result.editedSlide,
        htmlContent: processedData.htmlWithImages,
        // Add metadata about image processing
        imageProcessingInfo: {
          sessionId: processedData.sessionId,
          imagesGenerated: processedData.generatedImages.length,
          temporaryImages: processedData.temporaryImages.length,
          processingErrors: processedData.processingErrors
        }
      };

      // Add image processing info to slide changes
      const updatedSlideChanges = {
        ...result.slideChanges,
        imageProcessing: {
          imagesGenerated: processedData.generatedImages.length,
          temporaryImages: processedData.temporaryImages.length,
          processingErrors: processedData.processingErrors,
          sessionId: processedData.sessionId
        }
      };

      return {
        editedSlide: updatedSlide,
        slideChanges: updatedSlideChanges
      };

    } catch (error) {
      console.error('❌ [GEMINI_SLIDE_EDITING] Image processing failed', {
        slideId,
        error: error instanceof Error ? error.message : String(error)
      });

      // Return original result if image processing fails
      // Add error info to slide changes
      const updatedSlideChanges = {
        ...result.slideChanges,
        imageProcessing: {
          imagesGenerated: 0,
          temporaryImages: 0,
          processingErrors: [`Image processing failed: ${error instanceof Error ? error.message : String(error)}`],
          sessionId: null
        }
      };

      return {
        editedSlide: result.editedSlide,
        slideChanges: updatedSlideChanges
      };
    }
  }
}
