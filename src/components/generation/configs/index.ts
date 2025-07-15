/**
 * === SOLID: DIP - Dependency Inversion Principle ===
 * Абстракція для роботи з конфігураціями вікових груп
 */

import { AgeGroup, AgeGroupConfig } from '../../../types/generation';
import { age2to3Config } from './age-2-3-config';
import { age4to6Config } from './age-4-6-config';
import { age7to8Config } from './age-7-8-config';
import { age9to10Config } from './age-9-10-config';

// === SOLID: DIP - Абстракція для провайдера конфігурацій ===
export interface IAgeGroupConfigProvider {
  getConfig(ageGroup: AgeGroup): AgeGroupConfig;
  getAllConfigs(): AgeGroupConfig[];
  getAvailableAgeGroups(): AgeGroup[];
}

// === SOLID: SRP - Конкретна реалізація провайдера ===
export class AgeGroupConfigProvider implements IAgeGroupConfigProvider {
  private readonly configs: Record<AgeGroup, AgeGroupConfig> = {
    '2-3': age2to3Config,
    '4-6': age4to6Config,
    '7-8': age7to8Config,
    '9-10': age9to10Config
  };

  getConfig(ageGroup: AgeGroup): AgeGroupConfig {
    const config = this.configs[ageGroup];
    if (!config) {
      throw new Error(`Configuration for age group ${ageGroup} not found`);
    }
    return config;
  }

  getAllConfigs(): AgeGroupConfig[] {
    return Object.values(this.configs);
  }

  getAvailableAgeGroups(): AgeGroup[] {
    return Object.keys(this.configs) as AgeGroup[];
  }
}

// === SOLID: SRP - Singleton instance ===
export const configProvider = new AgeGroupConfigProvider();

// === Експорт конфігурацій для зручності ===
export { age2to3Config, age4to6Config, age7to8Config, age9to10Config };

// === Допоміжні функції ===
export const getAgeGroupConfig = (ageGroup: AgeGroup): AgeGroupConfig => {
  return configProvider.getConfig(ageGroup);
};

export const getAllAgeGroupConfigs = (): AgeGroupConfig[] => {
  return configProvider.getAllConfigs();
}; 