import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Checkbox,
  CircularProgress
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Maximize2 } from 'lucide-react';

interface SimpleSlide {
  id: string;
  title: string;
  content: string;
  htmlContent: string;
  type?: 'title' | 'content' | 'interactive' | 'summary';
  status: 'completed' | 'draft' | 'generating';
  previewUrl?: string;
  thumbnailUrl?: string; // Add thumbnailUrl from database
  updatedAt?: Date;
  isPlaceholder?: boolean; // Add placeholder flag
}

interface SlideCardProps {
  slide: SimpleSlide;
  index: number;
  isSelected: boolean;
  isUpdating: boolean;
  previewUrl?: string;
  onToggleSelection: (slideId: string) => void;
  onOpenDialog: (index: number) => void;
}

const SlideCard: React.FC<SlideCardProps> = ({
  slide,
  index,
  isSelected,
  isUpdating,
  previewUrl,
  onToggleSelection,
  onOpenDialog
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',       // Maintain flexibility for smaller screens
        minHeight: '140px',  // Reduced from 200px to 140px due to smaller preview
        height: 'auto',      // Automatic height depending on content
        flexShrink: 0,       // Prevent card from shrinking
        border: slide.isPlaceholder 
          ? `2px dashed ${alpha(theme.palette.grey[400], 0.5)}`
          : `1px solid ${isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        backgroundColor: slide.isPlaceholder
          ? alpha(theme.palette.grey[50], 0.8)
          : isSelected 
            ? alpha(theme.palette.primary.main, 0.08)
            : 'white',
        opacity: slide.isPlaceholder ? 0.8 : 1,
        '&:hover': {
          borderColor: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }
      }}
    >
      {/* Slide Preview */}
      <Box sx={{ 
        position: 'relative',
        width: '100%',        // Occupy full card width
        aspectRatio: '2/1',   // Even more compact display
        overflow: 'hidden',
        backgroundColor: alpha(theme.palette.grey[100], 0.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Placeholder visual for generating slides */}
        {slide.isPlaceholder ? (
          <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            position: 'relative'
          }}>
            <Typography sx={{ 
              fontSize: '28px', 
              mb: 1, 
              opacity: 0.6,
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              🎨
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'text.secondary', 
              fontSize: '10px',
              opacity: 0.7 
            }}>
              Generating...
            </Typography>
            <style>
              {`
                @keyframes pulse {
                  0%, 100% { opacity: 0.6; }
                  50% { opacity: 0.9; }
                }
              `}
            </style>
          </Box>
        ) : /* Actual slide preview */ (previewUrl || slide.thumbnailUrl) && !isUpdating ? (
          <img
            src={previewUrl || slide.thumbnailUrl}
            alt={`Slide preview ${index + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isUpdating ? 0.5 : 1
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <CircularProgress 
              size={24} 
              sx={{ 
                color: theme.palette.primary.main,
                opacity: 0.6
              }} 
            />
            <Typography variant="caption" sx={{ 
              mt: 1, 
              opacity: 0.6,
              fontSize: '0.7rem'
            }}>
              {isUpdating ? 'Updating...' : 'Generating...'}
            </Typography>
          </Box>
        )}
        


        {/* Status indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 4,              // Reduced from 8 to 4
            left: 4,             // Reduced from 8 to 4
            width: 6,            // Reduced from 8 to 6
            height: 6,           // Reduced from 8 to 6
            borderRadius: '50%',
            backgroundColor: slide.status === 'completed' 
              ? theme.palette.success.main 
              : theme.palette.warning.main,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />


        
        {/* View button in center - disabled for placeholders */}
        {!slide.isPlaceholder && (
          <Box
            onClick={() => onOpenDialog(index)}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              cursor: 'pointer',
              '&:hover': {
                opacity: 1,
                background: alpha(theme.palette.primary.main, 0.1),
            }
          }}
        >
          <Box
            sx={{
              background: theme.palette.primary.main,
              color: 'white',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              }
            }}
          >
            <Maximize2 size={16} />
          </Box>
        </Box>
        )}
      </Box>

      {/* Slide Information */}
      <Box sx={{ p: 1.5 }}>    {/* Reduced from 2.5 to 1.5 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>   {/* Reduced mb from 1.5 to 1 */}
          {/* Checkbox for slide selection - disabled for placeholders */}
          <Checkbox
            checked={isSelected}
            disabled={slide.isPlaceholder}
            onChange={(e) => {
              e.stopPropagation();
              if (!slide.isPlaceholder) {
                onToggleSelection(slide.id);
              }
            }}
            size="small"
            sx={{
              p: 0.5,
              color: slide.isPlaceholder ? theme.palette.grey[400] : theme.palette.primary.main,
              '&.Mui-checked': {
                color: theme.palette.primary.main,
              },
              '&.Mui-disabled': {
                opacity: 0.5
              }
            }}
          />
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600, 
              flex: 1,
              fontSize: '0.9rem'
            }}
          >
            {slide.title}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default SlideCard; 