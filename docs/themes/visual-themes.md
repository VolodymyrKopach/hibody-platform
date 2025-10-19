# Visual Themes Documentation

This document describes the visual theme system for the Component Library v1.

## Overview

The platform includes **7 distinct visual themes** that adapt the UI/UX to different age groups and learning preferences. Each theme includes typography, colors, spacing, animations, and interaction patterns.

---

## Available Themes

### 1. Cartoon 🎨
**Target Age:** 3-6 years  
**Category:** Playful  
**File:** `/src/constants/visual-themes.ts`

**Characteristics:**
- Large, rounded elements
- Vibrant, pastel colors
- Heavy use of emojis
- High animation complexity
- Bounce and spring effects
- Thick borders and shadows

**Typography:**
- Font: Nunito
- Size: 18-48px
- Weight: 400-800
- Line height: 1.6

**Colors:**
- Primary: #FF6B9D (Pink)
- Secondary: #FEC84E (Yellow)
- Accent: #5BC0EB (Blue)

**Use Cases:**
- Early childhood education
- Alphabet learning
- Basic concepts
- Color recognition

---

### 2. Playful 🎮
**Target Age:** 6-8 years  
**Category:** Playful  

**Characteristics:**
- Game-inspired elements
- Engaging interactions
- Moderate complexity
- Interactive rewards
- Progress indicators
- Achievement badges

**Typography:**
- Font: Baloo
- Size: 16-40px
- Weight: 400-700
- Line height: 1.5

**Colors:**
- Primary: #667eea (Purple)
- Secondary: #764ba2 (Deep Purple)
- Accent: #f093fb (Pink)

**Use Cases:**
- Elementary education
- Math games
- Reading activities
- Interactive quizzes

---

### 3. Academic 📚
**Target Age:** 9-15 years  
**Category:** Educational  

**Characteristics:**
- Clean, structured layout
- Focus on content
- Minimal decoration
- Clear hierarchy
- Professional appearance
- Subtle animations

**Typography:**
- Font: Inter
- Size: 14-32px
- Weight: 400-600
- Line height: 1.7

**Colors:**
- Primary: #3B82F6 (Blue)
- Secondary: #8B5CF6 (Purple)
- Accent: #10B981 (Green)

**Use Cases:**
- Middle school content
- Science lessons
- Mathematics
- Structured learning

---

### 4. Modern Minimal 🌐
**Target Age:** 13-18 years  
**Category:** Professional  

**Characteristics:**
- Sleek, minimalist design
- Dark theme support
- Typography-focused
- Whitespace emphasis
- Subtle transitions
- Professional feel

**Typography:**
- Font: Inter
- Size: 14-28px
- Weight: 400-700
- Line height: 1.75
- Letter spacing: -0.02em

**Colors:**
- Primary: #0066FF (Blue)
- Secondary: #1A1A1A (Black)
- Accent: #00FF88 (Green)

**Use Cases:**
- High school
- Advanced topics
- Coding courses
- Professional training

---

### 5. Fantasy 🧚
**Target Age:** 4-8 years  
**Category:** Playful  

**Characteristics:**
- Magical elements
- Nature and space themes
- Fairy tale aesthetics
- Rich illustrations
- Particle effects
- Enchanting animations

**Typography:**
- Font: Poppins
- Size: 16-44px
- Weight: 400-700
- Line height: 1.6

**Colors:**
- Primary: #9333EA (Purple)
- Secondary: #EC4899 (Pink)
- Accent: #F59E0B (Amber)

**Use Cases:**
- Story-based learning
- Creative activities
- Imagination exercises
- Nature studies

---

### 6. Quest & Adventure 🗺️
**Target Age:** 7-12 years  
**Category:** Playful  

**Characteristics:**
- Game-like progression
- Level systems
- Achievement unlocks
- Map-based navigation
- Quest mechanics
- Progress bars

**Typography:**
- Font: Roboto
- Size: 15-38px
- Weight: 400-700
- Line height: 1.6

**Colors:**
- Primary: #EA580C (Orange)
- Secondary: #16A34A (Green)
- Accent: #FACC15 (Yellow)

**Use Cases:**
- Series of lessons
- Gamified learning
- Adventure stories
- Exploration activities

---

### 7. Classic Classroom 📝
**Target Age:** 6-10 years  
**Category:** Educational  

**Characteristics:**
- Traditional educational design
- Notebook aesthetics
- Chalkboard elements
- Familiar patterns
- School-like feel
- Moderate animations

**Typography:**
- Font: Comic Neue
- Size: 15-36px
- Weight: 400-700
- Line height: 1.65

**Colors:**
- Primary: #1E40AF (Blue)
- Secondary: #DC2626 (Red)
- Accent: #16A34A (Green)

**Use Cases:**
- Traditional lessons
- Classroom activities
- Worksheets
- Practice exercises

---

## Theme System Architecture

### Theme Provider

**File:** `/src/components/worksheet/themes/ThemeProvider.tsx`

```typescript
import { ThemeProvider, useTheme } from '@/components/worksheet/themes/ThemeProvider';

// Wrap your app
<ThemeProvider defaultTheme="playful" ageGroup="7-8">
  <YourApp />
</ThemeProvider>

// Use in components
const { currentTheme, setTheme } = useTheme();
```

### Theme Selector

**File:** `/src/components/worksheet/themes/ThemeSelector.tsx`

```typescript
import ThemeSelector from '@/components/worksheet/themes/ThemeSelector';

<ThemeSelector 
  ageGroup="7-8"
  onThemeChange={(theme) => console.log(theme)}
/>
```

### Theme Wrapper

**File:** `/src/components/worksheet/themes/ThemeWrapper.tsx`

```typescript
import { ThemeWrapper, withTheme } from '@/components/worksheet/themes/ThemeWrapper';

// Direct usage
<ThemeWrapper applyBackground={true} applyPadding={true}>
  <YourComponent />
</ThemeWrapper>

// HOC
const ThemedComponent = withTheme(YourComponent);
```

---

## CSS Variables

Themes automatically apply CSS variables to the document root:

```css
--theme-primary
--theme-secondary
--theme-accent
--theme-background
--theme-surface
--theme-text-primary
--theme-text-secondary
--theme-font-family
--theme-font-size-sm
--theme-font-size-md
--theme-font-size-lg
--theme-font-size-xl
--theme-spacing-xs
--theme-spacing-sm
--theme-spacing-md
--theme-spacing-lg
--theme-radius-sm
--theme-radius-md
--theme-radius-lg
--theme-shadow-sm
--theme-shadow-md
--theme-shadow-lg
--theme-anim-fast
--theme-anim-normal
--theme-anim-slow
```

### Usage in Components

```tsx
<Box sx={{
  backgroundColor: 'var(--theme-primary)',
  padding: 'var(--theme-spacing-md)',
  borderRadius: 'var(--theme-radius-md)',
  fontSize: 'var(--theme-font-size-md)',
}}>
  Themed content
</Box>
```

---

## Theme Properties

Each theme includes:

### Typography
- `fontFamily`: Font stack
- `fontSize`: Small, medium, large, xlarge
- `fontWeight`: Normal, medium, bold
- `lineHeight`: Text line height
- `letterSpacing`: Optional letter spacing

### Colors
- `primary`, `secondary`, `accent`
- `background`, `surface`
- `text`: primary, secondary, disabled
- `success`, `error`, `warning`, `info`

### Spacing
- `xs`, `sm`, `md`, `lg`, `xl`, `xxl` (in pixels)

### Border Radius
- `none`, `sm`, `md`, `lg`, `xl`, `full`

### Animations
- `complexity`: none | minimal | moderate | high | very-high
- `speed`: instant | fast | normal | slow
- `enableHover`, `enableTransitions`, `enableParticles`
- `duration`: fast, normal, slow (in ms)

### Shadows
- `none`, `sm`, `md`, `lg`, `xl` (CSS shadow strings)

### Illustration Style
- `style`: realistic | cartoon | flat | abstract | minimal
- `colorfulness`: monochrome | low | medium | high | vibrant
- `complexity`: simple | moderate | detailed

### UI Elements
- `buttonStyle`: rounded | pill | sharp | soft
- `inputStyle`: outlined | filled | underlined
- `cardElevation`: flat | low | medium | high
- `iconStyle`: outlined | filled | rounded

### UX Preferences
- `focusOnContent`: boolean
- `useEmojis`: boolean
- `useIllustrations`: boolean
- `useSounds`: boolean
- `feedbackIntensity`: subtle | moderate | intense

---

## Theme Selection Logic

### Automatic Selection by Age

```typescript
const ageToThemeMap = {
  '2-3': 'cartoon',
  '4-6': 'cartoon',
  '7-8': 'playful',
  '9-10': 'academic',
  '11-12': 'academic',
  '13-15': 'academic',
  '16-18': 'modern-minimal',
};
```

### Manual Selection

Users can override automatic theme selection:

```typescript
setTheme('fantasy'); // Switch to fantasy theme
```

---

## Best Practices

1. **Age Appropriateness:** Choose themes that match cognitive development
2. **Content Type:** Use academic themes for structured content, playful for games
3. **Consistency:** Stick to one theme per lesson/session
4. **Accessibility:** All themes meet WCAG 2.1 AA standards
5. **Performance:** Themes with fewer animations perform better on older devices

---

## Future Enhancements

- User-customizable themes
- Dark mode variants for all themes
- Seasonal theme variations
- Cultural adaptations
- High contrast modes

---

For component documentation, see [interactive-components.md](../components/interactive-components.md)

