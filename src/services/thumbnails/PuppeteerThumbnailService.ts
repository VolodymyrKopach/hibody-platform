import puppeteer, { Browser, Page } from 'puppeteer';

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'png' | 'jpeg' | 'webp';
  background?: string;
  timeout?: number;
}

export interface ThumbnailResult {
  success: boolean;
  thumbnail?: string; // Base64 encoded image
  error?: string;
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
    generatedAt: string;
  };
}

/**
 * Backend thumbnail generation service using Puppeteer
 * Renders HTML content to high-quality images on the server
 */
export class PuppeteerThumbnailService {
  private browser: Browser | null = null;
  private isInitialized = false;

  private readonly defaultOptions: Required<ThumbnailOptions> = {
    width: 1600,        // 4:3 aspect ratio
    height: 1200,
    quality: 90,        // High quality for thumbnails
    format: 'png',
    background: '#ffffff',
    timeout: 30000      // 30 seconds timeout
  };

  /**
   * Initialize Puppeteer browser instance
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.browser) {
      return;
    }

    try {
      console.log('🚀 [PuppeteerThumbnail] Initializing browser...');
      
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
        defaultViewport: {
          width: this.defaultOptions.width,
          height: this.defaultOptions.height
        }
      });

      this.isInitialized = true;
      console.log('✅ [PuppeteerThumbnail] Browser initialized successfully');
    } catch (error) {
      console.error('❌ [PuppeteerThumbnail] Failed to initialize browser:', error);
      throw new Error(`Failed to initialize Puppeteer: ${error}`);
    }
  }

  /**
   * Generate thumbnail from HTML content
   */
  async generateThumbnail(
    htmlContent: string, 
    options: ThumbnailOptions = {}
  ): Promise<ThumbnailResult> {
    const startTime = Date.now();
    
    try {
      // Ensure browser is initialized
      await this.initialize();
      
      if (!this.browser) {
        throw new Error('Browser not initialized');
      }

      const config = { ...this.defaultOptions, ...options };
      
      console.log('🖼️ [PuppeteerThumbnail] Generating thumbnail with options:', {
        width: config.width,
        height: config.height,
        format: config.format,
        quality: config.quality
      });

      // Create new page
      const page = await this.browser.newPage();

      try {
        // Set viewport
        await page.setViewport({
          width: config.width,
          height: config.height,
          deviceScaleFactor: 1
        });

        // Set default styles without overriding slide backgrounds
        await page.evaluate((fallbackBg) => {
          // Only set margin and padding, preserve any existing background
          document.body.style.margin = '0';
          document.body.style.padding = '0';
          
          // Set fallback background only if no background is already defined
          setTimeout(() => {
            const computedStyle = window.getComputedStyle(document.body);
            const currentBg = computedStyle.background || computedStyle.backgroundColor;
            
            // If background is transparent, rgba(0,0,0,0), or initial, set fallback
            if (!currentBg || 
                currentBg === 'rgba(0, 0, 0, 0)' || 
                currentBg === 'transparent' || 
                currentBg === 'initial' ||
                currentBg === 'inherit') {
              document.body.style.backgroundColor = fallbackBg;
            }
          }, 100);
        }, config.background);

        // Optimize HTML for screenshot
        const optimizedHtml = this.optimizeHtmlForScreenshot(htmlContent);

        // Set HTML content
        await page.setContent(optimizedHtml, {
          waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
          timeout: config.timeout
        });

        // Wait for any animations to complete
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Take screenshot
        const screenshotBuffer = await page.screenshot({
          type: config.format,
          quality: config.format === 'jpeg' ? config.quality : undefined,
          fullPage: false,
          clip: {
            x: 0,
            y: 0,
            width: config.width,
            height: config.height
          }
        });

        // Convert to base64
        const base64Image = screenshotBuffer.toString('base64');
        const dataUrl = `data:image/${config.format};base64,${base64Image}`;

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`✅ [PuppeteerThumbnail] Thumbnail generated successfully in ${duration}ms`);

        return {
          success: true,
          thumbnail: dataUrl,
          metadata: {
            width: config.width,
            height: config.height,
            format: config.format,
            size: screenshotBuffer.length,
            generatedAt: new Date().toISOString()
          }
        };

      } finally {
        // Always close the page
        await page.close();
      }

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.error(`❌ [PuppeteerThumbnail] Failed to generate thumbnail after ${duration}ms:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during thumbnail generation'
      };
    }
  }

  /**
   * Generate thumbnails for multiple slides
   */
  async generateMultipleThumbnails(
    slides: Array<{ id: string; htmlContent: string }>,
    options: ThumbnailOptions = {}
  ): Promise<Array<{ slideId: string; thumbnail: ThumbnailResult }>> {
    console.log(`🖼️ [PuppeteerThumbnail] Generating thumbnails for ${slides.length} slides`);
    
    const results: Array<{ slideId: string; thumbnail: ThumbnailResult }> = [];

    for (const slide of slides) {
      try {
        const thumbnail = await this.generateThumbnail(slide.htmlContent, options);
        results.push({
          slideId: slide.id,
          thumbnail
        });
      } catch (error) {
        console.error(`❌ [PuppeteerThumbnail] Failed to generate thumbnail for slide ${slide.id}:`, error);
        results.push({
          slideId: slide.id,
          thumbnail: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }

    console.log(`✅ [PuppeteerThumbnail] Generated ${results.length} thumbnails`);
    return results;
  }

  /**
   * Optimize HTML content for better screenshot generation
   */
  private optimizeHtmlForScreenshot(htmlContent: string): string {
    // Remove scripts that might interfere
    let optimized = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Add CSS to ensure consistent rendering while preserving slide backgrounds
    const optimizationCSS = `
      <style>
        /* Basic box model reset */
        * {
          box-sizing: border-box;
        }
        
        /* Body optimization - preserve backgrounds but ensure proper sizing */
        body {
          margin: 0;
          padding: 20px;
          overflow: hidden;
          /* Don't override font-family or background - let slides define their own */
        }
        
        /* Image optimization */
        img {
          max-width: 100%;
          height: auto;
          display: block;
        }
        
        /* Speed up animations for faster screenshot generation */
        *, *::before, *::after {
          animation-duration: 0.1s !important;
          animation-delay: 0s !important;
          transition-duration: 0.1s !important;
          transition-delay: 0s !important;
        }
        
        /* Ensure text is crisp */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Remove any forced background overrides from previous optimization attempts */
      </style>
    `;

    // Insert CSS at the beginning of head or body
    if (optimized.includes('<head>')) {
      optimized = optimized.replace('<head>', '<head>' + optimizationCSS);
    } else if (optimized.includes('<body>')) {
      optimized = optimized.replace('<body>', '<body>' + optimizationCSS);
    } else {
      optimized = optimizationCSS + optimized;
    }

    return optimized;
  }

  /**
   * Clean up browser instance
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        console.log('🧹 [PuppeteerThumbnail] Browser closed successfully');
      } catch (error) {
        console.error('❌ [PuppeteerThumbnail] Error closing browser:', error);
      } finally {
        this.browser = null;
        this.isInitialized = false;
      }
    }
  }

  /**
   * Get service status
   */
  getStatus(): { initialized: boolean; browserActive: boolean } {
    return {
      initialized: this.isInitialized,
      browserActive: this.browser !== null && this.browser.connected
    };
  }
}

// Singleton instance for reuse across requests
let thumbnailServiceInstance: PuppeteerThumbnailService | null = null;

/**
 * Get singleton instance of PuppeteerThumbnailService
 */
export function getThumbnailService(): PuppeteerThumbnailService {
  if (!thumbnailServiceInstance) {
    thumbnailServiceInstance = new PuppeteerThumbnailService();
  }
  return thumbnailServiceInstance;
}

/**
 * Cleanup thumbnail service (for graceful shutdown)
 */
export async function cleanupThumbnailService(): Promise<void> {
  if (thumbnailServiceInstance) {
    await thumbnailServiceInstance.cleanup();
    thumbnailServiceInstance = null;
  }
}