# Cross-Page Component Move Feature

## 📝 Overview

This feature allows users to move atomic components between different pages in the Worksheet Generator, providing a seamless editing experience similar to professional design tools.

## ✨ Features Implemented

### 1. **Cut/Copy/Paste Operations**
- **Copy (Ctrl+C / Cmd+C)**: Duplicates component to clipboard
- **Cut (Ctrl+X / Cmd+X)**: Moves component to clipboard (removes from original page on paste)
- **Paste (Ctrl+V / Cmd+V)**: Pastes component to current page or selected page

### 2. **Visual Indicators**
- **Cut elements** show with:
  - Dashed orange border (`warning.main`)
  - Reduced opacity (50%)
  - Light warning background
- **Copied elements** maintain normal appearance
- **Clipboard status** shown in RightSidebar with icon and color coding

### 3. **Move to Page Dropdown**
- Located in RightSidebar when element is selected
- Shows all available pages with titles
- Current page marked with checkmark (✓)
- Target pages marked with arrow (→)
- Instant move on selection

### 4. **Keyboard Shortcuts**
- `Ctrl/Cmd + C` - Copy element
- `Ctrl/Cmd + X` - Cut element
- `Ctrl/Cmd + V` - Paste element to current/selected page
- `Ctrl/Cmd + D` - Duplicate element on same page
- `Delete/Backspace` - Delete element

### 5. **Smart Paste Behavior**
- Pasting to **same page**: Adds 20px offset (x+20, y+20) to avoid overlap
- Pasting to **different page**: No offset, maintains original position
- Cut operation clears clipboard after paste
- Copy operation keeps clipboard for multiple pastes

## 🏗️ Architecture

### State Management
```typescript
// Clipboard state with operation type
const [clipboard, setClipboard] = useState<{
  pageId: string;
  element: CanvasElement;
  operation: 'copy' | 'cut';
} | null>(null);
```

### Key Functions

#### `handleCutElement(pageId, elementId)`
- Stores element in clipboard with `operation: 'cut'`
- Element remains on page until pasted elsewhere

#### `handleCopyElement(pageId, elementId)`
- Stores element in clipboard with `operation: 'copy'`
- Element remains on page, can be pasted multiple times

#### `handlePasteElement(targetPageId)`
- Creates new element with unique ID
- For cut operations: removes from source page
- For copy operations: keeps clipboard intact
- Smart positioning based on source/target page

#### `handleMoveElementToPage(sourcePageId, elementId, targetPageId)`
- Direct move without clipboard
- Triggered from RightSidebar dropdown
- Maintains element properties and positioning
- Updates z-index for target page

## 🎨 UI Components

### RightSidebar Enhancements
1. **Element Location Info**
   - Blue info box showing current page number and title
   - Always visible when element is selected

2. **Copy/Cut Buttons**
   - Side-by-side button layout
   - Icons from lucide-react (Copy, Scissors)
   - Keyboard shortcut hints

3. **Clipboard Status Indicator**
   - Only shown when element is in clipboard
   - Color-coded: Orange for cut, Green for copy
   - Shows operation type with emoji

4. **Move to Page Dropdown**
   - Native select for performance
   - Only shown when multiple pages exist
   - Full page list with visual indicators

### CanvasPage Visual Feedback
```typescript
// Cut element styling
{
  border: `2px dashed ${alpha(theme.palette.warning.main, 0.7)}`,
  opacity: 0.5,
  backgroundColor: alpha(theme.palette.warning.main, 0.05),
}
```

## 📊 Data Flow

```
User Action
    ↓
Keyboard Shortcut / UI Button
    ↓
Handler Function (Cut/Copy/Paste/Move)
    ↓
Update pageContents Map
    ↓
Save to History (Undo/Redo support)
    ↓
Update UI (Visual feedback)
    ↓
Clear/Update Clipboard
```

## 🔄 State Updates

### Cut Operation
```typescript
1. Store element in clipboard with operation: 'cut'
2. Element shows visual "cut" state (dashed border, reduced opacity)
3. On paste to different page:
   - Remove from source page
   - Add to target page
   - Clear clipboard
   - Update history
```

### Copy Operation
```typescript
1. Store element in clipboard with operation: 'copy'
2. Element maintains normal appearance
3. On paste:
   - Add to target page
   - Keep clipboard intact
   - Update history
```

### Direct Move
```typescript
1. Find element in source page
2. Remove from source page
3. Add to target page with same properties
4. Update z-index for target page
5. Clear selection
6. Update history
```

## 🧪 Testing Scenarios

### Basic Operations
1. ✅ Copy element within same page
2. ✅ Copy element to different page
3. ✅ Cut element and paste to different page
4. ✅ Paste multiple times from copy clipboard
5. ✅ Direct move via dropdown

### Edge Cases
1. ✅ Cut element remains visible until pasted
2. ✅ Clipboard cleared after cut+paste
3. ✅ Multiple pastes work with copy
4. ✅ Visual feedback for cut elements
5. ✅ Dropdown only shows when multiple pages exist

### Keyboard Shortcuts
1. ✅ Ctrl/Cmd+C copies element
2. ✅ Ctrl/Cmd+X cuts element
3. ✅ Ctrl/Cmd+V pastes to selected page
4. ✅ Shortcuts don't interfere with text editing

### Undo/Redo
1. ✅ All operations save to history
2. ✅ Undo/Redo work correctly
3. ✅ History limit maintained (50 states)

## 🎯 User Experience

### Workflow Example
```
1. Select element on Page 1
2. Press Ctrl+X (cut)
   → Element shows dashed orange border
   → Clipboard indicator appears in sidebar
3. Navigate to Page 2
4. Press Ctrl+V (paste)
   → Element appears on Page 2
   → Original removed from Page 1
   → Clipboard cleared
```

### Alternative Workflow
```
1. Select element on Page 1
2. Open RightSidebar
3. Use "Move to Page" dropdown
4. Select "→ Page 2: Reading Comprehension"
   → Element instantly moves to Page 2
   → Selection cleared
```

## 🚀 Performance Considerations

1. **Efficient State Updates**: Uses Map for O(1) page lookups
2. **History Management**: Limited to 50 states to prevent memory issues
3. **Visual Feedback**: CSS transitions for smooth UX
4. **Native Select**: Used for dropdown to avoid rendering overhead

## 📈 Future Enhancements

### Possible Additions
- [ ] Multi-select and bulk move
- [ ] Drag-and-drop between pages in thumbnail view
- [ ] Move to new page option
- [ ] Element position adjustment after move
- [ ] Keyboard navigation in page dropdown
- [ ] Context menu (right-click) for cut/copy/paste

### Advanced Features
- [ ] Cross-worksheet copy/paste
- [ ] Element history/versioning
- [ ] Smart positioning based on page content
- [ ] Batch operations (move all of type X)

## 🐛 Known Limitations

1. **Single Element Operations**: Only one element can be moved at a time
2. **No Visual Drag**: No drag-and-drop between pages (only within page)
3. **Manual Positioning**: Element position might need adjustment after cross-page move
4. **No Preview**: No preview of element on target page before move

## 📚 Related Files

### Modified Files
- `src/components/worksheet/Step3CanvasEditor.tsx` - Main editor with handlers
- `src/components/worksheet/canvas/RightSidebar.tsx` - UI controls
- `src/components/worksheet/canvas/CanvasPage.tsx` - Visual feedback

### Key Types
- `CanvasElement` - Element structure
- `PageContent` - Page content structure
- `WorksheetPage` - Page metadata

## 🎓 Technical Decisions

### Why Map for pageContents?
- O(1) lookup by pageId
- Easy to update specific pages
- Better than array for dynamic updates

### Why separate Cut/Copy operations?
- Clear user intent
- Different visual feedback
- Different clipboard behavior
- Standard across design tools

### Why native select for dropdown?
- Better performance than MUI Select
- No z-index issues
- Native keyboard navigation
- Consistent with system UI

## 🔐 Security Considerations

- Element IDs regenerated on paste (prevents conflicts)
- No cross-user data access
- Clipboard cleared on sensitive operations
- History limited to prevent memory leaks

---

**Implemented by**: AI Assistant  
**Date**: 2025-10-02  
**Status**: ✅ Production Ready

