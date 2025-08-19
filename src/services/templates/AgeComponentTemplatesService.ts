import { AgeGroup } from '@/types/generation';
import { 
  AGE_COMPONENT_TEMPLATES, 
  AGE_TEMPLATE_DESCRIPTIONS, 
  AGE_CONFIGURATIONS 
} from '@/constants';

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
   * Always uses templates from constants for reliability and simplicity
   */
  async getTemplateForAge(ageGroup: AgeGroup): Promise<string> {
    // Перевіряємо кеш
    if (this.templateCache.has(ageGroup)) {
      return this.templateCache.get(ageGroup)!;
    }

    try {
      // Завжди використовуємо шаблони з констант
      const template = AGE_COMPONENT_TEMPLATES[ageGroup];
      
      if (!template) {
        throw new Error(`No template found for age group ${ageGroup}`);
      }
      
      // Кешуємо шаблон
      this.templateCache.set(ageGroup, template);
      
      console.log(`✅ Loaded template for age group ${ageGroup} from constants (${template.length} chars)`);
      return template;
      
    } catch (error) {
      console.error(`Critical error loading template for age ${ageGroup}:`, error);
      throw error; // This should never happen since constants are always available
    }
  }

  /**
   * === SOLID: SRP - Отримати опис шаблону ===
   */
  getTemplateDescription(ageGroup: AgeGroup): string {
    return AGE_TEMPLATE_DESCRIPTIONS[ageGroup] || 'Базові компоненти для навчання';
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
   * === SOLID: SRP - Очистити кеш (для тестування) ===
   */
  clearCache(): void {
    this.templateCache.clear();
  }
}

// === SOLID: SRP - Синглтон для глобального доступу ===
export const ageComponentTemplatesService = new AgeComponentTemplatesService(); 