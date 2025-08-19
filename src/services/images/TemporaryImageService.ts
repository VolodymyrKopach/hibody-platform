import { createClient } from '@/lib/supabase/client';

export interface TemporaryImageInfo {
  tempUrl: string;
  fileName: string;
  filePath: string;
  prompt: string;
  width: number;
  height: number;
  sessionId: string;
}

export interface ImageMigrationResult {
  permanentUrl: string;
  tempUrl: string;
  success: boolean;
  error?: string;
}

export class TemporaryImageService {
  private supabase = createClient();
  private sessionId: string;

  constructor(sessionId?: string) {
    this.sessionId = sessionId || this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Зберігає Base64 зображення в тимчасовий bucket
   */
  async uploadTemporaryImage(
    base64Image: string,
    prompt: string,
    width: number,
    height: number,
    imageIndex: number
  ): Promise<TemporaryImageInfo | null> {
    try {
      // 1. Отримуємо користувача
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ User not authenticated for temp image upload');
        return null;
      }

      // 2. Конвертуємо Base64 в buffer
      const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // 3. Генеруємо шлях файлу
      const fileName = `img_${imageIndex}_${Date.now()}.webp`;
      const filePath = `temp/${user.id}/${this.sessionId}/${fileName}`;

      console.log(`📤 Uploading temporary image: ${filePath}`);

      // 4. Завантажуємо в тимчасовий bucket
      const { data, error } = await this.supabase.storage
        .from('temp-images')
        .upload(filePath, buffer, {
          contentType: 'image/webp',
          upsert: true
        });

      if (error) {
        console.error('❌ Temp image upload error:', error);
        return null;
      }

      // 5. Отримуємо публічний URL
      const { data: urlData } = this.supabase.storage
        .from('temp-images')
        .getPublicUrl(filePath);

      const tempUrl = urlData.publicUrl;
      console.log(`✅ Temporary image uploaded: ${tempUrl}`);

      return {
        tempUrl,
        fileName,
        filePath,
        prompt,
        width,
        height,
        sessionId: this.sessionId
      };

    } catch (error) {
      console.error('💥 Error uploading temporary image:', error);
      return null;
    }
  }

  /**
   * Переміщує тимчасові зображення в постійний bucket при збереженні уроку
   */
  async migrateToPermament(
    tempImages: TemporaryImageInfo[],
    lessonId: string
  ): Promise<ImageMigrationResult[]> {
    const results: ImageMigrationResult[] = [];

    console.log(`🔄 Migrating ${tempImages.length} images to permanent storage for lesson: ${lessonId}`);

    for (let i = 0; i < tempImages.length; i++) {
      const tempImage = tempImages[i];
      
      try {
        // 1. Завантажуємо файл з тимчасового bucket'а
        const { data: fileData, error: downloadError } = await this.supabase.storage
          .from('temp-images')
          .download(tempImage.filePath);

        if (downloadError || !fileData) {
          console.error(`❌ Failed to download temp image: ${tempImage.filePath}`, downloadError);
          results.push({
            tempUrl: tempImage.tempUrl,
            permanentUrl: '',
            success: false,
            error: `Download failed: ${downloadError?.message}`
          });
          continue;
        }

        // 2. Генеруємо новий шлях для постійного зберігання
        const permanentFileName = `slide-${i + 1}-${Date.now()}.webp`;
        const permanentFilePath = `lessons/${lessonId}/${permanentFileName}`;

        // 3. Завантажуємо в постійний bucket
        const { data: uploadData, error: uploadError } = await this.supabase.storage
          .from('lesson-assets')
          .upload(permanentFilePath, fileData, {
            contentType: 'image/webp',
            upsert: true
          });

        if (uploadError) {
          console.error(`❌ Failed to upload to permanent storage: ${permanentFilePath}`, uploadError);
          results.push({
            tempUrl: tempImage.tempUrl,
            permanentUrl: '',
            success: false,
            error: `Upload failed: ${uploadError.message}`
          });
          continue;
        }

        // 4. Отримуємо публічний URL постійного файлу
        const { data: urlData } = this.supabase.storage
          .from('lesson-assets')
          .getPublicUrl(permanentFilePath);

        const permanentUrl = urlData.publicUrl;

        console.log(`✅ Image migrated: ${tempImage.tempUrl} → ${permanentUrl}`);

        results.push({
          tempUrl: tempImage.tempUrl,
          permanentUrl,
          success: true
        });

        // 5. Видаляємо тимчасовий файл (опціонально)
        await this.supabase.storage
          .from('temp-images')
          .remove([tempImage.filePath]);

      } catch (error) {
        console.error(`💥 Error migrating image ${tempImage.filePath}:`, error);
        results.push({
          tempUrl: tempImage.tempUrl,
          permanentUrl: '',
          success: false,
          error: `Migration error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    console.log(`🎯 Migration complete: ${successful}/${tempImages.length} images migrated`);

    return results;
  }

  /**
   * Очищує всі тимчасові файли для поточної сесії
   */
  async cleanupSession(): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return false;

      const sessionPath = `temp/${user.id}/${this.sessionId}`;
      
      // Отримуємо список файлів сесії
      const { data: files, error: listError } = await this.supabase.storage
        .from('temp-images')
        .list(`temp/${user.id}/${this.sessionId}`, {
          limit: 100
        });

      if (listError || !files || files.length === 0) {
        console.log(`📝 No temp files to cleanup for session: ${this.sessionId}`);
        return true;
      }

      // Видаляємо всі файли сесії
      const filePaths = files.map(file => `${sessionPath}/${file.name}`);
      const { error: deleteError } = await this.supabase.storage
        .from('temp-images')
        .remove(filePaths);

      if (deleteError) {
        console.error('❌ Error cleaning up temp files:', deleteError);
        return false;
      }

      console.log(`✅ Cleaned up ${files.length} temp files for session: ${this.sessionId}`);
      return true;

    } catch (error) {
      console.error('💥 Error during session cleanup:', error);
      return false;
    }
  }

  /**
   * Тестова функція для перевірки роботи сервісу
   */
  async testUpload(): Promise<boolean> {
    try {
      // Створюємо тестове Base64 зображення (1x1 pixel PNG)
      const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      console.log('🧪 Testing temporary image upload...');
      
      const result = await this.uploadTemporaryImage(
        testBase64,
        'Test image upload',
        1,
        1,
        0
      );

      if (result) {
        console.log('✅ Test upload successful:', result.tempUrl);
        
        // Тестуємо очищення
        await this.cleanupSession();
        
        return true;
      } else {
        console.error('❌ Test upload failed');
        return false;
      }

    } catch (error) {
      console.error('💥 Test upload error:', error);
      return false;
    }
  }
}
