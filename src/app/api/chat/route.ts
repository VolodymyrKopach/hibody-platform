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
      if (conversationHistory.conversationContext) {
        console.log('💬 Conversation context size:', conversationHistory.conversationContext.length, 'chars');
      }
    }
    
    // Use ChatService with Gemini 2.5 Flash integration
    const chatService = new ChatService();
    const result = await chatService.processMessage(message, conversationHistory, action);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Show helpful error message for missing API key
    if (error instanceof Error && error.message.includes('Gemini API key') || error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Gemini API key required', 
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