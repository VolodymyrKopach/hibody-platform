import { IIntentMappingService } from '../interfaces/IChatServices';

// === SOLID: Single Responsibility - Intent Mapping ===
export class IntentMappingService implements IIntentMappingService {
  mapUnknownIntent(intent: any): any | null {
    const directMappings: { [key: string]: string } = {
      'generate_plan': 'create_lesson',
      'create_plan': 'create_lesson',
      'make_lesson': 'create_lesson',
      'edit_lesson': 'edit_plan',
      'modify_plan': 'edit_plan',
      'update_plan': 'edit_plan',
      'general_chat': 'free_chat',
      'greeting': 'free_chat'
    };

    const directMatch = directMappings[intent.intent];
    if (directMatch) {
      return {
        ...intent,
        intent: directMatch,
        reasoning: `Direct mapping from ${intent.intent} to ${directMatch}`
      };
    }

    const availableIntents = [
      'create_lesson', 'edit_plan', 'create_slide', 'create_new_slide',
      'regenerate_slide', 'edit_html_inline', 'edit_slide', 'improve_html',
      'free_chat', 'help', 'export', 'preview'
    ];

    const bestMatch = this.findBestIntentMatch(intent.intent, availableIntents, intent.parameters);
    
    if (bestMatch) {
      return {
        ...intent,
        intent: bestMatch.intent,
        reasoning: `Smart mapping from ${intent.intent} to ${bestMatch.intent} (${bestMatch.reason})`
      };
    }

    return null;
  }

  findBestIntentMatch(unknownIntent: string, availableIntents: string[], parameters: any): { intent: string; confidence: number; reason: string } | null {
    const scores: Array<{ intent: string; score: number; reason: string }> = [];

    for (const availableIntent of availableIntents) {
      let score = 0;
      const reasons: string[] = [];

      // String similarity
      const similarity = this.calculateStringSimilarity(unknownIntent, availableIntent);
      if (similarity > 0.3) {
        score += similarity * 40;
        reasons.push(`name similarity: ${(similarity * 100).toFixed(1)}%`);
      }

      // Keyword matching
      const unknownWords = unknownIntent.toLowerCase().split('_');
      const availableWords = availableIntent.toLowerCase().split('_');
      
      for (const word of unknownWords) {
        if (availableWords.includes(word)) {
          score += 20;
          reasons.push(`keyword match: "${word}"`);
        }
      }

      // Parameter analysis
      if (parameters) {
        if ((parameters.topic || parameters.age) && availableIntent === 'create_lesson') {
          score += 30;
          reasons.push('has lesson parameters');
        }
        
        if (parameters.slideNumber && availableIntent.includes('slide')) {
          score += 25;
          reasons.push('has slide number');
        }
        
        if (unknownIntent.includes('plan') && availableIntent === 'edit_plan') {
          score += 35;
          reasons.push('plan-related');
        }
      }

      if (score > 0) {
        scores.push({
          intent: availableIntent,
          score,
          reason: reasons.join(', ')
        });
      }
    }

    scores.sort((a, b) => b.score - a.score);
    
    if (scores.length > 0 && scores[0].score >= 30) {
      return {
        intent: scores[0].intent,
        confidence: Math.min(scores[0].score / 100, 0.8),
        reason: scores[0].reason
      };
    }

    return null;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len2][len1]) / maxLen;
  }
} 