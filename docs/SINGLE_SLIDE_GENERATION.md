# Single Slide Generation API

This document describes the new single slide generation endpoint that allows generating individual slides with the same logic as the existing bulk slide generation.

## Endpoint

```
POST /api/generation/slides/single
```

## Request

### Headers
```
Content-Type: application/json
```

### Body
```typescript
interface SingleSlideGenerationRequest {
  title: string;           // Required - The slide title
  description: string;     // Required - Content description for the slide
  topic: string;          // Required - Lesson topic context
  age: string;            // Required - Target age group (e.g., "7-8", "4-6")
  sessionId?: string;     // Optional - For progress tracking
}
```

### Example Request
```json
{
  "title": "Introduction to Solar System",
  "description": "Learn about the planets in our solar system with colorful images and fun facts. Students will discover the eight planets and their unique characteristics.",
  "topic": "Solar System",
  "age": "7-8"
}
```

## Response

### Success Response (200)
```typescript
interface SingleSlideGenerationResponse {
  success: true;
  slide: SimpleSlide;
}
```

### SimpleSlide Object
```typescript
interface SimpleSlide {
  id: string;                    // Unique slide identifier
  title: string;                 // Slide title
  content: string;               // Original content description
  htmlContent: string;           // Generated HTML content
  status: 'completed' | 'draft' | 'generating';
  estimatedDuration?: number;    // Duration in seconds
  interactive?: boolean;         // Whether slide has interactive elements
  visualElements?: string[];     // Array of visual element types
  description?: string;          // Content description
  updatedAt?: Date;             // Last update timestamp
}
```

### Error Response (400/500)
```typescript
interface SingleSlideGenerationResponse {
  success: false;
  error: string;        // Error message
  details?: string;     // Additional error details
}
```

## Usage Examples

### Basic Usage
```javascript
const response = await fetch('/api/generation/slides/single', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Planet Earth',
    description: 'Explore our beautiful planet Earth, its oceans, continents, and atmosphere.',
    topic: 'Earth Science',
    age: '6-8'
  })
});

const data = await response.json();
if (data.success) {
  console.log('Generated slide:', data.slide);
} else {
  console.error('Error:', data.error);
}
```

### With Session Tracking
```javascript
const sessionId = `session_${Date.now()}`;

const response = await fetch('/api/generation/slides/single', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Animal Habitats',
    description: 'Discover where different animals live and how they adapt to their environments.',
    topic: 'Biology',
    age: '5-7',
    sessionId: sessionId
  })
});
```

## Features

The single slide generation endpoint provides:

1. **AI-Generated Content**: Uses the same Gemini AI service as bulk generation
2. **Age-Appropriate Content**: Automatically adjusts content complexity for the target age group
3. **Interactive Detection**: Automatically detects if content should be interactive
4. **Visual Element Analysis**: Identifies what visual elements the slide should include
5. **Duration Estimation**: Calculates estimated time to present the slide
6. **Fallback Handling**: Provides fallback HTML if generation fails

## Age Groups Supported

- `"2-3"` - Toddlers/Pre-school
- `"4-6"` - Early Elementary
- `"7-8"` - Elementary
- `"9-10"` - Late Elementary
- `"11-13"` - Middle School
- `"14-16"` - High School

## Error Handling

Common error scenarios:

1. **Missing Required Fields** (400)
   - Ensure all required fields (title, description, topic, age) are provided

2. **Invalid Age Format** (400)
   - Use supported age group formats

3. **API Configuration Error** (500)
   - Gemini API key not configured

4. **Generation Failure** (500)
   - AI service unavailable or content generation failed

## Testing

Test the endpoint using:
```
GET /api/test/single-slide
```

This will return test payload examples and execute a test generation.

## Related Endpoints

- `/api/generation/slides/sequential` - Generate multiple slides sequentially
- `/api/generation/slides/parallel` - Generate multiple slides in parallel (redirects to sequential)
- `/api/generation/lesson` - Generate complete lessons with slides