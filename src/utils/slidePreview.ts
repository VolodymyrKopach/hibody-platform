// snapDOM-based thumbnail generation system

import { snapdom } from '@zumer/snapdom';

export interface SlidePreviewOptions {
  quality?: number;
  background?: string;
  compress?: boolean;
  embedFonts?: boolean;
  fast?: boolean;
}

/**
 * Generates a slide preview from HTML content using snapDOM
 */
export async function generateSlidePreview(
  htmlContent: string,
  options: SlidePreviewOptions = {}
): Promise<string> {
  return generateSlideThumbnail(htmlContent, options);
}

/**
 * Alternative method for preview generation with less aggressive processing
 * Uses snapDOM with optimized settings for better compatibility
 */
export async function generateSlidePreviewAlt(
  htmlContent: string,
  options: SlidePreviewOptions = {}
): Promise<string> {
  // Use more conservative settings for better compatibility
  const altOptions = {
    compress: false,
    fast: false,
    embedFonts: true,
    ...options
  };
  
  return generateSlideThumbnail(htmlContent, altOptions);
}

/**
 * Generates a slide thumbnail from HTML content using snapDOM
 * Supports multiple formats and advanced options
 */
export async function generateSlideThumbnail(
  htmlContent: string, 
  options: SlidePreviewOptions = {}
): Promise<string> {
  try {
    // Default options optimized for slide thumbnails
    const defaultOptions: Required<SlidePreviewOptions> = {
      quality: 0.85,
      background: '#ffffff',
      compress: true,
      embedFonts: false,
      fast: true
    };

    // Hardcoded dimensions for optimal thumbnail generation
    const VIEWPORT_WIDTH = 1600;  // Large viewport for better content rendering
    const VIEWPORT_HEIGHT = 1200;
    const OUTPUT_WIDTH = 400;     // Smaller output for efficient thumbnails
    const OUTPUT_HEIGHT = 300;

    const config = { ...defaultOptions, ...options };
    
    // Optimize HTML content for thumbnail generation first
    const optimizedHtml = optimizeHtmlForSnapdom(htmlContent);
    
    // Check if optimized HTML is a full document or fragment
    const isFullDocument = optimizedHtml.trim().toLowerCase().startsWith('<!doctype') || 
                          optimizedHtml.trim().toLowerCase().startsWith('<html');
    
    let container: HTMLElement;
    
    if (isFullDocument) {
      // For full documents, create an iframe-like container
      container = document.createElement('iframe');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = `${VIEWPORT_WIDTH}px`;
      container.style.height = `${VIEWPORT_HEIGHT}px`;
      container.style.border = 'none';
      container.style.overflow = 'hidden';
      
      // Add to document first to enable content writing
      document.body.appendChild(container);
      
      const iframe = container as HTMLIFrameElement;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(optimizedHtml);
        iframeDoc.close();
        
        // Wait for iframe to load and fonts to render
        await new Promise(resolve => {
          iframe.onload = resolve;
          setTimeout(resolve, 300); // Increased timeout for font loading
        });
        
        // Additional wait for font rendering
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Use the iframe's body for better content capture
        container = iframeDoc.body || iframeDoc.documentElement;
      } else {
        throw new Error('Could not access iframe document');
      }
    } else {
      // For fragments, use a simple div container
      container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = `${VIEWPORT_WIDTH}px`;
      container.style.height = `${VIEWPORT_HEIGHT}px`;
      container.style.overflow = 'hidden';
      container.style.backgroundColor = config.background;
      container.innerHTML = optimizedHtml;
      
      // Add container to document temporarily
      document.body.appendChild(container);
    }
    
    try {
      // Wait for images to load before capturing
      const images = container.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        return new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Continue even if image fails to load
            // Timeout after 3 seconds to prevent hanging
            setTimeout(() => resolve(), 3000);
          }
        });
      });
      
      // Wait for all images to load (or timeout)
      await Promise.all(imagePromises);
      
      // Fast-forward animations to their final state and allow fonts to load
      await new Promise(resolve => setTimeout(resolve, 300)); // Increased delay for DOM, fonts, and images to settle
      
      // Configure snapDOM options with hardcoded dimensions
      const snapdomOptions = {
        width: OUTPUT_WIDTH,   // Output image size: 400px
        height: OUTPUT_HEIGHT, // Output image size: 300px
        backgroundColor: config.background,
        quality: config.quality,
        compress: config.compress,
        embedFonts: config.embedFonts,
        fast: config.fast,
        exclude: [
          'script',
          '[data-capture="exclude"]'
        ],
        filter: (el: Element) => {
          // Exclude problematic elements
          const tagName = el.tagName.toLowerCase();
          return !['script', 'iframe', 'embed', 'object'].includes(tagName);
        }
      };

      // Always use WebP format for best compression and quality
      const webpImg = await snapdom.toWebp(container, snapdomOptions);
      return webpImg.src;
      
    } finally {
      // Always clean up the temporary container
      if (isFullDocument) {
        // For iframes, remove the iframe element (container was the iframe initially)
        const iframe = document.querySelector('iframe[style*="-9999px"]') as HTMLIFrameElement;
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      } else {
        // For div containers, remove the div
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }
    }
    
      } catch (error) {
      return generateFallbackPreview(options);
    }
}

/**
 * Generates previews for all lesson slides using snapDOM
 * Creates both preview and thumbnail versions
 */
export async function generateLessonPreviews(
  slides: Array<{ id: string; htmlContent: string }>,
  options: SlidePreviewOptions = {}
): Promise<Array<{ slideId: string; preview: string; thumbnail: string }>> {
  const results: Array<{ slideId: string; preview: string; thumbnail: string }> = [];
  
  for (const slide of slides) {
    try {
      // Generate preview (uses hardcoded dimensions: 1600×1200 → 400×300)
      const preview = await generateSlideThumbnail(slide.htmlContent, {
        quality: 0.9,
        ...options
      });
      
      // Generate thumbnail (same dimensions - already optimized)
      const thumbnail = await generateSlideThumbnail(slide.htmlContent, {
        quality: 0.8,
        fast: true,
        ...options
      });
      
      results.push({
        slideId: slide.id,
        preview,
        thumbnail
      });
      
    } catch (error) {
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
export function generateFallbackPreview(options: SlidePreviewOptions & { width?: number; height?: number } = {}): string {
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
      // Data URL images are kept as is
    }
  });
  
  return doc.documentElement.outerHTML;
}



/**
 * Converts an image to data URL for better snapDOM compatibility
 */
async function convertImageToDataUrl(img: HTMLImageElement): Promise<string | null> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Wait for image to load if not already loaded
    if (!img.complete) {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to load'));
        setTimeout(() => reject(new Error('Image load timeout')), 5000);
      });
    }
    
    canvas.width = img.naturalWidth || img.width || 200;
    canvas.height = img.naturalHeight || img.height || 200;
    
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/webp', 0.8);
  } catch (error) {
    console.warn('Failed to convert image to data URL:', error);
    return null;
  }
}

/**
 * Optimizes HTML content specifically for snapDOM capture
 * Handles both complete HTML documents and HTML fragments
 */
function optimizeHtmlForSnapdom(htmlContent: string): string {
  const parser = new DOMParser();
  let doc: Document;
  let isFullDocument = false;
  
  // Check if it's a complete HTML document or just a fragment
  if (htmlContent.trim().toLowerCase().startsWith('<!doctype') || 
      htmlContent.trim().toLowerCase().startsWith('<html')) {
    doc = parser.parseFromString(htmlContent, 'text/html');
    isFullDocument = true;
  } else {
    // For fragments, wrap in a basic HTML structure
    const wrappedHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${htmlContent}</body></html>`;
    doc = parser.parseFromString(wrappedHtml, 'text/html');
    isFullDocument = false;
  }

  // Remove scripts and potentially problematic elements
  const elementsToRemove = doc.querySelectorAll('script, iframe, embed, object, video, audio, noscript');
  elementsToRemove.forEach(el => el.remove());

  // Handle external images - keep trusted domains and convert to data URLs when possible
  const images = doc.querySelectorAll('img');
  
  for (let index = 0; index < images.length; index++) {
    const img = images[index];
    const src = img.getAttribute('src');
    
    if (src && (src.startsWith('http') || src.startsWith('//'))) {
      // Check if it's from trusted domains (Supabase storage, etc.)
      const isTrustedDomain = src.includes('supabase.co') || 
                             src.includes('localhost') ||
                             src.includes('127.0.0.1') ||
                             src.startsWith('data:');
      
      if (isTrustedDomain) {
        // For trusted domains, optimize for snapDOM compatibility
        try {
          // Add crossorigin attribute for CORS (important for external images)
          img.setAttribute('crossorigin', 'anonymous');
          
          // Add loading attribute to ensure image loads before capture
          img.setAttribute('loading', 'eager');
          
          // Optimize image styling for snapDOM
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.display = 'block';
          

        } catch (error) {
          console.warn(`⚠️ Could not optimize trusted image, keeping as-is: ${error}`);
        }
      } else {
        // Only replace untrusted external images with placeholders
        const placeholder = doc.createElement('div');
        placeholder.style.cssText = `
          width: ${img.width || 200}px;
          height: ${img.height || 200}px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: Arial, sans-serif;
          font-size: 14px;
          border-radius: 8px;
          text-align: center;
          vertical-align: ${img.style.verticalAlign || 'top'};
          margin: ${img.style.margin || '0'};
        `;
        placeholder.textContent = img.alt || `🖼️ External Image`;
        
        // Copy any classes
        if (img.className) {
          placeholder.className = img.className;
        }
        
        img.parentNode?.replaceChild(placeholder, img);
      }
    }
  }

  // Convert interactive elements to static ones with preserved styling
  const interactiveElements = doc.querySelectorAll('button, input, select, textarea, a[href]');
  interactiveElements.forEach(el => {
    const staticDiv = doc.createElement('div');
    staticDiv.className = el.className;
    
    // Copy all computed styles (getComputedStyle is always available in modern browsers)
    // const computedStyle = window.getComputedStyle ? null : (el as HTMLElement).style;
    staticDiv.style.cssText = (el as HTMLElement).style.cssText;
    
    // Set content
    if (el.tagName.toLowerCase() === 'input') {
      staticDiv.textContent = (el as HTMLInputElement).value || (el as HTMLInputElement).placeholder || 'Input';
    } else if (el.tagName.toLowerCase() === 'select') {
      const selectedOption = (el as HTMLSelectElement).selectedOptions[0];
      staticDiv.textContent = selectedOption?.textContent || 'Select';
    } else {
      staticDiv.textContent = el.textContent || 'Interactive Element';
    }
    
    // Preserve visual styling for different element types
    if (el.tagName.toLowerCase() === 'button') {
      staticDiv.style.border = staticDiv.style.border || '1px solid #ccc';
      staticDiv.style.padding = staticDiv.style.padding || '8px 16px';
      staticDiv.style.borderRadius = staticDiv.style.borderRadius || '4px';
      staticDiv.style.backgroundColor = staticDiv.style.backgroundColor || '#f5f5f5';
      staticDiv.style.cursor = 'default';
      staticDiv.style.display = staticDiv.style.display || 'inline-block';
    } else if (el.tagName.toLowerCase() === 'a') {
      staticDiv.style.color = staticDiv.style.color || '#0066cc';
      staticDiv.style.textDecoration = staticDiv.style.textDecoration || 'underline';
    } else if (el.tagName.toLowerCase() === 'input') {
      staticDiv.style.border = staticDiv.style.border || '1px solid #ccc';
      staticDiv.style.padding = staticDiv.style.padding || '4px 8px';
      staticDiv.style.backgroundColor = staticDiv.style.backgroundColor || '#fff';
    }
    
    el.parentNode?.replaceChild(staticDiv, el);
  });

  // Preserve existing styles but add optimization styles
  const linkTags = doc.querySelectorAll('link[rel="stylesheet"]');
  
  // Remove only external stylesheet links (they won't load properly anyway)
  linkTags.forEach(link => link.remove());

  // Add essential optimization styles WITHOUT removing existing style tags
  const optimizationStyle = doc.createElement('style');
  
  optimizationStyle.textContent = `
    /* Font Loading and Fallbacks */
    @font-face {
      font-family: 'Comic Sans MS';
      src: local('Comic Sans MS'), local('ComicSansMS'), local('Comic Sans');
      font-display: swap;
    }
    
    /* Ensure system fonts are available as fallbacks */
    * {
      font-family: inherit;
    }
    
    /* Common educational fonts with proper fallbacks */
    [style*="Comic Sans"] {
      font-family: "Comic Sans MS", "Trebuchet MS", cursive, sans-serif !important;
    }
    
    body {
      font-family: inherit;
    }
    
    /* Fast-forward animations to their final state */
    *, *::before, *::after {
      animation-delay: -10s !important; /* Jump to end of animation */
      animation-duration: 0.01s !important; /* Instant completion */
      animation-fill-mode: forwards !important; /* Stay at final state */
      transition-duration: 0.01s !important; /* Instant transitions */
      transition-delay: 0s !important;
    }
    
    /* Handle AOS animations */
    [data-aos] {
      animation-delay: -10s !important;
      animation-duration: 0.01s !important;
      animation-fill-mode: forwards !important;
      opacity: 1 !important; /* Ensure visibility */
      transform: translateY(0) translateX(0) scale(1) rotate(0deg) !important; /* Final position */
    }
    
    /* Force all elements to their final animated state */
    [style*="animation"] {
      animation-delay: -10s !important;
      animation-duration: 0.01s !important;
      animation-fill-mode: forwards !important;
    }
    
    /* Ensure proper rendering */
    img {
      max-width: 100%;
      height: auto;
    }
    
    /* Handle background images and gradients */
    [style*="background-image"], [style*="background:"], [style*="linear-gradient"], [style*="radial-gradient"] {
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    
    /* Ensure gradients render properly in snapshots */
    body, html {
      background-attachment: scroll !important;
    }
    
    /* Prevent overflow issues - but preserve original body styles */
    html {
      margin: 0;
      padding: 0;
      overflow: hidden;
      width: 100%;
      height: 100%;
    }
    
    /* Fix common layout issues */
    * {
      box-sizing: border-box;
    }
  `;
  
  // Add the optimization styles to head (but keep existing styles)
  const head = doc.querySelector('head');
  if (head) {
    head.appendChild(optimizationStyle);
  } else {
    doc.body.insertBefore(optimizationStyle, doc.body.firstChild);
  }

  // For full documents, return the entire body content
  // For fragments, return just the content
  if (isFullDocument) {
    return doc.documentElement.outerHTML;
  } else {
    return doc.body.innerHTML;
  }
} 