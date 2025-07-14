// === SOLID: OCP - Open/Closed Principle ===
// Розширюємо функціональність через наслідування, не змінюючи існуючий код

import { 
  AgeGroup, 
  AgeGroupConfig, 
  IAgeGroupConfigProvider,
  SectionConfig,
  FieldConfig
} from '../../../types/generation';

import { 
  Baby, 
  Users, 
  School, 
  GraduationCap
} from 'lucide-react';

// === SOLID: SRP - Single Responsibility Principle ===
// Кожен клас відповідає тільки за конфігурацію своєї вікової групи

export abstract class BaseAgeGroupConfig {
  abstract getConfig(): AgeGroupConfig;
  
  protected createSection(id: string, title: string, description: string, order: number): SectionConfig {
    return { id, title, description, order };
  }
  
  protected createField(
    label: string, 
    type: FieldConfig['type'], 
    options?: string[], 
    section?: string,
    description?: string,
    required?: boolean
  ): FieldConfig {
    return { label, type, options, section, description, required };
  }
}

export class AgeGroup2to3Config extends BaseAgeGroupConfig {
  getConfig(): AgeGroupConfig {
    return {
      id: '2-3',
      icon: Baby,
      label: '2-3 роки',
      color: '#FF6B9D',
      sections: [
        this.createSection('basic', '🎈 Основні фільтри', 'Цілі, активності та базові налаштування', 1),
        this.createSection('special', '🎭 Спеціальні фільтри', 'Стиль подачі та формат участі', 2),
        this.createSection('technical', '🔧 Технічні налаштування', 'Візуальні ефекти та швидкість подачі', 3),
      ],
      fields: {
        topic: this.createField('Власна тема', 'text', undefined, 'basic', 'Введіть власну тему або оберіть з готових варіантів'),
        lessonGoal: this.createField('🎯 Ціль заняття', 'select', [
          '🗣️ Розвиток мови - перші слова і прості речення',
          '🤲 Моторика - дрібна та крупна моторика',
          '🌍 Пізнання світу - базові поняття про навколишнє',
          '😊 Емоційний розвиток - розуміння почуттів',
          '🤝 Соціальні навички - взаємодія з іншими',
          '🎨 Творчість - малювання, ліплення, музика',
          '✏️ Власне поле - для індивідуальних цілей'
        ], 'basic'),
        activityType: this.createField('🎨 Тип активності', 'multiselect', [
          '👋 Імітація - повтори рухи, звуки, жести',
          '🎵 Музично-ритмічні - пісні, танці, ритм',
          '🧩 Прості пазли - 2-4 елементи',
          '🌈 Кольори та форми - базові геометричні поняття',
          '🐾 Тварини - звуки, рухи, де живуть',
          '🏠 Побутові предмети - що для чого використовуємо',
          '🎭 Рольові ігри - "як мама", "як лікар"',
          '✏️ Власний варіант'
        ], 'basic'),
        thematic24: this.createField('📚 Тематика', 'select', [
          '👨‍👩‍👧‍👦 Сім\'я - мама, тато, бабуся',
          '🦁 Тварини - домашні та дикі',
          '🚗 Транспорт - машина, автобус, літак',
          '🍎 Їжа - фрукти, овочі, улюблена їжа',
          '🏡 Дім - кімнати, меблі, речі',
          '🌤️ Природа - дощ, сонце, квіти',
          '🎈 Свята - день народження, Новий рік',
          '⚽ Іграшки - м\'яч, лялька, кубики',
          '✏️ Власне поле'
        ], 'basic'),
        audioSupport24: this.createField('🎵 Аудіо-супровід', 'checkbox', undefined, 'basic', 'Включити звуковий супровід до уроку'),
        complexityLevel24: this.createField('🎮 Рівень складності', 'select', [
          '🌟 Простий - один елемент, одна дія',
          '⭐⭐ Середній - 2-3 елементи, послідовність',
          '⭐⭐⭐ Складніший - 4-5 елементів, вибір варіанту',
          '🎯 Автоматичний - система сама обирає'
        ], 'basic'),
        lessonDuration24: this.createField('⏱️ Тривалість заняття', 'select', [
          '⚡ Коротка - 2-3 хвилини',
          '🕐 Стандартна - 3-5 хвилин',
          '📚 Довга - 5-7 хвилин',
          '🔄 Повторювана - може зациклюватись'
        ], 'basic'),
        presentationStyle24: this.createField('🎭 Стиль подачі', 'select', [
          '🎪 Ігровий - через гру та розвагу',
          '📖 Казковий - через історії та персонажів',
          '🎵 Музичний - через пісні та ритм',
          '🏃‍♂️ Руховий - через фізичні активності',
          '🤝 Інтерактивний - через діалог та участь'
        ], 'special'),
        participationFormat24: this.createField('👥 Формат участі', 'select', [
          '👶 Індивідуальний - дитина сама',
          '👨‍👩‍👧‍👦 З дорослим - разом з батьками/педагогом',
          '👫 З друзями - в маленькій групці',
          '🎉 Груповий - вся група разом'
        ], 'special'),
        visualEffects: this.createField('🔧 Візуальні ефекти', 'multiselect', [
          '✨ Яскраві кольори - насичена палітра',
          '🎈 Великі елементи - зручно для сприйняття',
          '💫 Прості анімації - рух привертає увагу',
          '🔄 Повторення - для закріплення',
          '🎯 Контрастність - чітке виділення головного'
        ], 'technical'),
        presentationSpeed24: this.createField('🎚️ Швидкість подачі', 'select', [
          '🐌 Повільна - для уважного розгляду',
          '🚶‍♂️ Помірна - стандартний темп',
          '🏃‍♂️ Швидка - для активних дітей',
          '📊 Адаптивна - підлаштовується під дитину'
        ], 'technical'),
      }
    };
  }
}

export class AgeGroup4to6Config extends BaseAgeGroupConfig {
  getConfig(): AgeGroupConfig {
    return {
      id: '4-6',
      icon: Users,
      label: '4-6 років',
      color: '#4ECDC4',
      sections: [
        this.createSection('basic', '📝 Базові фільтри', 'Основні параметри уроку', 1),
        this.createSection('specialized', '🎯 Спеціалізовані фільтри', 'Детальні налаштування навчання', 2),
        this.createSection('interactive', '🎮 Інтерактивні налаштування', 'Стиль подачі та участь', 3),
        this.createSection('technical', '⚙️ Технічні параметри', 'Візуальне оформлення та швидкість', 4),
        this.createSection('educational', '🎓 Освітні стандарти', 'Програма та система оцінювання', 5),
      ],
      fields: {
        topic: this.createField('Власна тема', 'text', undefined, 'basic', 'Введіть власну тему або оберіть з готових варіантів'),
        thematic: this.createField('📘 Тематика', 'select', [
          '🔤 Абетка - букви, звуки, перші слова',
          '🔢 Цифри та рахунок - числа 1-10, прості операції',
          '🚗 Транспорт - види транспорту, правила дороги',
          '🍎 Їжа - здорова їжа, смаки, кольори',
          '🐶 Тварини - домашні, дикі, де живуть',
          '🌍 Навколишній світ - природа, пори року',
          '👨‍👩‍👧‍👦 Сім\'я та друзі - стосунки, емоції',
          '🏠 Дім та побут - кімнати, предмети, порядок',
          '🎨 Мистецтво - кольори, форми, малювання',
          '⚽ Спорт та ігри - активності, правила гри',
          '🎭 Професії - хто що робить',
          '🌈 Емоції - радість, сум, страх, любов'
        ], 'basic'),
        taskTypes: this.createField('🧠 Типи завдань', 'multiselect', [
          '🔤 Повтори слово - розвиток мови',
          '🔍 Знайди пару - пам\'ять та логіка',
          '❌ Виправ помилку - критичне мислення',
          '📝 Вибери правильно - множинний вибір',
          '🔢 Порахуй скільки - математичні навички',
          '🎯 Покажи де - просторове мислення',
          '🔊 Послухай і повтори - слухове сприйняття',
          '🧩 Склади послідовність - логічне мислення',
          '🎨 Розмалюй правильно - творчість + навчання',
          '🎭 Розіграй сценку - соціальні навички'
        ], 'basic'),
        // ... додаткові поля для 4-6 років
      }
    };
  }
}

export class AgeGroup7to8Config extends BaseAgeGroupConfig {
  getConfig(): AgeGroupConfig {
    return {
      id: '7-8',
      icon: School,
      label: '7-8 років',
      color: '#45B7D1',
      sections: [
        this.createSection('subjects', '📚 Основні предмети', 'Предмети, формати уроків та навички', 1),
        this.createSection('specialized', '🎓 Спеціалізовані фільтри', 'Складність, тривалість та тематика', 2),
        this.createSection('methodical', '📊 Методичні параметри', 'Педагогічні цілі та оцінювання', 3),
        this.createSection('interactive', '🎮 Інтерактивні елементи', 'Взаємодія, стиль подачі та соціальний формат', 4),
        this.createSection('technical', '💻 Технічні параметри', 'Платформа та візуальний стиль', 5),
        this.createSection('educational', '📋 Освітні стандарти', 'Програма навчання та компетентності', 6),
      ],
      fields: {
        topic: this.createField('Власна тема', 'text', undefined, 'subjects', 'Введіть власну тему або оберіть з готових варіантів'),
        subject78: this.createField('🧾 Предмет', 'select', [
          '📖 Українська мова - читання, письмо, граматика',
          '🔢 Математика - арифметика, геометрія, логіка',
          '🌍 Я досліджую світ - природознавство, суспільство',
          '🎨 Мистецтво - малювання, музика, творчість',
          '🏃‍♂️ Фізкультура - рухи, координація, ігри',
          '🇬🇧 Англійська мова - перші слова, фрази',
          '💻 Цифрова грамотність - комп\'ютер, інтернет безпека',
          '🧠 Логіка та мислення - головоломки, задачі',
          '🗣️ Риторика - вміння говорити, презентувати',
          '🎭 Творча діяльність - театр, музика, танці',
          '✏️ Власне поле'
        ], 'subjects'),
        // ... додаткові поля для 7-8 років
      }
    };
  }
}

export class AgeGroup9to10Config extends BaseAgeGroupConfig {
  getConfig(): AgeGroupConfig {
    return {
      id: '9-10',
      icon: GraduationCap,
      label: '9-10 років',
      color: '#96CEB4',
      sections: [
        this.createSection('academic', '📘 Академічні предмети', 'Предмети, складність та типи завдань', 1),
        this.createSection('specialized', '🎯 Спеціалізовані фільтри', 'Навчальні цілі, тривалість та тематика', 2),
        this.createSection('methodical', '📋 Методичні параметри', 'Педагогічні підходи та оцінювання', 3),
        this.createSection('technological', '💻 Технологічні параметри', 'Цифрові інструменти та дизайн', 4),
        this.createSection('social', '👥 Соціальні параметри', 'Формати взаємодії та ролі учнів', 5),
        this.createSection('educational', '🎓 Освітні стандарти', 'Програми навчання та компетентності', 6),
      ],
      fields: {
        topic: this.createField('Власна тема', 'text', undefined, 'academic', 'Введіть власну тему або оберіть з готових варіантів'),
        subject910: this.createField('📘 Предмет', 'select', [
          '📊 Математика - алгебра, геометрія, статистика',
          '📖 Українська мова - література, граматика, стилістика',
          '🌍 Природознавство - фізика, хімія, біологія',
          '🗺️ Я досліджую світ - географія, історія, суспільство',
          '🇬🇧 Англійська мова - граматика, лексика, спілкування',
          '💻 Інформатика - алгоритми, програмування, цифрова грамотність',
          '🎨 Мистецтво - образотворче мистецтво, музика',
          '🏃‍♂️ Здоров\'я і спорт - фізичне виховання, здоровий спосіб життя',
          '🧠 Логіка і філософія - критичне мислення, етика',
          '🔬 Дослідницька діяльність - наукові проєкти',
          '💼 Профорієнтація - знайомство з професіями',
          '🌐 Глобальне громадянство - міжкультурна взаємодія',
          '✍️ Власне поле'
        ], 'academic'),
        // ... додаткові поля для 9-10 років
      }
    };
  }
}

// === SOLID: DIP - Dependency Inversion Principle ===
// Конкретна реалізація абстракції

export class AgeGroupConfigProvider implements IAgeGroupConfigProvider {
  private configs: Map<AgeGroup, BaseAgeGroupConfig> = new Map();

  constructor() {
    this.configs.set('2-3', new AgeGroup2to3Config());
    this.configs.set('4-6', new AgeGroup4to6Config());
    this.configs.set('7-8', new AgeGroup7to8Config());
    this.configs.set('9-10', new AgeGroup9to10Config());
  }

  getConfig(ageGroup: AgeGroup): AgeGroupConfig {
    const config = this.configs.get(ageGroup);
    if (!config) {
      throw new Error(`Configuration for age group ${ageGroup} not found`);
    }
    return config.getConfig();
  }

  getAllConfigs(): AgeGroupConfig[] {
    return Array.from(this.configs.values()).map(config => config.getConfig());
  }
} 