// === SOLID: DIP - Dependency Inversion Principle ===
// Wrapper компонент, який інстанціює залежності та демонструє їх використання

import React, { useMemo } from 'react';
import { AgeGroup, BaseFormData } from '../../types/generation';
import { RefactoredSimpleGenerationForm } from './forms/RefactoredSimpleGenerationForm';

// === SOLID: DIP - Імпортуємо конкретні реалізації ===
import { AgeGroupConfigProvider } from '../../services/generation/configs/AgeGroupConfigProvider';
import { ValidatorFactory } from '../../services/generation/validators/FormValidators';
import { PromptGeneratorFactory } from '../../services/generation/generators/PromptGenerators';

interface SimpleGenerationFormWrapperProps {
  onGenerate: (data: { ageGroup: AgeGroup; formData: BaseFormData; detailedPrompt: string }) => void;
  onPreview: (data: { ageGroup: AgeGroup; formData: BaseFormData }) => void;
}

export const SimpleGenerationFormWrapper: React.FC<SimpleGenerationFormWrapperProps> = ({
  onGenerate,
  onPreview
}) => {
  // === SOLID: DIP - Створюємо залежності ===
  const dependencies = useMemo(() => {
    return {
      configProvider: new AgeGroupConfigProvider(),
      // Для спрощення використовуємо універсальний валідатор
      validator: ValidatorFactory.createValidator('4-6'),
      // Для спрощення використовуємо універсальний генератор
      promptGenerator: PromptGeneratorFactory.createGenerator('4-6')
    };
  }, []);

  return (
    <RefactoredSimpleGenerationForm
      configProvider={dependencies.configProvider}
      validator={dependencies.validator}
      promptGenerator={dependencies.promptGenerator}
      onGenerate={onGenerate}
      onPreview={onPreview}
    />
  );
};

// === SOLID: Factory Pattern ===
// Фабрика для створення wrapper з правильними залежностями

export class SimpleGenerationFormFactory {
  static createFormForAgeGroup(ageGroup: AgeGroup) {
    return {
      configProvider: new AgeGroupConfigProvider(),
      validator: ValidatorFactory.createValidator(ageGroup),
      promptGenerator: PromptGeneratorFactory.createGenerator(ageGroup)
    };
  }
  
  static createUniversalForm() {
    return {
      configProvider: new AgeGroupConfigProvider(),
      validator: ValidatorFactory.createValidator('4-6'),
      promptGenerator: PromptGeneratorFactory.createGenerator('4-6')
    };
  }
} 