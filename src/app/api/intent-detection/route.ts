import { NextRequest, NextResponse } from 'next/server';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

interface IntentDetectionRequest {
  message: string;
}

const INTENT_DETECTION_SYSTEM_PROMPT = `Fast intent detection for HiBody educational platform. Analyze user messages and return JSON only.

INTENTS:
1. CREATE_LESSON - "створи урок", "create lesson", "сделай урок"
2. GENERATE_PLAN - "створи план", "make plan", "составь план"  
3. CREATE_SLIDE - "створи слайд", "create slide", "сделай слайд"
4. CREATE_NEW_SLIDE - "додай слайд", "add slide", "добавь слайд"
5. REGENERATE_SLIDE - "перегенеруй слайд N", "regenerate slide N"
6. EDIT_HTML_INLINE - "заміни X на Y", "replace X with Y"
7. EDIT_SLIDE - "покращ слайд N", "improve slide N"
8. IMPROVE_HTML - "зроби яскравішим", "make colorful"
9. FREE_CHAT - general conversation
10. HELP - "допоможи", "help"
11. EXPORT - "експортуй", "download"
12. PREVIEW - "покажи", "preview"

Extract: slideNumber, topic, age, targetText/newText, slideSubject
Languages: uk, en, ru, other

Return JSON:
{
  "intent": "CREATE_LESSON",
  "confidence": 0.95,
  "parameters": {
    "topic": "динозаври",
    "age": "6 років",
    "slideNumber": null,
    "targetElement": null,
    "slideSubject": null,
    "slideType": null,
    "targetText": null,
    "newText": null,
    "keywords": ["створи", "урок"],
    "rawMessage": "input message"
  },
  "language": "uk",
  "reasoning": "brief explanation"
}`;

export async function POST(request: NextRequest) {
  try {
    const { message }: IntentDetectionRequest = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!CLAUDE_API_KEY) {
      // КРИТИЧНО: БЕЗ API ключа система не може працювати
      return NextResponse.json(
        { error: 'Neural network API not configured - no regex fallback allowed' },
        { status: 500 }
      );
    }

    // Call Claude Haiku API for fast intent detection
    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        temperature: 0.1, // Low temperature for consistent intent detection
        system: INTENT_DETECTION_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Analyze this message for intent: "${message}"`
          }
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API Error:', errorText);
      throw new Error(`Claude API failed: ${claudeResponse.statusText}`);
    }

    const claudeData = await claudeResponse.json();
    const aiResponse = claudeData.content[0].text;

    // Parse the JSON response from Claude
    let intentResult;
    try {
      // Clean the response - remove any markdown or extra text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      intentResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Invalid neural network response format');
    }

    // Add the original message to parameters
    if (intentResult.parameters) {
      intentResult.parameters.rawMessage = message;
    }

    return NextResponse.json({
      success: true,
      ...intentResult,
      reasoning: intentResult.reasoning || 'Neural network semantic analysis'
    });

  } catch (error) {
    console.error('Intent detection API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Neural network intent detection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ВИДАЛЕНО: всі fallback функції з regex patterns
// ВСЕ має йти через нейронну мережу! 