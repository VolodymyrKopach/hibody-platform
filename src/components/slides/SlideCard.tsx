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
        width: '100%',       // Залишаємо гнучкість для менших екранів
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
        width: '100%',        // Займаємо всю ширину картки
        aspectRatio: '4/3',   // Встановлюємо правильні пропорції 4:3
        overflow: 'hidden',
        backgroundColor: alpha(theme.palette.grey[100], 0.3),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px 12px 0 0'   // Округлені кути тільки зверху
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
        


        {/* Статус індикатор */}
        <Box
          sx={{
            position: 'absolute',
            top: 4,              // Зменшено з 8 до 4
            left: 4,             // Зменшено з 8 до 4
            width: 6,            // Зменшено з 8 до 6
            height: 6,           // Зменшено з 8 до 6
            borderRadius: '50%',
            backgroundColor: slide.status === 'completed' 
              ? theme.palette.success.main 
              : theme.palette.warning.main,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />


        
        {/* Кнопка перегляду по центру */}
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
      </Box>

      {/* Інформація про слайд */}
      <Box sx={{ p: 1.5 }}>    {/* Зменшено з 2.5 до 1.5 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>   {/* Зменшено mb з 1.5 до 1 */}
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