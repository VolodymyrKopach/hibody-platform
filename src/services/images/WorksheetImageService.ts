import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ImageUploadResult {
  url: string;
  fileName: string;
  filePath: string;
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

export class WorksheetImageService {
  private supabase: SupabaseClient;
  private maxFileSize: number = 5 * 1024 * 1024; // 5MB
  private allowedFormats: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || createClient();
  }

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
   * Uploads worksheet image to Supabase Storage
   */
  async uploadWorksheetImage(
    file: File,
    worksheetId?: string
  ): Promise<ImageUploadResult> {
    try {
      // 1. Validate image
      const validation = this.validateImage(file);
      if (!validation.valid) {
        return {
          url: '',
          fileName: file.name,
          filePath: '',
          size: file.size,
          success: false,
          error: validation.error
        };
      }

      // 2. Get authenticated user
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ User not authenticated for image upload');
        return {
          url: '',
          fileName: file.name,
          filePath: '',
          size: file.size,
          success: false,
          error: 'User authentication required for image upload'
        };
      }

      // 3. Get image dimensions
      const dimensions = await this.getImageDimensions(file);

      // 4. Generate file path
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 9);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .substring(0, 50);
      
      const fileName = `${timestamp}_${randomSuffix}_${sanitizedFileName}`;
      const basePath = worksheetId 
        ? `worksheets/${user.id}/${worksheetId}` 
        : `worksheets/${user.id}/temp`;
      const filePath = `${basePath}/${fileName}`;

      console.log(`📤 Uploading worksheet image: ${filePath}`);

      // 5. Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('worksheet-images')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
          cacheControl: '3600'
        });

      if (error) {
        console.error('❌ Image upload error:', error);
        return {
          url: '',
          fileName: file.name,
          filePath: '',
          size: file.size,
          success: false,
          error: `Upload failed: ${error.message}`
        };
      }

      // 6. Get public URL
      const { data: urlData } = this.supabase.storage
        .from('worksheet-images')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log(`✅ Worksheet image uploaded: ${publicUrl}`);

      return {
        url: publicUrl,
        fileName: file.name,
        filePath,
        size: file.size,
        width: dimensions?.width,
        height: dimensions?.height,
        success: true
      };

    } catch (error) {
      console.error('💥 Error uploading worksheet image:', error);
      return {
        url: '',
        fileName: file.name,
        filePath: '',
        size: file.size,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Uploads image from URL (for external images)
   */
  async uploadFromUrl(
    imageUrl: string,
    worksheetId?: string
  ): Promise<ImageUploadResult> {
    try {
      console.log(`📥 Downloading image from URL: ${imageUrl}`);

      // 1. Get authenticated user
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      if (authError || !user) {
        return {
          url: '',
          fileName: 'url-image',
          filePath: '',
          size: 0,
          success: false,
          error: 'User authentication required'
        };
      }

      // 2. Fetch image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return {
          url: '',
          fileName: 'url-image',
          filePath: '',
          size: 0,
          success: false,
          error: `Failed to fetch image: ${response.statusText}`
        };
      }

      // 3. Convert to blob
      const blob = await response.blob();
      const file = new File([blob], 'url-image.jpg', { type: blob.type });

      // 4. Upload using existing method
      return await this.uploadWorksheetImage(file, worksheetId);

    } catch (error) {
      console.error('💥 Error uploading from URL:', error);
      return {
        url: '',
        fileName: 'url-image',
        filePath: '',
        size: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Deletes worksheet image from storage
   */
  async deleteWorksheetImage(filePath: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from('worksheet-images')
        .remove([filePath]);

      if (error) {
        console.error('❌ Error deleting image:', error);
        return false;
      }

      console.log(`✅ Image deleted: ${filePath}`);
      return true;

    } catch (error) {
      console.error('💥 Error during image deletion:', error);
      return false;
    }
  }

  /**
   * Cleans up temporary worksheet images for user
   */
  async cleanupTempImages(userId: string): Promise<number> {
    try {
      const tempPath = `worksheets/${userId}/temp`;
      
      const { data: files, error: listError } = await this.supabase.storage
        .from('worksheet-images')
        .list(tempPath, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'asc' }
        });

      if (listError || !files || files.length === 0) {
        console.log(`📝 No temp images to cleanup for user: ${userId}`);
        return 0;
      }

      const filePaths = files.map(file => `${tempPath}/${file.name}`);
      const { error: deleteError } = await this.supabase.storage
        .from('worksheet-images')
        .remove(filePaths);

      if (deleteError) {
        console.error('❌ Error cleaning up temp images:', deleteError);
        return 0;
      }

      console.log(`✅ Cleaned up ${files.length} temp images for user: ${userId}`);
      return files.length;

    } catch (error) {
      console.error('💥 Error during temp cleanup:', error);
      return 0;
    }
  }

  /**
   * Moves image from temp to worksheet folder
   */
  async moveTempToWorksheet(
    tempFilePath: string,
    worksheetId: string
  ): Promise<ImageUploadResult> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return {
          url: '',
          fileName: '',
          filePath: '',
          size: 0,
          success: false,
          error: 'User not authenticated'
        };
      }

      // 1. Download from temp
      const { data: fileData, error: downloadError } = await this.supabase.storage
        .from('worksheet-images')
        .download(tempFilePath);

      if (downloadError || !fileData) {
        return {
          url: '',
          fileName: '',
          filePath: '',
          size: 0,
          success: false,
          error: `Failed to download temp image: ${downloadError?.message}`
        };
      }

      // 2. Generate new permanent path
      const fileName = tempFilePath.split('/').pop() || 'image.jpg';
      const newFilePath = `worksheets/${user.id}/${worksheetId}/${fileName}`;

      // 3. Upload to permanent location
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('worksheet-images')
        .upload(newFilePath, fileData, {
          contentType: fileData.type,
          upsert: true
        });

      if (uploadError) {
        return {
          url: '',
          fileName,
          filePath: '',
          size: 0,
          success: false,
          error: `Failed to move image: ${uploadError.message}`
        };
      }

      // 4. Get public URL
      const { data: urlData } = this.supabase.storage
        .from('worksheet-images')
        .getPublicUrl(newFilePath);

      // 5. Delete temp file
      await this.deleteWorksheetImage(tempFilePath);

      console.log(`✅ Image moved: ${tempFilePath} → ${newFilePath}`);

      return {
        url: urlData.publicUrl,
        fileName,
        filePath: newFilePath,
        size: fileData.size,
        success: true
      };

    } catch (error) {
      console.error('💥 Error moving image:', error);
      return {
        url: '',
        fileName: '',
        filePath: '',
        size: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const worksheetImageService = new WorksheetImageService();

