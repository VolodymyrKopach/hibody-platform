# HTML Minification System

## Overview

The HTML Minification System is designed to reduce the number of tokens sent to AI APIs (like Gemini) when editing slides. This optimization significantly reduces API costs and improves response times by removing unnecessary whitespace, comments, and redundant code from HTML content.

## Key Benefits

- **Token Reduction**: 30-50% reduction in HTML size
- **Cost Savings**: Fewer tokens = lower API costs
- **Faster Processing**: Smaller payloads = faster AI responses
- **Maintained Functionality**: All HTML functionality is preserved

## Implementation

### Core Components

#### 1. HTML Minifier Utility (`src/utils/htmlMinifier.ts`)

The main utility provides several minification functions:

```typescript
import { minifyForAI, minifyGentle, calculateTokenSavings } from '@/utils/htmlMinifier';

// Aggressive minification for AI APIs
const minified = minifyForAI(htmlContent);

// Gentle minification (preserves readability)
const gentle = minifyGentle(htmlContent);

// Calculate savings
const savings = calculateTokenSavings(original, minified);
```

#### 2. Integration in Services

The minification is automatically applied in:

- **GeminiSimpleEditService**: All slide editing operations
- **Batch Editing Services**: Multiple slide edits
- **API Endpoints**: `/api/slides/[slideId]/edit` and related endpoints

### Minification Features

#### Whitespace Optimization
- Removes all unnecessary whitespace and line breaks
- Collapses multiple spaces into single spaces
- Removes spaces around HTML tags

#### Comment Removal
- Removes HTML comments (`<!-- -->`)
- Removes CSS comments (`/* */`)
- Removes JavaScript single-line comments (`//`)

#### CSS Optimization
- Removes spaces around CSS operators (`:`, `;`, `{`, `}`, `,`)
- Shortens hex colors (`#ffffff` → `#fff`)
- Removes unnecessary zeros (`0px` → `0`, `0.5` → `.5`)
- Optimizes `calc()` expressions
- Minifies both `<style>` blocks and inline styles

#### Attribute Cleanup
- Removes empty attributes
- Cleans up `class` and `style` attribute spacing
- Removes unnecessary data attributes

### Usage Examples

#### Basic Usage

```typescript
import { minifyForAI } from '@/utils/htmlMinifier';

const originalHTML = `
<div class="container" style="  background: #ffffff;  padding: 20px;  ">
    <!-- This is a comment -->
    <h1>   Title   </h1>
    <p>
        Content with
        multiple lines
    </p>
</div>
`;

const minified = minifyForAI(originalHTML);
// Result: <div class="container" style="background:#fff;padding:20px"><h1>Title</h1><p>Content with multiple lines</p></div>
```

#### With Token Savings Calculation

```typescript
import { minifyForAI, calculateTokenSavings } from '@/utils/htmlMinifier';

const original = getSlideHTML();
const minified = minifyForAI(original);
const savings = calculateTokenSavings(original, minified);

console.log(`Saved ${savings.savedCharacters} characters (${savings.savedPercentage}%)`);
console.log(`Estimated token savings: ~${savings.estimatedTokenSavings} tokens`);
```

### Performance Metrics

Based on testing with real slide content:

| Content Type | Original Size | Minified Size | Savings | Token Savings |
|--------------|---------------|---------------|---------|---------------|
| Basic HTML   | 824 chars     | 407 chars     | 50.61%  | ~104 tokens   |
| Complex Slide| 2062 chars    | 1367 chars    | 33.71%  | ~173 tokens   |

### Integration Points

#### 1. GeminiSlideEditingService

```typescript
// Automatic minification before sending to AI
private minifyHtmlForPrompt(html: string): string {
  if (!html || html === 'No HTML content') {
    return html;
  }

  const minifiedHtml = minifyForAI(html);
  const savings = calculateTokenSavings(html, minifiedHtml);

  console.log('📏 [GEMINI_SLIDE_EDITING] HTML Minification Stats:', {
    originalLength: savings.originalLength,
    minifiedLength: savings.minifiedLength,
    savedCharacters: savings.savedCharacters,
    savedPercentage: `${savings.savedPercentage}%`,
    estimatedTokenSavings: savings.estimatedTokenSavings
  });

  return minifiedHtml;
}
```

#### 2. API Endpoints

All slide editing endpoints automatically apply minification:
- `/api/slides/edit` - Main slide editing endpoint

#### 3. Batch Processing

Batch editing services inherit minification from the main `GeminiSlideEditingService`.

### Configuration Options

The minifier supports various configuration options:

```typescript
interface MinifyOptions {
  removeComments?: boolean;        // Remove HTML/CSS/JS comments
  removeEmptyAttributes?: boolean; // Remove empty attributes
  collapseWhitespace?: boolean;    // Collapse whitespace
  minifyCSS?: boolean;            // Minify CSS content
  minifyJS?: boolean;             // Minify JavaScript content
  preserveLineBreaks?: boolean;   // Keep line breaks for readability
}
```

### Preset Configurations

#### For AI APIs (Aggressive)
```typescript
minifyForAI(html) // All optimizations enabled
```

#### For Development (Gentle)
```typescript
minifyGentle(html) // Preserves readability
```

### Monitoring and Logging

The system provides comprehensive logging at multiple levels:

#### Basic Logging (Always Active)
```
📏 HTML Minification Stats:
   Original: 2062 chars
   Minified: 1367 chars
   Saved: 695 chars (33.71%)
   Estimated token savings: ~173 tokens
🖼️ Extracted 2 image URLs

📤 PROMPT SENT TO GEMINI:
   Prompt length: 1847 characters
   User instruction: "Зроби українською"
   Topic: "Animals", Age: "2-3"

🔧 Simple slide editing with Gemini 2.5 Flash...

✅ Simple slide edit successful!
📊 Processing summary:
   Original → Minified: 2062 → 1367 chars
   Gemini response: 1923 chars
   Final result: 2156 chars
```

#### Detailed Logging (Development Mode)

Enable detailed logging by setting environment variable:
```bash
export GEMINI_DETAILED_LOGS=true
# or in development mode (NODE_ENV=development)
```

Detailed logging includes:
- Full original HTML preview
- Cleaned HTML after image extraction
- Complete minified HTML sent to Gemini
- Full Gemini response
- Step-by-step processing details

```
🔍 DETAILED HTML LOGGING:
📄 Original HTML (first 200 chars):
"<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>Welcome to Animal Adventure!</title>..."

🧹 Cleaned HTML (after image extraction, first 200 chars):
"<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>Welcome to Animal Adventure!</title>..."

🚀 Minified HTML sent to Gemini (first 300 chars):
"<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>Welcome to Animal Adventure!</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Comic Sans MS',cursive;background:linear-gradient(135deg,#FFD700 0%,#FF6B6B 50%,#4ECDC4 100%);min-height:100vh;overflow-x:hidden;overflow-y:auto;position:relative;scroll-behavior:smooth}..."

📝 PROMPT PREVIEW (first 500 chars):
"You are an expert in editing HTML slides for children. Receive an HTML slide and instruction, make precise changes.\n\n**CURRENT HTML SLIDE:**\n<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>Welcome to Animal Adventure!</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Comic Sans MS',cursive;background:linear-gradient(135deg,#FFD700 0%,#FF6B6B 50%,#4ECDC4 100%);min-height:100vh;overflow-x:hidden;overflow-y:auto;position:relative;scroll-behavior:smooth}..."

📥 GEMINI RESPONSE:
   Raw response length: 1923 characters
   Raw response preview (first 300 chars):
"<!DOCTYPE html>\n<html lang=\"uk\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>Welcome to Animal Adventure!</title>\n<style>\n*{margin:0;padding:0;box-sizing:border-box}\nbody{font-family:'Comic Sans MS',cursive;background:linear-gradient(135deg,#FFD700 0%,#FF6B6B 50%,#4ECDC4 100%);min-height:100vh;overflow-x:hidden;overflow-y:auto;position:relative;scroll-behavior:smooth}..."
```

### Safety Considerations

#### What's Preserved
- All HTML functionality
- JavaScript event handlers
- CSS styling and animations
- Image URLs and attributes
- Accessibility attributes

#### What's Removed
- Whitespace and formatting
- Comments (HTML, CSS, JS)
- Empty attributes
- Redundant CSS values

### Testing

Run the test suite to verify minification:

```bash
npx tsx src/test/htmlMinifier.test.ts
```

### Future Enhancements

Potential improvements:
- JavaScript minification
- Advanced CSS optimization
- HTML5 semantic optimization
- Conditional minification based on content size

### Troubleshooting

#### Common Issues

1. **Broken Layout**: Check if critical whitespace was removed
   - Solution: Use `minifyGentle()` for testing

2. **JavaScript Errors**: Inline JS might be affected
   - Solution: Ensure proper semicolons in JS code

3. **CSS Issues**: Over-aggressive CSS minification
   - Solution: Test with `minifyCSS: false` option

#### Debugging

Enable detailed logging to see minification results:

```typescript
const savings = calculateTokenSavings(original, minified);
console.log('Minification details:', savings);
```

## Conclusion

The HTML Minification System provides significant cost savings and performance improvements for AI-powered slide editing while maintaining full functionality. The system is automatically applied to all slide editing operations and provides detailed monitoring of token savings.
