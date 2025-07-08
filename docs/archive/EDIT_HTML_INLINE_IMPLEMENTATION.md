# EDIT_HTML_INLINE Implementation Documentation

## Overview

The `edit_html_inline` feature allows users to make direct, targeted text changes to HTML slides without full regeneration. This implementation provides precise text replacement, deletion, and editing capabilities using natural Ukrainian language commands.

## Feature Capabilities

### Intent Detection
Recognizes various Ukrainian commands for inline editing:
- **Replace**: `заміни "старий текст" на "новий текст"`
- **Delete**: `видали "текст"`, `убери "текст"`
- **Rename**: `перейменуй "старе ім'я" на "нове ім'я"`
- **Edit**: `зміни текст "старий" на "новий"`, `редагуй "текст"`

### Parameter Extraction
Automatically extracts:
- **slideNumber**: Target slide number (optional, defaults to current)
- **actionType**: Type of operation (replace/delete/rename/edit)
- **targetText**: Text to find and modify
- **newText**: Replacement text (for replace/rename/edit operations)

## Implementation Details

### 1. Command Pattern Recognition

```typescript
edit_html_inline: [
  {
    regex: /заміни\s+(?:(?:в\s+)?слайд[іа]?\s+(\d+)\s+)?["«](.+?)["»]\s+на\s+["«](.+?)["»]/i,
    extractParams: (match: RegExpMatchArray, message: string) => ({
      slideNumber: match[1] ? parseInt(match[1]) : undefined,
      actionType: 'replace' as const,
      targetText: match[2]?.trim(),
      newText: match[3]?.trim()
    })
  },
  // ... additional patterns for different commands
]
```

**Supported Patterns:**
- `заміни "текст1" на "текст2"` - Replace text1 with text2
- `змінити в слайді 3 "текст1" на "текст2"` - Replace in specific slide
- `слайд 2 заміни "текст1" на "текст2"` - Alternative syntax
- `видали "текст"` - Delete text
- `убери з слайду 1 "текст"` - Delete from specific slide
- `перейменуй "старе" на "нове"` - Rename text
- `зміни текст "старий" на "новий"` - Edit text
- `редагуй "текст"` - Edit text

### 2. Processing Flow

#### Validation Phase
```typescript
case UserCommandType.EDIT_HTML_INLINE:
  const inlineEditSlideNumber = parsedCommand.parameters.slideNumber || conversationContext.currentSlideNumber;
  
  // Перевіряємо чи існує слайд
  const inlineSlideIndex = inlineEditSlideNumber - 1;
  const inlineSlideExists = inlineSlideIndex >= 0 && 
                            inlineSlideIndex < conversationContext.htmlSlideContents.length &&
                            conversationContext.htmlSlideContents[inlineSlideIndex];
  
  if (!inlineSlideExists) {
    directResponse = `❌ Слайд ${inlineEditSlideNumber} не існує`;
    break;
  }
  
  if (!parsedCommand.parameters.targetText) {
    directResponse = `❌ Не вказано текст для редагування`;
    break;
  }
```

#### Context Setup
```typescript
step = 'edit_html_inline';
updatedContext.step = 'edit_html_inline';
updatedContext.generationMode = 'slide';

updatedContext.currentSlideNumber = inlineEditSlideNumber;
updatedContext.currentSlideNumberEditing = inlineEditSlideNumber;
updatedContext.currentSlideId = `slide_inline_edit_${Date.now()}_${inlineEditSlideNumber}`;

(updatedContext as any).inlineEditInfo = {
  slideNumber: inlineEditSlideNumber,
  actionType: parsedCommand.parameters.actionType,
  targetText: parsedCommand.parameters.targetText,
  newText: parsedCommand.parameters.newText
};
```

### 3. System Prompt Generation

For `edit_html_inline` step, the system generates a Claude-compatible prompt:

```typescript
case 'edit_html_inline':
  const inlineSlideNumber = parsedCommand.parameters.slideNumber || currentSlideNumber;
  const actionType = parsedCommand.parameters.actionType || 'replace';
  const targetText = parsedCommand.parameters.targetText || '';
  const newText = parsedCommand.parameters.newText || '';
  
  const inlineSlideIndex = inlineSlideNumber - 1;
  const currentHtmlContent = conversationContext.htmlSlideContents[inlineSlideIndex] || '';
  
  return `You are a code assistant working on direct inline edits of HTML content.
Here is the current HTML of the slide:
${currentHtmlContent}

Instruction:
Please apply the following change:
${actionType === 'replace' ? `"Replace '${targetText}' with '${newText}'"` : ''}
${actionType === 'delete' ? `"Delete '${targetText}'"` : ''}
${actionType === 'rename' ? `"Rename '${targetText}' to '${newText}'"` : ''}
${actionType === 'edit' ? `"Edit '${targetText}'"${newText ? ` with '${newText}'` : ''}` : ''}

Return only the modified full HTML, keep formatting/style intact.`;
```

**Key Features:**
- Provides complete current HTML content as context
- Clear instructions for specific action type
- Emphasizes preservation of formatting and style
- Requests only modified HTML in response

### 4. Response Processing

```typescript
case 'edit_html_inline':
  const inlineEditSlideNumber = updatedContext.currentSlideNumber || 1;
  const inlineEditSlideId = updatedContext.currentSlideId || `slide_inline_edit_${Date.now()}_${inlineEditSlideNumber}`;
  
  // Check for any new image requests (rare for inline edits)
  const inlineImageRequests = extractImageRequests(response, inlineEditSlideId);
  if (inlineImageRequests.length > 0) {
    imageGenerationQueue.push(...inlineImageRequests);
  }
  
  // Create updated slide object
  const inlineEditedSlide = {
    id: inlineEditSlideId,
    slideNumber: inlineEditSlideNumber,
    title: extractSlideTitle(response) || `Слайд ${inlineEditSlideNumber}`,
    content: response,
    slideType: detectSlideType(response),
    status: 'ready' as const,
    createdAt: updatedContext.messages.find(m => m.slideNumber === inlineEditSlideNumber)?.timestamp || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imagePrompts: inlineImageRequests.map(req => ({
      prompt: req.prompt,
      position: req.position,
      generated: false
    }))
  };
  
  // Update content in array
  updatedContext.htmlSlideContents[inlineEditSlideNumber - 1] = response;
  
  slideData = inlineEditedSlide;
  delete (updatedContext as any).inlineEditInfo;
```

**Processing Features:**
- Complete content replacement at correct slide index
- Preservation of slide metadata with updated timestamps
- Image integration support (if new images are detected)
- Cleanup of temporary edit information

### 5. User Actions Generation

```typescript
case UserCommandType.EDIT_HTML_INLINE:
  const inlineSlideNumber = parsedCommand.parameters.slideNumber;
  const actionType = parsedCommand.parameters.actionType || 'replace';
  actions.push({
    action: 'preview_inline_edit',
    label: '👁️ Перегляд змін',
    description: `Подивитися результат ${actionType === 'replace' ? 'заміни' : actionType === 'delete' ? 'видалення' : 'редагування'} в слайді ${inlineSlideNumber}`
  });
  actions.push({
    action: 'edit_more_inline',
    label: '✏️ Ще редагування',
    description: 'Внести додаткові зміни в цей слайд'
  });
  actions.push({
    action: 'undo_inline_edit',
    label: '↩️ Скасувати зміни',
    description: 'Повернути попередню версію слайду'
  });
  if (inlineSlideNumber && inlineSlideNumber > 1) {
    actions.push({
      action: 'edit_previous_inline',
      label: `⬅️ Редагувати слайд ${inlineSlideNumber - 1}`,
      description: 'Перейти до редагування попереднього слайду'
    });
  }
  if (inlineSlideNumber && inlineSlideNumber < conversationContext.totalSlides) {
    actions.push({
      action: 'edit_next_inline',
      label: `➡️ Редагувати слайд ${inlineSlideNumber + 1}`,
      description: 'Перейти до редагування наступного слайду'
    });
  }
```

**Available Actions:**
- **Preview**: View the results of inline editing
- **Continue Editing**: Make additional changes to same slide
- **Undo**: Revert to previous version
- **Navigate**: Edit previous/next slides
- **Action-specific descriptions**: Contextual based on edit type

## Usage Examples

### 1. Basic Text Replacement
```
User: заміни "Привіт" на "Вітаємо"
```
- Detects: actionType='replace', targetText='Привіт', newText='Вітаємо'
- Result: All instances of "Привіт" replaced with "Вітаємо" in current slide

### 2. Slide-Specific Replacement
```
User: в слайді 3 заміни "кіт" на "собака"
```
- Detects: slideNumber=3, actionType='replace', targetText='кіт', newText='собака'
- Result: Text replacement in slide 3 specifically

### 3. Text Deletion
```
User: видали "непотрібний текст"
```
- Detects: actionType='delete', targetText='непотрібний текст'
- Result: Removes specified text from current slide

### 4. Alternative Syntax
```
User: слайд 2 перейменуй "Завдання 1" на "Активність 1"
```
- Detects: slideNumber=2, actionType='rename', targetText='Завдання 1', newText='Активність 1'
- Result: Renames element in slide 2

## Technical Integration

### Type System Updates
```typescript
enum UserCommandType {
  // ... existing types
  EDIT_HTML_INLINE = 'edit_html_inline',
}

type ConversationStep = 
  // ... existing steps
  | 'edit_html_inline'

interface ParsedUserCommand {
  parameters: {
    // ... existing parameters
    actionType?: 'replace' | 'delete' | 'rename' | 'edit';
    targetText?: string;
    newText?: string;
  };
}
```

### Generation Mode Integration
```typescript
function getGenerationModeFromCommand(command: ParsedUserCommand): 'global' | 'slide' | null {
  switch (command.commandType) {
    case UserCommandType.EDIT_HTML_INLINE:
      return 'slide';
  }
}
```

## Error Handling

### Validation Errors
- **Slide not found**: `❌ Слайд ${number} не існує або ще не створений`
- **Missing target text**: `❌ Не вказано текст для редагування. Використовуйте формат: 'Заміни "старий текст" на "новий текст"'`
- **Invalid slide number**: Automatically defaults to current slide

### Data Flow Protection
- Safe array access with bounds checking
- Graceful handling of missing HTML content
- Preservation of existing slide structure

## Performance Considerations

### Optimizations
- **Minimal Processing**: Only processes specific text changes, no full regeneration
- **Selective Image Processing**: Only processes images if new image requests detected
- **Efficient Updates**: Direct array indexing for content updates
- **Memory Management**: Cleanup of temporary edit information

### Response Speed
- Faster than full slide regeneration
- Direct HTML content replacement
- Minimal Claude API processing time

## Best Practices

### For Users
1. **Use quotes**: Always wrap target text in quotes for precise matching
2. **Be specific**: Provide exact text to avoid unintended replacements
3. **Check results**: Use preview actions to verify changes
4. **Incremental edits**: Make small, focused changes for best results

### For Developers
1. **Pattern Testing**: Verify regex patterns with various Ukrainian text inputs
2. **Content Validation**: Ensure target text exists before processing
3. **Error Recovery**: Provide clear error messages and suggested fixes
4. **Integration Testing**: Test with existing slide creation and editing flows

## Future Enhancements

### Potential Improvements
1. **Multi-target editing**: Support for multiple text replacements in single command
2. **Regex support**: Allow pattern-based text replacement
3. **Undo history**: Maintain history of changes for multi-level undo
4. **Preview mode**: Show changes before applying
5. **Batch operations**: Process multiple slides simultaneously

### Advanced Features
1. **Smart text detection**: Auto-suggest editable text elements
2. **Context awareness**: Understand semantic meaning for better replacements
3. **Style preservation**: Maintain specific formatting during text changes
4. **Validation rules**: Check for content guidelines and restrictions

## Integration Points

### Existing Features
- **Seamless integration** with slide creation flow
- **Compatible** with image generation pipeline
- **Consistent** with existing command parsing system
- **Unified** user action generation

### API Compatibility
- Uses existing Claude Sonnet 4 integration
- Maintains conversation history format
- Follows established error handling patterns
- Preserves slide tracking mechanisms

## Conclusion

The `edit_html_inline` implementation provides a powerful, user-friendly way to make precise text changes to educational slides without the overhead of full regeneration. It combines natural Ukrainian language processing with efficient HTML manipulation to deliver fast, accurate editing capabilities while maintaining the existing platform's architecture and user experience patterns. 