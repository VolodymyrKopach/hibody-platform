'use client';

import React, { useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import WorksheetEditor from './WorksheetEditor';

interface ComponentWithEditorProps {
  componentName: string;
  initialProps: Record<string, any>;
  renderComponent: (props: Record<string, any>) => React.ReactNode;
  renderEditorFields?: (
    props: Record<string, any>,
    onChange: (key: string, value: any) => void
  ) => React.ReactNode;
}

/**
 * ComponentWithEditor - Wrapper that shows a component with live editing controls
 * Following SOLID principles - Single Responsibility (only handles layout and state management)
 */
const ComponentWithEditor: React.FC<ComponentWithEditorProps> = ({
  componentName,
  initialProps,
  renderComponent,
  renderEditorFields,
}) => {
  const [props, setProps] = useState(initialProps);

  const handlePropsChange = (newProps: Record<string, any>) => {
    setProps(newProps);
  };

  const handlePropChange = (key: string, value: any) => {
    setProps({ ...props, [key]: value });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1800, mx: 'auto' }}>
      <Grid container spacing={3}>
        {/* Editor Panel - Always visible */}
        <Grid item xs={12} md={4}>
          <WorksheetEditor
            title="Налаштування"
            componentName={componentName}
            initialProps={props}
            onChange={handlePropsChange}
          >
            {renderEditorFields && renderEditorFields(props, handlePropChange)}
          </WorksheetEditor>
        </Grid>

        {/* Component Preview */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              bgcolor: '#F5F5F5',
              border: '2px solid #E0E0E0',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: '#666' }}>
              📄 Live Preview
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                overflow: 'auto',
                p: 2,
              }}
            >
              <Box
                sx={{
                  width: 1050,
                  maxWidth: 1050,
                  flexShrink: 0,
                }}
              >
                {renderComponent(props)}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComponentWithEditor;

