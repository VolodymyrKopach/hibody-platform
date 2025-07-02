import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { imageData, lessonId, slideId, type = 'preview' } = await request.json();

    if (!imageData || !lessonId || !slideId) {
      return NextResponse.json(
        { error: 'Missing required fields: imageData, lessonId, slideId' },
        { status: 400 }
      );
    }

    // Перевіряємо що imageData є base64 зображенням
    if (!imageData.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image data format. Expected base64 data URL' },
        { status: 400 }
      );
    }

    // Витягуємо base64 дані без префіксу
    const base64Data = imageData.split(',')[1];
    if (!base64Data) {
      return NextResponse.json(
        { error: 'Invalid base64 data' },
        { status: 400 }
      );
    }

    // Створюємо буфер з base64 даних
    const buffer = Buffer.from(base64Data, 'base64');

    // Створюємо директорії якщо не існують
    const publicDir = join(process.cwd(), 'public');
    const imagesDir = join(publicDir, 'images');
    const lessonsDir = join(imagesDir, 'lessons');
    const lessonDir = join(lessonsDir, lessonId);
    const previewsDir = join(lessonDir, 'previews');

    // Створюємо директорії рекурсивно
    if (!existsSync(previewsDir)) {
      await mkdir(previewsDir, { recursive: true });
    }

    // Генеруємо ім'я файлу
    const timestamp = Date.now();
    const fileName = `${slideId}-${type}-${timestamp}.png`;
    const filePath = join(previewsDir, fileName);

    // Зберігаємо файл
    await writeFile(filePath, buffer);

    // Генеруємо публічний URL
    const publicUrl = `/images/lessons/${lessonId}/previews/${fileName}`;

    console.log(`✅ Preview saved: ${publicUrl}`);

    return NextResponse.json({
      success: true,
      imagePath: publicUrl,
      fileName,
      fileSize: buffer.length
    });

  } catch (error) {
    console.error('Error saving preview image:', error);
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

    // Шлях до директорії превью уроку
    const previewsDir = join(process.cwd(), 'public', 'images', 'lessons', lessonId, 'previews');

    // Перевіряємо чи існує директорія
    if (!existsSync(previewsDir)) {
      return NextResponse.json({
        success: true,
        previews: []
      });
    }

    // Тут можна додати логіку для читання файлів з директорії
    // і повернення списку доступних превью

    return NextResponse.json({
      success: true,
      message: 'Preview endpoint is working',
      previewsDir
    });

  } catch (error) {
    console.error('Error retrieving previews:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve previews' },
      { status: 500 }
    );
  }
} 