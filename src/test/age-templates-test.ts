import { ageComponentTemplatesService } from '@/services/templates/AgeComponentTemplatesService';
import { AgeGroup } from '@/types/generation';

/**
 * === SOLID: SRP - Тестовий файл для age-specific шаблонів ===
 * Перевіряє роботу системи завантаження та використання шаблонів
 */

async function testAgeTemplates() {
  console.log('🧪 Тестування age-specific шаблонів...');

  const ageGroups: AgeGroup[] = ['2-3', '4-6', '7-8', '9-10'];

  for (const ageGroup of ageGroups) {
    try {
      console.log(`\n📋 Тестування групи: ${ageGroup}`);
      
      // Тест 1: Завантаження шаблону
      const template = await ageComponentTemplatesService.getTemplateForAge(ageGroup);
      console.log(`✅ Шаблон завантажено, розмір: ${template.length} символів`);
      
      // Тест 2: Опис шаблону
      const description = ageComponentTemplatesService.getTemplateDescription(ageGroup);
      console.log(`📝 Опис: ${description}`);
      
      // Тест 3: Перевірка що шаблон містить основні елементи
      const hasHTML = template.includes('<!DOCTYPE html>');
      const hasCSS = template.includes('<style>');
      const hasJS = template.includes('<script>');
      const hasTitle = template.includes(`роки`) || template.includes(`років`);
      
      console.log(`🔍 Перевірка структури:`);
      console.log(`   HTML: ${hasHTML ? '✅' : '❌'}`);
      console.log(`   CSS: ${hasCSS ? '✅' : '❌'}`);
      console.log(`   JavaScript: ${hasJS ? '✅' : '❌'}`);
      console.log(`   Заголовок з віком: ${hasTitle ? '✅' : '❌'}`);
      
      if (!hasHTML || !hasCSS || !hasJS) {
        console.warn(`⚠️ Шаблон для групи ${ageGroup} може бути неповним`);
      }
      
    } catch (error) {
      console.error(`❌ Помилка при тестуванні групи ${ageGroup}:`, error);
    }
  }

  // Тест 4: Завантаження всіх шаблонів одночасно
  try {
    console.log(`\n🔄 Тестування завантаження всіх шаблонів...`);
    const allTemplates = await ageComponentTemplatesService.getAllTemplates();
    const loadedCount = Object.keys(allTemplates).length;
    console.log(`✅ Завантажено ${loadedCount} шаблонів з ${ageGroups.length} очікуваних`);
    
    if (loadedCount === ageGroups.length) {
      console.log(`🎉 Всі шаблони завантажено успішно!`);
    } else {
      console.warn(`⚠️ Деякі шаблони не завантажились`);
    }
  } catch (error) {
    console.error(`❌ Помилка при завантаженні всіх шаблонів:`, error);
  }

  console.log(`\n✨ Тестування age-specific шаблонів завершено!`);
}

// Експорт для використання в інших частинах проекту
export { testAgeTemplates };

// Запуск тесту якщо файл виконується напряму
if (require.main === module) {
  testAgeTemplates().catch(console.error);
} 