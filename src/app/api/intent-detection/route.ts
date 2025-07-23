import { NextRequest, NextResponse } from 'next/server';
import { GeminiIntentService } from '@/services/intent/GeminiIntentService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Use Gemini Intent Service for intent detection
    const geminiService = new GeminiIntentService();
    const result = await geminiService.detectIntent(message, conversationHistory);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Intent detection error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}