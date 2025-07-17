import { NextRequest, NextResponse } from 'next/server';

// Global progress tracking
const progressSessions = new Map<string, any>();

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      console.log(`📡 SSE: Starting progress stream for session ${sessionId}`);
      
      // Send initial connection message
      const data = `data: ${JSON.stringify({
        type: 'connected',
        sessionId,
        timestamp: new Date().toISOString()
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));

      // Store controller for this session
      progressSessions.set(sessionId, { controller, sessionId });

      // Clean up after 10 minutes
      setTimeout(() => {
        if (progressSessions.has(sessionId)) {
          console.log(`🧹 SSE: Cleaning up session ${sessionId}`);
          progressSessions.delete(sessionId);
          try {
            controller.close();
          } catch (e) {
            console.log('Controller already closed');
          }
        }
      }, 10 * 60 * 1000);
    },
    cancel() {
      console.log(`🔌 SSE: Client disconnected session ${sessionId}`);
      progressSessions.delete(sessionId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Helper function to send progress updates
export function sendProgressUpdate(sessionId: string, progressData: any) {
  const session = progressSessions.get(sessionId);
  if (!session) {
    console.log(`⚠️ SSE: No session found for ${sessionId}`);
    return false;
  }

  try {
    const message = `data: ${JSON.stringify({
      type: 'progress',
      sessionId,
      data: progressData,
      timestamp: new Date().toISOString()
    })}\n\n`;
    
    session.controller.enqueue(new TextEncoder().encode(message));
    console.log(`📤 SSE: Sent progress update to ${sessionId}`);
    return true;
  } catch (error) {
    console.error(`❌ SSE: Error sending to ${sessionId}:`, error);
    progressSessions.delete(sessionId);
    return false;
  }
}

// Helper function to send completion message
export function sendCompletion(sessionId: string, finalData: any) {
  const session = progressSessions.get(sessionId);
  if (!session) {
    return false;
  }

  try {
    const message = `data: ${JSON.stringify({
      type: 'completed',
      sessionId,
      data: finalData,
      timestamp: new Date().toISOString()
    })}\n\n`;
    
    session.controller.enqueue(new TextEncoder().encode(message));
    console.log(`🎉 SSE: Sent completion to ${sessionId}`);
    
    // Close the connection after completion
    setTimeout(() => {
      try {
        session.controller.close();
        progressSessions.delete(sessionId);
      } catch (e) {
        console.log('Controller already closed');
      }
    }, 1000);
    
    return true;
  } catch (error) {
    console.error(`❌ SSE: Error sending completion to ${sessionId}:`, error);
    progressSessions.delete(sessionId);
    return false;
  }
} 