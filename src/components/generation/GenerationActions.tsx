import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Typography,
  Alert,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Sparkles, 
  Save, 
  Download, 
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useGenerationActions } from '@/hooks/useGenerationAPI';
import { AgeGroupConfig, FormValues } from '@/types/generation';

// === SOLID: SRP - Styled Components ===
const ActionsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: (theme.shape.borderRadius as number) * 2,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  
  '& .actions-header': {
    marginBottom: theme.spacing(2),
  },
  
  '& .actions-buttons': {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  },
  
  '& .progress-section': {
    marginTop: theme.spacing(2),
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minHeight: 48,
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: theme.spacing(1.5),
  transition: 'all 0.3s ease',
  
  '& .button-icon': {
    marginRight: theme.spacing(1),
  },
  
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[4],
  },
  
  '&.primary': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    color: theme.palette.primary.contrastText,
    
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
    },
  },
  
  '&.secondary': {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
    
    '&:hover': {
      backgroundColor: alpha(theme.palette.success.main, 0.15),
    },
  },
}));

// === SOLID: ISP - Specific interface for GenerationActions ===
interface GenerationActionsProps {
  ageGroupConfig: AgeGroupConfig;
  formValues: FormValues;
  isFormValid: boolean;
  onLessonGenerated?: (lesson: any) => void;
  onConfigurationSaved?: (config: any) => void;
}

// === SOLID: SRP - Main component ===
const GenerationActions: React.FC<GenerationActionsProps> = ({
  ageGroupConfig,
  formValues,
  isFormValid,
  onLessonGenerated,
  onConfigurationSaved
}) => {
  const { t } = useTranslation(['generation', 'common']);
  const theme = useTheme();
  
  const {
    generateLesson,
    saveConfiguration,
    isGenerating,
    isSaving,
    error
  } = useGenerationActions();

  // === SOLID: SRP - Handle lesson generation ===
  const handleGenerateLesson = useCallback(async () => {
    if (!isFormValid) {
      return;
    }

    try {
      console.log('🎯 COMPONENT: Starting lesson generation');
      
      const lesson = await generateLesson({
        ageGroupConfig,
        formValues,
        metadata: {
          title: formValues.title as string || `Урок для ${ageGroupConfig.name}`,
          description: formValues.description as string,
          generateSlides: true,
          slideCount: parseInt(formValues.slideCount as string) || 4
        }
      });

      console.log('✅ COMPONENT: Lesson generated successfully');
      onLessonGenerated?.(lesson);
      
    } catch (error) {
      console.error('❌ COMPONENT: Error generating lesson:', error);
    }
  }, [
    ageGroupConfig, 
    formValues, 
    isFormValid, 
    generateLesson, 
    onLessonGenerated
  ]);

  // === SOLID: SRP - Handle configuration saving ===
  const handleSaveConfiguration = useCallback(async () => {
    if (!isFormValid) {
      return;
    }

    try {
      console.log('💾 COMPONENT: Saving configuration');
      
      const configName = `Конфігурація ${ageGroupConfig.name} - ${new Date().toLocaleDateString('uk-UA')}`;
      
      const config = await saveConfiguration({
        name: configName,
        ageGroupId: ageGroupConfig.id,
        formValues,
        description: `Конфігурація для вікової групи ${ageGroupConfig.name}`,
        isTemplate: false
      });

      console.log('✅ COMPONENT: Configuration saved successfully');
      onConfigurationSaved?.(config);
      
    } catch (error) {
      console.error('❌ COMPONENT: Error saving configuration:', error);
    }
  }, [
    ageGroupConfig, 
    formValues, 
    isFormValid, 
    saveConfiguration, 
    onConfigurationSaved
  ]);

  // === SOLID: SRP - Render loading indicator ===
  const renderProgressIndicator = () => {
    if (!isGenerating && !isSaving) return null;

    return (
      <Box className="progress-section">
        <LinearProgress 
          variant="indeterminate"
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
        />
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mt: 1, textAlign: 'center' }}
        >
          {isGenerating ? 
            t('generation:generating', 'Генерація уроку...') : 
            t('generation:saving', 'Збереження конфігурації...')
          }
        </Typography>
      </Box>
    );
  };

  return (
    <ActionsContainer>
      {/* Header */}
      <Box className="actions-header">
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1
          }}
        >
          <Sparkles size={20} color={theme.palette.primary.main} />
          {t('generation:actions.title', 'Дії')}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={ageGroupConfig.name}
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 500,
            }}
          />
          
          <Chip
            label={isFormValid ? 
              t('common:valid', 'Валідна') : 
              t('common:invalid', 'Невалідна')
            }
            size="small"
            icon={isFormValid ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            sx={{
              backgroundColor: alpha(
                isFormValid ? theme.palette.success.main : theme.palette.error.main, 
                0.1
              ),
              color: isFormValid ? theme.palette.success.main : theme.palette.error.main,
              fontWeight: 500,
            }}
          />
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          icon={<AlertCircle size={20} />}
        >
          {error}
        </Alert>
      )}

      {/* Action Buttons */}
      <Box className="actions-buttons">
        <ActionButton
          variant="contained"
          className="primary"
          onClick={handleGenerateLesson}
          disabled={!isFormValid || isGenerating || isSaving}
          startIcon={
            isGenerating ? 
              <Loader2 size={18} className="animate-spin" /> : 
              <Sparkles size={18} />
          }
          fullWidth
        >
          {isGenerating ? 
            t('generation:generating', 'Генерація...') :
            t('generation:actions.generateLesson', 'Генерувати урок')
          }
        </ActionButton>

        <ButtonGroup 
          variant="outlined" 
          sx={{ display: 'flex', gap: 1 }}
        >
          <ActionButton
            variant="outlined"
            className="secondary"
            onClick={handleSaveConfiguration}
            disabled={!isFormValid || isGenerating || isSaving}
            startIcon={
              isSaving ? 
                <Loader2 size={18} className="animate-spin" /> : 
                <Save size={18} />
            }
            sx={{ flex: 1 }}
          >
            {isSaving ? 
              t('generation:saving', 'Збереження...') :
              t('generation:actions.saveConfig', 'Зберегти конфігурацію')
            }
          </ActionButton>

          <ActionButton
            variant="outlined"
            disabled={!isFormValid || isGenerating || isSaving}
            startIcon={<Download size={18} />}
            sx={{ 
              minWidth: 'auto',
              px: 2,
              borderLeft: 'none',
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.main,
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
              
              '&:hover': {
                backgroundColor: alpha(theme.palette.info.main, 0.15),
              },
            }}
            onClick={() => {
              // TODO: Implement export functionality
              console.log('Export functionality coming soon!');
            }}
          >
            {t('generation:actions.export', 'Експорт')}
          </ActionButton>
        </ButtonGroup>
      </Box>

      {/* Progress Indicator */}
      {renderProgressIndicator()}
      
      {/* Additional Info */}
      {isFormValid && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mt: 2, 
            fontStyle: 'italic',
            textAlign: 'center'
          }}
        >
          {t('generation:actions.readyToGenerate', 
            'Форма заповнена правильно. Можна розпочинати генерацію!'
          )}
        </Typography>
      )}
    </ActionsContainer>
  );
};

export default GenerationActions; 