import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📸 PREVIEW API: POST request received');
    const { imageData, lessonId, slideId, type = 'preview' } = await request.json();
    
    console.log('📋 PREVIEW API: Request data:', {
      lessonId,
      slideId,
      type,
      hasImageData: !!imageData,
      imageDataSize: imageData ? Math.round(imageData.length / 1024) + 'KB' : 'N/A',
      imageDataType: imageData ? (imageData.startsWith('data:image/') ? 'base64' : 'unknown') : 'missing'
    });

    if (!imageData || !lessonId || !slideId) {
      console.error('❌ PREVIEW API: Missing required fields:', {
        hasImageData: !!imageData,
        hasLessonId: !!lessonId,
        hasSlideId: !!slideId
      });
      return NextResponse.json(
        { error: 'Missing required fields: imageData, lessonId, slideId' },
        { status: 400 }
      );
    }

    // Перевіряємо що imageData є base64 зображенням
    if (!imageData.startsWith('data:image/')) {
      console.error('❌ PREVIEW API: Invalid image data format:', imageData.substring(0, 50) + '...');
      return NextResponse.json(
        { error: 'Invalid image data format. Expected base64 data URL' },
        { status: 400 }
      );
    }

    console.log('✅ PREVIEW API: Image data validation passed');

    // Витягуємо base64 дані без префіксу
    const base64Data = imageData.split(',')[1];
    if (!base64Data) {
      console.error('❌ PREVIEW API: Invalid base64 data - no data after comma');
      return NextResponse.json(
        { error: 'Invalid base64 data' },
        { status: 400 }
      );
    }

    console.log('📏 PREVIEW API: Base64 data extracted, size:', Math.round(base64Data.length / 1024) + 'KB');

    // Створюємо буфер з base64 даних
    const buffer = Buffer.from(base64Data, 'base64');
    console.log('🗂️ PREVIEW API: Buffer created, size:', Math.round(buffer.length / 1024) + 'KB');

    // Ініціалізуємо Supabase клієнт
    const supabase = await createClient();
    
    // Перевіряємо авторизацію користувача
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ PREVIEW API: User not authenticated:', authError);
      return NextResponse.json(
        { error: 'Користувач не авторизований' },
        { status: 401 }
      );
    }

    console.log('👤 PREVIEW API: User authenticated:', user.id);

    // Генеруємо ім'я файлу для Supabase Storage
    const timestamp = Date.now();
    const fileName = `${slideId}-${type}-${timestamp}.png`;
    const filePath = `lesson-thumbnails/${lessonId}/${fileName}`;

    console.log('📤 PREVIEW API: Uploading to Supabase Storage:', {
      bucket: 'lesson-assets',
      filePath,
      fileName,
      fileSize: Math.round(buffer.length / 1024) + 'KB'
    });

    // Завантажуємо файл в Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lesson-assets')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: true // Перезаписуємо файл якщо існує
      });

    if (uploadError) {
      console.error('❌ PREVIEW API: Supabase Storage upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload to storage: ${uploadError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ PREVIEW API: File uploaded to storage:', uploadData.path);

    // Отримуємо публічний URL файлу
    const { data: urlData } = supabase.storage
      .from('lesson-assets')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      console.error('❌ PREVIEW API: Failed to get public URL');
      return NextResponse.json(
        { error: 'Failed to get public URL' },
        { status: 500 }
      );
    }

    const publicUrl = urlData.publicUrl;

    console.log('🎉 PREVIEW API: Preview saved successfully to Supabase Storage!');
    console.log('📤 PREVIEW API: Response data:', {
      publicUrl,
      fileName,
      fileSize: Math.round(buffer.length / 1024) + 'KB',
      storageUrl: uploadData.path
    });

    return NextResponse.json({
      success: true,
      imagePath: publicUrl,
      fileName,
      fileSize: buffer.length,
      storageUrl: uploadData.path
    });

  } catch (error) {
    console.error('❌ PREVIEW API: Error saving preview image:', error);
    return NextResponse.json(
      { error: 'Failed to save preview image' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Отримуємо параметри з URL
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json(
        { error: 'lessonId parameter is required' },
        { status: 400 }
      );
    }

    // Ініціалізуємо Supabase клієнт
    const supabase = await createClient();
    
    // Перевіряємо авторизацію користувача
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Користувач не авторизований' },
        { status: 401 }
      );
    }

    // Отримуємо список файлів з Supabase Storage
    const { data: files, error: listError } = await supabase.storage
      .from('lesson-assets')
      .list(`lesson-thumbnails/${lessonId}`, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (listError) {
      console.error('Error listing files from storage:', listError);
      return NextResponse.json(
        { error: 'Failed to retrieve previews' },
        { status: 500 }
      );
    }

    // Генеруємо публічні URL для файлів
    const previews = files?.map(file => {
      const filePath = `lesson-thumbnails/${lessonId}/${file.name}`;
      const { data: urlData } = supabase.storage
        .from('lesson-assets')
        .getPublicUrl(filePath);
      
      return {
        name: file.name,
        url: urlData.publicUrl,
        size: file.metadata?.size,
        created_at: file.created_at
      };
    }) || [];

    return NextResponse.json({
      success: true,
      previews,
      count: previews.length
    });

  } catch (error) {
    console.error('Error retrieving previews:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve previews' },
      { status: 500 }
    );
  }
} 