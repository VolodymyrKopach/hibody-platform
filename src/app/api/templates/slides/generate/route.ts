import { NextRequest, NextResponse } from 'next/server';
import { SlideGenerationService } from '@/services/chat/services/SlideGenerationService';
import { SimpleSlide } from '@/types/chat';
import { createClient } from '@/lib/supabase/server';

interface TemplateSlideGenerationRequest {
  slideNumber: number;
  title: string;
  description: string;
  type: 'introduction' | 'content' | 'activity' | 'summary';
  templateData: {
    topic: string;
    ageGroup: string;
    slideCount: number;
    hasAdditionalInfo: boolean;
    additionalInfo?: string;
  };
  sessionId?: string;
  language?: 'uk' | 'en';
  
  // Enhanced slide structure data
  slideStructure?: {
    goal?: string;
    duration?: string;
    interactiveElements?: string[];
    teacherNotes?: string;
    keyPoints?: string[];
    
    // Detailed structure from lesson plan
    structure?: {
      greeting?: {
        text: string;
        action?: string;
        tone?: string;
      };
      mainContent?: {
        text: string;
        keyPoints?: string[];
        visualElements?: string[];
      };
      interactions?: Array<{
        type: 'touch' | 'sound' | 'movement' | 'verbal' | 'visual';
        description: string;
        instruction: string;
        feedback?: string;
      }>;
      activities?: Array<{
        name: string;
        description: string;
        duration?: string;
        materials?: string[];
        expectedOutcome?: string;
      }>;
      teacherGuidance?: {
        preparation?: string[];
        delivery?: string[];
        adaptations?: string[];
        troubleshooting?: string[];
      };
    };
  };
}

interface TemplateSlideGenerationResponse {
  success: boolean;
  slide?: SimpleSlide;
  error?: string;
  details?: string;
  slideNumber?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      slideNumber, 
      title, 
      description, 
      type, 
      templateData, 
      sessionId,
      language,
      slideStructure 
    }: TemplateSlideGenerationRequest = await request.json();

    console.log(`🎨 TEMPLATE SLIDE API: Starting slide ${slideNumber} generation...`);
    console.log('📋 TEMPLATE SLIDE API: Request details:', {
      slideNumber,
      title,
      description: description?.substring(0, 100) + '...',
      type,
      topic: templateData.topic,
      ageGroup: templateData.ageGroup,
      sessionId,
      hasSlideStructure: !!slideStructure,
      structureKeys: slideStructure ? Object.keys(slideStructure) : []
    });

    // Validate required fields
    if (!slideNumber || !title || !description || !type || !templateData) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          details: 'slideNumber, title, description, type, and templateData are required',
          slideNumber
        },
        { status: 400 }
      );
    }

    if (!templateData.topic || !templateData.ageGroup) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid template data',
          details: 'templateData must include topic and ageGroup',
          slideNumber
        },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Gemini API key not configured',
          slideNumber
        },
        { status: 500 }
      );
    }

    // Get authenticated Supabase client for temporary storage
    const supabase = await createClient();
    
    // Create slide generation service
    const slideGenerationService = new SlideGenerationService();
    
    try {
      console.log(`🎯 TEMPLATE SLIDE API: Generating slide ${slideNumber} with AI...`);
      
      // Enhance description with template context and slide structure
      let enhancedDescription = `
${description}

Context:
- Topic: ${templateData.topic}
- Age Group: ${templateData.ageGroup}
- Slide Type: ${type}
- Slide ${slideNumber} of ${templateData.slideCount}
${templateData.hasAdditionalInfo && templateData.additionalInfo ? `- Additional Info: ${templateData.additionalInfo}` : ''}`;

      // Add structured slide information if available
      if (slideStructure) {
        enhancedDescription += '\n\nStructured Slide Information:';
        
        if (slideStructure.goal) {
          enhancedDescription += `\n- Goal: ${slideStructure.goal}`;
        }
        
        if (slideStructure.duration) {
          enhancedDescription += `\n- Duration: ${slideStructure.duration}`;
        }
        
        if (slideStructure.keyPoints && slideStructure.keyPoints.length > 0) {
          enhancedDescription += `\n- Key Points: ${slideStructure.keyPoints.join(', ')}`;
        }
        
        if (slideStructure.interactiveElements && slideStructure.interactiveElements.length > 0) {
          enhancedDescription += `\n- Interactive Elements: ${slideStructure.interactiveElements.join(', ')}`;
        }
        
        if (slideStructure.teacherNotes) {
          enhancedDescription += `\n- Teacher Notes: ${slideStructure.teacherNotes}`;
        }
        
        // Add detailed structure information
        if (slideStructure.structure) {
          enhancedDescription += '\n\nDetailed Structure:';
          
          if (slideStructure.structure.greeting) {
            enhancedDescription += `\n- Greeting: ${slideStructure.structure.greeting.text}`;
            if (slideStructure.structure.greeting.action) {
              enhancedDescription += ` (Action: ${slideStructure.structure.greeting.action})`;
            }
            if (slideStructure.structure.greeting.tone) {
              enhancedDescription += ` (Tone: ${slideStructure.structure.greeting.tone})`;
            }
          }
          
          if (slideStructure.structure.mainContent) {
            enhancedDescription += `\n- Main Content: ${slideStructure.structure.mainContent.text}`;
            if (slideStructure.structure.mainContent.keyPoints) {
              enhancedDescription += `\n  Key Points: ${slideStructure.structure.mainContent.keyPoints.join(', ')}`;
            }
            if (slideStructure.structure.mainContent.visualElements) {
              enhancedDescription += `\n  Visual Elements: ${slideStructure.structure.mainContent.visualElements.join(', ')}`;
            }
          }
          
          if (slideStructure.structure.interactions && slideStructure.structure.interactions.length > 0) {
            enhancedDescription += '\n- Interactions:';
            slideStructure.structure.interactions.forEach((interaction, index) => {
              enhancedDescription += `\n  ${index + 1}. ${interaction.description} (Type: ${interaction.type})`;
              enhancedDescription += `\n     Instruction: ${interaction.instruction}`;
              if (interaction.feedback) {
                enhancedDescription += `\n     Expected Feedback: ${interaction.feedback}`;
              }
            });
          }
          
          if (slideStructure.structure.activities && slideStructure.structure.activities.length > 0) {
            enhancedDescription += '\n- Activities:';
            slideStructure.structure.activities.forEach((activity, index) => {
              enhancedDescription += `\n  ${index + 1}. ${activity.name}: ${activity.description}`;
              if (activity.duration) {
                enhancedDescription += ` (Duration: ${activity.duration})`;
              }
              if (activity.materials && activity.materials.length > 0) {
                enhancedDescription += `\n     Materials: ${activity.materials.join(', ')}`;
              }
              if (activity.expectedOutcome) {
                enhancedDescription += `\n     Expected Outcome: ${activity.expectedOutcome}`;
              }
            });
          }
          
          if (slideStructure.structure.teacherGuidance) {
            enhancedDescription += '\n- Teacher Guidance:';
            if (slideStructure.structure.teacherGuidance.preparation) {
              enhancedDescription += `\n  Preparation: ${slideStructure.structure.teacherGuidance.preparation.join(', ')}`;
            }
            if (slideStructure.structure.teacherGuidance.delivery) {
              enhancedDescription += `\n  Delivery: ${slideStructure.structure.teacherGuidance.delivery.join(', ')}`;
            }
            if (slideStructure.structure.teacherGuidance.adaptations) {
              enhancedDescription += `\n  Adaptations: ${slideStructure.structure.teacherGuidance.adaptations.join(', ')}`;
            }
            if (slideStructure.structure.teacherGuidance.troubleshooting) {
              enhancedDescription += `\n  Troubleshooting: ${slideStructure.structure.teacherGuidance.troubleshooting.join(', ')}`;
            }
          }
        }
      }

      enhancedDescription += `\n\nPlease create educational content appropriate for ${templateData.ageGroup} year olds about ${templateData.topic}.`;
      enhancedDescription = enhancedDescription.trim();

      // Generate the slide using existing service with language support
      const generatedSlide = await slideGenerationService.generateSlideWithLanguage(
        enhancedDescription,
        title,
        templateData.topic,
        templateData.ageGroup,
        supabase,
        language || 'en'
      );

      // Use generated slide as-is
      const templateSlide: SimpleSlide = {
        ...generatedSlide
      };

      console.log(`✅ TEMPLATE SLIDE API: Successfully generated slide ${slideNumber}:`, {
        id: templateSlide.id,
        title: templateSlide.title,
        status: templateSlide.status,
        slideNumber
      });

      const response: TemplateSlideGenerationResponse = {
        success: true,
        slide: templateSlide,
        slideNumber
      };

      return NextResponse.json(response);

    } catch (generationError) {
      console.error(`❌ TEMPLATE SLIDE API: Error during slide ${slideNumber} generation:`, generationError);
      
      const response: TemplateSlideGenerationResponse = {
        success: false,
        error: 'Failed to generate slide',
        details: generationError instanceof Error ? generationError.message : 'Unknown error',
        slideNumber
      };

      return NextResponse.json(response, { status: 500 });
    }

  } catch (error) {
    console.error('❌ TEMPLATE SLIDE API: Request error:', error);
    
    const response: TemplateSlideGenerationResponse = {
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
    service: 'Template Slide Generation API',
    status: 'active',
    version: '1.0.0',
    endpoints: {
      POST: 'Generate a single slide from template data'
    },
    requiredFields: ['slideNumber', 'title', 'description', 'type', 'templateData'],
    optionalFields: ['sessionId'],
    templateDataFields: ['topic', 'ageGroup', 'slideCount', 'hasAdditionalInfo', 'additionalInfo?']
  });
}
