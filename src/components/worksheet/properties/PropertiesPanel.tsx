'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import { Settings, Sparkles, X } from 'lucide-react';
import { CanvasElement } from '@/types/canvas-element';
import {
  getComponentPropertySchema,
  isInteractiveComponent,
} from '@/constants/interactive-properties-schema';
import ManualPropertyEditor from './ManualPropertyEditor';
import AIPropertyEditor from './AIPropertyEditor';
import { WorksheetEditContext } from '@/types/worksheet-generation';

interface PropertiesPanelProps {
  element: CanvasElement;
  pageId: string;
  context: WorksheetEditContext;
  onPropertiesChange: (elementId: string, newProperties: any) => void;
  onClose?: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  element,
  pageId,
  context,
  onPropertiesChange,
  onClose,
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');

  // Get property schema for this component
  const schema = getComponentPropertySchema(element.type);

  if (!schema) {
    return (
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          height: '100%',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">
          No properties available for this component
        </Typography>
      </Paper>
    );
  }

  const handlePropertiesChange = (newProperties: any) => {
    onPropertiesChange(element.id, newProperties);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: theme.palette.background.paper,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Settings size={20} color={theme.palette.primary.main} />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {schema.icon} {schema.componentName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Edit component properties
            </Typography>
          </Box>
        </Box>
        {onClose && (
          <Tooltip title="Close">
            <IconButton onClick={onClose} size="small">
              <X size={18} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          minHeight: 48,
          '& .MuiTab-root': {
            minHeight: 48,
            textTransform: 'none',
            fontWeight: 600,
          },
        }}
      >
        <Tab
          value="manual"
          label="Manual Edit"
          icon={<Settings size={16} />}
          iconPosition="start"
        />
        <Tab
          value="ai"
          label="AI Edit"
          icon={<Sparkles size={16} />}
          iconPosition="start"
          sx={{
            color: theme.palette.secondary.main,
            '&.Mui-selected': {
              color: theme.palette.secondary.main,
            },
          }}
        />
      </Tabs>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            background: alpha(theme.palette.action.hover, 0.05),
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.primary.main, 0.3),
            borderRadius: 4,
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.5),
            },
          },
        }}
      >
        {activeTab === 'manual' ? (
          <ManualPropertyEditor
            schema={schema}
            properties={element.properties}
            onChange={handlePropertiesChange}
          />
        ) : (
          <AIPropertyEditor
            element={element}
            pageId={pageId}
            schema={schema}
            context={context}
            onPropertiesChange={handlePropertiesChange}
          />
        )}
      </Box>
    </Paper>
  );
};

export default PropertiesPanel;

