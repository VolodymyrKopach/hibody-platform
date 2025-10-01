'use client';

import React, { useState, useRef } from 'react';
import { Box, Paper, useTheme, alpha, Typography } from '@mui/material';
import { CanvasElement, AlignmentGuide } from '@/types/canvas-element';
import TitleBlock from './atomic/TitleBlock';
import BodyText from './atomic/BodyText';
import InstructionsBox from './atomic/InstructionsBox';
import FillInBlank from './atomic/FillInBlank';
import MultipleChoice from './atomic/MultipleChoice';
import TipBox from './atomic/TipBox';
import WarningBox from './atomic/WarningBox';
import ImagePlaceholder from './atomic/ImagePlaceholder';

interface CanvasPageProps {
  pageId: string;
  pageNumber: number;
  title: string;
  width: number;
  height: number;
  elements: CanvasElement[];
  selectedElementId: string | null;
  onElementSelect: (elementId: string | null) => void;
  onElementMove: (elementId: string, position: { x: number; y: number }) => void;
  onElementMoveEnd?: (elementId: string) => void;
  onElementAdd: (element: Omit<CanvasElement, 'id' | 'zIndex'>) => void;
  onElementEdit: (elementId: string, properties: any) => void;
  onDragOver?: (e: React.DragEvent) => void;
}

const CanvasPage: React.FC<CanvasPageProps> = ({
  pageId,
  pageNumber,
  title,
  width,
  height,
  elements,
  selectedElementId,
  onElementSelect,
  onElementMove,
  onElementMoveEnd,
  onElementAdd,
  onElementEdit,
  onDragOver,
}) => {
  const theme = useTheme();
  const pageRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    elementId: string | null;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [guides, setGuides] = useState<AlignmentGuide[]>([]);

  // Handle drop from sidebar
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const componentType = e.dataTransfer.getData('componentType');
    if (!componentType || !pageRef.current) return;

    const rect = pageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create default properties based on type
    const defaultProperties = getDefaultProperties(componentType);

    const newElement: Omit<CanvasElement, 'id' | 'zIndex'> = {
      type: componentType as any,
      position: { x, y },
      size: { width: 600, height: 50 }, // Minimal height, auto-expands to fit content
      properties: defaultProperties,
      locked: false,
      visible: true,
    };

    onElementAdd(newElement);
  };

  const handleDragOverPage = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragOver?.(e);
  };

  // Handle element dragging
  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (e.button !== 0) return; // Only left click
    e.stopPropagation();

    const element = elements.find(el => el.id === elementId);
    if (!element || element.locked || !pageRef.current) return;

    onElementSelect(elementId);

    // Calculate offset relative to page, not viewport
    const rect = pageRef.current.getBoundingClientRect();
    const mouseXInPage = e.clientX - rect.left;
    const mouseYInPage = e.clientY - rect.top;

    setDragState({
      elementId,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: mouseXInPage - element.position.x,
      offsetY: mouseYInPage - element.position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState || !pageRef.current) return;

    const rect = pageRef.current.getBoundingClientRect();
    const mouseXInPage = e.clientX - rect.left;
    const mouseYInPage = e.clientY - rect.top;

    // Apply offset so element sticks to cursor
    const x = mouseXInPage - dragState.offsetX;
    const y = mouseYInPage - dragState.offsetY;

    // Calculate alignment guides
    const currentElement = elements.find(el => el.id === dragState.elementId);
    if (currentElement) {
      const newGuides = calculateAlignmentGuides(
        { ...currentElement, position: { x, y } },
        elements.filter(el => el.id !== dragState.elementId)
      );
      
      // Only update guides if they changed (prevent infinite loop)
      if (newGuides.length !== guides.length || 
          !guidesAreEqual(newGuides, guides)) {
        setGuides(newGuides);
      }
    }

    onElementMove(dragState.elementId, { x, y });
  };

  const handleMouseUp = () => {
    if (dragState?.elementId && onElementMoveEnd) {
      onElementMoveEnd(dragState.elementId);
    }
    setDragState(null);
    setGuides([]);
  };

  // Click on empty space = deselect
  const handlePageClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onElementSelect(null);
    }
  };

  return (
    <Paper
      ref={pageRef}
      onDrop={handleDrop}
      onDragOver={handleDragOverPage}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handlePageClick}
      elevation={4}
      sx={{
        position: 'relative',
        width,
        height,
        background: 'white',
        overflow: 'hidden',
        cursor: dragState ? 'grabbing' : 'default',
      }}
    >
      {/* Page Header */}
      <Box
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

      {/* Canvas Elements */}
      <Box sx={{ position: 'relative', width: '100%', height: '100%', pt: 5 }}>
        {elements.map((element) => (
          <Box
            key={element.id}
            onMouseDown={(e) => handleElementMouseDown(e, element.id)}
            sx={{
              position: 'absolute',
              left: element.position.x,
              top: element.position.y,
              width: 'fit-content',
              maxWidth: element.size.width,
              // Use auto height to fit content
              height: 'auto',
              minHeight: 'auto',
              cursor: element.locked ? 'default' : 'move',
              border: selectedElementId === element.id
                ? `2px solid ${theme.palette.primary.main}`
                : '2px solid transparent',
              borderRadius: '4px',
              transition: dragState?.elementId === element.id ? 'none' : 'border 0.2s',
              '&:hover': element.locked ? {} : {
                border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
              },
            }}
          >
            {renderElement(
              element, 
              selectedElementId === element.id,
              onElementEdit,
              onElementSelect
            )}
          </Box>
        ))}
      </Box>

      {/* Alignment Guides */}
      {guides.map((guide, idx) => (
        <Box
          key={idx}
          sx={{
            position: 'absolute',
            background: guide.color,
            ...(guide.type === 'vertical'
              ? {
                  left: guide.position,
                  top: 0,
                  bottom: 0,
                  width: '1px',
                }
              : {
                  top: guide.position,
                  left: 0,
                  right: 0,
                  height: '1px',
                }),
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
      ))}
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
          text={element.properties.text || 'Your text goes here. Click to edit...'}
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
        />
      );
    case 'multiple-choice':
      return <MultipleChoice items={element.properties.items || []} />;
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
          caption={element.properties.caption}
          width={element.properties.width}
          height={element.properties.height}
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
        text: 'Your text goes here. Click to edit and add your content...',
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
        caption: 'Image description', 
        width: 400, 
        height: 300 
      };
    default:
      return {};
  }
}

// Helper to compare guides arrays (prevent infinite loops)
function guidesAreEqual(guides1: AlignmentGuide[], guides2: AlignmentGuide[]): boolean {
  if (guides1.length !== guides2.length) return false;
  
  for (let i = 0; i < guides1.length; i++) {
    const g1 = guides1[i];
    const g2 = guides2[i];
    
    if (g1.type !== g2.type || 
        Math.abs(g1.position - g2.position) > 0.1 || 
        g1.color !== g2.color) {
      return false;
    }
  }
  
  return true;
}

// Calculate alignment guides
function calculateAlignmentGuides(
  draggedElement: CanvasElement,
  otherElements: CanvasElement[]
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];
  const threshold = 5; // Snap within 5px

  const draggedCenter = {
    x: draggedElement.position.x + draggedElement.size.width / 2,
    y: draggedElement.position.y + draggedElement.size.height / 2,
  };

  otherElements.forEach((element) => {
    const elementCenter = {
      x: element.position.x + element.size.width / 2,
      y: element.position.y + element.size.height / 2,
    };

    // Vertical center alignment
    if (Math.abs(draggedCenter.x - elementCenter.x) < threshold) {
      guides.push({
        type: 'vertical',
        position: elementCenter.x,
        color: '#FF4444',
        elements: [draggedElement.id, element.id],
      });
    }

    // Horizontal center alignment
    if (Math.abs(draggedCenter.y - elementCenter.y) < threshold) {
      guides.push({
        type: 'horizontal',
        position: elementCenter.y,
        color: '#FF4444',
        elements: [draggedElement.id, element.id],
      });
    }

    // Left edge alignment
    if (Math.abs(draggedElement.position.x - element.position.x) < threshold) {
      guides.push({
        type: 'vertical',
        position: element.position.x,
        color: '#4444FF',
        elements: [draggedElement.id, element.id],
      });
    }

    // Top edge alignment
    if (Math.abs(draggedElement.position.y - element.position.y) < threshold) {
      guides.push({
        type: 'horizontal',
        position: element.position.y,
        color: '#4444FF',
        elements: [draggedElement.id, element.id],
      });
    }
  });

  return guides;
}

export default CanvasPage;

