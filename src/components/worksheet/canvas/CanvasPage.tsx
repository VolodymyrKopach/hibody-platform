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
  onElementSelect: (elementId: string | null) => void;
  onElementAdd: (element: Omit<CanvasElement, 'id' | 'zIndex'>) => void;
  onElementEdit: (elementId: string, properties: any) => void;
  onElementReorder?: (fromIndex: number, toIndex: number) => void;
  onCrossPageDragStart?: (elementId: string) => void;
  onCrossPageDragEnd?: () => void;
  onCrossPageDrop?: () => void;
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);

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
          
          console.log('🌈 Gradient CSS:', { from, to, colors, direction, cssDirection, gradientColors, gradientCss });
          
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
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'reorder'); // Mark as reorder operation
    e.dataTransfer.setData('cross-page-drag', 'true'); // Mark for cross-page capability
    
    // Notify parent about cross-page drag
    const element = elements[index];
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
    
    // Calculate the offset from where user clicked within the element
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    // Set the drag image with correct offset
    e.dataTransfer.setDragImage(dragPreview, offsetX, offsetY);
    
    // Clean up the drag preview after a short delay
    setTimeout(() => {
      if (document.body.contains(dragPreview)) {
        document.body.removeChild(dragPreview);
      }
    }, 0);
  };

  // Handle element drag over (show drop indicator)
  const handleElementDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only show indicator for reorder operations (not new elements from sidebar)
    const dragType = e.dataTransfer.types.includes('text/plain');
    if (dragType && draggedIndex !== null && draggedIndex !== index) {
      setDropIndicatorIndex(index);
    }
  };

  // Handle element drop (reorder)
  const handleElementDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex !== null && draggedIndex !== dropIndex && onElementReorder) {
      onElementReorder(draggedIndex, dropIndex);
    }

    // Reset drag state
    setDraggedIndex(null);
    setDropIndicatorIndex(null);
  };

  // Handle drag end (cleanup)
  const handleElementDragEnd = () => {
    setDraggedIndex(null);
    setDropIndicatorIndex(null);
    setIsDropTarget(false);
    
    // Notify parent about drag end
    if (onCrossPageDragEnd) {
      onCrossPageDragEnd();
    }
  };

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
    setIsDropTarget(false);

    // Check if it's a cross-page drag
    const isCrossPageDrag = e.dataTransfer.getData('cross-page-drag') === 'true';
    
    if (isCrossPageDrag && crossPageDrag && crossPageDrag.sourcePageId !== pageId) {
      // Handle cross-page drop
      console.log('📥 Cross-page drop detected on page:', pageId);
      if (onCrossPageDrop) {
        onCrossPageDrop();
      }
      return;
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

      onElementAdd(newElement);
    }
  };

  const handleDragOverPage = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if it's a cross-page drag from another page
    const isCrossPageDrag = e.dataTransfer.types.includes('cross-page-drag');
    if (isCrossPageDrag && crossPageDrag && crossPageDrag.sourcePageId !== pageId) {
      setIsDropTarget(true);
    }
    
    onDragOver?.(e);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only reset if leaving the page container entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!pageRef.current?.contains(relatedTarget)) {
      setIsDropTarget(false);
    }
  };


  return (
    <Paper
      ref={pageRef}
      data-page-id={pageId}
      data-page-number={pageNumber}
      onDrop={handleDrop}
      onDragOver={handleDragOverPage}
      onDragLeave={handleDragLeave}
      elevation={4}
      sx={{
        position: 'relative',
        width,
        height,
        ...getBackgroundStyle(),
        overflow: 'hidden',
        // Ensure proper rendering for export
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        // Cross-page drop target visual feedback
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
      {/* Page Header */}
      <Box
        data-page-header // For export filtering
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          p: 1,
          background: alpha(theme.palette.grey[100], 0.8),
          borderBottom: `1px solid ${theme.palette.divider}`,
          fontSize: '0.75rem',
          color: 'text.secondary',
          fontWeight: 600,
          zIndex: 1,
        }}
      >
        Page {pageNumber} - {title}
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
          height: '100%', 
          pt: 5,
          px: 4, // Page padding
          display: 'flex',
          flexDirection: 'column',
          gap: 3, // Spacing between elements
        }}
      >
        {elements.map((element, index) => (
          <React.Fragment key={element.id}>
            {/* Drop indicator before element */}
            {dropIndicatorIndex === index && draggedIndex !== index && (
              <Box
                data-drop-indicator // For export filtering
                sx={{
                  height: '4px',
                  width: '100%',
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '2px',
                  my: -1.5, // Overlap with gap
                }}
              />
            )}
            
            <Box
              draggable={!element.locked}
              onDragStart={(e) => !element.locked && handleElementDragStart(e, index)}
              onDragOver={(e) => !element.locked && handleElementDragOver(e, index)}
              onDrop={(e) => !element.locked && handleElementDrop(e, index)}
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
                border: draggedIndex === index 
                  ? `2px dashed ${alpha(theme.palette.primary.main, 0.5)}`
                  : crossPageDrag?.elementId === element.id && crossPageDrag?.sourcePageId === pageId
                  ? `2px dashed ${alpha(theme.palette.info.main, 0.8)}`
                  : selectedElementId === element.id
                  ? `2px solid ${theme.palette.primary.main}`
                  : clipboard?.type === 'element' && clipboard?.operation === 'cut' && clipboard?.element.id === element.id && clipboard?.pageId === pageId
                  ? `2px dashed ${alpha(theme.palette.warning.main, 0.7)}`
                  : '2px solid transparent',
                borderRadius: '4px',
                transition: 'border 0.2s, opacity 0.2s, background-color 0.2s',
                opacity: draggedIndex === index 
                  ? 0.3 
                  : crossPageDrag?.elementId === element.id && crossPageDrag?.sourcePageId === pageId
                  ? 0.6
                  : clipboard?.type === 'element' && clipboard?.operation === 'cut' && clipboard?.element.id === element.id && clipboard?.pageId === pageId
                  ? 0.5
                  : 1,
                backgroundColor: draggedIndex === index 
                  ? alpha(theme.palette.grey[200], 0.5) 
                  : crossPageDrag?.elementId === element.id && crossPageDrag?.sourcePageId === pageId
                  ? alpha(theme.palette.info.main, 0.08)
                  : clipboard?.type === 'element' && clipboard?.operation === 'cut' && clipboard?.element.id === element.id && clipboard?.pageId === pageId
                  ? alpha(theme.palette.warning.main, 0.05)
                  : 'transparent',
                transform: 'none', // Prevent any transforms during drag
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
            {index === elements.length - 1 && dropIndicatorIndex === elements.length && (
              <Box
                data-drop-indicator // For export filtering
                sx={{
                  height: '4px',
                  width: '100%',
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '2px',
                  my: -1.5, // Overlap with gap
                }}
              />
            )}
          </React.Fragment>
        ))}
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
          hasHeaders={element.properties.hasHeaders}
          borderStyle={element.properties.borderStyle}
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
      };
    default:
      return {};
  }
}


export default CanvasPage;

