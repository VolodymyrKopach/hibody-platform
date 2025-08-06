import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';

export interface SlidePreviewOptions {
  width?: number;
  height?: number;
  quality?: number;
  scale?: number;
  background?: string;
}

/**
 * Generates a slide preview from HTML content
 */
export async function generateSlidePreview(
  htmlContent: string,
  options: SlidePreviewOptions = {}
): Promise<string> {
  const {
    width = 1600,        // Standard width for preview
    height = 1200,       // Standard height for preview
    quality = 0.8,
    scale = 1,
    background = '#ffffff'
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create a temporary iframe for HTML rendering
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = `${width}px`;
      iframe.style.height = `${height}px`;
      iframe.style.border = 'none';
      iframe.style.background = background;
      iframe.style.visibility = 'hidden';
      
      document.body.appendChild(iframe);

      // Timeout for safety (increased to 20 seconds)
      const timeoutId = setTimeout(() => {
        console.warn('Timeout during slide preview generation');
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        reject(new Error('Timeout during preview generation'));
      }, 20000);

      iframe.onload = async () => {
        try {
          const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
          if (!iframeDocument) {
            throw new Error('Could not access iframe document');
          }

          console.log('⏰ Waiting 5 seconds for animations to complete...');
          // Just wait 5 seconds for all animations to complete
          await new Promise(resolve => setTimeout(resolve, 5000));

          console.log('📸 Creating screenshot after animations complete...');

          // Generate preview using html2canvas
          const canvas = await html2canvas(iframeDocument.body, {
            width,
            height,
            scale,
            backgroundColor: background,
            useCORS: true,
            allowTaint: true,
            foreignObjectRendering: true,
            logging: false,
            removeContainer: true,
            imageTimeout: 8000
          });

          // Convert to base64
          const dataUrl = canvas.toDataURL('image/png', quality);
          
          // Clean up resources
          clearTimeout(timeoutId);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          
          console.log('✅ Preview successfully created after 5-second wait');
          resolve(dataUrl);
        } catch (error) {
          clearTimeout(timeoutId);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          console.error('html2canvas error:', error);
          reject(error);
        }
      };

      iframe.onerror = (error) => {
        clearTimeout(timeoutId);
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        console.error('iframe loading error:', error);
        reject(new Error('iframe loading error'));
      };

      // Optimize HTML content for better preview generation
      const optimizedHtml = optimizeHtmlForPreviewWithAnimations(htmlContent);
      iframe.srcdoc = optimizedHtml;
    } catch (error) {
      console.error('iframe creation error:', error);
      reject(error);
    }
  });
}

/**
 * Alternative method for preview generation with less aggressive processing
 */
export async function generateSlidePreviewAlt(
  htmlContent: string,
  options: SlidePreviewOptions = {}
): Promise<string> {
  const {
    width = 1600,        // Standard width for preview
    height = 1200,       // Standard height for preview
    quality = 0.8,
    scale = 1,
    background = '#ffffff'
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create a container for preview
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      container.style.overflow = 'hidden';
      container.style.background = background;
      container.style.visibility = 'hidden';
      
      document.body.appendChild(container);

      // Timeout for safety
      const timeoutId = setTimeout(() => {
        console.warn('Timeout during alternative preview generation');
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        reject(new Error('Timeout during alternative preview generation'));
      }, 15000);

      try {
        // Add HTML content
        container.innerHTML = htmlContent;

        // Simple method - wait 5 seconds and take a screenshot
        setTimeout(async () => {
          try {
            console.log('📸 Alternative method: creating screenshot after 5 seconds...');

            const canvas = await html2canvas(container, {
              width,
              height,
              scale,
              backgroundColor: background,
              useCORS: true,
              allowTaint: true,
              foreignObjectRendering: true,
              logging: false,
              removeContainer: true,
              imageTimeout: 5000
            });

            const dataUrl = canvas.toDataURL('image/png', quality);
            
            clearTimeout(timeoutId);
            if (document.body.contains(container)) {
              document.body.removeChild(container);
            }
            
            console.log('✅ Alternative preview successfully created');
            resolve(dataUrl);
          } catch (error) {
            clearTimeout(timeoutId);
            if (document.body.contains(container)) {
              document.body.removeChild(container);
            }
            console.error('Alternative html2canvas error:', error);
            reject(error);
          }
        }, 5000);

      } catch (error) {
        clearTimeout(timeoutId);
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        console.error('Container creation error:', error);
        reject(error);
      }
    } catch (error) {
      console.error('Alternative method error:', error);
      reject(error);
    }
  });
}

/**
 * Generates a slide thumbnail with automatic fallback
 */
export async function generateSlideThumbnail(
  htmlContent: string, 
  options: SlidePreviewOptions = {}
): Promise<string> {
  console.log('🖼️ Starting slide preview generation...');
  
  try {
    // First, try the main method with a 5-second wait
    const preview = await generateSlidePreview(htmlContent, options);
    console.log('✅ Main method successfully created preview');
    return preview;
  } catch (error) {
    console.warn('⚠️ Main method failed, trying alternative...', error);
    
    try {
      // If the main method failed, try the alternative
      const alternativePreview = await generateSlidePreviewAlt(htmlContent, options);
      console.log('✅ Alternative method successfully created preview');
      return alternativePreview;
    } catch (altError) {
      console.warn('⚠️ Alternative method also failed, creating fallback preview...', altError);
      
      // If both methods failed, create a fallback preview
      const fallbackPreview = generateFallbackPreview(options);
      console.log('✅ Fallback preview created');
      return fallbackPreview;
    }
  }
}

/**
 * Generates previews for all lesson slides
 */
export async function generateLessonPreviews(
  slides: Array<{ id: string; htmlContent: string }>,
  options: SlidePreviewOptions = {}
): Promise<Array<{ slideId: string; preview: string; thumbnail: string }>> {
  const results: Array<{ slideId: string; preview: string; thumbnail: string }> = [];
  
  for (const slide of slides) {
    try {
      console.log(`Generating preview for slide ${slide.id}...`);
      
      const [preview, thumbnail] = await Promise.all([
        generateSlidePreview(slide.htmlContent, options),
        generateSlideThumbnail(slide.htmlContent, options)
      ]);

      results.push({
        slideId: slide.id,
        preview,
        thumbnail
      });
    } catch (error) {
      console.error(`Error generating preview for slide ${slide.id}:`, error);
      
      // Generate fallback preview
      const fallbackPreview = generateFallbackPreview(options);
      results.push({
        slideId: slide.id,
        preview: fallbackPreview,
        thumbnail: fallbackPreview
      });
    }
  }

  return results;
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

/**
 * Extracts DOM element from HTML string for preview
 */
export function extractPreviewElement(htmlContent: string): HTMLElement | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // Search for the main slide container
  let slideElement = doc.querySelector('.slide') as HTMLElement;
  
  if (!slideElement) {
    slideElement = doc.querySelector('[class*="slide"]') as HTMLElement;
  }
  
  if (!slideElement) {
    slideElement = doc.body;
  }

  return slideElement;
}

/**
 * Optimizes HTML for preview generation (removes interactive elements)
 */
export function optimizeHtmlForPreview(htmlContent: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Remove scripts
  const scripts = doc.querySelectorAll('script');
  scripts.forEach(script => script.remove());

  // Remove interactive elements
  const interactive = doc.querySelectorAll('button, input, select, textarea, video, audio');
  interactive.forEach(el => {
    // Replace with static elements
    const staticEl = doc.createElement('div');
    staticEl.className = el.className;
    staticEl.style.cssText = (el as HTMLElement).style.cssText;
    staticEl.textContent = el.textContent || 'Interactive Element';
    el.parentNode?.replaceChild(staticEl, el);
  });

  return doc.documentElement.outerHTML;
}

/**
 * Checks if HTML content contains animations
 */
export function hasAnimations(htmlContent: string): boolean {
  const animationPatterns = [
    /animation\s*:/,
    /transition\s*:/,
    /@keyframes/,
    /transform\s*:/,
    /animate/i,
    /fadeIn/i,
    /slideIn/i,
    /bounceIn/i,
    /rotateIn/i,
    /data-aos/i,
    /aos-/i
  ];
  
  return animationPatterns.some(pattern => pattern.test(htmlContent));
}

/**
 * Optimizes HTML for preview generation taking into account animations and images
 */
export function optimizeHtmlForPreviewWithAnimations(htmlContent: string): string {
  let optimizedHtml = optimizeHtmlForPreview(htmlContent);
  
  // Replace problematic images with CSS placeholders
  optimizedHtml = replaceImagesWithPlaceholders(optimizedHtml);
  
  // If there are animations, add CSS to speed them up
  if (hasAnimations(optimizedHtml)) {
    const speedUpAnimationsCSS = `
      <style>
        *, *::before, *::after {
          animation-duration: 0.1s !important;
          animation-delay: 0s !important;
          transition-duration: 0.1s !important;
          transition-delay: 0s !important;
        }
        [data-aos] {
          animation-duration: 0.1s !important;
        }
        
        /* Styles for image placeholders */
        .image-placeholder {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          display: flex !important;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          min-width: 150px;
          min-height: 100px;
        }
      </style>
    `;
    
    // Add CSS before closing head or body tag
    if (optimizedHtml.includes('</head>')) {
      optimizedHtml = optimizedHtml.replace('</head>', speedUpAnimationsCSS + '</head>');
    } else if (optimizedHtml.includes('</body>')) {
      optimizedHtml = optimizedHtml.replace('</body>', speedUpAnimationsCSS + '</body>');
    } else {
      optimizedHtml = speedUpAnimationsCSS + optimizedHtml;
    }
  }
  
  return optimizedHtml;
}

/**
 * Replaces images from external sources with CSS placeholders
 */
function replaceImagesWithPlaceholders(htmlContent: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  const images = doc.querySelectorAll('img');
  
  images.forEach((img, index) => {
    const src = img.getAttribute('src');
    
    // Check if the image is from an external source or might be problematic
    const isExternal = src && (
      src.startsWith('http://') || 
      src.startsWith('https://') ||
      src.startsWith('//') ||
      src.includes('unsplash.com') ||
      src.includes('pixabay.com') ||
      src.includes('pexels.com') ||
      src.includes('freepik.com')
    );
    
    const isDataUrl = src && src.startsWith('data:');
    const isEmpty = !src || src.trim() === '';
    
    if (isExternal || isEmpty) {
      console.log(`🔄 Replacing image ${index + 1} with placeholder (src: ${src?.substring(0, 50)}...)`);
      
      // Get dimensions from attributes or CSS
      const width = img.getAttribute('width') || img.style.width || '200px';
      const height = img.getAttribute('height') || img.style.height || '150px';
      
      // Create placeholder div
      const placeholder = doc.createElement('div');
      placeholder.className = `image-placeholder ${img.className}`;
      placeholder.style.cssText = `
        width: ${width.toString().includes('px') ? width : width + 'px'};
        height: ${height.toString().includes('px') ? height : height + 'px'};
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        min-width: 150px;
        min-height: 100px;
        ${img.style.cssText}
      `;
      placeholder.textContent = '🖼️';
      
      // Replace img with placeholder
      img.parentNode?.replaceChild(placeholder, img);
    } else if (isDataUrl) {
      console.log(`✅ Keeping data URL image ${index + 1}`);
      // Data URL images are kept as is
    }
  });
  
  return doc.documentElement.outerHTML;
} 