'use client';

import React from 'react';
import { Box, Typography, Stack, Divider, IconButton, Tooltip } from '@mui/material';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';
import { ElementEditorProps } from '@/types/element-editors';
import CommonElementProperties from '../shared/CommonElementProperties';
import { RichTextEditor } from '../../../shared/RichTextEditor';

const TextElementEditor: React.FC<ElementEditorProps> = ({
  elementData,
  onUpdate,
  onDuplicate,
  onDelete,
  pageData,
}) => {
  return (
    <Stack spacing={2.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Text Properties
      </Typography>

      {/* Text Content */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
          Content
        </Typography>
        <RichTextEditor
          initialValue={elementData.properties?.text || ''}
          onChange={(newText) => onUpdate?.({ text: newText })}
        />
      </Box>

      <Divider />

      {/* Text Alignment */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
          Alignment
        </Typography>
        <Stack direction="row" spacing={1}>
          {[
            { value: 'left', icon: <AlignLeft size={16} />, label: 'Left' },
            { value: 'center', icon: <AlignCenter size={16} />, label: 'Center' },
            { value: 'right', icon: <AlignRight size={16} />, label: 'Right' },
          ].map((align) => {
            const isActive = (elementData.properties?.align || 'left') === align.value;
            return (
              <Tooltip key={align.value} title={align.label}>
                <IconButton
                  size="small"
                  onClick={() => onUpdate?.({ align: align.value })}
                  sx={{
                    flex: 1,
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    borderColor: isActive ? '#2563EB' : '#E5E7EB',
                    backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                    color: isActive ? '#2563EB' : '#6B7280',
                    '&:hover': {
                      borderColor: '#2563EB',
                      backgroundColor: '#F9FAFB',
                    },
                  }}
                >
                  {align.icon}
                </IconButton>
              </Tooltip>
            );
          })}
        </Stack>
      </Box>

      <Divider />

      {/* Text Style */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
          Text Style
        </Typography>
        <Stack direction="row" spacing={1}>
          {[
            { value: 'bold', icon: <Bold size={16} />, label: 'Bold', property: 'fontWeight' },
            { value: 'italic', icon: <Italic size={16} />, label: 'Italic', property: 'fontStyle' },
            { value: 'underline', icon: <Underline size={16} />, label: 'Underline', property: 'textDecoration' },
          ].map((style) => {
            const isActive = elementData.properties?.[style.property] === style.value ||
              (style.property === 'fontWeight' && elementData.properties?.fontWeight === 600);
            return (
              <Tooltip key={style.value} title={style.label}>
                <IconButton
                  size="small"
                  onClick={() => {
                    const updates: any = {};
                    if (style.property === 'fontWeight') {
                      updates.fontWeight = isActive ? 'normal' : 'bold';
                    } else if (style.property === 'fontStyle') {
                      updates.fontStyle = isActive ? 'normal' : 'italic';
                    } else if (style.property === 'textDecoration') {
                      updates.textDecoration = isActive ? 'none' : 'underline';
                    }
                    onUpdate?.(updates);
                  }}
                  sx={{
                    flex: 1,
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    borderColor: isActive ? '#2563EB' : '#E5E7EB',
                    backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                    color: isActive ? '#2563EB' : '#6B7280',
                    '&:hover': {
                      borderColor: '#2563EB',
                      backgroundColor: '#F9FAFB',
                    },
                  }}
                >
                  {style.icon}
                </IconButton>
              </Tooltip>
            );
          })}
        </Stack>
      </Box>

      <Divider />

      {/* Common Properties */}
      <CommonElementProperties
        elementData={elementData}
        onUpdate={onUpdate}
        onDuplicate={onDuplicate ? () => onDuplicate(pageData?.id, elementData.id) : undefined}
        onDelete={onDelete ? () => onDelete(pageData?.id, elementData.id) : undefined}
      />
    </Stack>
  );
};

export default TextElementEditor;

