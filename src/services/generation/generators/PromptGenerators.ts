// === SOLID: SRP - Single Responsibility Principle ===
// Кожен генератор відповідає тільки за створення промптів для своєї вікової групи

import { 
  AgeGroup,
  BaseFormData,
  AgeGroup2to3FormData,
  AgeGroup4to6FormData,
  AgeGroup7to8FormData,
  AgeGroup9to10FormData,
  IPromptGenerator
} from '../../../types/generation';

// === SOLID: DIP - Dependency Inversion Principle ===
// Реалізуємо абстракцію IPromptGenerator

export abstract class BasePromptGenerator<T extends BaseFormData> implements IPromptGenerator<T> {
  abstract generatePrompt(ageGroup: AgeGroup, formData: T): string;
  
  protected addSection(parts: string[], title: string, content: string): void {
    if (content.trim()) {
      parts.push(`${title}: ${content}`);
    }
  }
  
  protected addArraySection(parts: string[], title: string, items: string[] | undefined): void {
    if (items && items.length > 0) {
      parts.push(`${title}: ${items.join(', ')}`);
    }
  }
  
  protected addBooleanSection(parts: string[], title: string, value: boolean | undefined): void {
    if (value) {
      parts.push(`${title}: включено`);
    }
  }
}

export class AgeGroup2to3PromptGenerator extends BasePromptGenerator<AgeGroup2to3FormData> {
  generatePrompt(ageGroup: AgeGroup, formData: AgeGroup2to3FormData): string {
    const parts: string[] = [];
    
    parts.push(`Створи детальний урок для дітей віком 2-3 років (активні дошкільнята).`);
    
    this.addSection(parts, 'Ціль заняття', formData.lessonGoal || '');
    this.addArraySection(parts, 'Типи активності', formData.activityType);
    this.addSection(parts, 'Тематика', formData.thematic24 || '');
    this.addSection(parts, 'Додаткова тема', formData.topic || '');
    this.addBooleanSection(parts, 'Аудіо-супровід', formData.audioSupport24);
    this.addSection(parts, 'Рівень складності', formData.complexityLevel24 || '');
    this.addSection(parts, 'Тривалість заняття', formData.lessonDuration24 || '');
    this.addSection(parts, 'Стиль подачі', formData.presentationStyle24 || '');
    this.addSection(parts, 'Формат участі', formData.participationFormat24 || '');
    this.addArraySection(parts, 'Візуальні ефекти', formData.visualEffects);
    this.addSection(parts, 'Швидкість подачі', formData.presentationSpeed24 || '');
    
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
}

export class AgeGroup4to6PromptGenerator extends BasePromptGenerator<AgeGroup4to6FormData> {
  generatePrompt(ageGroup: AgeGroup, formData: AgeGroup4to6FormData): string {
    const parts: string[] = [];
    
    parts.push(`Створи детальний урок для дітей віком 4-6 років (підготовка до школи).`);
    
    this.addSection(parts, 'Тематика', formData.thematic || '');
    this.addSection(parts, 'Додаткова тема', formData.topic || '');
    this.addArraySection(parts, 'Типи завдань', formData.taskTypes);
    this.addSection(parts, 'Мова', formData.language || '');
    this.addSection(parts, 'Навчальна мета', formData.learningGoal || '');
    this.addSection(parts, 'Рівень складності', formData.complexityLevel || '');
    this.addSection(parts, 'Тривалість', formData.lessonDuration || '');
    this.addSection(parts, 'Стиль подачі', formData.presentationStyle || '');
    this.addArraySection(parts, 'Аудіо-супровід', formData.audioSupport);
    this.addSection(parts, 'Формат участі', formData.participationFormat || '');
    this.addArraySection(parts, 'Візуальне оформлення', formData.visualDesign);
    this.addSection(parts, 'Швидкість подачі', formData.presentationSpeed || '');
    this.addSection(parts, 'Тип інтерактивності', formData.interactivity || '');
    this.addSection(parts, 'Освітня програма', formData.educationalProgram || '');
    this.addSection(parts, 'Система оцінювання', formData.gradingSystem || '');
    
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
}

export class AgeGroup7to8PromptGenerator extends BasePromptGenerator<AgeGroup7to8FormData> {
  generatePrompt(ageGroup: AgeGroup, formData: AgeGroup7to8FormData): string {
    const parts: string[] = [];
    
    parts.push(`Створи детальний урок для дітей віком 7-8 років (молодші школярі).`);
    
    this.addSection(parts, 'Предмет', formData.subject78 || '');
    this.addSection(parts, 'Додаткова тема', formData.topic || '');
    this.addArraySection(parts, 'Формат уроку', formData.lessonFormat78);
    this.addArraySection(parts, 'Навички', formData.skills78);
    this.addSection(parts, 'Рівень складності', formData.complexityLevel78 || '');
    this.addSection(parts, 'Тривалість уроку', formData.lessonDuration78 || '');
    this.addSection(parts, 'Тематична спрямованість', formData.thematicOrientation78 || '');
    this.addSection(parts, 'Педагогічна мета', formData.pedagogicalGoal78 || '');
    this.addSection(parts, 'Метод оцінювання', formData.assessmentMethod78 || '');
    this.addArraySection(parts, 'Аудіо налаштування', formData.audioSettings78);
    this.addSection(parts, 'Тип взаємодії', formData.interactionType78 || '');
    this.addSection(parts, 'Стиль подачі', formData.presentationStyle78 || '');
    this.addSection(parts, 'Соціальний формат', formData.socialFormat78 || '');
    this.addArraySection(parts, 'Платформа', formData.platform78);
    this.addSection(parts, 'Візуальний стиль', formData.visualStyle78 || '');
    this.addSection(parts, 'Програма навчання', formData.educationalProgram78 || '');
    this.addArraySection(parts, 'Компетентності', formData.competencies78);
    
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
}

export class AgeGroup9to10PromptGenerator extends BasePromptGenerator<AgeGroup9to10FormData> {
  generatePrompt(ageGroup: AgeGroup, formData: AgeGroup9to10FormData): string {
    const parts: string[] = [];
    
    parts.push(`Створи детальний урок для дітей віком 9-10 років (старші школярі).`);
    
    this.addSection(parts, 'Предмет', formData.subject910 || '');
    this.addSection(parts, 'Додаткова тема', formData.topic || '');
    this.addSection(parts, 'Складність', formData.complexity910 || '');
    this.addArraySection(parts, 'Типи завдань', formData.taskTypes910);
    this.addSection(parts, 'Навчальна мета', formData.learningGoal910 || '');
    this.addSection(parts, 'Тривалість заняття', formData.lessonDuration910 || '');
    this.addSection(parts, 'Тематичне спрямування', formData.thematicOrientation910 || '');
    this.addSection(parts, 'Педагогічний підхід', formData.pedagogicalApproach910 || '');
    this.addSection(parts, 'Рівень самостійності', formData.independenceLevel910 || '');
    this.addSection(parts, 'Система оцінювання', formData.gradingSystem910 || '');
    this.addArraySection(parts, 'Цифрові інструменти', formData.digitalTools910);
    this.addSection(parts, 'Візуальне оформлення', formData.visualDesign910 || '');
    this.addSection(parts, 'Аудіо налаштування', formData.audioSettings910 || '');
    this.addSection(parts, 'Формат взаємодії', formData.interactionFormat910 || '');
    this.addSection(parts, 'Роль учня', formData.studentRole910 || '');
    this.addSection(parts, 'Освітня програма', formData.educationalProgram910 || '');
    this.addArraySection(parts, 'Ключові компетентності', formData.keyCompetencies910);
    
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

// === SOLID: Factory Pattern + DIP ===
// Фабрика для створення генераторів промптів

export class PromptGeneratorFactory {
  static createGenerator(ageGroup: AgeGroup): IPromptGenerator<any> {
    switch (ageGroup) {
      case '2-3':
        return new AgeGroup2to3PromptGenerator();
      case '4-6':
        return new AgeGroup4to6PromptGenerator();
      case '7-8':
        return new AgeGroup7to8PromptGenerator();
      case '9-10':
        return new AgeGroup9to10PromptGenerator();
      default:
        throw new Error(`No prompt generator found for age group: ${ageGroup}`);
    }
  }
} 