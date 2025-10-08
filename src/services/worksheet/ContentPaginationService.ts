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
  overflowElements: number; // Elements that couldn't fit
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

  constructor(pageConfig: PageConfig = PAGE_CONFIGS.A4) {
    this.pageConfig = pageConfig;
  }
  
  /**
   * Set age range for age-based component sizing
   */
  public setAgeRange(ageRange: string): void {
    this.ageRange = ageRange;
  }

  // === SOLID: SRP - Main pagination method ===
  /**
   * Automatically paginate content based on element sizes
   * Elements are placed on pages intelligently:
   * 1. Try to fit element on current page
   * 2. If it doesn't fit and is atomic (not splittable), move to next page
   * 3. Track cumulative height to know when page is full
   */
  public paginateContent(
    elements: GeneratedElement[],
    pageTitle?: string
  ): PaginationResult {
    console.log('📄 PAGINATION: Starting smart pagination...');
    console.log(`📄 PAGINATION: Total elements to paginate: ${elements.length}`);
    
    const pages: GeneratedPage[] = [];
    const elementsPerPage: number[] = [];
    let currentPage: GeneratedElement[] = [];
    let currentPageHeight = 0;
    let pageNumber = 1;

    // === SOLID: SRP - Calculate available height ===
    const availableHeight = this.getAvailableHeight();
    
    console.log(`📄 PAGINATION: Available height per page: ${availableHeight}px`);

    // === SOLID: SRP - Enhance elements with metadata ===
    const positionedElements = this.enhanceElementsWithMetadata(elements);

    // === SOLID: SRP - Distribute elements across pages ===
    for (let i = 0; i < positionedElements.length; i++) {
      const element = positionedElements[i];
      const elementHeight = this.getElementHeight(element);
      
      console.log(`📄 PAGINATION: Processing element ${i + 1}/${positionedElements.length} (${element.type}), height: ${elementHeight}px, current page height: ${currentPageHeight}px`);

      // === SOLID: SRP - Check if element fits on current page ===
      if (currentPageHeight + elementHeight <= availableHeight) {
        // Element fits on current page
        currentPage.push(element);
        currentPageHeight += elementHeight;
        console.log(`  ✅ Element fits on page ${pageNumber}, new height: ${currentPageHeight}px`);
      } else {
        // Element doesn't fit
        console.log(`  ⚠️ Element doesn't fit on page ${pageNumber}`);
        
        // === SMART LOGIC: Check if we should move some elements for better grouping ===
        const shouldApplySmartLogic = this.shouldMoveElementsForBetterGrouping(
          currentPage,
          element,
          positionedElements.slice(i + 1)
        );

        if (shouldApplySmartLogic) {
          console.log(`  🧠 Smart logic: Applying orphan prevention`);
          
          const elementsToMove = this.findElementsToMoveToNextPage(currentPage, element);
          
          if (elementsToMove.length > 0) {
            console.log(`  📦 Moving ${elementsToMove.length} element(s) to next page for better grouping`);
            
            // Remove elements to move from current page
            const remainingElements = currentPage.slice(0, currentPage.length - elementsToMove.length);
            
            // Save current page (without moved elements)
            if (remainingElements.length > 0) {
              pages.push(this.createPage(remainingElements, pageNumber, pageTitle));
              elementsPerPage.push(remainingElements.length);
              console.log(`  📝 Created page ${pageNumber} with ${remainingElements.length} elements`);
              pageNumber++;
            }
            
            // Calculate height of moved elements
            const movedElementsHeight = elementsToMove.reduce((sum, el) => 
              sum + this.getElementHeight(el as PositionedElement), 0
            );
            
            // Start new page with moved elements + current element
            currentPage = [...elementsToMove, element];
            currentPageHeight = movedElementsHeight + elementHeight;
            console.log(`  📄 Started new page ${pageNumber} with moved elements + current element`);
            continue;
          }
        }
        
        // === SOLID: SRP - Save current page if it has elements ===
        if (currentPage.length > 0) {
          pages.push(this.createPage(currentPage, pageNumber, pageTitle));
          elementsPerPage.push(currentPage.length);
          console.log(`  📝 Created page ${pageNumber} with ${currentPage.length} elements`);
          pageNumber++;
        }
        
        // === SOLID: SRP - Start new page with current element ===
        currentPage = [element];
        currentPageHeight = elementHeight;
        console.log(`  📄 Started new page ${pageNumber} with element height: ${elementHeight}px`);
      }
    }

    // === SOLID: SRP - Add last page if it has elements ===
    if (currentPage.length > 0) {
      pages.push(this.createPage(currentPage, pageNumber, pageTitle));
      elementsPerPage.push(currentPage.length);
      console.log(`📝 Created final page ${pageNumber} with ${currentPage.length} elements`);
    }

    console.log(`✅ PAGINATION: Complete! Created ${pages.length} pages`);
    console.log(`📊 PAGINATION: Elements per page: ${elementsPerPage.join(', ')}`);

    return {
      pages,
      totalPages: pages.length,
      elementsPerPage,
      overflowElements: 0, // We don't have overflow in this implementation
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

  // === SOLID: SRP - Enhance elements with metadata ===
  private enhanceElementsWithMetadata(
    elements: GeneratedElement[]
  ): PositionedElement[] {
    return elements.map((element) => ({
      ...element,
      calculatedHeight: this.estimateElementHeight(element),
      isSplittable: this.isElementSplittable(element),
    }));
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

  // === SOLID: SRP - Get content length from element ===
  private getContentLength(element: GeneratedElement): number {
    const props = element.properties || {};
    let length = 0;
    
    // Check various content properties
    if (props.text) length += props.text.length;
    if (props.content) length += props.content.length;
    if (props.question) length += props.question.length;
    if (props.options && Array.isArray(props.options)) {
      length += props.options.reduce((sum: number, opt: any) => {
        return sum + (typeof opt === 'string' ? opt.length : opt.text?.length || 0);
      }, 0);
    }
    
    return length;
  }

  // === SOLID: SRP - Check if element can be split across pages ===
  private isElementSplittable(element: GeneratedElement): boolean {
    // Most atomic components should NOT be split
    const nonSplittableTypes = [
      'fill-blank',
      'multiple-choice',
      'match-pairs',
      'true-false',
      'short-answer',
      'word-bank',
      'image-block',
      'image-with-caption',
      'box',
      'title-block',
      'subtitle-block',
    ];
    
    // Only long text blocks might be splittable in the future
    const splittableTypes = ['paragraph-block'];
    
    return splittableTypes.includes(element.type);
  }

  // === SOLID: SRP - Get element height (from metadata or estimate) ===
  private getElementHeight(element: PositionedElement): number {
    return element.calculatedHeight || this.estimateElementHeight(element);
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

  // === SMART PAGINATION LOGIC ===
  // These methods implement intelligent grouping to prevent orphans and keep related content together

  /**
   * Check if we should move elements for better logical grouping
   * 
   * ENHANCED SMART RULES (Priority Order):
   * 
   * PRIORITY 1 - Prevent Orphan Structural Elements:
   *   1.1. Title alone would be orphaned → Move title
   *   1.2. Divider + Title would be orphaned → Move both
   *   1.3. Divider alone would be orphaned → Move divider
   * 
   * PRIORITY 2 - Keep Logical Pairs Together:
   *   2.1. Instructions + Exercise → Keep together
   *   2.2. Title + Instructions → Keep together (if exercise follows)
   *   2.3. Title + Content (first paragraph) → Keep together
   * 
   * PRIORITY 3 - Smart Lookahead (Multi-Element):
   *   3.1. If title's ALL content moves → Move title too
   *   3.2. If next 2+ elements are related → Check grouping
   *   3.3. If section starts (title + structural) → Move whole section start
   * 
   * PRIORITY 4 - Activity Block Detection:
   *   4.1. Title + Instructions + Exercise = atomic activity → Keep together
   *   4.2. Multiple exercises under one title → Keep at least first exercise with title
   */
  private shouldMoveElementsForBetterGrouping(
    currentPage: GeneratedElement[],
    nextElement: GeneratedElement,
    remainingElements: GeneratedElement[]
  ): boolean {
    if (currentPage.length === 0) return false;

    const lastElement = currentPage[currentPage.length - 1];
    const secondLastElement = currentPage.length > 1 ? currentPage[currentPage.length - 2] : null;
    const thirdLastElement = currentPage.length > 2 ? currentPage[currentPage.length - 3] : null;

    // === PRIORITY 1: Prevent Orphan Structural Elements ===
    
    // Rule 1.1: Orphan title prevention
    if (this.isTitleElement(lastElement) && this.isContentOrExerciseElement(nextElement)) {
      console.log(`  🧠 [P1.1] Orphan prevention: Title would be alone`);
      return true;
    }

    // Rule 1.2: Divider + Title orphan prevention
    if (
      secondLastElement &&
      this.isDividerElement(secondLastElement) &&
      this.isTitleElement(lastElement) &&
      this.isContentOrExerciseElement(nextElement)
    ) {
      console.log(`  🧠 [P1.2] Orphan prevention: Divider + Title would be alone`);
      return true;
    }

    // Rule 1.3: Orphan divider prevention
    // If divider is last element and next is title or content, move divider
    if (this.isDividerElement(lastElement) && 
        (this.isTitleElement(nextElement) || this.isContentOrExerciseElement(nextElement))) {
      console.log(`  🧠 [P1.3] Orphan prevention: Divider would be alone`);
      return true;
    }

    // === PRIORITY 2: Keep Logical Pairs Together ===
    
    // Rule 2.1: Instructions + Exercise should stay together
    if (this.isInstructionsElement(lastElement) && this.isExerciseElement(nextElement)) {
      console.log(`  🧠 [P2.1] Keep together: Instructions + Exercise`);
      return true;
    }

    // Rule 2.2: Title + Instructions should stay together (if exercise follows)
    if (
      this.isTitleElement(secondLastElement) &&
      this.isInstructionsElement(lastElement) &&
      this.isExerciseElement(nextElement)
    ) {
      console.log(`  🧠 [P2.2] Keep together: Title + Instructions (exercise follows)`);
      return true;
    }

    // Rule 2.3: Title + First Content paragraph should stay together
    // This is a softer rule - only if next element is very related
    if (
      this.isTitleElement(lastElement) &&
      this.isContentElement(nextElement) &&
      remainingElements.length > 0 &&
      !this.isTitleElement(remainingElements[0])
    ) {
      // Title + content, and more content follows = keep first content with title
      console.log(`  🧠 [P2.3] Keep together: Title + First Content`);
      return true;
    }

    // === PRIORITY 3: Smart Lookahead (Multi-Element) ===
    
    // Rule 3.1: If title's ALL content moves to next page, move title too
    const titleIndex = this.findLastTitleInPage(currentPage);
    if (titleIndex !== -1 && titleIndex < currentPage.length - 1) {
      const elementsAfterTitle = currentPage.slice(titleIndex + 1);
      const hasContentAfterTitle = elementsAfterTitle.some(el => 
        this.isContentElement(el) || this.isExerciseElement(el)
      );

      if (!hasContentAfterTitle && this.isContentOrExerciseElement(nextElement)) {
        console.log(`  🧠 [P3.1] Smart lookahead: Title's content is all moving to next page`);
        return true;
      }
    }

    // Rule 3.2: Lookahead 2 elements - check if next 2 elements form a logical group
    if (remainingElements.length >= 1) {
      const elementAfterNext = remainingElements[0];
      
      // Pattern: Current page ends with title, next is instructions, after that is exercise
      // → Move title to start the logical group on next page
      if (
        this.isTitleElement(lastElement) &&
        this.isInstructionsElement(nextElement) &&
        this.isExerciseElement(elementAfterNext)
      ) {
        console.log(`  🧠 [P3.2] Lookahead detected: Title → Instructions → Exercise group`);
        return true;
      }
    }

    // Rule 3.3: Section start detection (title + multiple structural elements)
    // If last few elements are all structural and next is structural/exercise,
    // it means a new section is starting - move the whole section start
    if (currentPage.length >= 2) {
      const lastThreeElements = currentPage.slice(-3);
      const hasTitleInGroup = lastThreeElements.some(el => this.isTitleElement(el));
      const hasOnlyStructuralElements = lastThreeElements.every(el => 
        this.isTitleElement(el) || 
        this.isDividerElement(el) || 
        this.isInstructionsElement(el)
      );

      if (hasTitleInGroup && hasOnlyStructuralElements && 
          (this.isExerciseElement(nextElement) || this.isContentElement(nextElement))) {
        console.log(`  🧠 [P3.3] Section start detection: Structural group starting new section`);
        return true;
      }
    }

    // === PRIORITY 4: Activity Block Detection ===
    
    // Rule 4.1: Detect complete activity block structure
    // Pattern: Title + Instructions + Exercise = one atomic activity
    if (
      thirdLastElement &&
      secondLastElement &&
      this.isTitleElement(thirdLastElement) &&
      this.isInstructionsElement(secondLastElement) &&
      this.isExerciseElement(lastElement) &&
      this.isExerciseElement(nextElement)
    ) {
      // Multiple exercises under one title - the group is already complete on current page
      // Don't move, let next exercise start new page
      console.log(`  🧠 [P4.1] Activity block complete: Don't move (multiple exercises)`);
      return false;
    }

    // Rule 4.2: If we have title + instructions at end, and exercise coming,
    // this is an incomplete activity block - keep it together
    if (
      secondLastElement &&
      this.isTitleElement(secondLastElement) &&
      this.isInstructionsElement(lastElement) &&
      this.isExerciseElement(nextElement)
    ) {
      console.log(`  🧠 [P4.2] Activity block: Title + Instructions incomplete, exercise coming`);
      return true;
    }

    return false;
  }

  /**
   * Find last title element in current page
   */
  private findLastTitleInPage(currentPage: GeneratedElement[]): number {
    for (let i = currentPage.length - 1; i >= 0; i--) {
      if (this.isTitleElement(currentPage[i])) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Find which elements should be moved to next page
   * 
   * ENHANCED STRATEGIES (Priority Order):
   * 
   * Strategy 1: Activity Block (Title + Instructions + partial content)
   * Strategy 2: Title Group (Title + all structural elements after it)
   * Strategy 3: Structural Pairs (Divider + Title, Title + Instructions, etc.)
   * Strategy 4: Single Structural Element (Title alone, Divider alone, Instructions alone)
   * Strategy 5: Extended Lookahead (Last 3-4 elements with title)
   */
  private findElementsToMoveToNextPage(
    currentPage: GeneratedElement[],
    nextElement: GeneratedElement
  ): GeneratedElement[] {
    if (currentPage.length === 0) return [];

    const lastElement = currentPage[currentPage.length - 1];
    const secondLastElement = currentPage.length > 1 ? currentPage[currentPage.length - 2] : null;
    const thirdLastElement = currentPage.length > 2 ? currentPage[currentPage.length - 3] : null;
    const fourthLastElement = currentPage.length > 3 ? currentPage[currentPage.length - 4] : null;

    // === STRATEGY 1: Activity Block Detection ===
    // Pattern: Divider + Title + Instructions (incomplete activity)
    if (
      thirdLastElement &&
      secondLastElement &&
      this.isDividerElement(thirdLastElement) &&
      this.isTitleElement(secondLastElement) &&
      this.isInstructionsElement(lastElement) &&
      this.isExerciseElement(nextElement)
    ) {
      console.log(`  📦 [S1] Moving activity block start: Divider + Title + Instructions`);
      return [thirdLastElement, secondLastElement, lastElement];
    }

    // Pattern: Title + Instructions (incomplete activity)
    if (
      secondLastElement &&
      this.isTitleElement(secondLastElement) &&
      this.isInstructionsElement(lastElement) &&
      this.isExerciseElement(nextElement)
    ) {
      // Check if there's a divider before title
      if (thirdLastElement && this.isDividerElement(thirdLastElement)) {
        console.log(`  📦 [S1] Moving activity block start: Divider + Title + Instructions`);
        return [thirdLastElement, secondLastElement, lastElement];
      }
      console.log(`  📦 [S1] Moving activity block start: Title + Instructions`);
      return [secondLastElement, lastElement];
    }

    // === STRATEGY 2: Title Group (Title + Structural Elements) ===
    const titleIndex = this.findLastTitleInPage(currentPage);
    if (titleIndex !== -1) {
      const elementsAfterTitle = currentPage.slice(titleIndex + 1);
      
      // Check if everything after title is structural (no content/exercises yet)
      const allStructural = elementsAfterTitle.every(el =>
        this.isDividerElement(el) || this.isInstructionsElement(el)
      );

      // If next element is content/exercise, move entire title group
      if (allStructural && this.isContentOrExerciseElement(nextElement)) {
        const groupToMove = currentPage.slice(titleIndex);
        console.log(`  📦 [S2] Moving title group: ${groupToMove.length} elements (title + structural)`);
        return groupToMove;
      }
    }

    // === STRATEGY 3: Structural Pairs ===
    
    // Pair 3.1: Divider + Title
    if (
      secondLastElement &&
      this.isDividerElement(secondLastElement) &&
      this.isTitleElement(lastElement) &&
      this.isContentOrExerciseElement(nextElement)
    ) {
      console.log(`  📦 [S3.1] Moving pair: Divider + Title`);
      return [secondLastElement, lastElement];
    }

    // Pair 3.2: Title + Instructions (when next is not exercise - softer rule)
    if (
      secondLastElement &&
      this.isTitleElement(secondLastElement) &&
      this.isInstructionsElement(lastElement) &&
      this.isContentElement(nextElement)
    ) {
      console.log(`  📦 [S3.2] Moving pair: Title + Instructions`);
      return [secondLastElement, lastElement];
    }

    // Pair 3.3: Instructions + Content (first paragraph after instructions)
    // This is a very soft rule - only if instructions are very short
    if (
      secondLastElement &&
      this.isInstructionsElement(secondLastElement) &&
      this.isContentElement(lastElement) &&
      this.isExerciseElement(nextElement)
    ) {
      // Only move if the content is likely a short intro, not a full paragraph
      // We'll assume if it's the only content between instructions and exercise
      console.log(`  📦 [S3.3] Moving pair: Instructions + Short Content`);
      return [secondLastElement, lastElement];
    }

    // === STRATEGY 4: Single Structural Elements ===
    
    // Single 4.1: Title alone
    if (this.isTitleElement(lastElement) && this.isContentOrExerciseElement(nextElement)) {
      console.log(`  📦 [S4.1] Moving single: Title`);
      return [lastElement];
    }

    // Single 4.2: Divider alone
    if (this.isDividerElement(lastElement) && 
        (this.isTitleElement(nextElement) || this.isContentOrExerciseElement(nextElement))) {
      console.log(`  📦 [S4.2] Moving single: Divider`);
      return [lastElement];
    }

    // Single 4.3: Instructions alone
    if (this.isInstructionsElement(lastElement) && this.isExerciseElement(nextElement)) {
      console.log(`  📦 [S4.3] Moving single: Instructions`);
      return [lastElement];
    }

    // === STRATEGY 5: Extended Lookahead (Last Resort) ===
    // Look at last 3-4 elements for any title, move everything from title to end
    
    if (currentPage.length >= 4) {
      const lastFour = currentPage.slice(-4);
      const titleInLastFour = lastFour.findIndex(el => this.isTitleElement(el));
      
      if (titleInLastFour !== -1) {
        const startIndex = currentPage.length - 4 + titleInLastFour;
        const groupToMove = currentPage.slice(startIndex);
        
        // Only move if group doesn't contain complete content/exercises
        const hasCompleteContent = groupToMove.some(el => this.isExerciseElement(el));
        if (!hasCompleteContent) {
          console.log(`  📦 [S5] Moving extended group: ${groupToMove.length} elements from title`);
          return groupToMove;
        }
      }
    }

    if (currentPage.length >= 3) {
      const lastThree = currentPage.slice(-3);
      const titleInLastThree = lastThree.findIndex(el => this.isTitleElement(el));
      
      if (titleInLastThree !== -1) {
        const startIndex = currentPage.length - 3 + titleInLastThree;
        const groupToMove = currentPage.slice(startIndex);
        console.log(`  📦 [S5] Moving extended group: ${groupToMove.length} elements from title`);
        return groupToMove;
      }
    }

    // No strategy matched
    return [];
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

