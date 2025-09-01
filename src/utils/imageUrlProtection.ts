/**
 * Image URL Protection System
 * 
 * Protects image URLs during slide editing by replacing them with temporary IDs
 * and restoring them after editing is complete.
 * 
 * This prevents AI editing services from accidentally corrupting image URLs.
 */

export interface ImageMetadata {
  id: string;
  originalUrl: string;
  alt: string;
  width?: string;
  height?: string;
  additionalAttributes: Record<string, string>;
  context?: string; // Brief description for AI context
}

export interface ProtectionResult {
  protectedHtml: string;
  imageMap: Map<string, ImageMetadata>;
  imageCount: number;
}

export class ImageUrlProtector {
  private static instance: ImageUrlProtector;
  private imageMap = new Map<string, ImageMetadata>();
  
  static getInstance(): ImageUrlProtector {
    if (!ImageUrlProtector.instance) {
      ImageUrlProtector.instance = new ImageUrlProtector();
    }
    return ImageUrlProtector.instance;
  }

  /**
   * Protects all image URLs in HTML by replacing them with temporary IDs
   */
  protectUrls(htmlContent: string): ProtectionResult {
    console.log('🛡️ Starting image URL protection...');
    
    this.imageMap.clear();
    let imageCount = 0;
    
    let protectedHtml = htmlContent.replace(
      /<img([^>]*?)src="([^"]+)"([^>]*?)>/gi,
      (match, beforeSrc, url, afterSrc) => {
        // Skip if URL is already an ID (protection already applied)
        if (url.startsWith('IMG_ID_')) {
          return match;
        }
        
        // Skip empty or invalid URLs, but log them for debugging
        if (!url || url.trim() === '' || url === 'https:' || url.startsWith('https:') && !url.startsWith('https://')) {
          console.warn('⚠️ Skipping invalid/broken URL:', url);
          // Mark broken URLs for emergency cleanup
          return match.replace(`src="${url}"`, `src="" data-broken-url="true" data-original-broken-url="${url}"`);
        }
        
        imageCount++;
        const id = `IMG_ID_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Extract image attributes
        const fullAttributes = beforeSrc + afterSrc;
        const alt = this.extractAttribute(fullAttributes, 'alt') || '';
        const width = this.extractAttribute(fullAttributes, 'width');
        const height = this.extractAttribute(fullAttributes, 'height');
        
        // Extract additional attributes for restoration
        const additionalAttributes = this.extractAllAttributes(fullAttributes);
        
        // Generate context for AI (brief description based on alt text)
        const context = this.generateImageContext(alt, url);
        
        // Store metadata
        const metadata: ImageMetadata = {
          id,
          originalUrl: url,
          alt,
          width,
          height,
          additionalAttributes,
          context
        };
        
        this.imageMap.set(id, metadata);
        
        console.log(`🔒 Protected image ${imageCount}: ${url.substring(0, 50)}... → ${id}`);
        if (context) {
          console.log(`📝 Context: ${context}`);
        }
        
        // Create contextual placeholder for AI
        const contextualId = context ? `${id}[${context}]` : id;
        
        return `<img${beforeSrc}src="${contextualId}"${afterSrc}>`;
      }
    );
    
    // Also protect other URL attributes in img tags (data-temp-url, data-original-url, etc.)
    protectedHtml = this.protectImageUrlAttributes(protectedHtml);
    
    console.log(`✅ Protected ${imageCount} image URLs`);
    
    return {
      protectedHtml,
      imageMap: new Map(this.imageMap),
      imageCount
    };
  }

  /**
   * Restores original URLs from protected HTML
   */
  restoreUrls(protectedHtml: string, imageMap?: Map<string, ImageMetadata>): string {
    console.log('🔓 Starting image URL restoration...');
    
    const mapToUse = imageMap || this.imageMap;
    let restoredCount = 0;
    
    // First restore src attributes
    let restoredHtml = protectedHtml.replace(
      /src="(IMG_ID_[^"]+?)(?:\[[^\]]*\])?"/gi,
      (match, idWithContext) => {
        // Extract clean ID (remove context if present)
        const cleanId = idWithContext.split('[')[0];
        const metadata = mapToUse.get(cleanId);
        
        if (!metadata) {
          console.warn(`⚠️ No metadata found for ID: ${cleanId}`);
          return match;
        }
        
        restoredCount++;
        console.log(`🔓 Restored image ${restoredCount}: ${cleanId} → ${metadata.originalUrl.substring(0, 50)}...`);
        
        return `src="${metadata.originalUrl}"`;
      }
    );
    
    // Then restore other URL attributes
    restoredHtml = this.restoreImageUrlAttributes(restoredHtml, mapToUse);
    
    console.log(`✅ Restored ${restoredCount} image URLs`);
    
    return restoredHtml;
  }

  /**
   * Validates that all images have been properly restored
   */
  validateRestoration(htmlContent: string): {
    isValid: boolean;
    remainingIds: string[];
    brokenUrls: string[];
  } {
    const remainingIds: string[] = [];
    const brokenUrls: string[] = [];
    
    // Check for remaining IMG_ID placeholders in src attributes
    const idMatches = htmlContent.match(/src="(IMG_ID_[^"]+?)"/gi);
    if (idMatches) {
      remainingIds.push(...idMatches.map(match => match.replace(/src="|"/g, '')));
    }
    
    // Check for remaining IMG_ID placeholders in other attributes
    const urlAttributes = ['data-temp-url', 'data-original-url', 'data-src', 'data-lazy-src'];
    urlAttributes.forEach(attrName => {
      const attrIdMatches = htmlContent.match(new RegExp(`${attrName}="(IMG_ID_[^"]+?)"`, 'gi'));
      if (attrIdMatches) {
        remainingIds.push(...attrIdMatches.map(match => match.replace(new RegExp(`${attrName}="|"`, 'g'), '')));
      }
    });
    
    // Check for broken URLs (like "https:" without full URL)
    const brokenMatches = htmlContent.match(/src="https:(?![\/\/])[^"]*"/gi);
    if (brokenMatches) {
      brokenUrls.push(...brokenMatches);
    }
    
    // Check for broken URLs in other attributes
    urlAttributes.forEach(attrName => {
      const attrBrokenMatches = htmlContent.match(new RegExp(`${attrName}="https:(?![\/\/])[^"]*"`, 'gi'));
      if (attrBrokenMatches) {
        brokenUrls.push(...attrBrokenMatches);
      }
    });
    
    // Also check for empty src attributes
    const emptySrcMatches = htmlContent.match(/src=""\s+data-broken-url="true"/gi);
    if (emptySrcMatches) {
      brokenUrls.push(...emptySrcMatches);
    }
    
    const isValid = remainingIds.length === 0 && brokenUrls.length === 0;
    
    if (!isValid) {
      console.warn('❌ Validation failed:');
      if (remainingIds.length > 0) {
        console.warn(`  - ${remainingIds.length} remaining IDs:`, remainingIds);
      }
      if (brokenUrls.length > 0) {
        console.warn(`  - ${brokenUrls.length} broken URLs:`, brokenUrls);
      }
    } else {
      console.log('✅ Validation passed - all images properly restored');
    }
    
    return { isValid, remainingIds, brokenUrls };
  }

  /**
   * Emergency cleanup - removes broken URLs and remaining IDs
   */
  emergencyCleanup(htmlContent: string): string {
    console.log('🚨 Performing emergency cleanup...');
    
    let cleaned = htmlContent;
    
    // Remove images with remaining IDs
    cleaned = cleaned.replace(
      /<img[^>]*src="IMG_ID_[^"]*"[^>]*>/gi,
      '<!-- Image removed during emergency cleanup -->'
    );
    
    // Fix broken URLs by removing them
    cleaned = cleaned.replace(
      /src="https:(?![\/\/])[^"]*"/gi,
      'src="" data-broken-url="true"'
    );
    
    console.log('🚨 Emergency cleanup completed');
    
    return cleaned;
  }

  /**
   * Get protection statistics
   */
  getStats(): {
    protectedImages: number;
    imageMap: Map<string, ImageMetadata>;
  } {
    return {
      protectedImages: this.imageMap.size,
      imageMap: new Map(this.imageMap)
    };
  }

  /**
   * Clear protection data (call after successful restoration)
   */
  clear(): void {
    this.imageMap.clear();
    console.log('🧹 Image protection data cleared');
  }

  /**
   * Protect URL attributes in img tags (data-temp-url, data-original-url, etc.)
   */
  private protectImageUrlAttributes(htmlContent: string): string {
    const urlAttributes = ['data-temp-url', 'data-original-url', 'data-src', 'data-lazy-src'];
    let protectedHtml = htmlContent;
    
    urlAttributes.forEach(attrName => {
      const regex = new RegExp(`(${attrName})="(https?://[^"]*)"`, 'gi');
      protectedHtml = protectedHtml.replace(regex, (match, attrName, url) => {
        // Find the corresponding IMG_ID for this image by looking at nearby src attribute
        const imgTagMatch = protectedHtml.match(new RegExp(`<img[^>]*src="(IMG_ID_[^"]*)"[^>]*${attrName}="${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'i'));
        if (imgTagMatch) {
          const imgId = imgTagMatch[1].split('[')[0]; // Remove context if present
          console.log(`🔒 Protected ${attrName}: ${url.substring(0, 50)}... → ${imgId}`);
          return `${attrName}="${imgId}"`;
        }
        
        // If no matching IMG_ID found, mark as broken
        console.warn(`⚠️ Could not find matching IMG_ID for ${attrName}: ${url}`);
        return `${attrName}="" data-broken-${attrName}="${url}"`;
      });
    });
    
    return protectedHtml;
  }

  /**
   * Restore URL attributes in img tags (data-temp-url, data-original-url, etc.)
   */
  private restoreImageUrlAttributes(htmlContent: string, imageMap: Map<string, ImageMetadata>): string {
    const urlAttributes = ['data-temp-url', 'data-original-url', 'data-src', 'data-lazy-src'];
    let restoredHtml = htmlContent;
    let restoredAttributeCount = 0;
    
    urlAttributes.forEach(attrName => {
      const regex = new RegExp(`(${attrName})="(IMG_ID_[^"]*)"`, 'gi');
      restoredHtml = restoredHtml.replace(regex, (match, attrName, imgId) => {
        const cleanId = imgId.split('[')[0]; // Remove context if present
        const metadata = imageMap.get(cleanId);
        
        if (!metadata) {
          console.warn(`⚠️ No metadata found for ${attrName} ID: ${cleanId}`);
          return match;
        }
        
        restoredAttributeCount++;
        console.log(`🔓 Restored ${attrName}: ${cleanId} → ${metadata.originalUrl.substring(0, 50)}...`);
        
        return `${attrName}="${metadata.originalUrl}"`;
      });
    });
    
    if (restoredAttributeCount > 0) {
      console.log(`✅ Restored ${restoredAttributeCount} URL attributes`);
    }
    
    return restoredHtml;
  }

  // Private helper methods
  private extractAttribute(attributeString: string, attributeName: string): string | undefined {
    const regex = new RegExp(`${attributeName}="([^"]*)"`, 'i');
    const match = attributeString.match(regex);
    return match ? match[1] : undefined;
  }

  private extractAllAttributes(attributeString: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const regex = /(\w+)="([^"]*)"/g;
    let match;
    
    while ((match = regex.exec(attributeString)) !== null) {
      const [, name, value] = match;
      if (name.toLowerCase() !== 'src') {
        attributes[name] = value;
      }
    }
    
    return attributes;
  }

  private generateImageContext(alt: string, url: string): string {
    if (!alt) return '';
    
    // Extract key words from alt text for context
    const words = alt.toLowerCase().split(/\s+/);
    const keyWords = words.filter(word => 
      word.length > 3 && 
      !['illustration', 'cartoon', 'image', 'picture', 'photo'].includes(word)
    );
    
    return keyWords.slice(0, 2).join('_');
  }
}

/**
 * Convenience function for one-time protection
 */
export function protectImageUrls(htmlContent: string): ProtectionResult {
  const protector = ImageUrlProtector.getInstance();
  return protector.protectUrls(htmlContent);
}

/**
 * Convenience function for one-time restoration
 */
export function restoreImageUrls(
  protectedHtml: string, 
  imageMap: Map<string, ImageMetadata>
): string {
  const protector = ImageUrlProtector.getInstance();
  return protector.restoreUrls(protectedHtml, imageMap);
}

/**
 * Safe edit wrapper that automatically protects and restores image URLs
 */
export async function safeEditWithImageProtection<T>(
  htmlContent: string,
  editFunction: (protectedHtml: string, protectionStats: { protectedImages: number }) => Promise<T>,
  extractHtmlFromResult: (result: T) => string
): Promise<{ result: T; finalHtml: string; stats: any }> {
  const protector = ImageUrlProtector.getInstance();
  
  try {
    // 1. Protect URLs
    const { protectedHtml, imageMap, imageCount } = protector.protectUrls(htmlContent);
    
    // 2. Perform edit
    console.log('🔄 Performing protected edit...');
    const protectionStats = { protectedImages: imageCount };
    const editResult = await editFunction(protectedHtml, protectionStats);
    
    // 3. Extract HTML from result
    const editedHtml = extractHtmlFromResult(editResult);
    
    // 4. Restore URLs
    const finalHtml = protector.restoreUrls(editedHtml, imageMap);
    
    // 5. Validate restoration
    const validation = protector.validateRestoration(finalHtml);
    
    // 6. Emergency cleanup if needed
    const safeHtml = validation.isValid ? finalHtml : protector.emergencyCleanup(finalHtml);
    
    // 7. Clear protection data
    protector.clear();
    
    return {
      result: editResult,
      finalHtml: safeHtml,
      stats: {
        protectedImages: imageCount,
        validationPassed: validation.isValid,
        remainingIds: validation.remainingIds.length,
        brokenUrls: validation.brokenUrls.length
      }
    };
  } catch (error) {
    console.error('❌ Error during protected edit:', error);
    protector.clear();
    throw error;
  }
}
