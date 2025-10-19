# Element Editing Token Optimization

## Overview

This document describes the token optimization implemented for worksheet element editing through the right panel properties editor.

## Problem

Previously, when editing a single element through the AI assistant in the right panel, the entire element object was sent to the AI API, including:
- `id` - element identifier
- `type` - component type
- `position` - { x, y } coordinates
- `size` - { width, height } dimensions
- `zIndex` - layer order
- `locked` - lock state
- `visible` - visibility state
- `properties` - actual component properties

This resulted in unnecessary token usage, as layout properties (`position`, `size`, `zIndex`, `locked`, `visible`) are not relevant for content editing and are preserved automatically.

## Solution

Implemented minimal context extraction that sends only:
- `type` - component type (needed for schema validation)
- `properties` - component properties (actual editable content)

### Implementation

File: `src/services/worksheet/GeminiWorksheetEditingService.ts`

```typescript
/**
 * Extract minimal context for component editing (token optimization)
 * Only include fields that are relevant for editing, excluding layout/visual properties
 */
private extractMinimalElementContext(element: CanvasElement): any {
  const minimalContext = {
    type: element.type,
    properties: this.sanitizeDataForPrompt(element.properties || {})
  };

  // Calculate and log token savings
  const fullElementString = JSON.stringify(element);
  const minimalContextString = JSON.stringify(minimalContext);
  const savedChars = fullElementString.length - minimalContextString.length;
  const estimatedTokenSavings = Math.floor(savedChars / 4);

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
```

## Results

Based on testing with 5 different element types:

| Element Type | Full Size | Minimal Size | Saved | Reduction |
|--------------|-----------|--------------|-------|-----------|
| Title Block | 229 chars | 107 chars | ~30 tokens | 53% |
| Body Text | 286 chars | 164 chars | ~30 tokens | 43% |
| Image Placeholder | 387 chars | 264 chars | ~30 tokens | 32% |
| Fill in the Blank | 354 chars | 232 chars | ~30 tokens | 34% |
| Interactive Component | 572 chars | 443 chars | ~32 tokens | 23% |

**Average Reduction: 34%** (~154 tokens saved per 5 elements)

## Benefits

1. **Reduced Token Usage**: Average 34% reduction in prompt size
2. **Faster API Responses**: Less data to process
3. **Lower Costs**: Fewer tokens = lower API costs
4. **Same Functionality**: AI only needs type + properties for editing
5. **Automatic Preservation**: Layout properties are maintained automatically

## API Flow

### Before Optimization

```
User edits element → Full element sent to API → 
{
  id: 'element-123',
  type: 'body-text',
  position: { x: 50, y: 200 },
  size: { width: 500, height: 200 },
  zIndex: 2,
  locked: false,
  visible: true,
  properties: { text: '...', variant: 'paragraph' }
}
→ AI processes all fields → Returns patch
```

### After Optimization

```
User edits element → Minimal context sent to API → 
{
  type: 'body-text',
  properties: { text: '...', variant: 'paragraph' }
}
→ AI processes only relevant fields → Returns patch → 
Layout properties preserved automatically
```

## Monitoring

Token savings are logged in the console for each edit request:

```
📊 [TOKEN_OPTIMIZATION] Minimal context created {
  fullSize: 286,
  minimalSize: 164,
  savedChars: 122,
  estimatedTokenSavings: '~30 tokens',
  reductionPercent: '43%',
  excludedFields: ['id', 'position', 'size', 'zIndex', 'locked', 'visible']
}
```

## Future Improvements

Potential areas for further optimization:

1. **Property-specific editing**: If user is editing only one property (e.g., text), send only that property
2. **Delta-based updates**: Track what changed and send only deltas
3. **Cached schemas**: Reference schemas by ID instead of sending full schema
4. **Compression**: Use abbreviated field names in prompts

## Notes

- This optimization applies only to **component editing** (single element)
- **Page editing** still sends the full page context (needed for adding/removing elements)
- Layout properties are always preserved in the response
- Base64 image URLs are still sanitized (replaced with `[BASE64_IMAGE_DATA_OMITTED]`)

