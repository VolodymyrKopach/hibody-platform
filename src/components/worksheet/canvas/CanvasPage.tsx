'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Box, Paper, useTheme, alpha, Typography, IconButton, Tooltip } from '@mui/material';
import { GripVertical } from 'lucide-react';
import { CanvasElement } from '@/types/canvas-element';
import TitleBlock from './atomic/TitleBlock';
import BodyText from './atomic/BodyText';
import InstructionsBox from './atomic/InstructionsBox';
import FillInBlank from './atomic/FillInBlank';
import MultipleChoice from './atomic/MultipleChoice';
import TrueFalse from './atomic/TrueFalse';
import ShortAnswer from './atomic/ShortAnswer';
import TipBox from './atomic/TipBox';
import WarningBox from './atomic/WarningBox';
import ImagePlaceholder from './atomic/ImagePlaceholder';
import Divider from './atomic/Divider';
import BulletList from './atomic/BulletList';
import NumberedList from './atomic/NumberedList';
import Table from './atomic/Table';
// Interactive components
import TapImage from './interactive/TapImage';
import SimpleDragAndDrop from './interactive/SimpleDragAndDrop';
import ColorMatcher from './interactive/ColorMatcher';
import SimpleCounter from './interactive/SimpleCounter';
import MemoryCards from './interactive/MemoryCards';
import SortingGame from './interactive/SortingGame';
import SequenceBuilder from './interactive/SequenceBuilder';
import ShapeTracer from './interactive/ShapeTracer';
import EmotionRecognizer from './interactive/EmotionRecognizer';
import SoundMatcher from './interactive/SoundMatcher';
import SimplePuzzle from './interactive/SimplePuzzle';
import PatternBuilder from './interactive/PatternBuilder';
import CauseEffectGame from './interactive/CauseEffectGame';
import RewardCollector from './interactive/RewardCollector';
import VoiceRecorder from './interactive/VoiceRecorder';

interface PageBackground {
  type: 'solid' | 'gradient' | 'pattern' | 'image';
  color?: string;
  image?: {
    url: string;
    size: 'cover' | 'contain' | 'repeat' | 'auto';
    position: 'center' | 'top' | 'bottom' | 'left' | 'right';
    opacity?: number;
  };
  gradient?: {
    from: string;
    to: string;
    colors?: string[]; // For multi-color gradients (2-4 colors)
    direction: 'to-bottom' | 'to-top' | 'to-right' | 'to-left' | 'to-bottom-right' | 'to-bottom-left' | 'to-top-right' | 'to-top-left';
  };
  pattern?: {
    name: string;
    backgroundColor: string;
    patternColor: string;
    css: string;
    backgroundSize: string;
    backgroundPosition?: string;
    scale?: number; // Custom scale multiplier (0.5 - 2.0)
    opacity?: number; // Pattern opacity (0-100)
  };
  opacity?: number;
}

interface CanvasPageProps {
  pageId: string;
  pageNumber: number;
  title: string;
  width: number;
  height: number;
  background?: PageBackground;
  elements: CanvasElement[];
  selectedElementId: string | null;
  clipboard?: 
    | { type: 'element'; pageId: string; element: CanvasElement; operation: 'copy' | 'cut' }
    | { type: 'page'; page: any; pageContent: any; operation: 'copy' | 'cut' }
    | null;
  crossPageDrag?: { sourcePageId: string; elementId: string; element: CanvasElement } | null;
  pageType?: 'pdf' | 'interactive'; // Type of page
  isPlayMode?: boolean; // Whether in play/preview mode
  onElementSelect: (elementId: string | null) => void;
  onElementAdd: (element: Omit<CanvasElement, 'id' | 'zIndex'>, insertIndex?: number) => void;
  onElementEdit: (elementId: string, properties: any) => void;
  onElementReorder?: (fromIndex: number, toIndex: number) => void;
  onCrossPageDragStart?: (elementId: string) => void;
  onCrossPageDragEnd?: () => void;
  onCrossPageDrop?: (dropIndex?: number) => void; // dropIndex for precise positioning
  onDragOver?: (e: React.DragEvent) => void;
  onElementContextMenu?: (e: React.MouseEvent, elementId: string) => void;
  onPageContextMenu?: (e: React.MouseEvent) => void;
}

const CanvasPage: React.FC<CanvasPageProps> = ({
  pageId,
  pageNumber,
  title,
  width,
  height,
  background,
  elements,
  selectedElementId,
  clipboard,
  crossPageDrag,
  pageType = 'pdf',
  isPlayMode = false,
  onElementSelect,
  onElementAdd,
  onElementEdit,
  onElementReorder,
  onCrossPageDragStart,
  onCrossPageDragEnd,
  onCrossPageDrop,
  onDragOver,
  onElementContextMenu,
  onPageContextMenu,
}) => {
  const theme = useTheme();
  const pageRef = useRef<HTMLDivElement>(null);
  const dragPreviewsRef = useRef<Set<HTMLElement>>(new Set());
  
  // Interactive page can scroll
  const isInteractive = pageType === 'interactive';
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [crossPageDropIndex, setCrossPageDropIndex] = useState<number | null>(null);

  // Component type definitions
  const INTERACTIVE_COMPONENT_TYPES = [
    'tap-image', 'simple-drag-drop', 'color-matcher', 'simple-counter', 
    'memory-cards', 'sorting-game', 'sequence-builder', 'shape-tracer', 
    'emotion-recognizer', 'sound-matcher', 'simple-puzzle', 'pattern-builder', 
    'cause-effect', 'reward-collector', 'voice-recorder'
  ];

  const PDF_COMPONENT_TYPES = [
    'title-block', 'body-text', 'instructions-box', 'fill-blank', 
    'multiple-choice', 'tip-box', 'warning-box', 'image-placeholder', 
    'bullet-list', 'numbered-list', 'true-false', 'short-answer', 
    'table', 'divider'
  ];

  // Helper: Check if component can be dropped on this page
  const canDropOnThisPage = (componentType: string): boolean => {
    const isInteractiveComp = INTERACTIVE_COMPONENT_TYPES.includes(componentType);
    const isPDFComp = PDF_COMPONENT_TYPES.includes(componentType);

    // Interactive components only on interactive pages
    if (isInteractiveComp && pageType !== 'interactive') {
      return false;
    }

    // PDF components only on PDF pages
    if (isPDFComp && pageType !== 'pdf') {
      return false;
    }

    return true;
  };

  // Helper: Validate drop index within bounds
  const validateDropIndex = (index: number, arrayLength: number): number => {
    return Math.max(0, Math.min(index, arrayLength));
  };

  // Generate background CSS based on type
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!background) return { background: 'white' };

    const opacity = background.opacity ? background.opacity / 100 : 1;

    switch (background.type) {
      case 'solid':
        return {
          background: background.color || 'white',
        };
      
      case 'gradient':
        if (background.gradient) {
          const { from, to, colors, direction } = background.gradient;
          
          // Support multi-color gradients
          const gradientColors = colors && colors.length >= 2 ? colors : [from, to];
          
          // Convert direction format: 'to-bottom-right' -> 'to bottom right'
          const cssDirection = direction.replace(/-/g, ' ');
          const gradientCss = `linear-gradient(${cssDirection}, ${gradientColors.join(', ')})`;
          
          return {
            background: gradientCss,
          };
        }
        return { background: 'white' };
      
      case 'pattern':
        if (background.pattern) {
          const scale = background.pattern.scale || 1;
          const patternOpacity = background.pattern.opacity !== undefined ? background.pattern.opacity / 100 : 1;
          
          // Parse backgroundSize and apply scale
          let scaledSize = background.pattern.backgroundSize;
          if (background.pattern.backgroundSize !== 'auto') {
            // Extract numeric values and scale them
            scaledSize = background.pattern.backgroundSize.replace(/(\d+)px/g, (match, p1) => {
              return `${Math.round(parseInt(p1) * scale)}px`;
            });
          }
          
          // Replace colors in CSS with custom colors and apply opacity
          let customCss = background.pattern.css
            .replace(/#E5E7EB/g, background.pattern.patternColor)
            .replace(/#DBEAFE/g, background.pattern.patternColor)
            .replace(/#F3F4F6/g, background.pattern.patternColor)
            .replace(/#FDE68A/g, background.pattern.patternColor)
            .replace(/#D1D5DB/g, background.pattern.patternColor);
          
          // Add opacity to pattern color if not full opacity
          if (patternOpacity < 1) {
            // Convert hex to rgba with opacity
            const hexToRgba = (hex: string, alpha: number) => {
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };
            
            const patternColorRgba = hexToRgba(background.pattern.patternColor, patternOpacity);
            customCss = customCss.replace(
              new RegExp(background.pattern.patternColor, 'g'),
              patternColorRgba
            );
          }
          
          return {
            background: background.pattern.backgroundColor,
            backgroundImage: customCss,
            backgroundSize: scaledSize,
            backgroundPosition: background.pattern.backgroundPosition || '0 0',
          };
        }
        return { background: 'white' };
      
      case 'image':
        if (background.image) {
          const imageOpacity = background.image.opacity !== undefined ? background.image.opacity / 100 : 1;
          
          return {
            backgroundImage: `url(${background.image.url})`,
            backgroundSize: background.image.size,
            backgroundPosition: background.image.position,
            backgroundRepeat: background.image.size === 'repeat' ? 'repeat' : 'no-repeat',
            opacity: imageOpacity,
          };
        }
        return { background: 'white' };
      
      default:
        return { background: 'white' };
    }
  };

  // Handle element reorder drag start
  const handleElementDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation(); // Prevent parent drag handlers
    
    const element = elements[index];
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'reorder'); // Mark as reorder operation
    e.dataTransfer.setData('cross-page-drag', 'true'); // Mark for cross-page capability
    
    if (element && onCrossPageDragStart) {
      onCrossPageDragStart(element.id);
    }
    
    // Create a custom drag preview that preserves all styles
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Clone the element deeply
    const dragPreview = target.cloneNode(true) as HTMLElement;
    
    // Copy all computed styles to preserve MUI styles
    const copyStyles = (sourceElement: HTMLElement, targetElement: HTMLElement) => {
      const computedStyle = window.getComputedStyle(sourceElement);
      Array.from(computedStyle).forEach(key => {
        try {
          (targetElement.style as any)[key] = computedStyle.getPropertyValue(key);
        } catch (e) {
          // Some styles can't be copied, skip them
        }
      });
      
      // Recursively copy styles for all children
      const sourceChildren = sourceElement.children;
      const targetChildren = targetElement.children;
      for (let i = 0; i < sourceChildren.length; i++) {
        if (sourceChildren[i] instanceof HTMLElement && targetChildren[i] instanceof HTMLElement) {
          copyStyles(sourceChildren[i] as HTMLElement, targetChildren[i] as HTMLElement);
        }
      }
    };
    
    // Copy all styles from original element
    copyStyles(target, dragPreview);
    
    // Override only positioning styles for the preview
    dragPreview.style.position = 'absolute';
    dragPreview.style.top = '-9999px';
    dragPreview.style.left = '-9999px';
    dragPreview.style.width = `${rect.width}px`;
    dragPreview.style.height = `${rect.height}px`;
    dragPreview.style.pointerEvents = 'none';
    dragPreview.style.zIndex = '10000';
    dragPreview.style.margin = '0';
    dragPreview.style.transform = 'none';
    
    // Add subtle drag effect
    dragPreview.style.opacity = '0.92';
    dragPreview.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.25)';
    
    document.body.appendChild(dragPreview);
    dragPreviewsRef.current.add(dragPreview);
    
    // Calculate the offset from where user clicked within the element
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    // Set the drag image with correct offset
    e.dataTransfer.setDragImage(dragPreview, offsetX, offsetY);
    
    // Clean up preview after drag image is captured
    requestAnimationFrame(() => {
      if (dragPreview && document.body.contains(dragPreview)) {
        document.body.removeChild(dragPreview);
        dragPreviewsRef.current.delete(dragPreview);
      }
    });
  };

  // Handle element drag over (show drop indicator)
  const handleElementDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate index bounds
    const validIndex = validateDropIndex(index, elements.length);
    
    // Check if it's a cross-page drag
    const isCrossPageDrag = e.dataTransfer.types.includes('cross-page-drag');
    
    // Check if it's a sidebar component drag
    const isSidebarDrag = e.dataTransfer.types.includes('componenttype');
    
    // Check if this is truly a cross-page drag (from different page)
    const isTrueCrossPageDrag = isCrossPageDrag && crossPageDrag && crossPageDrag.sourcePageId !== pageId;
    
    // Check if this is within-page drag
    const isWithinPageDrag = isCrossPageDrag && crossPageDrag && crossPageDrag.sourcePageId === pageId;
    
    if (isTrueCrossPageDrag) {
      // Cross-page drag: show drop indicator at target position
      setCrossPageDropIndex(validIndex);
      setIsDropTarget(true);
      return;
    }
    
    // Within-page drag: show drop indicator for reorder operations
    if (isWithinPageDrag || (draggedIndex !== null)) {
      if (draggedIndex !== null && draggedIndex !== validIndex) {
        setDropIndicatorIndex(validIndex);
      }
      return;
    }
    
    // Sidebar component drag: show drop indicator
    if (isSidebarDrag) {
      setCrossPageDropIndex(validIndex);
      setIsDropTarget(true);
    }
  };

  // Handle element drop (reorder or cross-page drop)
  const handleElementDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Validate drop index
    const validDropIndex = validateDropIndex(dropIndex, elements.length);

    // Check if it's a cross-page drag
    const isCrossPageDrag = e.dataTransfer.getData('cross-page-drag') === 'true';
    
    if (isCrossPageDrag && crossPageDrag && crossPageDrag.sourcePageId !== pageId && onCrossPageDrop) {
      // Cross-page drop with specific position
      onCrossPageDrop(validDropIndex);
      
      // Reset states
      setCrossPageDropIndex(null);
      setIsDropTarget(false);
      return;
    }

    // Within-page reorder
    if (draggedIndex !== null && draggedIndex !== validDropIndex && onElementReorder) {
      onElementReorder(draggedIndex, validDropIndex);
    }

    // Reset drag state
    setDraggedIndex(null);
    setDropIndicatorIndex(null);
  };

  // Handle drag end (cleanup)
  const handleElementDragEnd = () => {
    setDraggedIndex(null);
    setDropIndicatorIndex(null);
    setCrossPageDropIndex(null);
    setIsDropTarget(false);
    
    // Notify parent about drag end
    if (onCrossPageDragEnd) {
      onCrossPageDragEnd();
    }
  };

  // Cleanup drag previews on unmount
  useEffect(() => {
    return () => {
      dragPreviewsRef.current.forEach(preview => {
        try {
          if (document.body.contains(preview)) {
            document.body.removeChild(preview);
          }
        } catch (error) {
          console.warn('Failed to cleanup drag preview on unmount:', error);
        }
      });
      dragPreviewsRef.current.clear();
    };
  }, []);

  // Prevent browser gestures on page (touchpad swipe navigation)
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Prevent browser navigation gestures
      e.stopPropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent browser navigation gestures (back/forward swipe)
      e.stopPropagation();
    };

    const handleWheel = (e: WheelEvent) => {
      // Prevent horizontal scroll from triggering browser navigation
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Add listeners with appropriate options
    page.addEventListener('touchstart', handleTouchStart, { passive: false });
    page.addEventListener('touchmove', handleTouchMove, { passive: false });
    page.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      page.removeEventListener('touchstart', handleTouchStart);
      page.removeEventListener('touchmove', handleTouchMove);
      page.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Handle drop from sidebar or cross-page
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Capture the drop index before clearing it
    const targetDropIndex = crossPageDropIndex !== null ? crossPageDropIndex : elements.length;
    
    setIsDropTarget(false);
    setCrossPageDropIndex(null);

    // Check if it's a cross-page drag
    const isCrossPageDrag = e.dataTransfer.getData('cross-page-drag') === 'true';
    
    if (isCrossPageDrag && crossPageDrag && crossPageDrag.sourcePageId !== pageId) {
      // Handle cross-page drop (dropped on page, not on specific element)
      if (onCrossPageDrop) {
        onCrossPageDrop(targetDropIndex);
      }
      return;
    }

    // Handle within-page reorder (dropped on page, not on specific element)
    if (isCrossPageDrag && crossPageDrag && crossPageDrag.sourcePageId === pageId) {
      if (dropIndicatorIndex !== null && draggedIndex !== null && onElementReorder) {
        onElementReorder(draggedIndex, dropIndicatorIndex);
        setDropIndicatorIndex(null);
        return;
      }
    }

    // Handle sidebar component drop
    const componentType = e.dataTransfer.getData('componentType');
    if (componentType) {
      // Create default properties based on type
      const defaultProperties = getDefaultProperties(componentType);

      const newElement: Omit<CanvasElement, 'id' | 'zIndex'> = {
        type: componentType as any,
        position: { x: 0, y: 0 }, // Position not used in linear layout
        size: { width: 794, height: 50 }, // Full width A4
        properties: defaultProperties,
        locked: false,
        visible: true,
      };

      // Use drop indicator index if available, otherwise add to end
      const insertIndex = crossPageDropIndex !== null ? crossPageDropIndex : 
                          dropIndicatorIndex !== null ? dropIndicatorIndex : 
                          undefined;
      
      onElementAdd(newElement, insertIndex);
      
      // Clear indicators
      setDropIndicatorIndex(null);
      setCrossPageDropIndex(null);
    }
  };

  const handleDragOverPage = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    let shouldShowDropTarget = false;
    
    // Check if it's a cross-page drag from another page
    const isCrossPageDrag = e.dataTransfer.types.includes('cross-page-drag');
    if (isCrossPageDrag && crossPageDrag && crossPageDrag.sourcePageId !== pageId) {
      // Check if element type is compatible with this page type
      const canDrop = canDropOnThisPage(crossPageDrag.element.type);
      if (canDrop) {
        shouldShowDropTarget = true;
      }
    }
    
    // Check if it's a sidebar component drag
    const isSidebarDrag = e.dataTransfer.types.includes('componenttype');
    if (isSidebarDrag) {
      // Check component category from dataTransfer.types
      const isInteractiveComp = e.dataTransfer.types.includes('component-category-interactive');
      const isPDFComp = e.dataTransfer.types.includes('component-category-pdf');
      
      let canDrop = true;
      
      // Validate based on page type and component category
      if (isInteractiveComp && pageType !== 'interactive') {
        canDrop = false; // Interactive component on PDF page
      } else if (isPDFComp && pageType !== 'pdf') {
        canDrop = false; // PDF component on interactive page
      }
      
      if (canDrop) {
        shouldShowDropTarget = true;
      }
    }
    
    // Only show drop target indicator if valid
    setIsDropTarget(shouldShowDropTarget);
    
    onDragOver?.(e);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only reset if leaving the page container entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!pageRef.current?.contains(relatedTarget)) {
      setIsDropTarget(false);
      setCrossPageDropIndex(null);
    }
  };


  return (
    <Paper
      ref={pageRef}
      data-page-id={pageId}
      data-page-number={pageNumber}
      data-page-type={pageType}
      onDrop={handleDrop}
      onDragOver={handleDragOverPage}
      onDragLeave={handleDragLeave}
      elevation={isInteractive ? 2 : 4}
      sx={{
        position: 'relative',
        width: width, // Use explicit width for both PDF and interactive pages
        height: isInteractive ? height : height,
        minHeight: isInteractive ? height : undefined,
        maxHeight: isInteractive ? height : height,
        ...getBackgroundStyle(),
        // No overflow on Paper - it's on content container below
        overflow: 'visible',
        // Different styling for interactive pages
        ...(isInteractive && {
          borderRadius: '16px',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          display: 'flex',
          flexDirection: 'column',
        }),
        // Ensure proper rendering for export
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        // Cross-page drop target visual feedback (valid drop only)
        ...(isDropTarget && {
          outline: `4px dashed ${theme.palette.success.main}`,
          outlineOffset: '-4px',
          '&::after': {
            content: '"📥 Drop here to move element"',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '16px 24px',
            background: alpha(theme.palette.success.main, 0.95),
            color: 'white',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 700,
            boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.4)}`,
            zIndex: 1000,
            pointerEvents: 'none',
          },
        }),
      }}
    >
      {/* Overflow Visual Indicator - shows when content extends beyond page */}
      {!isDropTarget && (
        <Box
          data-overflow-indicator // For export filtering
          sx={{
            position: 'absolute',
            bottom: -10,
            left: 0,
            right: 0,
            height: '10px',
            background: `linear-gradient(to bottom, transparent, ${alpha(theme.palette.warning.main, 0.2)})`,
            borderRadius: '0 0 8px 8px',
            pointerEvents: 'none',
            opacity: 0.8,
            zIndex: -1,
          }}
        />
      )}
      {/* Page Header */}
      <Box
        data-page-header // For export filtering
        sx={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          p: 1,
          background: alpha(theme.palette.grey[100], 0.95),
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          fontSize: '0.75rem',
          color: 'text.secondary',
          fontWeight: 600,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <span>Page {pageNumber}{title && title !== `Page ${pageNumber}` ? ` - ${title}` : ''}</span>
        {pageType === 'interactive' && (
          <span
            style={{
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: '#10B981',
              color: 'white',
              fontWeight: 700,
            }}
          >
            ⚡ Interactive
          </span>
        )}
      </Box>

      {/* Canvas Elements - Linear Layout */}
      <Box 
        data-print-content // For PDF export
        onClick={(e) => {
          // Deselect when clicking on empty space
          if (e.target === e.currentTarget) {
            onElementSelect(null);
          }
        }}
        onContextMenu={(e) => {
          // Show context menu when right-clicking on empty space
          if (e.target === e.currentTarget && onPageContextMenu) {
            onPageContextMenu(e);
          }
        }}
        sx={{ 
          width: '100%', 
          flex: isInteractive ? 1 : 'none',
          height: isInteractive ? 'auto' : '100%',
          pt: 5,
          px: 4, // Page padding
          display: 'flex',
          flexDirection: 'column',
          gap: 3, // Spacing between elements
          // Scrollbar only for content on interactive pages
          ...(isInteractive && {
            overflowX: 'hidden',
            overflowY: 'auto',
            // Custom scrollbar styles
            '&::-webkit-scrollbar': {
              width: 14,
            },
            '&::-webkit-scrollbar-track': {
              background: alpha(theme.palette.action.hover, 0.05),
              borderRadius: '0 16px 16px 0',
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.primary.main, 0.3),
              borderRadius: 6,
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.6),
              },
            },
          }),
        }}
      >
        {elements
          .filter(element => {
            // Hide cut elements instead of showing them grayed out
            if (clipboard?.type === 'element' && 
                clipboard?.operation === 'cut' && 
                clipboard?.element.id === element.id && 
                clipboard?.pageId === pageId) {
              return false; // Don't render cut elements
            }
            return true;
          })
          .map((element, visualIndex) => {
          // Get real index from original array for state operations
          const realIndex = elements.indexOf(element);
          
          return (
          <React.Fragment key={element.id}>
            {/* Drop indicator before element (within-page OR cross-page) */}
            {(dropIndicatorIndex === realIndex && draggedIndex !== realIndex) || (crossPageDropIndex === realIndex) ? (
              <Box
                data-drop-indicator // For export filtering
                sx={{
                  position: 'relative',
                  height: '4px',
                  width: '100%',
                  backgroundColor: crossPageDropIndex === realIndex 
                    ? theme.palette.success.main  // Green for cross-page
                    : theme.palette.primary.main, // Blue for within-page
                  borderRadius: '2px',
                  mb: 1,
                  boxShadow: crossPageDropIndex === realIndex
                    ? `0 0 8px ${alpha(theme.palette.success.main, 0.6)}`
                    : 'none',
                  animation: crossPageDropIndex === realIndex
                    ? 'pulse 1.5s ease-in-out infinite'
                    : 'none',
                  pointerEvents: 'none',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      opacity: 1,
                      transform: 'scaleY(1)',
                    },
                    '50%': {
                      opacity: 0.7,
                      transform: 'scaleY(1.5)',
                    },
                  },
                }}
              />
            ) : null}
            
            <Box
              draggable={!element.locked}
              onDragStart={(e) => {
                if (!element.locked) {
                  handleElementDragStart(e, realIndex);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault(); // CRITICAL: Always prevent default to allow drop
                if (!element.locked) {
                  handleElementDragOver(e, realIndex);
                }
              }}
              onDrop={(e) => {
                e.preventDefault(); // CRITICAL: Always prevent default to accept drop
                if (!element.locked) {
                  handleElementDrop(e, realIndex);
                }
              }}
              onDragEnd={handleElementDragEnd}
              onMouseDown={(e) => {
                // Prevent page drag when clicking on element
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent deselect when clicking element
                onElementSelect(element.id);
              }}
              onContextMenu={(e) => {
                if (onElementContextMenu) {
                  onElementContextMenu(e, element.id);
                }
              }}
              sx={{
                width: '100%',
                position: 'relative',
                cursor: element.locked ? 'default' : 'grab',
                border: draggedIndex === realIndex 
                  ? `2px dashed ${alpha(theme.palette.primary.main, 0.5)}`
                  : crossPageDrag?.elementId === element.id && crossPageDrag?.sourcePageId === pageId
                  ? `2px dashed ${alpha(theme.palette.info.main, 0.8)}`
                  : selectedElementId === element.id
                  ? `2px solid ${theme.palette.primary.main}`
                  : '2px solid transparent',
                borderRadius: '4px',
                transition: 'border 0.2s, transform 0.3s ease, margin 0.3s ease',
                // Smooth space expansion effect when drop indicator is above
                transform: ((dropIndicatorIndex === realIndex && draggedIndex !== null) || crossPageDropIndex === realIndex)
                  ? 'translateY(20px)'
                  : 'translateY(0)',
                willChange: 'transform',
                '&:hover': element.locked ? {} : {
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                  '& .drag-handle': {
                    opacity: 1,
                  },
                },
                '&:active': {
                  cursor: element.locked ? 'default' : 'grabbing',
                },
              }}
            >
              {/* Drag handle */}
              {!element.locked && (
                <Box
                  data-drag-handle // For export filtering
                  className="drag-handle"
                  sx={{
                    position: 'absolute',
                    left: -32,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    cursor: 'grab',
                    '&:active': {
                      cursor: 'grabbing',
                    },
                  }}
                  onMouseDown={(e) => e.stopPropagation()} // Prevent element selection
                >
                  <Tooltip title="Drag to reorder" placement="left">
                    <IconButton
                      size="small"
                      sx={{
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <GripVertical size={20} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
              
              {renderElement(
                element, 
                selectedElementId === element.id,
                onElementEdit,
                onElementSelect
              )}
            </Box>

            {/* Drop indicator after last element */}
            {realIndex === elements.length - 1 && dropIndicatorIndex === elements.length && (
              <Box
                data-drop-indicator // For export filtering
                sx={{
                  height: '4px',
                  width: '100%',
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '2px',
                  my: -1.5, // Overlap with gap
                  pointerEvents: 'none', // CRITICAL: Don't block drop events
                }}
              />
            )}
          </React.Fragment>
          );
        })}
      </Box>

    </Paper>
  );
};

// Render element based on type
function renderElement(
  element: CanvasElement, 
  isSelected: boolean,
  onEdit: (elementId: string, properties: any) => void,
  onSelect: (elementId: string) => void
) {
  switch (element.type) {
    case 'title-block':
      return (
        <TitleBlock
          text={element.properties.text || 'Title Here'}
          level={element.properties.level || 'main'}
          align={element.properties.align || 'center'}
          color={element.properties.color}
          isSelected={isSelected}
          onEdit={(newText) => {
            onEdit(element.id, { ...element.properties, text: newText });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'body-text':
      return (
        <BodyText 
          text={element.properties.text || ''}
          variant={element.properties.variant || 'paragraph'}
          isSelected={isSelected}
          onEdit={(newText) => {
            onEdit(element.id, { ...element.properties, text: newText });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'instructions-box':
      return (
        <InstructionsBox
          text={element.properties.text || 'Instructions here...'}
          title={element.properties.title}
          type={element.properties.type}
          icon={element.properties.icon}
          isSelected={isSelected}
          onEdit={(newText) => {
            onEdit(element.id, { ...element.properties, text: newText });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'fill-blank':
      return (
        <FillInBlank
          items={element.properties.items || []}
          wordBank={element.properties.wordBank}
          isSelected={isSelected}
          onEdit={(items, wordBank) => {
            onEdit(element.id, { 
              ...element.properties, 
              items, 
              wordBank: wordBank || [] 
            });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'multiple-choice':
      return (
        <MultipleChoice
          items={element.properties.items || []}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'true-false':
      return (
        <TrueFalse
          items={element.properties.items || []}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'short-answer':
      return (
        <ShortAnswer
          items={element.properties.items || []}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'tip-box':
      return (
        <TipBox
          text={element.properties.text || 'Tip here...'}
          title={element.properties.title}
          type={element.properties.type}
          isSelected={isSelected}
          onEdit={(newText) => {
            onEdit(element.id, { ...element.properties, text: newText });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'warning-box':
      return (
        <WarningBox
          text={element.properties.text || 'Warning here...'}
          title={element.properties.title}
          type={element.properties.type}
          isSelected={isSelected}
          onEdit={(newText) => {
            onEdit(element.id, { ...element.properties, text: newText });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'image-placeholder':
      return (
        <ImagePlaceholder
          url={element.properties.url}
          caption={element.properties.caption}
          width={element.properties.width}
          height={element.properties.height}
          align={element.properties.align}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'divider':
      return (
        <Divider
          style={element.properties.style}
          thickness={element.properties.thickness}
          color={element.properties.color}
          spacing={element.properties.spacing}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'bullet-list':
      return (
        <BulletList
          items={element.properties.items || []}
          style={element.properties.style}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'numbered-list':
      return (
        <NumberedList
          items={element.properties.items || []}
          style={element.properties.style}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'table':
      return (
        <Table
          headers={element.properties.headers || []}
          rows={element.properties.rows || []}
          hasHeaders={element.properties.hasHeaders ?? true}
          borderStyle={element.properties.borderStyle || 'all'}
          headerBgColor={element.properties.headerBgColor || '#F3F4F6'}
          borderColor={element.properties.borderColor || '#D1D5DB'}
          cellPadding={element.properties.cellPadding || 10}
          fontSize={element.properties.fontSize || 13}
          textAlign={element.properties.textAlign || 'left'}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    // Interactive components
    case 'tap-image':
      return (
        <TapImage
          imageUrl={element.properties.imageUrl || '/placeholder-image.png'}
          soundEffect={element.properties.soundEffect}
          customSound={element.properties.customSound}
          caption={element.properties.caption}
          size={element.properties.size || 'medium'}
          animation={element.properties.animation || 'bounce'}
          showHint={element.properties.showHint}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'simple-drag-drop':
      return (
        <SimpleDragAndDrop
          items={element.properties.items || []}
          targets={element.properties.targets || []}
          layout={element.properties.layout || 'horizontal'}
          difficulty={element.properties.difficulty || 'easy'}
          snapDistance={element.properties.snapDistance || 80}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'color-matcher':
      return (
        <ColorMatcher
          colors={element.properties.colors || []}
          mode={element.properties.mode || 'single'}
          showNames={element.properties.showNames ?? true}
          autoVoice={element.properties.autoVoice ?? true}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'simple-counter':
      return (
        <SimpleCounter
          objects={element.properties.objects || []}
          voiceEnabled={element.properties.voiceEnabled ?? true}
          celebrationAtEnd={element.properties.celebrationAtEnd ?? true}
          showProgress={element.properties.showProgress ?? true}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'memory-cards':
      return (
        <MemoryCards
          pairs={element.properties.pairs || []}
          gridSize={element.properties.gridSize || '2x2'}
          cardBackImage={element.properties.cardBackImage}
          difficulty={element.properties.difficulty || 'easy'}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'sorting-game':
      return (
        <SortingGame
          items={element.properties.items || []}
          categories={element.properties.categories || []}
          sortBy={element.properties.sortBy || 'type'}
          layout={element.properties.layout || 'horizontal'}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'sequence-builder':
      return (
        <SequenceBuilder
          steps={element.properties.steps || []}
          showNumbers={element.properties.showNumbers ?? true}
          difficulty={element.properties.difficulty || 'easy'}
          instruction={element.properties.instruction}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'shape-tracer':
      return (
        <ShapeTracer
          shapePath={element.properties.shapePath || 'M 50,50 L 150,50 L 150,150 L 50,150 Z'}
          shapeName={element.properties.shapeName || 'Shape'}
          difficulty={element.properties.difficulty || 'easy'}
          strokeWidth={element.properties.strokeWidth || 8}
          guideColor={element.properties.guideColor || '#3B82F6'}
          traceColor={element.properties.traceColor || '#10B981'}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'emotion-recognizer':
      return (
        <EmotionRecognizer
          emotions={element.properties.emotions || []}
          mode={element.properties.mode || 'identify'}
          showDescriptions={element.properties.showDescriptions ?? true}
          voiceEnabled={element.properties.voiceEnabled ?? true}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'sound-matcher':
      return (
        <SoundMatcher
          items={element.properties.items || []}
          mode={element.properties.mode || 'identify'}
          autoPlayFirst={element.properties.autoPlayFirst ?? true}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'simple-puzzle':
      return (
        <SimplePuzzle
          imageUrl={element.properties.imageUrl || ''}
          pieces={element.properties.pieces || 4}
          difficulty={element.properties.difficulty || 'easy'}
          showOutline={element.properties.showOutline ?? true}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'pattern-builder':
      return (
        <PatternBuilder
          pattern={element.properties.pattern || []}
          patternType={element.properties.patternType || 'color'}
          difficulty={element.properties.difficulty || 'easy'}
          repetitions={element.properties.repetitions || 2}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'cause-effect':
      return (
        <CauseEffectGame
          pairs={element.properties.pairs || []}
          showText={element.properties.showText ?? true}
          voiceEnabled={element.properties.voiceEnabled ?? true}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'reward-collector':
      return (
        <RewardCollector
          tasks={element.properties.tasks || []}
          rewardTitle={element.properties.rewardTitle || 'Great Job!'}
          rewardEmoji={element.properties.rewardEmoji || '🎁'}
          starsPerTask={element.properties.starsPerTask || 1}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    case 'voice-recorder':
      return (
        <VoiceRecorder
          prompt={element.properties.prompt || 'Record your voice!'}
          maxDuration={element.properties.maxDuration || 30}
          showPlayback={element.properties.showPlayback ?? true}
          autoPlay={element.properties.autoPlay ?? false}
          isSelected={isSelected}
          onEdit={(properties) => {
            onEdit(element.id, { ...element.properties, ...properties });
          }}
          onFocus={() => onSelect(element.id)}
        />
      );
    default:
      return (
        <Box sx={{ p: 2, border: '2px dashed red', borderRadius: '8px' }}>
          <Typography sx={{ color: 'red', fontSize: '14px', fontWeight: 600 }}>
            Unknown component: {element.type}
          </Typography>
        </Box>
      );
  }
}

// Get default properties for component type
function getDefaultProperties(type: string) {
  switch (type) {
    case 'title-block':
      return { 
        text: 'Your Title Here', 
        level: 'main', 
        align: 'center',
        color: '#1F2937'
      };
    case 'body-text':
      return { 
        text: '',
        variant: 'paragraph'
      };
    case 'instructions-box':
      return { 
        text: 'Complete the exercises below.', 
        type: 'general' 
      };
    case 'fill-blank':
      return {
        items: [
          { number: 1, text: 'She ______ (go) to school every day.', hint: 'goes' },
          { number: 2, text: 'They ______ (play) football on Sundays.', hint: 'play' },
        ],
        wordBank: ['goes', 'play', 'runs', 'walk'],
      };
    case 'multiple-choice':
      return {
        items: [
          {
            number: 1,
            question: 'She _____ coffee every morning.',
            options: [
              { letter: 'a', text: 'drink' },
              { letter: 'b', text: 'drinks' },
              { letter: 'c', text: 'drinking' },
            ],
          },
        ],
      };
    case 'true-false':
      return {
        items: [
          {
            number: 1,
            statement: 'The sun rises in the west.',
          },
          {
            number: 2,
            statement: 'Water freezes at 0°C (32°F).',
          },
          {
            number: 3,
            statement: 'There are 7 continents on Earth.',
          },
        ],
      };
    case 'short-answer':
      return {
        items: [
          {
            number: 1,
            question: 'What is the capital of France?',
            lines: 1,
          },
          {
            number: 2,
            question: 'Describe your favorite book in a few sentences.',
            lines: 3,
          },
        ],
      };
    case 'tip-box':
      return { 
        text: 'Remember: add "s" for third person singular!', 
        type: 'study' 
      };
    case 'warning-box':
      return { 
        text: 'Pay attention to irregular verbs!', 
        type: 'grammar' 
      };
    case 'image-placeholder':
      return { 
        url: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400',
        caption: 'Cute cat photo from Pexels', 
        width: 400, 
        height: 300,
        align: 'center'
      };
    case 'divider':
      return {
        style: 'solid',
        thickness: 1,
        color: '#D1D5DB',
        spacing: 'medium'
      };
    case 'bullet-list':
      return {
        items: [
          { id: '1', text: 'First item in the list' },
          { id: '2', text: 'Second item in the list' },
          { id: '3', text: 'Third item in the list' },
        ],
        style: 'dot',
      };
    case 'numbered-list':
      return {
        items: [
          { id: '1', text: 'First step or point' },
          { id: '2', text: 'Second step or point' },
          { id: '3', text: 'Third step or point' },
        ],
        style: 'decimal',
      };
    case 'table':
      return {
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: [
          ['Row 1, Cell 1', 'Row 1, Cell 2', 'Row 1, Cell 3'],
          ['Row 2, Cell 1', 'Row 2, Cell 2', 'Row 2, Cell 3'],
          ['Row 3, Cell 1', 'Row 3, Cell 2', 'Row 3, Cell 3'],
        ],
        hasHeaders: true,
        borderStyle: 'all',
        headerBgColor: '#F3F4F6',
        borderColor: '#D1D5DB',
        cellPadding: 10,
        fontSize: 13,
        textAlign: 'left',
      };
    // Interactive components
    case 'tap-image':
      return {
        imageUrl: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400',
        caption: 'Tap me!',
        size: 'medium',
        animation: 'bounce',
        soundEffect: 'praise',
        showHint: true,
      };
    case 'simple-drag-drop':
      return {
        items: [
          {
            id: 'item-1',
            imageUrl: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=200',
            correctTarget: 'target-1',
            label: 'Cat',
          },
          {
            id: 'item-2',
            imageUrl: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=200',
            correctTarget: 'target-2',
            label: 'Dog',
          },
        ],
        targets: [
          {
            id: 'target-1',
            label: 'Meow',
            backgroundColor: '#FFF9E6',
          },
          {
            id: 'target-2',
            label: 'Woof',
            backgroundColor: '#E6F4FF',
          },
        ],
        layout: 'horizontal',
        difficulty: 'easy',
        snapDistance: 80,
      };
    case 'color-matcher':
      return {
        colors: [
          { name: 'Red', hex: '#EF4444', voicePrompt: 'Find red!' },
          { name: 'Blue', hex: '#3B82F6', voicePrompt: 'Find blue!' },
          { name: 'Yellow', hex: '#FCD34D', voicePrompt: 'Find yellow!' },
          { name: 'Green', hex: '#10B981', voicePrompt: 'Find green!' },
        ],
        mode: 'single',
        showNames: true,
        autoVoice: true,
      };
    case 'simple-counter':
      return {
        objects: [
          {
            imageUrl: 'https://images.pexels.com/photos/1661535/pexels-photo-1661535.jpeg?auto=compress&cs=tinysrgb&w=200',
            count: 3,
          },
          {
            imageUrl: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=200',
            count: 5,
          },
        ],
        voiceEnabled: true,
        celebrationAtEnd: true,
        showProgress: true,
      };
    case 'memory-cards':
      return {
        pairs: [
          { id: 'pair-1', imageUrl: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=200' },
          { id: 'pair-2', imageUrl: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=200' },
          { id: 'pair-3', imageUrl: 'https://images.pexels.com/photos/1661535/pexels-photo-1661535.jpeg?auto=compress&cs=tinysrgb&w=200' },
        ],
        gridSize: '2x3',
        difficulty: 'easy',
      };
    case 'sorting-game':
      return {
        items: [
          { id: 'item-1', imageUrl: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=200', category: 'animals', label: 'Cat' },
          { id: 'item-2', imageUrl: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=200', category: 'animals', label: 'Dog' },
          { id: 'item-3', imageUrl: 'https://images.pexels.com/photos/1661535/pexels-photo-1661535.jpeg?auto=compress&cs=tinysrgb&w=200', category: 'food', label: 'Apple' },
          { id: 'item-4', imageUrl: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=200', category: 'food', label: 'Banana' },
        ],
        categories: [
          { id: 'animals', name: 'Animals', color: '#10B981', icon: '🐾' },
          { id: 'food', name: 'Food', color: '#F59E0B', icon: '🍎' },
        ],
        sortBy: 'type',
        layout: 'horizontal',
      };
    case 'sequence-builder':
      return {
        steps: [
          { id: 'step-1', imageUrl: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=200', order: 1, label: 'First' },
          { id: 'step-2', imageUrl: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=200', order: 2, label: 'Second' },
          { id: 'step-3', imageUrl: 'https://images.pexels.com/photos/1661535/pexels-photo-1661535.jpeg?auto=compress&cs=tinysrgb&w=200', order: 3, label: 'Third' },
        ],
        showNumbers: true,
        difficulty: 'easy',
        instruction: 'Put the pictures in the right order!',
      };
    case 'shape-tracer':
      return {
        shapePath: 'M 100,50 L 200,50 L 200,150 L 100,150 Z', // Square
        shapeName: 'Square',
        difficulty: 'easy',
        strokeWidth: 8,
        guideColor: '#3B82F6',
        traceColor: '#10B981',
      };
    case 'emotion-recognizer':
      return {
        emotions: [
          { id: 'happy', name: 'Happy', emoji: '😊', description: 'Smiling and joyful' },
          { id: 'sad', name: 'Sad', emoji: '😢', description: 'Crying and upset' },
          { id: 'angry', name: 'Angry', emoji: '😠', description: 'Mad and frustrated' },
          { id: 'surprised', name: 'Surprised', emoji: '😲', description: 'Amazed and shocked' },
        ],
        mode: 'identify',
        showDescriptions: true,
        voiceEnabled: true,
      };
    case 'sound-matcher':
      return {
        items: [
          { id: 'cat', imageUrl: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=200', soundText: 'Meow meow', label: 'Cat' },
          { id: 'dog', imageUrl: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=200', soundText: 'Woof woof', label: 'Dog' },
          { id: 'bird', imageUrl: 'https://images.pexels.com/photos/349758/hummingbird-bird-birds-349758.jpeg?auto=compress&cs=tinysrgb&w=200', soundText: 'Tweet tweet', label: 'Bird' },
        ],
        mode: 'identify',
        autoPlayFirst: true,
      };
    case 'simple-puzzle':
      return {
        imageUrl: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400',
        pieces: 4,
        difficulty: 'easy',
        showOutline: true,
      };
    case 'pattern-builder':
      return {
        pattern: [
          { id: 'red', color: '#EF4444' },
          { id: 'blue', color: '#3B82F6' },
        ],
        patternType: 'color',
        difficulty: 'easy',
        repetitions: 2,
      };
    case 'cause-effect':
      return {
        pairs: [
          { 
            id: 'rain-puddle', 
            cause: { emoji: '🌧️', text: 'Rain' }, 
            effect: { emoji: '💧', text: 'Puddles' } 
          },
          { 
            id: 'sun-hot', 
            cause: { emoji: '☀️', text: 'Sun' }, 
            effect: { emoji: '🔥', text: 'Hot' } 
          },
          { 
            id: 'sleep-energy', 
            cause: { emoji: '😴', text: 'Sleep' }, 
            effect: { emoji: '⚡', text: 'Energy' } 
          },
        ],
        showText: true,
        voiceEnabled: true,
      };
    case 'reward-collector':
      return {
        tasks: [
          { id: 'task1', text: 'Say hello', emoji: '👋', completed: false },
          { id: 'task2', text: 'Count to 5', emoji: '🔢', completed: false },
          { id: 'task3', text: 'Name 3 colors', emoji: '🎨', completed: false },
        ],
        rewardTitle: 'Great Job!',
        rewardEmoji: '🎁',
        starsPerTask: 1,
      };
    case 'voice-recorder':
      return {
        prompt: 'Tell me about your day!',
        maxDuration: 30,
        showPlayback: true,
        autoPlay: false,
      };
    default:
      return {};
  }
}


export default CanvasPage;

