import { NextRequest, NextResponse } from 'next/server';
import { 
  WorksheetEditRequest, 
  WorksheetEditResponse,
} from '@/types/worksheet-generation';
import { geminiWorksheetEditingService } from '@/services/worksheet/GeminiWorksheetEditingService';
import { CanvasElement } from '@/types/canvas-element';
import { 
  generateImages,
  type ImageGenerationRequest,
  type ImageGenerationResult
} from '@/services/worksheet/ImageGenerationHelper';
import { InteractiveImageExtractor } from '@/services/worksheet/InteractiveImageExtractor';
import { createClient } from '@/lib/supabase/server';

/**
 * Collect image generation requests from patched elements
 */
function collectImageRequests(patch: any, targetType: 'component' | 'page'): ImageGenerationRequest[] {
  const requests: ImageGenerationRequest[] = [];
  const interactiveExtractor = new InteractiveImageExtractor();

  if (targetType === 'component') {
    // Single component edit
    const properties = patch.properties;
    
    // Check for image-placeholder with imagePrompt
    if (properties?.imagePrompt && !properties.url) {
      requests.push({
        id: 'component',
        prompt: properties.imagePrompt,
        width: properties.width || 512,
        height: properties.height || 512,
      });
    }
    
    // Check for interactive component with nested imagePrompts
    // Note: For single component edits, we create a temporary element structure
    if (patch.type && interactiveExtractor.isInteractiveComponent(patch.type)) {
      const tempElement: CanvasElement = {
        id: 'temp',
        type: patch.type,
        properties: patch.properties || {},
        zIndex: 0,
      };
      
      const interactiveRequests = interactiveExtractor.extractFromElement(tempElement, 0, 0);
      interactiveRequests.forEach(req => {
        requests.push({
          id: req.id,
          prompt: req.prompt,
          width: req.width,
          height: req.height,
        });
      });
    }
  } else if (targetType === 'page') {
    // Page edit - check all elements
    const elements = patch.elements as CanvasElement[] | undefined;
    if (elements && Array.isArray(elements)) {
      elements.forEach((element, index) => {
        // 1. Check image-placeholder components
        if (element.type === 'image-placeholder' && 
            element.properties?.imagePrompt && 
            !element.properties.url) {
          requests.push({
            id: `element-${index}-${element.id}`,
            prompt: element.properties.imagePrompt,
            width: element.properties.width || 512,
            height: element.properties.height || 512,
          });
        }
        
        // 2. Check interactive components
        if (interactiveExtractor.isInteractiveComponent(element.type)) {
          const interactiveRequests = interactiveExtractor.extractFromElement(element, 0, index);
          interactiveRequests.forEach(req => {
            requests.push({
              id: req.id,
              prompt: req.prompt,
              width: req.width,
              height: req.height,
            });
          });
        }
      });
    }
  }

  return requests;
}

/**
 * Apply generated images to patch
 */
function applyGeneratedImages(
  patch: any,
  targetType: 'component' | 'page',
  results: ImageGenerationResult[]
): any {
  if (results.length === 0) {
    return patch;
  }

  const updatedPatch = { ...patch };
  const interactiveExtractor = new InteractiveImageExtractor();

  if (targetType === 'component') {
    // Build image map for interactive components
    const imageMap = new Map<string, string>();
    let hasImagePlaceholder = false;
    
    results.forEach(result => {
      if (result.success && result.image) {
        const imageUrl = `data:image/png;base64,${result.image}`;
        if (result.id === 'component') {
          hasImagePlaceholder = true;
          updatedPatch.properties = {
            ...updatedPatch.properties,
            url: imageUrl,
          };
          console.log('✅ Image generated for image-placeholder component');
        } else {
          // Interactive component image
          imageMap.set(result.id!, imageUrl);
        }
      } else {
        console.warn('⚠️ Image generation failed for component:', result.error);
      }
    });
    
    // Apply interactive images if any
    if (imageMap.size > 0 && patch.type && interactiveExtractor.isInteractiveComponent(patch.type)) {
      const tempElement: CanvasElement = {
        id: 'temp',
        type: patch.type,
        properties: updatedPatch.properties || {},
        zIndex: 0,
      };
      
      const updatedElement = interactiveExtractor.applyGeneratedImages(tempElement, imageMap);
      updatedPatch.properties = updatedElement.properties;
      console.log(`✅ Applied ${imageMap.size} images to interactive component`);
    }
  } else if (targetType === 'page') {
    // Page edit - map results back to elements
    const elements = [...(updatedPatch.elements || [])];
    const imageMap = new Map<string, string>();
    
    results.forEach(result => {
      if (result.id && result.success && result.image) {
        const imageUrl = `data:image/png;base64,${result.image}`;
        
        // Check if this is an image-placeholder element
        const match = result.id.match(/^element-(\d+)-/);
        if (match) {
          const index = parseInt(match[1], 10);
          if (elements[index] && elements[index].type === 'image-placeholder') {
            elements[index] = {
              ...elements[index],
              properties: {
                ...elements[index].properties,
                url: imageUrl,
              },
            };
            console.log(`✅ Image generated for image-placeholder element ${index}`);
          }
        } else {
          // Interactive component image - store for batch application
          imageMap.set(result.id, imageUrl);
        }
      } else if (result.id) {
        console.warn(`⚠️ Image generation failed for ${result.id}:`, result.error);
      }
    });
    
    // Apply interactive images
    if (imageMap.size > 0) {
      elements.forEach((element, index) => {
        if (interactiveExtractor.isInteractiveComponent(element.type)) {
          elements[index] = interactiveExtractor.applyGeneratedImages(element, imageMap);
        }
      });
      console.log(`✅ Applied ${imageMap.size} images to interactive components`);
    }

    updatedPatch.elements = elements;
  }

  return updatedPatch;
}

/**
 * POST /api/worksheet/edit
 * Edit worksheet component or page using AI with automatic image generation
 */
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`[${requestId}] 🎯 Worksheet edit request received`);
  
  try {
    // Get user for token tracking
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Parse request body
    const body: WorksheetEditRequest = await request.json();
    
    console.log(`[${requestId}] 📝 Edit target:`, {
      type: body.editTarget.type,
      pageId: body.editTarget.pageId,
      elementId: body.editTarget.elementId,
      instruction: body.instruction.substring(0, 100)
    });
    
    // Validate request
    if (!body.editTarget || !body.instruction || !body.context) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: editTarget, instruction, or context',
          patch: {},
          changes: []
        } as WorksheetEditResponse,
        { status: 400 }
      );
    }
    
    console.log(`[${requestId}] 🤖 Calling Gemini service...`);
    
    // Add userId to context for token tracking
    const contextWithUserId = {
      ...body.context,
      userId: user?.id
    };
    
    // STEP 1: Use Gemini service to edit worksheet
    const result = await geminiWorksheetEditingService.editWorksheet(
      body.editTarget,
      body.instruction,
      contextWithUserId
    );
    
    console.log(`[${requestId}] ✅ Edit completed successfully`);
    console.log(`[${requestId}] 📊 Changes:`, {
      patchKeys: Object.keys(result.patch),
      changesCount: result.changes.length,
      hasImagePrompt: !!result.imagePrompt
    });

    // STEP 2: Check for new images that need generation
    const imageRequests = collectImageRequests(result.patch, body.editTarget.type);
    
    if (imageRequests.length > 0) {
      console.log(`[${requestId}] 🎨 Found ${imageRequests.length} new images to generate`);
      
      // STEP 3: Generate images using helper (server-side, no fetch needed)
      const imageResults = await generateImages(imageRequests);
      
      // STEP 4: Apply generated images to patch
      result.patch = applyGeneratedImages(result.patch, body.editTarget.type, imageResults);
      
      const successCount = imageResults.filter(r => r.success).length;
      console.log(`[${requestId}] ✅ Generated ${successCount}/${imageRequests.length} images successfully`);
    } else {
      console.log(`[${requestId}] ℹ️ No new images to generate`);
    }
    
    // Return successful response
    const editResponse: WorksheetEditResponse = {
      success: true,
      patch: result.patch,
      changes: result.changes
    };
    
    return NextResponse.json(editResponse);
    
  } catch (error) {
    console.error(`[${requestId}] ❌ Worksheet edit error:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        patch: {},
        changes: []
      } as WorksheetEditResponse,
      { status: 500 }
    );
  }
}
