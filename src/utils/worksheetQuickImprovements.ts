import { QuickImprovement } from '@/types/worksheet-generation';

/**
 * Generate dynamic quick improvements based on target type and component
 */
export function generateQuickImprovements(
  target: 'component' | 'page',
  componentType?: string
): QuickImprovement[] {
  
  // Quick improvements for entire page
  if (target === 'page') {
    return [
      {
        id: 'add-component',
        label: 'Додати компонент',
        icon: 'Plus',
        description: 'Додати новий компонент на сторінку',
        instruction: 'Додай новий компонент на цю сторінку, який доповнить існуючий контент'
      },
      {
        id: 'reorganize',
        label: 'Переорганізувати',
        icon: 'LayoutGrid',
        description: 'Покращити макет сторінки',
        instruction: 'Переорганізуй макет сторінки для кращого вигляду та зручності використання'
      },
      {
        id: 'simplify',
        label: 'Спростити',
        icon: 'Minimize2',
        description: 'Спростити сторінку',
        instruction: 'Зроби цю сторінку простішою та зрозумілішою, залиши тільки найважливіше'
      },
      {
        id: 'add-visuals',
        label: 'Додати візуали',
        icon: 'ImageIcon',
        description: 'Додати візуальні елементи',
        instruction: 'Додай більше візуальних елементів (зображення, іконки) для кращого сприйняття'
      }
    ];
  }
  
  // Quick improvements for text components (TitleBlock, BodyText, InstructionsBox)
  if (['title-block', 'body-text', 'instructions-box'].includes(componentType || '')) {
    return [
      {
        id: 'shorten',
        label: 'Зробити коротшим',
        icon: 'Minimize2',
        description: 'Скоротити текст',
        instruction: 'Зроби цей текст коротшим, зберігаючи основну суть'
      },
      {
        id: 'expand',
        label: 'Додати деталей',
        icon: 'Maximize2',
        description: 'Розширити текст',
        instruction: 'Розшир цей текст, додавши більше деталей та пояснень'
      },
      {
        id: 'simplify',
        label: 'Спростити мову',
        icon: 'Sparkles',
        description: 'Використати простішу мову',
        instruction: 'Спрости мову цього тексту для легшого розуміння'
      },
      {
        id: 'add-emoji',
        label: 'Додати емоджі',
        icon: 'Smile',
        description: 'Додати емоджі в текст',
        instruction: 'Додай відповідні емоджі в цей текст, щоб зробити його більш привабливим'
      }
    ];
  }
  
  // Quick improvements for exercise components (FillInBlank, MultipleChoice, TrueFalse, ShortAnswer)
  if (['fill-blank', 'multiple-choice', 'true-false', 'short-answer'].includes(componentType || '')) {
    return [
      {
        id: 'easier',
        label: 'Зробити легше',
        icon: 'TrendingDown',
        description: 'Зменшити складність',
        instruction: 'Зроби це завдання легшим та доступнішим'
      },
      {
        id: 'harder',
        label: 'Зробити складніше',
        icon: 'TrendingUp',
        description: 'Збільшити складність',
        instruction: 'Зроби це завдання складнішим та викликом'
      },
      {
        id: 'add-option',
        label: 'Додати варіант',
        icon: 'Plus',
        description: 'Додати ще один варіант',
        instruction: 'Додай ще один варіант відповіді до цього завдання'
      },
      {
        id: 'rephrase',
        label: 'Перефразувати',
        icon: 'RefreshCw',
        description: 'Змінити формулювання',
        instruction: 'Перефразуй питання цього завдання по-іншому, зберігаючи суть'
      }
    ];
  }
  
  // Quick improvements for image components
  if (componentType === 'image-placeholder') {
    return [
      {
        id: 'regenerate',
        label: 'Перегенерувати',
        icon: 'RefreshCw',
        description: 'Перегенерувати з тим самим промптом',
        instruction: '__REGENERATE__' // Special flag for direct regeneration
      },
      {
        id: 'cartoon-style',
        label: 'Мультяшний стиль',
        icon: 'Palette',
        description: 'Змінити на мультяшний стиль',
        instruction: 'Зміни стиль зображення на яскравий мультяшний, підходящий для дітей'
      },
      {
        id: 'realistic',
        label: 'Реалістичний',
        icon: 'Camera',
        description: 'Змінити на реалістичний стиль',
        instruction: 'Зміни стиль зображення на більш реалістичний та фотографічний'
      },
      {
        id: 'simplify',
        label: 'Спростити',
        icon: 'Minimize2',
        description: 'Зробити зображення простішим',
        instruction: 'Зроби зображення більш простим та мінімалістичним'
      }
    ];
  }
  
  // Quick improvements for tip/warning boxes
  if (['tip-box', 'warning-box'].includes(componentType || '')) {
    return [
      {
        id: 'add-examples',
        label: 'Додати приклади',
        icon: 'List',
        description: 'Додати конкретні приклади',
        instruction: 'Додай конкретні приклади до цього тексту'
      },
      {
        id: 'shorten',
        label: 'Зробити коротшим',
        icon: 'Minimize2',
        description: 'Скоротити текст',
        instruction: 'Зроби текст коротшим та лаконічнішим'
      },
      {
        id: 'more-friendly',
        label: 'Дружелюбніше',
        icon: 'Heart',
        description: 'Зробити більш дружелюбним',
        instruction: 'Зроби тон тексту більш дружелюбним та підтримуючим'
      }
    ];
  }
  
  // Default fallback improvements
  return [
    {
      id: 'improve',
      label: 'Покращити',
      icon: 'Sparkles',
      description: 'Загальне покращення',
      instruction: 'Покращ цей елемент, зроби його більш якісним та привабливим'
    },
    {
      id: 'simplify',
      label: 'Спростити',
      icon: 'Minimize2',
      description: 'Спростити елемент',
      instruction: 'Спрости цей елемент для кращого розуміння'
    }
  ];
}

/**
 * Get user-friendly name for component type
 */
export function getComponentTypeName(componentType: string): string {
  const names: Record<string, string> = {
    'title-block': 'Заголовок',
    'body-text': 'Текст',
    'instructions-box': 'Інструкції',
    'fill-blank': 'Заповнити пропуски',
    'multiple-choice': 'Множинний вибір',
    'true-false': 'Правда/Неправда',
    'short-answer': 'Коротка відповідь',
    'tip-box': 'Порада',
    'warning-box': 'Попередження',
    'image-placeholder': 'Зображення',
    'table': 'Таблиця',
    'divider': 'Розділювач',
    'bullet-list': 'Маркований список',
    'numbered-list': 'Нумерований список'
  };
  
  return names[componentType] || componentType;
}

/**
 * Get context-specific placeholder for AI chat input based on target type
 */
export function getAIChatPlaceholder(target: 'component' | 'page', componentType?: string): string {
  // Placeholder for page-level editing
  if (target === 'page') {
    return 'Що змінити на сторінці? (напр., "додай ще одне завдання" або "переорганізуй макет")';
  }
  
  // Placeholders for specific component types
  const placeholders: Record<string, string> = {
    // Text components
    'title-block': 'Що змінити в заголовку? (напр., "зроби коротшим" або "додай емоджі")',
    'body-text': 'Що змінити в тексті? (напр., "спрости мову" або "додай більше деталей")',
    'instructions-box': 'Що змінити в інструкції? (напр., "зроби зрозумілішою" або "додай приклад")',
    
    // Exercise components
    'fill-blank': 'Що змінити в завданні? (напр., "зроби легше" або "додай ще один пропуск")',
    'multiple-choice': 'Що змінити в тесті? (напр., "додай варіант" або "зроби складніше")',
    'true-false': 'Що змінити в питанні? (напр., "перефразуй" або "зроби чіткішим")',
    'short-answer': 'Що змінити в завданні? (напр., "зміни питання" або "додай підказку")',
    
    // Info boxes
    'tip-box': 'Що змінити в пораді? (напр., "додай приклад" або "зроби дружелюбнішою")',
    'warning-box': 'Що змінити в попередженні? (напр., "зроби акцентнішим" або "додай деталей")',
    
    // Image component
    'image-placeholder': 'Що змінити в зображенні? (напр., "зміни на мультяшний стиль" або "зроби яскравішим")',
    
    // Lists
    'bullet-list': 'Що змінити в списку? (напр., "додай пункт" або "зроби коротше")',
    'numbered-list': 'Що змінити в списку? (напр., "змінити порядок" або "додай пояснення")',
    
    // Table
    'table': 'Що змінити в таблиці? (напр., "додай колонку" або "спрости дані")',
    
    // Divider
    'divider': 'Що змінити в розділювачі? (напр., "зміни стиль" або "додай текст")'
  };
  
  // Return specific placeholder or default
  return placeholders[componentType || ''] || 'Що змінити? (напр., "покращ цей елемент" або "зроби простішим")';
}
