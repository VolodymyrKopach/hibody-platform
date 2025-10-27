import { SvgLayer } from '@/types/svg';

export interface ShapeObject {
  id: string;
  type: 'circle' | 'square' | 'triangle' | 'line' | 'path';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
  fillColor?: string;
  fillOpacity?: number;
  points?: { x: number; y: number }[];
  pathData?: string;
  originalSvgType?: string;
  order: number;
}

interface StyleAttributes {
  color: string;
  strokeWidth: number;
  fillColor?: string;
  fillOpacity?: number;
}

class SvgToObjectsService {
  private currentOrder = 0;

  /**
   * Convert SVG layer to array of ShapeObjects
   */
  convertSvgLayerToObjects(layer: SvgLayer, startOrder = 0): ShapeObject[] {
    this.currentOrder = startOrder;
    
    // Create temporary SVG container in the actual DOM for proper getBBox() calculation
    const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tempSvg.setAttribute('viewBox', '0 0 1000 1000');
    tempSvg.style.position = 'absolute';
    tempSvg.style.visibility = 'hidden';
    tempSvg.style.width = '1000px';
    tempSvg.style.height = '1000px';
    document.body.appendChild(tempSvg);
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(layer.element, 'image/svg+xml');
      const rootElement = doc.documentElement;

      if (rootElement.tagName.toLowerCase() === 'parsererror') {
        console.error('Failed to parse SVG layer:', layer.element);
        return [];
      }

      // Clone element into temp SVG for accurate measurements
      const clonedElement = rootElement.cloneNode(true) as Element;
      tempSvg.appendChild(clonedElement);
      
      const objects = this.processElement(clonedElement, layer.id);
      
      return objects;
    } finally {
      // Always clean up temp SVG
      document.body.removeChild(tempSvg);
    }
  }

  /**
   * Get next order and increment
   */
  private getNextOrder(): number {
    return this.currentOrder++;
  }

  /**
   * Process SVG element recursively
   */
  private processElement(element: Element, parentId: string): ShapeObject[] {
    const objects: ShapeObject[] = [];
    const tagName = element.tagName.toLowerCase();

    // Process based on element type
    switch (tagName) {
      case 'g':
        // Process group children recursively
        Array.from(element.children).forEach((child, index) => {
          const childObjects = this.processElement(child, `${parentId}-g${index}`);
          objects.push(...childObjects);
        });
        break;

      case 'circle':
        const circleObj = this.convertCircle(element as SVGCircleElement, parentId);
        if (circleObj) objects.push(circleObj);
        break;

      case 'ellipse':
        const ellipseObj = this.convertEllipse(element as SVGEllipseElement, parentId);
        if (ellipseObj) objects.push(ellipseObj);
        break;

      case 'rect':
        const rectObj = this.convertRect(element as SVGRectElement, parentId);
        if (rectObj) objects.push(rectObj);
        break;

      case 'line':
        const lineObj = this.convertLine(element as SVGLineElement, parentId);
        if (lineObj) objects.push(lineObj);
        break;

      case 'path':
        const pathObj = this.convertPath(element as SVGPathElement, parentId);
        if (pathObj) objects.push(pathObj);
        break;

      case 'polygon':
        const polygonObj = this.convertPolygon(element as SVGPolygonElement, parentId);
        if (polygonObj) objects.push(polygonObj);
        break;

      case 'polyline':
        const polylineObj = this.convertPolyline(element as SVGPolylineElement, parentId);
        if (polylineObj) objects.push(polylineObj);
        break;

      default:
        // Skip unsupported elements (defs, style, etc.)
        break;
    }

    return objects;
  }

  /**
   * Convert circle element
   */
  private convertCircle(element: SVGCircleElement, parentId: string): ShapeObject | null {
    const cx = parseFloat(element.getAttribute('cx') || '0');
    const cy = parseFloat(element.getAttribute('cy') || '0');
    const r = parseFloat(element.getAttribute('r') || '0');

    if (r === 0) return null;

    const style = this.extractStyleAttributes(element);

    return {
      id: `${parentId}-circle-${Date.now()}-${Math.random()}`,
      type: 'circle',
      x: cx - r,
      y: cy - r,
      width: r * 2,
      height: r * 2,
      ...style,
      originalSvgType: 'circle',
      order: this.getNextOrder(),
    };
  }

  /**
   * Convert ellipse element
   */
  private convertEllipse(element: SVGEllipseElement, parentId: string): ShapeObject | null {
    const cx = parseFloat(element.getAttribute('cx') || '0');
    const cy = parseFloat(element.getAttribute('cy') || '0');
    const rx = parseFloat(element.getAttribute('rx') || '0');
    const ry = parseFloat(element.getAttribute('ry') || '0');

    if (rx === 0 || ry === 0) return null;

    const style = this.extractStyleAttributes(element);

    return {
      id: `${parentId}-ellipse-${Date.now()}-${Math.random()}`,
      type: 'circle', // Use circle type but with different width/height
      x: cx - rx,
      y: cy - ry,
      width: rx * 2,
      height: ry * 2,
      ...style,
      originalSvgType: 'ellipse',
      order: this.getNextOrder(),
    };
  }

  /**
   * Convert rect element
   */
  private convertRect(element: SVGRectElement, parentId: string): ShapeObject | null {
    const x = parseFloat(element.getAttribute('x') || '0');
    const y = parseFloat(element.getAttribute('y') || '0');
    const width = parseFloat(element.getAttribute('width') || '0');
    const height = parseFloat(element.getAttribute('height') || '0');

    if (width === 0 || height === 0) return null;

    const style = this.extractStyleAttributes(element);

    return {
      id: `${parentId}-rect-${Date.now()}-${Math.random()}`,
      type: 'square',
      x,
      y,
      width,
      height,
      ...style,
      originalSvgType: 'rect',
      order: this.getNextOrder(),
    };
  }

  /**
   * Convert line element
   */
  private convertLine(element: SVGLineElement, parentId: string): ShapeObject | null {
    const x1 = parseFloat(element.getAttribute('x1') || '0');
    const y1 = parseFloat(element.getAttribute('y1') || '0');
    const x2 = parseFloat(element.getAttribute('x2') || '0');
    const y2 = parseFloat(element.getAttribute('y2') || '0');

    const style = this.extractStyleAttributes(element);

    return {
      id: `${parentId}-line-${Date.now()}-${Math.random()}`,
      type: 'line',
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
      ...style,
      originalSvgType: 'line',
      order: this.getNextOrder(),
    };
  }

  /**
   * Convert path element
   */
  private convertPath(element: SVGPathElement, parentId: string): ShapeObject | null {
    const pathData = element.getAttribute('d');
    if (!pathData) return null;

    const style = this.extractStyleAttributes(element);

    // Get bounding box for the path
    try {
      const bbox = element.getBBox();
      
      // Normalize path to be relative to (0,0)
      const normalizedPath = this.normalizePath(pathData, bbox.x, bbox.y);
      
      // Ensure we have valid dimensions
      if (bbox.width === 0 || bbox.height === 0) {
        console.warn('Path has zero dimensions, using manual calculation');
        const manualBbox = this.calculatePathBBox(pathData);
        if (manualBbox) {
          const normalizedPathManual = this.normalizePath(pathData, manualBbox.x, manualBbox.y);
          return {
            id: `${parentId}-path-${Date.now()}-${Math.random()}`,
            type: 'path',
            x: manualBbox.x,
            y: manualBbox.y,
            width: manualBbox.width,
            height: manualBbox.height,
            pathData: normalizedPathManual,
            ...style,
            originalSvgType: 'path',
            order: this.getNextOrder(),
          };
        }
      }

      return {
        id: `${parentId}-path-${Date.now()}-${Math.random()}`,
        type: 'path',
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height,
        pathData: normalizedPath,
        ...style,
        originalSvgType: 'path',
        order: this.getNextOrder(),
      };
    } catch (error) {
      // If getBBox fails, try to parse manually
      console.warn('Failed to get bbox for path, using manual calculation');
      const manualBbox = this.calculatePathBBox(pathData);
      
      if (manualBbox) {
        const normalizedPath = this.normalizePath(pathData, manualBbox.x, manualBbox.y);
        return {
          id: `${parentId}-path-${Date.now()}-${Math.random()}`,
          type: 'path',
          x: manualBbox.x,
          y: manualBbox.y,
          width: manualBbox.width,
          height: manualBbox.height,
          pathData: normalizedPath,
          ...style,
          originalSvgType: 'path',
          order: this.getNextOrder(),
        };
      }
      
      // Ultimate fallback
      return {
        id: `${parentId}-path-${Date.now()}-${Math.random()}`,
        type: 'path',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        pathData,
        ...style,
        originalSvgType: 'path',
        order: this.getNextOrder(),
      };
    }
  }

  /**
   * Convert polygon element to path
   */
  private convertPolygon(element: SVGPolygonElement, parentId: string): ShapeObject | null {
    const points = element.getAttribute('points');
    if (!points) return null;

    // Convert points to path data
    const pathData = this.polygonPointsToPath(points, true);
    if (!pathData) return null;

    const style = this.extractStyleAttributes(element);

    // Get bounding box
    try {
      const bbox = element.getBBox();
      const normalizedPath = this.normalizePath(pathData, bbox.x, bbox.y);

      return {
        id: `${parentId}-polygon-${Date.now()}-${Math.random()}`,
        type: 'path',
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height,
        pathData: normalizedPath,
        ...style,
        originalSvgType: 'polygon',
        order: this.getNextOrder(),
      };
    } catch (error) {
      console.warn('Failed to get bbox for polygon, using manual calculation');
      const manualBbox = this.calculatePathBBox(pathData);
      if (manualBbox) {
        const normalizedPath = this.normalizePath(pathData, manualBbox.x, manualBbox.y);
        return {
          id: `${parentId}-polygon-${Date.now()}-${Math.random()}`,
          type: 'path',
          x: manualBbox.x,
          y: manualBbox.y,
          width: manualBbox.width,
          height: manualBbox.height,
          pathData: normalizedPath,
          ...style,
          originalSvgType: 'polygon',
          order: this.getNextOrder(),
        };
      }
      return null;
    }
  }

  /**
   * Convert polyline element to path
   */
  private convertPolyline(element: SVGPolylineElement, parentId: string): ShapeObject | null {
    const points = element.getAttribute('points');
    if (!points) return null;

    // Convert points to path data
    const pathData = this.polygonPointsToPath(points, false);
    if (!pathData) return null;

    const style = this.extractStyleAttributes(element);

    // Get bounding box
    try {
      const bbox = element.getBBox();
      const normalizedPath = this.normalizePath(pathData, bbox.x, bbox.y);

      return {
        id: `${parentId}-polyline-${Date.now()}-${Math.random()}`,
        type: 'path',
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height,
        pathData: normalizedPath,
        ...style,
        originalSvgType: 'polyline',
        order: this.getNextOrder(),
      };
    } catch (error) {
      console.warn('Failed to get bbox for polyline, using manual calculation');
      const manualBbox = this.calculatePathBBox(pathData);
      if (manualBbox) {
        const normalizedPath = this.normalizePath(pathData, manualBbox.x, manualBbox.y);
        return {
          id: `${parentId}-polyline-${Date.now()}-${Math.random()}`,
          type: 'path',
          x: manualBbox.x,
          y: manualBbox.y,
          width: manualBbox.width,
          height: manualBbox.height,
          pathData: normalizedPath,
          ...style,
          originalSvgType: 'polyline',
          order: this.getNextOrder(),
        };
      }
      return null;
    }
  }

  /**
   * Convert polygon/polyline points to path data
   */
  private polygonPointsToPath(pointsStr: string, closed: boolean): string | null {
    const points = pointsStr.trim().split(/[\s,]+/);
    if (points.length < 2) return null;

    const coords: { x: number; y: number }[] = [];
    for (let i = 0; i < points.length - 1; i += 2) {
      coords.push({
        x: parseFloat(points[i]),
        y: parseFloat(points[i + 1]),
      });
    }

    if (coords.length === 0) return null;

    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      path += ` L ${coords[i].x} ${coords[i].y}`;
    }
    if (closed) {
      path += ' Z';
    }

    return path;
  }

  /**
   * Extract style attributes from element
   */
  private extractStyleAttributes(element: Element): StyleAttributes {
    const stroke = element.getAttribute('stroke') || '#000000';
    const strokeWidth = parseFloat(element.getAttribute('stroke-width') || '2');
    const fill = element.getAttribute('fill');
    const fillOpacity = parseFloat(element.getAttribute('fill-opacity') || '1');

    // Normalize colors
    const color = stroke === 'none' ? '#000000' : stroke;
    
    let fillColor: string | undefined;
    let opacity: number | undefined;

    if (fill && fill !== 'none' && fill !== 'transparent') {
      fillColor = fill;
      opacity = fillOpacity;
    } else {
      // Default to white fill for shapes (except lines and paths without fill)
      const tagName = element.tagName.toLowerCase();
      if (tagName !== 'line' && tagName !== 'polyline') {
        fillColor = '#FFFFFF';
        opacity = 1.0;
      }
    }

    return {
      color,
      strokeWidth: Math.max(strokeWidth, 2),
      fillColor,
      fillOpacity: opacity,
    };
  }

  /**
   * Calculate bounding box manually from path data
   * This is a fallback when getBBox() fails
   */
  private calculatePathBBox(pathData: string): { x: number; y: number; width: number; height: number } | null {
    try {
      // Extract all coordinate pairs from path
      const coordRegex = /([+-]?\d+\.?\d*)\s*,?\s*([+-]?\d+\.?\d*)/g;
      const coords: { x: number; y: number }[] = [];
      let match;
      
      while ((match = coordRegex.exec(pathData)) !== null) {
        coords.push({
          x: parseFloat(match[1]),
          y: parseFloat(match[2])
        });
      }

      if (coords.length === 0) return null;

      const xs = coords.map(c => c.x);
      const ys = coords.map(c => c.y);

      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };
    } catch (error) {
      console.error('Failed to calculate path bbox manually:', error);
      return null;
    }
  }

  /**
   * Normalize path to be relative to (0,0) by subtracting offset
   */
  private normalizePath(pathData: string, offsetX: number, offsetY: number): string {
    // Simple translation - subtract offset from all coordinates
    return pathData.replace(/([MLHVCSQTAZmlhvcsqtaz])\s*([+-]?\d+\.?\d*)\s*,?\s*([+-]?\d+\.?\d*)?/g, 
      (match, cmd, x, y) => {
        const newX = x !== undefined ? (parseFloat(x) - offsetX).toFixed(2) : '';
        const newY = y !== undefined ? (parseFloat(y) - offsetY).toFixed(2) : '';
        
        if (newY) {
          return `${cmd} ${newX} ${newY}`;
        } else if (newX) {
          // Commands like H (horizontal) and V (vertical) have only one coordinate
          if (cmd.toUpperCase() === 'H') {
            return `${cmd} ${newX}`;
          } else if (cmd.toUpperCase() === 'V') {
            return `${cmd} ${(parseFloat(x) - offsetY).toFixed(2)}`;
          }
          return `${cmd} ${newX}`;
        }
        return match;
      }
    );
  }

  /**
   * Convert all layers to objects
   */
  convertAllLayersToObjects(layers: SvgLayer[], startOrder = 0): ShapeObject[] {
    const allObjects: ShapeObject[] = [];
    this.currentOrder = startOrder;

    layers.forEach((layer) => {
      if (layer.visible) {
        const objects = this.convertSvgLayerToObjects(layer, this.currentOrder);
        allObjects.push(...objects);
      }
    });

    return allObjects;
  }
}

export const svgToObjectsService = new SvgToObjectsService();

