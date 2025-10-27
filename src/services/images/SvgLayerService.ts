import { SvgLayer, SvgLayerUpdate } from '@/types/svg';

class SvgLayerService {
  /**
   * Parse SVG string into individual layers
   */
  parseSvgIntoLayers(svgString: string): SvgLayer[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    
    if (!svg) {
      throw new Error('Invalid SVG');
    }

    const layers: SvgLayer[] = [];
    let order = 0;

    // Get all direct children and groups
    const children = Array.from(svg.children);
    
    children.forEach((child) => {
      if (child.tagName === 'defs' || child.tagName === 'style') {
        return; // Skip defs and styles
      }

      const layer = this.elementToLayer(child as Element, order++);
      if (layer) {
        layers.push(layer);
      }
    });

    return layers;
  }

  /**
   * Convert DOM element to SvgLayer
   */
  private elementToLayer(element: Element, order: number): SvgLayer | null {
    const tagName = element.tagName.toLowerCase();
    const id = element.getAttribute('id') || `layer-${order}`;
    
    // Generate human-readable name based on element type and attributes
    let name = this.generateLayerName(element, order);
    
    return {
      id,
      type: tagName,
      name,
      element: element.outerHTML,
      order,
      visible: true,
    };
  }

  /**
   * Generate human-readable name for layer
   */
  private generateLayerName(element: Element, order: number): string {
    const tagName = element.tagName.toLowerCase();
    
    // Check for id or class hints
    const id = element.getAttribute('id');
    if (id) {
      return this.humanizeName(id);
    }

    // Check for group with title or description
    if (tagName === 'g') {
      const title = element.querySelector('title');
      if (title?.textContent) {
        return this.humanizeName(title.textContent);
      }
    }

    // Generate name based on element type
    const typeNames: Record<string, string> = {
      'g': 'Група',
      'path': 'Контур',
      'circle': 'Коло',
      'rect': 'Прямокутник',
      'ellipse': 'Еліпс',
      'polygon': 'Багатокутник',
      'line': 'Лінія',
      'polyline': 'Ламана',
      'text': 'Текст',
    };

    const baseName = typeNames[tagName] || 'Елемент';
    return `${baseName} ${order + 1}`;
  }

  /**
   * Convert id/title to human-readable format
   */
  private humanizeName(str: string): string {
    return str
      .replace(/[-_]/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Reconstruct SVG from layers
   */
  reconstructSvg(originalSvg: string, layers: SvgLayer[]): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(originalSvg, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    
    if (!svg) {
      throw new Error('Invalid SVG');
    }

    // Get svg attributes
    const svgAttrs = Array.from(svg.attributes)
      .map(attr => `${attr.name}="${attr.value}"`)
      .join(' ');

    // Keep defs and styles
    const defs = svg.querySelector('defs');
    const style = svg.querySelector('style');
    
    let defsContent = '';
    let styleContent = '';
    
    if (defs) {
      defsContent = defs.outerHTML;
    }
    if (style) {
      styleContent = style.outerHTML;
    }

    // Sort layers by order and filter visible ones
    const sortedLayers = [...layers]
      .filter(layer => layer.visible)
      .sort((a, b) => a.order - b.order);

    // Reconstruct SVG
    const layerElements = sortedLayers.map(layer => layer.element).join('\n  ');
    
    return `<svg ${svgAttrs}>
  ${defsContent}
  ${styleContent}
  ${layerElements}
</svg>`;
  }

  /**
   * Move layer up in z-order
   */
  moveLayerUp(layers: SvgLayer[], layerId: string): SvgLayerUpdate {
    const index = layers.findIndex(l => l.id === layerId);
    if (index === -1 || index === layers.length - 1) {
      return { layers, svg: '' };
    }

    const newLayers = [...layers];
    const temp = newLayers[index].order;
    newLayers[index].order = newLayers[index + 1].order;
    newLayers[index + 1].order = temp;

    // Sort by order
    newLayers.sort((a, b) => a.order - b.order);

    return {
      layers: newLayers,
      svg: '',
    };
  }

  /**
   * Move layer down in z-order
   */
  moveLayerDown(layers: SvgLayer[], layerId: string): SvgLayerUpdate {
    const index = layers.findIndex(l => l.id === layerId);
    if (index === -1 || index === 0) {
      return { layers, svg: '' };
    }

    const newLayers = [...layers];
    const temp = newLayers[index].order;
    newLayers[index].order = newLayers[index - 1].order;
    newLayers[index - 1].order = temp;

    // Sort by order
    newLayers.sort((a, b) => a.order - b.order);

    return {
      layers: newLayers,
      svg: '',
    };
  }

  /**
   * Move layer to top
   */
  moveLayerToTop(layers: SvgLayer[], layerId: string): SvgLayerUpdate {
    const index = layers.findIndex(l => l.id === layerId);
    if (index === -1 || index === layers.length - 1) {
      return { layers, svg: '' };
    }

    const newLayers = [...layers];
    const maxOrder = Math.max(...newLayers.map(l => l.order));
    newLayers[index].order = maxOrder + 1;

    // Renormalize orders
    newLayers.sort((a, b) => a.order - b.order);
    newLayers.forEach((layer, i) => {
      layer.order = i;
    });

    return {
      layers: newLayers,
      svg: '',
    };
  }

  /**
   * Move layer to bottom
   */
  moveLayerToBottom(layers: SvgLayer[], layerId: string): SvgLayerUpdate {
    const index = layers.findIndex(l => l.id === layerId);
    if (index === -1 || index === 0) {
      return { layers, svg: '' };
    }

    const newLayers = [...layers];
    const minOrder = Math.min(...newLayers.map(l => l.order));
    newLayers[index].order = minOrder - 1;

    // Renormalize orders
    newLayers.sort((a, b) => a.order - b.order);
    newLayers.forEach((layer, i) => {
      layer.order = i;
    });

    return {
      layers: newLayers,
      svg: '',
    };
  }

  /**
   * Toggle layer visibility
   */
  toggleLayerVisibility(layers: SvgLayer[], layerId: string): SvgLayerUpdate {
    const newLayers = layers.map(layer => {
      if (layer.id === layerId) {
        return { ...layer, visible: !layer.visible };
      }
      return layer;
    });

    return {
      layers: newLayers,
      svg: '',
    };
  }

  /**
   * Remove layer
   */
  removeLayer(layers: SvgLayer[], layerId: string): SvgLayerUpdate {
    const newLayers = layers.filter(l => l.id !== layerId);
    
    // Renormalize orders
    newLayers.forEach((layer, i) => {
      layer.order = i;
    });

    return {
      layers: newLayers,
      svg: '',
    };
  }
}

export const svgLayerService = new SvgLayerService();

