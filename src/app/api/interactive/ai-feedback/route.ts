import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const body = await request.json();
    const {
      question,
      answer,
      expectedKeywords = [],
      feedbackType = 'encouraging',
      ageGroup,
    } = body;

    // Validate input
    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    // Construct prompt based on feedback type
    let feedbackGuidance = '';

    switch (feedbackType) {
      case 'encouraging':
        feedbackGuidance = `Provide warm, encouraging feedback suitable for young learners. Start with praise, 
        then gently suggest improvements if needed. Keep it positive and motivating. Use emojis appropriately.`;
        break;
      case 'detailed':
        feedbackGuidance = `Provide detailed, constructive feedback. Explain what was done well and what could 
        be improved. Be specific about strengths and areas for growth.`;
        break;
      case 'concise':
        feedbackGuidance = `Provide brief, clear feedback. Be direct but positive. Keep it short and actionable.`;
        break;
    }

    const keywordsContext = expectedKeywords.length > 0
      ? `\n\nExpected keywords or concepts: ${expectedKeywords.join(', ')}`
      : '';

    const systemPrompt = `You are an encouraging, supportive educational assistant providing feedback on student answers.

Age Group: ${ageGroup || 'General'}
Feedback Style: ${feedbackType}

${feedbackGuidance}

Structure your response as JSON with the following fields:
{
  "score": <number 1-5>,
  "praise": "<what the student did well>",
  "suggestions": "<gentle suggestions for improvement, if any>",
  "overall": "<overall encouraging message>"
}

Question: "${question}"

Student's Answer: "${answer}"${keywordsContext}

Please provide feedback on this answer as a JSON object.`;

    console.log('🤖 [AI Feedback] Generating feedback with Gemini...');

    const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Call Gemini API
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-lite-preview-06-17',
      contents: systemPrompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disable thinking for faster feedback
        },
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    const content = response.text;

    if (!content) {
      throw new Error('No content in Gemini response');
    }

    // Extract feedback from response
    let feedback;
    try {
      // Try to parse as JSON
      feedback = JSON.parse(content);
    } catch (parseError) {
      // If not JSON, create structured feedback from text
      feedback = {
        score: 4,
        praise: 'Great effort!',
        suggestions: content,
        overall: 'Keep up the good work!',
      };
    }

    console.log('✅ [AI Feedback] Feedback generated successfully');

    return NextResponse.json({
      success: true,
      feedback,
      usage: {
        model: 'gemini-2.5-flash-lite',
        estimatedTokens: Math.ceil(content.length / 4),
      },
    });
  } catch (error: any) {
    console.error('❌ [AI Feedback] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate feedback',
      },
      { status: 500 }
    );
  }
}
