'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { Image as ImageIcon, Upload } from 'lucide-react';

interface ImagePlaceholderProps {
  url?: string;
  caption?: string;
  width?: number;
  height?: number;
  align?: 'left' | 'center' | 'right';
  isSelected?: boolean;
  onEdit?: (properties: { url?: string; caption?: string; width?: number; height?: number; align?: string }) => void;
  onFocus?: () => void;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ 
  url,
  caption = 'Image',
  width = 400,
  height = 300,
  align = 'center',
  isSelected = false,
  onEdit,
  onFocus,
}) => {
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [localCaption, setLocalCaption] = useState(caption);
  const [imageError, setImageError] = useState(false);
  const captionRef = useRef<HTMLDivElement>(null);

  // Sync with external changes
  useEffect(() => {
    setLocalCaption(caption);
  }, [caption]);

  // Focus when editing starts
  useEffect(() => {
    if (isEditingCaption && captionRef.current) {
      captionRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(captionRef.current);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditingCaption]);

  const handleCaptionBlur = () => {
    const text = captionRef.current?.textContent || '';
    if (text.trim() && onEdit) {
      onEdit({ caption: text.trim() });
      setLocalCaption(text.trim());
    }
    setIsEditingCaption(false);
  };

  const handleCaptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCaptionBlur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditingCaption(false);
      setLocalCaption(caption);
    }
  };

  const handleCaptionDoubleClick = () => {
    if (isSelected && onEdit) {
      setIsEditingCaption(true);
    }
  };

  const handleClick = () => {
    if (onFocus) {
      onFocus();
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };
  const hasValidImage = url && !imageError;

  const getAlignmentStyles = () => {
    switch (align) {
      case 'left':
        return { marginLeft: 0, marginRight: 'auto' };
      case 'right':
        return { marginLeft: 'auto', marginRight: 0 };
      case 'center':
      default:
        return { marginLeft: 'auto', marginRight: 'auto' };
    }
  };

  return (
    <Box onClick={handleClick}>
      <Box
        sx={{
          width: '100%',
          maxWidth: width,
          height: height,
          ...getAlignmentStyles(),
          borderRadius: '8px',
          border: hasValidImage ? '1px solid #E5E7EB' : '2px dashed #D1D5DB',
          background: hasValidImage ? '#FFFFFF' : '#F9FAFB',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          overflow: 'hidden',
          position: 'relative',
          cursor: isSelected && onEdit ? 'pointer' : 'default',
          transition: 'all 0.2s',
          '&:hover': isSelected && onEdit ? {
            borderColor: '#2563EB',
            borderWidth: '2px',
          } : {},
        }}
      >
        {hasValidImage ? (
          <Box
            component="img"
            src={url}
            alt={caption}
            onError={handleImageError}
            onLoad={handleImageLoad}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <>
            <ImageIcon size={48} color="#9CA3AF" />
            <Typography
              sx={{
                fontSize: '14px',
                color: '#6B7280',
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {imageError ? 'Failed to load image' : 'Image Placeholder'}
            </Typography>
            {isSelected && onEdit && (
              <Typography
                sx={{
                  fontSize: '11px',
                  color: '#9CA3AF',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Add image URL in properties →
              </Typography>
            )}
          </>
        )}
      </Box>
      
      {(caption || isEditingCaption) && (
        isEditingCaption ? (
          <Box
            ref={captionRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleCaptionBlur}
            onKeyDown={handleCaptionKeyDown}
            sx={{
              fontSize: '12px',
              color: '#6B7280',
              textAlign: align,
              mt: 1,
              fontStyle: 'italic',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
              border: '1px solid #2563EB',
              borderRadius: '4px',
              padding: '4px 8px',
              backgroundColor: '#FFFFFF',
            }}
          >
            {localCaption}
          </Box>
        ) : (
          <Typography
            onDoubleClick={handleCaptionDoubleClick}
            sx={{
              fontSize: '12px',
              color: '#6B7280',
              textAlign: align,
              mt: 1,
              fontStyle: 'italic',
              fontFamily: 'Inter, sans-serif',
              cursor: isSelected && onEdit ? 'text' : 'default',
              '&:hover': isSelected && onEdit ? {
                backgroundColor: '#F9FAFB',
                borderRadius: '4px',
                padding: '4px 8px',
                margin: '4px -8px',
              } : {},
            }}
          >
            {localCaption}
          </Typography>
        )
      )}
    </Box>
  );
};

export default ImagePlaceholder;

