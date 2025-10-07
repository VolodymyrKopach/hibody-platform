/**
 * Service for AI-powered worksheet generation using Gemini 2.5 Flash
 * Generates complete worksheets with educational components based on topic and age group
 */

import { GoogleGenAI } from '@google/genai';
import {
  WorksheetGenerationRequest,
  WorksheetGenerationResponse,
  GeneratedPage,
  AIGenerationOptions,
  GeneratedElement,
} from '@/types/worksheet-generation';
import { worksheetComponentSchemaService } from './WorksheetComponentSchemaService';
import { ContentPaginationService, PAGE_CONFIGS } from './ContentPaginationService';
import { ageBasedContentService, type Duration as AgeDuration } from './AgeBasedContentService';

export class GeminiWorksheetGenerationService {
  private client: GoogleGenAI;
  private paginationService: ContentPaginationService;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.client = new GoogleGenAI({ apiKey });
    this.paginationService = new ContentPaginationService(PAGE_CONFIGS.A4);
  }

  /**
   * Generate complete worksheet with AI
   */
  async generateWorksheet(
    request: WorksheetGenerationRequest,
    options: AIGenerationOptions = {}
  ): Promise<WorksheetGenerationResponse> {
    console.log('🎯 [WORKSHEET_GEN] Starting worksheet generation (AUTO-PAGINATION):', {
      topic: request.topic,
      ageGroup: request.ageGroup,
      duration: request.duration || 'standard',
    });

    try {
      // Build prompt with component library and educational guidelines
      // AI generates all content without page breaks
      const prompt = this.buildGenerationPrompt(request);

      // Call Gemini API - AI generates one big content list
      const response = await this.callGeminiAPI(prompt, options);

      // Parse response to get all elements
      const allElements = this.parseGeminiResponseToElements(response, request);

      // === Validate component count for age group ===
      const validation = ageBasedContentService.validateComponentCount(
        request.ageGroup,
        request.duration as AgeDuration || 'standard',
        allElements.length
      );
      
      if (!validation.valid) {
        console.warn('⚠️ [WORKSHEET_GEN] Component count validation:', validation.reason);
        console.warn(`   Suggested: ${validation.suggestion}, Actual: ${allElements.length}`);
      } else {
        console.log('✅ [WORKSHEET_GEN] Component count appropriate for age group');
      }

      // Smart auto-pagination - distribute elements across pages
      console.log('📄 [WORKSHEET_GEN] Auto-paginating content...');
      // Set age range for proper component sizing
      this.paginationService.setAgeRange(request.ageGroup);
      const paginationResult = this.paginationService.paginateContent(
        allElements,
        `${request.topic} Worksheet`
      );

      // Build final response with paginated content
      const finalResponse: WorksheetGenerationResponse = {
        pages: paginationResult.pages,
        metadata: {
          topic: request.topic,
          ageGroup: request.ageGroup,
          difficulty: request.difficulty || 'medium',
          language: request.language || 'en',
          pageCount: paginationResult.totalPages,
          generatedAt: new Date().toISOString(),
          componentsUsed: this.getComponentTypesUsed(allElements),
          estimatedDuration: this.estimateDurationFromElements(allElements),
          autoPaginated: true,
        },
      };

      console.log('✅ [WORKSHEET_GEN] Generation successful (AUTO-PAGINATED):', {
        totalElements: allElements.length,
        totalPages: paginationResult.totalPages,
        elementsPerPage: paginationResult.elementsPerPage.join(', '),
        totalComponents: paginationResult.pages.reduce((sum, p) => sum + p.elements.length, 0),
      });

      return finalResponse;
    } catch (error) {
      console.error('❌ [WORKSHEET_GEN] Generation failed:', error);
      throw error;
    }
  }

  /**
   * Build detailed prompt for Gemini with component library
   */
  private buildGenerationPrompt(request: WorksheetGenerationRequest): string {
    const {
      topic,
      ageGroup,
      exerciseTypes = [],
      difficulty = 'medium',
      language = 'en',
      duration = 'standard',
      includeImages = true,
      additionalInstructions = '',
    } = request;

    // Get component schemas and age guidelines
    const schemas = worksheetComponentSchemaService.getAllComponentSchemas();
    const ageGuidelines = worksheetComponentSchemaService.getAgeGroupGuidelines(ageGroup);

    // Build component library documentation
    const componentLibrary = this.buildComponentLibraryDoc(schemas);

    // Build examples
    const examples = this.buildExamples();

    // === Get age-based content requirements ===
    const ageSpecificGuidelines = ageBasedContentService.formatForPrompt(
      ageGroup,
      duration as AgeDuration
    );
    
    const contentAmount = ageBasedContentService.calculateComponentCount(
      ageGroup,
      duration as AgeDuration
    );

    // Map duration to time guidance
    const durationMap: Record<string, string> = {
      quick: '10-15 minutes',
      standard: '20-30 minutes',
      extended: '40-50 minutes',
    };
    const durationGuidance = durationMap[duration] || durationMap['standard'];

    const prompt = `You are an expert educational content creator specializing in worksheet generation for children.

# TASK
Generate a complete educational worksheet about "${topic}" for age group ${ageGroup} (${ageGuidelines.readingLevel}).

**IMPORTANT: Generate ALL content as a SINGLE list of components. Do NOT organize into pages. The system will automatically distribute content across pages based on actual component sizes.**

# GENERATION PARAMETERS
- **Topic:** ${topic}
- **Age Group:** ${ageGroup} years old
- **Reading Level:** ${ageGuidelines.readingLevel}
- **Difficulty:** ${difficulty}
- **Language:** ${language}
- **Duration:** ${duration} - ${durationGuidance}
- **Include Images:** ${includeImages ? 'Yes' : 'No'}
- **Attention Span:** ~${ageGuidelines.attentionSpan} minutes
${exerciseTypes.length > 0 ? `- **Preferred Exercise Types:** ${exerciseTypes.join(', ')} (prioritize these, but you can include others if beneficial)` : '- **Exercise Types:** Use any appropriate types based on topic and age'}
${additionalInstructions ? `- **Additional Instructions:** ${additionalInstructions}` : ''}

# EDUCATIONAL GUIDELINES FOR AGE ${ageGroup}

${ageSpecificGuidelines}

## Text Length Guidelines
- **Title:** ${ageGuidelines.textLengthGuidelines.title}
- **Instructions:** ${ageGuidelines.textLengthGuidelines.instruction}
- **Body Text:** ${ageGuidelines.textLengthGuidelines.bodyText}
- **Questions:** ${ageGuidelines.textLengthGuidelines.question}

## Complexity Level
- **Complexity:** ${ageGuidelines.complexity}
- **Visual Importance:** ${ageGuidelines.visualImportance}
- **Recommended Exercises:** ${ageGuidelines.recommendedExerciseTypes.join(', ')}

## Content Principles
1. **Age-Appropriate Language:** Use simple, clear vocabulary suitable for ${ageGuidelines.readingLevel}
2. **Engagement:** Include variety to maintain attention for ${ageGuidelines.attentionSpan} minutes
3. **Visual Support:** ${ageGuidelines.visualImportance === 'critical' || ageGuidelines.visualImportance === 'high' ? 'Use images and visual elements frequently' : 'Use images when helpful'}
4. **Progressive Difficulty:** Start easy, gradually increase challenge
5. **Clear Instructions:** Be explicit and step-by-step
6. **Balanced Mix:** ${exerciseTypes.length > 0 ? `Focus on preferred exercise types but include variety. You can use other types if they better fit the content.` : 'Combine different exercise types for engagement and choose the most appropriate for the topic.'}

${componentLibrary}

# CONTENT STRUCTURE RULES

## Content Organization (Linear Flow - Auto-Paginated Later)
1. **Start with Title:** Begin with title-block (level: 'main')
2. **Instructions Box:** Add instructions-box after title to guide students
3. **Content Flow:** Explanation → Examples → Exercises → Review
4. **Variety:** Mix different component types for engagement
5. **Visual Breaks:** Use dividers between major sections
6. **Images:** Place images near related content

## Component Ordering Best Practices
- **Introduction:** title-block → body-text/instructions-box
- **Teaching:** body-text → tip-box → examples (bullet-list/numbered-list)
- **Practice:** instructions-box → exercise components (fill-blank, multiple-choice, etc.)
- **Visual Aid:** image-placeholder near relevant content
- **Warnings:** warning-box before difficult exercises
- **Separation:** divider between major sections

## TARGET COMPONENT COUNT
**YOU MUST GENERATE ${contentAmount.targetCount} COMPONENTS (Range: ${contentAmount.minCount}-${contentAmount.maxCount})**

This count is specifically calculated for:
- Age Group: ${ageGroup} years
- Duration: ${duration} (${durationGuidance})
- Processing Speed: This age group processes content at a specific pace
- Attention Span: Optimized to maintain engagement without overwhelming

## Recommended Component Mix
Distribute your ${contentAmount.targetCount} components as follows:
- **1 Main Title** (title-block with level 'main')
- **1-2 Instructions** (instructions-box)
- **${Math.ceil(contentAmount.targetCount * 0.3)} Text/Explanation Blocks** (body-text, bullet-list, numbered-list)
- **${Math.ceil(contentAmount.targetCount * 0.5)} Exercise Components** (use age-appropriate types listed above)
- **${Math.ceil(contentAmount.targetCount * 0.1)} Helper Elements** (tip-box, warning-box, dividers)
- **${includeImages ? Math.ceil(contentAmount.targetCount * 0.1) : 0} Images** (if includeImages is true)

**CRITICAL:** Aim for exactly ${contentAmount.targetCount} components. Quality matters - ensure each component is engaging and age-appropriate.

# RESPONSE FORMAT

**IMPORTANT:** Generate content as a SINGLE linear list of components. Do NOT split into pages - the system will auto-paginate.

You MUST respond with ONLY valid JSON in this exact format:

{
  "topic": "${topic}",
  "ageGroup": "${ageGroup}",
  "elements": [
    {
      "type": "title-block",
      "properties": {
        "text": "Main Title",
        "level": "main",
        "align": "center"
      }
    },
    {
      "type": "instructions-box",
      "properties": {
        "text": "Complete the exercises below.",
        "type": "general"
      }
    },
    {
      "type": "body-text",
      "properties": {
        "text": "Explanation text here...",
        "variant": "paragraph"
      }
    },
    {
      "type": "fill-blank",
      "properties": {
        "items": [
          {
            "number": 1,
            "text": "Sentence with ______ blank.",
            "hint": "answer"
          }
        ],
        "wordBank": ["word1", "word2", "word3"]
      }
    }
  ]
}

# CRITICAL RULES

1. **Valid JSON Only:** No markdown, no code blocks, no extra text - just pure JSON
2. **Required Fields:** Every component must have 'type' and 'properties'
3. **Component Types:** Only use types from the component library above
4. **Properties:** Match the property schema for each component type exactly
5. **Age-Appropriate:** Follow text length and complexity guidelines for age ${ageGroup}
6. **Logical Order:** Components should flow naturally (title → instructions → content → exercises)
7. **Balanced Content:** Don't overwhelm with too many exercises or too much text
8. **Language:** All user-facing text in ${language}, technical fields in English
9. **Images (IMPORTANT):** ${includeImages ? 
  'When using image-placeholder, ALWAYS provide "imagePrompt" instead of "url". The imagePrompt should be a detailed, child-friendly description for AI image generation (e.g., "A friendly T-Rex dinosaur in prehistoric forest, educational illustration for children"). DO NOT provide url field when using imagePrompt.' : 
  'Do not include any image-placeholder components.'}

# EXAMPLES OF GOOD WORKSHEETS

${examples}

# FINAL CHECKLIST BEFORE GENERATING

- [ ] Age-appropriate vocabulary and sentence structure?
- [ ] Text lengths follow guidelines for age ${ageGroup}?
- [ ] Good mix of component types?
- [ ] Clear instructions for each exercise?
- [ ] Logical flow from introduction to exercises?
- [ ] Tips or warnings where helpful?
- [ ] Images included (if requested)?
- [ ] Dividers to separate sections?
- [ ] Valid JSON with correct component types and properties?

Now generate the worksheet as pure JSON:`;

    return prompt;
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
   * Build examples of good worksheets
   */
  private buildExamples(): string {
    return `
## Example 1: Simple Worksheet (Age 6-7)

\`\`\`json
{
  "topic": "Colors",
  "ageGroup": "6-7",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Learning Colors",
      "elements": [
        {
          "type": "title-block",
          "properties": {
            "text": "Colors Around Us",
            "level": "main",
            "align": "center"
          }
        },
        {
          "type": "instructions-box",
          "properties": {
            "text": "Look at the pictures and answer the questions.",
            "type": "general"
          }
        },
        {
          "type": "body-text",
          "properties": {
            "text": "Colors are everywhere! Red, blue, yellow, green - can you find them?",
            "variant": "paragraph"
          }
        },
        {
          "type": "image-placeholder",
          "properties": {
            "caption": "A colorful rainbow",
            "width": 400,
            "height": 300,
            "align": "center"
          }
        },
        {
          "type": "multiple-choice",
          "properties": {
            "items": [
              {
                "number": 1,
                "question": "What color is the sky?",
                "options": [
                  { "letter": "a", "text": "Red" },
                  { "letter": "b", "text": "Blue" },
                  { "letter": "c", "text": "Green" }
                ]
              }
            ]
          }
        }
      ]
    }
  ]
}
\`\`\`

## Example 2: Grammar Worksheet (Age 10-11)

\`\`\`json
{
  "topic": "Present Simple Tense",
  "ageGroup": "10-11",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Present Simple Practice",
      "elements": [
        {
          "type": "title-block",
          "properties": {
            "text": "Present Simple Tense",
            "level": "main",
            "align": "center"
          }
        },
        {
          "type": "body-text",
          "properties": {
            "text": "We use the present simple tense to talk about habits, routines, and general truths. The verb changes for he, she, and it.",
            "variant": "paragraph"
          }
        },
        {
          "type": "tip-box",
          "properties": {
            "text": "Remember: Add 's' or 'es' to the verb when the subject is he, she, or it.",
            "type": "study"
          }
        },
        {
          "type": "divider",
          "properties": {
            "style": "solid",
            "thickness": 2,
            "spacing": "medium"
          }
        },
        {
          "type": "title-block",
          "properties": {
            "text": "Exercise 1: Fill in the Blanks",
            "level": "section",
            "align": "left"
          }
        },
        {
          "type": "instructions-box",
          "properties": {
            "text": "Complete the sentences using the correct form of the verb in brackets.",
            "type": "writing"
          }
        },
        {
          "type": "fill-blank",
          "properties": {
            "items": [
              {
                "number": 1,
                "text": "She ______ (go) to school every day.",
                "hint": "goes"
              },
              {
                "number": 2,
                "text": "They ______ (play) football on Saturdays.",
                "hint": "play"
              }
            ],
            "wordBank": ["goes", "go", "plays", "play"]
          }
        }
      ]
    }
  ]
}
\`\`\`
`;
  }

  /**
   * Call Gemini API with retry logic
   */
  private async callGeminiAPI(
    prompt: string,
    options: AIGenerationOptions = {}
  ): Promise<string> {
    const {
      temperature = 0.7,
      maxTokens = 32000,
      model = 'gemini-2.5-flash',
    } = options;

    console.log('🤖 [GEMINI_API] Calling Gemini:', {
      model,
      temperature,
      maxTokens,
      promptLength: prompt.length,
    });

    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [GEMINI_API] Attempt ${attempt}/${maxRetries}`);
        
        const response = await this.client.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature,
            maxOutputTokens: maxTokens,
            topP: 0.9,
            topK: 40,
          },
        });

        const content = response.text;

        if (!content) {
          throw new Error('Empty response from Gemini API');
        }

        console.log('✅ [GEMINI_API] Response received:', {
          responseLength: content.length,
          attempt,
        });

        return content;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`❌ [GEMINI_API] Attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s
          console.log(`⏳ [GEMINI_API] Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries failed
    console.error('❌ [GEMINI_API] All retry attempts failed');
    throw lastError || new Error('Failed to generate content after retries');
  }

  /**
   * Parse Gemini response to array of elements (NEW FORMAT)
   * Response format: { "topic": "...", "ageGroup": "...", "elements": [...] }
   */
  private parseGeminiResponseToElements(
    response: string,
    request: WorksheetGenerationRequest
  ): GeneratedElement[] {
    console.log('🔍 [PARSER] Parsing Gemini response to elements...');

    try {
      // Remove markdown code blocks if present
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*\n/, '').replace(/\n```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*\n/, '').replace(/\n```$/, '');
      }

      // Try to fix incomplete JSON
      if (!cleanedResponse.endsWith('}')) {
        console.warn('⚠️ [PARSER] Response appears incomplete, attempting to fix...');
        cleanedResponse = this.repairIncompleteJSON(cleanedResponse);
      }

      // Parse JSON
      const parsed = JSON.parse(cleanedResponse);

      // Validate structure - NEW FORMAT with elements array
      if (!parsed.elements || !Array.isArray(parsed.elements)) {
        throw new Error('Invalid response: missing "elements" array');
      }

      console.log('✅ [PARSER] Parsing successful:', {
        totalElements: parsed.elements.length,
      });

      return parsed.elements;
    } catch (error) {
      console.error('❌ [PARSER] Parsing failed:', error);
      console.error('Response length:', response.length);
      console.error('Response preview (first 500):', response.substring(0, 500));
      console.error('Response preview (last 500):', response.substring(Math.max(0, response.length - 500)));
      throw new Error(`Failed to parse Gemini response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Repair incomplete JSON response from LLM
   * Handles unterminated strings, missing brackets, and incomplete objects
   */
  private repairIncompleteJSON(json: string): string {
    console.log('🔧 [PARSER] Attempting to repair incomplete JSON...');
    
    let repaired = json;
    
    // Step 1: Fix unterminated strings
    // Find the last quote and check if it's properly closed
    const lastQuoteIndex = repaired.lastIndexOf('"');
    if (lastQuoteIndex !== -1) {
      // Count quotes before this position
      const quotesBeforeCount = (repaired.substring(0, lastQuoteIndex).match(/"/g) || []).length;
      
      // If odd number of quotes, we have an unterminated string
      if (quotesBeforeCount % 2 === 0) {
        console.log('🔧 [PARSER] Detected unterminated string, closing it');
        // Find where the unterminated string likely ends
        // Look for common JSON delimiters after the last quote
        const afterLastQuote = repaired.substring(lastQuoteIndex + 1);
        const truncateMatch = afterLastQuote.match(/^[^,\]\}]*/);
        
        if (truncateMatch) {
          // Remove incomplete text after last quote and close the string
          repaired = repaired.substring(0, lastQuoteIndex + 1 + truncateMatch[0].length) + '"';
        }
      }
    }
    
    // Step 2: Count opening and closing brackets/braces
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    
    // Step 3: Remove trailing commas before adding closing brackets
    repaired = repaired.replace(/,(\s*)$/, '$1');
    
    // Step 4: Add missing closing brackets and braces
    const missingBrackets = openBrackets - closeBrackets;
    const missingBraces = openBraces - closeBraces;
    
    if (missingBrackets > 0 || missingBraces > 0) {
      console.log(`🔧 [PARSER] Adding ${missingBrackets} brackets and ${missingBraces} braces`);
      
      // Close arrays first, then objects
      repaired += ']'.repeat(Math.max(0, missingBrackets));
      repaired += '}'.repeat(Math.max(0, missingBraces));
    }
    
    // Step 5: Validate the structure makes sense
    // If we have elements array, ensure it's properly closed
    if (repaired.includes('"elements"') && !repaired.includes('"elements":[]')) {
      // Make sure elements array is closed
      const elementsIndex = repaired.indexOf('"elements"');
      const arrayStartIndex = repaired.indexOf('[', elementsIndex);
      
      if (arrayStartIndex !== -1) {
        const afterArrayStart = repaired.substring(arrayStartIndex);
        const arrayOpenCount = (afterArrayStart.match(/\[/g) || []).length;
        const arrayCloseCount = (afterArrayStart.match(/\]/g) || []).length;
        
        if (arrayOpenCount > arrayCloseCount) {
          console.log('🔧 [PARSER] Elements array not properly closed');
        }
      }
    }
    
    console.log('✅ [PARSER] JSON repair completed');
    return repaired;
  }

  /**
   * Parse Gemini response to WorksheetGenerationResponse (LEGACY - for backwards compatibility)
   */
  private parseGeminiResponse(
    response: string,
    request: WorksheetGenerationRequest
  ): WorksheetGenerationResponse {
    console.log('🔍 [PARSER] Parsing Gemini response...');

    try {
      // Remove markdown code blocks if present
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*\n/, '').replace(/\n```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*\n/, '').replace(/\n```$/, '');
      }

      // Parse JSON
      const parsed = JSON.parse(cleanedResponse);

      // Validate structure
      if (!parsed.pages || !Array.isArray(parsed.pages)) {
        throw new Error('Invalid response: missing "pages" array');
      }

      // Extract component types used
      const componentsUsed = new Set<string>();
      parsed.pages.forEach((page: GeneratedPage) => {
        page.elements?.forEach((element) => {
          componentsUsed.add(element.type);
        });
      });

      // Build response
      const result: WorksheetGenerationResponse = {
        pages: parsed.pages,
        metadata: {
          topic: request.topic,
          ageGroup: request.ageGroup,
          difficulty: request.difficulty || 'medium',
          language: request.language || 'en',
          pageCount: parsed.pages.length,
          generatedAt: new Date().toISOString(),
          componentsUsed: Array.from(componentsUsed),
          estimatedDuration: this.estimateDuration(parsed.pages),
          autoPaginated: false, // LEGACY format - pages were manually structured
        },
      };

      console.log('✅ [PARSER] Parsing successful:', {
        pages: result.pages.length,
        componentsUsed: result.metadata.componentsUsed,
        estimatedDuration: result.metadata.estimatedDuration,
      });

      return result;
    } catch (error) {
      console.error('❌ [PARSER] Parsing failed:', error);
      console.error('Response was:', response.substring(0, 500));
      throw new Error(`Failed to parse Gemini response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get component types used from elements array
   */
  private getComponentTypesUsed(elements: GeneratedElement[]): string[] {
    const componentsUsed = new Set<string>();
    elements.forEach((element) => {
      componentsUsed.add(element.type);
    });
    return Array.from(componentsUsed);
  }

  /**
   * Estimate completion duration from elements array (NEW)
   */
  private estimateDurationFromElements(elements: GeneratedElement[]): number {
    let minutes = 0;

    elements.forEach((element) => {
      // Rough estimates per component type
      switch (element.type) {
        case 'title-block':
          minutes += 0.5;
          break;
        case 'body-text':
          minutes += 1;
          break;
        case 'instructions-box':
          minutes += 0.5;
          break;
        case 'fill-blank':
          minutes += element.properties?.items?.length * 1 || 2;
          break;
        case 'multiple-choice':
          minutes += element.properties?.items?.length * 0.75 || 2;
          break;
        case 'true-false':
          minutes += element.properties?.items?.length * 0.5 || 1.5;
          break;
        case 'short-answer':
          minutes += element.properties?.items?.length * 2 || 4;
          break;
        case 'image-placeholder':
          minutes += 0.5;
          break;
        case 'match-pairs':
          minutes += element.properties?.pairs?.length * 1.5 || 3;
          break;
        case 'word-bank':
          minutes += 2;
          break;
        default:
          minutes += 0.5;
      }
    });

    return Math.ceil(minutes);
  }

  /**
   * Estimate completion duration based on content (LEGACY - for pages)
   */
  private estimateDuration(pages: GeneratedPage[]): number {
    const allElements: GeneratedElement[] = [];
    pages.forEach((page) => {
      if (page.elements) {
        allElements.push(...page.elements);
      }
    });
    return this.estimateDurationFromElements(allElements);
  }
}

// Singleton instance
export const geminiWorksheetGenerationService = new GeminiWorksheetGenerationService();

