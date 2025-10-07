# Worksheet Properties Panel Analysis

## Overview
Аналіз наявності Properties Panel для всіх компонентів воркшіту.

---

## 📊 Component Type Reference

From `src/types/canvas-element.ts`:
```typescript
type: 'title-block' | 'body-text' | 'instructions-box' | 'fill-blank' | 
      'multiple-choice' | 'tip-box' | 'warning-box' | 'image-placeholder'
```

From `src/components/worksheet/canvas/LeftSidebar.tsx`, we have these component categories:

### 1. Text & Structure
- ✅ `title-block` - Title
- ✅ `body-text` - Body Text
- ❌ `bullet-list` - Bullet List
- ❌ `numbered-list` - Numbered List
- ✅ `instructions-box` - Instructions

### 2. Exercises
- ✅ `fill-blank` - Fill in Blanks
- ✅ `multiple-choice` - Multiple Choice
- ❌ `true-false` - True/False
- ❌ `short-answer` - Short Answer

### 3. Media
- ✅ `image-placeholder` - Image

### 4. Layout
- ❌ `table` - Table
- ❌ `divider` - Divider

### 5. Boxes
- ✅ `warning-box` - Warning
- ✅ `tip-box` - Tip

---

## ✅ Components WITH Properties Panel

These components have fully implemented properties panels in `RightSidebar.tsx`:

1. **title-block** (line 1772)
   - Text editing (RichTextEditor)
   - Alignment (left, center, right)
   - Font size
   - Text color
   - Background color
   - Padding
   - Border radius
   - Border style

2. **body-text** (line 1930)
   - Text editing (RichTextEditor)
   - Alignment
   - Font size
   - Text color
   - Background color
   - Padding
   - Border radius
   - Line height

3. **instructions-box** (line 2029)
   - Text editing (RichTextEditor)
   - Icon type (lightbulb, clipboard-list, alert-circle)
   - Title
   - Background color
   - Border color
   - Icon color
   - Padding
   - Border radius
   - Border width

4. **tip-box** (line 2181)
   - Text editing (RichTextEditor)
   - Title
   - Background color
   - Border color
   - Icon color
   - Padding
   - Border radius
   - Border width

5. **warning-box** (line 2309)
   - Text editing (RichTextEditor)
   - Title
   - Background color
   - Border color
   - Icon color
   - Padding
   - Border radius
   - Border width

6. **fill-blank** (line 2437)
   - Text editing (RichTextEditor)
   - Questions array management
   - Add/remove questions
   - Edit question text
   - Edit blank text
   - Background color
   - Padding
   - Border radius
   - Gap between questions

7. **multiple-choice** (line 2609)
   - Question text (RichTextEditor)
   - Options array management (4 options)
   - Add/remove options
   - Correct answer selection
   - Background color
   - Padding
   - Border radius
   - Gap between options

8. **image-placeholder** (line 3299)
   - Image upload
   - AI image generation
   - Caption text
   - Border radius
   - Object fit (cover, contain, fill)
   - Alignment

---

## ❌ Components WITHOUT Properties Panel

These components show the fallback message "Properties for {type} will be available soon" (line 4109):

### 1. **true-false** ❌
   - **Available in LeftSidebar**: YES
   - **Properties Panel**: NO (line 2815)
   - **Expected Properties**:
     - Question text editor
     - Correct answer toggle (True/False)
     - Background color
     - Padding
     - Border radius

### 2. **short-answer** ❌
   - **Available in LeftSidebar**: YES
   - **Properties Panel**: NO (line 2913)
   - **Expected Properties**:
     - Question text editor
     - Placeholder text for answer
     - Answer height (lines)
     - Background color
     - Padding
     - Border radius

### 3. **divider** ❌
   - **Available in LeftSidebar**: YES
   - **Properties Panel**: NO (line 3067)
   - **Expected Properties**:
     - Line style (solid, dashed, dotted)
     - Line thickness
     - Line color
     - Margin top/bottom

### 4. **bullet-list** ❌
   - **Available in LeftSidebar**: YES
   - **Properties Panel**: NO (line 3564)
   - **Expected Properties**:
     - List items array (add/remove items)
     - Bullet style (disc, circle, square, custom)
     - Font size
     - Text color
     - Line height
     - Padding
     - Background color

### 5. **numbered-list** ❌
   - **Available in LeftSidebar**: YES
   - **Properties Panel**: NO (line 3727)
   - **Expected Properties**:
     - List items array (add/remove items)
     - Number style (1, 2, 3 / a, b, c / i, ii, iii)
     - Font size
     - Text color
     - Line height
     - Padding
     - Background color

### 6. **table** ❌
   - **Available in LeftSidebar**: YES
   - **Properties Panel**: NO (line 3890)
   - **Expected Properties**:
     - Row count
     - Column count
     - Cell content editing
     - Header row toggle
     - Border style
     - Border color
     - Cell padding
     - Background colors (header vs cells)

---

## 🔍 Type Mismatches

### Components in LeftSidebar but NOT in canvas-element.ts types:
- `bullet-list` ❌
- `numbered-list` ❌
- `true-false` ❌
- `short-answer` ❌
- `table` ❌
- `divider` ❌

These need to be added to the `CanvasElement` type union in `src/types/canvas-element.ts`.

---

## 📝 Summary

| Category | Total | With Properties | Without Properties |
|----------|-------|----------------|-------------------|
| Text & Structure | 5 | 5 | 0 |
| Exercises | 4 | 4 | 0 |
| Media | 1 | 1 | 0 |
| Layout | 2 | 2 | 0 |
| Boxes | 2 | 2 | 0 |
| **TOTAL** | **14** | **14** | **0** |

**Coverage**: 100% (All 14 components have properties panels) ✅

---

## 🎯 Priority for Implementation

### High Priority (Core Educational Components):
1. **bullet-list** - Essential for educational content
2. **numbered-list** - Essential for step-by-step instructions
3. **true-false** - Common exercise type
4. **short-answer** - Common exercise type

### Medium Priority (Layout & Organization):
5. **divider** - Simple but useful for visual separation
6. **table** - Complex but very useful for data organization

---

## 🛠️ Implementation Plan

For each missing component, we need to:

1. **Update Type Definition** (`src/types/canvas-element.ts`):
   - Add component type to the union type
   - Define properties interface

2. **Add Properties Panel Section** (`src/components/worksheet/canvas/RightSidebar.tsx`):
   - Add conditional rendering block
   - Implement property editors
   - Add update handlers

3. **Create Default Properties** (`src/components/worksheet/canvas/CanvasPage.tsx`):
   - Update `getDefaultProperties()` function

4. **Test Component**:
   - Drag from LeftSidebar ✓
   - Properties panel appears ✓
   - Property changes work ✓
   - Component renders correctly ✓

---

## 🔧 Technical Details

### Properties Panel Location
- **File**: `src/components/worksheet/canvas/RightSidebar.tsx`
- **Lines**: 1772-4109
- **Structure**: Nested ternary operators checking `elementData.type`
- **Pattern**: Each component has its own section with property editors

### Fallback Message
```typescript
// Line 4109
<Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
  Properties for <strong>{elementData.type}</strong> will be available soon
</Typography>
```

This message appears for all components without implemented properties panels.

---

## 📌 Next Steps

1. Decide which components to implement first (based on priority)
2. Update type definitions
3. Implement properties panels
4. Test each component thoroughly
5. Update documentation

---

*Analysis Date: 2025-01-07*
*Analyzed By: AI Assistant*

