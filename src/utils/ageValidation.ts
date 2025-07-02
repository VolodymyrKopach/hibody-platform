// Age validation and group determination for adaptive content generation

export enum AgeGroup {
  TODDLERS = 'toddlers',      // 3-4 роки
  PRESCHOOL = 'preschool',    // 5-6 років
  EARLY_SCHOOL = 'early',     // 7-8 років
  MIDDLE_SCHOOL = 'middle',   // 9-10 років
}

export interface AgeGroupConfig {
  name: string;
  description: string;
  minAge: number;
  maxAge: number;
  characteristics: string[];
  interactiveElements: string[];
  attentionSpan: number; // minutes
  preferredStyles: string[];
}

export const AGE_GROUP_CONFIGS: Record<AgeGroup, AgeGroupConfig> = {
  [AgeGroup.TODDLERS]: {
    name: '🐣 Малюки',
    description: 'Дуже прості взаємодії, великі кнопки, яскраві кольори',
    minAge: 3,
    maxAge: 4,
    characteristics: [
      'Короткий період уваги (3-5 хвилин)',
      'Люблять великі яскраві елементи',
      'Потребують простих дій (клік, торкання)',
      'Реагують на звуки та анімації',
      'Навчаються через повторення'
    ],
    interactiveElements: [
      'Великі кнопки з анімацією',
      'Простий drag & drop',
      'Звукові ефекти при кліку',
      'Яскраві спалахи та анімації',
      'Великі емоджі та картинки',
      'Прості hover ефекти'
    ],
    attentionSpan: 5,
    preferredStyles: [
      'Дуже великі шрифти (24px+)',
      'Яскраві контрастні кольори',
      'Багато білого простору',
      'Прості форми та контури',
      'Великі тактильні елементи'
    ]
  },
  
  [AgeGroup.PRESCHOOL]: {
    name: '🎨 Дошкільнята',
    description: 'Ігрові елементи, персонажі, прості завдання',
    minAge: 5,
    maxAge: 6,
    characteristics: [
      'Період уваги 5-10 хвилин',
      'Люблять персонажів та історії',
      'Можуть виконувати прості завдання',
      'Цікавляться кольорами та формами',
      'Навчаються через гру'
    ],
    interactiveElements: [
      'Інтерактивні персонажі',
      'Мітті-ігри з завданнями',
      'Прості квізи з картинками',
      'Перетягування елементів',
      'Анімовані нагороди',
      'Інтерактивні історії',
      'Простий підрахунок балів'
    ],
    attentionSpan: 8,
    preferredStyles: [
      'Великі шрифти (20px+)',
      'Яскраві веселі кольори',
      'Закруглені кути',
      'Дитячі ілюстрації',
      'Плавні анімації'
    ]
  },
  
  [AgeGroup.EARLY_SCHOOL]: {
    name: '📚 Молодші школярі',
    description: 'Навчальні ігри, простий текст, базова інтерактивність',
    minAge: 7,
    maxAge: 8,
    characteristics: [
      'Період уваги 10-15 хвилин',
      'Вміють читати прості слова',
      'Можуть виконувати послідовні дії',
      'Цікавляться досягненнями',
      'Розуміють прості правила'
    ],
    interactiveElements: [
      'Освітні міні-ігри',
      'Інтерактивні вправи',
      'Система балів та рівнів',
      'Прогрес-бари',
      'Інтерактивні тести',
      'Drag&drop з логікою',
      'Збір предметів',
      'Прості пазли'
    ],
    attentionSpan: 12,
    preferredStyles: [
      'Середні шрифти (18px+)',
      'Збалансовані кольори',
      'Структурований макет',
      'Чіткі інструкції',
      'Візуальний фідбек'
    ]
  },
  
  [AgeGroup.MIDDLE_SCHOOL]: {
    name: '🎯 Старші школярі',
    description: 'Складні завдання, тексти, інтерактивні експерименти',
    minAge: 9,
    maxAge: 10,
    characteristics: [
      'Період уваги 15-20 хвилин',
      'Добре читають та розуміють',
      'Можуть виконувати складні завдання',
      'Цікавляться деталями',
      'Розуміють складні концепції'
    ],
    interactiveElements: [
      'Інтерактивні симуляції',
      'Складні ігри з правилами',
      'Детальна система досягнень',
      'Мультистадійні завдання',
      'Інтерактивні діаграми',
      'Віртуальні експерименти',
      'Квести з сюжетом',
      'Творчі завдання'
    ],
    attentionSpan: 18,
    preferredStyles: [
      'Стандартні шрифти (16px+)',
      'Професійні кольори',
      'Детальний контент',
      'Інформативні елементи',
      'Складна навігація'
    ]
  }
};

export function determineAgeGroup(age: number): AgeGroup {
  if (age >= 3 && age <= 4) return AgeGroup.TODDLERS;
  if (age >= 5 && age <= 6) return AgeGroup.PRESCHOOL;
  if (age >= 7 && age <= 8) return AgeGroup.EARLY_SCHOOL;
  if (age >= 9 && age <= 10) return AgeGroup.MIDDLE_SCHOOL;
  
  // Default fallback
  if (age < 3) return AgeGroup.TODDLERS;
  return AgeGroup.MIDDLE_SCHOOL;
}

export function extractAgeFromText(text: string): number | null {
  // Шукаємо вік у тексті
  const agePatterns = [
    /(\d+)\s*(?:років?|рік|year?s?|old)/i,
    /для\s*дітей\s*(\d+)/i,
    /діти\s*(\d+)/i,
    /age[:\s]*(\d+)/i,
    /вік[:\s]*(\d+)/i,
    /(\d+)\s*р\./i
  ];
  
  for (const pattern of agePatterns) {
    const match = text.match(pattern);
    if (match) {
      const age = parseInt(match[1]);
      if (age >= 3 && age <= 10) {
        return age;
      }
    }
  }
  
  return null;
}

export function validateAge(age: number): { valid: boolean; message?: string } {
  if (age < 3) {
    return {
      valid: false,
      message: 'Система розрахована на дітей від 3 років. Для молодших дітей потрібен особливий підхід.'
    };
  }
  
  if (age > 10) {
    return {
      valid: false,
      message: 'Система оптимізована для дітей до 10 років. Для старших дітей рекомендуємо інші методи навчання.'
    };
  }
  
  return { valid: true };
}

export function getAgeGroupConfig(age: number): AgeGroupConfig {
  const group = determineAgeGroup(age);
  return AGE_GROUP_CONFIGS[group];
}

export function generateAgePrompt(age: number): string {
  const config = getAgeGroupConfig(age);
  
  return `
**ВІКОВА ГРУПА:** ${config.name} (${age} ${age === 1 ? 'рік' : age < 5 ? 'роки' : 'років'})

**ХАРАКТЕРИСТИКИ ВІКУ:**
${config.characteristics.map(char => `• ${char}`).join('\n')}

**ОБОВ'ЯЗКОВІ ІНТЕРАКТИВНІ ЕЛЕМЕНТИ:**
${config.interactiveElements.map(elem => `• ${elem}`).join('\n')}

**СТИЛІСТИЧНІ ВИМОГИ:**
${config.preferredStyles.map(style => `• ${style}`).join('\n')}

**ТРИВАЛІСТЬ УВАГИ:** ${config.attentionSpan} хвилин максимум

**АДАПТАЦІЯ КОНТЕНТУ:**
- Розділи контент на сегменти по ${Math.ceil(config.attentionSpan / 3)} хвилини
- Використовуй ${config.name.toLowerCase()} мову та приклади
- Періодично додавай інтерактивні елементи кожні 2-3 хвилини
`;
} 