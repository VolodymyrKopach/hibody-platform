import { NextRequest, NextResponse } from 'next/server';

// Redirect to sequential generation
export async function POST(request: NextRequest) {
  console.log('🔄 PARALLEL API: Redirecting to sequential generation...');
  
  // Forward the request to sequential endpoint
  const body = await request.json();
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/generation/slides/sequential`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    console.log('✅ PARALLEL API: Successfully redirected to sequential generation');
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('❌ PARALLEL API: Error redirecting to sequential:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to redirect to sequential generation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check service status
export async function GET() {
  return NextResponse.json({
    success: true,
    service: 'Parallel Slide Generation API',
    status: 'available',
    capabilities: {
      maxConcurrentSlides: 10,
      supportedModels: ['gemini-2.5-flash'],
      features: ['parallel-generation', 'real-time-callbacks', 'error-isolation']
    }
  });
} 