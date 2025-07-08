# REGENERATE_SLIDE Implementation Documentation

## 🎯 Feature Overview
Implemented complete `regenerate_slide` intent detection and processing flow for completely regenerating existing slides from scratch in the hibody-platform.

## 🔍 1. Intent Detection (`REGENERATE_SLIDE`)

### Ukrainian Language Patterns
Added comprehensive Ukrainian language patterns for detecting slide regeneration requests:

**Primary patterns:**
- `"перегенеруй слайд 2"` - Direct regeneration command
- `"заново створи слайд 3"` - Recreation from scratch  
- `"зроби з нуля слайд 1"` - Complete rebuild
- `"слайд 2 перегенеруй"` - Slide-first syntax

**Alternative patterns:**
- `"перероби слайд 4"` - Rework slide
- `"переписати слайд 1"` - Rewrite slide
- `"оновити повністю слайд 3"` - Complete update
- `"новий варіант слайду 2"` - New slide variant
- `"інший варіант слайд 5"` - Alternative slide version

### Parameter Extraction
- **slideNumber**: Automatically extracted from patterns (required)
- **regenerationInstruction**: Optional additional instruction (e.g., "про пінгвінів")

## 🔄 2. Processing Flow

### Step 1: Validation
```typescript
// Check if slide number is valid
if (!regenerateSlideNumber || regenerateSlideNumber < 1) {
  return error: "Не вказано правильний номер слайду"
}

// Check if slide exists
const slideExists = slideToRegenerateIndex < htmlSlideContents.length && 
                   htmlSlideContents[slideToRegenerateIndex];
if (!slideExists) {
  return error: "Слайд не існує або ще не створений"
}
```

### Step 2: Context Setup
```typescript
step = 'regenerate_slide';
conversationContext.generationMode = 'slide';
conversationContext.currentSlideId = `slide_regenerate_${timestamp}_${slideNumber}`;

// Store regeneration metadata
regenerationInfo = {
  slideNumber: slideNumber,
  instruction: additionalInstruction,
  originalSlideExists: true
};
```

### Step 3: Slide Type Detection
Automatically detects existing slide type from HTML content:
- `'welcome'` - for greeting/intro slides
- `'game'` - for interactive game slides  
- `'quiz'` - for questions/tests
- `'activity'` - for exercises/tasks
- `'summary'` - for conclusions
- `'content'` - for informational slides

## 🤖 3. Dynamic System Prompt

### Context-Aware Prompt Generation
```typescript
const systemPrompt = generateDynamicSystemPrompt('regenerate_slide', parsedCommand, context);
```

**Key prompt elements:**
- **TASK**: Complete regeneration from scratch (no copying)
- **CONSTRAINTS**: Different structure, visuals, and interactions
- **REQUIREMENTS**: Glassmorphism design, 60fps animations, 8+ interactive elements
- **TYPE-SPECIFIC**: Custom requirements based on detected slide type

### Example Generated Prompt:
```
Ти - frontend розробник та експерт з дитячого UX. 
Повністю ПЕРЕГЕНЕРУЙ HTML-слайд номер 2 з нуля.

НОВА ТЕМА/ІНСТРУКЦІЯ: "про пінгвінів"
ВІКОВА ГРУПА: 6 років
ТИП СЛАЙДУ: content

ЗАВДАННЯ - СТВОРИТИ ПОВНІСТЮ НОВИЙ ВАРІАНТ:
- Абсолютно інша структура та компоновка
- Нові візуальні елементи та дизайн
- Інші інтерактивні механіки
...
```

## 📊 4. Response Processing

### Claude Response Analysis
When Claude responds with new HTML:

1. **Content Replacement**: Completely replaces old HTML in `htmlSlideContents[slideNumber-1]`
2. **Slide Object Creation**: 
   ```typescript
   const regeneratedSlide = {
     id: regenerateSlideId,
     slideNumber: regenerateSlideNumber,
     title: extractSlideTitle(response),
     content: response,
     slideType: detectSlideType(response),
     status: 'generating', // Will become 'ready' after image processing
     createdAt: new Date().toISOString(), // Fresh timestamp
     updatedAt: new Date().toISOString()
   };
   ```

3. **Image Request Processing**: Extracts `<!-- generate image: ... -->` comments
4. **Status Management**: Sets to 'generating' initially, then 'ready' after completion

## 🖼️ 5. Image Generation Integration

### Automatic Detection
- Scans for `<!-- generate image: description -->` comments
- Extracts placeholder images with alt text
- Processes through FLUX.1 API pipeline

### Image Request Structure
```typescript
{
  slideId: regenerateSlideId,
  prompt: "Educational illustration: penguin in Antarctica",
  position: "comment_123",
  placeholderId: "image-1"
}
```

## 🎮 6. User Actions

### Available Actions After Regeneration
```typescript
[
  {
    action: 'improve_html_slide',
    label: '🔧 Покращити регенерований слайд',
    description: 'Внести зміни в перегенерований слайд'
  },
  {
    action: 'preview_slide', 
    label: '👁️ Перегляд результату',
    description: 'Подивитися як виглядає новий варіант слайду'
  },
  {
    action: 'regenerate_again',
    label: '🔄 Регенерувати ще раз', 
    description: 'Створити ще один варіант цього слайду'
  }
]
```

### Navigation Actions
- `regenerate_previous` - Regenerate previous slide
- `regenerate_next` - Regenerate next slide
- `complete_lesson` - Finish lesson creation

## 🔧 7. Technical Implementation

### Key Functions Updated

1. **`parseUserCommand()`** - Added regenerate_slide patterns
2. **`getGenerationModeFromCommand()`** - Added REGENERATE_SLIDE case  
3. **`processUserCommand()`** - Added validation and setup logic
4. **`generateDynamicSystemPrompt()`** - Added regenerate_slide case
5. **`analyzeClaudeResponse()`** - Added regenerate_slide processing
6. **`generateActionsForCommand()`** - Added regeneration actions

### Data Flow
```
User Message → parseUserCommand() → processUserCommand() → 
generateDynamicSystemPrompt() → Claude API → analyzeClaudeResponse() → 
Image Processing → Final Response
```

## 🎯 8. Example Usage Scenarios

### Basic Regeneration
```
Користувач: "перегенеруй слайд 2"
Система: Створює повністю новий варіант слайду 2 з тим же типом та темою
```

### Regeneration with New Topic
```
Користувач: "зроби з нуля слайд 3 про пінгвінів"
Система: Створює новий слайд 3 з темою "пінгвіни"
```

### Alternative Variant
```
Користувач: "новий варіант слайду 1"
Система: Створює альтернативну версію слайду 1
```

## ✅ 9. Key Features Achieved

1. **Complete Regeneration**: Totally new HTML structure and design
2. **Type Preservation**: Maintains educational slide type (quiz, game, etc.)
3. **Theme Flexibility**: Can change topic while keeping structure
4. **Image Integration**: Automatic image generation for new content  
5. **State Management**: Proper tracking and status updates
6. **User Experience**: Clear actions and navigation options
7. **Error Handling**: Validation for slide existence and numbers
8. **Ukrainian Support**: Full Ukrainian language command parsing

## 🚀 10. Integration with Existing System

The REGENERATE_SLIDE feature seamlessly integrates with:
- ✅ Existing slide tracking system
- ✅ Image generation pipeline  
- ✅ Conversation flow management
- ✅ User action generation
- ✅ Error handling framework
- ✅ Ukrainian command parsing
- ✅ Claude API integration

The implementation follows the same patterns as other commands and maintains full compatibility with the existing codebase. 