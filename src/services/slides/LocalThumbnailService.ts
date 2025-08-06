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
    console.log('📦 LOCAL THUMBNAIL: Ініціалізовано локальне сховище thumbnail\'ів');
  }

  // === ЛОКАЛЬНІ ОПЕРАЦІЇ ===

  get(slideId: string): string | null {
    const thumbnail = this.memoryCache.get(slideId) || null;
    if (thumbnail) {
      console.log('⚡ LOCAL THUMBNAIL: Знайдено в локальному кеші:', slideId);
    }
    return thumbnail;
  }

  set(slideId: string, thumbnailBase64: string): void {
    this.memoryCache.set(slideId, thumbnailBase64);
    console.log('💾 LOCAL THUMBNAIL: Збережено локально:', slideId, `(${Math.round(thumbnailBase64.length / 1024)}KB)`);
  }

  has(slideId: string): boolean {
    return this.memoryCache.has(slideId);
  }

  delete(slideId: string): void {
    const deleted = this.memoryCache.delete(slideId);
    if (deleted) {
      console.log('🗑️ LOCAL THUMBNAIL: Видалено з локального кешу:', slideId);
    }
  }

  getAll(): Record<string, string> {
    const all: Record<string, string> = {};
    this.memoryCache.forEach((thumbnail, slideId) => {
      all[slideId] = thumbnail;
    });
    console.log('📋 LOCAL THUMBNAIL: Отримано всі локальні thumbnail\'и:', Object.keys(all));
    return all;
  }

  clear(): void {
    const count = this.memoryCache.size;
    this.memoryCache.clear();
    console.log(`🧹 LOCAL THUMBNAIL: Очищено локальний кеш (${count} thumbnail'ів)`);
  }

  // === ГЕНЕРАЦІЯ THUMBNAIL'ІВ ===

  async generateThumbnail(slideId: string, htmlContent: string, options: ThumbnailOptions = {}): Promise<string> {
    console.log('🎨 LOCAL THUMBNAIL: Генерація thumbnail для слайду:', slideId);

    // Перевіряємо чи вже генерується
    if (this.generationInProgress.has(slideId)) {
      console.log('⏳ LOCAL THUMBNAIL: Генерація вже в процесі для слайду:', slideId);
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
      
      console.log('✅ LOCAL THUMBNAIL: Thumbnail згенеровано та збережено локально:', slideId);
      return thumbnailBase64;

    } catch (error) {
      console.warn('⚠️ LOCAL THUMBNAIL: Помилка генерації, створюємо fallback:', error);
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
    console.log('☁️ LOCAL THUMBNAIL: Завантаження в Storage:', slideId, 'для уроку:', lessonId);

    const thumbnailBase64 = this.get(slideId);
    if (!thumbnailBase64) {
      console.warn('⚠️ LOCAL THUMBNAIL: Немає локального thumbnail для завантаження:', slideId);
      return null;
    }

    try {
      // Конвертуємо base64 в Blob
      const response = await fetch(thumbnailBase64);
      const blob = await response.blob();

      // Створюємо ім'я файлу
      const fileName = `${slideId}_${Date.now()}.png`;
      const filePath = `lessons/${lessonId}/thumbnails/${fileName}`;

      // Завантажуємо в Supabase Storage
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from('lesson-assets')
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: true // Перезаписуємо якщо файл існує
        });

      if (error) {
        console.error('❌ LOCAL THUMBNAIL: Помилка завантаження в Storage:', error);
        return null;
      }

      // Отримуємо публічний URL
      const { data: urlData } = supabase.storage
        .from('lesson-assets')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log('✅ LOCAL THUMBNAIL: Успішно завантажено в Storage:', publicUrl);
      
      return publicUrl;

    } catch (error) {
      console.error('❌ LOCAL THUMBNAIL: Критична помилка завантаження в Storage:', error);
      return null;
    }
  }

  async uploadAllToStorage(lessonId: string, slideIds: string[]): Promise<Record<string, string>> {
    console.log('☁️ LOCAL THUMBNAIL: Завантаження всіх thumbnail\'ів в Storage для уроку:', lessonId);
    console.log('📋 LOCAL THUMBNAIL: Слайди для завантаження:', slideIds);

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
      
      console.log('📊 LOCAL THUMBNAIL: Результати завантаження:', {
        total: slideIds.length,
        successful: Object.keys(results).length,
        failed: slideIds.length - Object.keys(results).length,
        results: uploadResults
      });

      return results;
    } catch (error) {
      console.error('❌ LOCAL THUMBNAIL: Помилка масового завантаження:', error);
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