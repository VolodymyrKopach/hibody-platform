# 🎯 Worksheet Generator: Incremental UI-First Development Plan

## 📌 **Overview**

**Підхід:** Інкрементальна розробка з фокусом на UI  
**Стратегія:** Поетапне додавання функціональності з візуальним прогресом на кожному кроці  
**Тривалість:** 60 днів (~3 місяці)  
**Технології:** Next.js, React, Fabric.js, Gemini AI, LocalStorage  

---

## 🎨 **Development Philosophy**

### **Ключові Принципи:**
1. **UI-First** - спочатку візуальний компонент, потім функціональність
2. **Incremental Progress** - маленькі кроки, швидкі wins
3. **Testable** - кожен етап можна протестувати окремо
4. **Visual Feedback** - бачити прогрес кожного дня
5. **No Database** - все локально в браузері (LocalStorage)

### **Архітектурні Рішення:**
- ✅ **Fabric.js** для canvas manipulation
- ✅ **Gemini AI** для content generation
- ✅ **LocalStorage** для збереження worksheets
- ✅ **JSON-based** структура даних
- ✅ **jsPDF + html2canvas** для export

---

## 📋 **Overall Roadmap**

```
Phase 1: Canvas Foundation (10 днів)
  ↓
Phase 2: Atomic Components (25 днів)
  ↓
Phase 3: Advanced Canvas Features (6 днів)
  ↓
Phase 4: Export System (7 днів)
  ↓
Phase 5: LocalStorage & Polish (12 днів)
```

---

## 🟦 **PHASE 1: Canvas Foundation (День 1-10)**

### **Goal:** Створити робочий canvas з базовою функціональністю

---

### **Step 1.1: Basic Canvas Setup**
**Тривалість:** 2 дні (День 1-2)

#### **Завдання:**
1. Створити нову сторінку `/app/worksheet-editor/page.tsx`
2. Інтегрувати Fabric.js canvas
3. Налаштувати A4 формат (595x842px)
4. Створити базовий layout (Header + Sidebar + Canvas)

#### **UI Structure:**
```
┌─────────────────────────────────────────────┐
│ 📄 Worksheet Editor                    [X]  │
├─────────────────────────────────────────────┤
│                                             │
│  [Empty]    ┌─────────────────┐            │
│  Sidebar    │                 │            │
│             │   A4 Canvas     │            │
│             │   (White)       │            │
│             │                 │            │
│             │                 │            │
│             └─────────────────┘            │
│                                             │
└─────────────────────────────────────────────┘
```

#### **Файли для створення:**
- `src/app/worksheet-editor/page.tsx`
- `src/components/worksheet/editor/WorksheetCanvas.tsx`
- `src/components/worksheet/editor/EditorLayout.tsx`
- `src/types/worksheet.ts` (базові типи)

#### **Success Criteria:**
- ✅ Білий A4 canvas відображається в центрі
- ✅ Canvas має правильні пропорції (A4)
- ✅ Responsive layout працює
- ✅ Sidebar і header на місці

---

### **Step 1.2: Zoom & Pan Controls**
**Тривалість:** 2 дні (День 3-4)

#### **Завдання:**
1. Додати zoom slider (50% - 200%)
2. Реалізувати zoom in/out buttons
3. Додати "Fit to Screen" button
4. Реалізувати pan functionality (Space + drag або Hand tool)
5. Показувати поточний zoom рівень

#### **UI Components:**
```
┌─────────────────────────────────────────────┐
│ 📄 Worksheet Editor                         │
│ [Zoom: 100%] [−] [━━●━━] [+] [⊡ Fit]      │
├─────────────────────────────────────────────┤
│             ┌─────────────────┐            │
│             │   A4 Canvas     │            │
│             │   (Zoomable)    │            │
│             └─────────────────┘            │
└─────────────────────────────────────────────┘
```

#### **Файли для створення:**
- `src/components/worksheet/editor/ZoomControls.tsx`
- `src/hooks/useCanvasZoom.ts`
- `src/utils/worksheet/canvasHelpers.ts`

#### **Success Criteria:**
- ✅ Zoom in/out працює плавно
- ✅ Slider оновлює zoom в real-time
- ✅ Pan (Space + drag) працює
- ✅ Fit to Screen центрує canvas
- ✅ Zoom indicator оновлюється

---

### **Step 1.3: Multi-Page Support**
**Тривалість:** 2 дні (День 5-6)

#### **Завдання:**
1. Реалізувати систему сторінок (Page 1, Page 2, etc.)
2. Додати кнопки навігації (Previous/Next)
3. Створити sidebar з page thumbnails
4. Додати "Add New Page" button
5. Реалізувати "Delete Page" functionality

#### **UI Structure:**
```
┌─────────────────────────────────────────────┐
│ 📄 Worksheet Editor                         │
│ [Zoom: 100%] [−][━●━][+][⊡]               │
├─────────────────────────────────────────────┤
│ ┌───────┐   ┌─────────────────┐            │
│ │ Page1 │   │   A4 Canvas     │ [Page 1/3] │
│ │ [●]   │   │   (Active)      │            │
│ │────── │   │                 │ [◀ Prev]   │
│ │ Page2 │   │                 │ [Next ▶]   │
│ │ [ ]   │   │                 │            │
│ │────── │   │                 │ [+ Add]    │
│ │ Page3 │   │                 │ [🗑 Delete]│
│ │ [ ]   │   │                 │            │
│ │────── │   └─────────────────┘            │
│ │[+New] │                                   │
│ └───────┘                                   │
└─────────────────────────────────────────────┘
```

#### **Файли для створення:**
- `src/components/worksheet/editor/PageNavigator.tsx`
- `src/components/worksheet/editor/PageThumbnails.tsx`
- `src/hooks/useWorksheetPages.ts`
- `src/utils/worksheet/pageManager.ts`

#### **Success Criteria:**
- ✅ Можна додавати нові сторінки
- ✅ Навігація Previous/Next працює
- ✅ Page thumbnails показують preview
- ✅ Видалення сторінок працює (з підтвердженням)
- ✅ Active page виділена візуально

---

### **Step 1.4: Grid & Guidelines**
**Тривалість:** 2 дні (День 7-8)

#### **Завдання:**
1. Додати toggle для grid overlay
2. Реалізувати snap-to-grid functionality
3. Додати smart guides (alignment lines)
4. Показувати ruler margins

#### **UI Components:**
```
┌─────────────────────────────────────────────┐
│ [Zoom...] [☑ Grid] [☑ Snap] [☑ Guides]    │
├─────────────────────────────────────────────┤
│             ┌─────────────────┐            │
│             │ ╔═══════════╗   │            │
│             │ ║ • • • • • ║   │ ← Grid dots│
│             │ ║ • • • • • ║   │            │
│             │ ║ • • • • • ║   │            │
│             │ ║ • • • • • ║   │            │
│             │ ╚═══════════╝   │            │
│             └─────────────────┘            │
└─────────────────────────────────────────────┘
```

#### **Файли для створення:**
- `src/components/worksheet/editor/GridControls.tsx`
- `src/utils/worksheet/gridSystem.ts`
- `src/utils/worksheet/snapToGrid.ts`
- `src/utils/worksheet/smartGuides.ts`

#### **Success Criteria:**
- ✅ Grid показується/ховається
- ✅ Snap to grid працює при переміщенні об'єктів
- ✅ Smart guides з'являються при вирівнюванні
- ✅ Grid spacing налаштовується (опціонально)

---

### **Step 1.5: Basic Toolbar**
**Тривалість:** 2 дні (День 9-10)

#### **Завдання:**
1. Створити toolbar з базовими tools
2. Select tool (стрілка) - default
3. Hand tool (pan mode)
4. Undo/Redo buttons з history
5. Delete button
6. Keyboard shortcuts (Ctrl+Z, Del, Space)

#### **UI Structure:**
```
┌─────────────────────────────────────────────┐
│ [↖●] [✋] │ [↶] [↷] │ [🗑] │ [Grid ☑]     │
│ Select Hand  Undo Redo Delete               │
├─────────────────────────────────────────────┤
│   Sidebar   │    Canvas Area                │
└─────────────────────────────────────────────┘
```

#### **Файли для створення:**
- `src/components/worksheet/editor/Toolbar.tsx`
- `src/components/worksheet/editor/ToolButton.tsx`
- `src/hooks/useUndoRedo.ts`
- `src/utils/worksheet/historyManager.ts`

#### **Success Criteria:**
- ✅ Toolbar відображається і responsive
- ✅ Tool selection працює (active state)
- ✅ Undo/Redo з history stack працює
- ✅ Delete button видаляє selected objects
- ✅ Keyboard shortcuts працюють
- ✅ Cursor змінюється залежно від active tool

---

## 🎯 **Milestone 1: Canvas Foundation Complete**
**После 10 днів маємо:**
- ✅ Повнофункціональний A4 canvas
- ✅ Zoom/Pan controls
- ✅ Multi-page system
- ✅ Grid & smart guides
- ✅ Basic toolbar з undo/redo

**🚀 Ready for Demo #1!**

---

## 🟩 **PHASE 2: Atomic Components (День 11-35)**

### **Goal:** Створити 8 атомарних компонентів з AI генерацією

### **Development Pattern (для кожного компонента):**
```
Day 1: Static UI
  → Create React component
  → Fabric.js wrapper
  → Add to sidebar
  → Click to add to canvas

Day 2: Editable
  → Double-click inline editing
  → Properties panel
  → Transform handles (resize, rotate)
  → Real-time updates

Day 3: AI Integration
  → "Regenerate with AI" button
  → Gemini API integration
  → Loading states
  → Error handling
```

---

### **Component 1: Title Block**
**Тривалість:** 3 дні (День 11-13)

#### **Day 11: Static UI**

**Завдання:**
- Створити `TitleBlock.tsx` компонент
- Інтегрувати з Fabric.js (Text object)
- Додати кнопку "Add Title" в sidebar
- Click → додає title на canvas з default text

**UI:**
```
┌─────────────────────────────────────────────┐
│ Toolbar...                                  │
├───────┬─────────────────────────────────────┤
│ Add:  │ ┌─────────────────┐                │
│ ┌───┐ │ │ Worksheet Title │ ← Можна клікнути│
│ │ T │ │ └─────────────────┘                │
│ └───┘ │                                     │
│ Title │                                     │
└───────┴─────────────────────────────────────┘
```

**Файли:**
- `src/components/worksheet/atomic/TitleBlock.tsx`
- `src/components/worksheet/editor/ComponentLibrary.tsx`
- `src/utils/worksheet/fabricComponents.ts`

**Success Criteria:**
- ✅ Sidebar button "Add Title"
- ✅ Click → adds title to canvas
- ✅ Default styling (28px, bold, dark blue)
- ✅ Title can be selected

#### **Day 12: Editable**

**Завдання:**
- Double-click для inline editing
- Створити Properties Panel
- Font, size, color, alignment controls
- Transform handles (resize, rotate)

**UI:**
```
┌─────────────────────────────────────────────┐
│ Canvas with Title selected                  │
├───────────┬─────────────────┬───────────────┤
│ Sidebar   │ Canvas          │ Properties    │
│           │ [Title Block|]  │ ┌───────────┐ │
│           │  □ ←resize     │ │Font: Arial│ │
│           │                 │ │Size: 28   │ │
│           │                 │ │Color: 🎨  │ │
│           │                 │ │Align: [L] │ │
│           │                 │ └───────────┘ │
└───────────┴─────────────────┴───────────────┘
```

**Файли:**
- `src/components/worksheet/editor/PropertiesPanel.tsx`
- `src/components/worksheet/properties/TitleProperties.tsx`
- `src/hooks/useInlineEdit.ts`

**Success Criteria:**
- ✅ Double-click → inline editing mode
- ✅ Properties panel appears when selected
- ✅ Font/size/color changes apply in real-time
- ✅ Alignment buttons work
- ✅ Resize handles work

#### **Day 13: AI Integration**

**Завдання:**
- Додати "✨ Regenerate with AI" button
- Інтегрувати Gemini API
- Prompt engineering для titles
- Loading state + error handling

**UI:**
```
Properties Panel:
┌───────────────────────┐
│ Title Block           │
├───────────────────────┤
│ Text: [Worksheet T...] │
│ Font: [Arial ▾]       │
│ Size: [28]            │
│ Color: [🎨 #2563EB]   │
├───────────────────────┤
│ [✨ Regenerate AI]    │
│ ⏳ Generating...      │
└───────────────────────┘
```

**Файли:**
- `src/services/worksheet/GeminiAIService.ts`
- `src/services/worksheet/ComponentGeneratorService.ts`
- `src/app/api/worksheet/generate-component/route.ts`

**Success Criteria:**
- ✅ "Regenerate AI" button працює
- ✅ Loading state показується
- ✅ AI генерує альтернативний title
- ✅ Error fallback працює
- ✅ Cancel generation можливий

---

### **Component 2: Body Text**
**Тривалість:** 3 дні (День 14-16)

**Особливості:**
- Rich text formatting (bold, italic, underline)
- Multi-line support
- Text wrapping
- Paragraph spacing

**Файли:**
- `src/components/worksheet/atomic/BodyText.tsx`
- `src/components/worksheet/properties/BodyTextProperties.tsx`

---

### **Component 3: Instructions Box**
**Тривалість:** 3 дні (День 17-19)

**Особливості:**
- Icon picker (📝 ✏️ 📋 ✅)
- Border styles (solid, dashed)
- Background color
- Corner radius

**Файли:**
- `src/components/worksheet/atomic/InstructionsBox.tsx`
- `src/components/worksheet/properties/InstructionsProperties.tsx`
- `src/components/ui/IconPicker.tsx`

---

### **Component 4: Fill-in-the-Blank**
**Тривалість:** 3 дні (День 20-22)

**Особливості:**
- Dynamic blanks creation
- Blank width adjustment
- Word bank integration
- Answer key generation

**Файли:**
- `src/components/worksheet/atomic/FillInTheBlank.tsx`
- `src/components/worksheet/properties/FillInBlankProperties.tsx`
- `src/utils/worksheet/blankGenerator.ts`

---

### **Component 5: Multiple Choice**
**Тривалість:** 3 дні (День 23-25)

**Особливості:**
- Question + options structure
- Radio buttons styling
- Correct answer marking (hidden from export)
- Number of options configurable

**Файли:**
- `src/components/worksheet/atomic/MultipleChoice.tsx`
- `src/components/worksheet/properties/MultipleChoiceProperties.tsx`

---

### **Component 6: Warning Box**
**Тривалість:** 3 дні (День 26-28)

**Особливості:**
- Warning types (Grammar, Time, Difficulty)
- Yellow color theme (#FEF3C7)
- Warning icon (⚠️)
- Bold border

**Файли:**
- `src/components/worksheet/atomic/WarningBox.tsx`
- `src/components/worksheet/properties/WarningBoxProperties.tsx`

---

### **Component 7: Tip Box**
**Тривалість:** 3 дні (День 29-31)

**Особливості:**
- Tip categories (Grammar, Vocabulary, Pronunciation)
- Blue color theme (#DBEAFE)
- Light bulb icon (💡)
- Softer border

**Файли:**
- `src/components/worksheet/atomic/TipBox.tsx`
- `src/components/worksheet/properties/TipBoxProperties.tsx`

---

### **Component 8: Image Placeholder**
**Тривалість:** 3 дні (День 32-34)

**Особливості:**
- Image upload (file picker)
- Base64 encoding для LocalStorage
- Resize and crop
- Caption support
- Placeholder icon when empty

**Файли:**
- `src/components/worksheet/atomic/ImagePlaceholder.tsx`
- `src/components/worksheet/properties/ImageProperties.tsx`
- `src/utils/worksheet/imageProcessor.ts`

---

## 🎯 **Milestone 2: All Atomic Components Complete**
**Після 35 днів маємо:**
- ✅ 8 повнофункціональних компонентів
- ✅ Component Library sidebar завершена
- ✅ Properties Panel dynamic для кожного типу
- ✅ AI regeneration працює для всіх компонентів
- ✅ Drag & Drop працює

**🚀 Ready for Demo #2!**

---

## 🟨 **PHASE 3: Advanced Canvas Features (День 36-41)**

### **Goal:** Додати професійні інструменти редагування

---

### **Step 3.1: Layers Panel**
**Тривалість:** 2 дні (День 36-37)

#### **Завдання:**
1. Створити Layers Panel в sidebar
2. Показувати всі об'єкти з іконками
3. Drag to reorder (z-index)
4. Lock/Unlock layers
5. Show/Hide layers
6. Rename layer

#### **UI:**
```
┌─────────────────────────────────────────────┐
│                             │ Layers        │
│                             │ ┌───────────┐ │
│                             │ │👁 🔒 Title│ │
│        Canvas               │ │👁 🔓 Body │ │
│                             │ │👁 🔓 Image│ │
│                             │ │👁 🔓 Tip  │ │
│                             │ └───────────┘ │
└─────────────────────────────────────────────┘
```

#### **Файли:**
- `src/components/worksheet/editor/LayersPanel.tsx`
- `src/components/worksheet/editor/LayerItem.tsx`
- `src/hooks/useLayerManagement.ts`

#### **Success Criteria:**
- ✅ Layers list показує всі об'єкти
- ✅ Drag to reorder працює
- ✅ Lock/Unlock працює (не можна editити)
- ✅ Hide/Show працює
- ✅ Double-click to rename

---

### **Step 3.2: Alignment Tools**
**Тривалість:** 2 дні (День 38-39)

#### **Завдання:**
1. Align Left/Center/Right
2. Align Top/Middle/Bottom
3. Distribute Horizontally/Vertically
4. Smart spacing
5. Group/Ungroup objects

#### **UI:**
```
Toolbar extension:
┌─────────────────────────────────────────────┐
│ Align: [⊏][⊐][⊑] | [⊓][⊔][⊒] | [↔][↕] | [⊡]│
│       Left Center Right Top Mid Bot  Distrib│
└─────────────────────────────────────────────┘
```

#### **Файли:**
- `src/components/worksheet/editor/AlignmentTools.tsx`
- `src/utils/worksheet/alignmentHelpers.ts`

#### **Success Criteria:**
- ✅ Alignment працює для single object
- ✅ Alignment працює для multiple selection
- ✅ Distribute evenly працює
- ✅ Group/Ungroup працює

---

### **Step 3.3: Copy/Paste/Duplicate**
**Тривалість:** 2 дні (День 40-41)

#### **Завдання:**
1. Copy (Ctrl+C)
2. Cut (Ctrl+X)
3. Paste (Ctrl+V)
4. Duplicate (Ctrl+D)
5. Clipboard management
6. Cross-page paste

#### **Файли:**
- `src/utils/worksheet/clipboardManager.ts`
- `src/hooks/useClipboard.ts`

#### **Success Criteria:**
- ✅ Copy/Paste працює
- ✅ Cut працює
- ✅ Duplicate offset працює правильно
- ✅ Cross-page paste працює
- ✅ Keyboard shortcuts працюють

---

## 🎯 **Milestone 3: Advanced Features Complete**
**Після 41 дня маємо:**
- ✅ Layers Panel functional
- ✅ Alignment tools працюють
- ✅ Copy/Paste/Duplicate працює
- ✅ Professional editing experience

**🚀 Ready for Demo #3!**

---

## 🟧 **PHASE 4: Export System (День 42-48)**

### **Goal:** Експорт worksheets в різних форматах

---

### **Step 4.1: Export Dialog UI**
**Тривалість:** 2 дні (День 42-43)

#### **Завдання:**
1. Створити Export button в header
2. Modal dialog з опціями
3. Format selection (PDF/PNG/SVG)
4. Quality settings
5. Page selection (All/Current/Custom)

#### **UI:**
```
┌─────────────────────────────────────────────┐
│          Export Worksheet                   │
├─────────────────────────────────────────────┤
│ Format:                                     │
│ ● PDF (Recommended)                         │
│ ○ PNG (High Quality)                        │
│ ○ SVG (Editable Vector)                     │
│                                             │
│ Quality:                                    │
│ ○ Standard (150 DPI)                        │
│ ● High (300 DPI)                            │
│ ○ Ultra (600 DPI)                           │
│                                             │
│ Pages:                                      │
│ ● All Pages                                 │
│ ○ Current Page Only                         │
│ ○ Custom Range: [_____]                    │
│                                             │
│ [Cancel]  [📥 Export]                      │
└─────────────────────────────────────────────┘
```

#### **Файли:**
- `src/components/worksheet/export/ExportDialog.tsx`
- `src/components/worksheet/export/FormatSelector.tsx`
- `src/components/worksheet/export/QualitySelector.tsx`

#### **Success Criteria:**
- ✅ Export dialog відкривається
- ✅ All options selectable
- ✅ Validation працює
- ✅ UI responsive

---

### **Step 4.2: PDF Export**
**Тривалість:** 2 дні (День 44-45)

#### **Завдання:**
1. Інтегрувати jsPDF library
2. Canvas → PDF rendering
3. Multi-page support
4. Font embedding
5. High quality (300 DPI)

#### **Файли:**
- `src/services/worksheet/ExportService.ts`
- `src/services/worksheet/PDFExporter.ts`
- `src/utils/worksheet/pdfHelpers.ts`

#### **Success Criteria:**
- ✅ PDF генерується
- ✅ A4 format зберігається
- ✅ High quality (300 DPI)
- ✅ Multi-page працює
- ✅ Fonts embedded properly

---

### **Step 4.3: PNG Export**
**Тривалість:** 2 дні (День 46-47)

#### **Завдання:**
1. Fabric.js toDataURL() або html2canvas
2. High resolution rendering
3. Transparent background option
4. Single/Multiple pages

#### **Файли:**
- `src/services/worksheet/PNGExporter.ts`
- `src/utils/worksheet/imageExport.ts`

#### **Success Criteria:**
- ✅ PNG high quality (300+ DPI)
- ✅ Transparent background працює
- ✅ Single page export
- ✅ Multiple pages → ZIP

---

### **Step 4.4: SVG Export**
**Тривалість:** 1 день (День 48)

#### **Завдання:**
1. Fabric.js toSVG()
2. Editable vector output
3. Font to path conversion (optional)

#### **Файли:**
- `src/services/worksheet/SVGExporter.ts`

#### **Success Criteria:**
- ✅ SVG генерується
- ✅ Editable в Illustrator/Figma
- ✅ Fonts preserved або converted

---

## 🎯 **Milestone 4: Export System Complete**
**Після 48 днів маємо:**
- ✅ PDF export (300 DPI)
- ✅ PNG export (high quality)
- ✅ SVG export (editable)
- ✅ Multi-page support
- ✅ Quality options

**🚀 Ready for Demo #4!**

---

## 🟪 **PHASE 5: LocalStorage & Polish (День 49-60)**

### **Goal:** Persistence, performance, і final polish

---

### **Step 5.1: Save/Load System**
**Тривалість:** 3 дні (День 49-51)

#### **Завдання:**
1. Save button з manual save
2. Auto-save (every 30 seconds)
3. Load from LocalStorage
4. JSON serialization/deserialization
5. Version control (optional)

#### **UI:**
```
Header:
┌─────────────────────────────────────────────┐
│ 📄 My Worksheet    [💾 Save] [Last: 2m ago]│
└─────────────────────────────────────────────┘
```

#### **Файли:**
- `src/services/worksheet/LocalStorageService.ts`
- `src/services/worksheet/WorksheetSerializer.ts`
- `src/hooks/useAutoSave.ts`

#### **Success Criteria:**
- ✅ Manual save працює
- ✅ Auto-save працює (debounced)
- ✅ Load worksheet працює
- ✅ Last saved timestamp показується
- ✅ Unsaved changes warning

---

### **Step 5.2: My Worksheets Page**
**Тривалість:** 3 дні (День 52-54)

#### **Завдання:**
1. Створити `/app/worksheets/page.tsx`
2. Grid layout з thumbnails
3. Search & filter
4. Duplicate worksheet
5. Delete worksheet
6. Open in editor

#### **UI:**
```
┌─────────────────────────────────────────────┐
│ My Worksheets          [Search...] [+ New]  │
├─────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │[Thumb]  │ │[Thumb]  │ │[Thumb]  │        │
│ │Title 1  │ │Title 2  │ │Title 3  │        │
│ │Created: │ │Created: │ │Created: │        │
│ │Jan 5    │ │Jan 4    │ │Jan 3    │        │
│ │[Edit]   │ │[Edit]   │ │[Edit]   │        │
│ │[⋮]      │ │[⋮]      │ │[⋮]      │        │
│ └─────────┘ └─────────┘ └─────────┘        │
└─────────────────────────────────────────────┘
```

#### **Файли:**
- `src/app/worksheets/page.tsx`
- `src/components/worksheet/gallery/WorksheetCard.tsx`
- `src/components/worksheet/gallery/WorksheetGrid.tsx`
- `src/hooks/useWorksheetList.ts`

#### **Success Criteria:**
- ✅ List saved worksheets
- ✅ Thumbnail generation працює
- ✅ Search працює
- ✅ Edit/Duplicate/Delete працюють
- ✅ Sort by date/name

---

### **Step 5.3: Keyboard Shortcuts & Help**
**Тривалість:** 2 дні (День 55-56)

#### **Завдання:**
1. Help modal (Ctrl+? або ?)
2. Shortcuts list
3. Tooltip hints
4. Accessibility improvements

#### **Shortcuts:**
```
Navigation:
- Space + Drag - Pan canvas
- Ctrl + Scroll - Zoom

Editing:
- Ctrl + Z - Undo
- Ctrl + Y / Ctrl + Shift + Z - Redo
- Ctrl + C - Copy
- Ctrl + X - Cut
- Ctrl + V - Paste
- Ctrl + D - Duplicate
- Del / Backspace - Delete
- Ctrl + A - Select All

Alignment:
- Ctrl + Shift + L - Align Left
- Ctrl + Shift + C - Align Center
- Ctrl + Shift + R - Align Right

File:
- Ctrl + S - Save
- Ctrl + E - Export
- Ctrl + N - New Worksheet
```

#### **Файли:**
- `src/components/worksheet/help/KeyboardShortcutsModal.tsx`
- `src/hooks/useKeyboardShortcuts.ts`

#### **Success Criteria:**
- ✅ Help modal показує всі shortcuts
- ✅ Всі shortcuts працюють
- ✅ Tooltips everywhere
- ✅ ARIA labels для accessibility

---

### **Step 5.4: Error Handling & Empty States**
**Тривалість:** 2 дні (День 57-58)

#### **Завдання:**
1. Error boundaries
2. Toast notifications
3. Loading states polish
4. Empty states з CTAs
5. Graceful degradation

#### **Файли:**
- `src/components/worksheet/errors/WorksheetErrorBoundary.tsx`
- `src/components/ui/Toast.tsx`
- `src/components/worksheet/empty/EmptyCanvas.tsx`

#### **Success Criteria:**
- ✅ Error boundaries catch crashes
- ✅ Toast notifications user-friendly
- ✅ Loading states smooth
- ✅ Empty states з helpful CTAs

---

### **Step 5.5: Performance Optimization**
**Тривалість:** 2 дні (День 59-60)

#### **Завдання:**
1. Canvas rendering optimization
2. LocalStorage compression (LZ-string)
3. Lazy loading components
4. Debouncing auto-save
5. Virtual scrolling для layers/pages

#### **Файли:**
- `src/utils/worksheet/compression.ts`
- `src/utils/worksheet/performance.ts`

#### **Success Criteria:**
- ✅ Canvas rendering smooth (60fps)
- ✅ LocalStorage optimized (compression)
- ✅ Auto-save не блокує UI
- ✅ Large worksheets (20+ pages) працюють

---

## 🎯 **Milestone 5: Production Ready!**
**Після 60 днів маємо:**
- ✅ Save/Load system працює
- ✅ My Worksheets page функціональна
- ✅ Keyboard shortcuts повністю
- ✅ Error handling robust
- ✅ Performance optimized
- ✅ Help documentation

**🚀 READY FOR LAUNCH! 🎉**

---

## 📊 **Timeline Summary**

| Phase | Days | Focus | Key Deliverables |
|-------|------|-------|------------------|
| **Phase 1** | 1-10 | Canvas Foundation | Zoom, Pan, Multi-page, Grid, Toolbar |
| **Phase 2** | 11-35 | Atomic Components | 8 components + AI integration |
| **Phase 3** | 36-41 | Advanced Features | Layers, Alignment, Copy/Paste |
| **Phase 4** | 42-48 | Export System | PDF, PNG, SVG export |
| **Phase 5** | 49-60 | Save & Polish | LocalStorage, Shortcuts, Error handling |

**Total: 60 днів (12 тижнів, ~3 місяці)**

---

## 📦 **Dependencies**

### **New Packages to Install:**
```json
{
  "fabric": "^5.3.0",           // Canvas manipulation
  "jspdf": "^2.5.1",            // PDF export
  "html2canvas": "^1.4.1",      // PNG export (alternative)
  "lz-string": "^1.5.0"         // LocalStorage compression
}
```

### **Gemini AI API:**
- Google AI Studio API Key
- Rate limiting: 60 requests/minute (free tier)

---

## 🗂️ **File Structure**

```
src/
├── app/
│   ├── worksheet-editor/
│   │   └── page.tsx                    # Main editor page
│   └── worksheets/
│       └── page.tsx                    # My Worksheets gallery
│
├── components/
│   └── worksheet/
│       ├── editor/
│       │   ├── WorksheetCanvas.tsx     # Main canvas component
│       │   ├── EditorLayout.tsx        # Layout wrapper
│       │   ├── Toolbar.tsx             # Tools (select, hand, undo, etc.)
│       │   ├── ZoomControls.tsx        # Zoom slider & buttons
│       │   ├── PageNavigator.tsx       # Page prev/next
│       │   ├── PageThumbnails.tsx      # Sidebar thumbnails
│       │   ├── GridControls.tsx        # Grid, snap, guides toggles
│       │   ├── ComponentLibrary.tsx    # Atomic components sidebar
│       │   ├── PropertiesPanel.tsx     # Dynamic properties panel
│       │   ├── LayersPanel.tsx         # Layers list
│       │   ├── LayerItem.tsx           # Single layer item
│       │   └── AlignmentTools.tsx      # Alignment buttons
│       │
│       ├── atomic/
│       │   ├── TitleBlock.tsx          # Title component
│       │   ├── BodyText.tsx            # Body text component
│       │   ├── InstructionsBox.tsx     # Instructions component
│       │   ├── FillInTheBlank.tsx      # Fill-in-blank component
│       │   ├── MultipleChoice.tsx      # Multiple choice component
│       │   ├── WarningBox.tsx          # Warning box component
│       │   ├── TipBox.tsx              # Tip box component
│       │   └── ImagePlaceholder.tsx    # Image component
│       │
│       ├── properties/
│       │   ├── TitleProperties.tsx     # Title-specific properties
│       │   ├── BodyTextProperties.tsx  # Body text properties
│       │   ├── InstructionsProperties.tsx
│       │   ├── FillInBlankProperties.tsx
│       │   ├── MultipleChoiceProperties.tsx
│       │   ├── WarningBoxProperties.tsx
│       │   ├── TipBoxProperties.tsx
│       │   └── ImageProperties.tsx
│       │
│       ├── export/
│       │   ├── ExportDialog.tsx        # Export modal
│       │   ├── FormatSelector.tsx      # PDF/PNG/SVG selector
│       │   └── QualitySelector.tsx     # DPI selector
│       │
│       ├── gallery/
│       │   ├── WorksheetCard.tsx       # Single worksheet card
│       │   └── WorksheetGrid.tsx       # Grid layout
│       │
│       ├── help/
│       │   └── KeyboardShortcutsModal.tsx
│       │
│       └── errors/
│           └── WorksheetErrorBoundary.tsx
│
├── services/
│   └── worksheet/
│       ├── GeminiAIService.ts          # Gemini API integration
│       ├── ComponentGeneratorService.ts # Component-specific generation
│       ├── ExportService.ts            # Main export orchestrator
│       ├── PDFExporter.ts              # PDF generation
│       ├── PNGExporter.ts              # PNG generation
│       ├── SVGExporter.ts              # SVG generation
│       ├── LocalStorageService.ts      # LocalStorage CRUD
│       └── WorksheetSerializer.ts      # JSON serialize/deserialize
│
├── hooks/
│   ├── useCanvasZoom.ts                # Zoom functionality
│   ├── useWorksheetPages.ts            # Multi-page management
│   ├── useUndoRedo.ts                  # History management
│   ├── useInlineEdit.ts                # Inline editing
│   ├── useLayerManagement.ts           # Layers CRUD
│   ├── useClipboard.ts                 # Copy/paste
│   ├── useAutoSave.ts                  # Auto-save logic
│   ├── useWorksheetList.ts             # My Worksheets list
│   └── useKeyboardShortcuts.ts         # Keyboard shortcuts
│
├── utils/
│   └── worksheet/
│       ├── canvasHelpers.ts            # Fabric.js helpers
│       ├── gridSystem.ts               # Grid rendering
│       ├── snapToGrid.ts               # Snap logic
│       ├── smartGuides.ts              # Alignment guides
│       ├── fabricComponents.ts         # Fabric wrappers
│       ├── pageManager.ts              # Page CRUD
│       ├── historyManager.ts           # Undo/redo stack
│       ├── alignmentHelpers.ts         # Alignment calculations
│       ├── clipboardManager.ts         # Clipboard logic
│       ├── blankGenerator.ts           # Fill-in-blank logic
│       ├── imageProcessor.ts           # Image upload/resize
│       ├── pdfHelpers.ts               # PDF utilities
│       ├── imageExport.ts              # PNG export utilities
│       ├── compression.ts              # LZ-string compression
│       └── performance.ts              # Performance utilities
│
├── types/
│   └── worksheet.ts                    # All TypeScript types
│
└── app/
    └── api/
        └── worksheet/
            └── generate-component/
                └── route.ts            # Gemini API endpoint
```

---

## 🔗 **API Endpoints**

### **POST /api/worksheet/generate-component**

**Request:**
```json
{
  "componentType": "title-block",
  "context": {
    "topic": "Present Simple Tense",
    "ageGroup": "Kids 6-12",
    "level": "Beginner"
  },
  "existingText": "Worksheet Title" // optional, for regeneration
}
```

**Response:**
```json
{
  "success": true,
  "generatedText": "Let's Practice Present Simple!"
}
```

---

## ✅ **Success Criteria for Launch**

### **Functional Requirements:**
- ✅ Canvas працює з A4 format
- ✅ Zoom/Pan плавні
- ✅ Multi-page system функціональний
- ✅ 8 атомарних компонентів працюють
- ✅ AI regeneration для всіх компонентів
- ✅ Properties panel dynamic
- ✅ Layers panel працює
- ✅ Alignment tools працюють
- ✅ Copy/Paste/Duplicate працюють
- ✅ Export PDF/PNG/SVG працює
- ✅ Save/Load LocalStorage працює
- ✅ My Worksheets page функціональна
- ✅ Keyboard shortcuts працюють

### **Quality Requirements:**
- ✅ Performance: 60fps canvas rendering
- ✅ Error handling: graceful degradation
- ✅ Accessibility: ARIA labels, keyboard nav
- ✅ Responsive: desktop + tablet
- ✅ Documentation: in-app help

---

## 🚀 **Post-Launch: Phase 2 Components**

**After successful MVP launch (+2-3 weeks):**

### **Additional Components:**
1. **True/False Component** - швидкі перевірки
2. **Word Bank Component** - список слів для вправ
3. **Table/Grid Component** - структуровані дані
4. **Speech Bubble Component** - діалоги
5. **QR Code Component** - посилання на ресурси

**Each component follows the same 3-day pattern:**
- Day 1: Static UI
- Day 2: Editable
- Day 3: AI Integration

---

## 📈 **Metrics to Track**

### **Development Metrics:**
- Lines of code added
- Components completed
- Tests written
- Bugs fixed

### **User Metrics (Post-Launch):**
- Worksheets created
- AI regenerations used
- Export formats popularity
- Average worksheet complexity

---

## 💡 **Key Advantages of This Approach**

1. **Incremental Progress** - маленькі кроки, швидкі wins
2. **Visual Feedback** - бачиш результат кожного дня
3. **Testable** - можна тестити кожну фічу окремо
4. **Flexible** - можна коригувати план на ходу
5. **Motivating** - демо готові кожні 10 днів
6. **De-risking** - проблеми виявляються раніше
7. **User-Centric** - фокус на UX з першого дня

---

## 🎯 **Demo Milestones**

| Milestone | Day | Demo |
|-----------|-----|------|
| **Demo #1** | 10 | Canvas Foundation |
| **Demo #2** | 35 | All Atomic Components |
| **Demo #3** | 41 | Advanced Features |
| **Demo #4** | 48 | Export System |
| **Demo #5** | 60 | **LAUNCH** 🚀 |

---

## 📚 **Documentation Needed**

1. **User Guide** (in-app)
   - How to create worksheet
   - How to use each component
   - Keyboard shortcuts
   - Export options

2. **Developer Docs**
   - Architecture overview
   - Component API
   - JSON schema
   - Contribution guide

3. **API Docs**
   - Gemini integration
   - Request/Response formats
   - Error codes

---

## 🔮 **Future Considerations (Post-Phase 2)**

### **Phase 3: Advanced Features**
- Template marketplace
- Cloud storage (optional)
- Collaboration (share worksheets)
- Print optimization
- Batch export

### **Phase 4: Specialized Components**
- Crossword/Word Search
- Timeline Component
- Audio/Video Placeholder
- Drawing Area
- Interactive HTML export

---

## 🎉 **Final Notes**

Цей план розроблений для **інкрементального, UI-first підходу** з фокусом на:
- Швидкий візуальний прогрес
- Тестованість на кожному етапі
- Мотивацію через часті wins
- Гнучкість для змін

**Загальний термін: 60 днів (3 місяці) до Production Launch** 🚀

**Кожна фаза завершується робочим демо!** ✨
