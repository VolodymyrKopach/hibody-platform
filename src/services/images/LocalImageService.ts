/**
 * Local Image Service - No Supabase required!
 * Stores images as Base64 Data URLs in localStorage with the worksheet
 */

export interface LocalImageUploadResult {
  url: string; // Base64 Data URL
  fileName: string;
  size: number;
  width?: number;
  height?: number;
  success: boolean;
  error?: string;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export class LocalImageService {
  private maxFileSize: number = 5 * 1024 * 1024; // 5MB
  private allowedFormats: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  /**
   * Validates image file before upload
   */
  validateImage(file: File): ImageValidationResult {
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    // Check file format
    if (!this.allowedFormats.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file format. Allowed formats: ${this.allowedFormats.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Gets image dimensions from File
   */
  async getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };

      img.src = url;
    });
  }

  /**
   * Converts File to Base64 Data URL
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compresses image if it's too large (optional optimization)
   */
  private async compressImage(file: File, maxWidth: number = 1920): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        // Create canvas
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down if needed
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Base64 with quality
        const quality = file.size > 2 * 1024 * 1024 ? 0.7 : 0.85; // Lower quality for large files
        const dataUrl = canvas.toDataURL(file.type, quality);
        
        resolve(dataUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  /**
   * Upload image locally (converts to Base64 Data URL)
   */
  async uploadLocalImage(
    file: File,
    options: {
      compress?: boolean;
      maxWidth?: number;
    } = {}
  ): Promise<LocalImageUploadResult> {
    try {
      // 1. Validate image
      const validation = this.validateImage(file);
      if (!validation.valid) {
        return {
          url: '',
          fileName: file.name,
          size: file.size,
          success: false,
          error: validation.error
        };
      }

      // 2. Get image dimensions
      const dimensions = await this.getImageDimensions(file);

      // 3. Convert to Base64 (with optional compression)
      let dataUrl: string;
      
      if (options.compress && file.size > 500 * 1024) {
        // Compress if file > 500KB
        console.log(`📦 Compressing image: ${file.name} (${(file.size / 1024).toFixed(0)}KB)`);
        dataUrl = await this.compressImage(file, options.maxWidth);
        console.log(`✅ Compressed to: ${(dataUrl.length / 1024).toFixed(0)}KB`);
      } else {
        // Use original
        dataUrl = await this.fileToBase64(file);
      }

      console.log(`✅ Local image processed: ${file.name}`);

      return {
        url: dataUrl, // Base64 Data URL
        fileName: file.name,
        size: dataUrl.length, // Base64 size
        width: dimensions?.width,
        height: dimensions?.height,
        success: true
      };

    } catch (error) {
      console.error('💥 Error processing local image:', error);
      return {
        url: '',
        fileName: file.name,
        size: file.size,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Upload from URL (downloads and converts to Base64)
   */
  async uploadFromUrl(imageUrl: string): Promise<LocalImageUploadResult> {
    try {
      console.log(`📥 Downloading image from URL: ${imageUrl}`);

      // Fetch image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return {
          url: '',
          fileName: 'url-image',
          size: 0,
          success: false,
          error: `Failed to fetch image: ${response.statusText}`
        };
      }

      // Convert to blob then file
      const blob = await response.blob();
      const file = new File([blob], 'url-image.jpg', { type: blob.type });

      // Process like normal upload
      return await this.uploadLocalImage(file);

    } catch (error) {
      console.error('💥 Error uploading from URL:', error);
      return {
        url: '',
        fileName: 'url-image',
        size: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Checks if URL is Base64 Data URL
   */
  isBase64DataUrl(url: string): boolean {
    return url.startsWith('data:image/');
  }

  /**
   * Gets size of Base64 string in bytes
   */
  getBase64Size(dataUrl: string): number {
    return dataUrl.length;
  }

  /**
   * Estimates localStorage usage for images
   */
  estimateStorageUsage(): {
    imageCount: number;
    totalSize: number;
    formattedSize: string;
  } {
    // This is a rough estimate - actual usage depends on worksheet storage
    let imageCount = 0;
    let totalSize = 0;

    try {
      // Scan localStorage for data URLs
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          
          // Count data URLs
          const matches = value.match(/data:image\/[^"'\s]+/g);
          if (matches) {
            imageCount += matches.length;
            matches.forEach(url => {
              totalSize += url.length;
            });
          }
        }
      }

      const formattedSize = totalSize > 1024 * 1024 
        ? `${(totalSize / 1024 / 1024).toFixed(2)} MB`
        : `${(totalSize / 1024).toFixed(2)} KB`;

      return { imageCount, totalSize, formattedSize };

    } catch (error) {
      console.error('Error estimating storage:', error);
      return { imageCount: 0, totalSize: 0, formattedSize: '0 KB' };
    }
  }
}

// Export singleton instance
export const localImageService = new LocalImageService();

