/**
 * === Age Component Templates Index ===
 * Composition of all age-specific templates
 * Provides centralized access to templates, descriptions, and configurations
 */

import { AgeGroup } from '@/types/generation';

// Import individual age templates
import { AGE_2_3_TEMPLATE, AGE_2_3_DESCRIPTION, AGE_2_3_CONFIG } from './age-2-3';
import { AGE_4_6_TEMPLATE, AGE_4_6_DESCRIPTION, AGE_4_6_CONFIG } from './age-4-6';
import { AGE_7_8_TEMPLATE, AGE_7_8_DESCRIPTION, AGE_7_8_CONFIG } from './age-7-8';
import { AGE_9_10_TEMPLATE, AGE_9_10_DESCRIPTION, AGE_9_10_CONFIG } from './age-9-10';

/**
 * === Main Templates Record ===
 * Contains all HTML templates for different age groups
 * These templates are used for slide generation and are embedded for production reliability
 */
export const AGE_COMPONENT_TEMPLATES: Record<AgeGroup, string> = {
  '2-3': AGE_2_3_TEMPLATE,
  '4-6': AGE_4_6_TEMPLATE,
  '7-8': AGE_7_8_TEMPLATE,
  '9-10': AGE_9_10_TEMPLATE
};

/**
 * === Template Descriptions ===
 * Descriptions for each age group template
 */
export const AGE_TEMPLATE_DESCRIPTIONS: Record<AgeGroup, string> = {
  '2-3': AGE_2_3_DESCRIPTION,
  '4-6': AGE_4_6_DESCRIPTION,
  '7-8': AGE_7_8_DESCRIPTION,
  '9-10': AGE_9_10_DESCRIPTION
};

/**
 * === Age Configuration ===
 * Configuration settings for each age group
 */
export const AGE_CONFIGURATIONS: Record<AgeGroup, {
  padding: number;
  borderRadius: number;
  fontSize: number;
  buttonSize: number;
  colors: string[];
}> = {
  '2-3': AGE_2_3_CONFIG,
  '4-6': AGE_4_6_CONFIG,
  '7-8': AGE_7_8_CONFIG,
  '9-10': AGE_9_10_CONFIG
};

/**
 * === Template Utilities ===
 * Helper functions for working with templates
 */

/**
 * Get template by age group
 */
export const getTemplateByAge = (ageGroup: AgeGroup): string => {
  return AGE_COMPONENT_TEMPLATES[ageGroup] || AGE_COMPONENT_TEMPLATES['4-6'];
};

/**
 * Get template description by age group
 */
export const getTemplateDescription = (ageGroup: AgeGroup): string => {
  return AGE_TEMPLATE_DESCRIPTIONS[ageGroup] || AGE_TEMPLATE_DESCRIPTIONS['4-6'];
};

/**
 * Get template configuration by age group
 */
export const getTemplateConfig = (ageGroup: AgeGroup) => {
  return AGE_CONFIGURATIONS[ageGroup] || AGE_CONFIGURATIONS['4-6'];
};

/**
 * Get all available age groups
 */
export const getAvailableAgeGroups = (): AgeGroup[] => {
  return Object.keys(AGE_COMPONENT_TEMPLATES) as AgeGroup[];
};

/**
 * Check if age group has template
 */
export const hasTemplate = (ageGroup: string): ageGroup is AgeGroup => {
  return ageGroup in AGE_COMPONENT_TEMPLATES;
};

// Re-export individual templates for direct access if needed
export {
  AGE_2_3_TEMPLATE,
  AGE_2_3_DESCRIPTION,
  AGE_2_3_CONFIG,
  AGE_4_6_TEMPLATE,
  AGE_4_6_DESCRIPTION,
  AGE_4_6_CONFIG,
  AGE_7_8_TEMPLATE,
  AGE_7_8_DESCRIPTION,
  AGE_7_8_CONFIG,
  AGE_9_10_TEMPLATE,
  AGE_9_10_DESCRIPTION,
  AGE_9_10_CONFIG
};
