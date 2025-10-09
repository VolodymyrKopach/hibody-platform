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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [crossPageDropIndex, setCrossPageDropIndex] = useState<number | null>(null);

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
      setCrossPageDropIndex(null);
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
        overflow: 'visible', // Content that doesn't fit will be visible outside page bounds
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
    default:
      return {};
  }
}


export default CanvasPage;

