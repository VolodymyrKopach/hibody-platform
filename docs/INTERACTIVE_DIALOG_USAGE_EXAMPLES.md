# 📖 Interactive Dialog Usage Examples

## Quick Start Guide for Developers

---

## InteractivePreviewDialog

### Basic Usage

```typescript
import InteractivePreviewDialog from '@/components/worksheet/canvas/interactive/InteractivePreviewDialog';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Preview Component
      </Button>

      <InteractivePreviewDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Interactive Component"
        elementType="tap-image"
      >
        <TapImage {...props} />
      </InteractivePreviewDialog>
    </>
  );
}
```

### Props

```typescript
interface InteractivePreviewDialogProps {
  open: boolean;           // Control dialog visibility
  onClose: () => void;     // Close handler
  title?: string;          // Custom title (optional)
  children: React.ReactNode; // Component to preview
  elementType?: string;    // Type for icon display (optional)
}
```

### Supported Element Types

```typescript
const displayNames = {
  'tap-image': '🖼️ Tap Image',
  'simple-drag-and-drop': '🎯 Drag & Drop',
  'color-matcher': '🎨 Color Matcher',
  'memory-cards': '🃏 Memory Cards',
  'sorting-game': '📦 Sorting Game',
  'sequence-builder': '🔢 Sequence Builder',
  'shape-tracer': '✏️ Shape Tracer',
  'emotion-recognizer': '😊 Emotion Recognizer',
  'scene-explorer': '🔍 Scene Explorer',
  'progress-tracker': '📊 Progress Tracker',
  'magnetic-playground': '🧲 Magnetic Playground',
  'coloring-canvas': '🎨 Coloring Canvas',
  'sticker-scene': '🎭 Sticker Scene',
  'glow-highlight': '✨ Glow Highlight',
  'animated-mascot': '🐰 Animated Mascot',
  'sparkle-reward': '🎉 Sparkle Reward',
  'simple-counter': '🔢 Simple Counter',
  'interactive-page': '📄 Interactive Page',
};
```

### Features

✅ **Automatic:**
- Reset button (resets component state)
- Fullscreen toggle
- Close button
- Instructions overlay
- Smooth animations
- Theme integration

✅ **Keyboard Shortcuts:**
- `ESC` - Close dialog
- `F` - Toggle fullscreen (if implemented)

---

## InteractivePlayDialog

### Basic Usage

```typescript
import InteractivePlayDialog from '@/components/worksheet/canvas/InteractivePlayDialog';

function WorksheetPage() {
  const [playMode, setPlayMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);

  return (
    <>
      <Button onClick={() => {
        setCurrentPage(pageData);
        setPlayMode(true);
      }}>
        ▶️ Play Mode
      </Button>

      <InteractivePlayDialog
        open={playMode}
        onClose={() => setPlayMode(false)}
        pageTitle={currentPage.title}
        pageNumber={currentPage.number}
        background={currentPage.background}
        elements={currentPage.elements}
      />
    </>
  );
}
```

### Props

```typescript
interface InteractivePlayDialogProps {
  open: boolean;              // Control dialog visibility
  onClose: () => void;        // Close handler
  pageTitle: string;          // Page title for header
  pageNumber: number;         // Page number for display
  background?: PageBackground; // Optional background
  elements: CanvasElement[];  // Interactive elements to render
}
```

### Background Configuration

```typescript
interface PageBackground {
  type: 'solid' | 'gradient' | 'pattern' | 'image';
  opacity?: number; // 0-100
  
  // For solid backgrounds
  color?: string;
  
  // For gradient backgrounds
  gradient?: {
    from: string;
    to: string;
    colors?: string[];
    direction: 'to-bottom' | 'to-top' | 'to-right' | 'to-left' | 
              'to-bottom-right' | 'to-bottom-left' | 
              'to-top-right' | 'to-top-left';
  };
  
  // For pattern backgrounds
  pattern?: {
    name: string;
    backgroundColor: string;
    patternColor: string;
    css: string;
    backgroundSize: string;
    backgroundPosition?: string;
    scale?: number;
    opacity?: number;
  };
  
  // For image backgrounds
  image?: {
    url: string;
    size: 'cover' | 'contain' | 'repeat' | 'auto';
    position: 'center' | 'top' | 'bottom' | 'left' | 'right';
    opacity?: number;
  };
}
```

---

## Examples

### Example 1: Simple Preview

```typescript
import { useState } from 'react';
import InteractivePreviewDialog from '@/components/worksheet/canvas/interactive/InteractivePreviewDialog';
import TapImage from '@/components/worksheet/canvas/interactive/TapImage';

function TapImagePreview() {
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        👁️ Preview
      </Button>

      <InteractivePreviewDialog
        open={open}
        onClose={() => setOpen(false)}
        elementType="tap-image"
      >
        <TapImage
          imageUrl="/images/sample.png"
          soundEffect="pop"
          caption="Tap me!"
          size="large"
          animation="bounce"
          showHint={true}
          isSelected={false}
          onEdit={() => {}}
          onFocus={() => {}}
        />
      </InteractivePreviewDialog>
    </Box>
  );
}
```

---

### Example 2: Play Mode with Gradient Background

```typescript
import InteractivePlayDialog from '@/components/worksheet/canvas/InteractivePlayDialog';

function WorksheetPlayer() {
  const [open, setOpen] = useState(false);

  const pageData = {
    title: 'Color Matching Game',
    number: 3,
    background: {
      type: 'gradient' as const,
      gradient: {
        from: '#FFE5E5',
        to: '#E5F0FF',
        direction: 'to-bottom-right' as const,
      },
      opacity: 100,
    },
    elements: [
      {
        id: '1',
        type: 'color-matcher' as const,
        properties: {
          colors: [
            { id: '1', name: 'Red', hex: '#FF0000' },
            { id: '2', name: 'Blue', hex: '#0000FF' },
            { id: '3', name: 'Green', hex: '#00FF00' },
          ],
          mode: 'single',
          showNames: true,
          autoVoice: true,
        },
      },
    ],
  };

  return (
    <>
      <Button 
        variant="contained" 
        color="success"
        onClick={() => setOpen(true)}
      >
        ▶️ Start Game
      </Button>

      <InteractivePlayDialog
        open={open}
        onClose={() => setOpen(false)}
        pageTitle={pageData.title}
        pageNumber={pageData.number}
        background={pageData.background}
        elements={pageData.elements}
      />
    </>
  );
}
```

---

### Example 3: Play Mode with Pattern Background

```typescript
const pageWithPattern = {
  title: 'Memory Card Game',
  number: 5,
  background: {
    type: 'pattern' as const,
    pattern: {
      name: 'Dots',
      backgroundColor: '#FFFFFF',
      patternColor: '#E5E7EB',
      css: 'radial-gradient(circle, #E5E7EB 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      scale: 1.5,
      opacity: 50,
    },
  },
  elements: [
    {
      id: '1',
      type: 'memory-cards',
      properties: {
        pairs: [
          { id: '1', frontImage: '/img/1.png', backImage: '/img/back.png' },
          { id: '2', frontImage: '/img/2.png', backImage: '/img/back.png' },
        ],
        gridSize: '2x2',
        difficulty: 'easy',
      },
    },
  ],
};

<InteractivePlayDialog
  open={open}
  onClose={() => setOpen(false)}
  pageTitle={pageWithPattern.title}
  pageNumber={pageWithPattern.number}
  background={pageWithPattern.background}
  elements={pageWithPattern.elements}
/>
```

---

### Example 4: Play Mode with Image Background

```typescript
const pageWithImage = {
  title: 'Forest Adventure',
  number: 7,
  background: {
    type: 'image' as const,
    image: {
      url: '/backgrounds/forest.jpg',
      size: 'cover',
      position: 'center',
      opacity: 80,
    },
  },
  elements: [
    {
      id: '1',
      type: 'scene-explorer',
      properties: {
        // ... scene explorer properties
      },
    },
  ],
};

<InteractivePlayDialog
  open={open}
  onClose={() => setOpen(false)}
  pageTitle={pageWithImage.title}
  pageNumber={pageWithImage.number}
  background={pageWithImage.background}
  elements={pageWithImage.elements}
/>
```

---

### Example 5: Multiple Elements with Staggered Animation

```typescript
const multiElementPage = {
  title: 'Learning Activities',
  number: 10,
  background: {
    type: 'solid' as const,
    color: '#F0F9FF',
  },
  elements: [
    {
      id: '1',
      type: 'simple-counter',
      properties: {
        objects: [
          { id: '1', imageUrl: '/img/apple.png', label: 'Apple' },
          { id: '2', imageUrl: '/img/banana.png', label: 'Banana' },
        ],
        voiceEnabled: true,
        celebrationAtEnd: true,
      },
    },
    {
      id: '2',
      type: 'sorting-game',
      properties: {
        items: [
          { id: '1', imageUrl: '/img/cat.png', category: 'animals' },
          { id: '2', imageUrl: '/img/car.png', category: 'vehicles' },
        ],
        categories: [
          { id: 'animals', label: 'Animals', color: '#10B981' },
          { id: 'vehicles', label: 'Vehicles', color: '#3B82F6' },
        ],
        sortBy: 'type',
        layout: 'horizontal',
      },
    },
    {
      id: '3',
      type: 'emotion-recognizer',
      properties: {
        emotions: [
          { id: '1', name: 'Happy', imageUrl: '/img/happy.png' },
          { id: '2', name: 'Sad', imageUrl: '/img/sad.png' },
        ],
        mode: 'identify',
        showDescriptions: true,
        voiceEnabled: true,
      },
    },
  ],
};

// Elements will appear with staggered animation:
// Element 1: 0ms delay
// Element 2: 100ms delay
// Element 3: 200ms delay

<InteractivePlayDialog
  open={open}
  onClose={() => setOpen(false)}
  pageTitle={multiElementPage.title}
  pageNumber={multiElementPage.number}
  background={multiElementPage.background}
  elements={multiElementPage.elements}
/>
```

---

## Advanced Usage

### Custom Animation Control

If you need to disable animations:

```typescript
// Add this to your component wrapper
<Box sx={{ 
  '& [class*="fadeInUp"]': { 
    animation: 'none !important' 
  } 
}}>
  <InteractivePlayDialog {...props} />
</Box>
```

### Custom Theme Integration

Both dialogs automatically use your MUI theme:

```typescript
import { createTheme, ThemeProvider } from '@mui/material/styles';

const customTheme = createTheme({
  palette: {
    primary: {
      main: '#6366F1', // Indigo
    },
    secondary: {
      main: '#EC4899', // Pink
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      {/* Dialogs will use these colors automatically */}
      <InteractivePreviewDialog {...props} />
      <InteractivePlayDialog {...props} />
    </ThemeProvider>
  );
}
```

---

## Accessibility

### Keyboard Navigation

Both dialogs support full keyboard navigation:

| Key | Action |
|-----|--------|
| `ESC` | Close dialog |
| `Tab` | Navigate between buttons |
| `Enter` / `Space` | Activate focused button |
| `Arrow keys` | Navigate within interactive elements |

### Screen Reader Support

```typescript
// Both dialogs automatically include:
- aria-label on buttons
- role="dialog" on modal
- aria-describedby for content
- Proper heading hierarchy
```

---

## Performance Tips

### 1. Lazy Loading
```typescript
import dynamic from 'next/dynamic';

const InteractivePlayDialog = dynamic(
  () => import('@/components/worksheet/canvas/InteractivePlayDialog'),
  { ssr: false }
);
```

### 2. Memoization
```typescript
const elements = useMemo(() => {
  return pageData.elements.map(element => ({
    ...element,
    // expensive calculations
  }));
}, [pageData.elements]);

<InteractivePlayDialog
  {...props}
  elements={elements}
/>
```

### 3. Virtualization (for many elements)
```typescript
// For pages with 10+ elements, consider virtualization
import { FixedSizeList } from 'react-window';

// Implement custom scrolling with react-window
```

---

## Troubleshooting

### Issue: Background not showing
**Solution:** Verify background object structure matches `PageBackground` interface

```typescript
// ✅ Correct
background={{
  type: 'solid',
  color: '#FFFFFF'
}}

// ❌ Incorrect
background={{
  backgroundColor: '#FFFFFF' // Wrong property name
}}
```

### Issue: Elements not rendering
**Solution:** Check element type matches supported types

```typescript
// ✅ Correct
elements={[
  { id: '1', type: 'tap-image', properties: {...} }
]}

// ❌ Incorrect
elements={[
  { id: '1', type: 'unknown-type', properties: {...} }
]}
```

### Issue: Animations too fast/slow
**Solution:** Adjust animation duration in styles

```typescript
// In the component file, modify:
transition={{ duration: 0.4 }} // Change 0.4 to desired seconds
```

---

## Best Practices

### 1. Always provide fallback
```typescript
<InteractivePreviewDialog
  open={open}
  onClose={() => setOpen(false)}
  title="Preview" // ✅ Explicit title
  elementType="tap-image" // ✅ Helps with icon
>
  {children || <div>No content</div>} {/* ✅ Fallback */}
</InteractivePreviewDialog>
```

### 2. Clean up on unmount
```typescript
useEffect(() => {
  return () => {
    // Clean up any event listeners, timers, etc.
  };
}, []);
```

### 3. Handle errors gracefully
```typescript
const [error, setError] = useState(null);

try {
  // Render interactive elements
} catch (err) {
  setError(err);
  // Show error state
}
```

---

## Migration from Old Version

### Before (Old API)
```typescript
<Dialog
  open={open}
  onClose={onClose}
  sx={{ /* custom styles */ }}
>
  <DialogContent sx={getBackgroundStyle()}>
    {children}
  </DialogContent>
</Dialog>
```

### After (New API)
```typescript
<InteractivePlayDialog
  open={open}
  onClose={onClose}
  pageTitle="My Page"
  pageNumber={1}
  background={backgroundConfig} // Background now isolated
  elements={elements}
/>
```

**Key Changes:**
- ✅ Background properly isolated
- ✅ No scroll issues
- ✅ Better theme integration
- ✅ Glassmorphism effects
- ✅ Staggered animations

---

## Support

For issues or questions:
1. Check `/docs/INTERACTIVE_DIALOG_UI_IMPROVEMENTS.md` for details
2. See `/docs/INTERACTIVE_DIALOG_ARCHITECTURE.md` for architecture
3. Review this file for usage examples

---

**Happy Coding! 🎉**

