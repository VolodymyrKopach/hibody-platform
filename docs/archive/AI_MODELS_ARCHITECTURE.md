# 🤖 AI Models Architecture in TeachSpark Platform

## Overview
TeachSpark Platform uses a **dual-model architecture** to optimize performance, cost, and quality:

- **Claude Haiku** 🚀 - Fast intent detection
- **Claude Sonnet 4** 🎯 - High-quality content generation

## Architecture Flow

```
User Message → Intent Detection (Haiku) → Content Generation (Sonnet) → Response
```

## Models Usage

### 🚀 Claude Haiku (claude-3-haiku-20240307)
**Purpose**: Fast and cost-effective intent detection

**Used in**: `/api/intent-detection/route.ts`

**Capabilities**:
- ✅ Analyze user messages
- ✅ Determine user intent (CREATE_LESSON, EDIT_SLIDE, etc.)
- ✅ Extract parameters (slide numbers, topics, age groups)
- ✅ Language detection (Ukrainian, English, Russian)
- ✅ Return structured JSON response

**Settings**:
- `max_tokens`: 500 (sufficient for intent analysis)
- `temperature`: 0.1 (low for consistent detection)

**Example Request**:
```json
{
  "message": "створи урок про динозаврів для дітей 6 років"
}
```

**Example Response**:
```json
{
  "intent": "CREATE_LESSON",
  "confidence": 0.95,
  "parameters": {
    "topic": "динозаври",
    "age": "6 років",
    "slideNumber": null,
    "keywords": ["створи", "урок", "динозаври"],
    "rawMessage": "створи урок про динозаврів для дітей 6 років"
  },
  "language": "uk",
  "reasoning": "User wants to create a new lesson about dinosaurs"
}
```

### 🎯 Claude Sonnet 4 (claude-sonnet-4-20250514)
**Purpose**: High-quality educational content generation

**Used in**: `/api/chat/route.ts`

**Capabilities**:
- ✅ Generate detailed lesson plans
- ✅ Create interactive HTML slides
- ✅ Generate educational content for children
- ✅ Adapt content to specific age groups
- ✅ Create engaging activities and games
- ✅ Handle complex educational workflows

**Settings**:
- `max_tokens`: 16000 (for comprehensive content)
- `temperature`: 0.4 (balanced creativity and accuracy)

**Workflow Steps**:
1. **Planning** - Create lesson structure
2. **Detailing** - Develop detailed content
3. **HTML Creation** - Generate interactive slides
4. **Improvement** - Refine and optimize content

## Benefits of Dual-Model Approach

### 💰 Cost Optimization
- **Haiku**: ~$0.00025 per 1K input tokens
- **Sonnet**: ~$0.003 per 1K input tokens
- Intent detection is ~12x cheaper with Haiku

### ⚡ Performance
- **Haiku**: Faster response times for intent detection
- **Sonnet**: Superior quality for content generation
- Better user experience with quick intent recognition

### 🎯 Quality
- Each model optimized for its specific task
- Haiku excels at classification and extraction
- Sonnet excels at creative and educational content

## Code Examples

### Intent Detection with Haiku
```typescript
// /api/intent-detection/route.ts
const claudePayload = {
  model: 'claude-3-haiku-20240307',
  max_tokens: 500,
  temperature: 0.1,
  system: INTENT_DETECTION_SYSTEM_PROMPT,
  messages: [
    {
      role: 'user',
      content: `Analyze this message for intent: "${message}"`
    }
  ],
};
```

### Content Generation with Sonnet
```typescript
// /api/chat/route.ts
const claudePayload = {
  model: 'claude-sonnet-4-20250514',
  max_tokens: 16000,
  temperature: 0.4,
  system: systemPrompt,
  messages: claudeMessages
};
```

## Intent Types Supported

1. **CREATE_LESSON** - Create new educational lesson
2. **GENERATE_PLAN** - Create lesson plan/structure  
3. **CREATE_SLIDE** - Create single slide
4. **CREATE_NEW_SLIDE** - Add slide to existing lesson
5. **REGENERATE_SLIDE** - Regenerate existing slide
6. **EDIT_HTML_INLINE** - Make specific text changes
7. **EDIT_SLIDE** - Edit/improve existing slide
8. **IMPROVE_HTML** - General improvements
9. **FREE_CHAT** - General conversation
10. **HELP** - User assistance
11. **EXPORT** - Export/download lesson
12. **PREVIEW** - Preview/view lesson

## Error Handling

### Intent Detection Fallback
If Haiku fails, the system falls back to:
- Simple keyword-based parsing
- Pattern recognition
- Default FREE_CHAT intent

### Content Generation Fallback
If Sonnet fails:
- Return error message to user
- Suggest retry
- Log error for monitoring

## Monitoring & Analytics

### Key Metrics to Track
- Intent detection accuracy
- Response times for each model
- Cost per request
- User satisfaction with generated content
- Error rates for each model

### Performance Optimization
- Cache frequent intent patterns
- Optimize prompts for better accuracy
- Monitor token usage patterns
- A/B test different temperature settings

## Future Enhancements

### Potential Improvements
- Add Claude Opus for complex educational theory
- Implement model switching based on complexity
- Add local intent detection for common patterns
- Implement user feedback loop for accuracy

### Scalability Considerations
- Rate limiting per model
- Load balancing between models
- Caching strategies for repeated intents
- Batch processing for multiple requests

---

**Last Updated**: 2025-06-27
**Version**: 1.0.0 