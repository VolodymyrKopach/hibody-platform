'use client';

import React from 'react';
import { Box, Typography, Stack, Divider, TextField, Slider } from '@mui/material';
import { ElementEditorProps } from '@/types/element-editors';
import CommonElementProperties from '../shared/CommonElementProperties';

const ImageElementEditor: React.FC<ElementEditorProps> = ({
  elementData,
  onUpdate,
  onDuplicate,
  onDelete,
  pageData,
}) => {
  return (
    <Stack spacing={2.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Image Properties
      </Typography>

      {/* Image URL */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
          Image URL
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="https://example.com/image.jpg"
          value={elementData.properties?.imageUrl || elementData.properties?.src || ''}
          onChange={(e) => onUpdate?.({ imageUrl: e.target.value, src: e.target.value })}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
          }}
        />
      </Box>

      {/* Image Preview */}
      {(elementData.properties?.imageUrl || elementData.properties?.src) && (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
            Preview
          </Typography>
          <Box
            component="img"
            src={elementData.properties?.imageUrl || elementData.properties?.src}
            alt="Preview"
            sx={{
              width: '100%',
              maxHeight: 200,
              objectFit: 'contain',
              borderRadius: 2,
              border: '1px solid #E5E7EB',
            }}
          />
        </Box>
      )}

      <Divider />

      {/* Border Radius */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
          Border Radius: {elementData.properties?.borderRadius || 0}px
        </Typography>
        <Slider
          value={elementData.properties?.borderRadius || 0}
          onChange={(_, value) => onUpdate?.({ borderRadius: value as number })}
          min={0}
          max={50}
          step={1}
          sx={{
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
            },
          }}
        />
      </Box>

      <Divider />

      {/* Opacity */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
          Opacity: {Math.round((elementData.properties?.opacity || 1) * 100)}%
        </Typography>
        <Slider
          value={(elementData.properties?.opacity || 1) * 100}
          onChange={(_, value) => onUpdate?.({ opacity: (value as number) / 100 })}
          min={0}
          max={100}
          step={5}
          sx={{
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
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
      />
    </Stack>
  );
};

export default ImageElementEditor;

