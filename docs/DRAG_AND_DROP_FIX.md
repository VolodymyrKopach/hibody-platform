# Drag & Drop Fix - Element Sticking to Cursor

## 🐛 Problem

When dragging an element on the canvas, it would "jump" and not stay at the cursor position. The element moved with an offset/distance from the cursor instead of "sticking" to it.

### User Experience Issue:
1. Click on element to drag
2. Element **jumps** up/away from cursor
3. Element follows cursor but with **incorrect offset**
4. Expected: Element should **stick to cursor** at exact click point

## 🔍 Root Cause

The bug had **two parts**:

### 1. Incorrect Offset Calculation

In `handleElementMouseDown`:
```typescript
// ❌ WRONG - Mixed coordinate systems
setDragState({
  elementId,
  startX: e.clientX,                        // Global viewport coordinates
  startY: e.clientY,                        // Global viewport coordinates
  offsetX: e.clientX - element.position.x,  // ❌ e.clientX is global, position.x is page-relative
  offsetY: e.clientY - element.position.y,  // ❌ Wrong coordinate system
});
```

**Problem:** 
- `e.clientX` is relative to **viewport** (entire browser window)
- `element.position.x` is relative to **page element** (the A4 paper)
- Subtracting these gives **wrong offset**!

### 2. Offset Not Used

In `handleMouseMove`:
```typescript
// ❌ WRONG - Offset ignored
const rect = pageRef.current.getBoundingClientRect();
const x = e.clientX - rect.left;  // Convert to page coordinates
const y = e.clientY - rect.top;

onElementMove(dragState.elementId, { x, y });  // ❌ Places element at cursor, ignoring offset!
```

**Problem:**
- The carefully calculated `offsetX` and `offsetY` were **never used**!
- Element position was set directly to cursor position
- This made element "jump" to align its top-left corner with cursor

## ✅ Solution

### Part 1: Calculate Offset Correctly

```typescript
const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
  // ... validation ...
  
  // ✅ CORRECT - Convert to page coordinates first
  const rect = pageRef.current.getBoundingClientRect();
  const mouseXInPage = e.clientX - rect.left;  // Mouse X relative to page
  const mouseYInPage = e.clientY - rect.top;   // Mouse Y relative to page

  setDragState({
    elementId,
    startX: e.clientX,
    startY: e.clientY,
    offsetX: mouseXInPage - element.position.x,  // ✅ Both in page coordinates!
    offsetY: mouseYInPage - element.position.y,  // ✅ Correct offset
  });
};
```

**Key Change:**
- Convert `e.clientX/Y` to page-relative coordinates **before** calculating offset
- Now both values are in the **same coordinate system**

### Part 2: Apply Offset During Movement

```typescript
const handleMouseMove = (e: React.MouseEvent) => {
  if (!dragState || !pageRef.current) return;

  const rect = pageRef.current.getBoundingClientRect();
  const mouseXInPage = e.clientX - rect.left;
  const mouseYInPage = e.clientY - rect.top;

  // ✅ CORRECT - Apply offset so element sticks to cursor
  const x = mouseXInPage - dragState.offsetX;
  const y = mouseYInPage - dragState.offsetY;

  // ... alignment guides ...
  
  onElementMove(dragState.elementId, { x, y });
};
```

**Key Change:**
- **Subtract** offset from mouse position
- This keeps the element at the **exact point where user clicked**

## 📐 Mathematical Explanation

### What is the offset?

When user clicks on an element, they click at some point **inside** the element:

```
┌─────────────────────┐
│  Element            │
│                     │
│      👆 Click here  │  <- User clicks at (150, 80)
│    (not corner!)    │  <- Element top-left is at (100, 50)
│                     │
└─────────────────────┘
```

**Offset calculation:**
```
offsetX = clickX - elementX = 150 - 100 = 50
offsetY = clickY - elementY = 80 - 50 = 30
```

This means user clicked **50px from left edge** and **30px from top edge** of element.

### During drag:

To keep element under cursor at the **same point**, we need:

```
newElementX = currentMouseX - offsetX
newElementY = currentMouseY - offsetY
```

**Example:**
- Mouse moves to (300, 200)
- Element should be at: (300 - 50, 200 - 30) = (250, 170)
- So the click point (50px from left, 30px from top) stays under cursor

## 🧪 Testing

### Before Fix:
```
1. Click on center of Title element
   → Element jumps so its top-left is at cursor ❌
2. Drag cursor
   → Element follows but offset is wrong ❌
3. Release
   → Element is not where you expect ❌
```

### After Fix:
```
1. Click on center of Title element
   → Element stays exactly where it is ✅
2. Drag cursor
   → Element follows smoothly, staying "glued" to cursor ✅
3. Release
   → Element is exactly where cursor is ✅
```

### Test Cases:

#### Test 1: Click on Element Center
1. Add Title element
2. Click on **center** of element
3. Drag → Element should stay centered on cursor
4. ✅ **Pass if element doesn't jump**

#### Test 2: Click on Element Corner
1. Add Body Text element
2. Click on **top-left corner**
3. Drag → Corner should stay at cursor
4. ✅ **Pass if corner follows cursor exactly**

#### Test 3: Click on Element Edge
1. Add any element
2. Click on **right edge** of element
3. Drag → Right edge should stay at cursor
4. ✅ **Pass if edge follows cursor**

## 📁 Files Modified

- ✅ `src/components/worksheet/canvas/CanvasPage.tsx`
  - Fixed `handleElementMouseDown` - correct offset calculation
  - Fixed `handleMouseMove` - apply offset during drag
  - Added comments explaining coordinate system

## 🎯 Technical Details

### Coordinate Systems:

**1. Viewport Coordinates:**
- `e.clientX`, `e.clientY`
- Relative to entire browser window
- Origin at top-left of viewport

**2. Page Coordinates:**
- `element.position.x`, `element.position.y`
- Relative to the Paper/Page component
- Origin at top-left of page
- Need to convert from viewport: `pageX = clientX - rect.left`

**3. Element Local Coordinates:**
- Offset within element
- Origin at element's top-left
- `offsetX = mouseXInPage - element.position.x`

### Flow:

```
User clicks
    ↓
1. Get mouse viewport coords (e.clientX, e.clientY)
    ↓
2. Get page bounding rect
    ↓
3. Convert to page coords: mouseXInPage = clientX - rect.left
    ↓
4. Calculate offset: offsetX = mouseXInPage - element.position.x
    ↓
5. Store in dragState
    ↓
User drags
    ↓
6. Get current mouse page coords
    ↓
7. Apply offset: newX = mouseXInPage - offsetX
    ↓
8. Update element position
    ↓
Element "sticks" to cursor! ✨
```

## 💡 Key Learnings

### 1. Always Use Same Coordinate System
When calculating offsets, ensure all values are in the **same coordinate system**. Don't mix viewport and page coordinates!

### 2. Store and Apply Offsets
The offset between cursor and element must be:
- **Calculated** at mousedown
- **Stored** in state
- **Applied** during mousemove

### 3. getBoundingClientRect() Is Your Friend
Use it to convert between coordinate systems:
```typescript
const rect = element.getBoundingClientRect();
const relativeX = clientX - rect.left;
const relativeY = clientY - rect.top;
```

### 4. Test Edge Cases
- Click on corner vs center
- Zoomed canvas
- Scrolled viewport
- Different element sizes

## 🚀 Future Improvements

### Potential Enhancements:
1. ⏳ **Smooth animations** - Use CSS transforms for better performance
2. ⏳ **Snap to grid** - Optional grid snapping during drag
3. ⏳ **Magnetic guides** - Auto-snap to alignment guides
4. ⏳ **Drag preview** - Show ghost/preview during drag
5. ⏳ **Multi-element drag** - Drag multiple selected elements

### Performance Optimizations:
1. ⏳ Use `requestAnimationFrame` for smooth updates
2. ⏳ Debounce guide calculations
3. ⏳ CSS `will-change` for better GPU acceleration

---

**Status:** 🟢 **Fixed** - Elements now stick perfectly to cursor during drag!

**Date:** October 1, 2025

