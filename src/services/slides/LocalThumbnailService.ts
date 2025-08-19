import { generateSlideThumbnail, generateFallbackPreview, SlidePreviewOptions } from '@/utils/slidePreview';
import { createClient } from '@/lib/supabase/client';

export interface ThumbnailOptions {
  quality?: number;
  background?: string;
  compress?: boolean;
  embedFonts?: boolean;
  fast?: boolean;
}

// Інтерфейс для локального зберігання thumbnail'ів
export interface ILocalThumbnailStorage {
  // Локальні операції (в пам'яті)
  get(slideId: string): string | null;
  set(slideId: string, thumbnailBase64: string): void;
  has(slideId: string): boolean;
  delete(slideId: string): void;
  getAll(): Record<string, string>;
  clear(): void;
  
  // Генерація
  generateThumbnail(slideId: string, htmlContent: string, options?: ThumbnailOptions): Promise<string>;
  
  // Завантаження в Storage при збереженні презентації
  uploadToStorage(slideId: string, lessonId: string): Promise<string | null>;
  uploadAllToStorage(lessonId: string, slideIds: string[]): Promise<Record<string, string>>;
}

// Локальне сховище thumbnail'ів (тільки в пам'яті поки редагуємо)
export class LocalThumbnailStorage implements ILocalThumbnailStorage {
  private memoryCache = new Map<string, string>();
  private generationInProgress = new Set<string>();

  constructor() {
    // Initialized local thumbnail storage
  }

  // === ЛОКАЛЬНІ ОПЕРАЦІЇ ===

  get(slideId: string): string | null {
    const thumbnail = this.memoryCache.get(slideId) || null;
    return thumbnail;
  }

  set(slideId: string, thumbnailBase64: string): void {
    this.memoryCache.set(slideId, thumbnailBase64);
  }

  has(slideId: string): boolean {
    return this.memoryCache.has(slideId);
  }

  delete(slideId: string): void {
    const deleted = this.memoryCache.delete(slideId);
  }

  getAll(): Record<string, string> {
    const all: Record<string, string> = {};
    this.memoryCache.forEach((thumbnail, slideId) => {
      all[slideId] = thumbnail;
    });
    return all;
  }

  clear(): void {
    const count = this.memoryCache.size;
    this.memoryCache.clear();
  }

  // === ГЕНЕРАЦІЯ THUMBNAIL'ІВ ===

  async generateThumbnail(slideId: string, htmlContent: string, options: ThumbnailOptions = {}): Promise<string> {

    // Перевіряємо чи вже генерується
    if (this.generationInProgress.has(slideId)) {
      // Повертаємо існуючий або fallback
      return this.get(slideId) || generateFallbackPreview(options);
    }

    this.generationInProgress.add(slideId);

    try {
      // Default options optimized for chat thumbnails (dimensions are hardcoded in generateSlideThumbnail)
      const defaultOptions: SlidePreviewOptions = {
        quality: 0.85,
        background: '#ffffff',
        compress: true,
        embedFonts: false,
        fast: true,
        ...options
      };

      // Generate thumbnail using new snapDOM system (1600×1200 → 400×300 WebP)
      const thumbnailBase64 = await generateSlideThumbnail(htmlContent, defaultOptions);
      
      // Зберігаємо локально
      this.set(slideId, thumbnailBase64);
      
      return thumbnailBase64;

    } catch (error) {
      const fallbackThumbnail = generateFallbackPreview({
        quality: 0.85,
        background: '#ffffff',
        ...options
      });
      this.set(slideId, fallbackThumbnail);
      return fallbackThumbnail;
    } finally {
      this.generationInProgress.delete(slideId);
    }
  }

  // === ЗАВАНТАЖЕННЯ В SUPABASE STORAGE ===

  async uploadToStorage(slideId: string, lessonId: string): Promise<string | null> {
    console.log(`📤 THUMBNAIL STORAGE: Uploading thumbnail for slide ${slideId} to lesson ${lessonId}`);
    
    const thumbnailBase64 = this.get(slideId);
    if (!thumbnailBase64) {
      console.log(`❌ THUMBNAIL STORAGE: No thumbnail found for slide ${slideId}`, {
        availableSlides: Array.from(this.memoryCache.keys()),
        cacheSize: this.memoryCache.size
      });
      return null;
    }
    
    console.log(`✅ THUMBNAIL STORAGE: Found thumbnail for slide ${slideId}`, {
      thumbnailLength: thumbnailBase64.length,
      isDataUrl: thumbnailBase64.startsWith('data:')
    });

    try {
      // Конвертуємо base64 в Blob
      const response = await fetch(thumbnailBase64);
      const blob = await response.blob();

      // Створюємо ім'я файлу
      const fileName = `${slideId}_${Date.now()}.webp`;
      const filePath = `lessons/${lessonId}/thumbnails/${fileName}`;

      // Завантажуємо в Supabase Storage
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from('lesson-assets')
        .upload(filePath, blob, {
          contentType: 'image/webp',
          upsert: true // Перезаписуємо якщо файл існує
        });

      if (error) {
        console.error(`❌ THUMBNAIL STORAGE: Upload failed for slide ${slideId}:`, error);
        return null;
      }
      
      console.log(`✅ THUMBNAIL STORAGE: Upload successful for slide ${slideId}`, data);

      // Отримуємо публічний URL
      const { data: urlData } = supabase.storage
        .from('lesson-assets')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log(`🌐 THUMBNAIL STORAGE: Public URL generated for slide ${slideId}:`, publicUrl);
      
      return publicUrl;

    } catch (error) {
      console.error(`❌ THUMBNAIL STORAGE: Upload process failed for slide ${slideId}:`, error);
      return null;
    }
  }

  async uploadAllToStorage(lessonId: string, slideIds: string[]): Promise<Record<string, string>> {

    const results: Record<string, string> = {};
    const uploadPromises = slideIds.map(async (slideId) => {
      const storageUrl = await this.uploadToStorage(slideId, lessonId);
      if (storageUrl) {
        results[slideId] = storageUrl;
      }
      return { slideId, storageUrl };
    });

    try {
      const uploadResults = await Promise.all(uploadPromises);
      
      return results;
    } catch (error) {
      return results; // Повертаємо часткові результати
    }
  }
}

// Singleton instance
let localThumbnailStorage: LocalThumbnailStorage | null = null;

export function getLocalThumbnailStorage(): LocalThumbnailStorage {
  if (!localThumbnailStorage) {
    localThumbnailStorage = new LocalThumbnailStorage();
  }
  return localThumbnailStorage;
}

// LocalThumbnailStorage вже експортований вище 