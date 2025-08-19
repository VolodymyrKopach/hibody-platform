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
      console.error(`Error loading template for age ${ageGroup}:`, error);
      return this.getFallbackTemplate(ageGroup);
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
   * === SOLID: SRP - Fallback шаблон ===
   * This should rarely be called since we always have templates in constants
   */
  private getFallbackTemplate(ageGroup: AgeGroup): string {
    console.log(`⚠️ Using fallback template for ${ageGroup}`);
    
    // First try constants template
    const constantsTemplate = AGE_COMPONENT_TEMPLATES[ageGroup];
    if (constantsTemplate) {
      console.log(`✅ Found constants template for ${ageGroup}, length: ${constantsTemplate.length}`);
      return constantsTemplate;
    }
    
    // If constants template is missing, use basic fallback
    return this.getBasicFallbackTemplate(ageGroup);
  }

  private getBasicFallbackTemplate(ageGroup: AgeGroup): string {
    const ageConfig = AGE_CONFIGURATIONS[ageGroup] || AGE_CONFIGURATIONS['4-6'];
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Fallback Template for ${ageGroup} Years</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Comic Sans MS',cursive;background:linear-gradient(135deg,${ageConfig.colors.join(',')});min-height:100vh;display:flex;align-items:center;justify-content:center;padding:${ageConfig.padding}px}
.fallback-container{text-align:center;background:rgba(255,255,255,0.9);padding:${ageConfig.padding}px;border-radius:${ageConfig.borderRadius}px;box-shadow:0 10px 30px rgba(0,0,0,0.2)}
.fallback-title{font-size:${ageConfig.fontSize}px;color:#2c3e50;margin-bottom:20px;font-weight:bold}
.fallback-button{width:${ageConfig.buttonSize}px;height:${ageConfig.buttonSize}px;border-radius:50%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;border:none;font-size:${Math.floor(ageConfig.fontSize * 0.8)}px;cursor:pointer;transition:all 0.3s;box-shadow:0 10px 20px rgba(0,0,0,0.2)}
.fallback-button:hover{transform:scale(1.1)}
.audio-toggle{position:fixed;top:20px;right:20px;width:60px;height:60px;border-radius:50%;background:#667eea;color:white;border:none;font-size:24px;cursor:pointer;z-index:1000}
.audio-toggle::before{content:'🔊'}
</style>
</head>
<body>
<div class="audio-toggle" onclick="toggleAudio()"></div>
<div class="fallback-container">
<h1 class="fallback-title">Age ${ageGroup} Template</h1>
<button class="fallback-button" onclick="alert('Interactive element clicked!')">🎯</button>
</div>
<script>
let audioEnabled=true;
function toggleAudio(){audioEnabled=!audioEnabled;const btn=document.querySelector('.audio-toggle');btn.style.background=audioEnabled?'#667eea':'#e74c3c';console.log('Audio',audioEnabled?'enabled':'disabled')}
</script>
</body>
</html>`;
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