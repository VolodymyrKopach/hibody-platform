'use client';

import React from 'react';
import { Paper, Box, useTheme } from '@mui/material';
import { alpha } from '@mui/material';
import { Settings } from 'lucide-react';
import { RightSidebarProps } from '@/types/sidebar';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarEmpty from './sidebar/SidebarEmpty';
import PagePropertiesPanel from './sidebar/page/PagePropertiesPanel';
import ElementPropertiesPanel from './sidebar/element/ElementPropertiesPanel';

const RightSidebarRefactored: React.FC<RightSidebarProps> = ({ 
  isOpen,
  onToggle,
  selection, 
  onSelectionChange,
  onUpdate,
  onDuplicate,
  onDelete,
  onPageBackgroundUpdate,
  onImageUpload,
  parameters,
  onAIEdit,
  editHistory = [],
  isAIEditing = false,
  editError = null,
  onClearEditError
}) => {
  const theme = useTheme();
  const sidebarWidth = isOpen ? 320 : 72;

  // If nothing selected
  if (!selection) {
    return <SidebarEmpty isOpen={isOpen} onToggle={onToggle} />;
  }

  // Determine title based on selection type
  const title = selection.type === 'page' ? 'Page Properties' : 'Element Properties';

  return (
    <Paper
      elevation={0}
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        height: '100%',
        borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.98)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <SidebarHeader title={title} isOpen={isOpen} onToggle={onToggle} />

      {/* Collapsed Mode Icon */}
      {!isOpen && (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={24} color={theme.palette.text.secondary} />
        </Box>
      )}

      {/* Page Properties Panel */}
      {selection.type === 'page' && (
        <PagePropertiesPanel
          selection={selection}
          onSelectionChange={onSelectionChange}
          onPageBackgroundUpdate={onPageBackgroundUpdate}
          onImageUpload={onImageUpload}
          parameters={parameters}
          onAIEdit={onAIEdit}
          editHistory={editHistory}
          isAIEditing={isAIEditing}
          editError={editError}
          onClearEditError={onClearEditError}
          isOpen={isOpen}
        />
      )}

      {/* Element Properties Panel */}
      {selection.type === 'element' && (
        <ElementPropertiesPanel
          selection={selection}
          onSelectionChange={onSelectionChange}
          onUpdate={onUpdate}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          parameters={parameters}
          onAIEdit={onAIEdit}
          editHistory={editHistory}
          isAIEditing={isAIEditing}
          editError={editError}
          onClearEditError={onClearEditError}
          isOpen={isOpen}
        />
      )}
    </Paper>
  );
};

export default RightSidebarRefactored;

