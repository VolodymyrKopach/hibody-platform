# MVP для Worksheet Generator: Мінімально Життєздатний Продукт

## 🎯 **MVP Фокус: Доведення Core Value**

**Головна цінність:** Викладач за 5 хвилин створює професійний worksheet замість 2 годин ручної роботи.

**Target User:** Репетитори англійської мови (найбільш мотивована аудиторія).

## 🏗️ **MVP Архітектура (Спрощена)**

### **1. Template Wizard (Мінімальний)**
```
Один екран з базовими параметрами:
- Subject: тільки "English" 
- Age Group: 3 опції (Kids 6-12, Teens 13-17, Adults 18+)
- Level: 3 опції (Beginner, Intermediate, Advanced)  
- Focus: 4 опції (Grammar, Vocabulary, Reading, Speaking)
- Worksheet Type: 3 типи (Practice Sheet, Exercise Set, Quiz)
```

### **2. AI Generation (Базова)**
```
Фіксована структура worksheet:
- Title (згенерований AI)
- Instructions (1-2 речення)
- Main Exercise (1 тип вправи)
- Bonus Exercise (опціонально)
- Answer Key (внизу сторінки)
```

### **3. Visual Editor (Спрощений)**
```
Тільки найнеобхідніше:
- Click-to-edit text
- Replace image (з бібліотеки)
- Change colors (3-4 готові палітри)
- Move elements (basic drag&drop)
```

## 📋 **MVP Feature Set**

### **Core Features (Must Have):**

**Template Generation:**
- ✅ 5 готових worksheet темплейтів
- ✅ AI генерація тексту (OpenAI API)
- ✅ Базова бібліотека зображень (50-100 картинок)
- ✅ Автоматичне компонування
- ✅ **8 Атомарних Компонентів** (замість простих текстових блоків)

**Atomic Components (Must Have):**
- ✅ **Title Block** - заголовки з автостилізацією
- ✅ **Body Text** - форматований основний текст
- ✅ **Instructions Box** - інструкції з іконками та кольоровим дизайном
- ✅ **Fill-in-the-Blank** - вправи з пропусками та підказками
- ✅ **Multiple Choice** - питання з варіантами відповідей
- ✅ **Warning Box** - попередження з жовтим акцентом
- ✅ **Tip Box** - поради з синім дизайном
- ✅ **Image Placeholder** - зображення з підписами

**Basic Editing:**
- ✅ Inline editing атомарних компонентів
- ✅ Component replacement (dropdown з варіантами)
- ✅ Color theme switching (3 теми)
- ✅ Component size adjustment
- ✅ AI regeneration для кожного компонента

**Export:**
- ✅ PDF download
- ✅ PNG download (high quality)

### **Nice to Have (Phase 2):**
- ❌ Drag & drop editing
- ❌ Custom image upload  
- ❌ Advanced layout tools
- ❌ Multiple pages
- ❌ Collaboration features

## 🎨 **MVP User Flow**

### **Step 1: Quick Setup (30 секунд)**
```
Landing Page → "Create Worksheet" Button
↓
Simple Form:
- Age: [Kids] [Teens] [Adults] 
- Level: [Beginner] [Intermediate] [Advanced]
- Focus: [Grammar] [Vocabulary] [Reading] [Speaking]
- Topic: Free text input (e.g., "Present Simple Tense")
↓
[Generate Worksheet] Button
```

### **Step 2: AI Generation (30 секунд)**
```
Loading screen з прогресом:
"🤖 Generating content..."
"🎨 Creating layout..."  
"✨ Almost ready..."
↓
Готовий worksheet відображається в простому редакторі
```

### **Step 3: Quick Edit (2-3 хвилини)**
```
Worksheet Preview з можливістю:
- Клікнути на текст → inline editing
- Клікнути на картинку → dropdown з альтернативами
- Sidebar з опціями:
  * Color Theme: [Blue] [Green] [Orange]
  * Font Size: [Small] [Medium] [Large]
  * Layout: [Compact] [Spacious]
```

### **Step 4: Download (10 секунд)**
```
Top bar з кнопками:
[Download PDF] [Download PNG] [Save Draft]
```

## 🧩 **MVP Technical Stack**

### **Frontend (Simple & Fast):**
```
- Next.js 14 (existing)
- Tailwind CSS (existing)
- React Hook Form (forms)
- html2canvas (PNG export)
- jsPDF (PDF export)
- Простий state management (useState)
```

### **Backend (Minimal):**
```
- Next.js API routes (existing)
- OpenAI API (content generation)
- Supabase (existing - user auth, save drafts)
- Cloudinary/S3 (image storage)
```

### **AI Integration:**
```
- OpenAI GPT-4 (text generation)
- Готова бібліотека картинок (без AI generation)
- Фіксовані промпти для кожного типу worksheet
```

## 📊 **MVP Success Metrics**

### **Primary KPIs:**
- **Time to first worksheet:** < 5 хвилин
- **Completion rate:** > 70% (від початку до download)
- **User satisfaction:** > 4.0/5.0
- **Repeat usage:** > 30% через тиждень

### **Secondary KPIs:**
- **Worksheet quality:** Manual review score > 8/10
- **Export rate:** > 80% worksheets експортуються
- **Error rate:** < 5% generation failures

## 🚀 **MVP Development Plan**

### **Week 1-2: Foundation**
- ✅ Template wizard UI
- ✅ Basic worksheet templates (HTML/CSS)
- ✅ OpenAI integration для text generation

### **Week 3-4: Core Generation**
- ✅ AI prompt engineering
- ✅ Template population logic
- ✅ Basic image library integration

### **Week 5-6: Simple Editor**
- ✅ Inline text editing
- ✅ Image replacement
- ✅ Theme switching
- ✅ Preview functionality

### **Week 7-8: Export & Polish**
- ✅ PDF/PNG export
- ✅ User testing & bug fixes
- ✅ Performance optimization
- ✅ Basic analytics

## 💡 **MVP Validation Strategy**

### **Pre-Launch:**
- **5 репетиторів** тестують прототип
- **Feedback sessions** після кожного тесту
- **Iterate** на основі відгуків

### **Launch:**
- **Product Hunt** launch
- **Facebook groups** для репетиторів
- **Direct outreach** до 50 репетиторів

### **Post-Launch:**
- **Weekly user interviews**
- **Usage analytics** аналіз
- **Feature request** збір

## 🎯 **MVP Success Criteria**

### **Technical:**
- ✅ 95% uptime
- ✅ < 3 секунди generation time
- ✅ Mobile responsive
- ✅ Cross-browser compatibility

### **Business:**
- ✅ 100 worksheets створено за перший місяць
- ✅ 20 активних користувачів
- ✅ 4.0+ rating від тестерів
- ✅ Clear path to monetization

## 🔄 **Post-MVP Roadmap**

### **Version 1.1 - Phase 2 Components (Month 2-3):**
- ✅ True/False Component
- ✅ Word Bank Component
- ✅ Table/Grid Component
- ✅ Speech Bubble Component
- ✅ QR Code Component
- Custom image upload
- Save/load drafts

### **Version 1.2 - Phase 3 Features (Month 4-5):**
- Matching Component
- Timeline Component
- Progress Bar Component
- Audio/Video Placeholder
- Rubric Component
- Collaboration features

### **Version 2.0 - Phase 4 Specialized (Month 6-8):**
- Ordering/Sequencing Component
- Crossword/Word Search
- Diagram/Chart Component
- Drawing Area Component
- Reflection Box Component
- Template marketplace
- Multiple subjects

## 📝 **MVP Worksheet Templates**

### **Template 1: Grammar Practice Sheet**
```
Structure:
- Title: "[Grammar Topic] Practice"
- Instructions: "Complete the exercises below"
- Exercise 1: Fill in the blanks (10 questions)
- Exercise 2: Multiple choice (5 questions)
- Bonus: Create your own sentences (3 prompts)
- Answer key at bottom
```

### **Template 2: Vocabulary Builder**
```
Structure:
- Title: "[Topic] Vocabulary"
- Word bank with images
- Exercise 1: Match words to pictures
- Exercise 2: Complete sentences
- Exercise 3: Word association
- Mini dictionary section
```

### **Template 3: Reading Comprehension**
```
Structure:
- Title: "[Topic] Reading"
- Short text (100-200 words)
- Exercise 1: True/False questions
- Exercise 2: Answer questions
- Exercise 3: Vocabulary from text
- Discussion prompts
```

### **Template 4: Speaking Activity Sheet**
```
Structure:
- Title: "[Topic] Speaking Practice"
- Warm-up questions
- Main activity (role-play/discussion)
- Useful phrases box
- Reflection questions
- Homework extension
```

### **Template 5: Mixed Skills Quiz**
```
Structure:
- Title: "[Topic] Quiz"
- Section A: Grammar (5 questions)
- Section B: Vocabulary (5 questions)
- Section C: Reading (short text + 3 questions)
- Section D: Writing (1 prompt)
- Scoring guide
```

## 🎨 **MVP Design System**

### **Color Themes:**
- **Theme 1 (Professional Blue):** #2563EB, #EFF6FF, #1E40AF
- **Theme 2 (Friendly Green):** #059669, #ECFDF5, #047857  
- **Theme 3 (Energetic Orange):** #EA580C, #FFF7ED, #C2410C

### **Typography:**
- **Headers:** Inter Bold, 24px/20px/16px
- **Body:** Inter Regular, 14px/12px/10px
- **Instructions:** Inter Medium, 12px/10px/8px

### **Layout Grid:**
- **A4 format:** 210mm x 297mm
- **Margins:** 20mm all sides
- **Content area:** 170mm x 257mm
- **Grid:** 12 columns with 10mm gutters

## 🔧 **MVP Technical Implementation**

### **File Structure:**
```
src/
├── app/
│   └── worksheet-generator/
│       ├── page.tsx (main wizard)
│       ├── editor/
│       │   └── page.tsx (editing interface)
│       └── preview/
│           └── page.tsx (final preview)
├── components/
│   └── worksheet/
│       ├── TemplateWizard.tsx
│       ├── WorksheetEditor.tsx
│       ├── WorksheetPreview.tsx
│       ├── ExportButtons.tsx
│       └── atomic/
│           ├── TitleBlock.tsx
│           ├── BodyText.tsx
│           ├── InstructionsBox.tsx
│           ├── FillInTheBlank.tsx
│           ├── MultipleChoice.tsx
│           ├── WarningBox.tsx
│           ├── TipBox.tsx
│           └── ImagePlaceholder.tsx
├── services/
│   ├── worksheetGenerator.ts
│   ├── openaiService.ts
│   ├── exportService.ts
│   └── atomicComponents.ts
└── types/
    ├── worksheet.ts
    └── components.ts
```

### **Key APIs:**
```
POST /api/worksheet/generate
- Input: wizard parameters
- Output: generated worksheet with atomic components

POST /api/worksheet/export
- Input: worksheet data + format
- Output: file download

GET /api/images/library
- Output: available images by category

POST /api/components/generate
- Input: component type + parameters
- Output: generated atomic component

PUT /api/components/regenerate
- Input: component id + new parameters
- Output: updated component content
```

**Ключ до успіху MVP:** Зробити одну річ дуже добре - швидко генерувати якісні worksheets для англійської мови. Все інше - потім.
