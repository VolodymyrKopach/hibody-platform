import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Collapse,
  Fade,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { 
  AgeGroupConfig, 
  FilterConfig, 
  FilterGroup,
  FormValues, 
  ValidationErrors 
} from '@/types/generation';
import { configManager } from '@/services/generation/ConfigManager';
import FieldRenderer from './FieldRenderer';

// === SOLID: SRP - Styled Components ===
const FilterSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: (theme.shape.borderRadius as number) * 2,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    borderColor: alpha(theme.palette.primary.main, 0.3),
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  padding: theme.spacing(1, 0),
  borderRadius: theme.shape.borderRadius,
  transition: 'background-color 0.2s ease',
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.action.hover, 0.5),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  
  [theme.breakpoints.down('md')]: {
    fontSize: '1rem',
  },
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9375rem',
  },
}));

const SectionDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  lineHeight: 1.5,
  
  [theme.breakpoints.down('md')]: {
    fontSize: '0.8125rem',
  },
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  },
}));

const FieldGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: theme.spacing(2),
  
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: theme.spacing(1.5),
  },
  
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(1),
  },
}));

const RequiredIndicator = styled(Box)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: '0.875rem',
  marginLeft: theme.spacing(0.5),
}));

const ErrorMessage = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.error.main,
  marginTop: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

// === SOLID: ISP - Specific interface for FilterForm ===
interface FilterFormProps {
  ageGroupConfig: AgeGroupConfig;
  values: FormValues;
  errors: ValidationErrors;
  onChange: (field: string, value: any) => void;
  onBlur?: (field: string) => void;
  disabled?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: (sectionId: string) => void;
}

// === SOLID: SRP - Filter section component ===
interface FilterSectionProps {
  sectionId: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  filters: FilterConfig[];
  values: FormValues;
  errors: ValidationErrors;
  onChange: (field: string, value: any) => void;
  onBlur?: (field: string) => void;
  disabled?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: (sectionId: string) => void;
}

const FilterSectionComponent: React.FC<FilterSectionProps> = ({
  sectionId,
  title,
  description,
  icon,
  filters,
  values,
  errors,
  onChange,
  onBlur,
  disabled = false,
  collapsed = false,
  onToggleCollapse
}) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  
  // === SOLID: SRP - Handle section toggle ===
  const handleToggle = useCallback(() => {
    onToggleCollapse?.(sectionId);
  }, [sectionId, onToggleCollapse]);
  
  // === SOLID: SRP - Check if section has errors ===
  const hasErrors = useMemo(() => {
    return filters.some((filter: FilterConfig) => 
      errors[filter.field] && errors[filter.field].length > 0
    );
  }, [filters, errors]);
  
  // === SOLID: SRP - Count required fields ===
  const requiredCount = useMemo(() => {
    return filters.filter((filter: FilterConfig) => filter.required).length;
  }, [filters]);
  
  // === SOLID: SRP - Count filled fields ===
  const filledCount = useMemo(() => {
    return filters.filter((filter: FilterConfig) => {
      const value = values[filter.field];
      return value !== undefined && value !== null && value !== '';
    }).length;
  }, [filters, values]);
  
  return (
    <FilterSection
      elevation={0}
      sx={{
        borderColor: hasErrors ? 
          alpha(theme.palette.error.main, 0.3) : 
          alpha(theme.palette.primary.main, 0.1),
        backgroundColor: hasErrors ? 
          alpha(theme.palette.error.main, 0.02) : 
          'transparent',
      }}
    >
      <SectionHeader onClick={handleToggle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon && <Box sx={{ color: theme.palette.primary.main }}>{icon}</Box>}
          <Box>
            <SectionTitle>
              {title}
              {requiredCount > 0 && (
                <RequiredIndicator>
                  *
                </RequiredIndicator>
              )}
              <Typography
                variant="caption"
                sx={{ 
                  ml: 1, 
                  color: theme.palette.text.secondary,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  padding: '2px 6px',
                  borderRadius: 1,
                  fontSize: '0.6875rem'
                }}
              >
                {filledCount}/{filters.length}
              </Typography>
            </SectionTitle>
            {description && (
              <SectionDescription>{description}</SectionDescription>
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasErrors && (
            <Typography variant="caption" color="error.main">
              {t('form.hasErrors', 'Є помилки')}
            </Typography>
          )}
          <IconButton size="small" disabled={disabled}>
            {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </IconButton>
        </Box>
      </SectionHeader>
      
      <Collapse in={!collapsed} timeout={300}>
        <Divider sx={{ mb: 2 }} />
        <FieldGrid>
          {filters.map((filter: FilterConfig, index) => (
            <Fade key={filter.field} in={!collapsed} timeout={300} style={{ transitionDelay: `${index * 100}ms` }}>
              <Box>
                <FieldRenderer
                  config={filter}
                  value={values[filter.field]}
                  error={errors[filter.field]}
                  onChange={(value) => onChange(filter.field, value)}
                  onBlur={() => onBlur?.(filter.field)}
                  disabled={disabled}
                />
                
                {/* Показуємо додаткові помилки */}
                {errors[filter.field] && errors[filter.field].length > 0 && (
                  <ErrorMessage>
                    {errors[filter.field].join(', ')}
                  </ErrorMessage>
                )}
              </Box>
            </Fade>
          ))}
        </FieldGrid>
      </Collapse>
    </FilterSection>
  );
};

// === SOLID: SRP - Main FilterForm component ===
const FilterForm: React.FC<FilterFormProps> = ({ 
  ageGroupConfig, 
  values, 
  errors, 
  onChange, 
  onBlur,
  disabled = false,
  collapsed = false,
  onToggleCollapse
}) => {
  const { t } = useTranslation('common');
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({});
  
  // === SOLID: SRP - Get filters for current age group ===
  const ageGroupFilters = useMemo(() => {
    return configManager.getFiltersForAge(ageGroupConfig.id);
  }, [ageGroupConfig.id]);
  
  // === SOLID: SRP - Group filters by section ===
  const filterSections = useMemo(() => {
    const sections: Record<string, FilterConfig[]> = {};
    
    ageGroupFilters.groups.forEach((group: FilterGroup) => {
      group.filters.forEach((filter: FilterConfig) => {
        const section = filter.section || 'general';
        if (!sections[section]) {
          sections[section] = [];
        }
        sections[section].push(filter);
      });
    });
    
    return sections;
  }, [ageGroupFilters.groups]);
  
  // === SOLID: SRP - Get section metadata ===
  const getSectionMetadata = useCallback((sectionId: string) => {
    const metadata: Record<string, { title: string; description: string; icon: string }> = {
      general: {
        title: t('form.sections.general', 'Основні параметри'),
        description: t('form.sections.generalDesc', 'Базові налаштування для генерації'),
        icon: '⚙️'
      },
      content: {
        title: t('form.sections.content', 'Контент'),
        description: t('form.sections.contentDesc', 'Налаштування змісту та тематики'),
        icon: '📝'
      },
      difficulty: {
        title: t('form.sections.difficulty', 'Складність'),
        description: t('form.sections.difficultyDesc', 'Рівень складності та вимоги'),
        icon: '🎯'
      },
      format: {
        title: t('form.sections.format', 'Формат'),
        description: t('form.sections.formatDesc', 'Налаштування формату та презентації'),
        icon: '🎨'
      },
      language: {
        title: t('form.sections.language', 'Мова'),
        description: t('form.sections.languageDesc', 'Мовні налаштування'),
        icon: '🌐'
      }
    };
    
    return metadata[sectionId] || {
      title: sectionId,
      description: '',
      icon: '📋'
    };
  }, [t]);
  
  return (
    <Box>
      {Object.entries(filterSections).map(([sectionId, filters]) => {
        const metadata = getSectionMetadata(sectionId);
        
        return (
          <FilterSectionComponent
            key={sectionId}
            sectionId={sectionId}
            title={metadata.title}
            description={metadata.description}
            icon={metadata.icon}
            filters={filters}
            values={values}
            errors={errors}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            collapsed={collapsed}
            onToggleCollapse={onToggleCollapse}
          />
        );
      })}
    </Box>
  );
};

export default FilterForm; 