import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Maximize2 } from 'lucide-react';

interface SimpleSlide {
  id: string;
  title: string;
  content: string;
  htmlContent: string;
  type: 'title' | 'content' | 'interactive' | 'summary';
  status: 'completed' | 'draft';
  previewUrl?: string;
}

interface SlideCardProps {
  slide: SimpleSlide;
  index: number;
  isSelected: boolean;
  isUpdating: boolean;
  previewUrl?: string;
  onToggleSelection: (slideId: string) => void;
  onOpenDialog: (index: number) => void;
  onRegeneratePreview: (slideId: string) => void;
}

const SlideCard: React.FC<SlideCardProps> = ({
  slide,
  index,
  isSelected,
  isUpdating,
  previewUrl,
  onToggleSelection,
  onOpenDialog,
  onRegeneratePreview
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        border: `1px solid ${isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        backgroundColor: isSelected 
          ? alpha(theme.palette.primary.main, 0.08)
          : 'white',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }
      }}
    >
      {/* Превью слайду */}
      <Box sx={{ 
        position: 'relative',
        height: 160, 
        overflow: 'hidden',
        backgroundColor: alpha(theme.palette.grey[100], 0.3),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        {/* Реальне превью слайду */}
        {previewUrl && !isUpdating ? (
          <img
            src={previewUrl}
            alt={`Превью слайду ${index + 1}`}
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
              {isUpdating ? 'Оновлення...' : 'Генерація...'}
            </Typography>
          </Box>
        )}
        
        {/* Номер слайду */}
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: alpha(theme.palette.primary.main, 0.8),
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.7rem',
            fontWeight: 600
          }}
        >
          {index + 1}
        </Typography>

        {/* Статус індикатор */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: slide.status === 'completed' 
              ? theme.palette.success.main 
              : theme.palette.warning.main,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />

        {/* Кнопка оновлення превью */}
        {previewUrl && (
          <Tooltip title={isUpdating ? "Оновлюється..." : "Оновити превью"}>
            <IconButton
              size="small"
              disabled={isUpdating}
              onClick={(e) => {
                e.stopPropagation();
                onRegeneratePreview(slide.id);
              }}
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                width: 24,
                height: 24,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
                '&:disabled': {
                  opacity: 0.5
                }
              }}
            >
              {isUpdating ? (
                <CircularProgress size={12} />
              ) : (
                <Box component="span" sx={{ fontSize: '12px' }}>🔄</Box>
              )}
            </IconButton>
          </Tooltip>
        )}
        
        {/* Ховер ефект */}
        <Box
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
      </Box>

      {/* Інформація про слайд */}
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          {/* Checkbox для вибору слайду */}
          <Checkbox
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelection(slide.id);
            }}
            size="small"
            sx={{
              p: 0.5,
              color: theme.palette.primary.main,
              '&.Mui-checked': {
                color: theme.palette.primary.main,
              }
            }}
          />
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600, 
              flex: 1,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
            onClick={() => onOpenDialog(index)}
          >
            {slide.title}
          </Typography>
          {/* Кнопка перегляду */}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDialog(index);
            }}
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <Maximize2 size={14} />
          </IconButton>
        </Box>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            ml: 3, // Відступ від checkbox
            fontSize: '0.75rem'
          }}
        >
          {slide.content}
        </Typography>
      </Box>
    </Paper>
  );
};

export default SlideCard; 