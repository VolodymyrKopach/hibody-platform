import { AgeGroup } from '@/types/generation';

/**
 * === SOLID: SRP - Сервіс для управління age-specific компонентними шаблонами ===
 * Відповідає тільки за завантаження та надання HTML шаблонів для різних вікових груп
 */
export interface IAgeComponentTemplatesService {
  getTemplateForAge(ageGroup: AgeGroup): Promise<string>;
  getTemplateDescription(ageGroup: AgeGroup): string;
  getAllTemplates(): Promise<Record<AgeGroup, string>>;
}

export class AgeComponentTemplatesService implements IAgeComponentTemplatesService {
  private templateCache: Map<AgeGroup, string> = new Map();

  /**
   * === SOLID: SRP - Отримати HTML шаблон для вікової групи ===
   */
  async getTemplateForAge(ageGroup: AgeGroup): Promise<string> {
    // Перевіряємо кеш
    if (this.templateCache.has(ageGroup)) {
      return this.templateCache.get(ageGroup)!;
    }

    try {
      let template: string;
      
      // Визначаємо середовище виконання
      if (typeof window === 'undefined') {
        // Серверне середовище - використовуємо fs
        template = await this.loadTemplateFromFS(ageGroup);
      } else {
        // Браузерне середовище - використовуємо fetch
        template = await this.loadTemplateFromFetch(ageGroup);
      }
      
      // Кешуємо шаблон
      this.templateCache.set(ageGroup, template);
      
      console.log(`✅ Loaded template for age group ${ageGroup} (${template.length} chars)`);
      return template;
      
    } catch (error) {
      console.error(`Error loading template for age ${ageGroup}:`, error);
      return this.getFallbackTemplate(ageGroup);
    }
  }

  /**
   * === SOLID: SRP - Отримати опис шаблону ===
   */
  getTemplateDescription(ageGroup: AgeGroup): string {
    const descriptions: Record<AgeGroup, string> = {
      '2-3': 'Візуальні компоненти для малюків 2-3 роки: великі кнопки, анімації, звукові ефекти, яскраві кольори',
      '4-6': 'Компоненти для дошкільнят 4-6 років: інтерактивні ігри, персонажі, прості завдання, музика',
      '7-8': 'Елементи для молодших школярів 7-8 років: навчальні ігри, тести, прогрес-бари, досягнення',
      '9-10': 'Компоненти для старших школярів 9-10 років: складні інтерфейси, деталізовані дані, аналітика'
    };
    
    return descriptions[ageGroup] || 'Базові компоненти для навчання';
  }

  /**
   * === SOLID: SRP - Отримати всі шаблони ===
   */
  async getAllTemplates(): Promise<Record<AgeGroup, string>> {
    const ageGroups: AgeGroup[] = ['2-3', '4-6', '7-8', '9-10'];
    const templates: Record<AgeGroup, string> = {} as Record<AgeGroup, string>;

    await Promise.all(
      ageGroups.map(async (ageGroup) => {
        templates[ageGroup] = await this.getTemplateForAge(ageGroup);
      })
    );

    return templates;
  }

  /**
   * === Завантаження шаблону через файлову систему (серверне середовище) ===
   */
  private async loadTemplateFromFS(ageGroup: AgeGroup): Promise<string> {
    // Динамічні імпорти Node.js модулів
    const { promises: fs } = await import('fs');
    const path = await import('path');
    
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'age-components', `${ageGroup}.html`);
    
    try {
      const template = await fs.readFile(templatePath, 'utf-8');
      return template;
    } catch (error) {
      console.warn(`Template file for age ${ageGroup} not found at ${templatePath}, using fallback`);
      throw error;
    }
  }

  /**
   * === Завантаження шаблону через fetch (браузерне середовище) ===
   */
  private async loadTemplateFromFetch(ageGroup: AgeGroup): Promise<string> {
    const templatePath = `/templates/age-components/${ageGroup}.html`;
    const response = await fetch(templatePath);
    
    if (!response.ok) {
      console.warn(`Template for age ${ageGroup} not found via fetch, using fallback`);
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  }

  /**
   * === SOLID: SRP - Fallback шаблон ===
   */
  private getFallbackTemplate(ageGroup: AgeGroup): string {
    const ageConfig = this.getAgeConfig(ageGroup);
    
    return `
<!-- Fallback шаблон для вікової групи ${ageGroup} -->
<div class="age-components-${ageGroup}">
  <style>
    .age-components-${ageGroup} {
      font-family: 'Comic Sans MS', cursive;
      background: linear-gradient(135deg, #FFE66D 0%, #4ECDC4 50%, #FF6B6B 100%);
      padding: ${ageConfig.padding}px;
      border-radius: ${ageConfig.borderRadius}px;
    }
    
    .big-button-${ageGroup} {
      font-size: ${ageConfig.fontSize}px;
      padding: ${ageConfig.buttonPadding}px;
      background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
      border: none;
      border-radius: ${ageConfig.borderRadius}px;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      margin: ${ageConfig.margin}px;
    }
    
    .big-button-${ageGroup}:hover {
      transform: scale(1.1);
    }
  </style>
  
  <h1 style="font-size: ${ageConfig.titleSize}px; color: #FF6B6B; text-align: center;">
    ${ageConfig.title}
  </h1>
  
  <button class="big-button-${ageGroup}" onclick="playSound('button')">
    ${ageConfig.buttonText}
  </button>
  
  <div style="margin-top: ${ageConfig.margin}px;">
    ${ageConfig.description}
  </div>
</div>

<script>
function playSound(type) {
  // Базовий звуковий ефект
  console.log('Playing sound:', type);
}
</script>
    `.trim();
  }

  /**
   * === SOLID: SRP - Конфігурація для fallback шаблонів ===
   */
  private getAgeConfig(ageGroup: AgeGroup) {
    const configs = {
      '2-3': {
        fontSize: 48,
        titleSize: 60,
        buttonPadding: 40,
        padding: 40,
        margin: 30,
        borderRadius: 30,
        title: '🎈 Малюки 2-3 роки',
        buttonText: '🎉 Натисни мене!',
        description: 'Великі кнопки та яскраві кольори для найменших'
      },
      '4-6': {
        fontSize: 36,
        titleSize: 48,
        buttonPadding: 30,
        padding: 30,
        margin: 25,
        borderRadius: 25,
        title: '🎨 Дошкільнята 4-6 років',
        buttonText: '🎯 Грати разом!',
        description: 'Ігрові елементи та інтерактивні завдання'
      },
      '7-8': {
        fontSize: 28,
        titleSize: 36,
        buttonPadding: 20,
        padding: 25,
        margin: 20,
        borderRadius: 20,
        title: '📚 Молодші школярі 7-8 років',
        buttonText: '✏️ Виконати',
        description: 'Навчальні ігри та систематизовані завдання'
      },
      '9-10': {
        fontSize: 24,
        titleSize: 32,
        buttonPadding: 15,
        padding: 20,
        margin: 15,
        borderRadius: 15,
        title: '🧠 Старші школярі 9-10 років',
        buttonText: '🎯 Почати',
        description: 'Складні інтерфейси та детальна інформація'
      }
    };

    return configs[ageGroup] || configs['4-6'];
  }

  /**
   * === SOLID: SRP - Очистити кеш (для тестування) ===
   */
  clearCache(): void {
    this.templateCache.clear();
  }
}

// === SOLID: SRP - Синглтон для глобального доступу ===
export const ageComponentTemplatesService = new AgeComponentTemplatesService(); 