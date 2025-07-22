interface CompressionOptions {
  targetTokens?: number;
  semanticCleaning?: boolean;
  preserveRecent?: boolean;
  recentMessagesCount?: number;
}

interface CompressionResult {
  compressed: string;
  metrics: {
    originalLength: number;
    compressedLength: number;
    compressionRatio: string;
    spaceSaved: string;
    estimatedTokens: number;
    cost: string;
  };
}

export class ContextCompressionService {
  
  // === ГОЛОВНИЙ МЕТОД СТИСНЕННЯ КОНТЕКСТУ ===
  async compressContext(
    context: string, 
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    const {
      targetTokens = 1500,
      semanticCleaning = true,
      preserveRecent = true,
      recentMessagesCount = 3
    } = options;

    console.log('🤖 [COMPRESSION SERVICE] Starting context compression...');
    console.log(`📊 Original context: ${context.length} characters (${this.estimateTokens(context)} tokens)`);

    // Підготовлюємо контекст для стиснення
    const { contextToCompress, recentContext } = preserveRecent 
      ? this.separateRecentContext(context, recentMessagesCount)
      : { contextToCompress: context, recentContext: '' };

    try {
      // Викликаємо API для стиснення
      const result = await this.callCompressionAPI(contextToCompress, targetTokens, semanticCleaning);
      
      // Об'єднуємо стиснений контекст з недавніми повідомленнями
      const finalCompressed = recentContext 
        ? `${result.compressed} | RECENT: ${recentContext}`
        : result.compressed;

      console.log('✅ [COMPRESSION SERVICE] Compression completed successfully');
      console.log(`📉 Final compression: ${context.length} → ${finalCompressed.length} characters`);

      return {
        compressed: finalCompressed,
        metrics: this.calculateMetrics(context, finalCompressed)
      };

    } catch (error) {
      console.error('❌ [COMPRESSION SERVICE] Compression failed:', error);
      throw new Error(`Context compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // === РОЗДІЛЕННЯ КОНТЕКСТУ НА СТАРИЙ ТА НЕДАВНІЙ ===
  private separateRecentContext(context: string, recentCount: number): {
    contextToCompress: string;
    recentContext: string;
  } {
    const parts = context.split(' | ');
    
    if (parts.length <= recentCount) {
      return { contextToCompress: context, recentContext: '' };
    }

    const recentParts = parts.slice(-recentCount);
    const olderParts = parts.slice(0, -recentCount);

    return {
      contextToCompress: olderParts.join(' | '),
      recentContext: recentParts.join(' | ')
    };
  }

  // === ВИКЛИК API ДЛЯ СТИСНЕННЯ ===
  private async callCompressionAPI(
    context: string, 
    targetTokens: number, 
    semanticCleaning: boolean
  ): Promise<CompressionResult> {
    const response = await fetch('/api/compress-context', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context,
        targetTokens,
        semanticCleaning
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || 'API request failed');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Compression API returned error');
    }

    return result;
  }

  // === ПЕРЕВІРКА ЧИ ПОТРІБНЕ СТИСНЕННЯ ===
  shouldCompress(context: string, maxTokens: number = 4000): boolean {
    const estimatedTokens = this.estimateTokens(context);
    return estimatedTokens > maxTokens;
  }

  // === АДАПТИВНЕ СТИСНЕННЯ ===
  async adaptiveCompression(context: string): Promise<string> {
    const tokens = this.estimateTokens(context);
    
    console.log(`🎯 [COMPRESSION SERVICE] Adaptive compression for ${tokens} tokens`);

    if (tokens <= 4000) {
      console.log('✅ No compression needed');
      return context;
    }

    // Рівень 1: Легке стиснення
    if (tokens <= 6000) {
      console.log('🔧 Level 1: Light compression');
      const result = await this.compressContext(context, {
        targetTokens: 3500,
        semanticCleaning: true,
        preserveRecent: true,
        recentMessagesCount: 5
      });
      return result.compressed;
    }

    // Рівень 2: Середнє стиснення
    if (tokens <= 10000) {
      console.log('🔧 Level 2: Medium compression');
      const result = await this.compressContext(context, {
        targetTokens: 2500,
        semanticCleaning: true,
        preserveRecent: true,
        recentMessagesCount: 3
      });
      return result.compressed;
    }

    // Рівень 3: Агресивне стиснення
    console.log('🔧 Level 3: Aggressive compression');
    const result = await this.compressContext(context, {
      targetTokens: 1500,
      semanticCleaning: true,
      preserveRecent: true,
      recentMessagesCount: 2
    });
    return result.compressed;
  }

  // === УТИЛІТАРНІ МЕТОДИ ===
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private calculateMetrics(original: string, compressed: string) {
    const originalLength = original.length;
    const compressedLength = compressed.length;
    const compressionRatio = (compressedLength / originalLength);
    const spaceSaved = ((originalLength - compressedLength) / originalLength * 100);

    return {
      originalLength,
      compressedLength,
      compressionRatio: compressionRatio.toFixed(3),
      spaceSaved: spaceSaved.toFixed(1),
      estimatedTokens: this.estimateTokens(compressed),
      cost: this.calculateCost(originalLength, compressedLength)
    };
  }

  private calculateCost(originalLength: number, compressedLength: number): string {
    // Gemini 2.5 Flash Lite pricing: $0.075 per 1M input tokens, $0.30 per 1M output tokens
    const inputTokens = Math.ceil(originalLength / 4);
    const outputTokens = Math.ceil(compressedLength / 4);
    
    const inputCost = (inputTokens / 1000000) * 0.075;
    const outputCost = (outputTokens / 1000000) * 0.30;
    const totalCost = inputCost + outputCost;
    
    return `$${totalCost.toFixed(6)}`;
  }
} 