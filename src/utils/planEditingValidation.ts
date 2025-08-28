import { PlanEditRequest, CommentSectionType } from '@/types/templates';

/**
 * Comprehensive validation utilities for plan editing
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface SanitizedComment {
  section: CommentSectionType;
  sectionId?: string;
  instruction: string;
  priority?: 'low' | 'medium' | 'high';
  originalIndex: number;
}

/**
 * Validate and sanitize edit request
 */
export function validateAndSanitizeEditRequest(body: any): {
  isValid: boolean;
  sanitizedRequest?: PlanEditRequest;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic structure validation
  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid request body'],
      warnings: []
    };
  }

  // Validate original plan
  if (!body.originalPlan || typeof body.originalPlan !== 'string') {
    errors.push('Original plan is required and must be a string');
  } else if (body.originalPlan.trim().length < 100) {
    warnings.push('Original plan seems very short, ensure it contains complete lesson plan');
  } else if (body.originalPlan.length > 50000) {
    errors.push('Original plan is too large (max 50,000 characters)');
  }

  // Validate comments array
  if (!Array.isArray(body.comments)) {
    errors.push('Comments must be an array');
  } else {
    if (body.comments.length === 0) {
      errors.push('At least one comment is required');
    }
    
    if (body.comments.length > 20) {
      errors.push('Too many comments (max 20 allowed)');
    }

    // Validate each comment
    const sanitizedComments: SanitizedComment[] = [];
    body.comments.forEach((comment: any, index: number) => {
      const commentErrors = validateComment(comment, index);
      errors.push(...commentErrors.errors);
      warnings.push(...commentErrors.warnings);

      if (commentErrors.isValid) {
        sanitizedComments.push({
          section: comment.section,
          sectionId: comment.sectionId?.toString().trim() || undefined,
          instruction: comment.instruction.trim(),
          priority: comment.priority || 'medium',
          originalIndex: index
        });
      }
    });
  }

  // Validate language
  if (!body.language || !['uk', 'en'].includes(body.language)) {
    errors.push('Language must be "uk" or "en"');
  }

  // Validate preserveStructure flag
  const preserveStructure = body.preserveStructure !== false; // Default to true

  // Validate metadata if provided
  if (body.metadata) {
    if (typeof body.metadata !== 'object') {
      warnings.push('Metadata should be an object, ignoring');
    } else {
      if (body.metadata.ageGroup && typeof body.metadata.ageGroup !== 'string') {
        warnings.push('Metadata ageGroup should be a string');
      }
      if (body.metadata.topic && typeof body.metadata.topic !== 'string') {
        warnings.push('Metadata topic should be a string');
      }
      if (body.metadata.slideCount && typeof body.metadata.slideCount !== 'number') {
        warnings.push('Metadata slideCount should be a number');
      }
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings
    };
  }

  // Create sanitized request
  const sanitizedRequest: PlanEditRequest = {
    originalPlan: body.originalPlan.trim(),
    comments: body.comments.map((comment: any) => ({
      section: comment.section,
      sectionId: comment.sectionId?.toString().trim() || undefined,
      instruction: comment.instruction.trim(),
      priority: comment.priority || 'medium'
    })),
    language: body.language,
    preserveStructure,
    metadata: body.metadata ? {
      ageGroup: body.metadata.ageGroup?.toString() || '',
      topic: body.metadata.topic?.toString() || '',
      slideCount: parseInt(body.metadata.slideCount) || 0
    } : undefined
  };

  return {
    isValid: true,
    sanitizedRequest,
    errors: [],
    warnings
  };
}

/**
 * Validate individual comment
 */
function validateComment(comment: any, index: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const prefix = `Comment ${index + 1}:`;

  // Check comment structure
  if (!comment || typeof comment !== 'object') {
    errors.push(`${prefix} Must be an object`);
    return { isValid: false, errors, warnings, suggestions };
  }

  // Validate instruction
  if (!comment.instruction || typeof comment.instruction !== 'string') {
    errors.push(`${prefix} Instruction is required and must be a string`);
  } else {
    const instruction = comment.instruction.trim();
    
    if (instruction.length === 0) {
      errors.push(`${prefix} Instruction cannot be empty`);
    } else if (instruction.length < 5) {
      warnings.push(`${prefix} Very short instruction might not provide enough context`);
    } else if (instruction.length > 500) {
      errors.push(`${prefix} Instruction too long (max 500 characters)`);
    }

    // Check for potentially problematic instructions
    if (instruction.toLowerCase().includes('delete') || instruction.toLowerCase().includes('remove all')) {
      warnings.push(`${prefix} Destructive instruction detected, ensure this is intentional`);
    }
  }

  // Validate section type
  const validSections: CommentSectionType[] = [
    'slide', 'objective', 'material', 'game', 'recommendation', 'general'
  ];
  
  if (!comment.section || !validSections.includes(comment.section)) {
    errors.push(`${prefix} Invalid section type. Must be one of: ${validSections.join(', ')}`);
  }

  // Validate sectionId if provided
  if (comment.sectionId !== undefined) {
    if (typeof comment.sectionId !== 'string' && typeof comment.sectionId !== 'number') {
      warnings.push(`${prefix} Section ID should be a string or number`);
    } else if (comment.section === 'slide' && comment.sectionId) {
      const slideNum = parseInt(comment.sectionId.toString());
      if (isNaN(slideNum) || slideNum < 1 || slideNum > 50) {
        warnings.push(`${prefix} Slide number should be between 1 and 50`);
      }
    }
  }

  // Validate priority if provided
  if (comment.priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(comment.priority)) {
      warnings.push(`${prefix} Invalid priority, using 'medium' as default`);
    }
  }

  // Suggestions based on section type
  if (comment.section === 'slide' && !comment.sectionId) {
    suggestions.push(`${prefix} Consider specifying slide number for more precise editing`);
  }

  if (comment.section === 'general' && comment.sectionId) {
    suggestions.push(`${prefix} Section ID not needed for general comments`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Detect potential issues with the original plan
 */
export function analyzePlanStructure(plan: string): {
  format: 'json' | 'markdown' | 'unknown';
  hasSlides: boolean;
  slideCount: number;
  hasObjectives: boolean;
  hasMaterials: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let format: 'json' | 'markdown' | 'unknown' = 'unknown';
  let hasSlides = false;
  let slideCount = 0;
  let hasObjectives = false;
  let hasMaterials = false;

  // Detect format
  try {
    JSON.parse(plan);
    format = 'json';
    
    const parsed = JSON.parse(plan);
    if (parsed.slides && Array.isArray(parsed.slides)) {
      hasSlides = true;
      slideCount = parsed.slides.length;
    }
    if (parsed.objectives && Array.isArray(parsed.objectives)) {
      hasObjectives = true;
    }
    if (parsed.materials && Array.isArray(parsed.materials)) {
      hasMaterials = true;
    }
  } catch {
    // Not JSON, check for markdown
    if (plan.includes('#') || plan.includes('##') || plan.includes('###')) {
      format = 'markdown';
      
      // Count slides in markdown
      const slideMatches = plan.match(/###?\s*(?:Slide|Слайд)\s*\d+/gi);
      if (slideMatches) {
        hasSlides = true;
        slideCount = slideMatches.length;
      }
      
      // Check for objectives
      if (plan.includes('🎯') || plan.toLowerCase().includes('objective') || plan.includes('Цілі')) {
        hasObjectives = true;
      }
      
      // Check for materials
      if (plan.includes('📚') || plan.toLowerCase().includes('material') || plan.includes('Матеріали')) {
        hasMaterials = true;
      }
    }
  }

  // Generate warnings
  if (format === 'unknown') {
    warnings.push('Unable to detect plan format (JSON or Markdown)');
  }

  if (!hasSlides) {
    warnings.push('No slides detected in the plan');
  } else if (slideCount === 0) {
    warnings.push('Slides section found but no individual slides detected');
  } else if (slideCount > 20) {
    warnings.push(`Large number of slides detected (${slideCount}), editing might take longer`);
  }

  if (!hasObjectives) {
    warnings.push('No learning objectives detected');
  }

  if (!hasMaterials) {
    warnings.push('No materials section detected');
  }

  return {
    format,
    hasSlides,
    slideCount,
    hasObjectives,
    hasMaterials,
    warnings
  };
}

/**
 * Rate limiting helper
 */
export function checkRateLimit(userIp: string, windowMs: number = 60000, maxRequests: number = 10): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  // This is a simple in-memory rate limiter
  // In production, you'd want to use Redis or similar
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // For demo purposes, always allow (implement proper rate limiting in production)
  return {
    allowed: true,
    remaining: maxRequests - 1,
    resetTime: now + windowMs
  };
}
