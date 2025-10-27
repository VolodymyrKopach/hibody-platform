/**
 * Get AI prompt modifier based on age group
 */
export const getAgeGroupPromptModifier = (ageGroup: string): string => {
  const modifiers: Record<string, string> = {
    '3-5': 'Very simple shapes, bold outlines, minimal details, large elements, suitable for toddlers',
    '6-7': 'Simple and clear, moderate details, recognizable shapes, easy to color',
    '8-9': 'Moderate complexity, some fine details, realistic proportions',
    '10-11': 'Detailed, accurate proportions, textures allowed, more complexity',
    '12-13': 'Complex details, realistic style, advanced elements, artistic details',
    '14-15': 'Highly detailed, artistic style, sophisticated composition, intricate patterns',
    '16-18': 'Professional level, intricate details, any complexity, advanced techniques'
  };
  
  return modifiers[ageGroup] || modifiers['8-9'];
};

/**
 * Get topic suggestions based on age group
 */
export const getAgeGroupSuggestions = (ageGroup: string): string[] => {
  const suggestions: Record<string, string[]> = {
    '3-5': [
      'Просте яблуко',
      'Усміхнене сонце',
      'Котик',
      'Будинок',
      'Кола та квадрати',
      'Велика квітка'
    ],
    '6-7': [
      'Динозавр',
      'Дерево з яблуками',
      'Машинка',
      'Квітка з метеликом',
      'Ракета в космосі',
      'Рибка в воді'
    ],
    '8-9': [
      'Замок з вежами',
      'Тропічний острів',
      'Робот',
      'Космічний корабель',
      'Підводний світ',
      'Чарівний ліс'
    ],
    '10-11': [
      'Фантастичне місто',
      'Дракон',
      'Замок в горах',
      'Космічна станція',
      'Джунглі з тваринами',
      'Середньовічний лицар'
    ],
    '12-13': [
      'Готична архітектура',
      'Стімпанк машина',
      'Міфічна істота',
      'Футуристичний пейзаж',
      'Фентезі персонаж',
      'Абстрактна композиція'
    ],
    '14-15': [
      'Детальний портрет',
      'Архітектурний ансамбль',
      'Складна мандала',
      'Реалістичний пейзаж',
      'Художня композиція',
      'Технічне креслення'
    ],
    '16-18': [
      'Професійна ілюстрація',
      'Складна сцена',
      'Детальний натюрморт',
      'Анатомічний малюнок',
      'Архітектурна візуалізація',
      'Концепт-арт'
    ]
  };
  
  return suggestions[ageGroup] || suggestions['8-9'];
};

/**
 * Get complexity description for age group
 */
export const getComplexityDescription = (
  complexity: 'simple' | 'medium' | 'detailed',
  ageGroup?: string
): string => {
  const descriptions = {
    simple: 'Прості форми, великі деталі, легко розфарбувати',
    medium: 'Помірна складність, збалансовані деталі',
    detailed: 'Багато деталей, складні елементи'
  };

  return descriptions[complexity];
};

/**
 * Enhance AI prompt with age-appropriate modifiers
 */
export const enhancePromptForAge = (
  basePrompt: string,
  ageGroup: string,
  complexity?: 'simple' | 'medium' | 'detailed'
): string => {
  const ageModifier = getAgeGroupPromptModifier(ageGroup);
  
  let enhancedPrompt = `${basePrompt}. Style: ${ageModifier}`;
  
  if (complexity) {
    const complexityTexts = {
      simple: ', keep it very simple with minimal details',
      medium: ', moderate level of detail',
      detailed: ', include rich details and textures'
    };
    enhancedPrompt += complexityTexts[complexity];
  }
  
  // Add coloring-friendly suffix
  enhancedPrompt += '. Create as a coloring page suitable for children with clear outlines and distinct areas to color.';
  
  return enhancedPrompt;
};

/**
 * Get recommended items for age group
 */
export const getRecommendedCategories = (ageGroup: string): string[] => {
  const recommendations: Record<string, string[]> = {
    '3-5': ['animals', 'educational', 'nature'],
    '6-7': ['animals', 'nature', 'transport', 'educational'],
    '8-9': ['animals', 'nature', 'transport', 'food'],
    '10-11': ['animals', 'nature', 'transport', 'food'],
    '12-13': ['nature', 'transport', 'animals', 'food'],
    '14-15': ['transport', 'nature', 'animals', 'food'],
    '16-18': ['transport', 'nature', 'animals', 'food']
  };
  
  return recommendations[ageGroup] || ['animals', 'nature', 'transport'];
};

