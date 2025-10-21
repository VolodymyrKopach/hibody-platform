/**
 * Enhanced hook for age-based styling with psychology, feedback, and motivation
 * Now uses RESEARCH-BASED styles from scientific studies! 🔬
 * 
 * Sources:
 * - Miller (1956) / Cowan (2001) - Cognitive Load
 * - Gathercole et al. (2004) - Working Memory in Children
 * - Stuart (2015) - Attention Span by Age
 * - Dweck (2007) - Growth Mindset Praise
 * - Mehta & Zhu (2009) - Color Psychology
 */

import { useMemo } from 'react';
import { AgeStyleName } from '@/types/interactive-age-styles';
import { useAgeStyle, useAgeStyleForAgeGroup } from './useAgeStyle';
import { 
  EnhancedAgeStyle,
  FeedbackPattern,
  MotivationSystem,
  CognitiveLoad,
  getEnhancedAgeStyle,
} from '@/constants/enhanced-age-styles';
import { getResearchBasedAgeStyle } from '@/constants/research-based-age-styles';
import { shouldUseResearchBasedStyles } from '@/config/feature-flags';

interface EnhancedAgeStyleResult {
  // Base age style
  baseStyle: ReturnType<typeof useAgeStyle>;
  
  // Enhanced features
  feedbackPattern: FeedbackPattern;
  motivationSystem: MotivationSystem;
  cognitiveLoad: CognitiveLoad;
  colorPsychology: EnhancedAgeStyle['colorPsychology'];
  emotionalTone: EnhancedAgeStyle['emotionalTone'];
  
  // Utility functions
  getSuccessFeedback: () => FeedbackPattern['onSuccess'];
  getErrorFeedback: () => FeedbackPattern['onError'];
  getInteractionFeedback: () => FeedbackPattern['onInteraction'];
  getEncouragementMessage: () => string;
  getRewardEmoji: (type: 'task' | 'session' | 'special') => string | undefined;
  shouldShowParticles: () => boolean;
  getParticleConfig: () => {
    count: number;
    colors: string[];
    duration: number;
  };
}

/**
 * Main hook for enhanced age-based styling
 * NOW USES RESEARCH-BASED STYLES! 🔬
 * 
 * Changes from original:
 * - ✅ Attention span: 30s → 5min (toddler) - Based on Stuart (2015)
 * - ✅ Max elements: 20 → 9 (teen) - Miller's Law (7±2)
 * - ✅ Praise style: "Супер!" → "Ти старався!" - Dweck (2007) growth mindset
 * - ✅ Particle count: 30 → 25 (toddler) - Less overwhelming
 * - ✅ Colors: Research-based from LoBue (2011) and Mehta (2009)
 * 
 * @param ageStyleName - Explicit age style name (optional)
 * @param ageGroup - Age group for automatic style detection (optional)
 * @param useResearchBased - Use research-based styles (default: true)
 */
export const useEnhancedAgeStyle = (
  ageStyleName?: AgeStyleName,
  ageGroup?: string,
  useResearchBased?: boolean
): EnhancedAgeStyleResult => {
  // Get base style
  const baseStyleFromProp = useAgeStyle(ageStyleName);
  const baseStyleFromGroup = useAgeStyleForAgeGroup(ageGroup);
  const baseStyle = ageStyleName ? baseStyleFromProp : baseStyleFromGroup;
  
  // Determine which styles to use
  const shouldUseResearch = useResearchBased ?? shouldUseResearchBasedStyles();
  
  // Get enhanced style
  const enhancedStyle = useMemo(() => {
    if (shouldUseResearch) {
      return getResearchBasedAgeStyle(baseStyle.id);
    } else {
      return getEnhancedAgeStyle(baseStyle.id);
    }
  }, [baseStyle.id, shouldUseResearch]);
  
  // Utility functions
  const getSuccessFeedback = () => enhancedStyle.feedbackPattern.onSuccess;
  
  const getErrorFeedback = () => enhancedStyle.feedbackPattern.onError;
  
  const getInteractionFeedback = () => enhancedStyle.feedbackPattern.onInteraction;
  
  const getEncouragementMessage = () => {
    const messages = enhancedStyle.motivationSystem.encouragementMessages;
    if (messages.length === 0) return '';
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const getRewardEmoji = (type: 'task' | 'session' | 'special') => {
    const rewards = enhancedStyle.motivationSystem.rewards;
    switch (type) {
      case 'task':
        return rewards.perTask;
      case 'session':
        return rewards.perSession;
      case 'special':
        return rewards.special;
      default:
        return undefined;
    }
  };
  
  const shouldShowParticles = () => {
    return enhancedStyle.feedbackPattern.onSuccess.particles;
  };
  
  const getParticleConfig = () => {
    const success = enhancedStyle.feedbackPattern.onSuccess;
    return {
      count: success.particleCount,
      colors: success.particleColors,
      duration: success.duration,
    };
  };
  
  return {
    baseStyle,
    feedbackPattern: enhancedStyle.feedbackPattern,
    motivationSystem: enhancedStyle.motivationSystem,
    cognitiveLoad: enhancedStyle.cognitiveLoad,
    colorPsychology: enhancedStyle.colorPsychology,
    emotionalTone: enhancedStyle.emotionalTone,
    
    // Utility functions
    getSuccessFeedback,
    getErrorFeedback,
    getInteractionFeedback,
    getEncouragementMessage,
    getRewardEmoji,
    shouldShowParticles,
    getParticleConfig,
  };
};

/**
 * Hook specifically for feedback animations
 * Useful for interactive components that need feedback
 */
export const useFeedbackAnimation = (ageStyleName?: AgeStyleName) => {
  const { feedbackPattern } = useEnhancedAgeStyle(ageStyleName);
  
  return {
    success: feedbackPattern.onSuccess,
    error: feedbackPattern.onError,
    interaction: feedbackPattern.onInteraction,
  };
};

/**
 * Hook specifically for motivation system
 * Useful for tracking progress and rewards
 */
export const useMotivationSystem = (ageStyleName?: AgeStyleName) => {
  const { motivationSystem } = useEnhancedAgeStyle(ageStyleName);
  
  return motivationSystem;
};

