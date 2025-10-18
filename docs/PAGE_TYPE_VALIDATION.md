# Page Type Validation System

## Overview

The Page Type Validation System prevents incompatible components from being placed on wrong page types. PDF pages can only contain worksheet elements, while Interactive pages can only contain interactive components.

## Component Categories

### PDF Components (Worksheet Elements)
These components are designed for printable worksheets:
- 📝 **title-block** - Title and headings
- 📄 **body-text** - Paragraphs and text content
- 📋 **instructions-box** - Instructions and guidelines
- ✍️ **fill-blank** - Fill in the blanks exercises
- ☑️ **multiple-choice** - Multiple choice questions
- 💡 **tip-box** - Tips and hints
- ⚠️ **warning-box** - Warnings and important notes
- 🖼️ **image-placeholder** - Static images
- • **bullet-list** - Bulleted lists
- 1️⃣ **numbered-list** - Numbered lists
- ✓ **true-false** - True/False questions
- ✏️ **short-answer** - Short answer questions
- 📊 **table** - Tables and grids
- ➖ **divider** - Visual dividers

### Interactive Components
These components provide interactive experiences:
- 🖱️ **tap-image** - Tappable images with sounds
- 🎯 **simple-drag-drop** - Drag and drop matching
- 🎨 **color-matcher** - Color recognition game
- 🔢 **simple-counter** - Counting activity
- 🃏 **memory-cards** - Memory matching game
- 🗂️ **sorting-game** - Category sorting
- 📊 **sequence-builder** - Order sequences
- ✏️ **shape-tracer** - Shape tracing
- 😊 **emotion-recognizer** - Emotion identification
- 🔊 **sound-matcher** - Sound matching
- 🧩 **simple-puzzle** - Jigsaw puzzles
- 🎭 **pattern-builder** - Pattern creation
- ⚡ **cause-effect** - Cause and effect matching
- 🎁 **reward-collector** - Task completion rewards
- 🎤 **voice-recorder** - Voice recording

## Validation Rules

### Rule 1: PDF Pages
**Can contain:** Only PDF components (worksheet elements)
**Cannot contain:** Interactive components
**Reason:** PDF pages are designed for printing and static content

### Rule 2: Interactive Pages
**Can contain:** Only interactive components
**Cannot contain:** PDF components (worksheet elements)
**Reason:** Interactive pages are designed for digital interaction

## Implementation

### 1. Validation Functions (Step3CanvasEditor.tsx)

```typescript
// Component type arrays
const INTERACTIVE_COMPONENT_TYPES = [
  'tap-image', 'simple-drag-drop', 'color-matcher', ...
];

const PDF_COMPONENT_TYPES = [
  'title-block', 'body-text', 'instructions-box', ...
];

// Helper functions
const isInteractiveComponent = (type: string): boolean => {
  return INTERACTIVE_COMPONENT_TYPES.includes(type);
};

const isPDFComponent = (type: string): boolean => {
  return PDF_COMPONENT_TYPES.includes(type);
};

const canDropComponentOnPage = (
  componentType: string, 
  pageType: 'pdf' | 'interactive'
): boolean => {
  const isInteractive = isInteractiveComponent(componentType);
  const isPDF = isPDFComponent(componentType);

  if (isInteractive && pageType !== 'interactive') return false;
  if (isPDF && pageType !== 'pdf') return false;

  return true;
};
```

### 2. Validation Points

#### A. Adding Components from Sidebar (handleElementAdd)
```typescript
const handleElementAdd = (pageId: string, element: ...) => {
  const targetPage = pages.find(p => p.id === pageId);
  const targetPageType = targetPage.pageType || 'pdf';
  
  if (!canDropComponentOnPage(element.type, targetPageType)) {
    alert(`Cannot add ${isInteractiveComponent(element.type) ? 'interactive' : 'PDF'} 
           component to ${targetPageType} page.`);
    return;
  }
  
  // Add element...
};
```

#### B. Moving Components Between Pages (handleCrossPageDrop)
```typescript
const handleCrossPageDrop = (targetPageId: string, dropIndex?: number) => {
  const targetPage = pages.find(p => p.id === targetPageId);
  const targetPageType = targetPage.pageType || 'pdf';
  
  if (!canDropComponentOnPage(element.type, targetPageType)) {
    alert(`Cannot move ${isInteractiveComponent(element.type) ? 'interactive' : 'PDF'} 
           component to ${targetPageType} page.`);
    setCrossPageDrag(null);
    return;
  }
  
  // Move element...
};
```

### 3. Visual Feedback (CanvasPage.tsx)

#### Component Categories in Drag
```typescript
// LeftSidebar.tsx
onDragStart={(e) => {
  e.dataTransfer.setData('componentType', item.id);
  // Add category for validation during dragOver
  e.dataTransfer.setData('component-category-interactive', 'true');
  // or
  e.dataTransfer.setData('component-category-pdf', 'true');
}}
```

#### Drag Over Validation
```typescript
const handleDragOverPage = (e: React.DragEvent) => {
  // Check cross-page drag
  if (crossPageDrag) {
    const canDrop = canDropOnThisPage(crossPageDrag.element.type);
    if (canDrop) {
      setIsDropTarget(true);
      setIsInvalidDropTarget(false);
    } else {
      setIsDropTarget(false);
      setIsInvalidDropTarget(true);
    }
  }
  
  // Check sidebar drag
  if (isSidebarDrag) {
    const isInteractiveComp = e.dataTransfer.types.includes('component-category-interactive');
    const isPDFComp = e.dataTransfer.types.includes('component-category-pdf');
    
    let canDrop = true;
    if (isInteractiveComp && pageType !== 'interactive') canDrop = false;
    if (isPDFComp && pageType !== 'pdf') canDrop = false;
    
    setIsDropTarget(canDrop);
    setIsInvalidDropTarget(!canDrop);
  }
};
```

#### Visual Styles
```typescript
// Valid drop - green outline
...(isDropTarget && {
  outline: `4px dashed ${theme.palette.success.main}`,
  '&::after': {
    content: '"📥 Drop here to move element"',
    background: alpha(theme.palette.success.main, 0.95),
    color: 'white',
  },
}),

// Invalid drop - red outline
...(isInvalidDropTarget && {
  outline: `4px dashed ${theme.palette.error.main}`,
  '&::after': {
    content: pageType === 'pdf' 
      ? '"🚫 Only worksheet elements allowed on PDF pages"' 
      : '"🚫 Only interactive components allowed here"',
    background: alpha(theme.palette.error.main, 0.95),
    color: 'white',
  },
}),
```

## User Experience

### Valid Drop
```
┌─────────────────────────────┐
│   PDF Page                  │
│  ┌─────────────────────┐    │ ← Green dashed outline
│  │                     │    │
│  │  📥 Drop here       │    │ ← Green message
│  │  to move element    │    │
│  │                     │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

### Invalid Drop
```
┌─────────────────────────────┐
│   PDF Page                  │
│  ┌─────────────────────┐    │ ← Red dashed outline
│  │                     │    │
│  │  🚫 Only worksheet  │    │ ← Red error message
│  │  elements allowed   │    │
│  │                     │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

### Alert Messages

#### Sidebar Drop on Wrong Page Type
```
❌ Cannot add interactive component to pdf page.

PDF pages can only contain worksheet elements 
(text, questions, etc.)
Create an Interactive page to add interactive 
components.
```

#### Cross-Page Move to Wrong Page Type
```
❌ Cannot move interactive component to pdf page.

PDF pages can only contain worksheet elements 
(text, questions, etc.)
```

## Benefits

### For Users
- ✅ Clear visual feedback during drag operations
- ✅ Prevents mistakes before they happen
- ✅ Helpful error messages explain the rules
- ✅ Maintains document structure integrity

### For Content
- ✅ PDF pages remain printable
- ✅ Interactive pages focus on engagement
- ✅ Clear separation of concerns
- ✅ Consistent user experience

### For Developers
- ✅ Centralized validation logic
- ✅ Reusable helper functions
- ✅ Clear component categorization
- ✅ Easy to extend with new component types

## Edge Cases Handled

1. **Default Page Type**: If pageType is undefined, defaults to 'pdf'
2. **Unknown Components**: Components not in either list are allowed (for future compatibility)
3. **Drag Cancel**: Validation state resets properly on drag leave
4. **Multiple Validations**: Each validation point (sidebar, cross-page) works independently

## Future Enhancements

### Potential Features
- [ ] Allow mixed mode pages (advanced users)
- [ ] Conversion tool (convert PDF component to interactive equivalent)
- [ ] Bulk move with validation
- [ ] Custom component categories
- [ ] Validation warnings (instead of blocking)

### Performance Optimizations
- [ ] Memoize validation functions
- [ ] Cache component type lookups
- [ ] Optimize drag over performance

## Testing Checklist

### Manual Testing
- [ ] Drag PDF component to PDF page (should work)
- [ ] Drag PDF component to Interactive page (should block with red outline)
- [ ] Drag Interactive component to Interactive page (should work)
- [ ] Drag Interactive component to PDF page (should block with red outline)
- [ ] Move element between PDF pages (should work)
- [ ] Move element between Interactive pages (should work)
- [ ] Move PDF element to Interactive page (should show alert)
- [ ] Move Interactive element to PDF page (should show alert)
- [ ] Alert messages are clear and helpful
- [ ] Visual feedback appears immediately

### Edge Cases
- [ ] Page with no explicit pageType (defaults to pdf)
- [ ] Very fast drag operations
- [ ] Multiple simultaneous drags
- [ ] Browser compatibility (Chrome, Firefox, Safari)

## Related Documentation
- [Interactive Play Mode](./INTERACTIVE_PLAY_MODE.md)
- [Canvas Page Implementation](./CANVAS_PAGE_IMPLEMENTATION.md) *(to be created)*
- [Component System](./COMPONENT_SYSTEM.md) *(to be created)*

## Changelog

### 2025-10-18 - Initial Implementation
- ✅ Created validation system with helper functions
- ✅ Added validation to handleElementAdd
- ✅ Added validation to handleCrossPageDrop
- ✅ Implemented visual feedback (green/red outlines)
- ✅ Added component categories to sidebar drag
- ✅ Comprehensive error messages
- ✅ Documentation created

