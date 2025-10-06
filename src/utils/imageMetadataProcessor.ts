/**
 * === Image Metadata Processing System ===
 * 
 * Система для оптимізації роботи з зображеннями при редагуванні:
 * 1. Замінює base64 зображення на текстові метадані перед відправкою до AI
 * 2. AI аналізує чи потрібно змінити зображення
 * 3. Якщо не потрібно - повертаємо оригінальний base64
 * 4. Якщо потрібно - генеруємо нове зображення
 * 
 * Це економить токени та час генерації.
 */

export interface ImageMetadataInfo {
  id: string; // Унікальний ID для відновлення
  originalBase64: string; // Оригінальний base64
  prompt: string; // Опис зображення (з alt або data-image-prompt)
  width: number;
  height: number;
  alt?: string;
  fullImgTag: string; // Повний img tag для заміни
}

export interface MetadataReplacement {
  originalHtml: string;
  metadataHtml: string; // HTML з метаданими замість base64
  imageMap: Map<string, ImageMetadataInfo>; // Мапа для відновлення
  replacedCount: number;
}

/**
 * Витягує метадані з base64 зображення
 */
function extractImageMetadata(imgTag: string, index: number): ImageMetadataInfo | null {
  // Шукаємо base64 src
  const srcMatch = imgTag.match(/src=["']data:image\/[^;]+;base64,([^"']+)["']/);
  if (!srcMatch) {
    return null;
  }

  const base64 = srcMatch[1];
  
  // Витягуємо промпт з data-image-prompt або alt
  let prompt = '';
  const promptMatch = imgTag.match(/data-image-prompt=["']([^"']+)["']/);
  const altMatch = imgTag.match(/alt=["']([^"']+)["']/);
  
  if (promptMatch) {
    prompt = promptMatch[1];
  } else if (altMatch) {
    prompt = altMatch[1];
  } else {
    prompt = 'image'; // Fallback
  }

  // Витягуємо розміри
  let width = 640;
  let height = 480;
  
  const widthMatch = imgTag.match(/width=["']?(\d+)["']?/);
  const heightMatch = imgTag.match(/height=["']?(\d+)["']?/);
  
  if (widthMatch) width = parseInt(widthMatch[1], 10);
  if (heightMatch) height = parseInt(heightMatch[1], 10);

  return {
    id: `IMG_META_${Date.now()}_${index}`,
    originalBase64: base64,
    prompt,
    width,
    height,
    alt: altMatch?.[1],
    fullImgTag: imgTag
  };
}

/**
 * Заміняє base64 зображення на текстові метадані для AI
 */
export function replaceBase64WithMetadata(html: string): MetadataReplacement {
  console.log('🔄 [IMAGE_METADATA] Starting base64 → metadata replacement');
  
  const imageMap = new Map<string, ImageMetadataInfo>();
  let replacedCount = 0;
  let metadataHtml = html;

  // Знаходимо всі img теги з base64
  const base64ImgRegex = /<img[^>]*src=["']data:image\/[^;]+;base64,[^"']+["'][^>]*>/gi;
  const matches = Array.from(html.matchAll(base64ImgRegex));

  console.log(`🖼️ [IMAGE_METADATA] Found ${matches.length} base64 images to process`);

  matches.forEach((match, index) => {
    const imgTag = match[0];
    const metadata = extractImageMetadata(imgTag, index);

    if (metadata) {
      // Створюємо текстовий маркер для AI
      const metadataMarker = `<!-- IMAGE_METADATA: "${metadata.prompt}" ID: "${metadata.id}" WIDTH: ${metadata.width} HEIGHT: ${metadata.height} -->`;
      
      // Замінюємо img tag на метадані
      metadataHtml = metadataHtml.replace(imgTag, metadataMarker);
      
      // Зберігаємо в мапу для відновлення
      imageMap.set(metadata.id, metadata);
      replacedCount++;

      console.log(`✅ [IMAGE_METADATA] Replaced image ${index + 1}:`, {
        id: metadata.id,
        prompt: metadata.prompt.substring(0, 50) + '...',
        size: `${metadata.width}x${metadata.height}`,
        base64Length: metadata.originalBase64.length
      });
    }
  });

  const savedBytes = html.length - metadataHtml.length;
  const savedPercentage = ((savedBytes / html.length) * 100).toFixed(1);
  
  console.log(`🎯 [IMAGE_METADATA] Replacement complete:`, {
    totalImages: matches.length,
    replaced: replacedCount,
    originalSize: html.length,
    metadataSize: metadataHtml.length,
    savedBytes,
    savedPercentage: `${savedPercentage}%`,
    estimatedTokensSaved: Math.ceil(savedBytes / 4) // Приблизно 4 символи = 1 токен
  });

  return {
    originalHtml: html,
    metadataHtml,
    imageMap,
    replacedCount
  };
}

/**
 * Визначає чи AI хоче зберегти зображення або створити нове
 */
export function detectImageIntent(aiResponse: string): {
  keepImages: Map<string, boolean>; // ID → чи зберегти
  newImagePrompts: Array<{ prompt: string; width: number; height: number }>; // Нові зображення
} {
  const keepImages = new Map<string, boolean>();
  const newImagePrompts: Array<{ prompt: string; width: number; height: number }> = [];

  // Шукаємо IMAGE_METADATA маркери які AI залишив без змін
  const metadataRegex = /<!-- IMAGE_METADATA: "([^"]+)" ID: "([^"]+)" WIDTH: (\d+) HEIGHT: (\d+) -->/g;
  let metadataMatch;

  while ((metadataMatch = metadataRegex.exec(aiResponse)) !== null) {
    const [, prompt, id, width, height] = metadataMatch;
    keepImages.set(id, true);
    console.log(`🔄 [IMAGE_INTENT] AI wants to KEEP image:`, { id, prompt: prompt.substring(0, 30) });
  }

  // Шукаємо нові IMAGE_PROMPT коментарі які AI додав
  const newPromptRegex = /<!-- IMAGE_PROMPT: "([^"]+)" WIDTH: (\d+) HEIGHT: (\d+) -->/g;
  let newPromptMatch;

  while ((newPromptMatch = newPromptRegex.exec(aiResponse)) !== null) {
    const [, prompt, width, height] = newPromptMatch;
    newImagePrompts.push({
      prompt,
      width: parseInt(width, 10),
      height: parseInt(height, 10)
    });
    console.log(`🆕 [IMAGE_INTENT] AI wants NEW image:`, { prompt: prompt.substring(0, 30) });
  }

  console.log(`🎯 [IMAGE_INTENT] Detection complete:`, {
    keepCount: keepImages.size,
    newCount: newImagePrompts.length
  });

  return { keepImages, newImagePrompts };
}

/**
 * Відновлює оригінальні base64 зображення для тих, які AI хоче зберегти
 */
export function restoreOriginalImages(
  aiResponse: string,
  imageMap: Map<string, ImageMetadataInfo>
): string {
  console.log('🔄 [IMAGE_RESTORE] Starting image restoration');
  
  let restoredHtml = aiResponse;
  let restoredCount = 0;
  let notFoundCount = 0;

  // Шукаємо IMAGE_METADATA маркери які AI залишив
  const metadataRegex = /<!-- IMAGE_METADATA: "([^"]+)" ID: "([^"]+)" WIDTH: (\d+) HEIGHT: (\d+) -->/g;
  const matches = Array.from(aiResponse.matchAll(metadataRegex));

  matches.forEach((match) => {
    const [fullMatch, prompt, id] = match;
    const imageInfo = imageMap.get(id);

    if (imageInfo) {
      // Відновлюємо оригінальний img tag
      restoredHtml = restoredHtml.replace(fullMatch, imageInfo.fullImgTag);
      restoredCount++;
      
      console.log(`✅ [IMAGE_RESTORE] Restored original image:`, {
        id,
        prompt: prompt.substring(0, 30),
        base64Length: imageInfo.originalBase64.length
      });
    } else {
      console.warn(`⚠️ [IMAGE_RESTORE] Image metadata not found for ID: ${id}`);
      notFoundCount++;
    }
  });

  console.log(`🎯 [IMAGE_RESTORE] Restoration complete:`, {
    totalMetadata: matches.length,
    restored: restoredCount,
    notFound: notFoundCount,
    restorationRate: matches.length > 0 ? `${((restoredCount / matches.length) * 100).toFixed(1)}%` : '0%'
  });
  
  // Важливе повідомлення для тестування
  if (restoredCount > 0) {
    console.log(`✅ [IMAGE_RESTORE] SUCCESS: ${restoredCount} image(s) kept without regeneration!`);
  }
  if (notFoundCount > 0) {
    console.warn(`⚠️ [IMAGE_RESTORE] WARNING: ${notFoundCount} image(s) will be regenerated (metadata not found)`);
  }

  return restoredHtml;
}

/**
 * Повний цикл обробки зображень для редагування
 */
export async function processImagesForEditing(
  html: string,
  aiEditFunction: (metadataHtml: string) => Promise<string>
): Promise<{ 
  editedHtml: string; 
  stats: { 
    originalImages: number; 
    keptImages: number; 
    newImages: number;
    savedBytes: number;
  } 
}> {
  console.log('🎬 [IMAGE_EDITING] Starting full image editing cycle');

  // 1. Заміна base64 на метадані
  const replacement = replaceBase64WithMetadata(html);
  
  // 2. Відправка до AI з метаданими
  console.log('🤖 [IMAGE_EDITING] Sending metadata HTML to AI...');
  const aiResponse = await aiEditFunction(replacement.metadataHtml);
  
  // 3. Визначення намірів AI
  const intent = detectImageIntent(aiResponse);
  
  // 4. Відновлення оригінальних зображень
  const restoredHtml = restoreOriginalImages(aiResponse, replacement.imageMap);

  console.log('✅ [IMAGE_EDITING] Full cycle complete');

  return {
    editedHtml: restoredHtml,
    stats: {
      originalImages: replacement.replacedCount,
      keptImages: intent.keepImages.size,
      newImages: intent.newImagePrompts.length,
      savedBytes: replacement.originalHtml.length - replacement.metadataHtml.length
    }
  };
}
