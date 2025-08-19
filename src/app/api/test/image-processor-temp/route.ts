import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processSlideWithTempImages } from '@/utils/slideImageProcessorWithTempStorage';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing enhanced image processor with temporary storage...');

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated', details: authError?.message },
        { status: 401 }
      );
    }

    console.log(`👤 Testing with user: ${user.id}`);

    // Get test parameters from request body
    const body = await request.json().catch(() => ({}));
    const {
      useTemporaryStorage = true,
      fallbackToBase64 = true,
      testHtml = null
    } = body;

    // Create test HTML with image prompts if none provided
    const defaultTestHtml = `
      <div class="slide-content">
        <h1>Test Slide with Images</h1>
        <p>This is a test slide to verify temporary image storage.</p>
        
        <!-- IMAGE_PROMPT: "A cute cartoon cat playing with a ball of yarn" WIDTH: 400 HEIGHT: 300 -->
        
        <p>Here's some more content after the first image.</p>
        
        <!-- IMAGE_PROMPT: "A simple illustration of a house with a red roof" WIDTH: 320 HEIGHT: 240 -->
        
        <p>And here's the end of our test slide.</p>
      </div>
    `;

    const htmlToProcess = testHtml || defaultTestHtml;

    console.log('🔄 Processing test HTML with enhanced image processor...');
    console.log(`⚙️ Options: tempStorage=${useTemporaryStorage}, fallback=${fallbackToBase64}`);

    // Process the slide with temporary storage
    const startTime = Date.now();
    const result = await processSlideWithTempImages(
      htmlToProcess,
      undefined, // Let it generate its own session ID
      {
        useTemporaryStorage,
        fallbackToBase64
      }
    );
    const processingTime = Date.now() - startTime;

    console.log('✅ Processing completed');
    console.log(`⏱️ Processing time: ${processingTime}ms`);
    console.log(`📊 Results: ${result.generatedImages.length} images, ${result.temporaryImages.length} temp files, ${result.processingErrors.length} errors`);

    // Analyze results
    const successfulImages = result.generatedImages.filter(img => img.success).length;
    const tempStoredImages = result.generatedImages.filter(img => img.tempUrl).length;
    const base64FallbackImages = result.generatedImages.filter(img => img.success && !img.tempUrl && img.base64Image).length;
    
    // Calculate approximate response size reduction
    const base64Size = result.generatedImages
      .filter(img => img.base64Image)
      .reduce((total, img) => total + (img.base64Image?.length || 0), 0);
    
    const tempUrlSize = result.generatedImages
      .filter(img => img.tempUrl)
      .reduce((total, img) => total + (img.tempUrl?.length || 0), 0);

    const sizeSavings = base64Size > 0 ? Math.round((1 - tempUrlSize / base64Size) * 100) : 0;

    return NextResponse.json({
      success: true,
      message: 'Enhanced image processor test completed successfully',
      results: {
        sessionId: result.sessionId,
        processingTime: `${processingTime}ms`,
        images: {
          total: result.generatedImages.length,
          successful: successfulImages,
          tempStored: tempStoredImages,
          base64Fallback: base64FallbackImages,
          failed: result.generatedImages.length - successfulImages
        },
        temporaryFiles: {
          count: result.temporaryImages.length,
          files: result.temporaryImages.map(img => ({
            fileName: img.fileName,
            tempUrl: img.tempUrl,
            prompt: img.prompt.substring(0, 50) + '...',
            dimensions: `${img.width}x${img.height}`
          }))
        },
        performance: {
          sizeSavings: `${sizeSavings}%`,
          base64Size: `${Math.round(base64Size / 1024)}KB`,
          tempUrlSize: `${Math.round(tempUrlSize / 1024)}KB`
        },
        errors: result.processingErrors,
        options: {
          useTemporaryStorage,
          fallbackToBase64
        }
      },
      // Include processed HTML for inspection (truncated for readability)
      processedHtml: result.htmlWithImages.length > 2000 
        ? result.htmlWithImages.substring(0, 2000) + '...[truncated]'
        : result.htmlWithImages,
      userId: user.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Enhanced image processor test error:', error);
    
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Enhanced image processor test endpoint',
    description: 'Tests the new image processor with temporary storage support',
    usage: {
      method: 'POST',
      body: {
        useTemporaryStorage: 'boolean (default: true) - Whether to use temporary storage',
        fallbackToBase64: 'boolean (default: true) - Whether to fallback to Base64 if temp storage fails',
        testHtml: 'string (optional) - Custom HTML to process, uses default test HTML if not provided'
      }
    },
    endpoints: {
      test: 'POST /api/test/image-processor-temp',
      basicTempStorage: 'POST /api/test/temp-storage'
    }
  });
}
