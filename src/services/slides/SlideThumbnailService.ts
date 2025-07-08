import { generateSlideThumbnail, generateFallbackPreview } from '@/utils/slidePreview';
import { SlideService } from '@/services/database/SlideService';

export interface IThumbnailGenerator {
  generateThumbnail(htmlContent: string, options?: ThumbnailOptions): Promise<string>;
}

export interface IThumbnailCache {
  get(slideId: string): string | null;
  set(slideId: string, thumbnailUrl: string): void;
  has(slideId: string): boolean;
  delete(slideId: string): void;
}

export interface IThumbnailPersistence {
  saveThumbnail(slideId: string, thumbnailUrl: string): Promise<void>;
  getThumbnail(slideId: string): Promise<string | null>;
}

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  background?: string;
}

// Основний генератор превью
export class DefaultThumbnailGenerator implements IThumbnailGenerator {
  async generateThumbnail(htmlContent: string, options: ThumbnailOptions = {}): Promise<string> {
    const defaultOptions = {
      width: 640,
      height: 480,
      quality: 0.85,
      background: '#ffffff',
      ...options
    };

    try {
      console.log('🎨 THUMBNAIL: Generating thumbnail with options:', defaultOptions);
      const thumbnailUrl = await generateSlideThumbnail(htmlContent, defaultOptions);
      console.log('✅ THUMBNAIL: Successfully generated thumbnail', {
        size: Math.round(thumbnailUrl.length / 1024) + 'KB'
      });
      return thumbnailUrl;
    } catch (error) {
      console.warn('⚠️ THUMBNAIL: Main generation failed, creating fallback:', error);
      return generateFallbackPreview();
    }
  }
}

// Кеш превью в пам'яті
export class MemoryThumbnailCache implements IThumbnailCache {
  private cache = new Map<string, string>();

  get(slideId: string): string | null {
    return this.cache.get(slideId) || null;
  }

  set(slideId: string, thumbnailUrl: string): void {
    this.cache.set(slideId, thumbnailUrl);
  }

  has(slideId: string): boolean {
    return this.cache.has(slideId);
  }

  delete(slideId: string): void {
    this.cache.delete(slideId);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Збереження превью в базу даних
export class DatabaseThumbnailPersistence implements IThumbnailPersistence {
  constructor(private slideService: SlideService) {}

  async saveThumbnail(slideId: string, thumbnailUrl: string): Promise<void> {
    console.log('💾 THUMBNAIL: Saving thumbnail to database for slide:', slideId);
    await this.slideService.updateSlide(slideId, { thumbnail_url: thumbnailUrl });
    console.log('✅ THUMBNAIL: Thumbnail saved to database');
  }

  async getThumbnail(slideId: string): Promise<string | null> {
    try {
      const slide = await this.slideService.getSlideById(slideId);
      return slide?.thumbnail_url || null;
    } catch (error) {
      console.warn('⚠️ THUMBNAIL: Failed to get thumbnail from database:', error);
      return null;
    }
  }
}

// Основний сервіс для роботи з превью слайдів
export class SlideThumbnailService {
  private generationInProgress = new Set<string>();

  constructor(
    private generator: IThumbnailGenerator,
    private cache: IThumbnailCache,
    private persistence: IThumbnailPersistence
  ) {}

  /**
   * Отримати превью слайду (з кешу, бази даних або згенерувати нове)
   */
  async getThumbnail(slideId: string, htmlContent?: string): Promise<string | null> {
    console.log('🔍 THUMBNAIL: Getting thumbnail for slide:', slideId);

    // 1. Перевіряємо кеш у пам'яті
    if (this.cache.has(slideId)) {
      const cachedThumbnail = this.cache.get(slideId);
      console.log('⚡ THUMBNAIL: Found in memory cache');
      return cachedThumbnail;
    }

    // 2. Перевіряємо базу даних
    try {
      const dbThumbnail = await this.persistence.getThumbnail(slideId);
      if (dbThumbnail) {
        console.log('💾 THUMBNAIL: Found in database, caching in memory');
        this.cache.set(slideId, dbThumbnail);
        return dbThumbnail;
      }
    } catch (error) {
      console.warn('⚠️ THUMBNAIL: Database lookup failed:', error);
    }

    // 3. Якщо немає HTML контенту, не можемо згенерувати
    if (!htmlContent) {
      console.log('❌ THUMBNAIL: No HTML content provided, cannot generate');
      return null;
    }

    // 4. Генеруємо нове превью
    return this.generateAndSaveThumbnail(slideId, htmlContent);
  }

  /**
   * Згенерувати нове превью для слайду (форсовано)
   */
  async generateThumbnail(slideId: string, htmlContent: string, options?: ThumbnailOptions): Promise<string> {
    console.log('🔄 THUMBNAIL: Force generating new thumbnail for slide:', slideId);
    
    // Очищуємо кеш для цього слайду
    this.cache.delete(slideId);
    
    return this.generateAndSaveThumbnail(slideId, htmlContent, options);
  }

  /**
   * Приватний метод для генерації та збереження превью
   */
  private async generateAndSaveThumbnail(slideId: string, htmlContent: string, options?: ThumbnailOptions): Promise<string> {
    // Перевіряємо чи вже генерується превью для цього слайду
    if (this.generationInProgress.has(slideId)) {
      console.log('⏳ THUMBNAIL: Generation already in progress for slide:', slideId);
      // Повертаємо fallback превью поки генерується основне
      return generateFallbackPreview();
    }

    this.generationInProgress.add(slideId);

    try {
      // Генеруємо превью
      const thumbnailUrl = await this.generator.generateThumbnail(htmlContent, options);

      // Кешуємо в пам'яті
      this.cache.set(slideId, thumbnailUrl);

      // Зберігаємо в базу даних асинхронно (не блокуємо UI)
      this.persistence.saveThumbnail(slideId, thumbnailUrl).catch(error => {
        console.error('❌ THUMBNAIL: Failed to save to database:', error);
      });

      return thumbnailUrl;
    } finally {
      this.generationInProgress.delete(slideId);
    }
  }

  /**
   * Перевірити чи існує превью для слайду
   */
  async hasThumbnail(slideId: string): Promise<boolean> {
    if (this.cache.has(slideId)) {
      return true;
    }

    try {
      const dbThumbnail = await this.persistence.getThumbnail(slideId);
      return !!dbThumbnail;
    } catch {
      return false;
    }
  }

  /**
   * Видалити превью слайду
   */
  async deleteThumbnail(slideId: string): Promise<void> {
    console.log('🗑️ THUMBNAIL: Deleting thumbnail for slide:', slideId);
    
    // Видаляємо з кешу
    this.cache.delete(slideId);

    // Видаляємо з бази даних
    try {
      await this.persistence.saveThumbnail(slideId, '');
    } catch (error) {
      console.warn('⚠️ THUMBNAIL: Failed to delete from database:', error);
    }
  }

  /**
   * Очистити весь кеш превью
   */
  clearCache(): void {
    console.log('🧹 THUMBNAIL: Clearing all cached thumbnails');
    this.cache.clear?.();
  }
}

// Factory для створення SlideThumbnailService з default implementations
export function createSlideThumbnailService(slideService?: SlideService): SlideThumbnailService {
  const generator = new DefaultThumbnailGenerator();
  const cache = new MemoryThumbnailCache();
  const persistence = new DatabaseThumbnailPersistence(slideService || new SlideService());

  return new SlideThumbnailService(generator, cache, persistence);
}

// Singleton instance для використання по всьому додатку
let thumbnailServiceInstance: SlideThumbnailService | null = null;

export function getSlideThumbnailService(): SlideThumbnailService {
  if (!thumbnailServiceInstance) {
    thumbnailServiceInstance = createSlideThumbnailService();
  }
  return thumbnailServiceInstance;
} 