'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Stack, Button, CircularProgress, alpha, Chip } from '@mui/material';
import { Image as ImageIcon, Upload, X, AlertCircle, HardDrive, Cloud } from 'lucide-react';
import { worksheetImageService } from '@/services/images/WorksheetImageService';
import { localImageService } from '@/services/images/LocalImageService';

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
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [storageMode, setStorageMode] = useState<'local' | 'cloud'>('local'); // Default to local
  const [isCloudAvailable, setIsCloudAvailable] = useState<boolean | null>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Check if cloud storage is available on mount
  useEffect(() => {
    const checkCloudStorage = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        // Cloud available if user is authenticated and no error
        const available = !error && !!user;
        setIsCloudAvailable(available);
        
        // Default to cloud if available, otherwise local
        if (!available) {
          setStorageMode('local');
          console.log('📍 Using LOCAL storage mode (Supabase not available)');
        } else {
          console.log('☁️ Cloud storage available - using LOCAL by default (can switch)');
        }
      } catch (error) {
        // Supabase not configured
        setIsCloudAvailable(false);
        setStorageMode('local');
        console.log('📍 Using LOCAL storage mode (Supabase not configured)');
      }
    };

    checkCloudStorage();
  }, []);

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

  // File upload handler - smart routing to local or cloud
  const handleFileSelect = async (file: File) => {
    setUploadError('');
    setIsUploading(true);

    try {
      let result;

      if (storageMode === 'local') {
        // LOCAL STORAGE - Convert to Base64
        console.log('📍 Uploading to LOCAL storage...');
        result = await localImageService.uploadLocalImage(file, {
          compress: true, // Auto-compress large images
          maxWidth: 1920
        });
      } else {
        // CLOUD STORAGE - Upload to Supabase
        console.log('☁️ Uploading to CLOUD storage...');
        result = await worksheetImageService.uploadWorksheetImage(file);
      }

      if (result.success && result.url) {
        // Update component with new image URL (Base64 or Cloud URL)
        if (onEdit) {
          onEdit({ 
            url: result.url,
            width: result.width,
            height: result.height
          });
        }
        console.log(`✅ Image uploaded successfully (${storageMode}):`, 
          storageMode === 'local' 
            ? `${(result.size / 1024).toFixed(0)}KB Base64` 
            : result.url.substring(0, 50) + '...'
        );
      } else {
        setUploadError(result.error || 'Upload failed');
        console.error('❌ Upload failed:', result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setUploadError(errorMessage);
      console.error('💥 Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // File input change handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      setUploadError('Please drop an image file');
    }
  };

  // Clear upload error when image changes
  useEffect(() => {
    setUploadError('');
  }, [url]);

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
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      <Box
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          width: '100%',
          maxWidth: width,
          height: height,
          ...getAlignmentStyles(),
          borderRadius: '8px',
          border: isDragging 
            ? '3px dashed #2563EB' 
            : hasValidImage 
              ? '1px solid #E5E7EB' 
              : '2px dashed #D1D5DB',
          background: isDragging 
            ? alpha('#2563EB', 0.05)
            : hasValidImage 
              ? '#FFFFFF' 
              : '#F9FAFB',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          overflow: 'hidden',
          position: 'relative',
          cursor: isSelected && onEdit ? 'pointer' : 'default',
          transition: 'all 0.2s',
          '&:hover': isSelected && onEdit && !hasValidImage ? {
            borderColor: '#2563EB',
            background: alpha('#2563EB', 0.02),
          } : {},
        }}
      >
        {isUploading ? (
          // Loading state
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={40} />
            <Typography
              sx={{
                fontSize: '14px',
                color: '#6B7280',
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Uploading...
            </Typography>
          </Stack>
        ) : hasValidImage ? (
          // Image loaded
          <>
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
            {/* Delete/Replace overlay on hover when selected */}
            {isSelected && onEdit && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: alpha('#000000', 0),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: alpha('#000000', 0.5),
                    opacity: 1,
                  },
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Upload size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  sx={{
                    textTransform: 'none',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Replace Image
                </Button>
              </Box>
            )}
          </>
        ) : (
          // Empty placeholder
          <>
            {isDragging ? (
              <>
                <Upload size={48} color="#2563EB" />
                <Typography
                  sx={{
                    fontSize: '16px',
                    color: '#2563EB',
                    fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Drop image here
                </Typography>
              </>
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
                  <Stack spacing={1.5} alignItems="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Upload size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      sx={{
                        textTransform: 'none',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                      }}
                    >
                      Upload Image
                    </Button>

                    {/* Storage mode toggle */}
                    {isCloudAvailable !== null && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Chip
                          icon={storageMode === 'local' ? <HardDrive size={12} /> : <Cloud size={12} />}
                          label={storageMode === 'local' ? 'Local' : 'Cloud'}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCloudAvailable) {
                              setStorageMode(prev => prev === 'local' ? 'cloud' : 'local');
                            }
                          }}
                          sx={{
                            fontSize: '10px',
                            height: '20px',
                            cursor: isCloudAvailable ? 'pointer' : 'default',
                            background: storageMode === 'local' ? '#F3F4F6' : '#DBEAFE',
                            border: `1px solid ${storageMode === 'local' ? '#D1D5DB' : '#93C5FD'}`,
                            '&:hover': isCloudAvailable ? {
                              background: storageMode === 'local' ? '#E5E7EB' : '#BFDBFE',
                            } : {},
                            '& .MuiChip-icon': {
                              fontSize: '12px',
                              marginLeft: '4px',
                            },
                          }}
                        />
                        {!isCloudAvailable && (
                          <Typography
                            sx={{
                              fontSize: '9px',
                              color: '#9CA3AF',
                              fontFamily: 'Inter, sans-serif',
                            }}
                          >
                            (cloud unavailable)
                          </Typography>
                        )}
                      </Stack>
                    )}

                    <Typography
                      sx={{
                        fontSize: '11px',
                        color: '#9CA3AF',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      or drag & drop • URL in properties →
                    </Typography>
                  </Stack>
                )}
              </>
            )}
          </>
        )}
      </Box>

      {/* Upload error message */}
      {uploadError && (
        <Box
          sx={{
            mt: 1,
            p: 1,
            borderRadius: '6px',
            background: alpha('#EF4444', 0.1),
            border: '1px solid #EF4444',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <AlertCircle size={16} color="#EF4444" />
            <Typography
              sx={{
                fontSize: '12px',
                color: '#EF4444',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {uploadError}
            </Typography>
          </Stack>
        </Box>
      )}
      
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

