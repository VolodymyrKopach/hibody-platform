'use client';

import React from 'react';
import { Box, Stack, Typography, Tabs, Tab, Divider, useTheme } from '@mui/material';
import { alpha } from '@mui/material';
import { Palette } from 'lucide-react';
import { BackgroundEditorProps, PageBackground } from '@/types/sidebar';
import { useBackgroundEditor } from '@/hooks/useBackgroundEditor';
import ColorBackgroundTab from './ColorBackgroundTab';
import GradientBackgroundTab from './GradientBackgroundTab';
import PatternBackgroundTab from './PatternBackgroundTab';
import TemplateBackgroundTab from './TemplateBackgroundTab';
import ImageBackgroundTab from './ImageBackgroundTab';

const BackgroundEditor: React.FC<BackgroundEditorProps> = ({
  pageData,
  onPageBackgroundUpdate,
  onImageUpload,
}) => {
  const theme = useTheme();
  const {
    customColor,
    imageSize,
    imagePosition,
    imageOpacity,
    activeTab,
    applyBackground,
    updateState,
  } = useBackgroundEditor(pageData, onPageBackgroundUpdate);

  const handleImageUpload = async (file: File) => {
    if (onImageUpload && pageData) {
      await onImageUpload(pageData.id, file);
    }
  };

  const handleImageSizeChange = (size: 'cover' | 'contain' | 'repeat' | 'auto') => {
    updateState({ imageSize: size });
    if (pageData.background?.image) {
      applyBackground({
        type: 'image',
        image: {
          ...pageData.background.image,
          size,
        },
        opacity: 100,
      });
    }
  };

  const handleImagePositionChange = (position: 'center' | 'top' | 'bottom' | 'left' | 'right') => {
    updateState({ imagePosition: position });
    if (pageData.background?.image) {
      applyBackground({
        type: 'image',
        image: {
          ...pageData.background.image,
          position,
        },
        opacity: 100,
      });
    }
  };

  const handleImageOpacityChange = (opacity: number) => {
    updateState({ imageOpacity: opacity });
    if (pageData.background?.image) {
      applyBackground({
        type: 'image',
        image: {
          ...pageData.background.image,
          opacity,
        },
        opacity: 100,
      });
    }
  };

  const handleRemoveImage = () => {
    applyBackground({
      type: 'solid',
      color: '#FFFFFF',
      opacity: 100,
    });
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Palette size={16} color={theme.palette.text.secondary} />
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
          Background
        </Typography>
      </Stack>
      
      {/* Tabs for background options */}
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => updateState({ activeTab: newValue })}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ 
          mb: 2,
          minHeight: 36,
          '& .MuiTab-root': {
            minHeight: 36,
            fontSize: '0.75rem',
            textTransform: 'none',
            fontWeight: 600,
            py: 0.75,
            px: 1.5,
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        <Tab value="colors" label="Colors" />
        <Tab value="gradients" label="Gradients" />
        <Tab value="patterns" label="Patterns" />
        <Tab value="templates" label="Templates" />
      </Tabs>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Content based on selected tab */}
      <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 0.5 }}>
        {activeTab === 'colors' && (
          <ColorBackgroundTab
            pageData={pageData}
            customColor={customColor}
            onCustomColorChange={(color) => updateState({ customColor: color })}
            onApplyBackground={applyBackground}
          />
        )}

        {activeTab === 'gradients' && (
          <GradientBackgroundTab
            pageData={pageData}
            onApplyBackground={applyBackground}
          />
        )}

        {activeTab === 'patterns' && (
          <PatternBackgroundTab
            pageData={pageData}
            onApplyBackground={applyBackground}
          />
        )}

        {activeTab === 'templates' && (
          <TemplateBackgroundTab
            pageData={pageData}
            onApplyBackground={applyBackground}
          />
        )}
      </Box>

      {/* Image Background Section - Always visible */}
      <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <ImageBackgroundTab
          pageData={pageData}
          imageSize={imageSize}
          imagePosition={imagePosition}
          imageOpacity={imageOpacity}
          onImageSizeChange={handleImageSizeChange}
          onImagePositionChange={handleImagePositionChange}
          onImageOpacityChange={handleImageOpacityChange}
          onImageUpload={handleImageUpload}
          onRemoveImage={handleRemoveImage}
        />
      </Box>
    </Box>
  );
};

export default BackgroundEditor;

