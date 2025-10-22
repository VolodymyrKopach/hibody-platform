'use client';

import React from 'react';
import { Box, Typography, Stack, Divider, TextField } from '@mui/material';
import { ElementEditorProps } from '@/types/element-editors';
import CommonElementProperties from '../shared/CommonElementProperties';

const TapImageEditor: React.FC<ElementEditorProps> = ({
  elementData,
  onUpdate,
  onDuplicate,
  onDelete,
  pageData,
}) => {
  return (
    <Stack spacing={2.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        ⚡ Tap Image Properties
      </Typography>

      {/* Image URL */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
          🖼️ Image URL
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="https://example.com/image.jpg"
          value={elementData.properties?.imageUrl || ''}
          onChange={(e) => onUpdate?.({ imageUrl: e.target.value })}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
          }}
        />
      </Box>

      {/* Image Preview */}
      {elementData.properties?.imageUrl && (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
            Preview
          </Typography>
          <Box
            component="img"
            src={elementData.properties.imageUrl}
            alt="Preview"
            sx={{
              width: '100%',
              maxHeight: 150,
              objectFit: 'contain',
              borderRadius: 2,
              border: '1px solid #E5E7EB',
            }}
          />
        </Box>
      )}

      <Divider />

      {/* Caption */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.75, display: 'block', fontSize: '0.75rem' }}>
          💬 Caption
        </Typography>
        <TextField
          fullWidth
          placeholder="Tap me!"
          value={elementData.properties?.caption || ''}
          onChange={(e) => onUpdate?.({ caption: e.target.value })}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              fontSize: '0.875rem',
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

export default TapImageEditor;

