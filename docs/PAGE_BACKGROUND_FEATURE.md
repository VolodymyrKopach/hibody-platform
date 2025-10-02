# Page Background Feature

## Overview

The Page Background feature allows users to customize the background color of individual worksheet pages in the Canvas Editor. This feature provides multiple ways to apply backgrounds for maximum flexibility and user experience.

## Implementation Date

October 2, 2025

## Architecture

### Hybrid Approach

The implementation follows a **Hybrid Approach** that combines three methods for maximum UX:

1. **Quick Color Presets** (Header) - Fast access to common colors
2. **Properties Panel** (Right Sidebar) - Detailed controls when page is selected
3. **Keyboard Shortcut** (Cmd/Ctrl+B) - Power user access

---

## Technical Implementation

### 1. Data Structure

```typescript
interface PageBackground {
  type: 'solid' | 'gradient' | 'pattern';
  color?: string;
  gradient?: {
    from: string;
    to: string;
    direction: 'to-bottom' | 'to-top' | 'to-right' | 'to-left' | 'to-bottom-right' | 'to-bottom-left';
  };
  pattern?: string;
  opacity?: number;
}

interface WorksheetPage {
  id: string;
  pageNumber: number;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string[];
  thumbnail: string;
  background?: PageBackground; // ✨ New property
}
```

### 2. Default Background Presets

```typescript
const BACKGROUND_PRESETS = [
  { name: 'White', color: '#FFFFFF', icon: '⚪' },
  { name: 'Cream', color: '#FFF8E7', icon: '🟡' },
  { name: 'Light Blue', color: '#F0F9FF', icon: '🔵' },
  { name: 'Light Green', color: '#F0FDF4', icon: '🟢' },
  { name: 'Light Pink', color: '#FDF2F8', icon: '🟣' },
  { name: 'Light Gray', color: '#F9FAFB', icon: '⚫' },
];
```

---

## User Interface

### Header - Quick Color Presets

**Location**: Header toolbar, between Undo/Redo and Export buttons

**Features**:
- 🎨 Palette icon button
- Opens dropdown menu with color presets
- Visual color swatches (40x40px)
- Checkmark on currently selected color
- Hover effects with scale animation
- Applies to:
  - Selected page only (if page is selected)
  - All pages (if no page selected)

**Keyboard Shortcut**: `Cmd/Ctrl + B`

### Right Sidebar - Page Settings

**Location**: Right sidebar → Page Settings section → Background

**Appears when**: A page is selected

**Features**:
- **Current Color Display**: Shows active background color with hex code
- **Quick Presets**: 6 preset colors (32x32px swatches)
- **Custom Color Picker**: HTML5 color input for unlimited colors
- Real-time visual feedback
- Click presets for instant application
- Color picker uses `onBlur` to prevent re-render loops

---

## Code Structure

### Modified Files

1. **`src/components/worksheet/Step3CanvasEditor.tsx`**
   - Added `PageBackground` interface
   - Added `BACKGROUND_PRESETS` constant
   - Updated `WorksheetPage` interface
   - Added background to mock data
   - Added `backgroundMenuAnchor` state
   - Added `handleBackgroundMenuOpen/Close` handlers
   - Added `handleBackgroundPresetApply` handler
   - Added `handlePageBackgroundUpdate` handler
   - Added Palette icon button in header
   - Added Background menu component
   - Added keyboard shortcut (Cmd/Ctrl+B)
   - Pass `background` prop to `CanvasPage`
   - Pass `onPageBackgroundUpdate` to `RightSidebar`

2. **`src/components/worksheet/canvas/CanvasPage.tsx`**
   - Added `PageBackground` interface
   - Added `background?: PageBackground` prop
   - Added `getBackgroundStyle()` function
   - Applied background style to Paper component
   - Supports solid colors, gradients, and patterns

3. **`src/components/worksheet/canvas/RightSidebar.tsx`**
   - Added `PageBackground` interface
   - Added `onPageBackgroundUpdate` prop
   - Added `customColor` state for color picker
   - Added `BACKGROUND_PRESETS` constant
   - Added Background section in Page Settings
   - Added color presets grid
   - Added custom color picker with `onBlur` handler

---

## Features

### ✅ Implemented

- [x] Solid color backgrounds
- [x] 6 preset colors (white, cream, light blue, green, pink, gray)
- [x] Custom color picker
- [x] Quick access from header (Palette button)
- [x] Detailed controls in properties panel
- [x] Keyboard shortcut (Cmd/Ctrl+B)
- [x] Apply to single page (when selected)
- [x] Apply to all pages (when no page selected)
- [x] Visual feedback (checkmarks, hover effects)
- [x] Proper state management (no infinite loops)
- [x] Export support (backgrounds included in PDF/PNG)

### 🚧 Future Enhancements

- [ ] Gradient backgrounds
- [ ] Pattern backgrounds
- [ ] Opacity control
- [ ] Recent colors history
- [ ] Eyedropper tool
- [ ] Background presets per age group
- [ ] Texture/pattern library
- [ ] Save custom color palettes

---

## Usage

### Method 1: Quick Presets (Header)

1. Click the **Palette icon** in the header (or press `Cmd/Ctrl + B`)
2. Select a color preset from the dropdown
3. Background applies to:
   - Selected page (if one is selected)
   - All pages (if none selected)

### Method 2: Properties Panel

1. **Select a page** by clicking on it
2. Scroll to **Page Settings** in the right sidebar
3. Find the **Background** section
4. Choose from:
   - **Quick Presets**: Click a color swatch
   - **Custom Color**: Use the color picker

### Method 3: Keyboard Shortcut

1. Press `Cmd/Ctrl + B`
2. Background menu opens automatically
3. Select desired color

---

## Technical Notes

### State Management

- Background state is stored in the `pages` array
- Each page has its own `background` property
- Changes trigger re-render of affected page(s)
- No infinite loop issues (using `onBlur` for color picker)

### Export Behavior

- Backgrounds are **included** in PDF export
- Backgrounds are **included** in PNG export
- Backgrounds are **included** in print
- `getBackgroundStyle()` converts background object to CSS

### Performance

- Minimal re-renders (background changes don't affect other pages)
- Color picker uses local state + `onBlur` to prevent loops
- Efficient CSS background application

---

## Testing Scenarios

### Scenario 1: Apply to Single Page
1. Select Page 1
2. Change background to cream
3. ✅ Only Page 1 should have cream background

### Scenario 2: Apply to All Pages
1. Deselect all pages (click canvas)
2. Open background menu
3. Select light blue
4. ✅ All pages should have light blue background

### Scenario 3: Custom Color
1. Select a page
2. Open Properties Panel → Background
3. Use custom color picker
4. Choose purple (#A855F7)
5. ✅ Page should have purple background

### Scenario 4: Keyboard Shortcut
1. Press `Cmd/Ctrl + B`
2. ✅ Background menu should open
3. Select a color
4. ✅ Color should apply

### Scenario 5: Export
1. Set different backgrounds for pages
2. Export to PDF
3. ✅ PDF should include all backgrounds

---

## Known Issues

None at this time.

---

## Future Considerations

### Gradient Support (Phase 2)

```typescript
{
  type: 'gradient',
  gradient: {
    from: '#FF6B6B',
    to: '#4ECDC4',
    direction: 'to-bottom-right'
  }
}
```

### Pattern Support (Phase 2)

```typescript
{
  type: 'pattern',
  pattern: 'dots' | 'lines' | 'grid' | 'texture-1',
  color: '#F0F9FF'
}
```

### Opacity Control (Phase 2)

- Slider for background opacity (0-100%)
- Useful for watermark effects

---

## Accessibility

- Color picker has proper labels
- Keyboard navigation support
- Keyboard shortcut available
- Tooltips on all interactive elements
- High contrast for UI elements

---

## Dependencies

- `lucide-react` (Palette icon)
- Material-UI components (Menu, TextField, etc.)
- React hooks (useState, useEffect)

---

## Related Files

- `src/components/worksheet/Step3CanvasEditor.tsx` - Main editor
- `src/components/worksheet/canvas/CanvasPage.tsx` - Page component
- `src/components/worksheet/canvas/RightSidebar.tsx` - Properties panel
- `src/types/canvas-element.ts` - Type definitions

---

## Conclusion

The Page Background feature is **fully implemented** with a hybrid approach that provides:
- Quick access for common use cases
- Detailed control for advanced users
- Power user shortcuts

The implementation is performant, user-friendly, and ready for production use.

