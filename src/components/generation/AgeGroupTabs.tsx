import React from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  useTheme, 
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Baby, School, Users, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AgeGroupId } from '@/types/generation';
import { configManager } from '@/services/generation/ConfigManager';

// === SOLID: SRP - Styled Components ===
const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-root': {
    minHeight: 'auto',
  },
  '& .MuiTabs-flexContainer': {
    gap: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      gap: theme.spacing(0.5),
    },
  },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '2px 2px 0 0',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  '& .MuiTabs-scrollButtons': {
    '&.Mui-disabled': {
      opacity: 0.3,
    },
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minHeight: 'auto',
  padding: theme.spacing(1.5, 2),
  minWidth: 'auto',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  margin: theme.spacing(0, 0.5),
  border: `1px solid ${theme.palette.divider}`,
  borderBottom: 'none',
  position: 'relative',
  overflow: 'visible',
  
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${theme.palette.primary.main}`,
  },
  
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    transform: 'translateY(-1px)',
    boxShadow: `0 2px 8px ${theme.palette.primary.main}`,
    
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
      transform: 'translateY(-3px)',
      boxShadow: `0 6px 16px ${theme.palette.primary.main}`,
    },
  },
  
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1, 1.5),
    minWidth: 'auto',
    fontSize: '0.875rem',
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75, 1),
    fontSize: '0.8125rem',
  },
}));

const TabContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  position: 'relative',
}));

const TabIcon = styled(Box)(({ theme }) => ({
  fontSize: '1.5rem',
  lineHeight: 1,
  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  [theme.breakpoints.down('md')]: {
    fontSize: '1.25rem',
  },
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.125rem',
  },
}));

const TabLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1.2,
  textAlign: 'center',
  
  [theme.breakpoints.down('md')]: {
    fontSize: '0.8125rem',
  },
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  },
}));

const TabSubLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  opacity: 0.7,
  lineHeight: 1,
  
  [theme.breakpoints.down('md')]: {
    fontSize: '0.6875rem',
  },
  
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const ProgressIndicator = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: -6,
  right: -6,
  fontSize: '0.65rem',
  height: '18px',
  minWidth: '32px',
  borderRadius: '9px',
  
  '&.MuiChip-filled': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  
  '&.MuiChip-outlined': {
    borderColor: theme.palette.error.main,
    color: theme.palette.error.main,
  },
}));

const AgeGroupDescription = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.primary.main}`,
  
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1.5),
    marginTop: theme.spacing(1.5),
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
}));

// === SOLID: ISP - Specific interface for tabs ===
interface AgeGroupTabsProps {
  selectedAgeGroup: AgeGroupId;
  onAgeGroupChange: (ageGroup: AgeGroupId) => void;
  validationErrors: Record<string, string[]>;
  formProgress: number;
  showDescription?: boolean;
}

// === SOLID: SRP - Age group tabs component ===
const AgeGroupTabs: React.FC<AgeGroupTabsProps> = ({
  selectedAgeGroup,
  onAgeGroupChange,
  validationErrors,
  formProgress,
  showDescription = true
}) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  
  // === SOLID: SRP - Get age group configurations ===
  const ageGroups = configManager.getAgeGroups();
  
  // === SOLID: SRP - Handle tab change ===
  const handleTabChange = (event: React.SyntheticEvent, newValue: AgeGroupId) => {
    onAgeGroupChange(newValue);
  };
  
  // === SOLID: SRP - Calculate progress for age group ===
  const getAgeGroupProgress = (ageGroupId: AgeGroupId): number => {
    if (ageGroupId === selectedAgeGroup) {
      return formProgress;
    }
    return 0; // No progress for other age groups
  };
  
  // === SOLID: SRP - Get progress color ===
  const getProgressColor = (progress: number): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    if (progress === 0) return 'default';
    if (progress < 30) return 'error';
    if (progress < 60) return 'warning';
    if (progress < 90) return 'info';
    return 'success';
  };
  
  // === SOLID: SRP - Get current age group config ===
  const currentAgeGroup = ageGroups.find((group) => group.id === selectedAgeGroup);
  
  return (
    <Box>
      <StyledTabs
        value={selectedAgeGroup}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label={t('ageGroupTabs.label', 'Age Group Selection')}
      >
        {ageGroups.map((ageGroup) => {
          const progress = getAgeGroupProgress(ageGroup.id as AgeGroupId);
          const hasErrors = validationErrors[ageGroup.id]?.length > 0;
          
          return (
            <StyledTab
              key={ageGroup.id}
              value={ageGroup.id}
              label={
                <TabContent>
                  <TabIcon
                    sx={{
                      transform: selectedAgeGroup === ageGroup.id ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {ageGroup.icon}
                  </TabIcon>
                  <TabLabel>{ageGroup.name}</TabLabel>
                  <TabSubLabel>{ageGroup.ageRange}</TabSubLabel>
                  
                  {progress > 0 && (
                    <ProgressIndicator
                      label={`${Math.round(progress)}%`}
                      color={getProgressColor(progress)}
                      size="small"
                      variant={hasErrors ? 'outlined' : 'filled'}
                    />
                  )}
                </TabContent>
              }
              aria-label={t('ageGroupTabs.ageGroupLabel', {
                name: ageGroup.name,
                range: ageGroup.ageRange
              })}
            />
          );
        })}
      </StyledTabs>
      
      {showDescription && currentAgeGroup && (
        <AgeGroupDescription>
          <Typography variant="body2" color="text.secondary">
            <strong>{currentAgeGroup.name}</strong> ({currentAgeGroup.ageRange})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {currentAgeGroup.description}
          </Typography>
        </AgeGroupDescription>
      )}
    </Box>
  );
};

export default AgeGroupTabs; 