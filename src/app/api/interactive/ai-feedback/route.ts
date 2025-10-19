import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
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
    let systemPrompt = '';
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

    systemPrompt = `You are an encouraging, supportive educational assistant providing feedback on student answers.

Age Group: ${ageGroup || 'General'}
Feedback Style: ${feedbackType}

${feedbackGuidance}

Structure your response as JSON with the following fields:
{
  "score": <number 1-5>,
  "praise": "<what the student did well>",
  "suggestions": "<gentle suggestions for improvement, if any>",
  "overall": "<overall encouraging message>"
}`;

    const keywordsContext = expectedKeywords.length > 0
      ? `\n\nExpected keywords or concepts: ${expectedKeywords.join(', ')}`
      : '';

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Question: "${question}"

Student's Answer: "${answer}"${keywordsContext}

Please provide feedback on this answer.`,
        },
      ],
    });

    // Extract feedback from response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let feedback;
    try {
      // Try to parse as JSON
      feedback = JSON.parse(content.text);
    } catch (parseError) {
      // If not JSON, create structured feedback from text
      feedback = {
        score: 4,
        praise: 'Great effort!',
        suggestions: content.text,
        overall: 'Keep up the good work!',
      };
    }

    return NextResponse.json({
      success: true,
      feedback,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (error: any) {
    console.error('[AI Feedback] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate feedback',
      },
      { status: 500 }
    );
  }
}

