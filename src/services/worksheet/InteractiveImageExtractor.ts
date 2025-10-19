/**
 * Utility for extracting and applying image prompts from interactive components
 * Handles nested properties in arrays like items[], pairs[], objects[], etc.
 */

import { CanvasElement } from '@/types/canvas-element';

export interface ImageRequest {
  id: string;
  prompt: string;
  width: number;
  height: number;
  pageIndex: number;
  elementIndex: number;
  propertyPath: string[]; // Path to nested property, e.g., ['properties', 'items', 0, 'imagePrompt']
}

/**
 * Component types that may contain images in nested properties
 */
const INTERACTIVE_COMPONENTS_WITH_IMAGES = [
  'tap-image',
  'simple-drag-drop',
  'sorting-game',
  'sequence-builder',
  'memory-cards',
  'simple-counter',
  'sound-matcher',
  'simple-puzzle',
  'pattern-builder',
  'emotion-recognizer',
  'cause-effect',
];

/**
 * Default image sizes for interactive components (square format for most)
 */
const DEFAULT_IMAGE_SIZES: Record<string, { width: number; height: number }> = {
  'tap-image': { width: 512, height: 512 },
  'simple-drag-drop': { width: 400, height: 400 },
  'sorting-game': { width: 400, height: 400 },
  'sequence-builder': { width: 512, height: 512 },
  'memory-cards': { width: 400, height: 400 },
  'simple-counter': { width: 400, height: 400 },
  'sound-matcher': { width: 400, height: 400 },
  'simple-puzzle': { width: 512, height: 512 },
  'pattern-builder': { width: 400, height: 400 },
  'emotion-recognizer': { width: 400, height: 400 },
  'cause-effect': { width: 400, height: 400 },
};

export class InteractiveImageExtractor {
  /**
   * Check if component type is interactive with images
   */
  isInteractiveComponent(componentType: string): boolean {
    return INTERACTIVE_COMPONENTS_WITH_IMAGES.includes(componentType);
  }

  /**
   * Extract all image prompts from interactive component
   */
  extractFromElement(
    element: CanvasElement,
    pageIndex: number,
    elementIndex: number
  ): ImageRequest[] {
    const requests: ImageRequest[] = [];
    const componentType = element.type;

    if (!this.isInteractiveComponent(componentType)) {
      return requests;
    }

    const props = element.properties || {};
    const defaultSize = DEFAULT_IMAGE_SIZES[componentType] || { width: 400, height: 400 };

    // Handle different component structures
    switch (componentType) {
      case 'tap-image':
        // Single image in properties
        if (props.imagePrompt) {
          requests.push({
            id: `p${pageIndex}-e${elementIndex}-tapimage`,
            prompt: props.imagePrompt,
            width: defaultSize.width,
            height: defaultSize.height,
            pageIndex,
            elementIndex,
            propertyPath: ['properties', 'imagePrompt'],
          });
        }
        break;

      case 'simple-drag-drop':
        // Items array with imagePrompt
        if (Array.isArray(props.items)) {
          props.items.forEach((item: any, idx: number) => {
            if (item.imagePrompt) {
              requests.push({
                id: `p${pageIndex}-e${elementIndex}-item${idx}`,
                prompt: item.imagePrompt,
                width: defaultSize.width,
                height: defaultSize.height,
                pageIndex,
                elementIndex,
                propertyPath: ['properties', 'items', idx, 'imagePrompt'],
              });
            }
          });
        }
        // Targets array (optional imagePrompt)
        if (Array.isArray(props.targets)) {
          props.targets.forEach((target: any, idx: number) => {
            if (target.imagePrompt) {
              requests.push({
                id: `p${pageIndex}-e${elementIndex}-target${idx}`,
                prompt: target.imagePrompt,
                width: defaultSize.width,
                height: defaultSize.height,
                pageIndex,
                elementIndex,
                propertyPath: ['properties', 'targets', idx, 'imagePrompt'],
              });
            }
          });
        }
        break;

      case 'sorting-game':
      case 'sequence-builder':
        // Items array with imagePrompt
        if (Array.isArray(props.items)) {
          props.items.forEach((item: any, idx: number) => {
            if (item.imagePrompt) {
              requests.push({
                id: `p${pageIndex}-e${elementIndex}-item${idx}`,
                prompt: item.imagePrompt,
                width: defaultSize.width,
                height: defaultSize.height,
                pageIndex,
                elementIndex,
                propertyPath: ['properties', 'items', idx, 'imagePrompt'],
              });
            }
          });
        }
        break;

      case 'memory-cards':
        // Pairs array with imagePrompt
        if (Array.isArray(props.pairs)) {
          props.pairs.forEach((pair: any, idx: number) => {
            if (pair.imagePrompt) {
              requests.push({
                id: `p${pageIndex}-e${elementIndex}-pair${idx}`,
                prompt: pair.imagePrompt,
                width: defaultSize.width,
                height: defaultSize.height,
                pageIndex,
                elementIndex,
                propertyPath: ['properties', 'pairs', idx, 'imagePrompt'],
              });
            }
          });
        }
        break;

      case 'simple-counter':
        // Objects array with imagePrompt
        if (Array.isArray(props.objects)) {
          props.objects.forEach((obj: any, idx: number) => {
            if (obj.imagePrompt) {
              requests.push({
                id: `p${pageIndex}-e${elementIndex}-obj${idx}`,
                prompt: obj.imagePrompt,
                width: defaultSize.width,
                height: defaultSize.height,
                pageIndex,
                elementIndex,
                propertyPath: ['properties', 'objects', idx, 'imagePrompt'],
              });
            }
          });
        }
        break;

      case 'sound-matcher':
        // Items array with imagePrompt
        if (Array.isArray(props.items)) {
          props.items.forEach((item: any, idx: number) => {
            if (item.imagePrompt) {
              requests.push({
                id: `p${pageIndex}-e${elementIndex}-item${idx}`,
                prompt: item.imagePrompt,
                width: defaultSize.width,
                height: defaultSize.height,
                pageIndex,
                elementIndex,
                propertyPath: ['properties', 'items', idx, 'imagePrompt'],
              });
            }
          });
        }
        break;

      case 'simple-puzzle':
        // Single imagePrompt in properties
        if (props.imagePrompt) {
          requests.push({
            id: `p${pageIndex}-e${elementIndex}-puzzle`,
            prompt: props.imagePrompt,
            width: defaultSize.width,
            height: defaultSize.height,
            pageIndex,
            elementIndex,
            propertyPath: ['properties', 'imagePrompt'],
          });
        }
        break;

      case 'pattern-builder':
        // Pattern array (may have imagePrompt)
        if (Array.isArray(props.pattern)) {
          props.pattern.forEach((item: any, idx: number) => {
            if (item.imagePrompt) {
              requests.push({
                id: `p${pageIndex}-e${elementIndex}-pattern${idx}`,
                prompt: item.imagePrompt,
                width: defaultSize.width,
                height: defaultSize.height,
                pageIndex,
                elementIndex,
                propertyPath: ['properties', 'pattern', idx, 'imagePrompt'],
              });
            }
          });
        }
        break;

      case 'emotion-recognizer':
        // Emotions array (may have imagePrompt)
        if (Array.isArray(props.emotions)) {
          props.emotions.forEach((emotion: any, idx: number) => {
            if (emotion.imagePrompt) {
              requests.push({
                id: `p${pageIndex}-e${elementIndex}-emotion${idx}`,
                prompt: emotion.imagePrompt,
                width: defaultSize.width,
                height: defaultSize.height,
                pageIndex,
                elementIndex,
                propertyPath: ['properties', 'emotions', idx, 'imagePrompt'],
              });
            }
          });
        }
        break;

      case 'cause-effect':
        // Pairs array with nested cause/effect that may have imagePrompt
        if (Array.isArray(props.pairs)) {
          props.pairs.forEach((pair: any, idx: number) => {
            if (pair.cause?.imagePrompt) {
              requests.push({
                id: `p${pageIndex}-e${elementIndex}-cause${idx}`,
                prompt: pair.cause.imagePrompt,
                width: defaultSize.width,
                height: defaultSize.height,
                pageIndex,
                elementIndex,
                propertyPath: ['properties', 'pairs', idx, 'cause', 'imagePrompt'],
              });
            }
            if (pair.effect?.imagePrompt) {
              requests.push({
                id: `p${pageIndex}-e${elementIndex}-effect${idx}`,
                prompt: pair.effect.imagePrompt,
                width: defaultSize.width,
                height: defaultSize.height,
                pageIndex,
                elementIndex,
                propertyPath: ['properties', 'pairs', idx, 'effect', 'imagePrompt'],
              });
            }
          });
        }
        break;
    }

    console.log(`🎨 [InteractiveImageExtractor] Found ${requests.length} image(s) in ${componentType}`);
    return requests;
  }

  /**
   * Apply generated images to element using property paths
   */
  applyGeneratedImages(
    element: CanvasElement,
    imageMap: Map<string, string> // id -> base64 url
  ): CanvasElement {
    if (imageMap.size === 0) {
      return element;
    }

    // Deep clone element to avoid mutations
    const updatedElement = JSON.parse(JSON.stringify(element));

    // Apply each generated image by following its property path
    imageMap.forEach((imageUrl, id) => {
      // Extract property path from the request that generated this image
      // We need to reconstruct the path from the id
      const match = id.match(/^p(\d+)-e(\d+)-(.+)$/);
      if (!match) {
        console.warn(`⚠️ [InteractiveImageExtractor] Invalid image ID format: ${id}`);
        return;
      }

      const [, , , suffix] = match;
      
      // Reconstruct path based on suffix
      let path: (string | number)[] = [];
      
      if (suffix === 'tapimage' || suffix === 'puzzle') {
        // Direct property: imagePrompt -> imageUrl
        path = ['properties', 'imagePrompt'];
      } else if (suffix.startsWith('item')) {
        const idx = parseInt(suffix.replace('item', ''), 10);
        path = ['properties', 'items', idx, 'imagePrompt'];
      } else if (suffix.startsWith('target')) {
        const idx = parseInt(suffix.replace('target', ''), 10);
        path = ['properties', 'targets', idx, 'imagePrompt'];
      } else if (suffix.startsWith('pair')) {
        const idx = parseInt(suffix.replace('pair', ''), 10);
        path = ['properties', 'pairs', idx, 'imagePrompt'];
      } else if (suffix.startsWith('obj')) {
        const idx = parseInt(suffix.replace('obj', ''), 10);
        path = ['properties', 'objects', idx, 'imagePrompt'];
      } else if (suffix.startsWith('pattern')) {
        const idx = parseInt(suffix.replace('pattern', ''), 10);
        path = ['properties', 'pattern', idx, 'imagePrompt'];
      } else if (suffix.startsWith('emotion')) {
        const idx = parseInt(suffix.replace('emotion', ''), 10);
        path = ['properties', 'emotions', idx, 'imagePrompt'];
      } else if (suffix.startsWith('cause')) {
        const idx = parseInt(suffix.replace('cause', ''), 10);
        path = ['properties', 'pairs', idx, 'cause', 'imagePrompt'];
      } else if (suffix.startsWith('effect')) {
        const idx = parseInt(suffix.replace('effect', ''), 10);
        path = ['properties', 'pairs', idx, 'effect', 'imagePrompt'];
      }

      // Navigate to the target and replace imagePrompt with imageUrl
      if (path.length > 0) {
        let target: any = updatedElement;
        const lastKey = path[path.length - 1];
        
        // Navigate to parent
        for (let i = 0; i < path.length - 1; i++) {
          if (target[path[i]] === undefined) {
            console.warn(`⚠️ [InteractiveImageExtractor] Path not found: ${path.join('.')}`);
            return;
          }
          target = target[path[i]];
        }

        // Set imageUrl and optionally remove imagePrompt
        if (lastKey === 'imagePrompt') {
          target.imageUrl = imageUrl;
          // Keep imagePrompt for potential regeneration
          // delete target.imagePrompt;
        }
      }
    });

    return updatedElement;
  }
}

// Singleton instance
export const interactiveImageExtractor = new InteractiveImageExtractor();

