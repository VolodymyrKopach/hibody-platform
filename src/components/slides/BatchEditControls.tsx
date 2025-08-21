/**
 * === SOLID: SRP - Batch Edit Controls ===
 * 
 * Controls for initiating batch slide editing operations
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Chip,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Edit3, 
  ChevronDown, 
  Palette, 
  Type, 
  Image, 
  Zap, 
  Target,
  Layers,
  MoreHorizontal
} from 'lucide-react';

// === SOLID: SRP - Styled Components ===
const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
}));

const SlideCountChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: 24,
}));

// === SOLID: ISP - Component interfaces ===
export interface BatchEditAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
  instruction: string;
  category: 'visual' | 'content' | 'structure' | 'interactive';
}

interface BatchEditControlsProps {
  selectedSlides: Set<string>;
  totalSlides: number;
  onBatchEdit: (action: BatchEditAction, slideNumbers: number[]) => void;
  disabled?: boolean;
}

// === SOLID: SRP - Predefined batch edit actions ===
const BATCH_EDIT_ACTIONS: BatchEditAction[] = [
  // Visual improvements
  {
    id: 'make-titles-bigger',
    label: 'Make Titles Bigger',
    description: 'Increase the size of all slide titles',
    icon: Type,
    instruction: 'make all titles bigger and more prominent',
    category: 'visual'
  },
  {
    id: 'change-background',
    label: 'Change Background',
    description: 'Update background colors/styles',
    icon: Palette,
    instruction: 'change the background to a more colorful and engaging design',
    category: 'visual'
  },
  {
    id: 'improve-images',
    label: 'Improve Images',
    description: 'Enhance image placement and styling',
    icon: Image,
    instruction: 'improve image positioning and add better styling',
    category: 'visual'
  },
  
  // Content improvements
  {
    id: 'simplify-text',
    label: 'Simplify Text',
    description: 'Make text easier to understand',
    icon: Target,
    instruction: 'simplify the text to make it easier for children to understand',
    category: 'content'
  },
  {
    id: 'add-emojis',
    label: 'Add Emojis',
    description: 'Add fun emojis to make slides more engaging',
    icon: Zap,
    instruction: 'add relevant emojis and fun elements to make slides more engaging',
    category: 'content'
  },
  
  // Interactive improvements
  {
    id: 'add-animations',
    label: 'Add Animations',
    description: 'Add CSS animations and transitions',
    icon: Zap,
    instruction: 'add smooth CSS animations and transitions to make slides more interactive',
    category: 'interactive'
  },
  {
    id: 'improve-layout',
    label: 'Improve Layout',
    description: 'Optimize slide layout and spacing',
    icon: Layers,
    instruction: 'improve the overall layout, spacing, and visual hierarchy',
    category: 'structure'
  }
];

// === SOLID: SRP - Group actions by category ===
const groupActionsByCategory = (actions: BatchEditAction[]) => {
  return actions.reduce((groups, action) => {
    if (!groups[action.category]) {
      groups[action.category] = [];
    }
    groups[action.category].push(action);
    return groups;
  }, {} as Record<string, BatchEditAction[]>);
};

// === SOLID: SRP - Get category label ===
const getCategoryLabel = (category: string) => {
  const labels = {
    visual: 'Visual Improvements',
    content: 'Content Enhancements',
    structure: 'Layout & Structure',
    interactive: 'Interactive Elements'
  };
  return labels[category as keyof typeof labels] || category;
};

// === SOLID: SRP - Get category icon ===
const getCategoryIcon = (category: string) => {
  const icons = {
    visual: Palette,
    content: Type,
    structure: Layers,
    interactive: Zap
  };
  return icons[category as keyof typeof icons] || MoreHorizontal;
};

// === SOLID: SRP - Main Component ===
const BatchEditControls: React.FC<BatchEditControlsProps> = ({
  selectedSlides,
  totalSlides,
  onBatchEdit,
  disabled = false
}) => {
  const { t } = useTranslation(['slides', 'common']);
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const selectedCount = selectedSlides.size;
  const hasSelection = selectedCount > 0;
  const isAllSelected = selectedCount === totalSlides;

  // Convert selected slide IDs to slide numbers (assuming IDs are slide_1, slide_2, etc.)
  const getSlideNumbers = (): number[] => {
    if (isAllSelected) {
      return Array.from({ length: totalSlides }, (_, i) => i + 1);
    }
    
    // Extract slide numbers from IDs
    return Array.from(selectedSlides)
      .map(id => {
        const match = id.match(/slide_(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0)
      .sort((a, b) => a - b);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleActionSelect = (action: BatchEditAction) => {
    const slideNumbers = getSlideNumbers();
    onBatchEdit(action, slideNumbers);
    handleClose();
  };

  const groupedActions = groupActionsByCategory(BATCH_EDIT_ACTIONS);

  return (
    <ControlsContainer>
      {/* Selection Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {hasSelection ? (
            isAllSelected ? 'All slides selected' : `${selectedCount} slides selected`
          ) : (
            'No slides selected'
          )}
        </Typography>
        {hasSelection && (
          <SlideCountChip 
            size="small"
            label={isAllSelected ? 'All' : selectedCount.toString()}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {/* Batch Edit Button */}
      <Tooltip title={hasSelection ? 'Choose batch edit action' : 'Select slides to enable batch editing'}>
        <span>
          <Button
            variant="contained"
            size="small"
            startIcon={<Edit3 size={16} />}
            endIcon={<ChevronDown size={16} />}
            onClick={handleClick}
            disabled={disabled || !hasSelection}
            sx={{ minWidth: 140 }}
          >
            Batch Edit
          </Button>
        </span>
      </Tooltip>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 280,
            maxHeight: 400,
            mt: 1,
          }
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {/* Menu Header */}
        <Box sx={{ px: 2, py: 1, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
          <Typography variant="subtitle2" color="primary">
            Batch Edit Actions
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isAllSelected 
              ? `Apply to all ${totalSlides} slides`
              : `Apply to ${selectedCount} selected slides`
            }
          </Typography>
        </Box>
        
        <Divider />

        {/* Actions by Category */}
        {Object.entries(groupedActions).map(([category, actions], categoryIndex) => {
          const CategoryIcon = getCategoryIcon(category);
          
          return (
            <Box key={category}>
              {categoryIndex > 0 && <Divider />}
              
              {/* Category Header */}
              <Box sx={{ px: 2, py: 1, backgroundColor: alpha(theme.palette.background.default, 0.5) }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CategoryIcon size={16} color={theme.palette.text.secondary} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {getCategoryLabel(category)}
                  </Typography>
                </Box>
              </Box>

              {/* Category Actions */}
              {actions.map((action) => {
                const ActionIcon = action.icon;
                
                return (
                  <MenuItem 
                    key={action.id}
                    onClick={() => handleActionSelect(action)}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon>
                      <ActionIcon size={20} />
                    </ListItemIcon>
                    <ListItemText
                      primary={action.label}
                      secondary={action.description}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </MenuItem>
                );
              })}
            </Box>
          );
        })}
      </Menu>
    </ControlsContainer>
  );
};

export default BatchEditControls;
