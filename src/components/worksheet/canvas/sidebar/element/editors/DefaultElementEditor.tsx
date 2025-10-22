'use client';

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { ElementEditorProps } from '@/types/element-editors';
import CommonElementProperties from '../shared/CommonElementProperties';
import ManualPropertyEditor from '@/components/worksheet/properties/ManualPropertyEditor';
import { isInteractiveComponent, getComponentPropertySchema } from '@/constants/interactive-properties-schema';

const DefaultElementEditor: React.FC<ElementEditorProps> = ({
  elementData,
  onUpdate,
  onDuplicate,
  onDelete,
  pageData,
}) => {
  // Check if it's an interactive component with schema
  if (isInteractiveComponent(elementData.type)) {
    const schema = getComponentPropertySchema(elementData.type);
    if (schema) {
      return (
        <Stack spacing={2.5}>
          <ManualPropertyEditor
            schema={schema}
            properties={elementData.properties}
            onChange={(newProperties) => {
              onUpdate?.(newProperties);
            }}
          />
        </Stack>
      );
    }
  }

  // Fallback for components without specific editors
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography sx={{ fontSize: '2rem', mb: 1 }}>🚧</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Properties Coming Soon
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Properties for <strong>{elementData.type}</strong> will be available soon
      </Typography>
    </Box>
  );
};

export default DefaultElementEditor;

