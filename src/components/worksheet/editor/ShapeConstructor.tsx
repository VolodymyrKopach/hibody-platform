'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  IconButton,
  Slider,
  Chip,
} from '@mui/material';
import {
  Trash2,
  Circle,
  Square,
  Triangle,
  Minus,
  Check,
  Undo,
  Redo,
  MousePointer,
  Copy,
  Layers,
  ArrowUp,
  ArrowDown,
  Eraser,
  Pencil,
} from 'lucide-react';
import { toPng } from 'html-to-image';

type Tool = 'select' | 'circle' | 'square' | 'triangle' | 'line' | 'brush';
type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | null;

interface ShapeObject {
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
  points?: { x: number; y: number }[]; // For freehand drawing
}

interface ShapeConstructorProps {
  open: boolean;
  onClose: () => void;
  onSave: (svgData: string) => void;
}

const COLORS = [
  '#000000', // Чорний
  '#FF0000', // Червоний
  '#00FF00', // Зелений
  '#0000FF', // Синій
  '#FFFF00', // Жовтий
  '#FF00FF', // Пурпурний
  '#00FFFF', // Бірюзовий
  '#FFA500', // Помаранчевий
];

const ShapeConstructor: React.FC<ShapeConstructorProps> = ({ open, onClose, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentFillColor, setCurrentFillColor] = useState<string>('');
  const [currentFillOpacity, setCurrentFillOpacity] = useState(0.3);
  const [brushSize, setBrushSize] = useState(10);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [cursorStyle, setCursorStyle] = useState('default');
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  
  // Objects system
  const [objects, setObjects] = useState<ShapeObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Undo/Redo history
  const [history, setHistory] = useState<{ objects: ShapeObject[] }[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Initialize canvas
  useEffect(() => {
    if (!open) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 1000;
    canvas.height = 1000;

    setObjects([]);
    setSelectedObjectId(null);
    setHistory([{ objects: [] }]);
    setHistoryStep(0);
    
    redrawCanvas();
  }, [open]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected object
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
        e.preventDefault();
        handleDeleteSelected();
      }
      
      // Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      // Redo
      if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
      
      // Duplicate
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        handleDuplicate();
      }
      
      // Deselect
      if (e.key === 'Escape') {
        setSelectedObjectId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedObjectId, historyStep, objects]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#FFFEF8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all objects
    objects.forEach((obj) => {
      drawObject(ctx, obj, obj.id === selectedObjectId);
    });
  }, [objects, selectedObjectId]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const drawObject = (ctx: CanvasRenderingContext2D, obj: ShapeObject, isSelected: boolean) => {
    ctx.save();
    
    // Draw fill if exists (not for path or line)
    if (obj.fillColor && obj.fillOpacity && obj.fillOpacity > 0 && obj.type !== 'path' && obj.type !== 'line') {
      ctx.fillStyle = obj.fillColor;
      ctx.globalAlpha = obj.fillOpacity;
      
      switch (obj.type) {
        case 'circle':
          const radiusFill = Math.sqrt(obj.width * obj.width + obj.height * obj.height) / 2;
          const centerXFill = obj.x + obj.width / 2;
          const centerYFill = obj.y + obj.height / 2;
          ctx.beginPath();
          ctx.arc(centerXFill, centerYFill, radiusFill, 0, 2 * Math.PI);
          ctx.fill();
          break;

        case 'square':
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          break;

        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(obj.x + obj.width / 2, obj.y);
          ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
          ctx.lineTo(obj.x, obj.y + obj.height);
          ctx.closePath();
          ctx.fill();
          break;
      }
      
      ctx.globalAlpha = 1;
    }

    // Draw stroke
    ctx.strokeStyle = obj.color;
    ctx.lineWidth = obj.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (obj.type) {
      case 'circle':
        const radius = Math.sqrt(obj.width * obj.width + obj.height * obj.height) / 2;
        const centerX = obj.x + obj.width / 2;
        const centerY = obj.y + obj.height / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;

      case 'square':
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.width / 2, obj.y);
        ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
        ctx.lineTo(obj.x, obj.y + obj.height);
        ctx.closePath();
        ctx.stroke();
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(obj.x, obj.y);
        ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
        ctx.stroke();
        break;

      case 'path':
        if (obj.points && obj.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(obj.points[0].x, obj.points[0].y);
          for (let i = 1; i < obj.points.length; i++) {
            ctx.lineTo(obj.points[i].x, obj.points[i].y);
          }
          ctx.stroke();
        }
        break;
    }

    // Draw selection handles
    if (isSelected) {
      const handleSize = 10;
      const selectionPadding = 15 + Math.ceil(obj.strokeWidth / 2);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 2;
      
      // For lines, draw handles at endpoints only
      if (obj.type === 'line') {
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(obj.x, obj.y);
        ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
        ctx.stroke();
        ctx.setLineDash([]);
        
        const handles = [
          [obj.x, obj.y],
          [obj.x + obj.width, obj.y + obj.height],
        ];
        
        handles.forEach(([hx, hy]) => {
          ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
        });
      } else {
        // Calculate actual bounding box for other shapes
        let boundsX = obj.x;
        let boundsY = obj.y;
        let boundsWidth = obj.width;
        let boundsHeight = obj.height;
        
        // For circle, calculate actual bounds based on radius
        if (obj.type === 'circle') {
          const radius = Math.sqrt(obj.width * obj.width + obj.height * obj.height) / 2;
          const centerX = obj.x + obj.width / 2;
          const centerY = obj.y + obj.height / 2;
          boundsX = centerX - radius;
          boundsY = centerY - radius;
          boundsWidth = radius * 2;
          boundsHeight = radius * 2;
        }
        
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          boundsX - selectionPadding, 
          boundsY - selectionPadding, 
          boundsWidth + selectionPadding * 2, 
          boundsHeight + selectionPadding * 2
        );
        ctx.setLineDash([]);

        // Draw corner handles (but not for path - path can only be moved, not resized)
        if (obj.type !== 'path') {
          const handles = [
            [obj.x - selectionPadding, obj.y - selectionPadding], 
            [obj.x + obj.width + selectionPadding, obj.y - selectionPadding], 
            [obj.x - selectionPadding, obj.y + obj.height + selectionPadding], 
            [obj.x + obj.width + selectionPadding, obj.y + obj.height + selectionPadding]
          ];
          
          handles.forEach(([hx, hy]) => {
            ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
          });
        }
      }
    }
    
    ctx.restore();
  };

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
  };

  const findObjectAtPoint = (x: number, y: number): ShapeObject | null => {
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      
      // Check based on shape type
      switch (obj.type) {
        case 'circle': {
          const radius = Math.sqrt(obj.width * obj.width + obj.height * obj.height) / 2;
          const centerX = obj.x + obj.width / 2;
          const centerY = obj.y + obj.height / 2;
          const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          if (distanceFromCenter <= radius) return obj;
          break;
        }
          
        case 'triangle': {
          // Check if point is inside triangle using barycentric coordinates
          const x1 = obj.x + obj.width / 2;
          const y1 = obj.y;
          const x2 = obj.x + obj.width;
          const y2 = obj.y + obj.height;
          const x3 = obj.x;
          const y3 = obj.y + obj.height;
          
          const denominator = ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
          const a = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / denominator;
          const b = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / denominator;
          const c = 1 - a - b;
          
          if (a >= 0 && b >= 0 && c >= 0) return obj;
          break;
        }
          
        case 'square':
          // For square, use bounding box
          if (x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height) {
            return obj;
          }
          break;
          
        case 'line': {
          // For line, check distance from line segment (works with negative width/height)
          const x1Line = obj.x;
          const y1Line = obj.y;
          const x2Line = obj.x + obj.width;
          const y2Line = obj.y + obj.height;
          
          // Distance from point to line segment
          const A = x - x1Line;
          const B = y - y1Line;
          const C = x2Line - x1Line;
          const D = y2Line - y1Line;
          
          const dot = A * C + B * D;
          const lenSq = C * C + D * D;
          let param = -1;
          if (lenSq !== 0) param = dot / lenSq;
          
          let xx, yy;
          if (param < 0) {
            xx = x1Line;
            yy = y1Line;
          } else if (param > 1) {
            xx = x2Line;
            yy = y2Line;
          } else {
            xx = x1Line + param * C;
            yy = y1Line + param * D;
          }
          
          const dx = x - xx;
          const dy = y - yy;
          const distanceFromLine = Math.sqrt(dx * dx + dy * dy);
          
          // Click tolerance (accounting for stroke width)
          if (distanceFromLine <= Math.max(10, obj.strokeWidth + 5)) return obj;
          break;
        }
          
        case 'path': {
          // For path, check if click is within bounding box (simple approach)
          if (x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height) {
            return obj;
          }
          break;
        }
      }
    }
    return null;
  };

  const findResizeHandle = (x: number, y: number, obj: ShapeObject): ResizeHandle => {
    const handleSize = 10;
    const selectionPadding = 15 + Math.ceil(obj.strokeWidth / 2);
    
    // Path cannot be resized, only moved
    if (obj.type === 'path') {
      return null;
    }
    
    // For lines, handles are at start and end points
    if (obj.type === 'line') {
      const handles = {
        nw: [obj.x, obj.y],
        se: [obj.x + obj.width, obj.y + obj.height],
      };
      
      for (const [handle, [hx, hy]] of Object.entries(handles)) {
        if (Math.abs(x - hx) <= handleSize && Math.abs(y - hy) <= handleSize) {
          return handle as ResizeHandle;
        }
      }
      return null;
    }
    
    const handles = {
      nw: [obj.x - selectionPadding, obj.y - selectionPadding],
      ne: [obj.x + obj.width + selectionPadding, obj.y - selectionPadding],
      sw: [obj.x - selectionPadding, obj.y + obj.height + selectionPadding],
      se: [obj.x + obj.width + selectionPadding, obj.y + obj.height + selectionPadding],
    };

    for (const [handle, [hx, hy]] of Object.entries(handles)) {
      if (Math.abs(x - hx) <= handleSize && Math.abs(y - hy) <= handleSize) {
        return handle as ResizeHandle;
      }
    }
    return null;
  };

  const getCursorForHandle = (handle: ResizeHandle): string => {
    switch (handle) {
      case 'nw': return 'nwse-resize';
      case 'ne': return 'nesw-resize';
      case 'sw': return 'nesw-resize';
      case 'se': return 'nwse-resize';
      default: return 'default';
    }
  };

  const saveToHistory = () => {
    const MAX_HISTORY = 50; // Limit history to prevent memory issues
    
    setHistoryStep(prevStep => {
      setHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, prevStep + 1);
        newHistory.push({ objects: JSON.parse(JSON.stringify(objects)) });
        
        // Keep only last MAX_HISTORY items
        if (newHistory.length > MAX_HISTORY) {
          const trimmed = newHistory.slice(newHistory.length - MAX_HISTORY);
          // Adjust step since we removed items from beginning
          setTimeout(() => setHistoryStep(trimmed.length - 1), 0);
          return trimmed;
        }
        
        return newHistory;
      });
      return prevStep + 1;
    });
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      const state = history[newStep];
      setObjects(JSON.parse(JSON.stringify(state.objects)));
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      const state = history[newStep];
      setObjects(JSON.parse(JSON.stringify(state.objects)));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    // Update cursor for resize handles
    if (currentTool === 'select' && selectedObjectId && !isDragging && !isResizing) {
      const selectedObj = objects.find(obj => obj.id === selectedObjectId);
      if (selectedObj) {
        const handle = findResizeHandle(point.x, point.y, selectedObj);
        setCursorStyle(handle ? getCursorForHandle(handle) : 'move');
      }
    }

    // Handle dragging/resizing
    if (isDragging && selectedObjectId && currentTool === 'select') {
      setObjects(prev => prev.map(obj => {
        if (obj.id !== selectedObjectId) return obj;
        
        const newX = point.x - dragOffset.x;
        const newY = point.y - dragOffset.y;
        const deltaX = newX - obj.x;
        const deltaY = newY - obj.y;
        
        // For path, also move all points
        if (obj.type === 'path' && obj.points) {
          return {
            ...obj,
            x: newX,
            y: newY,
            points: obj.points.map(p => ({
              x: p.x + deltaX,
              y: p.y + deltaY,
            })),
          };
        }
        
        return { ...obj, x: newX, y: newY };
      }));
    } else if (isResizing && selectedObjectId && resizeHandle && startPos) {
      setObjects(prev => prev.map(obj => {
        if (obj.id !== selectedObjectId) return obj;
        
        const dx = point.x - startPos.x;
        const dy = point.y - startPos.y;
        
        // Special handling for lines - move endpoints directly
        if (obj.type === 'line') {
          let newX = obj.x;
          let newY = obj.y;
          let newWidth = obj.width;
          let newHeight = obj.height;
          
          if (resizeHandle === 'nw') {
            // Moving start point
            newX = obj.x + dx;
            newY = obj.y + dy;
            newWidth = obj.width - dx;
            newHeight = obj.height - dy;
          } else if (resizeHandle === 'se') {
            // Moving end point
            newWidth = obj.width + dx;
            newHeight = obj.height + dy;
          }
          
    setStartPos(point);
          return { ...obj, x: newX, y: newY, width: newWidth, height: newHeight };
        }
        
        // Regular resize for other shapes
        const minSize = 20;
        
        let newX = obj.x;
        let newY = obj.y;
        let newWidth = obj.width;
        let newHeight = obj.height;
        
        switch (resizeHandle) {
          case 'se':
            newWidth = Math.max(minSize, obj.width + dx);
            newHeight = Math.max(minSize, obj.height + dy);
            break;
          case 'sw':
            const widthSW = obj.width - dx;
            if (widthSW >= minSize) {
              newX = obj.x + dx;
              newWidth = widthSW;
            } else {
              newX = obj.x + obj.width - minSize;
              newWidth = minSize;
            }
            newHeight = Math.max(minSize, obj.height + dy);
            break;
          case 'ne':
            const heightNE = obj.height - dy;
            if (heightNE >= minSize) {
              newY = obj.y + dy;
              newHeight = heightNE;
            } else {
              newY = obj.y + obj.height - minSize;
              newHeight = minSize;
            }
            newWidth = Math.max(minSize, obj.width + dx);
            break;
          case 'nw':
            const widthNW = obj.width - dx;
            const heightNW = obj.height - dy;
            if (widthNW >= minSize) {
              newX = obj.x + dx;
              newWidth = widthNW;
            } else {
              newX = obj.x + obj.width - minSize;
              newWidth = minSize;
            }
            if (heightNW >= minSize) {
              newY = obj.y + dy;
              newHeight = heightNW;
            } else {
              newY = obj.y + obj.height - minSize;
              newHeight = minSize;
            }
            break;
        }
        
        setStartPos(point);
        return { ...obj, x: newX, y: newY, width: newWidth, height: newHeight };
      }));
    } else if (isDrawing && currentTool === 'brush' && currentPath.length > 0) {
      // Add point to current path
      const lastPoint = currentPath[currentPath.length - 1];
      const distance = Math.sqrt((point.x - lastPoint.x) ** 2 + (point.y - lastPoint.y) ** 2);
      
      // Only add point if moved enough (reduce number of points for smoother performance)
      if (distance > 2) {
        setCurrentPath(prev => [...prev, point]);
        
        // Draw preview
        redrawCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        for (let i = 1; i < currentPath.length; i++) {
          ctx.lineTo(currentPath[i].x, currentPath[i].y);
        }
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
    } else if (isDrawing && startPos && currentTool !== 'select' && currentTool !== 'brush') {
      // Preview for shapes
      redrawCanvas();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.setLineDash([5, 5]);

      const width = point.x - startPos.x;
      const height = point.y - startPos.y;

      switch (currentTool) {
        case 'circle':
          const radius = Math.sqrt(width * width + height * height) / 2;
          const centerX = startPos.x + width / 2;
          const centerY = startPos.y + height / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;

        case 'square':
          ctx.strokeRect(startPos.x, startPos.y, width, height);
          break;

        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(startPos.x + width / 2, startPos.y);
          ctx.lineTo(startPos.x + width, startPos.y + height);
          ctx.lineTo(startPos.x, startPos.y + height);
          ctx.closePath();
          ctx.stroke();
          break;

        case 'line':
          ctx.beginPath();
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
          break;
      }
      ctx.setLineDash([]);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    setStartPos(point);

    if (currentTool === 'select') {
      const selectedObj = objects.find(obj => obj.id === selectedObjectId);
      
      if (selectedObj) {
        const handle = findResizeHandle(point.x, point.y, selectedObj);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          return;
        }
      }
      
      const clickedObject = findObjectAtPoint(point.x, point.y);
      if (clickedObject) {
        setSelectedObjectId(clickedObject.id);
        setIsDragging(true);
        setDragOffset({
          x: point.x - clickedObject.x,
          y: point.y - clickedObject.y,
        });
      } else {
        setSelectedObjectId(null);
      }
    } else if (currentTool === 'brush') {
      // Start freehand drawing
      setIsDrawing(true);
      setCurrentPath([point]);
    } else {
      setIsDrawing(true);
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      saveToHistory();
    } else if (isDrawing && currentTool === 'brush' && currentPath.length > 1) {
      // Create path object from freehand drawing
      const allPoints = [...currentPath, point];
      
      // Calculate bounding box
      const minX = Math.min(...allPoints.map(p => p.x));
      const minY = Math.min(...allPoints.map(p => p.y));
      const maxX = Math.max(...allPoints.map(p => p.x));
      const maxY = Math.max(...allPoints.map(p => p.y));
      
      const newObject: ShapeObject = {
        id: crypto.randomUUID(),
        type: 'path',
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        color: currentColor,
        strokeWidth: brushSize,
        points: allPoints,
      };
      
      setObjects(prev => [...prev, newObject]);
      setCurrentPath([]);
    setIsDrawing(false);
      saveToHistory();
    } else if (isDrawing && startPos && currentTool !== 'select' && currentTool !== 'brush') {
      const width = Math.abs(point.x - startPos.x);
      const height = Math.abs(point.y - startPos.y);
      
      // Minimum size to avoid invisible shapes
      if (width < 10 || height < 10) {
    setStartPos(null);
        setIsDrawing(false);
        return;
      }
      
      // For lines, preserve direction - don't normalize coordinates
      const newObject: ShapeObject = currentTool === 'line' ? {
        id: crypto.randomUUID(),
        type: currentTool,
        x: startPos.x,
        y: startPos.y,
        width: point.x - startPos.x,
        height: point.y - startPos.y,
        color: currentColor,
        strokeWidth: brushSize,
        fillColor: currentFillColor || undefined,
        fillOpacity: currentFillColor ? currentFillOpacity : undefined,
      } : {
        id: crypto.randomUUID(),
        type: currentTool,
        x: Math.min(startPos.x, point.x),
        y: Math.min(startPos.y, point.y),
        width,
        height,
        color: currentColor,
        strokeWidth: brushSize,
        fillColor: currentFillColor || undefined,
        fillOpacity: currentFillColor ? currentFillOpacity : undefined,
      };
      
      setObjects(prev => [...prev, newObject]);
      setIsDrawing(false);
    saveToHistory();
    }

    setStartPos(null);
    setIsDrawing(false);
    setCurrentPath([]);
  };
    
  const handleDeleteSelected = () => {
    if (selectedObjectId) {
      setObjects(prev => prev.filter(obj => obj.id !== selectedObjectId));
      setSelectedObjectId(null);
    saveToHistory();
    }
  };

  const handleClearAll = () => {
    setObjects([]);
    setSelectedObjectId(null);
    saveToHistory();
  };

  const handleDuplicate = () => {
    if (selectedObjectId) {
      const objToDuplicate = objects.find(obj => obj.id === selectedObjectId);
      if (objToDuplicate) {
        const newObject: ShapeObject = {
          ...objToDuplicate,
          id: crypto.randomUUID(),
          x: objToDuplicate.x + 20,
          y: objToDuplicate.y + 20,
          // For path, also shift all points
          ...(objToDuplicate.type === 'path' && objToDuplicate.points ? {
            points: objToDuplicate.points.map(p => ({
              x: p.x + 20,
              y: p.y + 20,
            })),
          } : {}),
        };
        setObjects(prev => [...prev, newObject]);
        setSelectedObjectId(newObject.id);
        saveToHistory();
      }
    }
  };

  const handleBringToFront = () => {
    if (selectedObjectId) {
      setObjects(prev => {
        const obj = prev.find(o => o.id === selectedObjectId);
        if (!obj) return prev;
        const filtered = prev.filter(o => o.id !== selectedObjectId);
        return [...filtered, obj];
      });
    saveToHistory();
    }
  };

  const handleSendToBack = () => {
    if (selectedObjectId) {
      setObjects(prev => {
        const obj = prev.find(o => o.id === selectedObjectId);
        if (!obj) return prev;
        const filtered = prev.filter(o => o.id !== selectedObjectId);
        return [obj, ...filtered];
      });
    saveToHistory();
    }
  };

  const handleUpdateSelectedColor = (color: string) => {
    if (selectedObjectId) {
      setObjects(prev => prev.map(obj => 
        obj.id === selectedObjectId ? { ...obj, color } : obj
      ));
      saveToHistory();
    } else {
      setCurrentColor(color);
    }
  };

  const handleUpdateSelectedStrokeWidth = (strokeWidth: number) => {
    if (selectedObjectId) {
      setObjects(prev => prev.map(obj => 
        obj.id === selectedObjectId ? { ...obj, strokeWidth } : obj
      ));
      saveToHistory();
    } else {
      setBrushSize(strokeWidth);
    }
  };

  const handleUpdateSelectedFill = (fillColor: string, fillOpacity: number) => {
    if (selectedObjectId) {
      setObjects(prev => prev.map(obj => 
        obj.id === selectedObjectId 
          ? { ...obj, fillColor: fillColor || undefined, fillOpacity: fillColor ? fillOpacity : undefined }
          : obj
      ));
    saveToHistory();
    } else {
      setCurrentFillColor(fillColor);
      setCurrentFillOpacity(fillOpacity);
    }
  };

  const handleClose = () => {
    if (objects.length > 0) {
      const confirmed = window.confirm('У вас є незбережені зміни. Ви впевнені, що хочете закрити без збереження?');
      if (!confirmed) return;
    }
    onClose();
  };

  const handleConfirm = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Convert canvas to PNG for image data
      const dataUrl = await toPng(canvas, {
        width: 1000,
        height: 1000,
        backgroundColor: '#FFFEF8',
        pixelRatio: 1,
      });
      
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Create FormData to send file
      const formData = new FormData();
      formData.append('image', blob, `custom-shape-${Date.now()}.png`);
      
      // Send to API endpoint
      const uploadResponse = await fetch('/api/upload-custom-shape', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      
      const { filePath } = await uploadResponse.json();
      
      // Create SVG wrapper with viewBox for proper scaling (no fixed width/height)
      const svgWrapper = `<svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
        <image href="${filePath}" x="0" y="0" width="1000" height="1000" />
      </svg>`;
      
      // Return SVG wrapper instead of just file path
      onSave(svgWrapper);
      onClose();
    } catch (error) {
      console.error('Canvas conversion failed:', error);
      alert('Не вдалося зберегти картинку. Спробуйте ще раз.');
    }
  };

  const selectedObject = objects.find(obj => obj.id === selectedObjectId);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 'auto',
          maxWidth: 'none',
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6">🎨 Конструктор Картинок</Typography>
          <Typography variant="body2" color="text.secondary">
            Намалюй картинку для розмальовки
          </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Chip 
              label={`Об'єктів: ${objects.length}`} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
            {selectedObject && (
              <Chip 
                label={`Вибрано: ${selectedObject.type}`} 
                size="small" 
                color="primary" 
              />
            )}
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, width: 1000 + 32 }}>
          {/* Toolbar */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Tools */}
              <Grid item>
                <Typography variant="caption" display="block" mb={0.5} fontWeight="bold">
                  Інструменти:
                </Typography>
                <ToggleButtonGroup
                  value={currentTool}
                  exclusive
                  onChange={(_, value) => value && setCurrentTool(value)}
                  size="small"
                >
                  <ToggleButton value="select">
                    <Tooltip title="Вибрати"><MousePointer size={18} /></Tooltip>
                  </ToggleButton>
                  <ToggleButton value="circle">
                    <Tooltip title="Коло"><Circle size={18} /></Tooltip>
                  </ToggleButton>
                  <ToggleButton value="square">
                    <Tooltip title="Квадрат"><Square size={18} /></Tooltip>
                  </ToggleButton>
                  <ToggleButton value="triangle">
                    <Tooltip title="Трикутник"><Triangle size={18} /></Tooltip>
                  </ToggleButton>
                  <ToggleButton value="line">
                    <Tooltip title="Лінія"><Minus size={18} /></Tooltip>
                  </ToggleButton>
                  <ToggleButton value="brush">
                    <Tooltip title="Олівець (вільне малювання)"><Pencil size={18} /></Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              <Divider orientation="vertical" flexItem />

              {/* Colors */}
              <Grid item>
                <Typography variant="caption" display="block" mb={0.5} fontWeight="bold">
                  {selectedObject ? 'Колір контуру:' : 'Колір:'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {COLORS.map((color) => (
                    <Box
                      key={color}
                      onClick={() => handleUpdateSelectedColor(color)}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: color,
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: (selectedObject ? selectedObject.color : currentColor) === color 
                          ? '3px solid #2196F3' 
                          : '2px solid #E0E0E0',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              <Divider orientation="vertical" flexItem />

              {/* Fill Color */}
              <Grid item>
                <Typography variant="caption" display="block" mb={0.5} fontWeight="bold">
                  Заливка:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <Box
                    onClick={() => handleUpdateSelectedFill('', 0)}
                    sx={{
                      width: 32,
                      height: 32,
                      position: 'relative',
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: (selectedObject ? !selectedObject.fillColor : !currentFillColor)
                        ? '3px solid #2196F3'
                        : '2px solid #E0E0E0',
                      bgcolor: '#fff',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        right: 0,
                        height: '2px',
                        bgcolor: '#f44336',
                        transform: 'rotate(-45deg)',
                      },
                    }}
                  />
                  {COLORS.slice(1, 5).map((color) => (
                    <Box
                      key={color}
                      onClick={() => handleUpdateSelectedFill(color, currentFillOpacity)}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: color,
                        borderRadius: 1,
                        cursor: 'pointer',
                        opacity: 0.5,
                        border: (selectedObject ? selectedObject.fillColor : currentFillColor) === color
                          ? '3px solid #2196F3'
                          : '2px solid #E0E0E0',
                        '&:hover': {
                          opacity: 0.8,
                        },
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              <Divider orientation="vertical" flexItem />

              {/* Brush Size */}
              <Grid item xs>
                <Typography variant="caption" display="block" mb={0.5} fontWeight="bold">
                  Товщина: {selectedObject ? selectedObject.strokeWidth : brushSize}px
                </Typography>
                <ToggleButtonGroup
                  value={selectedObject ? selectedObject.strokeWidth : brushSize}
                  exclusive
                  onChange={(_, value) => value && handleUpdateSelectedStrokeWidth(value)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value={10}>Тонка</ToggleButton>
                  <ToggleButton value={20}>Середня</ToggleButton>
                  <ToggleButton value={30}>Товста</ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              <Divider orientation="vertical" flexItem />

              {/* Actions */}
              <Grid item>
                <Typography variant="caption" display="block" mb={0.5} fontWeight="bold">
                  Дії:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  <Tooltip title="Відмінити (Ctrl+Z)">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleUndo}
                        disabled={historyStep <= 0}
                        sx={{ border: '1px solid', borderColor: 'divider' }}
                      >
                        <Undo size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Повторити (Ctrl+Y)">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleRedo}
                        disabled={historyStep >= history.length - 1}
                        sx={{ border: '1px solid', borderColor: 'divider' }}
                      >
                        <Redo size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Дублювати (Ctrl+D)">
                    <span>
                      <IconButton
                    size="small"
                        onClick={handleDuplicate}
                        disabled={!selectedObjectId}
                        sx={{ border: '1px solid', borderColor: 'divider' }}
                      >
                        <Copy size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="На передній план">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleBringToFront}
                        disabled={!selectedObjectId}
                        sx={{ border: '1px solid', borderColor: 'divider' }}
                      >
                        <ArrowUp size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="На задній план">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleSendToBack}
                        disabled={!selectedObjectId}
                        sx={{ border: '1px solid', borderColor: 'divider' }}
                      >
                        <ArrowDown size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Видалити (Delete)">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleDeleteSelected}
                        disabled={!selectedObjectId}
                        sx={{ border: '1px solid', borderColor: 'divider' }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Очистити все">
                    <IconButton
                    size="small"
                      onClick={handleClearAll}
                      sx={{ border: '1px solid', borderColor: 'divider' }}
                  >
                      <Eraser size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Canvas */}
          <Paper
            sx={{
              width: 1000,
              height: 1000,
              mx: 'auto',
              bgcolor: '#FFFEF8',
              border: '2px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            <canvas
              ref={canvasRef}
              width={1000}
              height={1000}
              onMouseDown={startDrawing}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDrawing}
              onMouseLeave={() => {
                setIsDrawing(false);
                setIsDragging(false);
                setIsResizing(false);
                setCurrentPath([]);
              }}
              style={{
                cursor: currentTool === 'select' ? cursorStyle : currentTool === 'brush' ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'2\' fill=\'%23000\'/%3E%3C/svg%3E") 10 10, auto' : 'crosshair',
                display: 'block',
                width: '1000px',
                height: '1000px',
              }}
            />
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Скасувати</Button>
        <Button
          variant="contained"
          startIcon={<Check />}
          onClick={handleConfirm}
        >
          Підтвердити
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShapeConstructor;
