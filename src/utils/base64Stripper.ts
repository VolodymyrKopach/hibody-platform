/**
 * Utility for stripping Base64 image data from objects before sending to API
 * This prevents huge payloads and saves tokens/bandwidth
 */

export interface Base64StripResult {
  strippedData: any;
  imageMap: Map<string, string>; // For potential restoration
  stats: {
    imagesStripped: number;
    bytesSaved: number;
    estimatedTokensSaved: number;
  };
}

/**
 * Extract image prompt from Base64 string if it has IMAGE_PROMPT comment
 */
function extractImagePrompt(base64String: string): string | null {
  const match = base64String.match(/<!--\s*IMAGE_PROMPT:\s*"([^"]+)"/);
  return match ? match[1] : null;
}

/**
 * Strip all Base64 image data from any object (deep)
 * Replaces with placeholder containing image metadata
 */
export function stripBase64Images(data: any): Base64StripResult {
  const imageMap = new Map<string, string>();
  let imagesStripped = 0;
  let bytesSaved = 0;

  function processValue(value: any, path: string = ''): any {
    if (typeof value !== 'object' || value === null) {
      // Check if string is Base64 image
      if (typeof value === 'string' && value.startsWith('data:image')) {
        const imageId = `IMG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const originalSize = value.length;
        const imagePrompt = extractImagePrompt(value) || 'Generated image';
        
        // Store original for potential restoration
        imageMap.set(imageId, value);
        
        // Update statistics
        imagesStripped++;
        bytesSaved += originalSize;
        
        // Return informative placeholder
        return `[BASE64_STRIPPED:${imagePrompt.substring(0, 50)}...]`;
      }
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item, index) => processValue(item, `${path}[${index}]`));
    }

    // Object - process all properties
    const result: any = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        result[key] = processValue(value[key], path ? `${path}.${key}` : key);
      }
    }
    return result;
  }

  const strippedData = processValue(data);
  const estimatedTokensSaved = Math.floor(bytesSaved / 4);

  return {
    strippedData,
    imageMap,
    stats: {
      imagesStripped,
      bytesSaved,
      estimatedTokensSaved
    }
  };
}

/**
 * Log stripping statistics
 */
export function logStrippingStats(stats: Base64StripResult['stats'], context: string = ''): void {
  if (stats.imagesStripped > 0) {
    const savedKB = Math.round(stats.bytesSaved / 1024);
    const savedMB = (stats.bytesSaved / (1024 * 1024)).toFixed(2);
    
    console.log(`🔒 [BASE64_STRIP${context ? ` - ${context}` : ''}] Stripped images:`, {
      count: stats.imagesStripped,
      bytesSaved: savedKB < 1024 ? `${savedKB}KB` : `${savedMB}MB`,
      estimatedTokensSaved: `~${stats.estimatedTokensSaved} tokens`,
      estimatedCostSaved: `~$${(stats.estimatedTokensSaved * 0.000001).toFixed(6)}`
    });
  } else {
    console.log(`ℹ️ [BASE64_STRIP${context ? ` - ${context}` : ''}] No Base64 images found`);
  }
}

