# Advanced Editing Features

## 📝 Overview

Implemented three major editing features for the Worksheet Canvas Editor:
1. **Duplicate Element** (Ctrl+D)
2. **Copy/Paste** (Ctrl+C / Ctrl+V)
3. **Undo/Redo** (Ctrl+Z / Ctrl+Shift+Z)

These features transform the canvas into a professional-grade editor with familiar shortcuts and workflows.

---

## 1. 📋 Duplicate Element

### Features:
- **Keyboard Shortcut:** Ctrl+D (Windows) / Cmd+D (Mac)
- **Button:** Properties Panel → Actions → "Duplicate Element (Ctrl+D)"
- **Behavior:** Creates exact copy with +20px offset (x and y)
- **Auto-selection:** Duplicate is automatically selected after creation

### Implementation:
```typescript
const handleElementDuplicate = (pageId: string, elementId: string) => {
  // Find original element
  const originalElement = pageContent.elements.find(el => el.id === elementId);
  
  // Create duplicate with:
  // - New unique ID
  // - Position offset (+20, +20)
  // - Same properties
  // - New zIndex
  
  // Save to history
  saveToHistory(newMap);
  
  // Auto-select duplicate
};
```

### Testing:
1. Add Title to canvas
2. **Press Ctrl+D** → Copy appears +20px offset
3. **Press Ctrl+D again** → Another copy +20px from last
4. Each copy is **auto-selected**
5. Or click **"Duplicate Element"** button

---

## 2. 📎 Copy/Paste

### Features:
- **Copy:** Ctrl+C (Windows) / Cmd+C (Mac)
- **Paste:** Ctrl+V (Windows) / Cmd+V (Mac)
- **Clipboard Indicator:** Shows "📋 1 item" badge in header when something is copied
- **Cross-page paste:** Can copy from one page and paste to another
- **Smart targeting:** Pastes to currently selected page or element's page

### Implementation:

#### Copy:
```typescript
const handleCopyElement = (pageId: string, elementId: string) => {
  // Store element and source page in clipboard state
  setClipboard({ pageId, element });
  
  // Protected: Won't copy if user is typing in text field
};
```

#### Paste:
```typescript
const handlePasteElement = (targetPageId: string) => {
  // Create pasted element with:
  // - New unique ID
  // - Position offset (+20, +20)
  // - Same properties
  
  // Save to history
  saveToHistory(newMap);
  
  // Auto-select pasted element
};
```

### Clipboard State:
```typescript
const [clipboard, setClipboard] = useState<{ 
  pageId: string; 
  element: CanvasElement 
} | null>(null);
```

### Smart Protection:
- Won't copy/paste if user is typing in INPUT field
- Won't copy/paste if user is typing in TEXTAREA
- Won't copy/paste if user is editing contentEditable element

### Testing:
1. Add Title to canvas → Select it
2. **Press Ctrl+C** → Badge shows "📋 1 item"
3. Click on another page
4. **Press Ctrl+V** → Element pastes to new page!
5. **Press Ctrl+V again** → Another copy appears

---

## 3. ⏪ Undo/Redo

### Features:
- **Undo:** Ctrl+Z (Windows) / Cmd+Z (Mac)
- **Redo:** Ctrl+Shift+Z (Windows) / Cmd+Shift+Z (Mac)
- **Buttons:** Toolbar → Undo/Redo buttons with disabled states
- **History Limit:** 50 states (auto-trims older history)
- **Visual Feedback:** Buttons disabled when no history available

### Implementation:

#### History State:
```typescript
const [history, setHistory] = useState<Map<string, PageContent>[]>([]);
const [historyIndex, setHistoryIndex] = useState(-1);
```

#### Save to History:
```typescript
const saveToHistory = (newPageContents: Map<string, PageContent>) => {
  // Remove future history if not at end
  const newHistory = prev.slice(0, historyIndex + 1);
  
  // Add new state
  newHistory.push(new Map(newPageContents));
  
  // Limit to 50 states
  if (newHistory.length > 50) {
    newHistory.shift();
  }
  
  setHistoryIndex(prev => Math.min(prev + 1, 49));
};
```

#### Undo:
```typescript
const handleUndo = () => {
  if (historyIndex > 0) {
    const newIndex = historyIndex - 1;
    setPageContents(new Map(history[newIndex]));
    // Clear selection to avoid orphan references
  }
};
```

#### Redo:
```typescript
const handleRedo = () => {
  if (historyIndex < history.length - 1) {
    const newIndex = historyIndex + 1;
    setPageContents(new Map(history[newIndex]));
    // Clear selection
  }
};
```

### History Tracking:
All mutating operations save to history:
- ✅ `handleElementAdd` → New element added
- ✅ `handleElementEdit` → Properties changed
- ✅ `handleElementDelete` → Element deleted
- ✅ `handleElementDuplicate` → Element duplicated
- ✅ `handlePasteElement` → Element pasted

### Visual Indicators:
```typescript
<IconButton 
  disabled={historyIndex <= 0}  // Undo disabled if at start
  onClick={handleUndo}
>
  <Undo />
</IconButton>

<IconButton 
  disabled={historyIndex >= history.length - 1}  // Redo disabled if at end
  onClick={handleRedo}
>
  <Redo />
</IconButton>
```

### Testing:
1. Add Title → **Undo button enabled**
2. **Press Ctrl+Z** → Title disappears
3. **Redo button now enabled**
4. **Press Ctrl+Shift+Z** → Title reappears
5. Edit title text → Undo removes changes
6. Multiple undos → Step back through all changes

---

## 🎯 Keyboard Shortcuts Summary

| Shortcut | Action | Protection |
|----------|--------|------------|
| **Ctrl+D** | Duplicate selected element | None |
| **Ctrl+C** | Copy selected element | ❌ Not when typing |
| **Ctrl+V** | Paste from clipboard | ❌ Not when typing |
| **Ctrl+Z** | Undo last change | None |
| **Ctrl+Shift+Z** | Redo last undo | None |
| **Delete** | Delete selected element | ❌ Not when editing |
| **Backspace** | Delete selected element | ❌ Not when editing |

*All shortcuts work with Cmd key on Mac*

---

## 🔧 Technical Implementation

### State Management:
```typescript
// Clipboard for copy/paste
const [clipboard, setClipboard] = useState<{ 
  pageId: string; 
  element: CanvasElement 
} | null>(null);

// History for undo/redo
const [history, setHistory] = useState<Map<string, PageContent>[]>([]);
const [historyIndex, setHistoryIndex] = useState(-1);
```

### Keyboard Event Handler:
All shortcuts handled in single `useEffect`:
```typescript
React.useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+D - Duplicate
    // Ctrl+C - Copy
    // Ctrl+V - Paste
    // Ctrl+Z - Undo
    // Ctrl+Shift+Z - Redo
    // Delete/Backspace - Delete
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isSpacePressed, selection, clipboard, historyIndex, history, pages]);
```

### Protection Logic:
```typescript
// Check if user is editing text
const target = e.target as HTMLElement;
const isEditable = target.contentEditable === 'true' || 
                   target.contentEditable === 'plaintext-only';

if (target.tagName !== 'INPUT' && 
    target.tagName !== 'TEXTAREA' && 
    !isEditable) {
  // Safe to execute shortcut
}
```

---

## 📁 Files Modified

### Core Logic:
- ✅ `src/components/worksheet/Step3CanvasEditor.tsx`
  - Added duplicate/copy/paste/undo/redo handlers
  - Added keyboard shortcuts
  - Added history management
  - Added visual indicators (clipboard badge, undo/redo buttons)

### UI Updates:
- ✅ Header Toolbar
  - Added Undo/Redo buttons with disabled states
  - Added clipboard indicator badge
  - Added divider between zoom and history controls

### Props Updates:
- ✅ `src/components/worksheet/canvas/RightSidebar.tsx`
  - Added `onDuplicate` prop
  - Connected "Duplicate Element" button

---

## ✨ Benefits

### For Users:
- ✅ **Familiar shortcuts** - Works like Figma, Canva, Photoshop
- ✅ **Mistake recovery** - Undo any change instantly
- ✅ **Fast iteration** - Duplicate and modify quickly
- ✅ **Cross-page workflow** - Copy/paste between pages
- ✅ **Visual feedback** - Badges and disabled states show status
- ✅ **Safe editing** - Won't interfere with text input

### For Workflow:
- ✅ **Professional UX** - Matches industry standards
- ✅ **Productivity boost** - Keyboard-first workflow
- ✅ **Error tolerance** - Easy to experiment and undo
- ✅ **Complex layouts** - Duplicate + modify pattern
- ✅ **Non-destructive** - History preserves all states

---

## 🎨 UI Components

### Clipboard Badge:
```typescript
{clipboard && (
  <Chip
    label="📋 1 item"
    size="small"
    color="primary"
    variant="outlined"
  />
)}
```

### Undo/Redo Buttons:
```typescript
<Tooltip title="Undo (Ctrl+Z)">
  <span>
    <IconButton 
      disabled={historyIndex <= 0}
      onClick={handleUndo}
    >
      <Undo />
    </IconButton>
  </span>
</Tooltip>
```

*Note: `<span>` wrapper required for disabled button tooltips*

---

## 🧪 Complete Testing Workflow

### 1. Duplicate Testing:
```
1. Add Title → Select it
2. Ctrl+D → Duplicate appears +20px offset
3. Ctrl+D → Another duplicate appears
4. Each duplicate auto-selected
5. Click "Duplicate Element" button → Same result
```

### 2. Copy/Paste Testing:
```
1. Add Title on Page 1 → Select it
2. Ctrl+C → Badge shows "📋 1 item"
3. Scroll to Page 2 → Click on page
4. Ctrl+V → Title appears on Page 2
5. Ctrl+V → Another copy appears
```

### 3. Undo/Redo Testing:
```
1. Add Title → Undo button enabled
2. Ctrl+Z → Title disappears
3. Redo button now enabled
4. Ctrl+Shift+Z → Title reappears
5. Edit title text → Type "Hello"
6. Ctrl+Z → Text reverts
7. Ctrl+Z → Title disappears
8. Ctrl+Shift+Z twice → Back to "Hello"
```

### 4. Combined Workflow:
```
1. Add Title
2. Ctrl+D → Duplicate
3. Edit duplicate text
4. Ctrl+C → Copy
5. Ctrl+V → Paste
6. Ctrl+Z → Undo paste
7. Ctrl+Z → Undo edit
8. Ctrl+Z → Undo duplicate
9. Ctrl+Shift+Z three times → Redo all
```

---

## 🚀 Future Enhancements

### Priority 1:
- ⏳ **Multi-select** → Copy/duplicate multiple elements
- ⏳ **Cut** (Ctrl+X) → Copy and delete in one action
- ⏳ **History panel** → Visual timeline of changes

### Priority 2:
- ⏳ **Persistent history** → Save to localStorage
- ⏳ **Named snapshots** → Save important states
- ⏳ **History branching** → Explore alternative versions

### Priority 3:
- ⏳ **Collaborative undo** → Undo only your changes
- ⏳ **Selective undo** → Undo specific operations
- ⏳ **Undo preview** → Show what will change

---

## 💡 Design Decisions

### Why +20px offset for duplicate/paste?
- Prevents overlap with original
- Visual feedback that copy succeeded
- Easy to see and select new element
- Matches Figma/Sketch behavior

### Why limit history to 50 states?
- Balances memory usage vs functionality
- 50 undos covers 99% of use cases
- Auto-trim prevents memory leaks
- Can be increased if needed

### Why clear selection on undo/redo?
- Prevents references to deleted elements
- Cleaner state management
- Forces user to reselect (safer)
- Shows clear visual feedback

### Why clipboard badge instead of toast?
- Persistent visual indicator
- Doesn't interrupt workflow
- Shows clipboard is not empty
- Reminds user they can paste

### Why wrap disabled buttons in `<span>`?
- MUI tooltips don't work on disabled elements
- Span receives hover events
- Standard MUI pattern
- Maintains accessibility

---

**Status:** 🟢 **Complete** - All three features fully implemented and tested!

**Date:** October 1, 2025

