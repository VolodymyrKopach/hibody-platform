# Age Component Templates

Modular structure of HTML templates for different age groups of children.

## 📁 File Structure

```
templates/
├── index.ts          # Main composition file
├── age-2-3.ts        # Template for 2-3 years old
├── age-4-6.ts        # Template for 4-6 years old  
├── age-7-8.ts        # Template for 7-8 years old
├── age-9-10.ts       # Template for 9-10 years old
└── README.md         # This file
```

## 🎯 Age Groups and Their Features

### 2-3 Years Old 🎈
- **File**: `age-2-3.ts`
- **Features**: Large buttons, bright colors, animations, sound effects
- **Sizes**: Buttons 350px, font 72px
- **Colors**: `#FFE66D`, `#4ECDC4`, `#FF6B6B`

### 4-6 Years Old 🎓
- **File**: `age-4-6.ts`
- **Features**: Interactive games, characters, simple tasks, music
- **Sizes**: Buttons 320px, font 64px
- **Colors**: `#87CEEB`, `#98FB98`, `#FFE4B5`, `#F0E68C`

### 7-8 Years Old 📚
- **File**: `age-7-8.ts`
- **Features**: Educational games, tests, progress bars, achievements
- **Sizes**: Buttons 200px, font 36px
- **Colors**: `#667eea`, `#764ba2`, `#f093fb`

### 9-10 Years Old 🎯
- **File**: `age-9-10.ts`
- **Features**: Complex interfaces, detailed data, analytics
- **Sizes**: Buttons 150px, font 32px
- **Colors**: `#1F4E79`, `#2C5F2D`, `#97BC62`

## 🔧 Usage

### Basic Usage

```typescript
import { 
  AGE_COMPONENT_TEMPLATES,
  getTemplateByAge,
  getTemplateConfig 
} from '@/constants/templates';

// Get template for age group
const template = getTemplateByAge('4-6');

// Get configuration
const config = getTemplateConfig('4-6');
console.log(config.buttonSize); // 320
```

### Direct Template Access

```typescript
import { AGE_4_6_TEMPLATE, AGE_4_6_CONFIG } from '@/constants/templates/age-4-6';

// Using specific template
const template = AGE_4_6_TEMPLATE;
const config = AGE_4_6_CONFIG;
```

### Utility Functions

```typescript
import { 
  getAvailableAgeGroups,
  hasTemplate,
  getTemplateDescription 
} from '@/constants/templates';

// Get all available age groups
const ageGroups = getAvailableAgeGroups(); // ['2-3', '4-6', '7-8', '9-10']

// Check if template exists
if (hasTemplate('4-6')) {
  // Template exists
}

// Get template description
const description = getTemplateDescription('4-6');
```

## ✏️ Editing Templates

### Adding New Template

1. Create new file `age-X-Y.ts`
2. Export constants `AGE_X_Y_TEMPLATE`, `AGE_X_Y_DESCRIPTION`, `AGE_X_Y_CONFIG`
3. Add import and export in `index.ts`
4. Update types in `@/types/generation.ts`

### Editing Existing Template

1. Open corresponding file `age-X-Y.ts`
2. Modify HTML in `AGE_X_Y_TEMPLATE` constant
3. Update configuration in `AGE_X_Y_CONFIG` if needed

## 🏗️ Architecture

### SOLID Principles

- **SRP**: Each file is responsible for one age template
- **OCP**: Easy to add new templates without changing existing ones
- **LSP**: All templates have the same structure
- **ISP**: Separated interfaces for templates, descriptions and configurations
- **DIP**: Dependency on abstractions through index file

### Composition

The `index.ts` file combines all individual templates into a unified structure, providing:

- Centralized access
- Backward compatibility
- Utility functions
- Type safety

## 🔄 Migration

The old `ageComponentTemplates.ts` file has been removed. All imports now go through the new modular structure.

### Updated Imports

```typescript
// New way (through constants)
import { AGE_COMPONENT_TEMPLATES } from '@/constants';
// or directly from templates
import { AGE_COMPONENT_TEMPLATES } from '@/constants/templates';
// or utility functions
import { getTemplateByAge } from '@/constants/templates';
```

## 🧪 Testing

For testing templates use:

```typescript
import { ageComponentTemplatesService } from '@/services/templates/AgeComponentTemplatesService';

// Testing template loading
const template = await ageComponentTemplatesService.getTemplateForAge('4-6');
expect(template).toContain('<!DOCTYPE html>');
```

## 📝 Notes

- All templates contain full HTML document
- Include CSS styles and JavaScript functionality
- Adapted for different screen sizes (responsive)
- Have built-in sound effects and animations
- Support accessibility (ARIA labels, keyboard navigation)
