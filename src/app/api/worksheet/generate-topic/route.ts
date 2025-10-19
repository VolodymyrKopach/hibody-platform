/**
 * API Route: POST /api/worksheet/generate-topic
 * Generates topic ideas through conversational AI chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { tokenTrackingService } from '@/services/tokenTrackingService';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  console.log('💡 [API] Topic generation chat request received');

  try {
    // Get user for token tracking
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const body = await request.json();
    const { message, conversationHistory, ageGroup, contentMode } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Build conversation context
    const conversationContext = conversationHistory
      .map((msg: any) => {
        return `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`;
      })
      .join('\n\n');

    // Build available components list based on content mode
    const pdfComponents = `
PDF Worksheet Components:
- **title-block**: Main titles and section headers
- **body-text**: Explanatory text and descriptions
- **instructions-box**: Clear instructions for activities
- **fill-blank**: Fill in the blank exercises
- **multiple-choice**: Multiple choice questions (A, B, C, D)
- **true-false**: True/False questions
- **short-answer**: Open-ended questions
- **match-pairs**: Match items from two columns
- **word-bank**: Word bank for exercises
- **tip-box**: Helpful tips and hints
- **warning-box**: Important notes or warnings
- **image-placeholder**: Educational images and illustrations
- **bullet-list**: Bulleted lists
- **numbered-list**: Numbered lists
- **table**: Tables for organizing information
- **divider**: Visual separators between sections`;

    const interactiveComponents = `
Interactive Components (for digital worksheets):
- **TapImage**: Tap/click on images for interaction
- **SimpleDragAndDrop**: Drag and drop items into correct positions
- **SimpleCounter**: Count objects with tap/click
- **MemoryCards**: Memory matching game
- **SortingGame**: Sort items into categories
- **ColorMatcher**: Match colors
- **EmotionRecognizer**: Identify emotions
- **PatternBuilder**: Build and complete patterns
- **ShapeTracer**: Trace shapes
- **SimplePuzzle**: Simple jigsaw puzzles
- **SequenceBuilder**: Arrange items in order
- **CauseEffectGame**: Cause and effect relationships
- **SoundMatcher**: Match sounds to objects
- **VoiceRecorder**: Record and playback voice
- **RewardCollector**: Collect rewards for achievements`;

    const availableComponents = contentMode === 'interactive' 
      ? `${pdfComponents}\n\n${interactiveComponents}`
      : pdfComponents;

    // Create system prompt for topic generation
    const systemPrompt = `You are an educational content specialist helping teachers create worksheet topics.

CONTEXT:
- Age Group: ${ageGroup}
- Content Mode: ${contentMode === 'pdf' ? 'PDF (printable)' : 'Interactive (digital)'}

YOUR ROLE:
1. Ask clarifying questions about what the teacher wants to teach
2. Understand the learning objectives and skills to practice
3. Consider age-appropriateness and content mode
4. Generate a detailed, specific topic description

AVAILABLE COMPONENTS:
${availableComponents}

CONVERSATION GUIDELINES:
- Be friendly and helpful
- Use **Markdown formatting** in your responses:
  * Use **bold** for important concepts (e.g., **Розпізнавання**, **Лічба**)
  * Use bullet lists (* or -) for options and examples
  * Use numbered lists for steps
  * Keep paragraphs clear and well-structured
- Ask follow-up questions to understand their needs better
- When generating the final plan, create a COMPREHENSIVE DETAILED PLAN including:
  * **Main Topic/Title**: Clear subject description
  * **Learning Objectives**: What students will learn
  * **Components to Use**: Which worksheet components are best (refer to list above)
  * **Activity Flow**: Step-by-step structure of the worksheet
  * **Age-Appropriate Details**: Why these components work for this age group

EXAMPLE DETAILED PLAN:
"**Counting 1-10 with Farm Animals**

**Learning Objectives:**
*   Count from 1 to 10
*   Recognize numbers and quantities
*   Identify farm animals (cows, pigs, chickens, sheep)
*   Match numbers with visual representations

**Components to Use:**
*   **title-block**: Main worksheet title 'Farm Animal Counting'
*   **instructions-box**: Clear instructions for each activity
*   **image-placeholder**: Farm animal illustrations
*   **multiple-choice**: 'How many cows?' type questions
*   **match-pairs**: Match numbers to groups of animals
*   **tip-box**: Helpful counting tips

**Activity Flow:**
1. Introduction with farm scene (image-placeholder)
2. Counting practice 1-5 (multiple-choice questions)
3. Counting practice 6-10 (multiple-choice questions)
4. Matching numbers to animals (match-pairs)
5. Review and celebration (tip-box with encouragement)

**Why These Components?**
For age ${ageGroup}, visual elements (images) are essential. Multiple-choice keeps it simple, and matching activities reinforce learning through interaction."

TOPIC GENERATION FORMAT:
When you're ready to provide the final plan:
1. Present the COMPLETE DETAILED PLAN as shown above
2. On a new line at the very end, add: "TOPIC_READY"
3. The entire plan above TOPIC_READY will be used for worksheet generation

Remember:
- For younger ages (2-6): Focus on basic concepts, visual learning, simple activities
- For middle ages (7-12): Include more complex tasks, reading/writing practice
- For older ages (13+): Academic subjects, critical thinking, detailed exercises
- For PDF mode: Consider printable activities, coloring, writing spaces
- For Interactive mode: Consider digital interactions, drag-and-drop, multimedia

Previous conversation:
${conversationContext}

User's message: ${message}

Respond naturally and helpfully. If you have enough information, generate the topic.`;

    // Initialize Gemini client
    const client = new GoogleGenAI({ apiKey });
    
    // Call Gemini API
    console.log('🤖 [GEMINI_API] Calling Gemini for topic generation');
    
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: {
        temperature: 0.8, // Higher for creative responses
        maxOutputTokens: 4096,
        topP: 0.9,
        topK: 40
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }

    console.log('✅ [API] Generated response', {
      responseLength: responseText.length,
      hasUsageMetadata: !!response.usageMetadata
    });

    // Track token usage if user is authenticated
    if (user?.id && response.usageMetadata) {
      await tokenTrackingService.trackTokenUsage({
        userId: user.id,
        serviceName: 'worksheet_topic_generation',
        model: 'gemini-2.5-flash',
        inputTokens: response.usageMetadata.promptTokenCount || 0,
        outputTokens: response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata.totalTokenCount || 0,
      });
    }

    // Check if a final topic was generated
    let generatedTopic: string | null = null;
    let finalResponse = responseText;
    
    // If AI signals plan is ready with TOPIC_READY marker
    if (responseText.includes('TOPIC_READY')) {
      // Extract the entire plan (everything before TOPIC_READY marker)
      const parts = responseText.split('TOPIC_READY');
      const fullPlan = parts[0].trim();
      
      // The full plan is what we'll insert into the topic field
      generatedTopic = fullPlan;
      
      console.log('🎯 [API] Detailed plan generated:', generatedTopic.substring(0, 150) + '...');
      
      // For display, add confirmation message
      finalResponse = `${fullPlan}\n\n---\n\n✅ **Plan is ready!** This detailed plan will be used to generate your worksheet. Click "Use This Plan" to continue.`;
    }

    return NextResponse.json({
      success: true,
      response: finalResponse,
      generatedTopic,
    });

  } catch (error) {
    console.error('❌ [API] Topic generation error:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API configuration error',
          details: 'Gemini API key is not properly configured'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate topic',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
