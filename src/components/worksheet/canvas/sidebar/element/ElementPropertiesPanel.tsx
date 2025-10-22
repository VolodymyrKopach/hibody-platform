'use client';

import React, { useState, Suspense } from 'react';
import { Box, Typography, Stack, Tabs, Tab, CircularProgress, useTheme } from '@mui/material';
import { alpha } from '@mui/material';
import { Settings, Sparkles } from 'lucide-react';
import { ElementEditingProps, SidebarSelectionProps, AIEditingProps, WorksheetEditContext } from '@/types/sidebar';
import { getElementEditor, hasCustomEditor } from '../registry/element-editors';
import AIAssistantPanel from '../ai/AIAssistantPanel';

interface ElementPropertiesPanelProps extends ElementEditingProps, SidebarSelectionProps, AIEditingProps {
  isOpen: boolean;
}

const ElementPropertiesPanel: React.FC<ElementPropertiesPanelProps> = ({
  selection,
  onUpdate,
  onDuplicate,
  onDelete,
  parameters,
  onAIEdit,
  editHistory = [],
  isAIEditing = false,
  editError = null,
  onClearEditError,
  isOpen,
}) => {
  const theme = useTheme();
  const [mainTab, setMainTab] = useState<'properties' | 'ai'>('properties');

  if (!selection || selection.type !== 'element') {
    return null;
  }

  const { pageData, elementData } = selection;

  // Get the appropriate editor component for this element type
  const ElementEditor = getElementEditor(elementData.type);

  // Build context for AI Assistant
  const aiContext: WorksheetEditContext | undefined = parameters ? {
    topic: parameters.topic || 'General',
    ageGroup: parameters.level || parameters.ageGroup || 'general',
    difficulty: parameters.difficulty || 'medium',
    language: parameters.language || 'en',
  } : undefined;

  return (
    <>
      {isOpen && (
        <>
          {/* Tab Navigation */}
          <Box sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, px: 2 }}>
            <Tabs
              value={mainTab}
              onChange={(e, newValue) => setMainTab(newValue)}
              variant="fullWidth"
              sx={{
                minHeight: 44,
                '& .MuiTab-root': {
                  minHeight: 44,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  fontWeight: 600,
                },
              }}
            >
              <Tab 
                value="properties" 
                label="Properties" 
                icon={<Settings size={16} />}
                iconPosition="start"
              />
              <Tab 
                value="ai" 
                label="AI Assistant" 
                icon={<Sparkles size={16} />}
                iconPosition="start"
              />
            </Tabs>
          </Box>
        </>
      )}

      {/* Tab Content */}
      {isOpen && (
        <>
          {mainTab === 'properties' ? (
            <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
              <Suspense fallback={
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              }>
                <ElementEditor
                  elementData={elementData}
                  pageData={pageData}
                  onUpdate={onUpdate}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                />
              </Suspense>
            </Box>
          ) : (
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {/* AI Assistant Panel */}
              {aiContext && onAIEdit ? (
                <AIAssistantPanel
                  selection={selection}
                  context={aiContext}
                  onEdit={onAIEdit}
                  editHistory={editHistory}
                  isEditing={isAIEditing}
                  error={editError}
                  onClearError={onClearEditError}
                />
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    AI Assistant не доступний. Переконайтесь що worksheet згенерований з параметрами.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default ElementPropertiesPanel;

