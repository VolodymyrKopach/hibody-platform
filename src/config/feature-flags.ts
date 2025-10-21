/**
 * Feature Flags Configuration
 * Central place for all feature flags
 */

export const FEATURE_FLAGS = {
  // Age-based styling
  USE_RESEARCH_BASED_AGE_STYLES: true,  // ✅ Enabled by default - scientifically accurate!
  
  // A/B Testing
  ENABLE_AGE_STYLE_AB_TEST: false,      // Set to true for A/B testing
  
  // Debug
  SHOW_AGE_STYLE_INDICATOR: true,       // Show which style is active (in dev/selected mode)
  LOG_AGE_STYLE_METRICS: false,         // Log performance metrics
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

/**
 * Get feature flag value
 */
export const getFeatureFlag = (key: FeatureFlagKey): boolean => {
  return FEATURE_FLAGS[key];
};

/**
 * Check if research-based styles should be used
 */
export const shouldUseResearchBasedStyles = (): boolean => {
  return FEATURE_FLAGS.USE_RESEARCH_BASED_AGE_STYLES;
};

/**
 * For A/B testing: determine which group user is in
 * Group A: Research-based styles
 * Group B: Original styles
 */
export const getABTestGroup = (userId?: string): 'A' | 'B' => {
  if (!FEATURE_FLAGS.ENABLE_AGE_STYLE_AB_TEST) {
    return 'A'; // Default to research-based
  }
  
  if (!userId) {
    return 'A';
  }
  
  // Simple hash-based assignment (50/50 split)
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return hash % 2 === 0 ? 'A' : 'B';
};

