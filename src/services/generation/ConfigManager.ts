import { 
  AgeGroupConfig, 
  AgeGroupFilters,
  FilterConfig,
  FilterGroup,
  FormValues,
  IConfigManager,
  AgeGroupId
} from '@/types/generation';

// === SOLID: SRP - Константи для конфігурацій ===

/**
 * Конфігурації вікових груп
 * SOLID: SRP - кожна конфігурація відповідає за одну вікову групу
 */
const AGE_GROUP_CONFIGS: Record<AgeGroupId, AgeGroupConfig> = {
  '2-3': {
    id: '2-3',
    name: 'Малюки',
    icon: '👶',
    ageRange: '2-3 роки',
    description: 'Розвиток моторики, сенсорики та базових навичок',
    fontSize: {
      primary: '48px',
      secondary: '36px',
      body: '28px'
    },
    layout: {
      elementsPerSlide: 1,
      maxWords: 3,
      spacing: 'spacious'
    },
    audio: {
      required: true,
      types: ['narration', 'music', 'effects'],
      volume: 'medium'
    },
    timeRange: '2-5 хвилин',
    complexity: 'simple'
  },
  '4-6': {
    id: '4-6',
    name: 'Дошкільнята',
    icon: '🧒',
    ageRange: '4-6 років',
    description: 'Підготовка до школи, базові знання',
    fontSize: {
      primary: '36px',
      secondary: '28px',
      body: '20px'
    },
    layout: {
      elementsPerSlide: 3,
      maxWords: 8,
      spacing: 'normal'
    },
    audio: {
      required: true,
      types: ['narration', 'music'],
      volume: 'medium'
    },
    timeRange: '5-10 хвилин',
    complexity: 'simple'
  },
  '7-8': {
    id: '7-8',
    name: 'Молодші школярі',
    icon: '📚',
    ageRange: '7-8 років',
    description: 'Початкова освіта, базові предмети',
    fontSize: {
      primary: '28px',
      secondary: '24px',
      body: '18px'
    },
    layout: {
      elementsPerSlide: 5,
      maxWords: 20,
      spacing: 'normal'
    },
    audio: {
      required: false,
      types: ['narration'],
      volume: 'low'
    },
    timeRange: '10-15 хвилин',
    complexity: 'medium'
  },
  '9-10': {
    id: '9-10',
    name: 'Старші школярі',
    icon: '🧠',
    ageRange: '9-10 років',
    description: 'Поглиблене навчання, складні завдання',
    fontSize: {
      primary: '24px',
      secondary: '20px',
      body: '16px'
    },
    layout: {
      elementsPerSlide: 8,
      maxWords: 50,
      spacing: 'compact'
    },
    audio: {
      required: false,
      types: ['narration'],
      volume: 'low'
    },
    timeRange: '15-20 хвилин',
    complexity: 'complex'
  }
};

/**
 * Фільтри для вікової групи 2-3 роки
 * SOLID: SRP - відповідає тільки за фільтри малюків
 */
const FILTERS_2_3: FilterGroup[] = [
  {
    id: 'goals',
    title: 'Ціль заняття',
    description: 'Що розвиваємо у дитини',
    collapsible: false,
    defaultExpanded: true,
    filters: [
      {
        id: 'main_goal',
        field: 'main_goal',
        label: 'Основна ціль',
        type: 'select',
        required: true,
        options: [
          { id: 'language_development', label: 'Розвиток мови', value: 'language_development', description: 'Перші слова і прості речення' },
          { id: 'motor_skills', label: 'Моторика', value: 'motor_skills', description: 'Дрібна та крупна моторика' },
          { id: 'world_knowledge', label: 'Пізнання світу', value: 'world_knowledge', description: 'Базові поняття про навколишнє' },
          { id: 'emotional_development', label: 'Емоційний розвиток', value: 'emotional_development', description: 'Розуміння почуттів' },
          { id: 'social_skills', label: 'Соціальні навички', value: 'social_skills', description: 'Взаємодія з іншими' },
          { id: 'creativity', label: 'Творчість', value: 'creativity', description: 'Малювання, ліплення, музика' },
          { id: 'custom_goal', label: 'Власна ціль', value: 'custom_goal', description: 'Для індивідуальних цілей' }
        ]
      }
    ]
  },
  {
    id: 'activity_type',
    title: 'Тип активності',
    description: 'Який формат заняття',
    collapsible: false,
    defaultExpanded: true,
    filters: [
      {
        id: 'activity_types',
        field: 'activity_types',
        label: 'Типи активностей',
        type: 'checkbox',
        required: true,
        options: [
          { id: 'imitation', label: 'Імітація', value: 'imitation', description: 'Повтори рухи, звуки, жести', icon: '👋' },
          { id: 'musical_rhythm', label: 'Музично-ритмічні', value: 'musical_rhythm', description: 'Пісні, танці, ритм', icon: '🎵' },
          { id: 'simple_puzzles', label: 'Прості пазли', value: 'simple_puzzles', description: '2-4 елементи', icon: '🧩' },
          { id: 'colors_shapes', label: 'Кольори та форми', value: 'colors_shapes', description: 'Базові геометричні поняття', icon: '🌈' },
          { id: 'animals', label: 'Тварини', value: 'animals', description: 'Звуки, рухи, де живуть', icon: '🐾' },
          { id: 'household_items', label: 'Побутові предмети', value: 'household_items', description: 'Що для чого використовуємо', icon: '🏠' },
          { id: 'role_play', label: 'Рольові ігри', value: 'role_play', description: '"Як мама", "як лікар"', icon: '🎭' },
          { id: 'custom_activity', label: 'Власний варіант', value: 'custom_activity', description: 'Індивідуальна активність' }
        ]
      }
    ]
  },
  {
    id: 'theme',
    title: 'Тематика',
    description: 'Про що буде заняття',
    collapsible: false,
    defaultExpanded: true,
    filters: [
      {
        id: 'main_theme',
        field: 'main_theme',
        label: 'Основна тематика',
        type: 'select',
        required: true,
        options: [
          { id: 'family', label: 'Сім\'я', value: 'family', description: 'Мама, тато, бабуся', icon: '👨‍👩‍👧‍👦' },
          { id: 'animals', label: 'Тварини', value: 'animals', description: 'Домашні та дикі', icon: '🦁' },
          { id: 'transport', label: 'Транспорт', value: 'transport', description: 'Машина, автобус, літак', icon: '🚗' },
          { id: 'food', label: 'Їжа', value: 'food', description: 'Фрукти, овочі, улюблена їжа', icon: '🍎' },
          { id: 'home', label: 'Дім', value: 'home', description: 'Кімнати, меблі, речі', icon: '🏡' },
          { id: 'nature', label: 'Природа', value: 'nature', description: 'Дощ, сонце, квіти', icon: '🌤️' },
          { id: 'holidays', label: 'Свята', value: 'holidays', description: 'День народження, Новий рік', icon: '🎈' },
          { id: 'toys', label: 'Іграшки', value: 'toys', description: 'М\'яч, лялька, кубики', icon: '⚽' },
          { id: 'custom_theme', label: 'Власна тема', value: 'custom_theme', description: 'Індивідуальна тематика' }
        ]
      }
    ]
  },
  {
    id: 'audio_content',
    title: 'Аудіо-супровід',
    description: 'Звуковий супровід (обов\'язковий)',
    collapsible: false,
    defaultExpanded: true,
    filters: [
      {
        id: 'audio_types',
        field: 'audio_types',
        label: 'Типи аудіо',
        type: 'checkbox',
        required: true,
        options: [
          { id: 'children_songs', label: 'Дитячі пісні', value: 'children_songs', description: 'Веселі мелодії', icon: '🎶' },
          { id: 'animal_sounds', label: 'Звуки тварин', value: 'animal_sounds', description: 'Гав-гав, мяу-мяу', icon: '🔊' },
          { id: 'transport_sounds', label: 'Звуки транспорту', value: 'transport_sounds', description: 'Біп-біп, ту-ту', icon: '🚗' },
          { id: 'lullabies', label: 'Колискові', value: 'lullabies', description: 'Заспокійливі мелодії', icon: '🎵' },
          { id: 'rhythm_sounds', label: 'Ритмічні звуки', value: 'rhythm_sounds', description: 'Плескання, тупотіння', icon: '👏' },
          { id: 'word_repetition', label: 'Повторення слів', value: 'word_repetition', description: 'Навчання вимові', icon: '🗣️' },
          { id: 'custom_audio', label: 'Власний варіант', value: 'custom_audio', description: 'Індивідуальний аудіо-супровід' }
        ]
      }
    ]
  },
  {
    id: 'difficulty',
    title: 'Рівень складності',
    description: 'Наскільки складним має бути заняття',
    collapsible: false,
    defaultExpanded: true,
    filters: [
      {
        id: 'difficulty_level',
        field: 'difficulty_level',
        label: 'Складність',
        type: 'radio',
        required: true,
        options: [
          { id: 'simple', label: 'Простий', value: 'simple', description: 'Один елемент, одна дія', icon: '🌟' },
          { id: 'medium', label: 'Середній', value: 'medium', description: '2-3 елементи, послідовність', icon: '⭐⭐' },
          { id: 'complex', label: 'Складніший', value: 'complex', description: '4-5 елементів, вибір варіанту', icon: '⭐⭐⭐' },
          { id: 'auto', label: 'Автоматичний', value: 'auto', description: 'Система сама обирає', icon: '🎯' }
        ]
      }
    ]
  },
  {
    id: 'duration',
    title: 'Тривалість заняття',
    description: 'Скільки часу триватиме активність',
    collapsible: false,
    defaultExpanded: true,
    filters: [
      {
        id: 'lesson_duration',
        field: 'lesson_duration',
        label: 'Тривалість',
        type: 'radio',
        required: true,
        options: [
          { id: 'short', label: 'Коротка', value: 'short', description: '2-3 хвилини', icon: '⚡' },
          { id: 'standard', label: 'Стандартна', value: 'standard', description: '3-5 хвилин', icon: '🕐' },
          { id: 'long', label: 'Довга', value: 'long', description: '5-7 хвилин', icon: '📚' },
          { id: 'repeatable', label: 'Повторювана', value: 'repeatable', description: 'Може зациклюватись', icon: '🔄' }
        ]
      }
    ]
  },
  {
    id: 'presentation_style',
    title: 'Стиль подачі',
    description: 'Як подавати матеріал дитині',
    collapsible: true,
    defaultExpanded: false,
    filters: [
      {
        id: 'style',
        field: 'style',
        label: 'Стиль',
        type: 'radio',
        required: true,
        options: [
          { id: 'playful', label: 'Ігровий', value: 'playful', description: 'Через гру та розвагу', icon: '🎪' },
          { id: 'storytelling', label: 'Казковий', value: 'storytelling', description: 'Через історії та персонажів', icon: '📖' },
          { id: 'musical', label: 'Музичний', value: 'musical', description: 'Через пісні та ритм', icon: '🎵' },
          { id: 'movement', label: 'Руховий', value: 'movement', description: 'Через фізичні активності', icon: '🏃‍♂️' },
          { id: 'interactive', label: 'Інтерактивний', value: 'interactive', description: 'Через діалог та участь', icon: '🤝' }
        ]
      }
    ]
  },
  {
    id: 'participation_format',
    title: 'Формат участі',
    description: 'Хто бере участь у занятті',
    collapsible: true,
    defaultExpanded: false,
    filters: [
      {
        id: 'participation',
        field: 'participation',
        label: 'Формат',
        type: 'radio',
        required: true,
        options: [
          { id: 'individual', label: 'Індивідуальний', value: 'individual', description: 'Дитина сама', icon: '👶' },
          { id: 'with_adult', label: 'З дорослим', value: 'with_adult', description: 'Разом з батьками/педагогом', icon: '👨‍👩‍👧‍👦' },
          { id: 'with_friends', label: 'З друзями', value: 'with_friends', description: 'В маленькій групці', icon: '👫' },
          { id: 'group', label: 'Груповий', value: 'group', description: 'Вся група разом', icon: '🎉' }
        ]
      }
    ]
  },
  {
    id: 'visual_effects',
    title: 'Візуальні ефекти',
    description: 'Налаштування зовнішнього вигляду',
    collapsible: true,
    defaultExpanded: false,
    filters: [
      {
        id: 'visual_options',
        field: 'visual_options',
        label: 'Візуальні елементи',
        type: 'checkbox',
        required: false,
        options: [
          { id: 'bright_colors', label: 'Яскраві кольори', value: 'bright_colors', description: 'Насичена палітра', icon: '✨' },
          { id: 'large_elements', label: 'Великі елементи', value: 'large_elements', description: 'Зручно для сприйняття', icon: '🎈' },
          { id: 'simple_animations', label: 'Прості анімації', value: 'simple_animations', description: 'Рух привертає увагу', icon: '💫' },
          { id: 'repetition', label: 'Повторення', value: 'repetition', description: 'Для закріплення', icon: '🔄' },
          { id: 'contrast', label: 'Контрастність', value: 'contrast', description: 'Чітке виділення головного', icon: '🎯' }
        ]
      }
    ]
  },
  {
    id: 'presentation_speed',
    title: 'Швидкість подачі',
    description: 'Темп презентації матеріалу',
    collapsible: true,
    defaultExpanded: false,
    filters: [
      {
        id: 'speed',
        field: 'speed',
        label: 'Швидкість',
        type: 'radio',
        required: true,
        options: [
          { id: 'slow', label: 'Повільна', value: 'slow', description: 'Для уважного розгляду', icon: '🐌' },
          { id: 'moderate', label: 'Помірна', value: 'moderate', description: 'Стандартний темп', icon: '🚶‍♂️' },
          { id: 'fast', label: 'Швидка', value: 'fast', description: 'Для активних дітей', icon: '🏃‍♂️' },
          { id: 'adaptive', label: 'Адаптивна', value: 'adaptive', description: 'Підлаштовується під дитину', icon: '📊' }
        ]
      }
    ]
  }
];

/**
 * Фільтри для вікової групи 4-6 років
 * SOLID: SRP - відповідає тільки за фільтри дошкільнят
 */
const FILTERS_4_6: FilterGroup[] = [
  {
    id: 'topic',
    title: 'Тематика',
    description: 'Про що буде урок',
    collapsible: false,
    defaultExpanded: true,
    filters: [
      {
        id: 'main_topic',
        field: 'main_topic',
        label: 'Основна тема',
        type: 'select',
        required: true,
        options: [
          { id: 'alphabet', label: 'Абетка', value: 'alphabet', icon: '🔤' },
          { id: 'numbers', label: 'Цифри', value: 'numbers', icon: '🔢' },
          { id: 'transport', label: 'Транспорт', value: 'transport', icon: '🚗' },
          { id: 'food', label: 'Їжа', value: 'food', icon: '🍎' },
          { id: 'family', label: 'Сім\'я', value: 'family', icon: '👨‍👩‍👧‍👦' },
          { id: 'animals', label: 'Тварини', value: 'animals', icon: '🐾' }
        ]
      }
    ]
  },
  {
    id: 'task_type',
    title: 'Типи завдань',
    description: 'Що робитиме дитина',
    collapsible: false,
    defaultExpanded: true,
    filters: [
      {
        id: 'tasks',
        field: 'tasks',
        label: 'Завдання',
        type: 'multiselect',
        required: true,
        options: [
          { id: 'repeat', label: 'Повтори слово', value: 'repeat', icon: '🔄' },
          { id: 'fix_mistake', label: 'Виправ помилку', value: 'fix_mistake', icon: '✏️' },
          { id: 'find_pair', label: 'Знайди пару', value: 'find_pair', icon: '🧩' },
          { id: 'color', label: 'Розмалюй', value: 'color', icon: '🎨' }
        ]
      }
    ]
  },
  {
    id: 'language',
    title: 'Мова',
    description: 'Якою мовою проводимо урок',
    collapsible: false,
    defaultExpanded: true,
    filters: [
      {
        id: 'language_choice',
        field: 'language_choice',
        label: 'Мова навчання',
        type: 'radio',
        required: true,
        options: [
          { id: 'ukrainian', label: 'Українська', value: 'ukrainian', icon: '🇺🇦' },
          { id: 'english', label: 'Англійська', value: 'english', icon: '🇬🇧' },
          { id: 'both', label: 'Обидві', value: 'both', icon: '🌍' }
        ]
      }
    ]
  }
];

/**
 * Фільтри для вікової групи 7-8 років
 * SOLID: SRP - відповідає тільки за фільтри молодших школярів
 */
const FILTERS_7_8: FilterGroup[] = [
  {
    id: 'subject',
    title: 'Предмет',
    description: 'Шкільна дисципліна',
    collapsible: false,
    defaultExpanded: true,
    filters: [
      {
        id: 'school_subject',
        field: 'school_subject',
        label: 'Навчальний предмет',
        type: 'select',
        required: true,
        options: [
          { id: 'math', label: 'Математика', value: 'math', icon: '🔢' },
          { id: 'reading', label: 'Читання', value: 'reading', icon: '📖' },
          { id: 'logic', label: 'Логіка', value: 'logic', icon: '🧠' },
          { id: 'ukrainian', label: 'Українська мова', value: 'ukrainian', icon: '🇺🇦' },
          { id: 'english', label: 'Англійська мова', value: 'english', icon: '🇬🇧' }
        ]
      }
    ]
  },
  {
    id: 'lesson_format',
    title: 'Формат уроку',
    description: 'Як проводимо урок',
    collapsible: false,
    defaultExpanded: true,
    filters: [
      {
        id: 'format',
        field: 'format',
        label: 'Тип уроку',
        type: 'radio',
        required: true,
        options: [
          { id: 'exercise_game', label: 'Вправа + гра', value: 'exercise_game', icon: '🎮' },
          { id: 'test', label: 'Тест', value: 'test', icon: '📝' },
          { id: 'reading', label: 'Читання', value: 'reading', icon: '📚' },
          { id: 'creative', label: 'Творчі завдання', value: 'creative', icon: '🎨' }
        ]
      }
    ]
  },
  {
    id: 'skills',
    title: 'Навички',
    description: 'Що розвиваємо',
    collapsible: false,
    defaultExpanded: true,
    filters: [
      {
        id: 'target_skills',
        field: 'target_skills',
        label: 'Цільові навички',
        type: 'multiselect',
        required: true,
        options: [
          { id: 'attention', label: 'Уважність', value: 'attention', icon: '👁️' },
          { id: 'arithmetic', label: 'Арифметика', value: 'arithmetic', icon: '➕' },
          { id: 'sentences', label: 'Складання речень', value: 'sentences', icon: '📝' },
          { id: 'memory', label: 'Пам\'ять', value: 'memory', icon: '🧠' }
        ]
      }
    ]
  }
];

/**
 * Фільтри для вікової групи 9-10 років
 * SOLID: SRP - відповідає тільки за фільтри старших школярів
 */
const FILTERS_9_10: FilterGroup[] = [
  {
    id: 'subject',
    title: 'Предмет',
    description: 'Поглиблене вивчення',
    collapsible: false,
    defaultExpanded: true,
    filters: [
      {
        id: 'advanced_subject',
        field: 'advanced_subject',
        label: 'Предмет навчання',
        type: 'select',
        required: true,
        options: [
          { id: 'math', label: 'Математика', value: 'math', icon: '🔢' },
          { id: 'reading_comprehension', label: 'Читання з розумінням', value: 'reading_comprehension', icon: '📖' },
          { id: 'science', label: 'Природознавство', value: 'science', icon: '🔬' },
          { id: 'history', label: 'Історія', value: 'history', icon: '🏛️' }
        ]
      }
    ]
  },
  {
    id: 'difficulty',
    title: 'Складність',
    description: 'Рівень завдань',
    collapsible: false,
    defaultExpanded: true,
    filters: [
      {
        id: 'complexity_level',
        field: 'complexity_level',
        label: 'Рівень складності',
        type: 'radio',
        required: true,
        options: [
          { id: 'easy', label: 'Легкий', value: 'easy', icon: '🟢' },
          { id: 'medium', label: 'Середній', value: 'medium', icon: '🟡' },
          { id: 'hard', label: 'Високий', value: 'hard', icon: '🔴' }
        ]
      }
    ]
  },
  {
    id: 'task_type',
    title: 'Тип задач',
    description: 'Формат завдань',
    collapsible: false,
    defaultExpanded: true,
    filters: [
      {
        id: 'task_format',
        field: 'task_format',
        label: 'Формат завдань',
        type: 'multiselect',
        required: true,
        options: [
          { id: 'word_problems', label: 'Текстові задачі', value: 'word_problems', icon: '📝' },
          { id: 'equations', label: 'Рівняння', value: 'equations', icon: '🔢' },
          { id: 'logic_puzzles', label: 'Логічні задачі', value: 'logic_puzzles', icon: '🧩' },
          { id: 'text_analysis', label: 'Аналіз тексту', value: 'text_analysis', icon: '📊' }
        ]
      }
    ]
  }
];

/**
 * Мапа фільтрів для кожної вікової групи
 */
const AGE_FILTERS_MAP: Record<AgeGroupId, AgeGroupFilters> = {
  '2-3': { ageGroupId: '2-3', groups: FILTERS_2_3 },
  '4-6': { ageGroupId: '4-6', groups: FILTERS_4_6 },
  '7-8': { ageGroupId: '7-8', groups: FILTERS_7_8 },
  '9-10': { ageGroupId: '9-10', groups: FILTERS_9_10 }
};

/**
 * Дефолтні значення для кожної вікової групи
 */
const DEFAULT_VALUES: Record<AgeGroupId, FormValues> = {
  '2-3': {
    main_goal: '',
    activity_types: [],
    main_theme: '',
    audio_types: [],
    difficulty_level: '',
    lesson_duration: '',
    style: '',
    participation: '',
    visual_options: [],
    speed: ''
  },
  '4-6': {
    main_topic: '',
    tasks: [],
    language_choice: ''
  },
  '7-8': {
    school_subject: '',
    format: '',
    target_skills: []
  },
  '9-10': {
    advanced_subject: '',
    complexity_level: '',
    task_format: []
  }
};

/**
 * Менеджер конфігурацій для системи генерації
 * SOLID: SRP - відповідає тільки за управління конфігураціями
 * SOLID: DIP - реалізує абстрактний інтерфейс
 */
export class ConfigManager implements IConfigManager {
  /**
   * Отримати всі доступні вікові групи
   * SOLID: SRP - одна відповідальність: повернути список груп
   */
  getAgeGroups(): AgeGroupConfig[] {
    return Object.values(AGE_GROUP_CONFIGS);
  }

  /**
   * Отримати конфігурацію вікової групи за ID
   * SOLID: SRP - одна відповідальність: знайти конфігурацію
   */
  getAgeGroupConfig(ageGroupId: string): AgeGroupConfig | null {
    return AGE_GROUP_CONFIGS[ageGroupId as AgeGroupId] || null;
  }

  /**
   * Отримати фільтри для конкретної вікової групи
   * SOLID: SRP - одна відповідальність: повернути фільтри
   */
  getFiltersForAge(ageGroupId: string): AgeGroupFilters {
    const filters = AGE_FILTERS_MAP[ageGroupId as AgeGroupId];
    if (!filters) {
      throw new Error(`Фільтри для вікової групи ${ageGroupId} не знайдені`);
    }
    return filters;
  }

  /**
   * Отримати дефолтні значення для вікової групи
   * SOLID: SRP - одна відповідальність: повернути дефолтні значення
   */
  getDefaultValues(ageGroupId: string): FormValues {
    const defaults = DEFAULT_VALUES[ageGroupId as AgeGroupId];
    if (!defaults) {
      throw new Error(`Дефолтні значення для вікової групи ${ageGroupId} не знайдені`);
    }
    return { ...defaults }; // Повертаємо копію, щоб уникнути мутацій
  }

  /**
   * Перевірити, чи існує вікова група
   * SOLID: SRP - одна відповідальність: валідація ID
   */
  isValidAgeGroup(ageGroupId: string): boolean {
    return ageGroupId in AGE_GROUP_CONFIGS;
  }

  /**
   * Отримати всі фільтри для всіх вікових груп
   * SOLID: SRP - одна відповідальність: повернути всі фільтри
   */
  getAllFilters(): AgeGroupFilters[] {
    return Object.values(AGE_FILTERS_MAP);
  }
}

// Експорт singletona для використання в додатку
export const configManager = new ConfigManager(); 