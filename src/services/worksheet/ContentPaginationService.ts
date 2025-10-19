/**
 * Content Pagination Service
 * 
 * Smart pagination system that automatically distributes content across pages.
 * Atomic components are never split - if a component doesn't fit on the current page,
 * it's moved entirely to the next page.
 * 
 * SOLID Principles:
 * - SRP: Single responsibility - pagination logic only
 * - OCP: Open for extension (new page sizes, layouts)
 * - LSP: Can be substituted with different pagination strategies
 * - ISP: Focused interface for pagination
 * - DIP: Depends on abstractions (PageConfig, ContentElement)
 */

import { GeneratedElement, GeneratedPage } from '@/types/worksheet-generation';
import { CanvasElement } from '@/types/canvas-element';
import { ageBasedContentService } from './AgeBasedContentService';

// === SOLID: ISP - Interface for page configuration ===
export interface PageConfig {
  width: number; // Page width in pixels
  height: number; // Page height in pixels
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  maxElementsPerPage?: number; // Optional limit
}

// === SOLID: ISP - Interface for pagination result ===
export interface PaginationResult {
  pages: GeneratedPage[];
  totalPages: number;
  elementsPerPage: number[];
  overflowElements: number; // Count of elements with overflow warnings
  overflowWarnings?: Array<{
    element: string;
    expectedHeight: number;
    availableHeight: number;
    overflow: number;
    pageNumber: number;
  }>; // Detailed overflow warnings if any
}

// === SOLID: ISP - Interface for element with position and size ===
interface PositionedElement extends GeneratedElement {
  calculatedHeight?: number; // Estimated height in pixels
  isSplittable?: boolean; // Can this element be split across pages?
}

// === Default page configurations ===
export const PAGE_CONFIGS: Record<string, PageConfig> = {
  A4: {
    width: 794, // A4 width in pixels at 96 DPI
    height: 1123, // A4 height in pixels at 96 DPI
    padding: {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40,
    },
  },
  LETTER: {
    width: 816, // Letter width in pixels at 96 DPI
    height: 1056, // Letter height in pixels at 96 DPI
    padding: {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40,
    },
  },
  SLIDE: {
    width: 1920, // 16:9 slide
    height: 1080,
    padding: {
      top: 60,
      right: 60,
      bottom: 60,
      left: 60,
    },
  },
};

export class ContentPaginationService {
  private pageConfig: PageConfig;
  private ageRange?: string; // For age-based size adjustments
  private contentMode: 'pdf' | 'interactive' = 'pdf'; // Content mode for page type
  
  // Track overflow warnings for elements that exceed page height
  private overflowWarnings: Array<{
    element: string;
    expectedHeight: number;
    availableHeight: number;
    overflow: number;
    pageNumber: number;
  }> = [];

  // === ADVANCED PAGINATION: Safety buffers for accurate height estimation ===
  private static readonly SAFETY_BUFFERS: Record<string, number> = {
    'fill-blank': 1.15,        // +15% for margins
    'multiple-choice': 1.12,   // +12%
    'title-block': 1.20,       // +20% for large margins
    'instructions-box': 1.15,  // +15%
    'divider': 1.10,           // +10%
    'default': 1.12            // +12% default
  };

  private static readonly INTER_ELEMENT_SPACING = 40; // px between elements
  private static readonly PAGE_BOTTOM_MARGIN = 50; // px reserve at bottom

  constructor(pageConfig: PageConfig = PAGE_CONFIGS.A4) {
    this.pageConfig = pageConfig;
  }
  
  /**
   * Set age range for age-based component sizing
   */
  public setAgeRange(ageRange: string): void {
    this.ageRange = ageRange;
  }

  /**
   * Set content mode for page type
   */
  public setContentMode(mode: 'pdf' | 'interactive'): void {
    this.contentMode = mode;
  }

  // === ADVANCED PAGINATION: Pre-calculation Phase ===
  /**
   * Pre-calculate heights for all elements with safety buffers
   * This phase ensures we have accurate height estimates before distribution
   */
  private precalculateHeights(elements: GeneratedElement[]): Array<{
    element: GeneratedElement;
    estimatedHeight: number;
    isStructural: boolean;
    isTitle: boolean;
    isDivider: boolean;
    isContent: boolean;
  }> {
    return elements.map(el => {
      const baseHeight = this.estimateElementHeight(el);
      const buffer = ContentPaginationService.SAFETY_BUFFERS[el.type] || 
                     ContentPaginationService.SAFETY_BUFFERS['default'];
      
      return {
        element: el,
        estimatedHeight: Math.ceil(baseHeight * buffer),
        isStructural: this.isTitleElement(el) || this.isDividerElement(el) || this.isInstructionsElement(el),
        isTitle: this.isTitleElement(el),
        isDivider: this.isDividerElement(el),
        isContent: this.isContentElement(el) || this.isExerciseElement(el)
      };
    });
  }

  // === ADVANCED PAGINATION: Orphan Detection ===
  /**
   * Check if adding element would create orphan situation
   * Orphan = structural element (title/divider) alone without its related content
   */
  private wouldCreateOrphan(
    currentPage: Array<{element: GeneratedElement; estimatedHeight: number; isStructural: boolean}>,
    currentElement: {element: GeneratedElement; estimatedHeight: number; isStructural: boolean; isTitle: boolean; isDivider: boolean},
    nextElement: {element: GeneratedElement; estimatedHeight: number; isContent: boolean} | null,
    availableHeight: number,
    currentPageHeight: number
  ): boolean {
    // If no next element - not an orphan
    if (!nextElement) return false;
    
    // If current element is NOT structural - not an orphan
    if (!currentElement.isStructural) return false;
    
    // If next element is NOT content - not an orphan
    if (!nextElement.isContent) return false;
    
    // Check if there's space for next element
    const heightAfterCurrent = currentPageHeight + currentElement.estimatedHeight;
    const spaceLeft = availableHeight - heightAfterCurrent - ContentPaginationService.INTER_ELEMENT_SPACING;
    
    // If next content won't fit - this is an orphan
    return spaceLeft < nextElement.estimatedHeight;
  }

  /**
   * Extract orphan structural elements from end of page
   * Returns elements that should move to next page
   */
  private extractOrphanElements(currentPage: GeneratedElement[]): GeneratedElement[] {
    if (currentPage.length === 0) return [];
    
    const lastElement = currentPage[currentPage.length - 1];
    const secondLast = currentPage.length > 1 ? currentPage[currentPage.length - 2] : null;
    
    // Case 1: Title alone at end
    if (this.isTitleElement(lastElement)) {
      return [lastElement];
    }
    
    // Case 2: Divider alone at end
    if (this.isDividerElement(lastElement)) {
      return [lastElement];
    }
    
    // Case 3: Divider + Title at end
    if (secondLast && 
        this.isDividerElement(secondLast) && 
        this.isTitleElement(lastElement)) {
      return [secondLast, lastElement];
    }
    
    // Case 4: Instructions alone at end (soft rule)
    if (this.isInstructionsElement(lastElement)) {
      return [lastElement];
    }
    
    return [];
  }

  /**
   * Clean page before saving - remove orphan structural elements from the end
   * Returns: { cleanedPage, orphansToMove }
   */
  private cleanPageBeforeSave(page: GeneratedElement[]): {
    cleanedPage: GeneratedElement[];
    orphansToMove: GeneratedElement[];
  } {
    if (page.length === 0) {
      return { cleanedPage: [], orphansToMove: [] };
    }

    const orphans = this.extractOrphanElements(page);
    
    if (orphans.length > 0) {
      const cleanedPage = page.slice(0, page.length - orphans.length);
      console.log(`  🧹 Cleaning page: removing ${orphans.length} orphan(s) from end`);
      return { cleanedPage, orphansToMove: orphans };
    }
    
    return { cleanedPage: page, orphansToMove: [] };
  }

  /**
   * Validate all pages after distribution
   * Check for overflow and log warnings
   */
  private postValidatePages(pages: GeneratedPage[], availableHeight: number): void {
    pages.forEach((page, idx) => {
      const pageHeight = page.elements.reduce((sum, el) => {
        const elHeight = this.estimateElementHeight(el);
        const spacing = ContentPaginationService.INTER_ELEMENT_SPACING;
        return sum + elHeight + spacing;
      }, 0);
      
      if (pageHeight > availableHeight) {
        const overflow = pageHeight - availableHeight;
        console.warn(`⚠️ Page ${page.pageNumber} overflow: ${pageHeight}px > ${availableHeight}px (${overflow}px over)`);
        
        this.overflowWarnings.push({
          element: `page-${page.pageNumber}`,
          expectedHeight: pageHeight,
          availableHeight,
          overflow,
          pageNumber: page.pageNumber
        });
      } else {
        console.log(`✅ Page ${page.pageNumber} validated: ${pageHeight}/${availableHeight}px`);
      }
    });
  }

  // === ADVANCED PAGINATION: Main Method with Pre-calculation ===
  /**
   * Advanced pagination with pre-calculation, orphan prevention, and post-validation
   * 
   * PHASE 1: Pre-calculate all heights with safety buffers
   * PHASE 2: Smart distribution with orphan prevention
   * PHASE 3: Post-validation to detect any overflows
   */
  public paginateContent(
    elements: GeneratedElement[],
    pageTitle?: string
  ): PaginationResult {
    this.overflowWarnings = [];
    
    console.log('📊 PHASE 1: Pre-calculating heights...');
    const precalculated = this.precalculateHeights(elements);
    
    console.log('📄 PHASE 2: Smart distribution...');
    const pages: GeneratedPage[] = [];
    const elementsPerPage: number[] = [];
    let currentPage: GeneratedElement[] = [];
    let currentPageHeight = 0;
    let pageNumber = 1;
    let pendingOrphans: GeneratedElement[] = []; // Track orphans from previous page
    const availableHeight = this.getAvailableHeight() - ContentPaginationService.PAGE_BOTTOM_MARGIN;
    
    console.log(`📄 Available height per page: ${availableHeight}px`);
    
    for (let i = 0; i < precalculated.length; i++) {
      const current = precalculated[i];
      const next = i < precalculated.length - 1 ? precalculated[i + 1] : null;
      
      // Add pending orphans from previous page at the start
      if (pendingOrphans.length > 0 && currentPage.length === 0) {
        console.log(`  📥 Adding ${pendingOrphans.length} orphan(s) from previous page`);
        currentPage = [...pendingOrphans];
        currentPageHeight = pendingOrphans.reduce((sum, el) => 
          sum + this.estimateElementHeight(el) + ContentPaginationService.INTER_ELEMENT_SPACING, 0
        );
        pendingOrphans = [];
      }
      
      // Calculate total height with spacing
      const heightWithSpacing = current.estimatedHeight + 
        (currentPage.length > 0 ? ContentPaginationService.INTER_ELEMENT_SPACING : 0);
      
      console.log(`  Processing ${i + 1}/${precalculated.length}: ${current.element.type} (${current.estimatedHeight}px)`);
      
      // Check if fits on current page
      if (currentPageHeight + heightWithSpacing <= availableHeight) {
        // Check for orphan situation
        const wouldBeOrphan = this.wouldCreateOrphan(
          precalculated.slice(0, i),
          current,
          next,
          availableHeight,
          currentPageHeight
        );
        
        if (wouldBeOrphan) {
          console.log(`  🚫 Orphan prevention: Moving ${current.element.type} to next page`);
          
          // Clean and save current page
          if (currentPage.length > 0) {
            const { cleanedPage, orphansToMove } = this.cleanPageBeforeSave(currentPage);
            
            if (cleanedPage.length > 0) {
              pages.push(this.createPage(cleanedPage, pageNumber, pageTitle));
              elementsPerPage.push(cleanedPage.length);
              console.log(`  ✅ Page ${pageNumber}: ${cleanedPage.length} elements`);
              pageNumber++;
            }
            
            // Track orphans for next page
            pendingOrphans = orphansToMove;
          }
          
          // Start new page with this element
          currentPage = [current.element];
          currentPageHeight = current.estimatedHeight;
        } else {
          // Add to current page
          currentPage.push(current.element);
          currentPageHeight += heightWithSpacing;
          console.log(`  ✅ Added ${current.element.type} (${currentPageHeight}/${availableHeight}px)`);
        }
      } else {
        // Doesn't fit - new page
        console.log(`  ⚠️ ${current.element.type} doesn't fit, new page`);
        
        // Clean and save current page
        if (currentPage.length > 0) {
          const { cleanedPage, orphansToMove } = this.cleanPageBeforeSave(currentPage);
          
          if (cleanedPage.length > 0) {
            pages.push(this.createPage(cleanedPage, pageNumber, pageTitle));
            elementsPerPage.push(cleanedPage.length);
            console.log(`  ✅ Page ${pageNumber}: ${cleanedPage.length} elements`);
            pageNumber++;
          }
          
          // Start new page with orphans + current element
          currentPage = [...orphansToMove, current.element];
          currentPageHeight = orphansToMove.reduce((sum, el) => 
            sum + this.estimateElementHeight(el) + ContentPaginationService.INTER_ELEMENT_SPACING, 0
          ) + current.estimatedHeight;
        } else {
          // Empty page - just start with current element
          currentPage = [current.element];
          currentPageHeight = current.estimatedHeight;
        }
      }
    }
    
    // Add last page
    if (currentPage.length > 0) {
      // Clean last page too
      const { cleanedPage, orphansToMove } = this.cleanPageBeforeSave(currentPage);
      
      if (cleanedPage.length > 0) {
        pages.push(this.createPage(cleanedPage, pageNumber, pageTitle));
        elementsPerPage.push(cleanedPage.length);
        console.log(`  ✅ Final page ${pageNumber}: ${cleanedPage.length} elements`);
        pageNumber++;
      }
      
      // If there are orphans at the very end, create one more page
      if (orphansToMove.length > 0) {
        console.log(`  ⚠️ Warning: ${orphansToMove.length} orphan(s) at end - creating extra page`);
        pages.push(this.createPage(orphansToMove, pageNumber, pageTitle));
        elementsPerPage.push(orphansToMove.length);
        console.log(`  ✅ Extra page ${pageNumber}: ${orphansToMove.length} elements`);
      }
    }
    
    console.log('✅ PHASE 3: Post-validation...');
    this.postValidatePages(pages, availableHeight);
    
    console.log(`✅ PAGINATION COMPLETE: ${pages.length} pages created`);
    
    return {
      pages,
      totalPages: pages.length,
      elementsPerPage,
      overflowElements: this.overflowWarnings.length,
      overflowWarnings: this.overflowWarnings.length > 0 ? [...this.overflowWarnings] : undefined
    };
  }

  // === SOLID: SRP - Get available content height ===
  private getAvailableHeight(): number {
    return (
      this.pageConfig.height -
      this.pageConfig.padding.top -
      this.pageConfig.padding.bottom
    );
  }

  // === SOLID: SRP - Get available content width ===
  private getAvailableWidth(): number {
    return (
      this.pageConfig.width -
      this.pageConfig.padding.left -
      this.pageConfig.padding.right
    );
  }

  // === SOLID: SRP - Estimate element height based on type ===
  private estimateElementHeight(element: GeneratedElement): number {
    const type = element.type;
    const props = element.properties || {};
    
    // === SPECIAL CASE: fill-blank with items and wordBank ===
    if (type === 'fill-blank') {
      let height = 80; // Base height (instructions + title)
      
      // Add height for each item (~50px per item)
      const items = props.items || [];
      height += items.length * 50;
      
      // Add height for word bank if present
      if (props.wordBank && Array.isArray(props.wordBank) && props.wordBank.length > 0) {
        // Word bank header + word chips
        // Estimate: 40px header + rows of word chips (~40px per row, ~4 words per row)
        const wordBankRows = Math.ceil(props.wordBank.length / 4);
        height += 40 + (wordBankRows * 40);
      }
      
      // Age-based size adjustment
      if (this.ageRange) {
        const sizeMultiplier = ageBasedContentService.getSizeMultiplier(this.ageRange);
        height = height * sizeMultiplier;
      }
      
      console.log(`  📏 fill-blank height: ${height}px (${items.length} items, ${props.wordBank?.length || 0} words in bank)`);
      return height;
    }
    
    // === SPECIAL CASE: multiple-choice with items ===
    if (type === 'multiple-choice') {
      let height = 60; // Base height
      const items = props.items || [];
      // Each question with options ~80px
      height += items.length * 80;
      
      if (this.ageRange) {
        const sizeMultiplier = ageBasedContentService.getSizeMultiplier(this.ageRange);
        height = height * sizeMultiplier;
      }
      
      return height;
    }
    
    // === SOLID: OCP - Extensible height calculation ===
    const heightMap: Record<string, number> = {
      // Text components
      'title-block': 80,
      'subtitle-block': 60,
      'paragraph-block': 100,
      'text-block': 80,
      'body-text': 80,
      
      // Exercise components (base heights, will be adjusted)
      'fill-blank': 120,
      'multiple-choice': 150,
      'match-pairs': 180,
      'true-false': 100,
      'short-answer': 120,
      'word-bank': 140,
      
      // Box components
      'instructions-box': 100,
      'tip-box': 80,
      'warning-box': 80,
      
      // Media components
      'image-block': 200,
      'image-with-caption': 220,
      'image-placeholder': 200,
      
      // Layout components
      'box': 150,
      'divider': 20,
      'spacer': 40,
      
      // Default
      'default': 100,
    };

    let baseHeight = heightMap[type] || heightMap['default'];
    
    // === AGE-BASED SIZE ADJUSTMENT ===
    // Younger children need larger, more spaced components
    if (this.ageRange) {
      const sizeMultiplier = ageBasedContentService.getSizeMultiplier(this.ageRange);
      baseHeight = baseHeight * sizeMultiplier;
    }
    
    // === SOLID: SRP - Adjust height based on content ===
    const contentLength = this.getContentLength(element);
    const contentMultiplier = Math.max(1, Math.ceil(contentLength / 200));
    
    return baseHeight * contentMultiplier;
  }

  /**
   * Safely get string length from any value type
   * Handles null, undefined, numbers, objects, etc.
   * 
   * @param value - Value to get length from
   * @returns Length of string representation
   */
  private safeStringLength(value: any): number {
    if (value === null || value === undefined) return 0;
    
    if (typeof value === 'string') return value.length;
    if (typeof value === 'number') return String(value).length;
    if (typeof value === 'boolean') return String(value).length;
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value).length;
      } catch {
        return 0;
      }
    }
    
    return String(value).length;
  }

  /**
   * Safely extract text from option object
   * Handles various option formats (string, number, object with text/label/value)
   * 
   * @param opt - Option to extract text from
   * @returns Text representation of option
   */
  private getOptionText(opt: any): string {
    if (!opt) return '';
    if (typeof opt === 'string') return opt;
    if (typeof opt === 'number') return String(opt);
    
    if (typeof opt === 'object') {
      // Try different common property names
      const text = opt.text || opt.label || opt.value || opt.content;
      if (text) return String(text);
    }
    
    return '';
  }

  // === SOLID: SRP - Get content length from element ===
  private getContentLength(element: GeneratedElement): number {
    const props = element.properties || {};
    let length = 0;
    
    // ✅ Safe property access with type checking
    length += this.safeStringLength(props.text);
    length += this.safeStringLength(props.content);
    length += this.safeStringLength(props.question);
    length += this.safeStringLength(props.instruction);
    length += this.safeStringLength(props.description);
    
    // ✅ Safe options handling
    if (props.options && Array.isArray(props.options)) {
      length += props.options.reduce((sum: number, opt: any) => {
        return sum + this.safeStringLength(this.getOptionText(opt));
      }, 0);
    }
    
    // ✅ Safe items handling (for exercises)
    if (props.items && Array.isArray(props.items)) {
      length += props.items.reduce((sum: number, item: any) => {
        if (!item) return sum;
        
        let itemLength = 0;
        itemLength += this.safeStringLength(item.text);
        itemLength += this.safeStringLength(item.question);
        itemLength += this.safeStringLength(item.answer);
        
        return sum + itemLength;
      }, 0);
    }
    
    return length;
  }


  /**
   * Scale down element to fit within maxHeight
   * Reduces content while maintaining structure
   * 
   * @param element - Element to scale
   * @param maxHeight - Maximum allowed height
   * @returns Scaled element or original if cannot scale
   */
  private scaleDownElement(
    element: GeneratedElement,
    maxHeight: number
  ): GeneratedElement {
    const elementHeight = this.estimateElementHeight(element);
    
    if (element.type === 'fill-blank') {
      const props = element.properties || {};
      const items = props.items || [];
      const baseHeight = 80; // Base height
      const wordBankHeight = props.wordBank && props.wordBank.length > 0 ? 80 : 0;
      const availableForItems = maxHeight - baseHeight - wordBankHeight;
      const maxItems = Math.floor(availableForItems / 50); // 50px per item
      
      if (items.length > maxItems && maxItems > 0) {
        console.warn(
          `⚠️ Scaling fill-blank from ${items.length} to ${maxItems} items to fit page`
        );
        
        return {
          ...element,
          properties: {
            ...props,
            items: items.slice(0, maxItems),
            _truncated: true,
            _originalItemCount: items.length,
            _truncatedItems: items.slice(maxItems)
          }
        };
      }
    }
    
    if (element.type === 'multiple-choice') {
      const props = element.properties || {};
      const items = props.items || [];
      const maxItems = Math.floor((maxHeight - 60) / 80); // Base 60 + 80 per item
      
      if (items.length > maxItems && maxItems > 0) {
        console.warn(
          `⚠️ Scaling multiple-choice from ${items.length} to ${maxItems} items`
        );
        
        return {
          ...element,
          properties: {
            ...props,
            items: items.slice(0, maxItems),
            _truncated: true,
            _originalItemCount: items.length
          }
        };
      }
    }
    
    // For other types, return as-is with warning
    if (elementHeight > maxHeight) {
      console.warn(
        `⚠️ Element type ${element.type} with height ${elementHeight}px cannot be scaled`
      );
    }
    
    return element;
  }

  // === SOLID: SRP - Create page object ===
  private createPage(
    elements: GeneratedElement[],
    pageNumber: number,
    title?: string
  ): GeneratedPage {
    return {
      pageNumber,
      title: title || `Page ${pageNumber}`,
      elements,
      pageType: this.contentMode, // Set pageType based on contentMode
    };
  }

  // === SOLID: SRP - Set page configuration ===
  public setPageConfig(config: PageConfig): void {
    this.pageConfig = config;
  }

  // === SOLID: SRP - Get current page configuration ===
  public getPageConfig(): PageConfig {
    return { ...this.pageConfig };
  }

  // === SOLID: OCP - Support for custom pagination strategies ===
  /**
   * Paginate with custom strategy
   * This allows extending pagination logic without modifying the base class
   */
  public paginateWithStrategy(
    elements: GeneratedElement[],
    strategy: (
      elements: GeneratedElement[],
      pageConfig: PageConfig
    ) => PaginationResult
  ): PaginationResult {
    return strategy(elements, this.pageConfig);
  }


  /**
   * Helper: Check if element is a title
   */
  private isTitleElement(element: GeneratedElement): boolean {
    return element.type === 'title-block';
  }

  /**
   * Helper: Check if element is a divider
   */
  private isDividerElement(element: GeneratedElement): boolean {
    return element.type === 'divider';
  }

  /**
   * Helper: Check if element is instructions
   */
  private isInstructionsElement(element: GeneratedElement): boolean {
    return element.type === 'instructions-box';
  }

  /**
   * Helper: Check if element is content or exercise
   */
  private isContentOrExerciseElement(element: GeneratedElement): boolean {
    return this.isContentElement(element) || this.isExerciseElement(element);
  }

  /**
   * Helper: Check if element is content (body text, tip, etc)
   */
  private isContentElement(element: GeneratedElement): boolean {
    return [
      'body-text',
      'paragraph-block',
      'text-block',
      'tip-box',
      'warning-box',
      'bullet-list',
      'numbered-list',
      'image-placeholder',
      'image-block',
      'image-with-caption',
    ].includes(element.type);
  }

  /**
   * Helper: Check if element is an exercise
   */
  private isExerciseElement(element: GeneratedElement): boolean {
    return [
      'fill-blank',
      'multiple-choice',
      'true-false',
      'short-answer',
      'match-pairs',
      'word-bank',
      'table',
    ].includes(element.type);
  }
}

// === SOLID: OCP - Export alternative pagination strategies ===

/**
 * Fixed elements per page strategy
 * Simple strategy that puts N elements per page
 */
export function fixedElementsPerPageStrategy(
  elementsPerPage: number
): (elements: GeneratedElement[], pageConfig: PageConfig) => PaginationResult {
  return (elements: GeneratedElement[], pageConfig: PageConfig) => {
    const pages: GeneratedPage[] = [];
    const elementsPerPageArray: number[] = [];
    
    for (let i = 0; i < elements.length; i += elementsPerPage) {
      const pageElements = elements.slice(i, i + elementsPerPage);
      const pageNumber = Math.floor(i / elementsPerPage) + 1;
      
      pages.push({
        pageNumber,
        title: `Page ${pageNumber}`,
        elements: pageElements,
      });
      
      elementsPerPageArray.push(pageElements.length);
    }
    
    return {
      pages,
      totalPages: pages.length,
      elementsPerPage: elementsPerPageArray,
      overflowElements: 0,
    };
  };
}

/**
 * Max elements per page strategy
 * Ensures no page exceeds a maximum number of elements
 */
export function maxElementsPerPageStrategy(
  maxElements: number
): (elements: GeneratedElement[], pageConfig: PageConfig) => PaginationResult {
  return fixedElementsPerPageStrategy(maxElements); // Same implementation
}

