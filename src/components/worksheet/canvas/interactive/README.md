# Age-Specific Drag & Drop Components

## 🎯 Overview

This system provides **individual drag and drop components** with unique mechanics and visual designs. Each component is standalone and can be used on any canvas regardless of age group - no complex validation or warnings needed.

## 🏗️ Architecture

### Component Groups

```
interactive/
├── shared/                 # Common base components and utilities
│   ├── BaseDragDrop.tsx   # Base component with age-specific settings
│   ├── SharedTypes.ts     # Common interfaces and types
│   └── CommonServices.ts  # Shared services
├── toddlers/              # 3-5 years - Extra large, magnetic, animal helpers
│   ├── MagneticPlayground.tsx ✅ IMPLEMENTED
│   ├── SimpleMatching.tsx     🔄 PLANNED
│   └── ColorSorter.tsx        🔄 PLANNED
├── preschool/             # 6-7 years - Story-driven, characters, rewards
│   ├── StoryDragAdventure.tsx 🔄 PLANNED
│   ├── AnimalHomes.tsx        🔄 PLANNED
│   └── ShapePuzzle.tsx        🔄 PLANNED
├── elementary/            # 8-9 years - Educational, explanations, progress
│   ├── EducationalSorter.tsx  🔄 PLANNED
│   ├── MathMatcher.tsx        🔄 PLANNED
│   └── ScienceClassifier.tsx  🔄 PLANNED
├── middle/                # 10-13 years - Strategic, scoring, complex rules
│   ├── StrategicMatcher.tsx   🔄 PLANNED
│   ├── LogicPuzzle.tsx        🔄 PLANNED
│   └── DataOrganizer.tsx      🔄 PLANNED
├── teens/                 # 14-18 years - Professional, keyboard shortcuts
│   ├── ProfessionalWorkflow.tsx 🔄 PLANNED
│   ├── ResearchSorter.tsx       🔄 PLANNED
│   └── AnalysisTools.tsx        🔄 PLANNED
└── AgeSpecificRenderer.tsx # Main renderer for all age groups
```

## 🎨 Age-Specific Design Principles

### 🐣 Toddlers (3-5 years)
- **Size**: Extra large elements (120px+)
- **Colors**: Bright, high contrast (#FF6B9D, #FFD700)
- **Interaction**: Magnetic attraction, auto-completion
- **Feedback**: Maximum celebration, animal helpers
- **Animations**: Slow, bouncy (600ms+)

### 🎨 Preschoolers (6-7 years)
- **Size**: Large elements (100px)
- **Colors**: Playful, rainbow colors
- **Interaction**: Story-driven, character guides
- **Feedback**: Reward systems, badges
- **Animations**: Medium speed with particles (500ms)

### 📚 Elementary (8-9 years)
- **Size**: Medium elements (80px)
- **Colors**: Educational palette (blue, green, orange)
- **Interaction**: Explanations, progress tracking
- **Feedback**: Learning-focused, skill building
- **Animations**: Standard speed (300ms)

### 🎯 Middle School (10-13 years)
- **Size**: Standard elements (70px)
- **Colors**: Professional colors (Material Design)
- **Interaction**: Strategic thinking, scoring
- **Feedback**: Performance metrics, challenges
- **Animations**: Fast, efficient (200ms)

### 🎓 Teens (14-18 years)
- **Size**: Compact elements (60px)
- **Colors**: Minimal, monochrome
- **Interaction**: Professional workflows, shortcuts
- **Feedback**: Real-world context, analytics
- **Animations**: Subtle, minimal (150ms)

## 🚀 Usage

### Adding a New Age-Specific Component

1. **Choose the appropriate age group directory**
2. **Create the component following the pattern:**

```tsx
// Example: toddlers/NewComponent.tsx
'use client';

import React from 'react';
import { BaseDragDrop } from '../shared/BaseDragDrop';
import { ToddlerComponents } from '@/types/age-group-data';

interface NewComponentProps {
  data: ToddlerComponents.NewComponentData;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
  onComplete?: (results: any) => void;
}

const NewComponent: React.FC<NewComponentProps> = ({
  data,
  isSelected,
  onEdit,
  onFocus,
  onComplete,
}) => {
  return (
    <BaseDragDrop
      data={data}
      ageGroup="3-5"
      isSelected={isSelected}
      onEdit={onEdit}
      onFocus={onFocus}
      onComplete={onComplete}
    >
      {/* Your component implementation */}
    </BaseDragDrop>
  );
};

export default NewComponent;
```

3. **Add to the age group index file:**

```tsx
// toddlers/index.ts
export { default as NewComponent } from './NewComponent';

export const TODDLER_COMPONENTS = {
  // ... existing components
  'new-component': {
    component: () => import('./NewComponent'),
    name: '🆕 New Component',
    // ... metadata
  },
};
```

4. **Register in ComponentSelectorService:**

```tsx
// Add to COMPONENT_DEFINITIONS in ComponentSelectorService.ts
'new-component': {
  type: 'new-component',
  name: '🆕 New Component',
  description: 'Description of the new component',
  icon: '🆕',
  ageGroup: '3-5',
  difficulty: 'easy',
  estimatedTime: 5,
  tags: ['matching', 'new-feature'],
},
```

5. **Add to AgeSpecificRenderer:**

```tsx
// Add case in AgeSpecificRenderer.tsx
case 'new-component':
  return (
    <NewComponent
      data={{
        // Map element.properties to component data
      }}
      {...commonProps}
    />
  );
```

### Using in Canvas

Components are automatically integrated with the canvas system:

```tsx
// Components appear in LeftSidebar under "Age-Specific Components"
// They render through AgeSpecificRenderer
// Default properties are generated automatically
```

## 📊 Data Structure

### Component Data Format

```typescript
interface ComponentData {
  id: string;
  type: ComponentType;
  title: string;
  description: string;
  items: DragItem[];
  targets?: DropTarget[];
  settings?: Record<string, any>;
  
  // Age-specific configuration
  ageConfig: AgeSpecificConfig;
}
```

### Example: Toddler Component Data

```json
{
  "id": "animal-homes-toddler",
  "type": "magnetic-playground",
  "title": "🏠 Where Animals Live",
  "description": "Help cute animals find their homes!",
  "magneticStrength": 150,
  "animalHelper": "bunny",
  "autoComplete": true,
  "celebrationLevel": "maximum",
  "items": [
    {
      "id": "fish",
      "label": "Fish",
      "imageUrl": "/images/toddler/fish-big.png",
      "correctTarget": "water",
      "size": "extra-large",
      "animations": ["swim", "bubble"]
    }
  ],
  "targets": [
    {
      "id": "water",
      "label": "Water",
      "imageUrl": "/images/toddler/water-home.png",
      "backgroundColor": "#87CEEB",
      "size": "extra-large",
      "magneticZone": 200
    }
  ]
}
```

## 🎮 Interactive Features

### Age-Specific Interactions

- **Toddlers**: Magnetic attraction, animal helpers, auto-completion
- **Preschoolers**: Story progression, character dialogues, reward collection
- **Elementary**: Educational explanations, progress tracking, skill assessment
- **Middle School**: Strategic planning, scoring systems, challenge modes
- **Teens**: Keyboard shortcuts, export options, professional workflows

### Adaptive Difficulty

Components automatically adjust:
- **Snap distance**: Larger for younger ages
- **Animation speed**: Slower for younger ages
- **Feedback intensity**: More celebration for younger ages
- **Hint systems**: More guidance for younger ages

## 🔧 Services

### ComponentSelectorService

```typescript
// Get components for age group
const components = ComponentSelectorService.getComponentsForAge('3-5');

// Generate template data
const templateData = ComponentSelectorService.generateTemplateData('magnetic-playground', '3-5');

// Validate component data
const validation = ComponentSelectorService.validateComponentData('magnetic-playground', data);
```

### Analytics Integration

```typescript
// Automatic tracking of:
- Component usage by age group
- Completion rates and times
- Common interaction patterns
- Error rates and improvement areas
```

## 🎯 Benefits

### For Teachers
- **Simplified Selection**: Only see relevant components for target age
- **Age-Appropriate Content**: Automatic optimization for cognitive level
- **Easy Customization**: Template-based component creation

### For Students
- **Optimal UX**: Interaction patterns match motor skills
- **Engaging Design**: Age-appropriate visual themes
- **Progressive Difficulty**: Natural learning progression

### For Developers
- **Modular Architecture**: Easy to add new components
- **Shared Infrastructure**: Common services and utilities
- **Type Safety**: Full TypeScript support
- **Scalable Design**: Easy to extend to new age groups

## 🚀 Future Enhancements

- **AI-Powered Adaptation**: Dynamic difficulty adjustment based on performance
- **Multi-Language Support**: Localized content for different regions
- **Accessibility Features**: Enhanced support for special needs
- **Real-Time Collaboration**: Multi-student interactive components
- **Advanced Analytics**: Detailed learning progress tracking

## 📝 Contributing

1. Follow the established patterns for your age group
2. Ensure proper TypeScript typing
3. Include comprehensive prop interfaces
4. Add component to registration systems
5. Test across different age groups
6. Update documentation

## 🔍 Testing

```bash
# Test age-specific components
npm run test:age-components

# Test component integration
npm run test:canvas-integration

# Test component selector
npm run test:component-selector
```

## 📚 Examples

See `DemoAgeComponents.tsx` for a comprehensive demonstration of the age-specific component system in action.
