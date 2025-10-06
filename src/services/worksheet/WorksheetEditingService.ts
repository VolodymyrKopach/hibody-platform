import {
  WorksheetEditRequest,
  WorksheetEditResponse,
  WorksheetEditTarget,
  WorksheetEditContext,
  WorksheetEditPatch,
  WorksheetEditChange
} from '@/types/worksheet-generation';
import { CanvasElement } from '@/types/canvas-element';

/**
 * Custom error for worksheet editing service
 */
export class WorksheetEditingError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'WorksheetEditingError';
  }
}

/**
 * Service for AI-powered worksheet editing
 */
export class WorksheetEditingService {
  private baseUrl: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor(
    baseUrl: string = '/api/worksheet/edit',
    maxRetries: number = 2,
    retryDelay: number = 1000
  ) {
    this.baseUrl = baseUrl;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  /**
   * Edit a single component
   */
  async editComponent(
    pageId: string,
    elementId: string,
    element: CanvasElement,
    instruction: string,
    context: WorksheetEditContext
  ): Promise<WorksheetEditResponse> {
    console.log('🎯 WorksheetEditingService: Editing component', {
      pageId,
      elementId,
      type: element.type,
      instruction: instruction.substring(0, 100)
    });

    const target: WorksheetEditTarget = {
      type: 'component',
      pageId,
      elementId,
      data: element
    };

    return this.edit(target, instruction, context);
  }

  /**
   * Edit entire page
   */
  async editPage(
    pageId: string,
    pageData: any,
    instruction: string,
    context: WorksheetEditContext
  ): Promise<WorksheetEditResponse> {
    console.log('🎯 WorksheetEditingService: Editing page', {
      pageId,
      instruction: instruction.substring(0, 100)
    });

    const target: WorksheetEditTarget = {
      type: 'page',
      pageId,
      data: pageData
    };

    return this.edit(target, instruction, context);
  }

  /**
   * Main edit method with retry logic
   */
  private async edit(
    target: WorksheetEditTarget,
    instruction: string,
    context: WorksheetEditContext
  ): Promise<WorksheetEditResponse> {
    // Validate inputs
    this.validateEditRequest(target, instruction, context);

    const request: WorksheetEditRequest = {
      editTarget: target,
      instruction,
      context
    };

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        console.log(`📡 Attempt ${attempt + 1}/${this.maxRetries + 1}: Sending edit request...`);

        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        const data: WorksheetEditResponse = await response.json();

        if (!response.ok) {
          throw new WorksheetEditingError(
            data.error || 'Edit request failed',
            response.status,
            'API_ERROR'
          );
        }

        if (!data.success) {
          throw new WorksheetEditingError(
            data.error || 'Edit failed',
            500,
            'EDIT_FAILED'
          );
        }

        console.log('✅ Edit successful:', {
          changesCount: data.changes.length,
          patchKeys: Object.keys(data.patch)
        });

        return data;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Attempt ${attempt + 1} failed:`, error);

        // Don't retry on validation errors (4xx)
        if (error instanceof WorksheetEditingError && 
            error.statusCode && 
            error.statusCode >= 400 && 
            error.statusCode < 500) {
          throw error;
        }

        attempt++;

        // Wait before retrying (except on last attempt)
        if (attempt <= this.maxRetries) {
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }

    // All retries failed
    throw new WorksheetEditingError(
      `Edit failed after ${this.maxRetries + 1} attempts: ${lastError?.message}`,
      500,
      'MAX_RETRIES_EXCEEDED'
    );
  }

  /**
   * Validate edit request
   */
  private validateEditRequest(
    target: WorksheetEditTarget,
    instruction: string,
    context: WorksheetEditContext
  ): void {
    if (!target || !target.type || !target.pageId) {
      throw new WorksheetEditingError(
        'Invalid edit target: missing type or pageId',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (target.type === 'component' && !target.elementId) {
      throw new WorksheetEditingError(
        'Invalid edit target: elementId required for component type',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!instruction || instruction.trim().length === 0) {
      throw new WorksheetEditingError(
        'Instruction cannot be empty',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!context || !context.topic || !context.ageGroup) {
      throw new WorksheetEditingError(
        'Invalid context: missing required fields',
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * Apply patch to component properties
   */
  applyComponentPatch(
    originalProperties: any,
    patch: WorksheetEditPatch
  ): any {
    if (!patch.properties) {
      return originalProperties;
    }

    return {
      ...originalProperties,
      ...patch.properties
    };
  }

  /**
   * Apply patch to page data
   */
  applyPagePatch(
    originalPage: any,
    patch: WorksheetEditPatch
  ): any {
    const updated = { ...originalPage };

    if (patch.title !== undefined) {
      updated.title = patch.title;
    }

    if (patch.elements !== undefined) {
      // Merge elements, preserving URLs from original elements
      updated.elements = this.mergeElementsPreservingUrls(
        originalPage.elements || [],
        patch.elements
      );
    }

    return updated;
  }

  /**
   * Merge new elements with original ones, preserving base64 URLs
   * This prevents losing image data when Gemini doesn't return URLs
   */
  private mergeElementsPreservingUrls(
    originalElements: CanvasElement[],
    patchedElements: CanvasElement[]
  ): CanvasElement[] {
    return patchedElements.map(patchedEl => {
      // Find matching original element by ID
      const originalEl = originalElements.find(el => el.id === patchedEl.id);
      
      if (!originalEl) {
        // New element, return as is
        return patchedEl;
      }

      // If patched element has no url but original does, preserve original url
      if (patchedEl.properties && 
          originalEl.properties && 
          originalEl.properties.url && 
          !patchedEl.properties.url) {
        return {
          ...patchedEl,
          properties: {
            ...patchedEl.properties,
            url: originalEl.properties.url
          }
        };
      }

      return patchedEl;
    });
  }

  /**
   * Sleep helper for retry logic
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Format changes for display
   */
  formatChangesForDisplay(changes: WorksheetEditChange[]): string {
    if (changes.length === 0) {
      return 'Зміни застосовані';
    }

    return changes
      .map(change => `• ${change.description}`)
      .join('\n');
  }
}

// Export singleton instance
export const worksheetEditingService = new WorksheetEditingService();
