import { NextRequest, NextResponse } from 'next/server';
import { 
  WorksheetEditRequest, 
  WorksheetEditResponse,
} from '@/types/worksheet-generation';
import { geminiWorksheetEditingService } from '@/services/worksheet/GeminiWorksheetEditingService';

/**
 * POST /api/worksheet/edit
 * Edit worksheet component or page using AI
 */
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`[${requestId}] 🎯 Worksheet edit request received`);
  
  try {
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
    
    // Use Gemini service to edit worksheet
    const result = await geminiWorksheetEditingService.editWorksheet(
      body.editTarget,
      body.instruction,
      body.context
    );
    
    console.log(`[${requestId}] ✅ Edit completed successfully`);
    console.log(`[${requestId}] 📊 Changes:`, {
      patchKeys: Object.keys(result.patch),
      changesCount: result.changes.length,
      hasImagePrompt: !!result.imagePrompt
    });
    
    // Return successful response
    const editResponse: WorksheetEditResponse = {
      success: true,
      patch: result.patch,
      changes: result.changes
    };
    
    // Add imagePrompt to response if present (for image components)
    if (result.imagePrompt) {
      console.log(`[${requestId}] 🎨 Returning new image prompt for client-side generation`);
      (editResponse as any).imagePrompt = result.imagePrompt;
    }
    
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
