// Enhanced utilities for processing images in slides with temporary storage
import { generateImage, type ImageGenerationRequest, type ImageGenerationResponse } from './imageGeneration';
import { TemporaryImageService, type TemporaryImageInfo } from '@/services/images/TemporaryImageService';

// Re-export existing interfaces for compatibility
export type { ImagePromptComment, ProcessedSlideData, GeneratedImageInfo } from './slideImageProcessor';
import type { ImagePromptComment, GeneratedImageInfo } from './slideImageProcessor';

// New interfaces for temporary storage support
export interface GeneratedImageInfoWithTemp extends GeneratedImageInfo {
  tempUrl?: string; // URL from temporary storage
  tempInfo?: TemporaryImageInfo; // Full temporary image info
}

export interface ProcessedSlideDataWithTemp {
  htmlWithImages: string;
  generatedImages: GeneratedImageInfoWithTemp[];
  temporaryImages: TemporaryImageInfo[];
  processingErrors: string[];
  sessionId: string;
}

// Import utility functions from original processor
import { extractImagePrompts } from './slideImageProcessor';

// Re-export for external use
export { extractImagePrompts };

/**
 * Delay function for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validates and corrects image dimensions for FLUX API
 */
function validateAndCorrectDimensions(width: number, height: number): { width: number; height: number; corrected: boolean } {
  const original = { width, height };
  let corrected = false;
  
  // 1. First, make sure the dimensions are within acceptable limits
  const MIN_SIZE = 256; // Minimum for FLUX
  const MAX_SIZE = 1536; // Maximum for speed
  
  if (width < MIN_SIZE || height < MIN_SIZE || width > MAX_SIZE || height > MAX_SIZE) {
    width = Math.min(Math.max(width, MIN_SIZE), MAX_SIZE);
    height = Math.min(Math.max(height, MIN_SIZE), MAX_SIZE);
    corrected = true;
  }
  
  // 2. Make sure the dimensions are a multiple of 16 (required for FLUX)
  if (width % 16 !== 0) {
    width = Math.round(width / 16) * 16;
    corrected = true;
  }
  
  if (height % 16 !== 0) {
    height = Math.round(height / 16) * 16;
    corrected = true;
  }
  
  // 3. Re-check limits after correcting for multiplicity
  if (width < MIN_SIZE) {
    width = MIN_SIZE;
    corrected = true;
  }
  if (height < MIN_SIZE) {
    height = MIN_SIZE;
    corrected = true;
  }
  
  if (corrected) {
    console.log(`📐 Dimension correction: ${original.width}x${original.height} → ${width}x${height}`);
  }
  
  return { width, height, corrected };
}

/**
 * Generates an image with retry logic
 */
async function generateImageWithRetry(imageRequest: ImageGenerationRequest, maxRetries: number = 3): Promise<ImageGenerationResponse> {
  let lastError = '';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}...`);
      
      const result = await generateImage(imageRequest);
      
      if (result.success && result.image) {
        if (attempt > 1) {
          console.log(`✅ Success on attempt ${attempt}!`);
        }
        return result;
      }
      
      lastError = result.error || 'Unknown error';
      console.log(`❌ Attempt ${attempt} failed: ${lastError}`);
      
      // If this is not the last attempt, wait before the next one
      if (attempt < maxRetries) {
        const delayTime = attempt === 1 && lastError.includes('rate limit') ? 2000 : 1000;
        console.log(`⏱️ Waiting ${delayTime/1000} seconds before retry...`);
        await delay(delayTime);
      }
      
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Network error';
      console.log(`💥 Attempt ${attempt} threw exception: ${lastError}`);
      
      if (attempt < maxRetries) {
        console.log(`⏱️ Waiting 1 second before retry...`);
        await delay(1000);
      }
    }
  }
  
  // All attempts failed
  return {
    success: false,
    error: `Failed after ${maxRetries} attempts. Last error: ${lastError}`
  };
}

/**
 * Generates all images with temporary storage support
 */
export async function generateAllImagesWithTempStorage(
  prompts: ImagePromptComment[],
  sessionId?: string,
  options: {
    useTemporaryStorage?: boolean;
    fallbackToBase64?: boolean;
  } = {}
): Promise<{
  generatedImages: GeneratedImageInfoWithTemp[];
  temporaryImages: TemporaryImageInfo[];
}> {
  
  const {
    useTemporaryStorage = true,
    fallbackToBase64 = true
  } = options;

  if (prompts.length === 0) {
    console.log('📷 No image prompts found, skipping image generation');
    return { generatedImages: [], temporaryImages: [] };
  }
  
  console.log(`🚀 Starting image generation with temporary storage for ${prompts.length} prompts`);
  console.log(`⚙️ Options: tempStorage=${useTemporaryStorage}, fallback=${fallbackToBase64}`);

  // Initialize temporary storage service if needed
  const tempService = useTemporaryStorage ? new TemporaryImageService(sessionId) : null;
  const generatedImages: GeneratedImageInfoWithTemp[] = [];
  const temporaryImages: TemporaryImageInfo[] = [];

  // Generate images sequentially with rate limiting
  for (let index = 0; index < prompts.length; index++) {
    const promptData = prompts[index];
    const { width, height } = validateAndCorrectDimensions(promptData.width, promptData.height);
    
    console.log(`📸 [${index + 1}/${prompts.length}] Generating: "${promptData.prompt.substring(0, 50)}..." (${width}x${height})`);
    
    try {
      const imageRequest: ImageGenerationRequest = {
        prompt: promptData.prompt,
        width,
        height
      };
      
      // Generate the image
      const result = await generateImageWithRetry(imageRequest, 3);
      
      if (result.success && result.image) {
        console.log(`✅ [${index + 1}/${prompts.length}] Generated successfully`);
        
        let tempInfo: TemporaryImageInfo | null = null;
        let shouldClearBase64 = false;

        // Try to upload to temporary storage
        if (tempService) {
          console.log(`📤 [${index + 1}/${prompts.length}] Uploading to temporary storage...`);
          
          tempInfo = await tempService.uploadTemporaryImage(
            result.image,
            promptData.prompt,
            width,
            height,
            index
          );

          if (tempInfo) {
            temporaryImages.push(tempInfo);
            shouldClearBase64 = !fallbackToBase64; // Clear Base64 if we don't need fallback
            console.log(`✅ [${index + 1}/${prompts.length}] Uploaded to temp storage: ${tempInfo.tempUrl}`);
          } else {
            console.warn(`⚠️ [${index + 1}/${prompts.length}] Failed to upload to temp storage, using fallback`);
          }
        }

        // Create the result object
        const imageInfo: GeneratedImageInfoWithTemp = {
          prompt: promptData.prompt,
          width,
          height,
          base64Image: shouldClearBase64 ? '' : result.image, // Clear if using temp storage
          tempUrl: tempInfo?.tempUrl,
          tempInfo,
          model: result.model || 'FLUX.1-schnell',
          success: true
        };

        generatedImages.push(imageInfo);
        
      } else {
        console.error(`❌ [${index + 1}/${prompts.length}] Generation failed:`, result.error);
        generatedImages.push({
          prompt: promptData.prompt,
          width,
          height,
          base64Image: '',
          model: 'FLUX.1-schnell',
          success: false
        });
      }
    } catch (error) {
      console.error(`💥 [${index + 1}/${prompts.length}] Exception during generation:`, error);
      generatedImages.push({
        prompt: promptData.prompt,
        width: promptData.width,
        height: promptData.height,
        base64Image: '',
        model: 'FLUX.1-schnell',
        success: false
      });
    }
    
    // Rate limiting delay between requests (except the last one)
    if (index < prompts.length - 1) {
      console.log(`⏱️ Waiting 2 seconds before next image (rate limiting)...`);
      await delay(2000);
    }
  }
  
  const successful = generatedImages.filter(r => r.success).length;
  const tempStored = temporaryImages.length;
  const failed = generatedImages.length - successful;
  
  console.log(`🎯 Image generation complete: ${successful} successful, ${tempStored} stored temporarily, ${failed} failed`);
  
  // Log failed attempts
  if (failed > 0) {
    console.log(`❌ Failed images details:`);
    generatedImages.forEach((result, index) => {
      if (!result.success) {
        console.log(`   ${index + 1}. "${result.prompt.substring(0, 40)}..." - ${result.model || 'unknown'}`);
      }
    });
  }
  
  return { generatedImages, temporaryImages };
}

/**
 * Replaces IMAGE_PROMPT comments with img tags using temporary URLs or Base64 fallback
 */
export function replaceImageCommentsWithTempUrls(
  htmlContent: string, 
  prompts: ImagePromptComment[], 
  generatedImages: GeneratedImageInfoWithTemp[]
): string {
  if (prompts.length === 0) {
    console.log('📝 No image prompts found to replace');
    return htmlContent;
  }
  
  let processedHtml = htmlContent;
  let replacements = 0;
  
  console.log(`🔄 Processing ${prompts.length} image prompts with temporary storage support`);
  
  // Process comments from end to beginning to avoid breaking indices
  for (let i = prompts.length - 1; i >= 0; i--) {
    const prompt = prompts[i];
    const imageData = generatedImages[i];
    
    let replacement: string;
    
    if (imageData && imageData.success) {
      // Determine image source: temporary URL > Base64 > fallback
      let imageSrc: string;
      let storageType: string;
      
      if (imageData.tempUrl) {
        imageSrc = imageData.tempUrl;
        storageType = 'temporary';
      } else if (imageData.base64Image) {
        imageSrc = `data:image/webp;base64,${imageData.base64Image}`;
        storageType = 'base64';
      } else {
        // This should not happen, but handle gracefully
        console.warn(`⚠️ No image source available for prompt ${i + 1}`);
        imageSrc = '';
        storageType = 'missing';
      }
      
      if (imageSrc) {
        replacement = `<div class="image-container" style="max-width: 100%; margin: 15px auto; display: flex; justify-content: center; align-items: center; box-sizing: border-box;">
          <img src="${imageSrc}" 
               alt="${imageData.prompt.replace(/"/g, '&quot;')}" 
               width="${imageData.width}" 
               height="${imageData.height}" 
               style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); display: block; object-fit: cover;" 
               loading="lazy" 
               data-prompt="${imageData.prompt.replace(/"/g, '&quot;')}" 
               data-model="${imageData.model}" 
               data-storage-type="${storageType}"
               data-temp-url="${imageData.tempUrl || ''}"
               data-session-id="${imageData.tempInfo?.sessionId || ''}" />
        </div>`;
        
        console.log(`✅ Replacing comment ${i + 1} with ${storageType} image (${imageData.width}x${imageData.height})`);
      } else {
        // No image source available - create error placeholder
        replacement = createErrorPlaceholder(prompt, 'No image source available');
        console.log(`⚠️ Replacing comment ${i + 1} with error placeholder: No image source`);
      }
    } else {
      // Failed generation - create error placeholder
      const errorInfo = imageData ? 'Generation failed' : 'No image data';
      replacement = createErrorPlaceholder(prompt, errorInfo);
      console.log(`⚠️ Replacing comment ${i + 1} with error placeholder: ${errorInfo}`);
    }

    // Replace the comment in HTML
    if (processedHtml.includes(prompt.fullComment)) {
      processedHtml = processedHtml.replace(prompt.fullComment, replacement);
      replacements++;

      // Clean up any existing placeholder divs
      processedHtml = cleanupPlaceholderDivs(processedHtml, i + 1);
    } else {
      console.warn(`⚠️ Comment ${i + 1} not found in HTML: "${prompt.fullComment.substring(0, 50)}..."`);
    }
  }

  console.log(`🎯 Completed ${replacements}/${prompts.length} image replacements`);

  // Final cleanup
  processedHtml = finalCleanupPlaceholders(processedHtml);

  return processedHtml;
}

/**
 * Creates an error placeholder for failed image generation
 */
function createErrorPlaceholder(prompt: ImagePromptComment, errorInfo: string): string {
  return `<div class="image-placeholder" style="width: ${prompt.width}px; height: ${prompt.height}px; max-width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: 3px dashed rgba(255,255,255,0.3); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-family: 'Comic Sans MS', cursive; text-align: center; font-size: 16px; margin: 15px auto; position: relative; overflow: hidden; box-sizing: border-box;" data-failed-prompt="${prompt.prompt.replace(/"/g, '&quot;')}">
    <div style="font-size: 32px; margin-bottom: 8px;">🎨</div>
    <div style="font-weight: bold; margin-bottom: 4px;">Image generation failed</div>
    <div style="font-size: 12px; opacity: 0.8; max-width: 80%; word-wrap: break-word;">${prompt.prompt.substring(0, 60)}${prompt.prompt.length > 60 ? '...' : ''}</div>
    <div style="font-size: 10px; opacity: 0.6; margin-top: 4px;">⚠️ ${errorInfo}</div>
  </div>`;
}

/**
 * Cleans up placeholder divs that might interfere with image replacement
 */
function cleanupPlaceholderDivs(html: string, imageIndex: number): string {
  const placeholderPatterns = [
    // Generic placeholder pattern
    /<div[^>]*class[^>]*image-placeholder[^>]*>.*?<\/div>/gi,
    // Gemini-generated placeholder pattern
    /<div[^>]*style[^>]*>🖼️[^<]*Image will be generated here[^<]*<\/div>/gi,
    // Common placeholder patterns with emojis
    /<div[^>]*>\s*🧠[^<]*Brain[^<]*<\/div>/gi,
    /<div[^>]*>\s*🖼️[^<]*<\/div>/gi,
    /<div[^>]*>\s*📷[^<]*<\/div>/gi,
    /<div[^>]*>\s*🎨[^<]*<\/div>/gi,
  ];

  placeholderPatterns.forEach((pattern) => {
    const matches = html.match(pattern);
    if (matches) {
      console.log(`🧹 Removing ${matches.length} placeholder div(s) near image ${imageIndex}`);
      html = html.replace(pattern, '');
    }
  });

  return html;
}

/**
 * Final cleanup of any remaining placeholder divs
 */
function finalCleanupPlaceholders(html: string): string {
  const finalCleanupPatterns = [
    // Remove placeholder divs with just emojis
    /<div[^>]*class[^>]*image-placeholder[^>]*>\s*[🧠🖼️📷🎨][^<]*<\/div>/gi,
    // Remove divs that are clearly placeholders
    /<div[^>]*>\s*🖼️[^<]*Image will be generated here[^<]*<\/div>/gi
  ];

  finalCleanupPatterns.forEach((pattern) => {
    const matches = html.match(pattern);
    if (matches) {
      console.log(`🧹 Final cleanup: Removing ${matches.length} remaining placeholder div(s)`);
      html = html.replace(pattern, '');
    }
  });

  return html;
}

/**
 * Main function for processing slides with images using temporary storage
 */
export async function processSlideWithTempImages(
  htmlContent: string,
  sessionId?: string,
  options: {
    useTemporaryStorage?: boolean;
    fallbackToBase64?: boolean;
  } = {}
): Promise<ProcessedSlideDataWithTemp> {
  const processingErrors: string[] = [];
  const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log('🔄 Processing slide with temporary image storage...');
    console.log(`🆔 Session ID: ${finalSessionId}`);

    // 1. Extract all IMAGE_PROMPT comments
    const imagePrompts = extractImagePrompts(htmlContent);
    
    if (imagePrompts.length === 0) {
      console.log('📝 No image prompts found in slide');
      return {
        htmlWithImages: htmlContent,
        generatedImages: [],
        temporaryImages: [],
        processingErrors: [],
        sessionId: finalSessionId
      };
    }

    // 2. Generate images with temporary storage
    const { generatedImages, temporaryImages } = await generateAllImagesWithTempStorage(
      imagePrompts,
      finalSessionId,
      options
    );

    // 3. Replace comments with img tags using temporary URLs
    const htmlWithImages = replaceImageCommentsWithTempUrls(
      htmlContent,
      imagePrompts,
      generatedImages
    );

    // 4. Collect processing errors
    generatedImages.forEach((img, index) => {
      if (!img.success) {
        processingErrors.push(`Failed to generate image ${index + 1}: "${img.prompt.substring(0, 50)}..."`);
      }
    });

    // 5. Add warnings for images that couldn't use temporary storage
    const tempStorageFailed = generatedImages.filter(img => 
      img.success && !img.tempUrl && img.base64Image
    ).length;
    
    if (tempStorageFailed > 0) {
      processingErrors.push(`${tempStorageFailed} image(s) fell back to Base64 due to temporary storage issues`);
    }

    console.log('✅ Slide processing with temporary storage completed');

    return {
      htmlWithImages,
      generatedImages,
      temporaryImages,
      processingErrors,
      sessionId: finalSessionId
    };
    
  } catch (error) {
    console.error('💥 Error in slide processing with temporary storage:', error);
    processingErrors.push(`Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return {
      htmlWithImages: htmlContent, // return original HTML
      generatedImages: [],
      temporaryImages: [],
      processingErrors,
      sessionId: finalSessionId
    };
  }
}

/**
 * Utility function to migrate temporary images to permanent storage
 * This would typically be called when a lesson is saved
 */
export async function migrateTemporaryImagesToPermanent(
  htmlContent: string,
  temporaryImages: TemporaryImageInfo[],
  lessonId: string,
  sessionId?: string
): Promise<{
  updatedHtml: string;
  migrationResults: Array<{ success: boolean; tempUrl: string; permanentUrl?: string; error?: string }>;
}> {
  console.log(`🔄 Migrating ${temporaryImages.length} temporary images to permanent storage for lesson: ${lessonId}`);

  if (temporaryImages.length === 0) {
    return {
      updatedHtml: htmlContent,
      migrationResults: []
    };
  }

  const tempService = new TemporaryImageService(sessionId);
  const migrationResults = await tempService.migrateToPermament(temporaryImages, lessonId);

  // Update HTML to replace temporary URLs with permanent URLs
  let updatedHtml = htmlContent;
  
  migrationResults.forEach(result => {
    if (result.success && result.permanentUrl) {
      // Replace temporary URL with permanent URL in HTML
      const tempUrlEscaped = result.tempUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const tempUrlRegex = new RegExp(tempUrlEscaped, 'g');
      
      updatedHtml = updatedHtml.replace(tempUrlRegex, result.permanentUrl);
      
      // Also update data attributes
      updatedHtml = updatedHtml.replace(
        /data-storage-type="temporary"/g,
        'data-storage-type="permanent"'
      );
      updatedHtml = updatedHtml.replace(
        /data-temp-url="[^"]*"/g,
        `data-permanent-url="${result.permanentUrl}"`
      );
      
      console.log(`✅ Migrated: ${result.tempUrl} → ${result.permanentUrl}`);
    } else {
      console.error(`❌ Failed to migrate: ${result.tempUrl}`, result.error);
    }
  });

  const successful = migrationResults.filter(r => r.success).length;
  console.log(`🎯 Migration complete: ${successful}/${temporaryImages.length} images migrated successfully`);

  return {
    updatedHtml,
    migrationResults
  };
}
