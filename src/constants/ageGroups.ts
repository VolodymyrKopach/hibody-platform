/**
 * === Age Groups Constants ===
 * Shared age group definitions for consistent usage across components
 */

export interface AgeGroupOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
  description: string;
  selectValue: string; // Value used in select dropdowns
}

export const AGE_GROUPS: AgeGroupOption[] = [
  {
    id: "2-3",
    label: "2-3 years",
    emoji: "👶",
    color: "#FF6B9D",
    description: "Early Childhood",
    selectValue: "2-3 years"
  },
  {
    id: "4-6", 
    label: "4-6 years",
    emoji: "🧒",
    color: "#4ECDC4",
    description: "Preschool",
    selectValue: "4-6 years"
  },
  {
    id: "7-8",
    label: "7-8 years", 
    emoji: "🎒",
    color: "#45B7D1",
    description: "Primary School",
    selectValue: "7-8 years"
  },
  {
    id: "9-10",
    label: "9-10 years",
    emoji: "🎓", 
    color: "#96CEB4",
    description: "Middle School",
    selectValue: "9-10 years"
  }
];

/**
 * Maps template age group IDs to select dropdown values
 */
export const mapAgeGroupToSelectValue = (templateAgeGroup: string): string => {
  const ageGroup = AGE_GROUPS.find(group => group.id === templateAgeGroup);
  return ageGroup?.selectValue || templateAgeGroup;
};

/**
 * Maps select dropdown values back to template age group IDs
 */
export const mapSelectValueToAgeGroup = (selectValue: string): string => {
  const ageGroup = AGE_GROUPS.find(group => group.selectValue === selectValue);
  return ageGroup?.id || selectValue;
};

/**
 * Get age group options formatted for select dropdowns
 */
export const getAgeGroupSelectOptions = () => {
  return AGE_GROUPS.map(group => ({
    value: group.selectValue,
    label: `${group.emoji} ${group.label} (${group.description.toLowerCase()})`
  }));
};
