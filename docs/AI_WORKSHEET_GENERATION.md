# AI Worksheet Generation System 🤖

## Overview

Complete AI-powered worksheet generation system using **Gemini 2.5 Flash** to create educational worksheets with atomic components.

## Architecture

```
User Input → API Endpoint → Gemini Service → Parser → Canvas Editor
```

### Flow

1. **User Input** (Step1) - topic, age group, exercise types, number of pages
2. **API Call** - `/api/worksheet/generate` with request parameters
3. **AI Generation** - Gemini 2.5 Flash generates JSON with components
4. **Parsing** - Convert AI JSON to full `CanvasElement[]` with IDs, zIndex
5. **Display** - Show in Canvas Editor for editing and export

## Components

### 1. Types (`src/types/worksheet-generation.ts`)

All TypeScript interfaces for the system:
- `WorksheetGenerationRequest` - input parameters
- `WorksheetGenerationResponse` - AI response
- `GeneratedPage` - single page with elements
- `ParsedWorksheet` - full worksheet with `CanvasElement[]`
- `ComponentSchema` - component description for AI

### 2. Component Schema Service

**File:** `src/services/worksheet/WorksheetComponentSchemaService.ts`

Describes all 14 atomic components for AI:
- `title-block`, `body-text`, `instructions-box`
- `fill-blank`, `multiple-choice`, `true-false`, `short-answer`
- `tip-box`, `warning-box`, `image-placeholder`
- `divider`, `bullet-list`, `numbered-list`, `table`

Each component includes:
- Properties schema with types and defaults
- Use cases and descriptions
- Examples for different age groups
- Educational guidelines

### 3. Gemini Generation Service

**File:** `src/services/worksheet/GeminiWorksheetGenerationService.ts`

Main AI generation service:
- Builds detailed prompt with component library
- Includes age-specific educational guidelines
- Calls Gemini 2.5 Flash API
- Returns structured JSON response

**Key Features:**
- Age-appropriate content (text length, complexity)
- Component variety and balance
- Educational best practices
- JSON-only output with validation

### 4. Parser Service

**File:** `src/services/worksheet/WorksheetGenerationParser.ts`

Converts AI JSON to full `CanvasElement[]`:
- Adds `id`, `zIndex`, `position`, `size`
- Validates component properties
- Fills missing required fields with defaults
- Returns complete worksheet ready for canvas

**Validation:**
- Component type checking
- Property validation
- Structure validation
- Error and warning reporting

### 5. API Endpoint

**File:** `src/app/api/worksheet/generate/route.ts`

Server-side API route:
```typescript
POST /api/worksheet/generate

Request:
{
  topic: string;
  ageGroup: string;
  exerciseTypes?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  language?: string;
  pageCount?: number;
  includeImages?: boolean;
  additionalInstructions?: string;
}

Response:
{
  success: boolean;
  data: {
    worksheet: ParsedWorksheet;
    validation: {
      isValid: boolean;
      warnings: string[];
    };
  };
}
```

### 6. UI Integration

**Modified Files:**
- `src/components/worksheet/WorksheetEditor.tsx` - main editor
- `src/components/worksheet/Step3CanvasEditor.tsx` - canvas display

**Features:**
- Real-time generation progress
- Error handling and display
- Automatic page initialization
- Seamless canvas integration

## Usage

### Basic Generation

```typescript
// User fills parameters in Step1
const params = {
  topic: 'Present Simple Tense',
  level: 'intermediate',
  numberOfPages: 3,
  focusAreas: ['grammar', 'vocabulary'],
  exerciseTypes: ['fill-blanks', 'multiple-choice'],
};

// System calls API
const response = await fetch('/api/worksheet/generate', {
  method: 'POST',
  body: JSON.stringify({
    topic: params.topic,
    ageGroup: params.level,
    pageCount: params.numberOfPages,
    exerciseTypes: params.exerciseTypes,
    difficulty: 'medium',
    language: 'en',
  }),
});

// Get parsed worksheet
const { worksheet } = await response.json();

// Display in canvas
<Step3CanvasEditor generatedWorksheet={worksheet} />
```

## Educational Guidelines

### Age-Specific Adaptation

System adapts content for different age groups:

**3-5 years:**
- Very simple vocabulary
- 5-minute attention span
- Critical visual importance
- Short text (2-4 word titles)

**6-7 years:**
- Early reader level
- 10-minute attention span
- High visual importance
- Recommended: fill-blank, multiple-choice, images

**8-9 years:**
- Developing reader
- 15-minute attention span
- Moderate complexity
- Balanced exercises

**10-11 years:**
- Fluent reader
- 20-minute attention span
- Complex topics possible
- More text-heavy

**12-13 years:**
- Advanced reader
- 25-minute attention span
- Complex analysis
- Short answer questions

### Component Mix Recommendations

**Per Page:**
- 1 Title (title-block)
- 1-2 Instructions (instructions-box)
- 2-3 Text Blocks (body-text, lists)
- 2-4 Exercises (fill-blank, multiple-choice, etc.)
- 1-2 Helper Boxes (tip-box, warning-box)
- 0-2 Images
- 1-2 Dividers

### Ordering Best Practices

1. **Introduction:** title → instructions
2. **Teaching:** explanation → examples → tips
3. **Practice:** exercises with variety
4. **Visual Aid:** images near relevant content
5. **Separation:** dividers between sections

## Gemini Prompt Structure

The prompt includes:

1. **Task Description** - what to generate
2. **Generation Parameters** - topic, age, difficulty
3. **Educational Guidelines** - age-specific rules
4. **Component Library** - detailed component docs
5. **Structure Rules** - page organization
6. **Response Format** - JSON schema
7. **Examples** - good worksheet examples
8. **Critical Rules** - validation checklist

## Error Handling

### AI Response Validation

- JSON parsing errors
- Missing required fields
- Invalid component types
- Property validation
- Structure validation

### User Feedback

- Clear error messages
- Generation progress indicators
- Validation warnings
- Retry mechanism

## Performance

### Generation Time

- 1 page: ~10-15 seconds
- 3 pages: ~20-30 seconds
- 5 pages: ~30-45 seconds

### Optimization

- Efficient prompts
- Minimal token usage
- Fast parsing
- Cached component schemas

## Future Enhancements

### Planned Features

1. **Multi-language Support** - generate in Ukrainian, Spanish, etc.
2. **Custom Templates** - save and reuse generation templates
3. **Batch Generation** - create multiple worksheets at once
4. **AI Refinement** - "improve this page" command
5. **Style Customization** - brand colors, fonts
6. **Content Library** - reusable exercise banks
7. **Difficulty Adjustment** - auto-adjust complexity
8. **Assessment Integration** - answer keys, scoring

### Technical Improvements

1. **Streaming Responses** - see pages as they generate
2. **Caching** - cache common topics
3. **Parallel Generation** - generate pages in parallel
4. **Image Generation** - AI-generated images
5. **Version Control** - track worksheet revisions

## Testing

### Test Scenarios

1. **Basic Generation** - simple 1-page worksheet
2. **Multi-Page** - 5-page complex worksheet
3. **Age Variation** - different age groups
4. **Exercise Types** - all component types
5. **Error Cases** - invalid inputs, API failures

### Manual Testing

```bash
# 1. Open worksheet editor
http://localhost:3000/worksheet-editor

# 2. Fill parameters
- Topic: "Solar System"
- Level: "Intermediate"
- Pages: 3
- Exercise Types: All

# 3. Click "Generate My Worksheet"
# 4. Wait for generation (20-30 sec)
# 5. Verify canvas shows all pages
# 6. Test editing, export, save
```

## Troubleshooting

### Common Issues

**Generation fails:**
- Check GEMINI_API_KEY in environment
- Verify API quota
- Check network connection

**Empty pages:**
- Check parser logs
- Verify component types
- Check element properties

**Invalid JSON:**
- Review AI response format
- Check prompt structure
- Adjust temperature

## Files Created/Modified

### New Files
- `src/types/worksheet-generation.ts`
- `src/services/worksheet/WorksheetComponentSchemaService.ts`
- `src/services/worksheet/GeminiWorksheetGenerationService.ts`
- `src/services/worksheet/WorksheetGenerationParser.ts`
- `src/app/api/worksheet/generate/route.ts`

### Modified Files
- `src/components/worksheet/WorksheetEditor.tsx`
- `src/components/worksheet/Step3CanvasEditor.tsx`

## Credits

- **AI Model:** Google Gemini 2.5 Flash
- **Architecture:** Atomic Components System
- **Framework:** Next.js 14+ with TypeScript
- **UI:** Material-UI

---

**Last Updated:** December 2024  
**Status:** ✅ Production Ready

