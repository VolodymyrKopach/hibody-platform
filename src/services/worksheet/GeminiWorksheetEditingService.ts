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
      // Build prompt based on target type
      const prompt = target.type === 'component'
        ? this.buildComponentEditPrompt(target, instruction, context)
        : this.buildPageEditPrompt(target, instruction, context);

      console.log('📝 [GEMINI_WORKSHEET_EDITING] Calling Gemini API...');

      // Call Gemini API with appropriate token limit based on target type
      const maxTokens = target.type === 'page' ? 8192 : 4096;
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
      
      // Replace base64 image URLs with placeholder
      if (key === 'url' && typeof value === 'string' && value.startsWith('data:image')) {
        sanitized[key] = '[BASE64_IMAGE_DATA_OMITTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeDataForPrompt(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Build prompt for component editing
   */
  private buildComponentEditPrompt(
    target: WorksheetEditTarget,
    instruction: string,
    context: WorksheetEditContext
  ): string {
    const sanitizedData = this.sanitizeDataForPrompt(target.data);
    const componentData = JSON.stringify(sanitizedData, null, 2);
    const componentType = (target.data as CanvasElement).type;
    const isImageComponent = componentType === 'image-placeholder';

    // Special prompt for image components
    if (isImageComponent) {
      return `You are a worksheet editor AI assistant. Your task is to analyze the user's instruction for editing an image component and generate a NEW image prompt.

**CURRENT IMAGE COMPONENT:**
\`\`\`json
${componentData}
\`\`\`

**USER INSTRUCTION:** ${instruction}

**WORKSHEET CONTEXT:**
- Topic: ${context.topic}
- Age Group: ${context.ageGroup}
- Difficulty: ${context.difficulty}

**YOUR TASK:**
Analyze the user's instruction and generate a NEW image prompt that:
1. Reflects the requested changes
2. Is appropriate for age group ${context.ageGroup}
3. Fits the worksheet topic "${context.topic}"
4. Is in English (for image generation)
5. Is descriptive and clear (for Flux model)

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

    // Regular prompt for non-image components
    // Get component schema for validation
    const schema = worksheetComponentSchemaService.getSchemaByType(componentType);
    const schemaInfo = schema ? `

**COMPONENT SCHEMA:**
- Name: ${schema.name}
- Category: ${schema.category}
- Description: ${schema.description}

**Required Properties:**
${Object.entries(schema.properties)
  .filter(([_, propSchema]: [string, any]) => propSchema.required)
  .map(([propName, propSchema]: [string, any]) => `- \`${propName}\`: ${propSchema.description}`)
  .join('\n')}
` : '';

    return `You are a worksheet editor AI assistant. Your task is to edit a worksheet component based on the user's instruction.

**COMPONENT TYPE:** ${componentType}
**CURRENT DATA:**
\`\`\`json
${componentData}
\`\`\`

**USER INSTRUCTION:** ${instruction}

**WORKSHEET CONTEXT:**
- Topic: ${context.topic}
- Age Group: ${context.ageGroup}
- Difficulty: ${context.difficulty}
- Content Language: ${context.language}
${schemaInfo}
**IMPORTANT RULES:**
1. Return ONLY the changed fields in the "patch" object
2. Keep content age-appropriate for ${context.ageGroup}
3. Maintain educational value and clarity
4. Preserve the component structure and type
5. Ensure properties match the component schema
6. For text fields, use ${context.language} language
7. Be concise and focused on the specific instruction
8. DO NOT return the "url" field if it's marked as [BASE64_IMAGE_DATA_OMITTED] - it will be preserved automatically

**RETURN FORMAT - JSON ONLY (no markdown, no code blocks):**
{
  "patch": {
    "properties": {
      // ONLY include properties that changed
      // Example: "text": "New text value"
      // DO NOT include "url" field with [BASE64_IMAGE_DATA_OMITTED]
    }
  },
  "changes": [
    {
      "field": "property_name",
      "oldValue": "previous value",
      "newValue": "new value",
      "description": "Brief description of what changed in ${context.language}"
    }
  ]
}

Return ONLY valid JSON. No explanations, no markdown formatting.`;
  }

  /**
   * Build prompt for page editing
   */
  private buildPageEditPrompt(
    target: WorksheetEditTarget,
    instruction: string,
    context: WorksheetEditContext
  ): string {
    const sanitizedData = this.sanitizeDataForPrompt(target.data);
    const pageData = JSON.stringify(sanitizedData, null, 2);

    // Get component schemas and age guidelines
    const schemas = worksheetComponentSchemaService.getAllComponentSchemas();
    const ageGuidelines = worksheetComponentSchemaService.getAgeGroupGuidelines(context.ageGroup);
    const componentLibrary = this.buildComponentLibraryDoc(schemas);

    return `You are a worksheet editor AI assistant. Your task is to edit an entire worksheet page based on the user's instruction.

**PAGE DATA:**
\`\`\`json
${pageData}
\`\`\`

**USER INSTRUCTION:** ${instruction}

**WORKSHEET CONTEXT:**
- Topic: ${context.topic}
- Age Group: ${context.ageGroup}
- Difficulty: ${context.difficulty}
- Content Language: ${context.language}

**AGE GROUP GUIDELINES FOR ${context.ageGroup}:**
- Reading Level: ${ageGuidelines.readingLevel}
- Attention Span: ~${ageGuidelines.attentionSpan} minutes
- Complexity: ${ageGuidelines.complexity}
- Visual Importance: ${ageGuidelines.visualImportance}
- Recommended Exercise Types: ${ageGuidelines.recommendedExerciseTypes.join(', ')}

**TEXT LENGTH GUIDELINES:**
- Title: ${ageGuidelines.textLengthGuidelines.title}
- Instructions: ${ageGuidelines.textLengthGuidelines.instruction}
- Body Text: ${ageGuidelines.textLengthGuidelines.bodyText}
- Questions: ${ageGuidelines.textLengthGuidelines.question}

${componentLibrary}

**IMPORTANT RULES:**
1. You can add, modify, or remove components
2. Return the COMPLETE updated elements array
3. Use ONLY component types from the Component Library above
4. Match the property schema for each component type exactly
5. Maintain visual balance and educational flow
6. Keep content age-appropriate for ${context.ageGroup} (reading level: ${ageGuidelines.readingLevel})
7. Follow text length guidelines for age group
8. Each element must have: id, type, position, size, properties, zIndex, locked, visible
9. Generate new IDs for new elements: "element-{timestamp}-{random}"
10. For text content, use ${context.language} language
11. For image prompts, use English language
12. DO NOT include "url" field in properties if it's marked as [BASE64_IMAGE_DATA_OMITTED] - it will be preserved automatically

**RETURN FORMAT - JSON ONLY (no markdown, no code blocks):**
{
  "patch": {
    "title": "Updated page title (optional)",
    "elements": [
      // COMPLETE array of all elements (modified, added, and existing)
      // DO NOT include "url" field with [BASE64_IMAGE_DATA_OMITTED] value in element properties
    ]
  },
  "changes": [
    {
      "field": "elements",
      "oldValue": "summary of old state",
      "newValue": "summary of new state",
      "description": "Detailed description of what changed in ${context.language}"
    }
  ]
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
  private async callGeminiAPI(prompt: string, maxTokens: number = 4096, userId?: string): Promise<string> {
    const temperature = 0.7;
    const model = 'gemini-2.5-flash';

    console.log('🤖 [GEMINI_EDIT_API] Calling Gemini:', {
      model,
      temperature,
      maxTokens,
      promptLength: prompt.length,
    });

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
