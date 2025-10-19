/**
 * Parser that converts AI-generated worksheet JSON into full CanvasElement[]
 * Adds required fields (id, zIndex, position, size, etc.) and validates components
 */

import {
  WorksheetGenerationResponse,
  GeneratedPage,
  GeneratedElement,
  ParsedWorksheet,
  ParsedPage,
} from '@/types/worksheet-generation';
import { CanvasElement } from '@/types/canvas-element';
import { worksheetComponentSchemaService } from './WorksheetComponentSchemaService';

export class WorksheetGenerationParser {
  /**
   * Parse AI response into full worksheet with CanvasElements
   */
  parseWorksheet(response: WorksheetGenerationResponse): ParsedWorksheet {
    console.log('📋 [PARSER] Parsing worksheet response...');

    try {
      const parsedPages: ParsedPage[] = response.pages.map((page, pageIndex) =>
        this.parsePage(page, pageIndex)
      );

      const result: ParsedWorksheet = {
        pages: parsedPages,
        metadata: response.metadata,
      };

      console.log('✅ [PARSER] Worksheet parsed successfully:', {
        pages: result.pages.length,
        totalElements: result.pages.reduce((sum, p) => sum + p.elements.length, 0),
      });

      return result;
    } catch (error) {
      console.error('❌ [PARSER] Parsing failed:', error);
      throw error;
    }
  }

  /**
   * Parse single page
   */
  private parsePage(page: GeneratedPage, pageIndex: number): ParsedPage {
    console.log(`📄 [PARSER] Parsing page ${page.pageNumber}...`);

    const parsedElements: CanvasElement[] = page.elements.map((element, elementIndex) =>
      this.parseElement(element, elementIndex, pageIndex)
    );

    const parsedPage: ParsedPage = {
      pageNumber: page.pageNumber,
      title: page.title || `Page ${page.pageNumber}`,
      pageId: this.generatePageId(pageIndex),
      background: page.background,
      elements: parsedElements,
      pageType: page.pageType || 'pdf', // ✅ Copy pageType from GeneratedPage
      ageGroup: page.ageGroup, // ✅ Copy ageGroup for age-appropriate styling
    };

    console.log(`✅ [PARSER] Page ${page.pageNumber} parsed:`, {
      elements: parsedElements.length,
      types: parsedElements.map((e) => e.type),
    });

    return parsedPage;
  }

  /**
   * Parse single element and convert to CanvasElement
   */
  private parseElement(
    element: GeneratedElement,
    elementIndex: number,
    pageIndex: number
  ): CanvasElement {
    // Validate component type
    const schema = worksheetComponentSchemaService.getSchemaByType(element.type);
    if (!schema) {
      console.warn(`⚠️ [PARSER] Unknown component type: ${element.type}, using default properties`);
    }

    // Validate and fill properties
    const validatedProperties = this.validateAndFillProperties(
      element.type,
      element.properties || {},
      schema
    );

    // Create full CanvasElement
    const canvasElement: CanvasElement = {
      id: this.generateElementId(pageIndex, elementIndex),
      type: element.type as any,
      position: { x: 0, y: 0 }, // Not used in LinearLayout
      size: this.getDefaultSize(element.type),
      properties: validatedProperties,
      zIndex: elementIndex,
      locked: false,
      visible: true,
    };

    return canvasElement;
  }

  /**
   * Validate and fill component properties with defaults
   */
  private validateAndFillProperties(
    type: string,
    properties: any,
    schema: any
  ): any {
    if (!schema) {
      return properties; // Return as-is if no schema
    }

    const validated: any = {};

    // Go through schema properties
    Object.entries(schema.properties).forEach(([propName, propSchema]: [string, any]) => {
      const value = properties[propName];

      if (value !== undefined && value !== null) {
        // Property provided by AI
        validated[propName] = value;
      } else if (propSchema.required) {
        // Required but missing - use default or placeholder
        if (propSchema.default !== undefined) {
          validated[propName] = propSchema.default;
          console.warn(
            `⚠️ [PARSER] Missing required property "${propName}" for ${type}, using default:`,
            propSchema.default
          );
        } else {
          // Create placeholder for required property
          validated[propName] = this.createPlaceholder(propSchema.type, propName);
          console.warn(
            `⚠️ [PARSER] Missing required property "${propName}" for ${type}, using placeholder`
          );
        }
      } else if (propSchema.default !== undefined) {
        // Optional with default
        validated[propName] = propSchema.default;
      }
      // Optional without default - skip
    });

    // Add any extra properties from AI that aren't in schema
    Object.entries(properties).forEach(([propName, value]) => {
      if (validated[propName] === undefined) {
        validated[propName] = value;
      }
    });

    return validated;
  }

  /**
   * Create placeholder value for property
   */
  private createPlaceholder(type: string, propName: string): any {
    switch (type) {
      case 'string':
        return `[${propName}]`;
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return null;
    }
  }

  /**
   * Get default size for component type
   */
  private getDefaultSize(type: string): { width: number; height: number } {
    // Default A4 width in pixels (210mm at 96 DPI)
    const a4Width = 794;

    // Component-specific heights
    switch (type) {
      case 'title-block':
        return { width: a4Width, height: 60 };
      case 'body-text':
        return { width: a4Width, height: 80 };
      case 'instructions-box':
        return { width: a4Width, height: 100 };
      case 'fill-blank':
        return { width: a4Width, height: 150 };
      case 'multiple-choice':
        return { width: a4Width, height: 200 };
      case 'true-false':
        return { width: a4Width, height: 150 };
      case 'short-answer':
        return { width: a4Width, height: 180 };
      case 'tip-box':
        return { width: a4Width, height: 90 };
      case 'warning-box':
        return { width: a4Width, height: 90 };
      case 'image-placeholder':
        return { width: a4Width, height: 300 };
      case 'divider':
        return { width: a4Width, height: 20 };
      case 'bullet-list':
        return { width: a4Width, height: 100 };
      case 'numbered-list':
        return { width: a4Width, height: 100 };
      case 'table':
        return { width: a4Width, height: 150 };
      default:
        return { width: a4Width, height: 50 };
    }
  }

  /**
   * Generate unique page ID
   */
  private generatePageId(pageIndex: number): string {
    return `page-${pageIndex}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate unique element ID
   */
  private generateElementId(pageIndex: number, elementIndex: number): string {
    return `element-${pageIndex}-${elementIndex}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Validate entire worksheet structure
   */
  validateWorksheet(parsed: ParsedWorksheet): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check pages exist
    if (!parsed.pages || parsed.pages.length === 0) {
      errors.push('No pages found in worksheet');
      return { isValid: false, errors, warnings };
    }

    // Validate each page
    parsed.pages.forEach((page, pageIndex) => {
      // Check page has title
      if (!page.title || page.title.trim() === '') {
        warnings.push(`Page ${pageIndex + 1}: Missing title`);
      }

      // Check page has elements
      if (!page.elements || page.elements.length === 0) {
        errors.push(`Page ${pageIndex + 1}: No elements found`);
        return;
      }

      // Check first element is title-block
      const firstElement = page.elements[0];
      if (firstElement.type !== 'title-block') {
        warnings.push(
          `Page ${pageIndex + 1}: First element should be title-block, found ${firstElement.type}`
        );
      }

      // Validate each element
      page.elements.forEach((element, elementIndex) => {
        // Check element has required fields
        if (!element.id) {
          errors.push(`Page ${pageIndex + 1}, Element ${elementIndex + 1}: Missing id`);
        }
        if (!element.type) {
          errors.push(`Page ${pageIndex + 1}, Element ${elementIndex + 1}: Missing type`);
        }
        if (!element.properties) {
          errors.push(`Page ${pageIndex + 1}, Element ${elementIndex + 1}: Missing properties`);
        }

        // Check component type is valid
        const schema = worksheetComponentSchemaService.getSchemaByType(element.type);
        if (!schema) {
          warnings.push(
            `Page ${pageIndex + 1}, Element ${elementIndex + 1}: Unknown component type "${element.type}"`
          );
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Singleton instance
export const worksheetGenerationParser = new WorksheetGenerationParser();

