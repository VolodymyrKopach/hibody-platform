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

// Universal age-based styles for ALL interactive components
export {
  INTERACTIVE_AGE_STYLES,
  TODDLER_STYLE,
  PRESCHOOL_STYLE,
  ELEMENTARY_STYLE,
  MIDDLE_STYLE,
  TEEN_STYLE,
  getAgeStyle,
  getAllAgeStyles,
  getAgeStylesByAge,
  getDefaultAgeStyleForAge,
  isAgeStyleSuitableForAge,
  AGE_STYLE_LABELS,
} from './interactive-age-styles';

// Drag & Drop age-based styles (DEPRECATED - use INTERACTIVE_AGE_STYLES instead)
export {
  DRAG_DROP_AGE_STYLES,
  TODDLER_DRAG_DROP_STYLE,
  PRESCHOOL_DRAG_DROP_STYLE,
  ELEMENTARY_DRAG_DROP_STYLE,
  MIDDLE_DRAG_DROP_STYLE,
  TEEN_DRAG_DROP_STYLE,
  getDragDropStyle,
  getAllDragDropStyles,
  getDragDropStylesByAge,
  getDefaultDragDropStyleForAge,
  isDragDropStyleSuitableForAge,
} from './drag-drop-age-styles';
