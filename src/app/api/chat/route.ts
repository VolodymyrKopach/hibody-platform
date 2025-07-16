import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '../../../services/chat/ChatService';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, action } = await request.json();
    
    console.log('Received message:', message);
    if (action) {
      console.log('⚡ Action triggered:', action);
    }
    if (conversationHistory) {
      console.log('📋 Conversation context:', conversationHistory.step || 'none');
    }
    
    // Use ChatService with Gemini + Claude Sonnet integration
    const chatService = new ChatService();
    const result = await chatService.processMessage(message, conversationHistory, action);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Show helpful error message for missing API key
    if (error instanceof Error && error.message.includes('Claude API key is required')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Claude API key required', 
          details: error.message
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process message', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 