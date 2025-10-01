'use client';

import React, { useRef } from 'react';
import { Box, Paper, useTheme, alpha, Typography } from '@mui/material';
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
  onDragOver,
}) => {
  const theme = useTheme();
  const pageRef = useRef<HTMLDivElement>(null);

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
      onClick={handlePageClick}
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
          <Box
            key={element.id}
            onClick={() => onElementSelect(element.id)}
            sx={{
              width: '100%',
              cursor: element.locked ? 'default' : 'pointer',
              border: selectedElementId === element.id
                ? `2px solid ${theme.palette.primary.main}`
                : '2px solid transparent',
              borderRadius: '4px',
              transition: 'border 0.2s',
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


export default CanvasPage;

