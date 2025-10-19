/**
 * Service for AI-powered worksheet editing using Gemini 2.5 Flash
 * Handles both component and page editing, with special logic for image editing
 * Based on GeminiWorksheetGenerationService pattern
 */

import { GoogleGenAI } from '@google/genai';
import {
  WorksheetEditRequest,
  WorksheetEditPatch,
  WorksheetEditChange,
  WorksheetEditTarget,
  WorksheetEditContext,
} from '@/types/worksheet-generation';
import { CanvasElement } from '@/types/canvas-element';
import { worksheetComponentSchemaService } from './WorksheetComponentSchemaService';
import { tokenTrackingService } from '@/services/tokenTrackingService';

/**
 * Result of AI worksheet editing
 */
export interface WorksheetEditResult {
  patch: WorksheetEditPatch;
  changes: WorksheetEditChange[];
  imagePrompt?: string; // New image prompt for image components (if changed)
}

/**
 * Service for AI-powered worksheet editing using Gemini
 * Handles both component and page editing
 */
export class GeminiWorksheetEditingService {
  private client: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required for worksheet editing');
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  /**
   * Edit worksheet component or page using AI
   */
  async editWorksheet(
    target: WorksheetEditTarget,
    instruction: string,
    context: WorksheetEditContext
  ): Promise<WorksheetEditResult> {
    console.log('🤖 [GEMINI_WORKSHEET_EDITING] Starting AI worksheet editing', {
      targetType: target.type,
      instruction: instruction.substring(0, 100),
      context
    });

    try {
      // Reset sanitization statistics for this request
      this.resetSanitizationStats();
      
      // Build prompt based on target type
      const prompt = target.type === 'component'
        ? this.buildComponentEditPrompt(target, instruction, context)
        : this.buildPageEditPrompt(target, instruction, context);

      // Log sanitization results
      this.logSanitizationStats();

      console.log('📝 [GEMINI_WORKSHEET_EDITING] Calling Gemini API...');

      // Call Gemini API with appropriate token limit based on target type
      const maxTokens = target.type === 'page' ? 32000 : 16384;
      const response = await this.callGeminiAPI(prompt, maxTokens, context.userId);

      console.log('✅ [GEMINI_WORKSHEET_EDITING] AI response received');

      // Parse response
      const result = this.parseAIResponse(response);

      console.log('📊 [GEMINI_WORKSHEET_EDITING] Edit completed', {
        changesCount: result.changes.length,
        patchKeys: Object.keys(result.patch)
      });

      return result;

    } catch (error) {
      console.error('❌ [GEMINI_WORKSHEET_EDITING] Edit failed:', error);
      throw error;
    }
  }

  /**
   * Sanitize data for prompt - remove base64 URLs to avoid token limit
   * Tracks and replaces ALL Base64 image data in any field
   */
  private sanitizeDataForPrompt(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeDataForPrompt(item));
    }

    const sanitized: any = {};
    for (const key in data) {
      const value = data[key];
      
      // Replace ANY base64 image data in string values
      if (typeof value === 'string' && value.startsWith('data:image')) {
        // Extract image metadata if available (from HTML comments)
        const promptMatch = value.match(/<!--\s*IMAGE_PROMPT:\s*"([^"]+)"/);
        const imagePrompt = promptMatch ? promptMatch[1] : 'Generated image';
        
        // Calculate size savings
        const originalSize = value.length;
        const originalKB = Math.round(originalSize / 1024);
        
        // Replace with informative placeholder
        sanitized[key] = `[BASE64_IMAGE_OMITTED:${imagePrompt.substring(0, 50)}...]`;
        
        console.log(`🔒 [SANITIZE] Removed Base64 from "${key}":`, {
          originalSize: `${originalKB}KB`,
          estimatedTokensSaved: Math.floor(originalSize / 4),
          prompt: imagePrompt.substring(0, 80) + '...'
        });
        
        this.totalBase64Removed++;
        this.totalBytesSaved += originalSize;
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeDataForPrompt(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  
  // Track sanitization statistics
  private totalBase64Removed = 0;
  private totalBytesSaved = 0;
  
  /**
   * Reset and log sanitization statistics
   */
  private resetSanitizationStats(): void {
    this.totalBase64Removed = 0;
    this.totalBytesSaved = 0;
  }
  
  /**
   * Log sanitization statistics
   */
  private logSanitizationStats(): void {
    if (this.totalBase64Removed > 0) {
      const savedMB = (this.totalBytesSaved / (1024 * 1024)).toFixed(2);
      const estimatedTokensSaved = Math.floor(this.totalBytesSaved / 4);
      
      console.log('💰 [SANITIZATION_COMPLETE] Base64 removal summary:', {
        imagesRemoved: this.totalBase64Removed,
        bytesSaved: `${savedMB}MB`,
        estimatedTokensSaved: `~${estimatedTokensSaved} tokens`,
        tokenCostSaved: `~$${(estimatedTokensSaved * 0.000001).toFixed(4)}`
      });
    } else {
      console.log('ℹ️ [SANITIZATION_COMPLETE] No Base64 images found in data');
    }
  }

  /**
   * Extract minimal context for component editing (token optimization)
   * Only include fields that are relevant for editing, excluding layout/visual properties
   */
  private extractMinimalElementContext(element: CanvasElement): any {
    const minimalContext = {
      type: element.type,
      properties: this.sanitizeDataForPrompt(element.properties || {})
    };

    // Calculate approximate token savings
    const fullElementString = JSON.stringify(element);
    const minimalContextString = JSON.stringify(minimalContext);
    const savedChars = fullElementString.length - minimalContextString.length;
    const estimatedTokenSavings = Math.floor(savedChars / 4); // Rough estimate: ~4 chars per token

    console.log('📊 [TOKEN_OPTIMIZATION] Minimal context created', {
      fullSize: fullElementString.length,
      minimalSize: minimalContextString.length,
      savedChars,
      estimatedTokenSavings: `~${estimatedTokenSavings} tokens`,
      reductionPercent: `${Math.round((savedChars / fullElementString.length) * 100)}%`,
      excludedFields: ['id', 'position', 'size', 'zIndex', 'locked', 'visible']
    });

    return minimalContext;
  }

  /**
   * Extract simplified component schema (token optimization)
   * Only include properties description, not examples or full docs
   */
  private extractSimplifiedComponentSchema(componentType: string): string {
    const schema = worksheetComponentSchemaService.getSchemaByType(componentType);
    if (!schema) return '';
    
    let doc = `**Component Type:** ${componentType}\n`;
    doc += `**Description:** ${schema.description}\n\n`;
    doc += `**Properties:**\n`;
    
    Object.entries(schema.properties).forEach(([propName, propSchema]: [string, any]) => {
      const required = propSchema.required ? '(required)' : '(optional)';
      doc += `- ${propName} ${required}: ${propSchema.description}\n`;
      if (propSchema.enum) {
        doc += `  Allowed: ${propSchema.enum.join(', ')}\n`;
      }
    });
    
    console.log('📊 [TOKEN_OPTIMIZATION] Using simplified schema (no examples, no full docs)');
    
    return doc;
  }

  /**
   * Filter components by age group (token optimization)
   * Only include components suitable for target age group
   */
  private filterComponentsByAge(schemas: any[], ageGroup?: string): any[] {
    if (!ageGroup) return schemas;
    
    const filtered = schemas.filter(schema => {
      // If component has no ageGroups restriction, include it
      if (!schema.ageGroups || schema.ageGroups.length === 0) {
        return true;
      }
      // Check if component is suitable for this age group
      return schema.ageGroups.some((ag: string) => {
        // Match patterns like '3-5', '6-7', '2-3', etc.
        return ag === ageGroup || this.isAgeGroupCompatible(ag, ageGroup);
      });
    });

    console.log('📊 [TOKEN_OPTIMIZATION] Age filtering', {
      totalComponents: schemas.length,
      filteredComponents: filtered.length,
      ageGroup,
      excluded: schemas.length - filtered.length
    });

    return filtered;
  }

  /**
   * Check if age groups are compatible (within 2 years)
   */
  private isAgeGroupCompatible(schemaAge: string, targetAge: string): boolean {
    const getMinAge = (ag: string) => parseInt(ag.split('-')[0]);
    return Math.abs(getMinAge(schemaAge) - getMinAge(targetAge)) <= 2;
  }

  /**
   * Build prompt for component editing
   * TOKEN OPTIMIZATION: No project context, only simplified schema
   */
  private buildComponentEditPrompt(
    target: WorksheetEditTarget,
    instruction: string,
    context: WorksheetEditContext
  ): string {
    // TOKEN OPTIMIZATION: Use minimal context (only type + properties)
    const element = target.data as CanvasElement;
    const minimalContext = this.extractMinimalElementContext(element);
    const componentData = JSON.stringify(minimalContext, null, 2);
    const componentType = element.type;
    const isImageComponent = componentType === 'image-placeholder';

    // Special prompt for image components
    if (isImageComponent) {
      return `You are a worksheet editor. Edit this image component.

**CURRENT IMAGE COMPONENT:**
\`\`\`json
${componentData}
\`\`\`

**USER INSTRUCTION:** ${instruction}

**YOUR TASK:**
Generate a NEW image prompt that:
1. Reflects the requested changes
2. Is in English (for image generation)
3. Is descriptive and clear (for Flux model)

**RETURN FORMAT - JSON ONLY:**
{
  "patch": {
    "properties": {
      "imagePrompt": "NEW detailed English image prompt here",
      "caption": "Updated caption in ${context.language} if needed"
    }
  },
  "changes": [
    {
      "field": "imagePrompt",
      "oldValue": "old prompt",
      "newValue": "new prompt",
      "description": "Brief description in ${context.language}"
    }
  ]
}

Return ONLY valid JSON. Be specific and descriptive in the image prompt.`;
    }

    // TOKEN OPTIMIZATION: Use simplified schema (only properties, no examples)
    const schemaInfo = this.extractSimplifiedComponentSchema(componentType);

    return `You are a worksheet editor. Edit this component based on user instruction.

**CURRENT COMPONENT:**
\`\`\`json
${componentData}
\`\`\`

**USER INSTRUCTION:** ${instruction}

${schemaInfo}

**RULES:**
1. Return ONLY changed fields in "patch"
2. Use ${context.language} for text content
3. Preserve component structure
4. Do NOT include "url" if [BASE64_IMAGE_DATA_OMITTED]

**RETURN FORMAT (JSON only):**
{
  "patch": { "properties": { /* changed fields */ } },
  "changes": [{ "field": "", "oldValue": "", "newValue": "", "description": "" }]
}

Return ONLY valid JSON. No explanations, no markdown formatting.`;
  }

  /**
   * Build prompt for page editing
   * TOKEN OPTIMIZATION: Use page's generation context if available, filter components by age
   */
  private buildPageEditPrompt(
    target: WorksheetEditTarget,
    instruction: string,
    context: WorksheetEditContext
  ): string {
    const pageData = target.data as any; // ParsedPage
    const sanitizedData = this.sanitizeDataForPrompt(pageData);
    const pageJson = JSON.stringify(sanitizedData, null, 2);
    
    // TOKEN OPTIMIZATION: Use page's generation context if available
    const genContext = pageData.generationContext;
    const hasContext = !!genContext;
    
    // TOKEN OPTIMIZATION: Filter components by age group
    const allSchemas = worksheetComponentSchemaService.getAllComponentSchemas();
    const filteredSchemas = this.filterComponentsByAge(
      allSchemas, 
      genContext?.ageGroup || context.ageGroup
    );
    
    const componentLibrary = this.buildComponentLibraryDoc(filteredSchemas);
    
    // TOKEN OPTIMIZATION: Only include topic/difficulty if page was generated with them
    const contextSection = hasContext ? `
**WORKSHEET CONTEXT:**
- Topic: ${genContext.topic}
- Age Group: ${genContext.ageGroup}
- Difficulty: ${genContext.difficulty}
- Language: ${genContext.language}
` : `
**WORKSHEET CONTEXT:**
- Language: ${context.language}
- Age Group: ${context.ageGroup || 'general'}
`;

    const ageGroup = genContext?.ageGroup || context.ageGroup;
    const ageGuidelines = ageGroup ? worksheetComponentSchemaService.getAgeGroupGuidelines(ageGroup) : null;

    const guidelinesSection = ageGuidelines ? `
**AGE GROUP GUIDELINES FOR ${ageGroup}:**
- Reading Level: ${ageGuidelines.readingLevel}
- Attention Span: ~${ageGuidelines.attentionSpan} minutes
- Complexity: ${ageGuidelines.complexity}
- Recommended Types: ${ageGuidelines.recommendedExerciseTypes.join(', ')}

**TEXT LENGTH GUIDELINES:**
- Title: ${ageGuidelines.textLengthGuidelines.title}
- Instructions: ${ageGuidelines.textLengthGuidelines.instruction}
- Body Text: ${ageGuidelines.textLengthGuidelines.bodyText}
- Questions: ${ageGuidelines.textLengthGuidelines.question}
` : '';

    return `You are a worksheet editor. Edit this page based on user instruction.

**PAGE DATA:**
\`\`\`json
${pageJson}
\`\`\`

**USER INSTRUCTION:** ${instruction}

${contextSection}
${guidelinesSection}

${componentLibrary}

**RULES:**
1. Return COMPLETE updated elements array
2. Use ONLY components from library above
3. Use ${context.language} for text
4. Each element needs: id, type, position, size, properties, zIndex, locked, visible
5. DO NOT include "url" if [BASE64_IMAGE_DATA_OMITTED]

**RETURN FORMAT (JSON only):**
{
  "patch": { "elements": [...] },
  "changes": [...]
}

Return ONLY valid JSON. No explanations, no markdown formatting.`;
  }

  /**
   * Build component library documentation
   */
  private buildComponentLibraryDoc(schemas: any[]): string {
    let doc = '# COMPONENT LIBRARY\n\n';
    doc += 'You can use these educational components to build the worksheet:\n\n';

    schemas.forEach((schema, index) => {
      doc += `## ${index + 1}. ${schema.name} (type: "${schema.id}")\n`;
      doc += `**Category:** ${schema.category}\n`;
      doc += `**Description:** ${schema.description}\n`;
      doc += `**Use Cases:** ${schema.useCases.join(', ')}\n\n`;

      doc += '**Properties:**\n';
      Object.entries(schema.properties).forEach(([propName, propSchema]: [string, any]) => {
        const required = propSchema.required ? '(required)' : '(optional)';
        const defaultVal = propSchema.default ? ` [default: ${JSON.stringify(propSchema.default)}]` : '';
        doc += `- \`${propName}\` ${required}${defaultVal}: ${propSchema.description}\n`;
        
        if (propSchema.enum) {
          doc += `  - Allowed values: ${propSchema.enum.map((v: string) => `"${v}"`).join(', ')}\n`;
        }
        
        if (propSchema.examples && propSchema.examples.length > 0) {
          doc += `  - Examples: ${propSchema.examples.map((ex: any) => JSON.stringify(ex)).slice(0, 2).join(', ')}\n`;
        }
      });

      if (schema.examples && schema.examples.length > 0) {
        doc += '\n**Example Usage:**\n```json\n';
        doc += JSON.stringify({
          type: schema.id,
          properties: schema.examples[0].properties,
        }, null, 2);
        doc += '\n```\n';
      }

      doc += '\n---\n\n';
    });

    return doc;
  }

  /**
   * Call Gemini API - following GeminiWorksheetGenerationService pattern
   */
  private async callGeminiAPI(prompt: string, maxTokens: number = 16384, userId?: string): Promise<string> {
    const temperature = 0.7;
    const model = 'gemini-2.5-flash';

    // Estimate token count from prompt length
    const estimatedPromptTokens = Math.floor(prompt.length / 4);
    const promptSizeKB = Math.round(prompt.length / 1024);
    const promptSizeMB = (prompt.length / (1024 * 1024)).toFixed(2);

    // Log detailed prompt analysis
    console.log('🤖 [GEMINI_EDIT_API] Calling Gemini:', {
      model,
      temperature,
      maxTokens,
      promptLength: prompt.length,
      promptSizeKB: `${promptSizeKB}KB`,
      promptSizeMB: `${promptSizeMB}MB`,
      estimatedPromptTokens: `~${estimatedPromptTokens} tokens`,
      estimatedCost: `~$${(estimatedPromptTokens * 0.000001).toFixed(6)}`
    });
    
    // Warning if prompt is very large (even after sanitization)
    if (promptSizeKB > 100) {
      console.warn('⚠️ [GEMINI_EDIT_API] Large prompt detected:', {
        size: `${promptSizeKB}KB`,
        tokens: `~${estimatedPromptTokens}`,
        message: 'Consider additional optimization if Base64 images are still present'
      });
    }

    try {
      const response = await this.client.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature,
          maxOutputTokens: maxTokens,
          topP: 0.9,
          topK: 40,
          responseMimeType: 'application/json', // Request JSON response
        },
      });

      const content = response.text;

      if (!content) {
        throw new Error('Empty response from Gemini API');
      }

      console.log('✅ [GEMINI_EDIT_API] Response received, length:', content.length, {
        hasUsageMetadata: !!response.usageMetadata
      });

      // Track token usage if userId is provided
      if (userId && response.usageMetadata) {
        await tokenTrackingService.trackTokenUsage({
          userId,
          serviceName: 'worksheet_editing',
          model,
          inputTokens: response.usageMetadata.promptTokenCount || 0,
          outputTokens: response.usageMetadata.candidatesTokenCount || 0,
          metadata: {
            operation: 'edit'
          }
        });
      }

      return content;

    } catch (error) {
      console.error('❌ [GEMINI_EDIT_API] API call failed:', error);
      throw new Error(`Gemini API failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse AI response and extract JSON
   */
  private parseAIResponse(responseText: string): WorksheetEditResult {
    try {
      // Remove markdown code blocks if present
      let cleanedText = responseText.trim();

      // Remove ```json and ``` markers
      cleanedText = cleanedText.replace(/^```json\s*/i, '');
      cleanedText = cleanedText.replace(/^```\s*/i, '');
      cleanedText = cleanedText.replace(/\s*```$/i, '');

      // Find JSON content between curly braces
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanedText);

      // Validate response structure
      if (!parsed.patch) {
        throw new Error('Missing "patch" field in AI response');
      }

      if (!parsed.changes || !Array.isArray(parsed.changes)) {
        console.warn('⚠️ Missing or invalid "changes" field, using empty array');
        parsed.changes = [];
      }

      // Extract imagePrompt if present (for image components)
      const imagePrompt = parsed.patch?.properties?.imagePrompt;
      
      if (imagePrompt) {
        console.log('🎨 [PARSE] New image prompt generated:', imagePrompt.substring(0, 80) + '...');
      }

      return {
        patch: parsed.patch,
        changes: parsed.changes,
        imagePrompt: imagePrompt || undefined
      };

    } catch (error) {
      console.error('❌ [PARSE_ERROR] Failed to parse AI response:', error);
      console.error('Response text:', responseText);
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const geminiWorksheetEditingService = new GeminiWorksheetEditingService();
