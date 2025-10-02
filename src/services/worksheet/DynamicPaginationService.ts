/**
 * Dynamic Pagination Service
 * 
 * SMART PAGINATION ALGORITHM:
 * Instead of guessing component heights, this service:
 * 1. Renders all components in hidden container
 * 2. Measures REAL heights from DOM
 * 3. Groups components into pages based on actual measurements
 * 4. Returns properly paginated content
 * 
 * This is the CORRECT approach - measure first, paginate second.
 */

import { GeneratedElement, GeneratedPage } from '@/types/worksheet-generation';
import { PageConfig, PAGE_CONFIGS } from './ContentPaginationService';

export interface MeasuredElement extends GeneratedElement {
  measuredHeight: number; // Real height from DOM
  elementId: string; // Temporary ID for measurement
}

export interface DynamicPaginationResult {
  pages: GeneratedPage[];
  totalPages: number;
  elementsPerPage: number[];
  measurementLog: Array<{
    elementType: string;
    estimatedHeight: number;
    measuredHeight: number;
    difference: number;
  }>;
}

export class DynamicPaginationService {
  private pageConfig: PageConfig;
  private measurementContainer: HTMLDivElement | null = null;

  constructor(pageConfig: PageConfig = PAGE_CONFIGS.A4) {
    this.pageConfig = pageConfig;
  }

  /**
   * Main pagination method with real DOM measurements
   * 
   * ALGORITHM:
   * 1. Create hidden measurement container
   * 2. Render all components inside it
   * 3. Measure real heights
   * 4. Clean up measurement container
   * 5. Group into pages based on real measurements
   */
  async paginateWithMeasurements(
    elements: GeneratedElement[],
    renderFunction: (element: GeneratedElement, container: HTMLElement) => void,
    pageTitle?: string
  ): Promise<DynamicPaginationResult> {
    console.log('📐 DYNAMIC PAGINATION: Starting measurement-based pagination...');
    console.log(`📐 Total elements to measure: ${elements.length}`);

    try {
      // Step 1: Create measurement container
      this.createMeasurementContainer();

      // Step 2: Measure all elements
      const measuredElements = await this.measureElements(elements, renderFunction);

      // Step 3: Clean up measurement container
      this.cleanupMeasurementContainer();

      // Step 4: Group into pages
      const result = this.groupIntoPages(measuredElements, pageTitle);

      console.log('✅ DYNAMIC PAGINATION: Complete!');
      console.log(`📊 Created ${result.totalPages} pages`);
      console.log(`📊 Elements per page: ${result.elementsPerPage.join(', ')}`);

      return result;
    } catch (error) {
      console.error('❌ DYNAMIC PAGINATION: Failed:', error);
      this.cleanupMeasurementContainer();
      throw error;
    }
  }

  /**
   * Create hidden container for measurements
   * Container is positioned off-screen but fully rendered
   */
  private createMeasurementContainer(): void {
    if (this.measurementContainer) {
      return; // Already exists
    }

    console.log('📐 Creating measurement container...');

    const container = document.createElement('div');
    container.id = 'worksheet-measurement-container';
    container.style.cssText = `
      position: absolute;
      top: -99999px;
      left: -99999px;
      width: ${this.pageConfig.width}px;
      visibility: hidden;
      pointer-events: none;
    `;

    document.body.appendChild(container);
    this.measurementContainer = container;

    console.log('✅ Measurement container created');
  }

  /**
   * Measure all elements by rendering them in hidden container
   */
  private async measureElements(
    elements: GeneratedElement[],
    renderFunction: (element: GeneratedElement, container: HTMLElement) => void
  ): Promise<MeasuredElement[]> {
    if (!this.measurementContainer) {
      throw new Error('Measurement container not initialized');
    }

    console.log('📐 Measuring elements...');

    const measuredElements: MeasuredElement[] = [];

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const elementId = `measure-${i}-${Date.now()}`;

      // Create wrapper for this element
      const wrapper = document.createElement('div');
      wrapper.id = elementId;
      wrapper.style.cssText = `
        width: 100%;
        margin: 0;
        padding: 0;
      `;

      this.measurementContainer.appendChild(wrapper);

      // Render element into wrapper
      try {
        renderFunction(element, wrapper);

        // Wait for render to complete
        await this.waitForRender();

        // Measure height
        const height = wrapper.offsetHeight;

        console.log(`  📏 Element ${i + 1}/${elements.length} (${element.type}): ${height}px`);

        measuredElements.push({
          ...element,
          measuredHeight: height,
          elementId,
        });
      } catch (error) {
        console.error(`  ❌ Failed to measure element ${i + 1}:`, error);
        // Fallback to default height
        measuredElements.push({
          ...element,
          measuredHeight: 100,
          elementId,
        });
      }

      // Clean up wrapper
      this.measurementContainer.removeChild(wrapper);
    }

    return measuredElements;
  }

  /**
   * Wait for render to complete
   */
  private waitForRender(): Promise<void> {
    return new Promise((resolve) => {
      // Use requestAnimationFrame to wait for next paint
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  }

  /**
   * Group measured elements into pages with smart logical grouping
   * 
   * SMART RULES:
   * 1. Prevent orphan titles (title alone on page)
   * 2. Keep logical groups together (title + instructions + exercise)
   * 3. Move dividers with following content
   * 4. Think like a human would organize content
   */
  private groupIntoPages(
    measuredElements: MeasuredElement[],
    pageTitle?: string
  ): DynamicPaginationResult {
    console.log('📄 Grouping elements into pages with smart logic...');

    const pages: GeneratedPage[] = [];
    const elementsPerPage: number[] = [];
    const measurementLog: DynamicPaginationResult['measurementLog'] = [];

    let currentPage: GeneratedElement[] = [];
    let currentPageHeight = 0;
    let pageNumber = 1;

    const availableHeight = this.getAvailableHeight();
    const margin = 20; // Margin between elements

    console.log(`📄 Available height per page: ${availableHeight}px`);

    for (let i = 0; i < measuredElements.length; i++) {
      const element = measuredElements[i];
      const elementHeight = element.measuredHeight + margin;

      console.log(
        `📄 Processing element ${i + 1}/${measuredElements.length} (${element.type}), ` +
        `height: ${elementHeight}px, ` +
        `current page height: ${currentPageHeight}px`
      );

      // Check if element fits on current page
      if (currentPageHeight + elementHeight <= availableHeight) {
        // Fits on current page
        currentPage.push(element);
        currentPageHeight += elementHeight;
        console.log(`  ✅ Element fits on page ${pageNumber}, new height: ${currentPageHeight}px`);
      } else {
        // Doesn't fit - need to check smart rules
        console.log(`  ⚠️ Element doesn't fit on page ${pageNumber}`);

        // === SMART RULE: Check for orphan prevention ===
        const shouldMoveWithNextElement = this.shouldMoveElementToNextPage(
          currentPage,
          element,
          measuredElements.slice(i + 1),
          availableHeight
        );

        if (shouldMoveWithNextElement) {
          console.log(`  🧠 Smart logic: Moving elements to keep logical grouping`);
          
          // Find how many elements to move
          const elementsToMove = this.findElementsToMove(currentPage, element);
          
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
            
            // Start new page with moved elements + current element
            const movedElementsHeight = elementsToMove.reduce((sum, el) => 
              sum + (el as MeasuredElement).measuredHeight + margin, 0
            );
            currentPage = [...elementsToMove, element];
            currentPageHeight = movedElementsHeight + elementHeight;
            console.log(`  📄 Started new page ${pageNumber} with moved elements + current element`);
          } else {
            // Normal page break
            this.createNormalPageBreak(
              currentPage,
              element,
              elementHeight,
              pages,
              elementsPerPage,
              pageNumber,
              pageTitle
            );
            
            currentPage = [element];
            currentPageHeight = elementHeight;
            pageNumber++;
          }
        } else {
          // Normal page break
          if (currentPage.length > 0) {
            pages.push(this.createPage(currentPage, pageNumber, pageTitle));
            elementsPerPage.push(currentPage.length);
            console.log(`  📝 Created page ${pageNumber} with ${currentPage.length} elements`);
            pageNumber++;
          }

          // Start new page with current element
          currentPage = [element];
          currentPageHeight = elementHeight;
          console.log(`  📄 Started new page ${pageNumber} with element height: ${elementHeight}px`);
        }
      }

      // Log measurement (for debugging)
      measurementLog.push({
        elementType: element.type,
        estimatedHeight: this.estimateHeight(element),
        measuredHeight: element.measuredHeight,
        difference: element.measuredHeight - this.estimateHeight(element),
      });
    }

    // Add last page
    if (currentPage.length > 0) {
      pages.push(this.createPage(currentPage, pageNumber, pageTitle));
      elementsPerPage.push(currentPage.length);
      console.log(`📝 Created final page ${pageNumber} with ${currentPage.length} elements`);
    }

    return {
      pages,
      totalPages: pages.length,
      elementsPerPage,
      measurementLog,
    };
  }

  /**
   * Determine if element should be moved to next page for better logical grouping
   * 
   * SMART RULES:
   * 1. If current page ends with only title/divider - move them
   * 2. If next element is exercise and current ends with title - keep together
   * 3. If next element is instruction and current ends with title - keep together
   * 4. Smart lookahead - if ALL content moves, move title too
   * 5. Title group detection - move entire structural group
   */
  private shouldMoveElementToNextPage(
    currentPage: GeneratedElement[],
    nextElement: GeneratedElement,
    remainingElements: GeneratedElement[],
    availableHeight: number
  ): boolean {
    if (currentPage.length === 0) return false;

    const lastElement = currentPage[currentPage.length - 1];
    const secondLastElement = currentPage.length > 1 ? currentPage[currentPage.length - 2] : null;

    // Rule 1: Orphan title prevention
    // If last element is a title and next is content, move title to next page
    if (this.isTitleElement(lastElement) && this.isContentElement(nextElement)) {
      console.log(`  🧠 Orphan prevention: Title would be alone, moving to next page`);
      return true;
    }

    // Rule 2: Divider + Title orphan prevention
    // If last 2 elements are divider + title, move both
    if (
      secondLastElement &&
      this.isDividerElement(secondLastElement) &&
      this.isTitleElement(lastElement) &&
      this.isContentElement(nextElement)
    ) {
      console.log(`  🧠 Orphan prevention: Divider + Title would be alone, moving both`);
      return true;
    }

    // Rule 3: Instructions orphan prevention
    // If last element is instructions and next is exercise, keep together
    if (this.isInstructionsElement(lastElement) && this.isExerciseElement(nextElement)) {
      console.log(`  🧠 Keep together: Instructions + Exercise should not be split`);
      return true;
    }

    // Rule 4: Smart lookahead - Check if there's a title earlier on page
    // and ALL its related content is moving to next page
    const titleIndex = this.findLastTitleInPage(currentPage);
    if (titleIndex !== -1 && titleIndex < currentPage.length - 1) {
      const elementsAfterTitle = currentPage.slice(titleIndex + 1);
      const hasContentAfterTitle = elementsAfterTitle.some(el => 
        this.isContentElement(el) || this.isExerciseElement(el)
      );

      if (!hasContentAfterTitle && (this.isContentElement(nextElement) || this.isExerciseElement(nextElement))) {
        console.log(`  🧠 Smart lookahead: Title's content is all moving to next page`);
        return true;
      }
    }

    // Rule 5: Title group detection
    if (currentPage.length >= 2) {
      const lastThreeElements = currentPage.slice(-3);
      const hasTitleInGroup = lastThreeElements.some(el => this.isTitleElement(el));
      const hasOnlyStructuralElements = lastThreeElements.every(el => 
        this.isTitleElement(el) || 
        this.isDividerElement(el) || 
        this.isInstructionsElement(el)
      );

      if (hasTitleInGroup && hasOnlyStructuralElements && this.isExerciseElement(nextElement)) {
        console.log(`  🧠 Group detection: Title group without content, exercise coming`);
        return true;
      }
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
   * This method implements smart detection of logical groups:
   * - Find title in current page
   * - Include all structural elements after title (dividers, instructions)
   * - Move entire group to keep it with content
   */
  private findElementsToMove(
    currentPage: GeneratedElement[],
    nextElement: GeneratedElement
  ): GeneratedElement[] {
    if (currentPage.length === 0) return [];

    const lastElement = currentPage[currentPage.length - 1];
    const secondLastElement = currentPage.length > 1 ? currentPage[currentPage.length - 2] : null;

    // Strategy 1: Find title group (title + structural elements)
    const titleIndex = this.findLastTitleInPage(currentPage);
    if (titleIndex !== -1) {
      const elementsAfterTitle = currentPage.slice(titleIndex + 1);
      const allStructural = elementsAfterTitle.every(el =>
        this.isDividerElement(el) || this.isInstructionsElement(el)
      );

      if (allStructural && (this.isContentElement(nextElement) || this.isExerciseElement(nextElement))) {
        const groupToMove = currentPage.slice(titleIndex);
        console.log(`  📦 Moving title group: ${groupToMove.length} elements (title + structural)`);
        return groupToMove;
      }
    }

    // Strategy 2: Check for divider + title pattern at end
    if (
      secondLastElement &&
      this.isDividerElement(secondLastElement) &&
      this.isTitleElement(lastElement)
    ) {
      return [secondLastElement, lastElement];
    }

    // Strategy 3: Check for title alone at end
    if (this.isTitleElement(lastElement)) {
      return [lastElement];
    }

    // Strategy 4: Check for title + instructions pattern
    if (
      this.isInstructionsElement(lastElement) &&
      secondLastElement &&
      this.isTitleElement(secondLastElement)
    ) {
      const thirdLastElement = currentPage.length > 2 ? currentPage[currentPage.length - 3] : null;
      if (thirdLastElement && this.isDividerElement(thirdLastElement)) {
        return [thirdLastElement, secondLastElement, lastElement];
      }
      return [secondLastElement, lastElement];
    }

    // Strategy 5: Check for instructions alone
    if (this.isInstructionsElement(lastElement)) {
      return [lastElement];
    }

    // Strategy 6: Last resort - check last 3 elements for any title
    if (currentPage.length >= 3) {
      const lastThree = currentPage.slice(-3);
      const titleInLastThree = lastThree.findIndex(el => this.isTitleElement(el));
      
      if (titleInLastThree !== -1) {
        const startIndex = currentPage.length - 3 + titleInLastThree;
        return currentPage.slice(startIndex);
      }
    }

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
   * Helper: Check if element is content (body text, tip, etc)
   */
  private isContentElement(element: GeneratedElement): boolean {
    return [
      'body-text',
      'tip-box',
      'warning-box',
      'bullet-list',
      'numbered-list',
      'image-placeholder',
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
      'table',
    ].includes(element.type);
  }

  /**
   * Helper: Create normal page break
   */
  private createNormalPageBreak(
    currentPage: GeneratedElement[],
    element: GeneratedElement,
    elementHeight: number,
    pages: GeneratedPage[],
    elementsPerPage: number[],
    pageNumber: number,
    pageTitle?: string
  ): void {
    if (currentPage.length > 0) {
      pages.push(this.createPage(currentPage, pageNumber, pageTitle));
      elementsPerPage.push(currentPage.length);
      console.log(`  📝 Created page ${pageNumber} with ${currentPage.length} elements`);
    }
  }

  /**
   * Estimate height (for comparison with measured height)
   */
  private estimateHeight(element: GeneratedElement): number {
    // Simple estimation for comparison
    const baseHeights: Record<string, number> = {
      'title-block': 80,
      'body-text': 80,
      'fill-blank': 120,
      'multiple-choice': 150,
      'image-placeholder': 200,
      'instructions-box': 100,
      'tip-box': 80,
      'warning-box': 80,
      'divider': 20,
    };

    return baseHeights[element.type] || 100;
  }

  /**
   * Clean up measurement container
   */
  private cleanupMeasurementContainer(): void {
    if (this.measurementContainer && this.measurementContainer.parentNode) {
      console.log('🧹 Cleaning up measurement container...');
      this.measurementContainer.parentNode.removeChild(this.measurementContainer);
      this.measurementContainer = null;
      console.log('✅ Measurement container removed');
    }
  }

  /**
   * Get available height for content
   */
  private getAvailableHeight(): number {
    return (
      this.pageConfig.height -
      this.pageConfig.padding.top -
      this.pageConfig.padding.bottom
    );
  }

  /**
   * Create page object
   */
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

  /**
   * Set page configuration
   */
  public setPageConfig(config: PageConfig): void {
    this.pageConfig = config;
  }
}

