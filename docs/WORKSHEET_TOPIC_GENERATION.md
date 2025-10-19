# Worksheet Topic Generation with AI

## Overview

This feature allows users to generate worksheet topics through an interactive AI chat interface. Instead of manually typing or selecting a predefined topic, users can have a conversation with AI to refine and create the perfect topic for their worksheet.

## Features

### 1. Enhanced Topic Input Field
- **Multiline Textarea**: The topic field is now a multiline textarea with scrolling (4 rows, max 200px height)
- **Support for Long Plans**: Users can paste or write detailed topic descriptions and full worksheet plans
- **Auto-resize**: Field grows with content up to maximum height

### 2. AI-Powered Plan Generation
- **Chat Interface**: Opens a dedicated dialog with conversational AI
- **Context-Aware**: AI knows the selected age group and content mode (PDF/Interactive)
- **Interactive Refinement**: Users can ask questions, request changes, and refine the plan through conversation
- **Component Awareness**: AI knows all available worksheet components for the selected mode

### 3. Comprehensive Plan Creation
The AI creates detailed plans including:
- **Learning Objectives**: What students will learn
- **Components to Use**: Specific worksheet components recommended (title-block, multiple-choice, etc.)
- **Activity Flow**: Step-by-step structure of the worksheet
- **Age Appropriateness**: Why chosen components work for the age group
- **Interactive Elements**: For interactive mode, includes drag-and-drop, memory games, etc.

### 4. Component Library Integration
AI has access to:
- **PDF Components**: title-block, body-text, instructions-box, fill-blank, multiple-choice, true-false, short-answer, match-pairs, word-bank, tip-box, warning-box, image-placeholder, bullet-list, numbered-list, table, divider
- **Interactive Components** (digital mode): TapImage, SimpleDragAndDrop, SimpleCounter, MemoryCards, SortingGame, ColorMatcher, EmotionRecognizer, PatternBuilder, ShapeTracer, SimplePuzzle, SequenceBuilder, CauseEffectGame, SoundMatcher, VoiceRecorder, RewardCollector

### 5. Rich Markdown Formatting
AI responses support full Markdown:
- **Bold text** for emphasis on key concepts
- Bullet lists for options and examples
- Numbered lists for sequential steps
- Clear paragraph structure
- All formatting renders beautifully in the chat interface

## User Flow

### Step 1: Prerequisites
Before generating a topic with AI, users must:
1. Select an **Age Group** (e.g., "2-3 years", "6-7 years")
2. Select a **Content Mode** (PDF or Interactive)

*Note: The "Generate with AI" button is disabled until these are selected.*

### Step 2: Open AI Chat
Click the **"Generate with AI"** button next to the topic field.

### Step 3: Conversation
1. AI greets the user and asks clarifying questions:
   - What subject or theme are you teaching?
   - What specific skills should students practice?
   - Any particular focus or requirements?

2. User responds with their requirements

3. AI asks follow-up questions if needed

4. AI generates a comprehensive topic description

### Step 4: Use Generated Plan
1. When AI generates a final plan, a **"Use This Plan"** button appears
2. The plan includes all details: objectives, components, activity flow
3. Click the button to insert the complete plan into the topic field
4. Dialog closes automatically
5. The full plan is used for worksheet generation with AI understanding the complete context

## Example Conversation

```
AI: Hello! I'll help you create a detailed plan for your worksheet.

**Your Settings:**
- Mode: **Interactive (digital)**
- Age Group: **4-6**

I have access to both standard worksheet components and interactive elements 
like drag-and-drop, memory games, and more.

**Tell me about your worksheet:**
- What subject or theme are you teaching?
- What specific skills should students practice?
- Any particular learning goals or requirements?

User: I want to teach counting 1-10 with farm animals

AI: Perfect choice! Let me create a comprehensive plan for you.

**Counting 1-10 with Farm Animals**

**Learning Objectives:**
*   **Count** from 1 to 10
*   **Recognize** numbers and quantities
*   **Identify** common farm animals (cows, pigs, chickens, sheep, horses)
*   **Match** numbers with visual representations

**Components to Use:**
*   **title-block**: Main worksheet title "Farm Animal Counting Adventure"
*   **instructions-box**: Clear instructions for each activity
*   **image-placeholder**: Colorful farm animal illustrations
*   **SimpleCounter**: Interactive counting with tap/touch
*   **SimpleDragAndDrop**: Drag numbers to match animal groups
*   **MemoryCards**: Match number cards with animal quantity cards
*   **tip-box**: Helpful counting tips and encouragement
*   **RewardCollector**: Collect stars for completing activities

**Activity Flow:**
1. **Introduction** (title-block + image-placeholder): Welcome to the farm!
2. **Counting Practice 1-5** (SimpleCounter): Tap to count animals
3. **Counting Practice 6-10** (SimpleCounter): Continue counting
4. **Matching Activity** (SimpleDragAndDrop): Drag numbers to groups
5. **Memory Game** (MemoryCards): Match numbers to quantities
6. **Review** (tip-box + RewardCollector): Celebrate success!

**Why These Components?**
For age 4-6, **interactive elements** keep children engaged. SimpleCounter 
provides immediate feedback, drag-and-drop reinforces learning through 
movement, and MemoryCards add a fun challenge. Visual elements are essential 
at this age.

TOPIC_READY

---

✅ **Plan is ready!** This detailed plan will be used to generate your 
worksheet. Click "Use This Plan" to continue.
```

**Note**: 
- All **bold text**, *lists*, and formatting are rendered beautifully with Markdown
- The **entire plan** (everything before "TOPIC_READY") is inserted into the topic field
- The worksheet generator uses this detailed plan to create appropriate content

## Technical Implementation

### Components

#### 1. `Step1WorksheetParameters.tsx`
- Modified topic field from single-line input to multiline textarea
- Added "Generate with AI" button
- Integrated `TopicGenerationChatDialog` component

#### 2. `TopicGenerationChatDialog.tsx`
**Location**: `src/components/worksheet/TopicGenerationChatDialog.tsx`

**Props**:
- `open: boolean` - Dialog open state
- `onClose: () => void` - Close handler
- `onTopicGenerated: (topic: string) => void` - Callback when topic is generated
- `ageGroup: string` - Selected age group
- `contentMode: 'pdf' | 'interactive'` - Selected content mode

**Features**:
- Chat message display with user/AI avatars
- **Markdown rendering** for AI messages (bold, lists, formatting)
- Plain text for user messages
- Typing indicator
- Message history
- Auto-scroll to latest message
- Context awareness (age group, content mode)
- Responsive design

#### 3. API Endpoint: `/api/worksheet/generate-topic`
**Location**: `src/app/api/worksheet/generate-topic/route.ts`

**Method**: POST

**Request Body**:
```typescript
{
  message: string;              // User's current message
  conversationHistory: Message[]; // Previous messages
  ageGroup: string;             // Selected age group
  contentMode: 'pdf' | 'interactive'; // Content mode
}
```

**Response**:
```typescript
{
  success: boolean;
  response: string;        // AI's response text
  generatedTopic?: string; // Final topic (if generated)
}
```

**AI Model**: Google Gemini 2.5 Flash (gemini-2.5-flash)

**Dependencies**:
- `@google/genai` - Google GenAI SDK
- Token tracking service for usage monitoring
- Supabase authentication for user tracking

### System Prompt

The AI is instructed to:
1. Act as an educational content specialist
2. Consider age group and content mode
3. Ask clarifying questions
4. Generate comprehensive topic descriptions
5. Mark final topics with "TOPIC_READY:" prefix

### Topic Detection

When AI generates a final topic, it includes:
```
TOPIC_READY: [complete topic description]
```

The API parses this marker and:
- Extracts the topic text
- Removes the marker from displayed response
- Returns `generatedTopic` in response
- Enables "Use This Topic" button in dialog

### Token Tracking

The API automatically tracks token usage for authenticated users:
- Service: `worksheet_topic_generation`
- Model: `gemini-2.5-flash`
- Tracks input, output, and total tokens
- Stored in Supabase for analytics and monitoring

## Age-Specific Considerations

### Young Ages (2-6 years)
- Basic concepts and simple vocabulary
- Visual learning emphasis
- Simple, repetitive activities
- Large, clear illustrations
- Minimal text

### Middle Ages (7-12 years)
- More complex tasks
- Reading and writing practice
- Multi-step activities
- Detailed instructions
- Mix of visual and text content

### Older Ages (13+ years)
- Academic subjects
- Critical thinking exercises
- Detailed explanations
- Text-heavy content
- Advanced concepts

## Content Mode Considerations

### PDF Mode (Printable)
- Activities suitable for paper
- Writing spaces
- Coloring areas
- Clear borders and sections
- Print-friendly layouts

### Interactive Mode (Digital)
- Digital interactions
- Drag-and-drop activities
- Interactive games
- Multimedia elements
- Touch/click interactions

## Error Handling

### Missing API Key
If `GEMINI_API_KEY` is not configured:
```json
{
  "success": false,
  "error": "API configuration error",
  "details": "Gemini API key is not properly configured"
}
```

### Invalid Request
If message is missing or invalid:
```json
{
  "success": false,
  "error": "Message is required"
}
```

### Generation Error
If AI generation fails:
```json
{
  "success": false,
  "error": "Failed to generate topic",
  "details": "Error message"
}
```

Error messages are displayed to user in chat interface.

## Future Enhancements

### Potential Improvements
1. **Topic Templates**: Pre-defined topic templates for common subjects
2. **Topic History**: Save and reuse previously generated topics
3. **Multi-language Support**: Generate topics in different languages
4. **Subject Filters**: Filter suggestions by subject (Math, Language, Science, etc.)
5. **Collaboration**: Share topics with other teachers
6. **Favorites**: Mark and save favorite topic patterns
7. **Export**: Export topic descriptions for reuse

### Advanced Features
1. **Curriculum Alignment**: Match topics to educational standards
2. **Difficulty Calibration**: Auto-adjust based on student performance
3. **Learning Path Integration**: Connect topics to learning sequences
4. **Assessment Integration**: Link topics to assessment criteria

## Best Practices

### For Users
1. **Be Specific**: Provide detailed requirements for better results
2. **Iterate**: Don't hesitate to ask AI to modify the topic
3. **Use Context**: Leverage the age group and mode selections
4. **Review**: Always review generated topics before using them

### For Developers
1. **Token Management**: Monitor Gemini API usage
2. **Error Handling**: Gracefully handle API failures
3. **User Feedback**: Collect user feedback on generated topics
4. **Testing**: Test with various age groups and content modes
5. **Performance**: Cache common topic patterns if needed

## Testing

### Manual Testing Checklist
- [ ] Button disabled when age group not selected
- [ ] Button disabled when content mode not selected
- [ ] Button enabled when both selected
- [ ] Dialog opens on button click
- [ ] Initial AI message includes age group and content mode
- [ ] User can send messages
- [ ] AI responds to user messages
- [ ] Conversation history is maintained
- [ ] Generated topic is detected
- [ ] "Use This Topic" button appears when topic is ready
- [ ] Topic is inserted into main form
- [ ] Dialog closes after using topic
- [ ] State resets when dialog closes

### Edge Cases
- [ ] Very long topic descriptions
- [ ] Special characters in topics
- [ ] Multiple topic generations in same session
- [ ] Network errors during generation
- [ ] API key missing or invalid
- [ ] Rapid message sending

## Troubleshooting

### Issue: Button is disabled
**Solution**: Ensure age group and content mode are selected first

### Issue: AI not responding
**Solution**: Check GEMINI_API_KEY in environment variables

### Issue: Topic not detected
**Solution**: AI may need more information - continue conversation

### Issue: Dialog stuck in loading state
**Solution**: Check browser console for API errors

## Related Documentation
- [Worksheet Generation Flow](./DIALOG_BASED_WORKSHEET_GENERATION.md)
- [Step1 Updates](./STEP1_WORKSHEET_UPDATES.md)
- [AI Services](../src/services/README.md)

