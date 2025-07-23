// Utilities for processing images in slides
import { generateImage, type ImageGenerationRequest, type ImageGenerationResponse } from './imageGeneration';

export interface ImagePromptComment {
  fullComment: string;
  prompt: string;
  width: number;
  height: number;
  index: number; // position in HTML
}

export interface ProcessedSlideData {
  htmlWithImages: string;
  generatedImages: GeneratedImageInfo[];
  processingErrors: string[];
}

export interface GeneratedImageInfo {
  prompt: string;
  width: number;
  height: number;
  base64Image: string;
  model: string;
  success: boolean;
}

// Regex for extracting IMAGE_PROMPT comments
const IMAGE_COMMENT_REGEX = /<!--\s*IMAGE_PROMPT:\s*"([^"]+)"\s+WIDTH:\s*(\d+)\s+HEIGHT:\s*(\d+)\s*-->/gi;

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
 * Extracts all IMAGE_PROMPT comments from HTML
 */
export function extractImagePrompts(htmlContent: string): ImagePromptComment[] {
  const prompts: ImagePromptComment[] = [];
  let match;
  
  // Reset regex lastIndex
  IMAGE_COMMENT_REGEX.lastIndex = 0;
  
  while ((match = IMAGE_COMMENT_REGEX.exec(htmlContent)) !== null) {
    const [fullComment, prompt, widthStr, heightStr] = match;
    const originalWidth = parseInt(widthStr);
    const originalHeight = parseInt(heightStr);
    
    // Validate and correct dimensions
    const { width, height, corrected } = validateAndCorrectDimensions(originalWidth, originalHeight);
    
    if (corrected) {
      console.warn(`⚠️ Image dimensions corrected for FLUX compatibility`);
    }
    
    // Validate the prompt
    if (!prompt || prompt.trim().length === 0) {
      console.warn(`⚠️ Empty image prompt found, skipping`);
      continue;
    }
    
    // Add to the result
    prompts.push({
      fullComment,
      prompt: prompt.trim(),
      width,
      height,
      index: match.index || 0
    });
  }
  
  console.log(`🔍 Found ${prompts.length} image prompts in HTML`);
  return prompts;
}



/**
 * Delay function for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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
 * Generates all images sequentially with delays to avoid rate limiting
 */
export async function generateAllImages(prompts: ImagePromptComment[]): Promise<GeneratedImageInfo[]> {
  if (prompts.length === 0) {
    console.log('📷 No image prompts found, skipping image generation');
    return [];
  }
  
  console.log(`🚀 Starting sequential generation of ${prompts.length} images (with rate limiting)...`);
  
  const results: GeneratedImageInfo[] = [];
  
  // Generate images sequentially with a 1.5 second delay between requests
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
      
      // Generate images with automatic retry attempts
      const result = await generateImageWithRetry(imageRequest, 3);
      
      if (result.success && result.image) {
        console.log(`✅ [${index + 1}/${prompts.length}] Generated successfully`);
        results.push({
          prompt: promptData.prompt,
          width,
          height,
          base64Image: result.image,
          model: result.model || 'FLUX.1-schnell',
          success: true
        });
      } else {
        console.error(`❌ [${index + 1}/${prompts.length}] Generation failed:`, result.error);
        results.push({
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
      results.push({
        prompt: promptData.prompt,
        width: promptData.width,
        height: promptData.height,
        base64Image: '',
        model: 'FLUX.1-schnell',
        success: false
      });
    }
    
    // Delay between requests (except the last one)
    if (index < prompts.length - 1) {
      console.log(`⏱️ Waiting 2 seconds before next image (rate limiting)...`);
      await delay(2000);
    }
  }
  
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(`🎯 Image generation complete: ${successful} successful, ${failed} failed`);
  
  // Additional information about failed attempts
  if (failed > 0) {
    console.log(`❌ Failed images details:`);
    results.forEach((result, index) => {
      if (!result.success) {
        console.log(`   ${index + 1}. "${result.prompt.substring(0, 40)}..." - ${result.model || 'unknown'}`);
      }
    });
  }
  
  return results;
}

/**
 * Replaces IMAGE_PROMPT comments with actual img tags with base64 images
 */
export function replaceImageComments(
  htmlContent: string, 
  prompts: ImagePromptComment[], 
  generatedImages: GeneratedImageInfo[]
): string {
  if (prompts.length === 0) {
    console.log('📝 No image prompts found to replace');
    return htmlContent;
  }
  
  let processedHtml = htmlContent;
  let replacements = 0;
  
  console.log(`🔄 Processing ${prompts.length} image prompts with ${generatedImages.length} generated images`);
  
  // Process comments from end to beginning to avoid breaking indices
  for (let i = prompts.length - 1; i >= 0; i--) {
    const prompt = prompts[i];
    const imageData = generatedImages[i];
    
    let replacement: string;
    
    if (imageData && imageData.success && imageData.base64Image) {
      // Successfully generated image
      replacement = `<img src="data:image/webp;base64,${imageData.base64Image}" 
        alt="${imageData.prompt.replace(/"/g, '&quot;')}" 
        width="${imageData.width}" 
        height="${imageData.height}"
        style="
          max-width: 100%; 
          height: auto; 
          border-radius: 12px; 
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          display: block;
          margin: 15px auto;
          object-fit: cover;
        "
        loading="lazy" 
        data-prompt="${imageData.prompt.replace(/"/g, '&quot;')}"
        data-model="${imageData.model}"
        data-generated="true" />`;
      
      console.log(`✅ Replacing comment ${i + 1} with generated image (${imageData.width}x${imageData.height})`);
    } else {
      // Failed generation or missing image
      const errorInfo = imageData ? 'Generation failed' : 'No image data';
      replacement = `<div style="
        width: ${prompt.width}px; 
        height: ${prompt.height}px; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: 3px dashed rgba(255,255,255,0.3);
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: 'Comic Sans MS', cursive;
        text-align: center;
        font-size: 16px;
        max-width: 100%;
        margin: 15px auto;
        position: relative;
        overflow: hidden;
      " data-failed-prompt="${prompt.prompt.replace(/"/g, '&quot;')}">
        <div style="font-size: 32px; margin-bottom: 8px;">🎨</div>
        <div style="font-weight: bold; margin-bottom: 4px;">Image is being generated...</div>
        <div style="font-size: 12px; opacity: 0.8; max-width: 80%; word-wrap: break-word;">
          ${prompt.prompt.substring(0, 60)}${prompt.prompt.length > 60 ? '...' : ''}
        </div>
        <div style="font-size: 10px; opacity: 0.6; margin-top: 4px;">⚠️ ${errorInfo}</div>
      </div>`;
      
      console.log(`⚠️ Replacing comment ${i + 1} with placeholder: ${errorInfo}`);
    }
    
    // Check if the comment still exists in HTML
    if (processedHtml.includes(prompt.fullComment)) {
      processedHtml = processedHtml.replace(prompt.fullComment, replacement);
      replacements++;
    } else {
      console.warn(`⚠️ Comment ${i + 1} not found in HTML: "${prompt.fullComment.substring(0, 50)}..."`);
    }
  }
  
  console.log(`🎯 Completed ${replacements}/${prompts.length} image replacements`);
  
  // Also find and replace placeholder divs that might have been created by Gemini
  const placeholderRegex = /<div[^>]*>🖼️[^<]*Image will be generated here[^<]*<\/div>/gi;
  const placeholderMatches = processedHtml.match(placeholderRegex);
  
  if (placeholderMatches && placeholderMatches.length > 0) {
    console.log(`🔍 Found ${placeholderMatches.length} placeholder divs to clean up`);
    processedHtml = processedHtml.replace(placeholderRegex, '<!-- Placeholder div removed -->');
  }
  
  return processedHtml;
}

/**
 * Main function for processing slides with images
 */
export async function processSlideWithImages(htmlContent: string): Promise<ProcessedSlideData> {
  const processingErrors: string[] = [];
  
  try {
    console.log('🎨 Starting slide image processing...');
    
    // 1. Extract all IMAGE_PROMPT comments
    const imagePrompts = extractImagePrompts(htmlContent);
    
    if (imagePrompts.length === 0) {
      console.log('📝 No image prompts found in slide');
      return {
        htmlWithImages: htmlContent,
        generatedImages: [],
        processingErrors: []
      };
    }
    
    // 2. Generate all images in parallel
    const generatedImages = await generateAllImages(imagePrompts);
    
    // 3. Replace comments with actual images
    const htmlWithImages = replaceImageComments(htmlContent, imagePrompts, generatedImages);
    
    // 4. Collect error information
    generatedImages.forEach((img, index) => {
      if (!img.success) {
        processingErrors.push(`Failed to generate image ${index + 1}: "${img.prompt.substring(0, 50)}..."`);
      }
    });
    
    console.log('✅ Slide image processing completed');
    
    return {
      htmlWithImages,
      generatedImages,
      processingErrors
    };
    
  } catch (error) {
    console.error('💥 Error in slide image processing:', error);
    processingErrors.push(`Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return {
      htmlWithImages: htmlContent, // return original HTML
      generatedImages: [],
      processingErrors
    };
  }
} 