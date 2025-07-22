import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { context, targetTokens = 1500, semanticCleaning = true } = await request.json();

    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Context is required' },
        { status: 400 }
      );
    }

    console.log('🤖 [CONTEXT COMPRESSOR] Starting compression...');
    console.log(`📊 Original length: ${context.length} characters`);

    const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Build compression prompt with semantic cleaning instructions
    const compressionPrompt = buildCompressionPrompt(context, targetTokens, semanticCleaning);

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-06-17",
      contents: compressionPrompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disable thinking for faster compression
        },
        temperature: 0.1, // Low temperature for consistent compression
        maxOutputTokens: targetTokens + 200, // Small buffer
      }
    });

    const compressedContext = response.text;

    if (!compressedContext) {
      throw new Error('No content in compression response');
    }

    // Calculate compression metrics
    const originalLength = context.length;
    const compressedLength = compressedContext.length;
    const compressionRatio = (compressedLength / originalLength);
    const spaceSaved = ((originalLength - compressedLength) / originalLength * 100);

    console.log('✅ [CONTEXT COMPRESSOR] Compression completed');
    console.log(`📉 Compressed: ${originalLength} → ${compressedLength} chars`);
    console.log(`💾 Space saved: ${spaceSaved.toFixed(1)}%`);
    console.log(`📊 Compression ratio: ${compressionRatio.toFixed(2)}`);

    return NextResponse.json({
      success: true,
      compressed: compressedContext,
      metrics: {
        originalLength,
        compressedLength,
        compressionRatio: compressionRatio.toFixed(3),
        spaceSaved: spaceSaved.toFixed(1),
        estimatedTokens: Math.ceil(compressedLength / 4),
        cost: calculateCompressionCost(originalLength, compressedLength)
      }
    });

  } catch (error) {
    console.error('❌ [CONTEXT COMPRESSOR] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Context compression failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function buildCompressionPrompt(context: string, targetTokens: number, semanticCleaning: boolean): string {
  const basePrompt = `You are an expert context compressor. Your task is to compress conversation context while preserving ALL important information.

ORIGINAL CONTEXT:
${context}

COMPRESSION REQUIREMENTS:
- Target length: ${targetTokens} tokens (approximately ${targetTokens * 4} characters)
- Preserve ALL key information: lesson topics, user age, questions, answers, progress
- Maintain conversation flow and context understanding
- Keep user preferences and learning state`;

  const semanticCleaningInstructions = semanticCleaning ? `
- Remove redundant phrases and filler words
- Combine similar information
- Use concise language while keeping meaning
- Remove repetitive confirmations ("okay", "I understand", "sure")
- Shorten verbose explanations while keeping core content
- Use abbreviations where appropriate (e.g., "user" → "u", "lesson" → "L")` : '';

  const outputInstructions = `
OUTPUT FORMAT:
Provide a compressed version that reads naturally and contains all essential information. DO NOT use bullet points or structured format - write as flowing conversation context.

EXAMPLE COMPRESSION:
Instead of: "The user said that they are interested in learning about dinosaurs. I responded that dinosaurs are fascinating creatures. The user then asked about T-Rex specifically. I explained that T-Rex was a large carnivorous dinosaur."

Write: "User interested in dinosaurs, asked about T-Rex. Explained T-Rex as large carnivorous dinosaur."

COMPRESSED CONTEXT:`;

  return basePrompt + semanticCleaningInstructions + outputInstructions;
}

function calculateCompressionCost(originalLength: number, compressedLength: number): string {
  // Gemini 2.5 Flash Lite pricing: $0.075 per 1M input tokens, $0.30 per 1M output tokens
  const inputTokens = Math.ceil(originalLength / 4);
  const outputTokens = Math.ceil(compressedLength / 4);
  
  const inputCost = (inputTokens / 1000000) * 0.075;
  const outputCost = (outputTokens / 1000000) * 0.30;
  const totalCost = inputCost + outputCost;
  
  return `$${totalCost.toFixed(6)}`;
} 