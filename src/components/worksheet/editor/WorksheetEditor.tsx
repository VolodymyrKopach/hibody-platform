'use client';

import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Divider } from '@mui/material';
import { Settings } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import ColorPickerField from './ColorPickerField';

interface WorksheetEditorProps {
  title: string;
  componentName: string;
  initialProps: Record<string, any>;
  onChange: (props: Record<string, any>) => void;
  children?: React.ReactNode;
}

const WorksheetEditor: React.FC<WorksheetEditorProps> = ({
  title,
  componentName,
  initialProps,
  onChange,
  children,
}) => {
  const [props, setProps] = useState(initialProps);

  const handlePropChange = (key: string, value: any) => {
    const newProps = { ...props, [key]: value };
    setProps(newProps);
    onChange(newProps);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        bgcolor: '#F8F9FA',
        border: '2px solid #E0E0E0',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
        }}
      >
        <Settings size={20} />
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />
      
      {/* Editor Content - Always visible */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Basic Text Fields */}
        {props.title !== undefined && (
          <TextField
            label="Заголовок"
            value={props.title || ''}
            onChange={(e) => handlePropChange('title', e.target.value)}
            size="small"
            fullWidth
          />
        )}

        {props.instruction !== undefined && (
          <TextField
            label="Інструкція"
            value={props.instruction || ''}
            onChange={(e) => handlePropChange('instruction', e.target.value)}
            size="small"
            fullWidth
            multiline
            rows={2}
          />
        )}

        {/* Emoji Picker */}
        {props.mascot !== undefined && (
          <EmojiPicker
            label="Mascot"
            value={props.mascot || '🐻'}
            onChange={(value) => handlePropChange('mascot', value)}
          />
        )}

        {/* Color Pickers - Auto-render all props ending with 'Color' */}
        {Object.keys(props).filter(key => key.endsWith('Color')).map((colorKey) => {
          const label = colorKey === 'borderColor' ? 'Колір рамки' :
                       colorKey === 'backgroundColor' ? 'Колір фону' :
                       colorKey === 'stepNumberColor' ? 'Колір номерів' :
                       colorKey === 'dotColor' ? 'Колір точок' :
                       colorKey === 'cardBorderColor' ? 'Колір рамки карток' :
                       colorKey === 'boxColor' ? 'Колір коробок' :
                       colorKey === 'traceColor' ? 'Колір обведення' :
                       colorKey === 'numberColor' ? 'Колір цифр' :
                       colorKey === 'shapeColor' ? 'Колір фігур' :
                       colorKey === 'taskBadgeColor' ? 'Колір бейджів завдань' :
                       colorKey === 'optionBorderColor' ? 'Колір рамки варіантів' :
                       colorKey === 'pathColor' ? 'Колір шляху' :
                       colorKey === 'guideLineColor' ? 'Колір напрямних' :
                       colorKey === 'hintColor' ? 'Колір підказок' :
                       colorKey === 'circleColor' ? 'Колір кругів' :
                       colorKey === 'cellBorderColor' ? 'Колір рамки клітинок' :
                       colorKey === 'shapeBorderColor' ? 'Колір рамки фігур' :
                       colorKey === 'strokeColor' ? 'Колір обводки' :
                       colorKey === 'pieceNumberColor' ? 'Колір номерів частин' :
                       colorKey;
          
          return (
            <ColorPickerField
              key={colorKey}
              label={label}
              value={props[colorKey] || '#FF6B9D'}
              onChange={(value) => handlePropChange(colorKey, value)}
            />
          );
        })}

        {/* Custom fields passed as children */}
        {children}
      </Box>
    </Paper>
  );
};

export default WorksheetEditor;

