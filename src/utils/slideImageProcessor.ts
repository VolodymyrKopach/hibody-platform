// Утиліти для обробки зображень в слайдах
import { generateImage, type ImageGenerationRequest, type ImageGenerationResponse } from './imageGeneration';

export interface ImagePromptComment {
  fullComment: string;
  prompt: string;
  width: number;
  height: number;
  index: number; // позиція в HTML
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

// Regex для витягування IMAGE_PROMPT коментарів
const IMAGE_COMMENT_REGEX = /<!--\s*IMAGE_PROMPT:\s*"([^"]+)"\s+WIDTH:\s*(\d+)\s+HEIGHT:\s*(\d+)\s*-->/gi;

/**
 * Витягує всі IMAGE_PROMPT коментарі з HTML
 */
export function extractImagePrompts(htmlContent: string): ImagePromptComment[] {
  const prompts: ImagePromptComment[] = [];
  let match;
  
  // Reset regex lastIndex
  IMAGE_COMMENT_REGEX.lastIndex = 0;
  
  while ((match = IMAGE_COMMENT_REGEX.exec(htmlContent)) !== null) {
    const [fullComment, prompt, widthStr, heightStr] = match;
    const width = parseInt(widthStr);
    const height = parseInt(heightStr);
    
    // Валідація розмірів (мають бути кратні 16 для FLUX)
    if (width % 16 !== 0 || height % 16 !== 0) {
      console.warn(`⚠️ Image dimensions must be divisible by 16. Found: ${width}x${height}`);
      // Автоматично корегуємо розміри
      const correctedWidth = Math.round(width / 16) * 16;
      const correctedHeight = Math.round(height / 16) * 16;
      console.log(`🔧 Auto-correcting to: ${correctedWidth}x${correctedHeight}`);
      
      prompts.push({
        fullComment,
        prompt: prompt.trim(),
        width: correctedWidth,
        height: correctedHeight,
        index: match.index
      });
      continue;
    }
    
    // Валідація мінімальних та максимальних розмірів (знижуємо мінімум до 128)
    if (width < 128 || height < 128 || width > 1536 || height > 1536) {
      console.warn(`⚠️ Image dimensions out of range (128-1536). Found: ${width}x${height}`);
      // Автоматично корегуємо розміри
      const clampedWidth = Math.min(Math.max(width, 128), 1536);
      const clampedHeight = Math.min(Math.max(height, 128), 1536);
      
      // Переконуємося що скореговані розміри кратні 16
      const correctedWidth = Math.round(clampedWidth / 16) * 16;
      const correctedHeight = Math.round(clampedHeight / 16) * 16;
      
      console.log(`🔧 Auto-correcting to: ${correctedWidth}x${correctedHeight}`);
      
      prompts.push({
        fullComment,
        prompt: prompt.trim(),
        width: correctedWidth,
        height: correctedHeight,
        index: match.index
      });
      continue;
    }
    
    prompts.push({
      fullComment,
      prompt: prompt.trim(),
      width,
      height,
      index: match.index
    });
  }
  
  console.log(`🔍 Found ${prompts.length} image prompts in HTML`);
  return prompts;
}

/**
 * Валідує та корегує розміри зображення для FLUX API
 */
export function validateAndFixDimensions(width: number, height: number): { width: number; height: number } {
  // Округлюємо до найближчого числа кратного 16
  const fixedWidth = Math.round(width / 16) * 16;
  const fixedHeight = Math.round(height / 16) * 16;
  
  // Обмежуємо діапазон (знижуємо мінімум до 128)
  const clampedWidth = Math.min(Math.max(fixedWidth, 128), 1536);
  const clampedHeight = Math.min(Math.max(fixedHeight, 128), 1536);
  
  if (clampedWidth !== width || clampedHeight !== height) {
    console.log(`📐 Fixed dimensions: ${width}x${height} → ${clampedWidth}x${clampedHeight}`);
  }
  
  return { width: clampedWidth, height: clampedHeight };
}

/**
 * Функція затримки для rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Генерує зображення з retry логікою
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
      
      // Якщо це не остання спроба, чекаємо перед наступною
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
  
  // Всі спроби не вдалися
  return {
    success: false,
    error: `Failed after ${maxRetries} attempts. Last error: ${lastError}`
  };
}

/**
 * Генерує всі зображення послідовно з затримками для уникнення rate limiting
 */
export async function generateAllImages(prompts: ImagePromptComment[]): Promise<GeneratedImageInfo[]> {
  if (prompts.length === 0) {
    console.log('📷 No image prompts found, skipping image generation');
    return [];
  }
  
  console.log(`🚀 Starting sequential generation of ${prompts.length} images (with rate limiting)...`);
  
  const results: GeneratedImageInfo[] = [];
  
  // Генеруємо зображення послідовно з затримкою 1.5 секунди між запитами
  for (let index = 0; index < prompts.length; index++) {
    const promptData = prompts[index];
    const { width, height } = validateAndFixDimensions(promptData.width, promptData.height);
    
    console.log(`📸 [${index + 1}/${prompts.length}] Generating: "${promptData.prompt.substring(0, 50)}..." (${width}x${height})`);
    
    try {
      const imageRequest: ImageGenerationRequest = {
        prompt: promptData.prompt,
        width,
        height
      };
      
      // Генеруємо зображення з автоматичними retry спробами
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
    
    // Затримка між запитами (крім останнього)
    if (index < prompts.length - 1) {
      console.log(`⏱️ Waiting 2 seconds before next image (rate limiting)...`);
      await delay(2000);
    }
  }
  
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(`🎯 Image generation complete: ${successful} successful, ${failed} failed`);
  
  // Додаткова інформація про неуспішні спроби
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
 * Замінює IMAGE_PROMPT коментарі на реальні img теги з base64 зображеннями
 */
export function replaceImageComments(
  htmlContent: string, 
  prompts: ImagePromptComment[], 
  generatedImages: GeneratedImageInfo[]
): string {
  if (prompts.length === 0 || generatedImages.length === 0) {
    return htmlContent;
  }
  
  let processedHtml = htmlContent;
  
  // Обробляємо коментарі від кінця до початку щоб не зіпсувати індекси
  for (let i = prompts.length - 1; i >= 0; i--) {
    const prompt = prompts[i];
    const imageData = generatedImages[i];
    
    if (imageData && imageData.success && imageData.base64Image) {
      // Створюємо img тег з base64 зображенням
      const imgTag = `<img src="data:image/webp;base64,${imageData.base64Image}" 
        alt="${imageData.prompt}" 
        width="${imageData.width}" 
        height="${imageData.height}"
        style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"
        loading="lazy" />`;
      
      // Замінюємо коментар на img тег
      processedHtml = processedHtml.replace(prompt.fullComment, imgTag);
      
      console.log(`🔄 Replaced comment ${i + 1}: "${prompt.prompt.substring(0, 30)}..."`);
    } else {
      // Якщо генерація не вдалася, замінюємо на placeholder
      const placeholderImg = `<div style="
        width: ${prompt.width}px; 
        height: ${prompt.height}px; 
        background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
        border: 2px dashed #ccc;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-family: 'Comic Sans MS', cursive;
        text-align: center;
        font-size: 14px;
        max-width: 100%;
      ">
        🖼️<br/>Зображення<br/>недоступне
      </div>`;
      
      processedHtml = processedHtml.replace(prompt.fullComment, placeholderImg);
      
      console.log(`🔄 Replaced failed comment ${i + 1} with placeholder`);
    }
  }
  
  return processedHtml;
}

/**
 * Основна функція для обробки слайду з зображеннями
 */
export async function processSlideWithImages(htmlContent: string): Promise<ProcessedSlideData> {
  const processingErrors: string[] = [];
  
  try {
    console.log('🎨 Starting slide image processing...');
    
    // 1. Витягуємо всі IMAGE_PROMPT коментарі
    const imagePrompts = extractImagePrompts(htmlContent);
    
    if (imagePrompts.length === 0) {
      console.log('📝 No image prompts found in slide');
      return {
        htmlWithImages: htmlContent,
        generatedImages: [],
        processingErrors: []
      };
    }
    
    // 2. Генеруємо всі зображення паралельно
    const generatedImages = await generateAllImages(imagePrompts);
    
    // 3. Замінюємо коментарі на реальні зображення
    const htmlWithImages = replaceImageComments(htmlContent, imagePrompts, generatedImages);
    
    // 4. Збираємо інформацію про помилки
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
      htmlWithImages: htmlContent, // повертаємо оригінальний HTML
      generatedImages: [],
      processingErrors
    };
  }
} 