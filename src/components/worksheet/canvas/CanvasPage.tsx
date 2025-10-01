'use client';

import React, { useRef, useState } from 'react';
import { Box, Paper, useTheme, alpha, Typography, IconButton, Tooltip } from '@mui/material';
import { GripVertical } from 'lucide-react';
import { CanvasElement } from '@/types/canvas-element';
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
  onElementAdd: (element: Omit<CanvasElement, 'id' | 'zIndex'>) => void;
  onElementEdit: (elementId: string, properties: any) => void;
  onElementReorder?: (fromIndex: number, toIndex: number) => void;
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
  onElementAdd,
  onElementEdit,
  onElementReorder,
  onDragOver,
}) => {
  const theme = useTheme();
  const pageRef = useRef<HTMLDivElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);

  // Handle element reorder drag start
  const handleElementDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation(); // Prevent parent drag handlers
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'reorder'); // Mark as reorder operation
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
  };

  // Handle drop from sidebar
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const componentType = e.dataTransfer.getData('componentType');
    if (!componentType) return;

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
  };

  const handleDragOverPage = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragOver?.(e);
  };


  return (
    <Paper
      ref={pageRef}
      onDrop={handleDrop}
      onDragOver={handleDragOverPage}
      elevation={4}
      sx={{
        position: 'relative',
        width,
        height,
        background: 'white',
        overflow: 'hidden',
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

      {/* Canvas Elements - Linear Layout */}
      <Box 
        onClick={(e) => {
          // Deselect when clicking on empty space
          if (e.target === e.currentTarget) {
            onElementSelect(null);
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
              onClick={(e) => {
                e.stopPropagation(); // Prevent deselect when clicking element
                onElementSelect(element.id);
              }}
              sx={{
                width: '100%',
                position: 'relative',
                cursor: element.locked ? 'default' : 'grab',
                border: selectedElementId === element.id
                  ? `2px solid ${theme.palette.primary.main}`
                  : '2px solid transparent',
                borderRadius: '4px',
                transition: 'border 0.2s, opacity 0.2s',
                opacity: draggedIndex === index ? 0.5 : 1,
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
        url: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400',
        caption: 'Cute cat photo from Pexels', 
        width: 400, 
        height: 300,
        align: 'center'
      };
    default:
      return {};
  }
}


export default CanvasPage;

