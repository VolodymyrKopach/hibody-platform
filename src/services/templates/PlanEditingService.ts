import { 
  PlanComment, 
  PlanEditRequest, 
  PlanEditResponse, 
  CommentValidationResult,
  CommentSectionType 
} from '@/types/templates';

/**
 * Service for handling lesson plan editing through user comments
 * Follows SOLID principles - Single Responsibility for plan editing operations
 */
export class PlanEditingService {
  private baseUrl: string;
  private maxCommentLength = 500;
  private maxCommentsPerRequest = 20;

  constructor(baseUrl: string = '/api/templates/edit-plan') {
    this.baseUrl = baseUrl;
  }

  /**
   * Process user comments and generate edited lesson plan
   */
  async processComments(
    originalPlan: any, // Can be string or object
    comments: PlanComment[],
    metadata?: {
      ageGroup: string;
      topic: string;
      slideCount: number;
    }
  ): Promise<any> { // Return object instead of string
    try {
      console.log('🎯 PLAN EDITING SERVICE: Starting plan editing', {
        commentsCount: comments.length,
        hasOriginalPlan: !!originalPlan,
        planType: typeof originalPlan,
        planLength: originalPlan?.length || 0,
        hasMetadata: !!metadata
      });

      // Validate original plan
      if (!originalPlan) {
        throw new PlanEditingServiceError(
          'Original plan is required',
          400,
          'VALIDATION_ERROR'
        );
      }

      // Convert plan to string for API if it's an object
      let planForAPI: string;
      if (typeof originalPlan === 'string') {
        planForAPI = originalPlan;
      } else if (typeof originalPlan === 'object') {
        planForAPI = JSON.stringify(originalPlan, null, 2);
      } else {
        throw new PlanEditingServiceError(
          'Original plan must be a string or object',
          400,
          'VALIDATION_ERROR'
        );
      }

      // Validate comments before processing
      const validationResult = this.validateComments(comments);
      if (!validationResult.isValid) {
        throw new PlanEditingServiceError(
          `Invalid comments: ${validationResult.errors.join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Build request
      const request: PlanEditRequest = {
        originalPlan: planForAPI, // Use string version for API
        comments: comments.map(comment => ({
          section: comment.sectionType,
          sectionId: comment.sectionId,
          instruction: comment.comment,
          priority: comment.priority
        })),
        language: 'uk', // Default to Ukrainian
        preserveStructure: true,
        metadata
      };

      // Send request to API
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: PlanEditResponse = await response.json();

      if (!response.ok) {
        console.error('❌ PLAN EDITING SERVICE: API error', {
          status: response.status,
          error: data.error
        });
        
        throw new PlanEditingServiceError(
          data.error?.message || 'Failed to edit lesson plan',
          response.status,
          data.error?.code
        );
      }

      if (!data.success || !data.editedPlan) {
        console.error('❌ PLAN EDITING SERVICE: Invalid response', data);
        throw new PlanEditingServiceError(
          'Invalid response from plan editing service',
          500,
          'INVALID_RESPONSE'
        );
      }

      console.log('✅ PLAN EDITING SERVICE: Plan edited successfully', {
        changesCount: data.metadata?.changesCount || 0,
        processingTime: data.metadata?.processingTime || 0
      });

      // Parse response to object
      let editedPlan = data.editedPlan;
      
      // If response is a string (JSON or markdown-wrapped JSON), parse it
      if (typeof editedPlan === 'string') {
        // Extract JSON from markdown if needed
        if (editedPlan.includes('```json')) {
          const jsonMatch = editedPlan.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
            editedPlan = jsonMatch[1];
            console.log('🔄 PLAN EDITING SERVICE: Extracted JSON from markdown wrapper');
          }
        }
        
        // Parse JSON string to object
        try {
          editedPlan = JSON.parse(editedPlan);
          console.log('🔄 PLAN EDITING SERVICE: Parsed JSON string to object');
        } catch (parseError) {
          console.warn('⚠️ PLAN EDITING SERVICE: Could not parse response as JSON, returning as string');
        }
      }

      return editedPlan;

    } catch (error) {
      console.error('❌ PLAN EDITING SERVICE: Error editing plan:', error);
      
      if (error instanceof PlanEditingServiceError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new PlanEditingServiceError(
          'Network error. Please check your connection and try again.',
          0,
          'NETWORK_ERROR'
        );
      }
      
      // Handle other errors
      throw new PlanEditingServiceError(
        'An unexpected error occurred while editing the lesson plan',
        500,
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Validate comments before processing
   */
  validateComments(comments: PlanComment[]): CommentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check comments count
    if (comments.length === 0) {
      errors.push('At least one comment is required');
    }

    if (comments.length > this.maxCommentsPerRequest) {
      errors.push(`Too many comments. Maximum ${this.maxCommentsPerRequest} allowed`);
    }

    // Validate each comment
    comments.forEach((comment, index) => {
      // Check comment text
      if (!comment.comment?.trim()) {
        errors.push(`Comment ${index + 1}: Comment text is required`);
      }

      if (comment.comment && comment.comment.length > this.maxCommentLength) {
        errors.push(`Comment ${index + 1}: Comment too long (max ${this.maxCommentLength} characters)`);
      }

      // Check section type
      if (!this.isValidSectionType(comment.sectionType)) {
        errors.push(`Comment ${index + 1}: Invalid section type "${comment.sectionType}"`);
      }

      // Warnings for better UX
      if (comment.comment && comment.comment.length < 10) {
        warnings.push(`Comment ${index + 1}: Very short comment might not provide enough context`);
      }

      // Suggestions
      if (comment.sectionType === 'slide' && !comment.sectionId) {
        suggestions.push(`Comment ${index + 1}: Consider specifying slide number for more precise editing`);
      }
    });

    // Check for duplicate comments
    const commentTexts = comments.map(c => c.comment.toLowerCase().trim());
    const duplicates = commentTexts.filter((text, index) => commentTexts.indexOf(text) !== index);
    if (duplicates.length > 0) {
      warnings.push('Some comments appear to be duplicates');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Generate a unique comment ID
   */
  generateCommentId(): string {
    return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new comment object with proper defaults
   */
  createComment(
    sectionType: CommentSectionType,
    comment: string,
    sectionId?: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): PlanComment {
    return {
      id: this.generateCommentId(),
      sectionType,
      sectionId,
      comment: comment.trim(),
      timestamp: new Date(),
      status: 'pending',
      priority
    };
  }

  /**
   * Group comments by section for better organization
   */
  groupCommentsBySection(comments: PlanComment[]): Record<CommentSectionType, PlanComment[]> {
    const groups: Record<CommentSectionType, PlanComment[]> = {
      slide: [],
      objective: [],
      material: [],
      game: [],
      recommendation: [],
      general: []
    };

    comments.forEach(comment => {
      if (groups[comment.sectionType]) {
        groups[comment.sectionType].push(comment);
      }
    });

    return groups;
  }

  /**
   * Get comment statistics for UI display
   */
  getCommentStats(comments: PlanComment[]) {
    const total = comments.length;
    const byStatus = comments.reduce((acc, comment) => {
      acc[comment.status] = (acc[comment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySection = comments.reduce((acc, comment) => {
      acc[comment.sectionType] = (acc[comment.sectionType] || 0) + 1;
      return acc;
    }, {} as Record<CommentSectionType, number>);

    const byPriority = comments.reduce((acc, comment) => {
      const priority = comment.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byStatus,
      bySection,
      byPriority
    };
  }

  /**
   * Private helper to validate section types
   */
  private isValidSectionType(sectionType: string): sectionType is CommentSectionType {
    const validTypes: CommentSectionType[] = [
      'slide', 'objective', 'material', 'game', 'recommendation', 'general'
    ];
    return validTypes.includes(sectionType as CommentSectionType);
  }
}

/**
 * Custom error class for plan editing service
 */
export class PlanEditingServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'PlanEditingServiceError';
  }

  /**
   * Check if error is due to authentication issues
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.code === 'AUTH_ERROR';
  }

  /**
   * Check if error is due to validation issues
   */
  isValidationError(): boolean {
    return this.statusCode === 400 || this.code === 'VALIDATION_ERROR';
  }

  /**
   * Check if error is due to server issues
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    switch (this.code) {
      case 'AUTH_ERROR':
        return 'Please log in to edit lesson plans';
      case 'VALIDATION_ERROR':
        return this.message;
      case 'CONFIG_ERROR':
        return 'Service is temporarily unavailable. Please try again later.';
      case 'NETWORK_ERROR':
        return 'Connection error. Please check your internet and try again.';
      case 'PROCESSING_ERROR':
        return 'Failed to process comments. Please try again with different instructions.';
      default:
        return 'An error occurred while editing the plan. Please try again.';
    }
  }
}

// Export singleton instance
export const planEditingService = new PlanEditingService();
