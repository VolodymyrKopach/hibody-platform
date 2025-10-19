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
  
  // Quick improvements for Flashcards
  if (componentType === 'flashcards') {
    return [
      {
        id: 'add-card',
        label: 'Додати картку',
        icon: 'Plus',
        description: 'Додати нову картку',
        instruction: 'Додай ще одну картку з новим словом/поняттям'
      },
      {
        id: 'add-images',
        label: 'Додати зображення',
        icon: 'ImageIcon',
        description: 'Додати зображення на картки',
        instruction: 'Додай відповідні зображення на картки для кращого запам\'ятовування'
      },
      {
        id: 'simplify',
        label: 'Спростити',
        icon: 'Minimize2',
        description: 'Спростити контент',
        instruction: 'Зроби тексти на картках простішими та коротшими'
      }
    ];
  }
  
  // Quick improvements for Word Builder
  if (componentType === 'word-builder') {
    return [
      {
        id: 'easier-word',
        label: 'Легше слово',
        icon: 'TrendingDown',
        description: 'Використати простіше слово',
        instruction: 'Зміни на простіше слово для вивчення'
      },
      {
        id: 'harder-word',
        label: 'Складніше слово',
        icon: 'TrendingUp',
        description: 'Використати складніше слово',
        instruction: 'Зміни на більш складне слово для виклику'
      },
      {
        id: 'add-hint',
        label: 'Додати підказку',
        icon: 'Lightbulb',
        description: 'Додати підказку-зображення',
        instruction: 'Додай зображення-підказку до слова'
      }
    ];
  }
  
  // Quick improvements for Open Question
  if (componentType === 'open-question') {
    return [
      {
        id: 'rephrase',
        label: 'Перефразувати',
        icon: 'RefreshCw',
        description: 'Переформулювати питання',
        instruction: 'Перефразуй питання по-іншому, зробивши його чіткішим'
      },
      {
        id: 'add-keywords',
        label: 'Додати ключові слова',
        icon: 'Key',
        description: 'Додати очікувані ключові слова',
        instruction: 'Додай більше ключових слів, які AI повинен шукати у відповіді'
      },
      {
        id: 'make-easier',
        label: 'Спростити питання',
        icon: 'TrendingDown',
        description: 'Зробити питання простішим',
        instruction: 'Зроби питання простішим та зрозумілішим'
      }
    ];
  }
  
  // Quick improvements for Drawing Canvas
  if (componentType === 'drawing-canvas') {
    return [
      {
        id: 'add-background',
        label: 'Додати фон',
        icon: 'ImageIcon',
        description: 'Додати фонове зображення',
        instruction: 'Додай цікаве фонове зображення для малювання'
      },
      {
        id: 'more-colors',
        label: 'Більше кольорів',
        icon: 'Palette',
        description: 'Розширити палітру',
        instruction: 'Додай більше кольорів у палітру'
      },
      {
        id: 'add-templates',
        label: 'Додати шаблони',
        icon: 'Layout',
        description: 'Додати шаблони для малювання',
        instruction: 'Додай готові шаблони або контури для малювання'
      }
    ];
  }
  
  // Quick improvements for Dialog Roleplay
  if (componentType === 'dialog-roleplay') {
    return [
      {
        id: 'add-branch',
        label: 'Додати гілку',
        icon: 'GitBranch',
        description: 'Додати варіант діалогу',
        instruction: 'Додай нову гілку діалогу з альтернативними відповідями'
      },
      {
        id: 'add-character',
        label: 'Додати персонажа',
        icon: 'Users',
        description: 'Додати нового персонажа',
        instruction: 'Додай нового персонажа до діалогу'
      },
      {
        id: 'make-natural',
        label: 'Природніший',
        icon: 'MessageCircle',
        description: 'Зробити діалог природнішим',
        instruction: 'Зроби діалог більш природним та живим'
      }
    ];
  }
  
  // Quick improvements for Interactive Map
  if (componentType === 'interactive-map') {
    return [
      {
        id: 'add-hotspot',
        label: 'Додати точку',
        icon: 'MapPin',
        description: 'Додати нову інтерактивну точку',
        instruction: 'Додай нову інтерактивну точку на карту з інформацією'
      },
      {
        id: 'add-quiz',
        label: 'Режим квізу',
        icon: 'HelpCircle',
        description: 'Додати завдання-квіз',
        instruction: 'Додай завдання у форматі квізу для перевірки знань карти'
      },
      {
        id: 'more-info',
        label: 'Більше інформації',
        icon: 'Info',
        description: 'Розширити інформацію',
        instruction: 'Додай більше деталей та інформації до кожної точки'
      }
    ];
  }
  
  // Quick improvements for Timer Challenge
  if (componentType === 'timer-challenge') {
    return [
      {
        id: 'more-time',
        label: 'Більше часу',
        icon: 'Clock',
        description: 'Збільшити час',
        instruction: 'Збільш час на виконання завдання'
      },
      {
        id: 'add-questions',
        label: 'Додати питання',
        icon: 'Plus',
        description: 'Додати більше питань',
        instruction: 'Додай більше питань до челенджу'
      },
      {
        id: 'easier',
        label: 'Зробити легше',
        icon: 'TrendingDown',
        description: 'Спростити завдання',
        instruction: 'Зроби питання простішими'
      }
    ];
  }
  
  // Quick improvements for Timeline Builder
  if (componentType === 'timeline-builder') {
    return [
      {
        id: 'add-event',
        label: 'Додати подію',
        icon: 'Plus',
        description: 'Додати нову подію',
        instruction: 'Додай ще одну важливу подію до таймлайну'
      },
      {
        id: 'add-images',
        label: 'Додати зображення',
        icon: 'ImageIcon',
        description: 'Додати зображення до подій',
        instruction: 'Додай відповідні зображення до кожної події'
      },
      {
        id: 'more-details',
        label: 'Більше деталей',
        icon: 'FileText',
        description: 'Розширити описи',
        instruction: 'Додай більше деталей та контексту до кожної події'
      }
    ];
  }
  
  // Quick improvements for Story Builder
  if (componentType === 'story-builder') {
    return [
      {
        id: 'add-character',
        label: 'Додати персонажа',
        icon: 'User',
        description: 'Додати нового персонажа',
        instruction: 'Додай нового цікавого персонажа для історій'
      },
      {
        id: 'add-location',
        label: 'Додати локацію',
        icon: 'Map',
        description: 'Додати нову локацію',
        instruction: 'Додай нову локацію де може відбуватися історія'
      },
      {
        id: 'more-items',
        label: 'Більше предметів',
        icon: 'Package',
        description: 'Додати предмети',
        instruction: 'Додай більше предметів та елементів для історій'
      }
    ];
  }
  
  // Quick improvements for Categorization Grid
  if (componentType === 'categorization-grid') {
    return [
      {
        id: 'add-item',
        label: 'Додати елемент',
        icon: 'Plus',
        description: 'Додати елемент для сортування',
        instruction: 'Додай ще один елемент для сортування по категоріях'
      },
      {
        id: 'add-category',
        label: 'Додати категорію',
        icon: 'Folder',
        description: 'Додати нову категорію',
        instruction: 'Додай ще одну категорію для сортування'
      },
      {
        id: 'add-images',
        label: 'Додати зображення',
        icon: 'ImageIcon',
        description: 'Додати зображення до елементів',
        instruction: 'Додай зображення до елементів для кращого розпізнавання'
      }
    ];
  }
  
  // Quick improvements for Interactive Board
  if (componentType === 'interactive-board') {
    return [
      {
        id: 'add-background',
        label: 'Змінити фон',
        icon: 'ImageIcon',
        description: 'Встановити фонове зображення',
        instruction: 'Додай або зміни фонове зображення дошки'
      },
      {
        id: 'add-instructions',
        label: 'Додати інструкції',
        icon: 'Info',
        description: 'Додати інструкції використання',
        instruction: 'Додай чіткі інструкції як користуватися дошкою'
      },
      {
        id: 'more-stickers',
        label: 'Більше стікерів',
        icon: 'Smile',
        description: 'Збільшити ліміт стікерів',
        instruction: 'Збільш максимальну кількість стікерів'
      }
    ];
  }
  
  // Quick improvements for Object Builder
  if (componentType === 'object-builder') {
    return [
      {
        id: 'add-part',
        label: 'Додати деталь',
        icon: 'Plus',
        description: 'Додати нову деталь',
        instruction: 'Додай ще одну деталь до об\'єкта'
      },
      {
        id: 'simplify',
        label: 'Спростити',
        icon: 'Minimize2',
        description: 'Зменшити кількість деталей',
        instruction: 'Зменш кількість деталей для простішого будування'
      },
      {
        id: 'add-colors',
        label: 'Більше кольорів',
        icon: 'Palette',
        description: 'Додати різнокольорові деталі',
        instruction: 'Додай більше кольорів до деталей об\'єкта'
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
    'numbered-list': 'Нумерований список',
    // New interactive components
    'flashcards': 'Флешкартки',
    'word-builder': 'Будівник слів',
    'open-question': 'Відкрите питання',
    'drawing-canvas': 'Полотно для малювання',
    'dialog-roleplay': 'Рольова гра діалог',
    'interactive-map': 'Інтерактивна карта',
    'timer-challenge': 'Челендж на час',
    'timeline-builder': 'Таймлайн',
    'story-builder': 'Конструктор історій',
    'categorization-grid': 'Сітка категорій',
    'interactive-board': 'Інтерактивна дошка',
    'object-builder': 'Конструктор об\'єктів'
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
    'divider': 'Що змінити в розділювачі? (напр., "зміни стиль" або "додай текст")',
    
    // New interactive components
    'flashcards': 'Що змінити у флешкартках? (напр., "додай картку" або "додай зображення")',
    'word-builder': 'Що змінити у будівнику слів? (напр., "складніше слово" або "додай підказку")',
    'open-question': 'Що змінити у відкритому питанні? (напр., "перефразуй" або "додай ключові слова")',
    'drawing-canvas': 'Що змінити на полотні? (напр., "додай фон" або "більше кольорів")',
    'dialog-roleplay': 'Що змінити в діалозі? (напр., "додай гілку" або "додай персонажа")',
    'interactive-map': 'Що змінити на карті? (напр., "додай точку" або "додай квіз")',
    'timer-challenge': 'Що змінити в челенджі? (напр., "більше часу" або "додай питання")',
    'timeline-builder': 'Що змінити в таймлайні? (напр., "додай подію" або "додай зображення")',
    'story-builder': 'Що змінити в конструкторі історій? (напр., "додай персонажа" або "додай локацію")',
    'categorization-grid': 'Що змінити в сітці категорій? (напр., "додай елемент" або "додай категорію")',
    'interactive-board': 'Що змінити на дошці? (напр., "змінити фон" або "більше стікерів")',
    'object-builder': 'Що змінити в конструкторі? (напр., "додай деталь" або "спрости")'
  };
  
  // Return specific placeholder or default
  return placeholders[componentType || ''] || 'Що змінити? (напр., "покращ цей елемент" або "зроби простішим")';
}
