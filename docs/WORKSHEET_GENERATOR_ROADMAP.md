# Worksheet Generator Development Roadmap

## Vision
Create a flexible, AI-powered worksheet generator that enables teachers to create professional educational materials as easily as using Google Docs, but with the quality of Teachers Pay Teachers content.

---

## Current State (MVP v0.1)

### ✅ Implemented Components

**Text Components:**
- `TitleBlock` - Headers with 3 levels (main/section/exercise)
- `BodyText` - Paragraph text with variants
- Full inline editing (double-click)
- Customizable titles and styling

**Info Boxes:**
- `InstructionsBox` - Step-by-step instructions with 5 types
- `TipBox` - Helpful tips with 4 types (study/memory/practice/cultural)
- `WarningBox` - Warnings/alerts with 4 types (grammar/time/difficulty/mistake)
- All with inline editing and customizable titles

**Exercises (Basic - No Editing Yet):**
- `FillInBlank` - Fill-in-the-blank exercises with word bank
- `MultipleChoice` - Multiple choice questions
- `ImagePlaceholder` - Image placeholder (no upload yet)

**Layout System:**
- ✅ **Linear Layout** - Vertical stack like PDF/Google Docs
- ✅ Full-width elements with automatic spacing
- ✅ Professional document appearance
- ❌ No free positioning (removed for simplicity)
- ❌ No drag reordering yet

**Editor Features:**
- Properties Panel (right sidebar) for all text components
- Component Library (left sidebar) with drag-and-drop
- Selection and hover states
- Copy/Paste/Duplicate
- Delete with keyboard shortcuts
- Undo/Redo (basic)

---

## Gap Analysis: What Teachers Need

### 🔴 **Priority 1 - Critical for MVP (Must Have)**

#### 1. **Editable Exercises** ⚠️ HIGH PRIORITY
**Current:** Exercises display only, no editing
**Need:** Full CRUD for exercise content

- [ ] **FillInBlank editing**
  - Add/remove items
  - Edit sentences and hints
  - Manage word bank (add/remove/reorder)
  - Inline text editing for each item

- [ ] **MultipleChoice editing**
  - Add/remove questions
  - Edit question text
  - Add/remove/reorder options (a, b, c, d)
  - Mark correct answer (for answer key)

- [ ] **TrueFalse** (NEW)
  - List of statements
  - True/False selection
  - Most popular exercise type in language learning

- [ ] **ShortAnswer/WritingLines** (NEW)
  - Numbered questions
  - Lined space for writing answers
  - Configurable line count/spacing

- [ ] **Matching** (NEW)
  - Two columns (left-right)
  - Connect items between columns
  - Very common for vocabulary

#### 2. **Image Support** ⚠️ HIGH PRIORITY
**Current:** Placeholder only
**Need:** Real image functionality

- [ ] Image URL input
- [ ] Image upload (local files)
- [ ] Resize image
- [ ] Caption editing
- [ ] Alignment options

#### 3. **Structural Elements** ⚠️ HIGH PRIORITY
**Current:** Only text blocks
**Need:** Document structure

- [ ] **Table Component**
  - Editable rows/columns
  - Add/remove rows/columns
  - Cell content editing
  - Essential for vocabulary, verb conjugation tables

- [ ] **BulletList / NumberedList**
  - Add/remove items
  - Nested lists
  - Basic document formatting

- [ ] **Divider/Line**
  - Visual separator
  - Different styles (solid/dashed/dotted)

---

### 🟡 **Priority 2 - Important for Professional Quality**

#### 4. **Advanced Layout**

- [ ] **ColumnLayout**
  - 2-3 column layouts
  - Very common in worksheets
  - Each column contains elements

- [ ] **Container/Group**
  - Group multiple elements
  - Background color/border
  - Used for sections

- [ ] **Page Breaks**
  - Control multi-page worksheets
  - Insert manual page break

#### 5. **Writing Elements**

- [ ] **WritingLines Component**
  - Blank lines for writing
  - Configurable line height/count
  - Common in writing exercises

- [ ] **TextBox**
  - Bordered box for answers
  - Resizable
  - Used for short answers

- [ ] **Checkbox/RadioGroup**
  - For checklists
  - For selection exercises

#### 6. **Templates System**

- [ ] Pre-built worksheet templates
  - Vocabulary worksheet
  - Grammar practice
  - Reading comprehension
  - Writing prompt
  - Test/Quiz format

- [ ] Template categories
- [ ] Quick start from template

---

### 🟢 **Priority 3 - Nice to Have**

#### 7. **Interactive Games** (Future)

- [ ] WordSearch generator
- [ ] Crossword generator
- [ ] Ordering/Sequencing exercises
- [ ] Drag-and-drop matching (interactive PDF)

#### 8. **Design & Styling**

- [ ] Page backgrounds/patterns
- [ ] Decorative borders/frames
- [ ] Badges/stickers for decoration
- [ ] Custom fonts
- [ ] Color schemes/themes

#### 9. **Advanced Features**

- [ ] Answer key generation (separate page)
- [ ] Multi-page support with navigation
- [ ] Version history
- [ ] Collaboration (multiple teachers)
- [ ] Asset library (images, icons)

---

## Development Phases

### **Phase 1: Complete Basic Exercises** (1-2 weeks)
**Goal:** Teachers can create functional worksheets with all exercise types

**Tasks:**
1. ✏️ Implement FillInBlank editing
   - Item management (add/remove)
   - Text editing for sentences
   - Word bank management
   - Properties panel integration

2. ✏️ Implement MultipleChoice editing
   - Question management (add/remove)
   - Option management (add/remove/reorder)
   - Text editing for questions/options
   - Properties panel integration

3. 🖼️ Enhance ImagePlaceholder
   - URL input field
   - Image upload functionality
   - Caption editing
   - Size controls

4. 🆕 Add TrueFalse component
   - List of statements
   - True/False selector
   - Add/remove statements
   - Inline editing

5. 🆕 Add ShortAnswer/WritingLines
   - Question text field
   - Configurable line count
   - Line spacing options

**Success Criteria:**
- ✅ All exercise types fully editable
- ✅ Can create grammar worksheet
- ✅ Can create vocabulary worksheet
- ✅ Can add images from URL

---

### **Phase 2: Structure & Professional Layout** (1 week)
**Goal:** Worksheets look professional like TpT products

**Tasks:**
1. 📊 Implement Table component
   - Grid layout
   - Add/remove rows/columns
   - Cell content editing
   - Border styling

2. 📝 Implement List components
   - BulletList
   - NumberedList
   - Add/remove items
   - Nested support

3. ➖ Add Divider component
   - Line styles
   - Thickness control
   - Color options

4. 📦 Implement Container component
   - Group elements
   - Background color
   - Border options
   - Padding control

**Success Criteria:**
- ✅ Can create vocabulary table
- ✅ Can create structured worksheets
- ✅ Professional document appearance

---

### **Phase 3: Advanced Features** (2 weeks)
**Goal:** Competitive with Teachers Pay Teachers

**Tasks:**
1. 📐 ColumnLayout
   - 2-3 column support
   - Responsive layout
   - Column content management

2. 🔤 Matching exercise
   - Left-right columns
   - Item management
   - Connecting lines (visual)

3. 🎯 Templates system
   - 5-10 starter templates
   - Template preview
   - Quick customization

4. 🎨 Enhanced styling
   - Custom colors
   - Border options
   - Background patterns

5. 📄 Multi-page support
   - Page breaks
   - Page navigation
   - Header/footer

**Success Criteria:**
- ✅ Teachers can start from templates
- ✅ Create multi-page worksheets
- ✅ Professional design options
- ✅ Competitive with TpT quality

---

## Comparison with Teachers Pay Teachers

| Feature | TpT | Current | Phase 1 | Phase 2 | Phase 3 |
|---------|-----|---------|---------|---------|---------|
| Multiple exercise types | ✅ | ⚠️ (2/10) | ✅ (6/10) | ✅ (8/10) | ✅ (10/10) |
| Exercise editing | ✅ | ❌ | ✅ | ✅ | ✅ |
| Tables | ✅ | ❌ | ❌ | ✅ | ✅ |
| Lists | ✅ | ❌ | ❌ | ✅ | ✅ |
| Images | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| Columns | ✅ | ❌ | ❌ | ❌ | ✅ |
| Templates | ✅ | ❌ | ❌ | ❌ | ✅ |
| Professional design | ✅ | ⚠️ | ⚠️ | ✅ | ✅ |
| AI Generation | ❌ | ⚠️ | ⚠️ | ✅ | ✅ |
| **Total Score** | 100% | 20% | 60% | 80% | 100% |

**Our Advantage:** AI-powered content generation + Flexible editing

---

## Technical Architecture

### Current Structure
```
Linear Layout (Vertical Stack)
├── Full width elements
├── Automatic spacing (24px gap)
├── Page padding (32px)
└── No free positioning
```

### Component Architecture
```
Atomic Components (src/components/worksheet/canvas/atomic/)
├── Text: TitleBlock, BodyText
├── Info: InstructionsBox, TipBox, WarningBox
├── Exercises: FillInBlank, MultipleChoice
└── Media: ImagePlaceholder

Properties Panel (RightSidebar.tsx)
├── Component-specific properties
├── Text editing
├── Type/style selection
└── Actions (duplicate/delete)

Component Library (LeftSidebar.tsx)
├── Drag & drop components
├── Search/filter
└── AI Assistant (future)
```

### Next Architecture Needs

**For Phase 1:**
- Complex state management for exercises (items arrays)
- Modal dialogs for adding items
- Rich text editing for exercise content

**For Phase 2:**
- Table cell editor
- Nested component support (lists, containers)
- More sophisticated layout engine

**For Phase 3:**
- Template system
- Multi-page document structure
- Asset management (images, fonts)

---

## Success Metrics

### MVP (Phase 1 Complete):
- ✅ Teachers can create a complete worksheet in 10 minutes
- ✅ 6+ exercise types available
- ✅ All components fully editable
- ✅ Can export to PDF

### Professional (Phase 2 Complete):
- ✅ Worksheets look as good as TpT products
- ✅ Structured layouts (tables, lists)
- ✅ Teacher feedback: "Would pay for this"

### Competitive (Phase 3 Complete):
- ✅ Templates save 50% creation time
- ✅ 10+ exercise types
- ✅ Multi-page worksheets
- ✅ Teachers prefer our tool over TpT
- ✅ AI generation adds unique value

---

## Next Steps

### Immediate (This Week):
1. ✅ Complete Linear Layout implementation
2. ⏳ **START:** FillInBlank editing component
3. ⏳ Document current components

### This Sprint:
- Complete all Phase 1 exercises
- Add image URL support
- Create first template

### This Month:
- Finish Phase 1
- Start Phase 2 (tables, lists)
- User testing with 3-5 teachers

---

## Notes

### Design Decisions

**Why Linear Layout?**
- Simpler for MVP
- Matches teacher mental model (like Word/Docs)
- Easier to generate with AI
- Professional appearance by default
- Can add reordering later

**Why Phase This Way?**
- Exercises are the core value proposition
- Structure (tables, lists) needed for professional look
- Templates/styling can come after core functionality works

### Questions to Resolve

- [ ] How to handle answer keys? (separate page? toggle?)
- [ ] Export format? (PDF only? PNG? Interactive HTML?)
- [ ] Collaboration model? (single author? shared?)
- [ ] Asset storage? (where to store uploaded images?)
- [ ] Pricing model? (affects what features to prioritize)

---

**Last Updated:** 2025-10-01
**Version:** 0.1 MVP
**Next Review:** After Phase 1 completion

