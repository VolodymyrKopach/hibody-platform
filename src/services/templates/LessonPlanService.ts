import { LessonPlanRequest, LessonPlanResponse } from '@/types/templates';

export class LessonPlanService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/templates/lesson-plan') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate a lesson plan based on template data
   */
  async generateLessonPlan(request: LessonPlanRequest): Promise<string> {
    try {
      console.log('🎯 LESSON PLAN SERVICE: Starting lesson plan generation', {
        ageGroup: request.ageGroup,
        topic: request.topic,
        slideCount: request.slideCount,
        hasAdditionalInfo: !!request.additionalInfo
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: LessonPlanResponse = await response.json();

      if (!response.ok) {
        console.error('❌ LESSON PLAN SERVICE: API error', {
          status: response.status,
          error: data.error
        });
        
        throw new LessonPlanServiceError(
          data.error?.message || 'Failed to generate lesson plan',
          response.status,
          data.error?.code
        );
      }

      if (!data.success || !data.plan) {
        console.error('❌ LESSON PLAN SERVICE: Invalid response', data);
        throw new LessonPlanServiceError(
          'Invalid response from lesson plan service',
          500,
          'INVALID_RESPONSE'
        );
      }

      console.log('✅ LESSON PLAN SERVICE: Lesson plan generated successfully', {
        planLength: data.plan.length
      });

      return data.plan;

    } catch (error) {
      console.error('❌ LESSON PLAN SERVICE: Error generating lesson plan:', error);
      
      if (error instanceof LessonPlanServiceError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new LessonPlanServiceError(
          'Network error. Please check your connection and try again.',
          0,
          'NETWORK_ERROR'
        );
      }
      
      // Handle other errors
      throw new LessonPlanServiceError(
        'An unexpected error occurred while generating the lesson plan',
        500,
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Validate lesson plan request data
   */
  validateRequest(request: LessonPlanRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.ageGroup?.trim()) {
      errors.push('Age group is required');
    }

    if (!request.topic?.trim()) {
      errors.push('Topic is required');
    }

    if (!request.slideCount || request.slideCount < 1 || request.slideCount > 20) {
      errors.push('Slide count must be between 1 and 20');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Custom error class for lesson plan service
 */
export class LessonPlanServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'LessonPlanServiceError';
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
        return 'Please log in to generate lesson plans';
      case 'VALIDATION_ERROR':
        return this.message;
      case 'CONFIG_ERROR':
        return 'Service is temporarily unavailable. Please try again later.';
      case 'NETWORK_ERROR':
        return 'Connection error. Please check your internet and try again.';
      case 'GENERATION_ERROR':
        return 'Failed to generate lesson plan. Please try again with different parameters.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

// Export singleton instance
export const lessonPlanService = new LessonPlanService();
