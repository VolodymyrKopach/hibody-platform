/**
 * API Route: POST /api/worksheet/generate
 * Generates worksheet using AI based on topic and age group
 */

import { NextRequest, NextResponse } from 'next/server';
import { geminiWorksheetGenerationService } from '@/services/worksheet/GeminiWorksheetGenerationService';
import { worksheetGenerationParser } from '@/services/worksheet/WorksheetGenerationParser';
import { WorksheetGenerationRequest } from '@/types/worksheet-generation';

export async function POST(request: NextRequest) {
  console.log('📝 [API] Worksheet generation request received');

  try {
    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.topic || typeof body.topic !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid "topic" field' },
        { status: 400 }
      );
    }

    if (!body.ageGroup || typeof body.ageGroup !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid "ageGroup" field' },
        { status: 400 }
      );
    }

    // Build generation request (AUTO-PAGINATION - no pageCount needed)
    const generationRequest: WorksheetGenerationRequest = {
      topic: body.topic,
      ageGroup: body.ageGroup,
      exerciseTypes: body.exerciseTypes || [],
      difficulty: body.difficulty || 'medium',
      language: body.language || 'en',
      duration: body.duration || 'standard', // Duration affects content amount, not page count
      includeImages: body.includeImages !== false, // Default true
      additionalInstructions: body.additionalInstructions || '',
    };

    console.log('🎯 [API] Generation request:', generationRequest);

    // Generate worksheet with AI
    const aiResponse = await geminiWorksheetGenerationService.generateWorksheet(
      generationRequest,
      {
        temperature: body.temperature || 0.7,
        maxTokens: body.maxTokens || 32000, // Increased from 8000 to allow longer responses
      }
    );

    console.log('✅ [API] AI generation completed:', {
      pages: aiResponse.pages.length,
      components: aiResponse.metadata.componentsUsed,
    });

    // Parse to full worksheet with CanvasElements
    const parsedWorksheet = worksheetGenerationParser.parseWorksheet(aiResponse);

    // Validate worksheet
    const validation = worksheetGenerationParser.validateWorksheet(parsedWorksheet);

    if (!validation.isValid) {
      console.error('❌ [API] Worksheet validation failed:', validation.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Generated worksheet is invalid',
          details: validation.errors,
        },
        { status: 500 }
      );
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn('⚠️ [API] Worksheet validation warnings:', validation.warnings);
    }

    console.log('✅ [API] Worksheet generation successful:', {
      pages: parsedWorksheet.pages.length,
      totalElements: parsedWorksheet.pages.reduce((sum, p) => sum + p.elements.length, 0),
      estimatedDuration: parsedWorksheet.metadata.estimatedDuration,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        worksheet: parsedWorksheet,
        validation: {
          isValid: true,
          warnings: validation.warnings,
        },
      },
    });
  } catch (error) {
    console.error('❌ [API] Worksheet generation failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

