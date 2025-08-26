/**
 * === Constants Index ===
 * Central export point for all application constants
 */

// Age component templates (now modular)
export {
  AGE_COMPONENT_TEMPLATES,
  AGE_TEMPLATE_DESCRIPTIONS,
  AGE_CONFIGURATIONS,
  getTemplateByAge,
  getTemplateDescription,
  getTemplateConfig,
  getAvailableAgeGroups,
  hasTemplate
} from './templates/index';

export {
  AGE_GROUPS,
  mapAgeGroupToSelectValue,
  mapSelectValueToAgeGroup,
  getAgeGroupSelectOptions
} from './ageGroups';
