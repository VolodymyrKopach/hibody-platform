import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Single Slide Generation API Test',
    endpoint: '/api/generation/slides/single',
    method: 'POST',
    testPayload: {
      title: 'Introduction to Solar System',
      description: 'Learn about the planets in our solar system with colorful images and fun facts. Students will discover the eight planets and their unique characteristics.',
      topic: 'Solar System',
      age: '7-8'
    },
    expectedResponse: {
      success: true,
      slide: {
        id: 'single_slide_[timestamp]_[random]',
        title: 'Introduction to Solar System',
        content: '[description]',
        htmlContent: '[generated HTML content]',
        status: 'completed',
        estimatedDuration: '[seconds]',
        interactive: '[boolean]',
        visualElements: '[array of elements]',
        description: '[description]',
        updatedAt: '[date]'
      }
    }
  });
}

export async function POST() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const testPayload = {
      title: 'Introduction to Solar System',
      description: 'Learn about the planets in our solar system with colorful images and fun facts. Students will discover the eight planets and their unique characteristics.',
      topic: 'Solar System',
      age: '7-8'
    };

    console.log('🧪 Testing single slide generation with payload:', testPayload);

    const response = await fetch(`${baseUrl}/api/generation/slides/single`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const data = await response.json();
    
    console.log('✅ Single slide test response:', {
      status: response.status,
      success: data.success,
      slideId: data.slide?.id,
      slideTitle: data.slide?.title
    });

    return NextResponse.json({
      test: 'Single Slide Generation API Test',
      status: response.status,
      success: data.success,
      testPayload,
      response: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Single slide test error:', error);
    
    return NextResponse.json({
      test: 'Single Slide Generation API Test',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}