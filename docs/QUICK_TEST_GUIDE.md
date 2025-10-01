# 🚀 Quick Test Guide - Atomic Components

## How to Test the New Components

### 1. Start the Application

```bash
npm run dev
```

Navigate to: **http://localhost:3000/worksheet-editor**

### 2. Generate Worksheet

Fill in the form:
- **Subject:** English
- **Age Group:** Any
- **Level:** Any
- **Focus:** Any
- **Type:** Practice Sheet
- **Pages:** 3

Click **"Generate Worksheet"** → Wait 2 seconds

### 3. Test Drag & Drop

**From Left Sidebar:**
1. Click **"Components"** tab (first tab with 📦 icon)
2. Find **"Title"** component (📝)
3. **Drag** it onto any white A4 page
4. **Drop** it → Should appear with text "Your Title Here"
5. Repeat with **"Body Text"** component (📄)

**Expected Result:**
- ✅ Components appear at drop location
- ✅ Blue border on selected component
- ✅ Can drag multiple components to same page

### 4. Test Inline Editing - Title

1. **Click** on Title component (border turns blue)
2. **Click again** on the same title (or double-click)
3. Title should get **blue highlight** and become editable
4. **Type:** "Present Simple Practice"
5. Press **Enter**
6. Title updates with new text

**Expected Result:**
- ✅ Smooth transition to edit mode
- ✅ Blue highlight visible
- ✅ Text saves on Enter
- ✅ Can click elsewhere to deselect

### 5. Test Inline Editing - Body Text

1. **Click** on Body Text component
2. **Double-click** to enter edit mode
3. **Type:** "Complete the exercises below using the present simple tense."
4. Press **Enter** to save
5. Text updates

**Expected Result:**
- ✅ Same editing behavior as Title
- ✅ Multiline text works
- ✅ ESC cancels edit

### 6. Test Component Movement

1. **Click** Title to select
2. **Drag** it to different position on page
3. Notice **red/blue alignment guides** appear
4. **Release** to place
5. Component stays in new position

**Expected Result:**
- ✅ Smooth dragging
- ✅ Alignment guides helpful
- ✅ Position persists

### 7. Test Canvas Navigation

**Zoom:**
- Click **+** button (top center) → Zooms in
- Click **-** button → Zooms out
- Click **50%** chip → Resets to 100%
- **Ctrl+Wheel** → Also zooms

**Pan:**
- Click **Hand tool** (H button)
- **Drag** canvas → Moves view
- Or hold **Space** + drag with Select tool

**Pages:**
- Canvas shows **3 A4 pages** in space
- Can drag pages around like in Miro
- **Mini-map** (bottom left) shows overview

### 8. Test Multiple Components

Try adding these to same page:
1. **Title** (📝) - "Grammar Exercise"
2. **Body Text** (📄) - "Choose the correct form..."
3. **Instructions** (📋) - "Complete all questions"
4. **Fill in Blanks** (✏️) - Shows example sentences
5. **Tip Box** (💡) - Shows helpful tip
6. **Warning Box** (⚠️) - Shows grammar warning

**Expected Result:**
- ✅ All components visible
- ✅ Can select each independently
- ✅ Can move each to different positions
- ✅ Title and Body Text are editable
- ⚠️ Others render but no editing (coming soon)

## 🎹 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **V** | Select tool |
| **H** | Hand tool |
| **Space** (hold) | Temporary hand tool |
| **Enter** | Save edit |
| **Escape** | Cancel edit |
| **Ctrl+Wheel** | Zoom |
| **Mouse Wheel** | Pan canvas |

## ✅ What Should Work

- ✅ Drag components from sidebar to canvas
- ✅ Drop components on any page
- ✅ Select component (click once)
- ✅ Edit Title (click twice or double-click)
- ✅ Edit Body Text (same as Title)
- ✅ Move components by dragging
- ✅ Alignment guides when moving
- ✅ Zoom in/out (buttons or Ctrl+Wheel)
- ✅ Pan canvas (Hand tool or Space)
- ✅ Multiple pages visible
- ✅ Mini-map shows all pages

## ⚠️ What Doesn't Work Yet

- ❌ Save/Export buttons (greyed out)
- ❌ Editing Instructions/Tip/Warning boxes
- ❌ Editing Fill-blank items
- ❌ Editing Multiple Choice questions
- ❌ Image upload/replace
- ❌ Component deletion (no Delete key)
- ❌ Undo/Redo
- ❌ Copy/Paste
- ❌ AI Assistant (mock only)

## 🐛 How to Report Issues

If something doesn't work:

1. **Check browser console** (F12) for errors
2. **Note exact steps** to reproduce
3. **Check which component** caused issue
4. **Screenshot** if UI looks wrong

## 🎯 Success Criteria

You successfully tested if:
- ✅ Added Title component to page
- ✅ Edited Title text and it saved
- ✅ Added Body Text component
- ✅ Edited Body Text and it saved
- ✅ Moved both components around
- ✅ Saw alignment guides
- ✅ Used zoom and pan
- ✅ No console errors

---

**Have fun building worksheets!** 🎓✨

