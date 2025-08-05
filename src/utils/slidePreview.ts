export interface SlidePreviewOptions {
  width?: number;
  height?: number;
  quality?: number;
  scale?: number;
  background?: string;
}

/**
 * Creates a fallback preview as a gradient with text
 */
export function generateFallbackPreview(options: SlidePreviewOptions = {}): string {
  const {
    width = 640,         // Standard width for fallback preview
    height = 480,        // Standard height for fallback preview
    background = '#ffffff'
  } = options;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Could not create 2D context for fallback preview');
    return '';
  }
  
  // Create a beautiful gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(0.5, '#764ba2');
  gradient.addColorStop(1, '#f093fb');
  
  // Fill the background with gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add a translucent background for text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(width * 0.2, height * 0.4, width * 0.6, height * 0.2);
  
  // Add text
  ctx.fillStyle = '#333333';
  ctx.font = `${Math.floor(width / 20)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const text = 'Slide Preview';
  const emoji = '📋';
  
  ctx.fillText(emoji, width / 2, height / 2 - 20);
  ctx.fillText(text, width / 2, height / 2 + 20);
  
  return canvas.toDataURL('image/png', 0.8);
}

/**
 * Generates a slide thumbnail with automatic fallback
 * Note: This now only returns a fallback preview since html2canvas has been removed
 */
export async function generateSlideThumbnail(
  htmlContent: string, 
  options: SlidePreviewOptions = {}
): Promise<string> {
  console.log('🖼️ Frontend thumbnail generation disabled - using fallback preview');
  return generateFallbackPreview(options);
}

/**
 * Generates a slide preview from HTML content
 * Note: This now only returns a fallback preview since html2canvas has been removed
 */
export async function generateSlidePreview(
  htmlContent: string,
  options: SlidePreviewOptions = {}
): Promise<string> {
  console.log('🖼️ Frontend preview generation disabled - using fallback preview');
  return generateFallbackPreview(options);
}

/**
 * Alternative method for preview generation with less aggressive processing
 * Note: This now only returns a fallback preview since html2canvas has been removed
 */
export async function generateSlidePreviewAlt(
  htmlContent: string,
  options: SlidePreviewOptions = {}
): Promise<string> {
  console.log('🖼️ Frontend alternative preview generation disabled - using fallback preview');
  return generateFallbackPreview(options);
}

/**
 * Generates previews for all lesson slides
 * Note: This now only returns fallback previews since html2canvas has been removed
 */
export async function generateLessonPreviews(
  slides: Array<{ id: string; htmlContent: string }>,
  options: SlidePreviewOptions = {}
): Promise<Array<{ slideId: string; preview: string; thumbnail: string }>> {
  console.log('🖼️ Frontend lesson previews generation disabled - using fallback previews');
  
  const results: Array<{ slideId: string; preview: string; thumbnail: string }> = [];
  
  for (const slide of slides) {
    const fallbackPreview = generateFallbackPreview(options);
    results.push({
      slideId: slide.id,
      preview: fallbackPreview,
      thumbnail: fallbackPreview
    });
  }

  return results;
}

/**
 * Saves the preview as a file in the public directory
 */
export async function savePreviewAsFile(
  previewDataUrl: string,
  lessonId: string,
  slideId: string
): Promise<string> {
  try {
    const response = await fetch('/api/images/slide', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: previewDataUrl,
        lessonId,
        slideId,
        type: 'preview'
      })
    });

    if (!response.ok) {
      throw new Error('Error saving preview');
    }

    const result = await response.json();
    return result.imagePath;
  } catch (error) {
    console.error('Error saving preview as file:', error);
    throw error;
  }
}
