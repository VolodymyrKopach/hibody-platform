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
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Popover,
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
  Sparkles,
  Palette,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { svgLayerService } from '@/services/images/SvgLayerService';
import { svgToObjectsService } from '@/services/images/SvgToObjectsService';
import { SvgLayer } from '@/types/svg';
import ImageLibraryPanel from './ImageLibraryPanel';
import * as LucideIcons from 'lucide-react';
import { 
  getAgeGroupPromptModifier, 
  getAgeGroupSuggestions,
  enhancePromptForAge 
} from '@/utils/ageGroupPromptHelper';

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
  pathData?: string; // For SVG path elements
  originalSvgType?: string; // Track original SVG element type
  order: number; // Z-index for layer ordering
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

// Extended color palette for picker
const EXTENDED_COLORS = [
  // Reds
  '#FF0000', '#FF6B6B', '#FF3838', '#C92A2A', '#8B0000',
  // Oranges
  '#FFA500', '#FF8C00', '#FFB84D', '#FF7F00', '#CC5500',
  // Yellows
  '#FFFF00', '#FFD700', '#FFF44F', '#FFEB3B', '#F9A825',
  // Greens
  '#00FF00', '#4CAF50', '#00C853', '#2E7D32', '#1B5E20',
  // Cyans
  '#00FFFF', '#00BCD4', '#00ACC1', '#0097A7', '#006064',
  // Blues
  '#0000FF', '#2196F3', '#1976D2', '#1565C0', '#0D47A1',
  // Purples
  '#FF00FF', '#9C27B0', '#7B1FA2', '#6A1B9A', '#4A148C',
  // Pinks
  '#FFB3D9', '#FF69B4', '#FF1493', '#C71585', '#FF69B4',
  // Browns
  '#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DEB887',
  // Grays
  '#000000', '#424242', '#757575', '#9E9E9E', '#E0E0E0',
  // Whites & Light
  '#FFFFFF', '#FAFAFA', '#F5F5F5', '#EEEEEE', '#BDBDBD',
];

const ShapeConstructor: React.FC<ShapeConstructorProps> = ({ open, onClose, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentFillColor, setCurrentFillColor] = useState<string>('#FFFFFF'); // White fill by default
  const [currentFillOpacity, setCurrentFillOpacity] = useState(1.0); // Full opacity
  const [brushSize, setBrushSize] = useState(10);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
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

  // AI SVG Generation
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatedSvg, setGeneratedSvg] = useState<string>('');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [svgComplexity, setSvgComplexity] = useState<'simple' | 'medium' | 'detailed'>('medium');
  const [svgStyle, setSvgStyle] = useState<'cartoon' | 'outline' | 'geometric' | 'realistic'>('outline');
  const [isSvgLoading, setIsSvgLoading] = useState(false);
  const svgBlobUrlRef = useRef<string | null>(null);
  const svgImageRef = useRef<HTMLImageElement | null>(null);
  const [currentAgeGroup, setCurrentAgeGroup] = useState<string>('8-9');
  
  // AI Variants
  const [aiVariants, setAiVariants] = useState<{ svg: string; id: string }[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [variantGenerationProgress, setVariantGenerationProgress] = useState<number>(0);
  
  // Image Library
  const [showLibraryPanel, setShowLibraryPanel] = useState(false);
  
  // SVG Layers
  const [svgLayers, setSvgLayers] = useState<SvgLayer[]>([]);
  
  // Color Pickers
  const [strokeColorAnchor, setStrokeColorAnchor] = useState<HTMLElement | null>(null);
  const [fillColorAnchor, setFillColorAnchor] = useState<HTMLElement | null>(null);
  
  // Confirmation Dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    severity: 'error' | 'warning' | 'info' | 'success';
  }>({
    open: false,
    title: '',
    message: '',
    severity: 'info',
  });

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
    setGeneratedSvg('');
    setAiPrompt('');
    setShowAIPanel(false);
    setSvgLayers([]);
    setShowLayersPanel(false);
    
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
    ctx.fillStyle = '#FFFFFF'; // White background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw generated AI SVG as background if exists
    if (generatedSvg) {
      // Use cached image if available
      if (svgImageRef.current && svgImageRef.current.complete) {
        ctx.drawImage(svgImageRef.current, 0, 0, canvas.width, canvas.height);
        const sortedObjects = [...objects].sort((a, b) => a.order - b.order);
        sortedObjects.forEach((obj) => {
          drawObject(ctx, obj, obj.id === selectedObjectId);
        });
        setIsSvgLoading(false);
      } else {
        // Create new image only if needed
        setIsSvgLoading(true);
        
        // Clean up previous blob URL
        if (svgBlobUrlRef.current) {
          URL.revokeObjectURL(svgBlobUrlRef.current);
          svgBlobUrlRef.current = null;
        }
        
        const img = new Image();
        svgImageRef.current = img;
        
        const svgBlob = new Blob([generatedSvg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        svgBlobUrlRef.current = url;
        
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const sortedObjects = [...objects].sort((a, b) => a.order - b.order);
          sortedObjects.forEach((obj) => {
            drawObject(ctx, obj, obj.id === selectedObjectId);
          });
          setIsSvgLoading(false);
        };
        
        img.onerror = () => {
          console.error('❌ Failed to load SVG');
          setIsSvgLoading(false);
          // Draw objects anyway
          const sortedObjects = [...objects].sort((a, b) => a.order - b.order);
          sortedObjects.forEach((obj) => {
            drawObject(ctx, obj, obj.id === selectedObjectId);
          });
        };
        
        img.src = url;
      }
      return;
    }

    // Draw all objects (sorted by order for correct z-index)
    const sortedObjects = [...objects].sort((a, b) => a.order - b.order);
    sortedObjects.forEach((obj) => {
      drawObject(ctx, obj, obj.id === selectedObjectId);
    });
  }, [objects, selectedObjectId, generatedSvg]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Cleanup blob URL on unmount or when SVG changes
  useEffect(() => {
    return () => {
      if (svgBlobUrlRef.current) {
        URL.revokeObjectURL(svgBlobUrlRef.current);
        svgBlobUrlRef.current = null;
      }
      svgImageRef.current = null;
    };
  }, [generatedSvg]);

  // Helper: Get next order number for new objects
  const getNextOrder = useCallback(() => {
    if (objects.length === 0) return 0;
    return Math.max(...objects.map(obj => obj.order)) + 1;
  }, [objects]);

  const drawObject = (ctx: CanvasRenderingContext2D, obj: ShapeObject, isSelected: boolean) => {
    ctx.save();
    
    // Draw fill if exists (not for line, path handles fill separately)
    if (obj.fillColor && (obj.fillOpacity === undefined || obj.fillOpacity > 0) && obj.type !== 'line') {
      ctx.fillStyle = obj.fillColor;
      ctx.globalAlpha = obj.fillOpacity !== undefined ? obj.fillOpacity : 1;
      
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
        if (obj.pathData) {
          // SVG path from AI
          try {
            const path2D = new Path2D(obj.pathData);
            
            // Apply translation for position
            ctx.save();
            ctx.translate(obj.x, obj.y);
            
            // Draw fill if exists
            if (obj.fillColor && (obj.fillOpacity === undefined || obj.fillOpacity > 0)) {
              ctx.fillStyle = obj.fillColor;
              ctx.globalAlpha = obj.fillOpacity !== undefined ? obj.fillOpacity : 1;
              ctx.fill(path2D);
              ctx.globalAlpha = 1;
            }
            
            // Draw stroke
            ctx.stroke(path2D);
            ctx.restore();
          } catch (error) {
            console.error('Failed to render path:', error);
          }
        } else if (obj.points && obj.points.length > 1) {
          // Freehand brush path
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
        order: getNextOrder(),
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
      const nextOrder = getNextOrder();
      const newObject: ShapeObject = currentTool === 'line' ? {
        id: crypto.randomUUID(),
        type: currentTool,
        x: startPos.x,
        y: startPos.y,
        width: point.x - startPos.x,
        height: point.y - startPos.y,
        color: currentColor,
        strokeWidth: brushSize,
        fillColor: currentFillColor,
        fillOpacity: currentFillOpacity,
        order: nextOrder,
      } : {
        id: crypto.randomUUID(),
        type: currentTool,
        x: Math.min(startPos.x, point.x),
        y: Math.min(startPos.y, point.y),
        width,
        height,
        color: currentColor,
        strokeWidth: brushSize,
        fillColor: currentFillColor,
        fillOpacity: currentFillOpacity,
        order: nextOrder,
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
    setGeneratedSvg('');
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
          order: getNextOrder(),
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

  // Helper function to clear all state
  const clearAllState = () => {
    setObjects([]);
    setSelectedObjectId(null);
    setHistory([{ objects: [] }]);
    setHistoryStep(0);
    setGeneratedSvg('');
    setAiPrompt('');
    setShowAIPanel(false);
    setSvgLayers([]);
    setShowLayersPanel(false);
    setCurrentTool('select');
    setIsDrawing(false);
    setStartPos(null);
    setCurrentPath([]);
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleClose = () => {
    if (objects.length > 0) {
      setConfirmDialog({
        open: true,
        title: '💾 Незбережені зміни',
        message: `На полотні є ${objects.length} об'єкт(ів). Ви впевнені, що хочете закрити без збереження?`,
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, open: false }));
          clearAllState();
          onClose();
        },
      });
      return;
    }
    
    clearAllState();
    onClose();
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      setAlertDialog({
        open: true,
        title: '⚠️ Порожній запит',
        message: 'Будь ласка, введіть опис картинки',
        severity: 'warning',
      });
      return;
    }

    // Warn user if there are existing objects
    if (objects.length > 0) {
      setConfirmDialog({
        open: true,
        title: '🎨 Генерація нової картинки',
        message: `На полотні є ${objects.length} об'єкт(ів). Генерація нової картинки видалить їх.\n\nПродовжити?`,
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, open: false }));
          startAIGeneration();
        },
      });
      return;
    }

    startAIGeneration();
  };

  const startAIGeneration = async () => {
    setIsGeneratingAI(true);
    setAiVariants([]);
    setSelectedVariantId(null);
    setVariantGenerationProgress(0);

    try {
      console.log('🎨 Starting SVG generation (4 variants) via Gemini...', {
        prompt: aiPrompt.substring(0, 50) + '...',
        complexity: svgComplexity,
        style: svgStyle,
        ageGroup: currentAgeGroup
      });

      // Enhance prompt with age modifiers
      const enhancedPrompt = enhancePromptForAge(aiPrompt, currentAgeGroup, svgComplexity);
      
      const variants: { svg: string; id: string }[] = [];
      
      // Generate 4 variants sequentially
      for (let i = 0; i < 4; i++) {
        try {
          console.log(`🎨 Generating variant ${i + 1}/4...`);
          setVariantGenerationProgress(i + 1);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          const response = await fetch('/api/images/generate-svg', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: enhancedPrompt,
              width: 1000,
              height: 1000,
              complexity: svgComplexity,
              style: svgStyle,
              seed: Math.random(), // Different seed for each variant
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.svg) {
              // Validate SVG size
              const svgSizeKB = data.svg.length / 1024;
              if (svgSizeKB < 500) {
                variants.push({ svg: data.svg, id: crypto.randomUUID() });
                console.log(`✅ Variant ${i + 1} generated successfully`);
              } else {
                console.warn(`⚠️ Variant ${i + 1} too large (${svgSizeKB.toFixed(0)}KB), skipping`);
              }
            }
          } else {
            console.warn(`⚠️ Variant ${i + 1} failed`);
          }
        } catch (error) {
          console.error(`❌ Variant ${i + 1} error:`, error);
          // Continue with next variant even if one fails
        }
      }

      if (variants.length === 0) {
        throw new Error('Не вдалося згенерувати жодного варіанту');
      }

      setAiVariants(variants);
      
      // Auto-select first variant
      if (variants.length > 0) {
        await handleSelectVariant(variants[0]);
      }
      
      console.log(`✅ Generated ${variants.length} variants successfully`);
      
    } catch (error) {
      console.error('❌ SVG generation error:', error);
      
      let errorMessage = 'Не вдалося згенерувати SVG через AI.';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Генерація займає занадто багато часу. Спробуйте простіший опис.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Проблема з підключенням до інтернету. Перевірте з\'єднання.';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      setAlertDialog({
        open: true,
        title: '❌ Помилка генерації',
        message: errorMessage + '\n\nПорада: спробуйте змінити опис або налаштування складності.',
        severity: 'error',
      });
    } finally {
      setIsGeneratingAI(false);
      setVariantGenerationProgress(0);
    }
  };

  const handleSelectVariant = async (variant: { svg: string; id: string }) => {
    setSelectedVariantId(variant.id);
    
    // Clear previous objects and SVG
    setObjects([]);
    setGeneratedSvg('');
    setSvgLayers([]);
    setSelectedObjectId(null);
    
    // Convert SVG to objects
    try {
      const layers = svgLayerService.parseSvgIntoLayers(variant.svg);
      const newObjects = svgToObjectsService.convertAllLayersToObjects(layers, 0);
      
      if (newObjects.length > 0) {
        setObjects(newObjects);
        saveToHistory();
        console.log(`✅ Converted variant to ${newObjects.length} objects`);
      }
    } catch (error) {
      console.error('Failed to convert variant:', error);
      setAlertDialog({
        open: true,
        title: '⚠️ Помилка конвертації',
        message: 'Не вдалося конвертувати варіант в об\'єкти',
        severity: 'error',
      });
    }
  };

  const handleModifyComplexity = async (direction: 'simpler' | 'more-complex') => {
    const modifiedPrompt = direction === 'simpler'
      ? `${aiPrompt}. Make it SIMPLER, with fewer details, basic shapes only, minimal elements`
      : `${aiPrompt}. Make it MORE DETAILED, add more elements, textures, and complexity`;
    
    setAiPrompt(modifiedPrompt);
    
    // Clear variants and regenerate
    setAiVariants([]);
    setSelectedVariantId(null);
    
    // Trigger regeneration
    await handleGenerateAI();
  };

  const handleAddLibraryItem = async (iconName: string, itemName: string) => {
    try {
      // Get the lucide icon component
      const IconComponent = (LucideIcons as any)[iconName];
      if (!IconComponent) {
        throw new Error('Icon not found');
      }
      
      // Create a simple SVG from the lucide icon
      // We'll create a basic shape object instead of complex SVG parsing
      const newObject: ShapeObject = {
        id: crypto.randomUUID(),
        type: 'path',
        x: 400,
        y: 400,
        width: 200,
        height: 200,
        color: currentColor,
        strokeWidth: brushSize,
        fillColor: currentFillColor,
        fillOpacity: currentFillOpacity,
        order: getNextOrder(),
        originalSvgType: itemName,
      };
      
      setObjects(prev => [...prev, newObject]);
      saveToHistory();
      
      console.log(`✅ Added library item: ${itemName}`);
    } catch (error) {
      console.error('Failed to add library item:', error);
      setAlertDialog({
        open: true,
        title: '❌ Помилка',
        message: 'Не вдалося додати елемент з бібліотеки',
        severity: 'error',
      });
    }
  };

  const handleClearAISvg = () => {
    setConfirmDialog({
      open: true,
      title: '🗑️ Очистити запит',
      message: 'Ви впевнені, що хочете очистити поле запиту?',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        setAiPrompt('');
        setGeneratedSvg('');
        setSvgLayers([]);
      },
    });
  };

  // Layer management handlers
  const handleLayerMoveUp = useCallback((layerId: string) => {
    const updated = svgLayerService.moveLayerUp(svgLayers, layerId);
    setSvgLayers(updated.layers);
    
    // Reconstruct and update SVG
    if (generatedSvg) {
      const newSvg = svgLayerService.reconstructSvg(generatedSvg, updated.layers);
      setGeneratedSvg(newSvg);
    }
  }, [svgLayers, generatedSvg]);

  const handleLayerMoveDown = useCallback((layerId: string) => {
    const updated = svgLayerService.moveLayerDown(svgLayers, layerId);
    setSvgLayers(updated.layers);
    
    // Reconstruct and update SVG
    if (generatedSvg) {
      const newSvg = svgLayerService.reconstructSvg(generatedSvg, updated.layers);
      setGeneratedSvg(newSvg);
    }
  }, [svgLayers, generatedSvg]);

  const handleLayerToggleVisibility = useCallback((layerId: string) => {
    const updated = svgLayerService.toggleLayerVisibility(svgLayers, layerId);
    setSvgLayers(updated.layers);
    
    // Reconstruct and update SVG
    if (generatedSvg) {
      const newSvg = svgLayerService.reconstructSvg(generatedSvg, updated.layers);
      setGeneratedSvg(newSvg);
    }
  }, [svgLayers, generatedSvg]);

  const handleLayerRemove = useCallback((layerId: string) => {
    const updated = svgLayerService.removeLayer(svgLayers, layerId);
    setSvgLayers(updated.layers);
    
    // Reconstruct and update SVG
    if (generatedSvg) {
      const newSvg = svgLayerService.reconstructSvg(generatedSvg, updated.layers);
      setGeneratedSvg(newSvg);
    }
  }, [svgLayers, generatedSvg]);

  // Conversion handlers
  const handleConvertLayerToObjects = useCallback((layerId: string) => {
    const layer = svgLayers.find(l => l.id === layerId);
    if (!layer) return;

    try {
      const startOrder = getNextOrder();
      const newObjects = svgToObjectsService.convertSvgLayerToObjects(layer, startOrder);
      
      if (newObjects.length > 0) {
        setObjects(prev => [...prev, ...newObjects]);
        
        // Remove layer from SVG
        handleLayerRemove(layerId);
        
        // Save to history
        setHistory(prev => [...prev.slice(0, historyStep + 1), { objects: [...objects, ...newObjects] }]);
        setHistoryStep(prev => prev + 1);
        
        console.log(`✅ Converted layer "${layer.name}" to ${newObjects.length} objects`);
      }
        } catch (error) {
          console.error('Failed to convert layer:', error);
          setAlertDialog({
            open: true,
            title: '❌ Помилка',
            message: 'Не вдалося конвертувати шар в об\'єкти',
            severity: 'error',
          });
        }
  }, [svgLayers, objects, historyStep, handleLayerRemove, getNextOrder]);

  const handleConvertAllLayersToObjects = useCallback(() => {
    try {
      const startOrder = getNextOrder();
      const newObjects = svgToObjectsService.convertAllLayersToObjects(svgLayers, startOrder);
      
      if (newObjects.length > 0) {
        setObjects(prev => [...prev, ...newObjects]);
        
        // Clear SVG and layers
        setGeneratedSvg('');
        setSvgLayers([]);
        setShowLayersPanel(false);
        
        // Save to history
        setHistory(prev => [...prev.slice(0, historyStep + 1), { objects: [...objects, ...newObjects] }]);
        setHistoryStep(prev => prev + 1);
        
        console.log(`✅ Converted all layers to ${newObjects.length} objects`);
      }
      } catch (error) {
        console.error('Failed to convert layers:', error);
        setAlertDialog({
          open: true,
          title: '❌ Помилка',
          message: 'Не вдалося конвертувати шари в об\'єкти',
          severity: 'error',
        });
      }
  }, [svgLayers, objects, historyStep, getNextOrder]);

  // Object ordering handlers
  const handleMoveObjectUp = useCallback((objectId: string) => {
    const sortedObjects = [...objects].sort((a, b) => a.order - b.order);
    const index = sortedObjects.findIndex(obj => obj.id === objectId);
    
    if (index === -1 || index === sortedObjects.length - 1) return;
    
    // Swap orders
    const newObjects = objects.map(obj => {
      if (obj.id === sortedObjects[index].id) {
        return { ...obj, order: sortedObjects[index + 1].order };
      }
      if (obj.id === sortedObjects[index + 1].id) {
        return { ...obj, order: sortedObjects[index].order };
      }
      return obj;
    });
    
    setObjects(newObjects);
    saveToHistory();
  }, [objects, saveToHistory]);

  const handleMoveObjectDown = useCallback((objectId: string) => {
    const sortedObjects = [...objects].sort((a, b) => a.order - b.order);
    const index = sortedObjects.findIndex(obj => obj.id === objectId);
    
    if (index === -1 || index === 0) return;
    
    // Swap orders
    const newObjects = objects.map(obj => {
      if (obj.id === sortedObjects[index].id) {
        return { ...obj, order: sortedObjects[index - 1].order };
      }
      if (obj.id === sortedObjects[index - 1].id) {
        return { ...obj, order: sortedObjects[index].order };
      }
      return obj;
    });
    
    setObjects(newObjects);
    saveToHistory();
  }, [objects, saveToHistory]);

  const handleMoveObjectToFront = useCallback((objectId: string) => {
    const maxOrder = Math.max(...objects.map(obj => obj.order));
    const newObjects = objects.map(obj => {
      if (obj.id === objectId) {
        return { ...obj, order: maxOrder + 1 };
      }
      return obj;
    });
    
    setObjects(newObjects);
    saveToHistory();
  }, [objects, saveToHistory]);

  const handleMoveObjectToBack = useCallback((objectId: string) => {
    const minOrder = Math.min(...objects.map(obj => obj.order));
    const newObjects = objects.map(obj => {
      if (obj.id === objectId) {
        return { ...obj, order: minOrder - 1 };
      }
      return obj;
    });
    
    setObjects(newObjects);
    saveToHistory();
  }, [objects, saveToHistory]);

  const handleConfirm = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Wait for SVG to fully load before converting
      if (generatedSvg && isSvgLoading) {
        console.log('⏳ Waiting for SVG to load...');
        await new Promise<void>((resolve) => {
          const checkLoading = () => {
            if (!isSvgLoading) {
              resolve();
            } else {
              setTimeout(checkLoading, 100);
            }
          };
          checkLoading();
        });
      }

      // Force redraw to ensure everything is rendered
      if (generatedSvg) {
        const ctx = canvas.getContext('2d');
        if (ctx && svgImageRef.current && svgImageRef.current.complete) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(svgImageRef.current, 0, 0, canvas.width, canvas.height);
          objects.forEach((obj) => {
            drawObject(ctx, obj, obj.id === selectedObjectId);
          });
        }
      }

      console.log('📸 Converting canvas to PNG...');
      
      // Convert canvas to PNG for image data
      const dataUrl = await toPng(canvas, {
        width: 1000,
        height: 1000,
        backgroundColor: '#FFFFFF',
        pixelRatio: 1,
      });
      
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Create FormData to send file
      const formData = new FormData();
      formData.append('image', blob, `custom-shape-${Date.now()}.png`);
      
      console.log('☁️ Uploading image...');
      
      // Send to API endpoint
      const uploadResponse = await fetch('/api/upload-custom-shape', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      
      const { filePath } = await uploadResponse.json();
      
      console.log('✅ Image uploaded successfully:', filePath);
      
      // Create SVG wrapper with viewBox for proper scaling (no fixed width/height)
      const svgWrapper = `<svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
        <image href="${filePath}" x="0" y="0" width="1000" height="1000" />
      </svg>`;
      
      // Return SVG wrapper instead of just file path
      onSave(svgWrapper);
      
      // Clear all state after successful save
      clearAllState();
      onClose();
    } catch (error) {
      console.error('❌ Canvas conversion failed:', error);
      setAlertDialog({
        open: true,
        title: '❌ Помилка збереження',
        message: 'Не вдалося зберегти картинку. Спробуйте ще раз.',
        severity: 'error',
      });
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
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant={showLibraryPanel ? 'contained' : 'outlined'}
              size="small"
              startIcon={<Layers size={16} />}
              onClick={() => setShowLibraryPanel(!showLibraryPanel)}
            >
              Бібліотека
            </Button>
            <Button
              variant={showAIPanel ? 'contained' : 'outlined'}
              size="small"
              startIcon={<Sparkles size={16} />}
              onClick={() => setShowAIPanel(!showAIPanel)}
            >
              AI Генерація
            </Button>
            <Button
              variant={showLayersPanel ? 'contained' : 'outlined'}
              size="small"
              startIcon={<Layers size={16} />}
              onClick={() => setShowLayersPanel(!showLayersPanel)}
            >
              Шари об'єктів ({objects.length})
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled
              sx={{
                minWidth: 'auto',
                pointerEvents: 'none',
                '&.Mui-disabled': {
                  color: 'primary.main',
                  borderColor: 'primary.main',
                  opacity: 1,
                },
              }}
            >
              Об'єктів: {objects.length}
            </Button>
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
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* AI Generation Panel */}
          {showAIPanel && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5, 
                mb: 2,
                width: 1000,
                bgcolor: '#f8f9fa',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              {/* Header */}
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Sparkles size={20} style={{ color: '#6366f1' }} />
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  AI Генератор
                </Typography>
              </Box>
              
              {/* Settings */}
              <Grid container spacing={2} mb={2}>
                {/* Complexity */}
                <Grid item xs={6}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary', 
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.5,
                      fontSize: '0.6rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Складність
                  </Typography>
                  <ToggleButtonGroup
                    value={svgComplexity}
                    exclusive
                    onChange={(_, value) => value && setSvgComplexity(value)}
                    disabled={isGeneratingAI}
                    fullWidth
                    size="small"
                    sx={{
                      '& .MuiToggleButton-root': {
                        bgcolor: 'white',
                        color: 'text.secondary',
                        border: '1px solid',
                        borderColor: 'divider',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        py: 0.5,
                        '&:hover': {
                          bgcolor: '#f1f5f9',
                          borderColor: '#6366f1',
                        },
                        '&.Mui-selected': {
                          bgcolor: '#6366f1',
                          color: 'white',
                          borderColor: '#6366f1',
                          '&:hover': {
                            bgcolor: '#4f46e5',
                          },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="simple">Проста</ToggleButton>
                    <ToggleButton value="medium">Середня</ToggleButton>
                    <ToggleButton value="detailed">Детальна</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>

                {/* Style */}
                <Grid item xs={6}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary', 
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.5,
                      fontSize: '0.6rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Стиль
                  </Typography>
                  <ToggleButtonGroup
                    value={svgStyle}
                    exclusive
                    onChange={(_, value) => value && setSvgStyle(value)}
                    disabled={isGeneratingAI}
                    fullWidth
                    size="small"
                    sx={{
                      '& .MuiToggleButton-root': {
                        bgcolor: 'white',
                        color: 'text.secondary',
                        border: '1px solid',
                        borderColor: 'divider',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        py: 0.5,
                        '&:hover': {
                          bgcolor: '#f1f5f9',
                          borderColor: '#6366f1',
                        },
                        '&.Mui-selected': {
                          bgcolor: '#6366f1',
                          color: 'white',
                          borderColor: '#6366f1',
                          '&:hover': {
                            bgcolor: '#4f46e5',
                          },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="outline">Контур</ToggleButton>
                    <ToggleButton value="cartoon">Мультяшний</ToggleButton>
                    <ToggleButton value="geometric">Геометрія</ToggleButton>
                    <ToggleButton value="realistic">Реалістичний</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
              </Grid>

              {/* Age Group Suggestions */}
              <Box sx={{ mt: 1.5, mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  💡 Ідеї для віку {currentAgeGroup} років:
                </Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {getAgeGroupSuggestions(currentAgeGroup).map((suggestion) => (
                    <Chip
                      key={suggestion}
                      label={suggestion}
                      size="small"
                      onClick={() => setAiPrompt(suggestion)}
                      sx={{ fontSize: '0.7rem', cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Prompt Input */}
              <Box display="flex" gap={1} alignItems="stretch">
                <TextField
                  fullWidth
                  placeholder="Опишіть картинку... (напр: динозавр для розмальовки)"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={isGeneratingAI}
                  size="small"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      fontSize: '0.875rem',
                      height: '36.5px',
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '8.5px 14px',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI || !aiPrompt.trim()}
                  startIcon={isGeneratingAI ? <CircularProgress size={16} color="inherit" /> : <Sparkles size={16} />}
                  sx={{
                    bgcolor: '#6366f1',
                    minWidth: 120,
                    height: '36.5px',
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: '#4f46e5',
                    },
                  }}
                >
                  {isGeneratingAI ? `Генерація (${variantGenerationProgress}/4)...` : 'Згенерувати 4 варіанти'}
                </Button>
              </Box>

              {/* Progress Indicator */}
              {isGeneratingAI && variantGenerationProgress > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    Генерується варіант {variantGenerationProgress} з 4...
                  </Typography>
                  <Box sx={{ width: '100%', bgcolor: '#e0e0e0', borderRadius: 1, height: 8 }}>
                    <Box
                      sx={{
                        width: `${(variantGenerationProgress / 4) * 100}%`,
                        bgcolor: '#6366f1',
                        height: '100%',
                        borderRadius: 1,
                        transition: 'width 0.3s',
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* Variants Display */}
              {aiVariants.length > 0 && !isGeneratingAI && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" mb={1} fontWeight={600}>
                    Виберіть варіант ({aiVariants.length}):
                  </Typography>
                  <Grid container spacing={1}>
                    {aiVariants.map((variant, index) => (
                      <Grid item xs={3} key={variant.id}>
                        <Paper
                          onClick={() => handleSelectVariant(variant)}
                          sx={{
                            p: 1,
                            cursor: 'pointer',
                            border: '3px solid',
                            borderColor: selectedVariantId === variant.id ? '#6366f1' : '#ddd',
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: '#6366f1',
                              transform: 'translateY(-2px)',
                              boxShadow: 2,
                            },
                            bgcolor: 'white',
                          }}
                        >
                          <Box
                            sx={{
                              height: 120,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                            }}
                            dangerouslySetInnerHTML={{ __html: variant.svg }}
                          />
                          <Typography
                            variant="caption"
                            display="block"
                            textAlign="center"
                            fontWeight={selectedVariantId === variant.id ? 600 : 400}
                            color={selectedVariantId === variant.id ? 'primary' : 'text.secondary'}
                          >
                            Варіант {index + 1}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Complexity Modification Buttons */}
              {aiVariants.length > 0 && !isGeneratingAI && (
                <Box display="flex" gap={1} mt={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleModifyComplexity('simpler')}
                    startIcon={<span>⬇️</span>}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#6366f1',
                      color: '#6366f1',
                      '&:hover': {
                        borderColor: '#4f46e5',
                        bgcolor: '#f0f0ff',
                      },
                    }}
                  >
                    Зробити простіше
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleModifyComplexity('more-complex')}
                    startIcon={<span>⬆️</span>}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#6366f1',
                      color: '#6366f1',
                      '&:hover': {
                        borderColor: '#4f46e5',
                        bgcolor: '#f0f0ff',
                      },
                    }}
                  >
                    Зробити складніше
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      setAiVariants([]);
                      setSelectedVariantId(null);
                    }}
                    startIcon={<Eraser size={14} />}
                    sx={{
                      ml: 'auto',
                      color: 'text.secondary',
                      textTransform: 'none',
                    }}
                  >
                    Очистити варіанти
                  </Button>
                </Box>
              )}
            </Paper>
          )}

          {/* Image Library Panel */}
          {showLibraryPanel && (
            <ImageLibraryPanel
              onSelectItem={handleAddLibraryItem}
              currentAgeGroup={currentAgeGroup}
            />
          )}

          {/* Objects Layers Panel */}
          {showLayersPanel && objects.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                width: 1000,
                bgcolor: '#f8f9fa',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              {/* Header */}
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Layers size={20} style={{ color: '#6366f1' }} />
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  Шари об'єктів
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Змініть порядок об'єктів для контролю накладання
                </Typography>
              </Box>

              {/* Objects List */}
              <Box
                sx={{
                  bgcolor: 'white',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  maxHeight: 400,
                  overflowY: 'auto',
                }}
              >
                {[...objects].sort((a, b) => b.order - a.order).map((obj, index, sortedArr) => (
                  <Box
                    key={obj.id}
                    onClick={() => setSelectedObjectId(obj.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderBottom: index < sortedArr.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                      bgcolor: obj.id === selectedObjectId ? '#e0e7ff' : 'white',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: obj.id === selectedObjectId ? '#e0e7ff' : '#f8f9fa',
                      },
                    }}
                  >
                    {/* Object Type Icon */}
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#e0e7ff',
                        borderRadius: 1,
                        flexShrink: 0,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontSize: '1.2rem' }}>
                        {obj.type === 'circle' ? '⭕' : 
                         obj.type === 'square' ? '⬜' : 
                         obj.type === 'triangle' ? '🔺' : 
                         obj.type === 'line' ? '➖' : 
                         obj.type === 'path' ? '✏️' : '📄'}
                      </Typography>
                    </Box>

                    {/* Object Name */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {obj.originalSvgType ? `${obj.originalSvgType} (AI)` : obj.type === 'path' && obj.points ? 'Малюнок' : obj.type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Order: {obj.order}
                      </Typography>
                    </Box>

                    {/* Object Controls */}
                    <Box display="flex" gap={0.5} onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="На передній план">
                        <IconButton
                          size="small"
                          onClick={() => handleMoveObjectToFront(obj.id)}
                          sx={{
                            '&:hover': {
                              bgcolor: '#f1f5f9',
                            },
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: '0.9rem' }}>⬆️⬆️</Typography>
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Підняти">
                        <span>
                          <IconButton
                            size="small"
                            disabled={index === 0}
                            onClick={() => handleMoveObjectUp(obj.id)}
                            sx={{
                              '&:hover': {
                                bgcolor: '#f1f5f9',
                              },
                            }}
                          >
                            <ArrowUp size={14} />
                          </IconButton>
                        </span>
                      </Tooltip>
                      
                      <Tooltip title="Опустити">
                        <span>
                          <IconButton
                            size="small"
                            disabled={index === sortedArr.length - 1}
                            onClick={() => handleMoveObjectDown(obj.id)}
                            sx={{
                              '&:hover': {
                                bgcolor: '#f1f5f9',
                              },
                            }}
                          >
                            <ArrowDown size={14} />
                          </IconButton>
                        </span>
                      </Tooltip>
                      
                      <Tooltip title="На задній план">
                        <IconButton
                          size="small"
                          onClick={() => handleMoveObjectToBack(obj.id)}
                          sx={{
                            '&:hover': {
                              bgcolor: '#f1f5f9',
                            },
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: '0.9rem' }}>⬇️⬇️</Typography>
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Видалити">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setObjects(prev => prev.filter(o => o.id !== obj.id));
                            if (selectedObjectId === obj.id) setSelectedObjectId(null);
                            saveToHistory();
                          }}
                          sx={{
                            color: '#ef4444',
                            '&:hover': {
                              bgcolor: '#fee2e2',
                            },
                          }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Help Text */}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                💡 Порада: Об'єкти зверху списку відображаються на передньому плані
              </Typography>
            </Paper>
          )}

          {/* Toolbar */}
          <Paper sx={{ p: 2, mb: 2, width: 1000 }}>
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
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
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
                  <Tooltip title="Більше кольорів">
                    <IconButton
                      size="small"
                      onClick={(e) => setStrokeColorAnchor(e.currentTarget)}
                      sx={{
                        width: 32,
                        height: 32,
                        border: '2px solid #E0E0E0',
                        borderRadius: 1,
                        '&:hover': {
                          border: '2px solid #2196F3',
                        },
                      }}
                    >
                      <Palette size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                {/* Stroke Color Picker Popover */}
                <Popover
                  open={Boolean(strokeColorAnchor)}
                  anchorEl={strokeColorAnchor}
                  onClose={() => setStrokeColorAnchor(null)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                >
                  <Box sx={{ p: 2, width: 280 }}>
                    <Typography variant="subtitle2" mb={1} fontWeight="bold">
                      Виберіть колір контуру
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: 0.5,
                      }}
                    >
                      {EXTENDED_COLORS.map((color) => (
                        <Tooltip key={color} title={color}>
                          <Box
                            onClick={() => {
                              handleUpdateSelectedColor(color);
                              setStrokeColorAnchor(null);
                            }}
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: color,
                              borderRadius: 1,
                              cursor: 'pointer',
                              border: (selectedObject ? selectedObject.color : currentColor) === color
                                ? '3px solid #2196F3'
                                : '1px solid #E0E0E0',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                boxShadow: 2,
                              },
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>
                </Popover>
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
                  <Tooltip title="Більше кольорів">
                    <IconButton
                      size="small"
                      onClick={(e) => setFillColorAnchor(e.currentTarget)}
                      sx={{
                        width: 32,
                        height: 32,
                        border: '2px solid #E0E0E0',
                        borderRadius: 1,
                        '&:hover': {
                          border: '2px solid #2196F3',
                        },
                      }}
                    >
                      <Palette size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                {/* Fill Color Picker Popover */}
                <Popover
                  open={Boolean(fillColorAnchor)}
                  anchorEl={fillColorAnchor}
                  onClose={() => setFillColorAnchor(null)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                >
                  <Box sx={{ p: 2, width: 280 }}>
                    <Typography variant="subtitle2" mb={1} fontWeight="bold">
                      Виберіть колір заливки
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: 0.5,
                      }}
                    >
                      {EXTENDED_COLORS.map((color) => (
                        <Tooltip key={color} title={color}>
                          <Box
                            onClick={() => {
                              handleUpdateSelectedFill(color, currentFillOpacity);
                              setFillColorAnchor(null);
                            }}
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: color,
                              borderRadius: 1,
                              cursor: 'pointer',
                              border: (selectedObject ? selectedObject.fillColor : currentFillColor) === color
                                ? '3px solid #2196F3'
                                : '1px solid #E0E0E0',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                boxShadow: 2,
                              },
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>
                </Popover>
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
              bgcolor: '#FFFFFF',
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
          Зберегти
        </Button>
      </DialogActions>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {confirmDialog.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            color="inherit"
          >
            Скасувати
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color="primary"
            autoFocus
          >
            Продовжити
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog
        open={alertDialog.open}
        onClose={() => setAlertDialog(prev => ({ ...prev, open: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            {alertDialog.severity === 'error' && (
              <Box sx={{ color: 'error.main', display: 'flex' }}>
                <Typography variant="h5">❌</Typography>
              </Box>
            )}
            {alertDialog.severity === 'warning' && (
              <Box sx={{ color: 'warning.main', display: 'flex' }}>
                <Typography variant="h5">⚠️</Typography>
              </Box>
            )}
            {alertDialog.severity === 'success' && (
              <Box sx={{ color: 'success.main', display: 'flex' }}>
                <Typography variant="h5">✅</Typography>
              </Box>
            )}
            {alertDialog.severity === 'info' && (
              <Box sx={{ color: 'info.main', display: 'flex' }}>
                <Typography variant="h5">ℹ️</Typography>
              </Box>
            )}
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {alertDialog.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {alertDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setAlertDialog(prev => ({ ...prev, open: false }))}
            variant="contained"
            color={alertDialog.severity === 'error' ? 'error' : 'primary'}
            autoFocus
          >
            Зрозуміло
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ShapeConstructor;
