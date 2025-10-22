'use client';

import React from 'react';
import { Box, Typography, Paper, Button, Stack, Slider, useTheme } from '@mui/material';
import { alpha } from '@mui/material';
import { Upload, Trash, Image as ImageIcon } from 'lucide-react';
import { PageBackground } from '@/types/sidebar';

interface ImageBackgroundTabProps {
  pageData: any;
  imageSize: 'cover' | 'contain' | 'repeat' | 'auto';
  imagePosition: 'center' | 'top' | 'bottom' | 'left' | 'right';
  imageOpacity: number;
  onImageSizeChange: (size: 'cover' | 'contain' | 'repeat' | 'auto') => void;
  onImagePositionChange: (position: 'center' | 'top' | 'bottom' | 'left' | 'right') => void;
  onImageOpacityChange: (opacity: number) => void;
  onImageUpload?: (file: File) => Promise<void>;
  onRemoveImage: () => void;
}

const ImageBackgroundTab: React.FC<ImageBackgroundTabProps> = ({
  pageData,
  imageSize,
  imagePosition,
  imageOpacity,
  onImageSizeChange,
  onImagePositionChange,
  onImageOpacityChange,
  onImageUpload,
  onRemoveImage,
}) => {
  const theme = useTheme();
  const hasImage = pageData.background && pageData.background.type === 'image';

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <ImageIcon size={16} color={theme.palette.text.secondary} />
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
          Custom Image Background
        </Typography>
      </Stack>

      {!hasImage ? (
        <Button
          fullWidth
          variant="outlined"
          component="label"
          startIcon={<Upload size={16} />}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '0.875rem',
            borderStyle: 'dashed',
            py: 2,
            '&:hover': {
              borderStyle: 'dashed',
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          }}
        >
          Upload Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file && onImageUpload) {
                await onImageUpload(file);
              }
            }}
          />
        </Button>
      ) : (
        <Stack spacing={2}>
          {/* Preview */}
          <Paper
            elevation={0}
            sx={{
              height: 120,
              borderRadius: 2,
              backgroundImage: `url(${pageData.background.image?.url})`,
              backgroundSize: imageSize,
              backgroundPosition: imagePosition,
              backgroundRepeat: imageSize === 'repeat' ? 'repeat' : 'no-repeat',
              opacity: imageOpacity / 100,
              border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
            }}
          />

          {/* Size Control */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mb: 1, display: 'block' }}>
              Image Size
            </Typography>
            <Stack direction="row" spacing={1}>
              {(['cover', 'contain', 'repeat', 'auto'] as const).map((size) => (
                <Button
                  key={size}
                  size="small"
                  variant={imageSize === size ? 'contained' : 'outlined'}
                  onClick={() => onImageSizeChange(size)}
                  sx={{
                    flex: 1,
                    textTransform: 'capitalize',
                    fontSize: '0.7rem',
                    borderRadius: '6px',
                    minWidth: 0,
                    px: 1,
                  }}
                >
                  {size}
                </Button>
              ))}
            </Stack>
          </Box>

          {/* Position Control */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mb: 1, display: 'block' }}>
              Position
            </Typography>
            <Stack direction="row" spacing={1}>
              {(['center', 'top', 'bottom', 'left', 'right'] as const).map((pos) => (
                <Button
                  key={pos}
                  size="small"
                  variant={imagePosition === pos ? 'contained' : 'outlined'}
                  onClick={() => onImagePositionChange(pos)}
                  sx={{
                    flex: 1,
                    textTransform: 'capitalize',
                    fontSize: '0.7rem',
                    borderRadius: '6px',
                    minWidth: 0,
                    px: 0.5,
                  }}
                >
                  {pos}
                </Button>
              ))}
            </Stack>
          </Box>

          {/* Opacity */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Opacity
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                {imageOpacity}%
              </Typography>
            </Stack>
            <Slider
              value={imageOpacity}
              onChange={(e, newValue) => onImageOpacityChange(newValue as number)}
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

          {/* Remove Button */}
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Trash size={14} />}
            onClick={onRemoveImage}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '0.75rem',
            }}
          >
            Remove Image
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default ImageBackgroundTab;

