/**
 * === SOLID: SRP - Single Responsibility ===
 * Сервіс відповідальний лише за генерацію промптів для уроків
 */

import { AgeGroup, FormData } from '../../types/generation';

// === SOLID: DIP - Абстракція для генератора промптів ===
export interface IPromptGenerator {
  generatePrompt(ageGroup: AgeGroup, formData: FormData): string;
}

// === SOLID: SRP - Конкретна реалізація генератора промптів ===
export class PromptGeneratorService implements IPromptGenerator {
  
  generatePrompt(ageGroup: AgeGroup, formData: FormData): string {
    // === SOLID: OCP - Легко розширюється новими віковими групами ===
    switch (ageGroup) {
      case '2-3':
        return this.generatePromptFor2to3(formData);
      case '4-6':
        return this.generatePromptFor4to6(formData);
      case '7-8':
        return this.generatePromptFor7to8(formData);
      case '9-10':
        return this.generatePromptFor9to10(formData);
      default:
        throw new Error(`Unsupported age group: ${ageGroup}`);
    }
  }

  // === SOLID: SRP - Окремі методи для кожної вікової групи ===
  
  private generatePromptFor2to3(formData: FormData): string {
    const parts = [];
    
    parts.push(`Створи детальний урок для дітей віком 2-3 років (активні дошкільнята).`);
    
    if (formData.lessonGoal) {
      parts.push(`Ціль заняття: ${formData.lessonGoal}`);
    }
    
    if (formData.activityType && formData.activityType.length > 0) {
      parts.push(`Типи активності: ${formData.activityType.join(', ')}`);
    }
    
    if (formData.thematic24) {
      parts.push(`Тематика: ${formData.thematic24}`);
    }
    if (formData.topic) {
      parts.push(`Додаткова тема: ${formData.topic}`);
    }
    
    if (formData.audioSupport24) {
      parts.push(`Аудіо-супровід: включено`);
    }
    
    if (formData.complexityLevel24) {
      parts.push(`Рівень складності: ${formData.complexityLevel24}`);
    }
    
    if (formData.lessonDuration24) {
      parts.push(`Тривалість заняття: ${formData.lessonDuration24}`);
    }
    
    if (formData.presentationStyle24) {
      parts.push(`Стиль подачі: ${formData.presentationStyle24}`);
    }
    
    if (formData.participationFormat24) {
      parts.push(`Формат участі: ${formData.participationFormat24}`);
    }
    
    if (formData.visualEffects && formData.visualEffects.length > 0) {
      parts.push(`Візуальні ефекти: ${formData.visualEffects.join(', ')}`);
    }
    
    if (formData.presentationSpeed24) {
      parts.push(`Швидкість подачі: ${formData.presentationSpeed24}`);
    }
    
    parts.push(`
Урок повинен включати:
- Детальний план заняття з урахуванням всіх обраних параметрів
- Пояснення матеріалу дуже простою мовою для дітей 2-3 років
- Короткі активності (увага тримається 3-7 хвилин)
- Багато повторень для закріплення
- Активні рухи та фізичні вправи
- Імітаційні завдання (повтори за мною)
- Яскраві візуальні елементи та прості анімації
- Музичні та звукові ефекти для утримання уваги
- Можливість участі разом з дорослими

Особливі вимоги для віку 2-3 років:
- Словниковий запас: 200-1000 слів
- Прості причинно-наслідкові зв'язки
- Розвиток дрібної та крупної моторики
- Емоційне навчання через імітацію
- Максимум 3-4 елементи в одному завданні
- Можливість зупинити та повторити
- Безпечне середовище для експериментів

Адаптуй зміст під когнітивні можливості дітей 2-3 років, використовуючи відповідну лексику та методи раннього розвитку.`);
    
    return parts.join('\n\n');
  }

  private generatePromptFor4to6(formData: FormData): string {
    const parts = [];
    
    parts.push(`Створи детальний урок для дітей віком 4-6 років (підготовка до школи).`);
    
    if (formData.thematic) {
      parts.push(`Тематика: ${formData.thematic}`);
    }
    if (formData.topic) {
      parts.push(`Додаткова тема: ${formData.topic}`);
    }
    
    if (formData.taskTypes && formData.taskTypes.length > 0) {
      parts.push(`Типи завдань: ${formData.taskTypes.join(', ')}`);
    }
    
    if (formData.language) {
      parts.push(`Мова: ${formData.language}`);
    }
    
    if (formData.learningGoal) {
      parts.push(`Навчальна мета: ${formData.learningGoal}`);
    }
    
    if (formData.complexityLevel) {
      parts.push(`Рівень складності: ${formData.complexityLevel}`);
    }
    
    if (formData.lessonDuration) {
      parts.push(`Тривалість: ${formData.lessonDuration}`);
    }
    
    if (formData.presentationStyle) {
      parts.push(`Стиль подачі: ${formData.presentationStyle}`);
    }
    
    if (formData.audioSupport && formData.audioSupport.length > 0) {
      parts.push(`Аудіо-супровід: ${formData.audioSupport.join(', ')}`);
    }
    
    if (formData.participationFormat) {
      parts.push(`Формат участі: ${formData.participationFormat}`);
    }
    
    if (formData.visualDesign && formData.visualDesign.length > 0) {
      parts.push(`Візуальне оформлення: ${formData.visualDesign.join(', ')}`);
    }
    
    if (formData.presentationSpeed) {
      parts.push(`Швидкість подачі: ${formData.presentationSpeed}`);
    }
    
    if (formData.interactivity) {
      parts.push(`Тип інтерактивності: ${formData.interactivity}`);
    }
    
    if (formData.educationalProgram) {
      parts.push(`Освітня програма: ${formData.educationalProgram}`);
    }
    
    if (formData.gradingSystem) {
      parts.push(`Система оцінювання: ${formData.gradingSystem}`);
    }
    
    parts.push(`
Урок повинен включати:
- Детальний план заняття з урахуванням всіх обраних параметрів
- Пояснення матеріалу простою мовою для дітей 4-6 років
- Інтерактивні елементи відповідно до обраного типу інтерактивності
- Практичні завдання з урахуванням рівня складності
- Способи перевірки розуміння через обрану систему оцінювання
- Візуальні та аудіо елементи згідно з налаштуваннями
- Адаптацію під обраний формат участі

Адаптуй зміст під когнітивні можливості дітей 4-6 років, використовуючи відповідну лексику та методи навчання для підготовки до школи.`);
    
    return parts.join('\n\n');
  }

  private generatePromptFor7to8(formData: FormData): string {
    const parts = [];
    
    parts.push(`Створи детальний урок для дітей віком 7-8 років (молодші школярі).`);
    
    if (formData.subject78) {
      parts.push(`Предмет: ${formData.subject78}`);
    }
    if (formData.topic) {
      parts.push(`Додаткова тема: ${formData.topic}`);
    }
    
    if (formData.lessonFormat78 && formData.lessonFormat78.length > 0) {
      parts.push(`Формат уроку: ${formData.lessonFormat78.join(', ')}`);
    }
    
    if (formData.skills78 && formData.skills78.length > 0) {
      parts.push(`Навички: ${formData.skills78.join(', ')}`);
    }
    
    if (formData.complexityLevel78) {
      parts.push(`Рівень складності: ${formData.complexityLevel78}`);
    }
    
    if (formData.lessonDuration78) {
      parts.push(`Тривалість уроку: ${formData.lessonDuration78}`);
    }
    
    if (formData.thematicOrientation78) {
      parts.push(`Тематична спрямованість: ${formData.thematicOrientation78}`);
    }
    
    if (formData.pedagogicalGoal78) {
      parts.push(`Педагогічна мета: ${formData.pedagogicalGoal78}`);
    }
    
    if (formData.assessmentMethod78) {
      parts.push(`Метод оцінювання: ${formData.assessmentMethod78}`);
    }
    
    if (formData.audioSettings78 && formData.audioSettings78.length > 0) {
      parts.push(`Аудіо налаштування: ${formData.audioSettings78.join(', ')}`);
    }
    
    if (formData.interactionType78) {
      parts.push(`Тип взаємодії: ${formData.interactionType78}`);
    }
    
    if (formData.presentationStyle78) {
      parts.push(`Стиль подачі: ${formData.presentationStyle78}`);
    }
    
    if (formData.socialFormat78) {
      parts.push(`Соціальний формат: ${formData.socialFormat78}`);
    }
    
    if (formData.platform78 && formData.platform78.length > 0) {
      parts.push(`Платформа: ${formData.platform78.join(', ')}`);
    }
    
    if (formData.visualStyle78) {
      parts.push(`Візуальний стиль: ${formData.visualStyle78}`);
    }
    
    if (formData.educationalProgram78) {
      parts.push(`Програма навчання: ${formData.educationalProgram78}`);
    }
    
    if (formData.competencies78 && formData.competencies78.length > 0) {
      parts.push(`Компетентності: ${formData.competencies78.join(', ')}`);
    }
    
    parts.push(`
Урок повинен включати:
- Детальний план заняття з урахуванням всіх обраних параметрів
- Пояснення матеріалу відповідно до рівня розвитку дітей 7-8 років
- Інтерактивні елементи та завдання згідно з обраним типом взаємодії
- Практичні завдання, що розвивають обрані навички
- Система оцінювання відповідно до обраного методу
- Адаптацію під обраний соціальний формат та стиль подачі
- Візуальне оформлення та аудіо-супровід згідно з налаштуваннями
- Відповідність освітнім стандартам обраної програми навчання

Особливості для віку 7-8 років:
- Увага: 10-15 хвилин на завдання
- Читання: 30-80 слів за хвилину
- Письмо: прості речення, базова граматика
- Математика: числа до 100, прості операції
- Соціальні навички: можуть працювати в парах та малих групах
- Мотивація: прагнуть успіху та визнання
- Правила: розуміють та дотримуються інструкцій
- Самостійність: можуть виконувати завдання без постійного контролю
- Цікавість: хочуть дізнатися "чому" та "як"

Адаптуй зміст під когнітивні можливості та навчальну програму молодших школярів 7-8 років.`);
    
    return parts.join('\n\n');
  }

  private generatePromptFor9to10(formData: FormData): string {
    const parts = [];
    
    parts.push(`Створи детальний урок для дітей віком 9-10 років (старші школярі).`);
    
    if (formData.subject910) {
      parts.push(`Предмет: ${formData.subject910}`);
    }
    if (formData.topic) {
      parts.push(`Додаткова тема: ${formData.topic}`);
    }
    
    if (formData.complexity910) {
      parts.push(`Складність: ${formData.complexity910}`);
    }
    
    if (formData.taskTypes910 && formData.taskTypes910.length > 0) {
      parts.push(`Типи завдань: ${formData.taskTypes910.join(', ')}`);
    }
    
    if (formData.learningGoal910) {
      parts.push(`Навчальна мета: ${formData.learningGoal910}`);
    }
    
    if (formData.lessonDuration910) {
      parts.push(`Тривалість заняття: ${formData.lessonDuration910}`);
    }
    
    if (formData.thematicOrientation910) {
      parts.push(`Тематичне спрямування: ${formData.thematicOrientation910}`);
    }
    
    if (formData.pedagogicalApproach910) {
      parts.push(`Педагогічний підхід: ${formData.pedagogicalApproach910}`);
    }
    
    if (formData.independenceLevel910) {
      parts.push(`Рівень самостійності: ${formData.independenceLevel910}`);
    }
    
    if (formData.gradingSystem910) {
      parts.push(`Система оцінювання: ${formData.gradingSystem910}`);
    }
    
    if (formData.digitalTools910 && formData.digitalTools910.length > 0) {
      parts.push(`Цифрові інструменти: ${formData.digitalTools910.join(', ')}`);
    }
    
    if (formData.visualDesign910) {
      parts.push(`Візуальне оформлення: ${formData.visualDesign910}`);
    }
    
    if (formData.audioSettings910) {
      parts.push(`Аудіо налаштування: ${formData.audioSettings910}`);
    }
    
    if (formData.interactionFormat910) {
      parts.push(`Формат взаємодії: ${formData.interactionFormat910}`);
    }
    
    if (formData.studentRole910) {
      parts.push(`Роль учня: ${formData.studentRole910}`);
    }
    
    if (formData.educationalProgram910) {
      parts.push(`Освітня програма: ${formData.educationalProgram910}`);
    }
    
    if (formData.keyCompetencies910 && formData.keyCompetencies910.length > 0) {
      parts.push(`Ключові компетентності: ${formData.keyCompetencies910.join(', ')}`);
    }
    
    parts.push(`
Урок повинен включати:
- Детальний план заняття з урахуванням всіх обраних параметрів
- Пояснення матеріалу відповідно до рівня розвитку дітей 9-10 років
- Складні завдання що розвивають критичне мислення та аналітичні навички
- Інтерактивні елементи відповідно до обраного формату взаємодії
- Практичні завдання з використанням обраних цифрових інструментів
- Система оцінювання відповідно до обраної методики
- Адаптацію під обраний педагогічний підхід та рівень самостійності
- Візуальне оформлення та аудіо-супровід згідно з налаштуваннями
- Відповідність освітнім стандартам обраної програми навчання

Особливості для віку 9-10 років:
- Увага: 15-25 хвилин на завдання
- Читання: 120-180 слів за хвилину з повним розумінням
- Письмо: складні тексти, есе, дослідження
- Математика: складні операції, початки алгебри
- Абстрактне мислення: розуміють складні поняття
- Критичний аналіз: можуть оцінювати інформацію
- Планування: здатні до довгострокового планування
- Дослідження: пошук, аналіз, синтез інформації
- Лідерство: можуть керувати проєктами
- Співпраця: ефективна командна робота
- Відповідальність: самостійне виконання завдань
- Мотивація: прагнуть автономії та майстерності

Адаптуй зміст під когнітивні можливості та академічні потреби старших школярів 9-10 років.`);
    
    return parts.join('\n\n');
  }
}

// === SOLID: SRP - Singleton instance ===
export const promptGenerator = new PromptGeneratorService(); 