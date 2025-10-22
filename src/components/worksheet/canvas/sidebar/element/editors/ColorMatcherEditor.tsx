'use client';

import React from 'react';
import { Stack } from '@mui/material';
import { ElementEditorProps } from '@/types/element-editors';
import ManualPropertyEditor from '@/components/worksheet/properties/ManualPropertyEditor';
import { getComponentPropertySchema } from '@/constants/interactive-properties-schema';

const ColorMatcherEditor: React.FC<ElementEditorProps> = ({
  elementData,
  onUpdate,
}) => {
  const schema = getComponentPropertySchema('color-matcher');
  
  if (!schema) {
    return null;
  }

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
};

export default ColorMatcherEditor;

