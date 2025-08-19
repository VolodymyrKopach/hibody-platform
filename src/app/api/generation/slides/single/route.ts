import { NextRequest, NextResponse } from 'next/server';
import { SlideGenerationService } from '@/services/chat/services/SlideGenerationService';
import { SimpleSlide } from '@/types/chat';
import { createClient } from '@/lib/supabase/server';

interface SingleSlideGenerationRequest {
  title: string;
  description: string;
  topic: string;
  age: string;
  sessionId?: string;
}

interface SingleSlideGenerationResponse {
  success: boolean;
  slide?: SimpleSlide;
  error?: string;
  details?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, topic, age, sessionId }: SingleSlideGenerationRequest = await request.json();

    console.log('🎨 SINGLE SLIDE API: Starting single slide generation...');
    console.log('📋 SINGLE SLIDE API: Request details:', {
      title,
      description: description?.substring(0, 100) + '...',
      topic,
      age,
      sessionId
    });

    // Validate required fields
    if (!title || !description || !topic || !age) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          details: 'title, description, topic, and age are required'
        },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Gemini API key not configured' 
        },
        { status: 500 }
      );
    }

    // Get authenticated Supabase client for temporary storage
    const supabase = await createClient();
    
    // Create slide generation service
    const slideGenerationService = new SlideGenerationService();
    
    try {
      console.log('🎯 SINGLE SLIDE API: Generating slide with AI...');
      
      // Generate the single slide
      const generatedSlide = await slideGenerationService.generateSlide(
        description,
        title,
        topic,
        age,
        supabase
      );

      console.log('✅ SINGLE SLIDE API: Successfully generated slide:', {
        id: generatedSlide.id,
        title: generatedSlide.title,
        status: generatedSlide.status
      });

      const response: SingleSlideGenerationResponse = {
        success: true,
        slide: generatedSlide
      };

      return NextResponse.json(response);

    } catch (generationError) {
      console.error('❌ SINGLE SLIDE API: Error during slide generation:', generationError);
      
      const response: SingleSlideGenerationResponse = {
        success: false,
        error: 'Failed to generate slide',
        details: generationError instanceof Error ? generationError.message : 'Unknown error'
      };

      return NextResponse.json(response, { status: 500 });
    }

  } catch (error) {
    console.error('❌ SINGLE SLIDE API: Request error:', error);
    
    const response: SingleSlideGenerationResponse = {
      success: false,
      error: 'Invalid request',
      details: error instanceof Error ? error.message : 'Unknown error'
    };

    return NextResponse.json(response, { status: 400 });
  }
}

// GET endpoint to check service status
export async function GET() {
  return NextResponse.json({
    service: 'Single Slide Generation API',
    status: 'active',
    version: '1.0.0',
    endpoints: {
      POST: 'Generate a single slide from title and description'
    },
    requiredFields: ['title', 'description', 'topic', 'age'],
    optionalFields: ['sessionId']
  });
}