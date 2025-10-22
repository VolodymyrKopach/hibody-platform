'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Stack, TextField, Tabs, Tab, useTheme } from '@mui/material';
import { alpha } from '@mui/material';
import { Settings, Palette, Sparkles } from 'lucide-react';
import { PageEditingProps, SidebarSelectionProps, AIEditingProps, WorksheetEditContext } from '@/types/sidebar';
import BackgroundEditor from './background/BackgroundEditor';
import AIAssistantPanel from '../ai/AIAssistantPanel';
import PositionControls from '../element/shared/PositionControls';

interface PagePropertiesPanelProps extends PageEditingProps, SidebarSelectionProps, AIEditingProps {
  isOpen: boolean;
}

const PagePropertiesPanel: React.FC<PagePropertiesPanelProps> = ({
  selection,
  onPageBackgroundUpdate,
  onImageUpload,
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

  if (!selection || selection.type !== 'page') {
    return null;
  }

  const pageData = selection.data;

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
                icon={<Palette size={16} />}
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
              {/* Page Settings */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Page Settings
              </Typography>

              <Stack spacing={2.5} sx={{ mb: 3 }}>
                {/* Title */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                    Title
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    defaultValue={pageData.title}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </Box>

                {/* Format Preset - Read Only */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                    Format
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: '10px',
                      background: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography sx={{ fontSize: '1.2rem' }}>📄</Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: theme.palette.primary.main }}>
                          A4 Portrait
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          210 × 297 mm (794 × 1123 px)
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Box>

                {/* Position */}
                <PositionControls
                  x={pageData.x || 0}
                  y={pageData.y || 0}
                  onChange={(position) => {
                    // Handle position change if needed
                  }}
                />

                {/* Background */}
                <BackgroundEditor
                  pageData={pageData}
                  onPageBackgroundUpdate={onPageBackgroundUpdate}
                  onImageUpload={onImageUpload}
                />
              </Stack>
            </Box>
          ) : (
            <Box sx={{ flex: 1, p: 2, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
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

export default PagePropertiesPanel;

