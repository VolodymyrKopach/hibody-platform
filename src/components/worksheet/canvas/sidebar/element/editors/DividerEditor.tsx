'use client';

import React from 'react';
import { Box, Typography, Stack, Divider, TextField } from '@mui/material';
import { ElementEditorProps } from '@/types/element-editors';
import CommonElementProperties from '../shared/CommonElementProperties';

const DividerEditor: React.FC<ElementEditorProps> = ({
  elementData,
  onUpdate,
  onDuplicate,
  onDelete,
  pageData,
}) => {
  return (
    <Stack spacing={2.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Divider Properties
      </Typography>

      {/* Style */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
          Line Style
        </Typography>
        <Stack spacing={1}>
          {[
            { label: 'Solid', value: 'solid', preview: '━━━━━━━' },
            { label: 'Dashed', value: 'dashed', preview: '╌╌╌╌╌╌╌' },
            { label: 'Dotted', value: 'dotted', preview: '┈┈┈┈┈┈┈' },
            { label: 'Double', value: 'double', preview: '═══════' },
          ].map((style) => {
            const isActive = (elementData.properties?.style || 'solid') === style.value;
            return (
              <Box
                key={style.value}
                onClick={() => onUpdate?.({ style: style.value })}
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  border: isActive ? '2px solid #2563EB' : '1px solid #E5E7EB',
                  backgroundColor: isActive ? '#EFF6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  '&:hover': {
                    borderColor: '#2563EB',
                    backgroundColor: '#F9FAFB',
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#2563EB' : '#374151',
                  }}
                >
                  {style.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '16px',
                    color: isActive ? '#2563EB' : '#9CA3AF',
                    fontFamily: 'monospace',
                    letterSpacing: '-2px',
                  }}
                >
                  {style.preview}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Divider />

      {/* Thickness */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
          Thickness
        </Typography>
        <Stack direction="row" spacing={1}>
          {[1, 2, 3, 4].map((thickness) => {
            const isActive = (elementData.properties?.thickness || 1) === thickness;
            return (
              <Box
                key={thickness}
                onClick={() => onUpdate?.({ thickness })}
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: '8px',
                  border: isActive ? '2px solid #2563EB' : '1px solid #E5E7EB',
                  backgroundColor: isActive ? '#EFF6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': {
                    borderColor: '#2563EB',
                    backgroundColor: '#F9FAFB',
                  },
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: thickness * 2,
                    backgroundColor: isActive ? '#2563EB' : '#9CA3AF',
                    borderRadius: '2px',
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '11px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#2563EB' : '#6B7280',
                  }}
                >
                  {thickness}px
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Divider />

      {/* Color */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
          Color
        </Typography>
        <TextField
          fullWidth
          size="small"
          type="color"
          value={elementData.properties?.color || '#E5E7EB'}
          onChange={(e) => onUpdate?.({ color: e.target.value })}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              height: 40,
            },
            '& input[type="color"]': {
              cursor: 'pointer',
              height: 30,
            },
          }}
        />
      </Box>

      <Divider />

      {/* Common Properties */}
      <CommonElementProperties
        elementData={elementData}
        onUpdate={onUpdate}
        onDuplicate={onDuplicate ? () => onDuplicate(pageData?.id, elementData.id) : undefined}
        onDelete={onDelete ? () => onDelete(pageData?.id, elementData.id) : undefined}
        showSizeControls={false}
      />
    </Stack>
  );
};

export default DividerEditor;

