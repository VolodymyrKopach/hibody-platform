import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Chip,
  Alert,
  Slide,
  Fade,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { X, Wand2, Eye, Loader2, ChevronLeft } from 'lucide-react';
import { useGenerationConstructor } from '@/hooks/useGenerationConstructor';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { AgeGroupId } from '@/types/generation';
import { FormState } from '@/types/generation';
import { AgeGroupTabs, FilterForm, PreviewModal } from '@/components/generation';
import { HistoryProvider } from '@/providers/HistoryProvider';
import { UndoRedoControls, HistoryTimeline } from '@/components/generation/history';

interface GenerationConstructorDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (formState: FormState) => void;
}

const GenerationConstructorDialog: React.FC<GenerationConstructorDialogProps> = ({
  open,
  onClose,
  onConfirm
}) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const breakpoint = useBreakpoint();
  
  // === SOLID: SRP - Використання головного хука ===
  const constructor = useGenerationConstructor();

  // === SOLID: SRP - Mobile navigation state ===
  const [mobileStep, setMobileStep] = React.useState<'select' | 'form' | 'preview'>('select');

  // === SOLID: SRP - Обробка подій ===

  const handleConfirm = async () => {
    try {
      const parameters = await constructor.generate();
      onConfirm({
        selectedAgeGroup: constructor.selectedAgeGroup,
        values: constructor.values,
        errors: constructor.errors,
        isValid: constructor.isValid,
        isDirty: constructor.isDirty,
        isSubmitting: constructor.isSubmitting
      });
      onClose();
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const handleShowPreview = () => {
    if (breakpoint.isMobile) {
      setMobileStep('preview');
    }
    constructor.preview.show();
  };

  const handleClosePreview = () => {
    if (breakpoint.isMobile) {
      setMobileStep('form');
    }
    constructor.preview.hide();
  };

  const handleReset = () => {
    constructor.resetForm();
    if (breakpoint.isMobile) {
      setMobileStep('select');
    }
  };

  // === SOLID: SRP - Mobile navigation ===
  const handleMobileNext = () => {
    if (mobileStep === 'select' && constructor.selectedAgeGroup) {
      setMobileStep('form');
    } else if (mobileStep === 'form') {
      handleShowPreview();
    }
  };

  const handleMobileBack = () => {
    if (mobileStep === 'form') {
      setMobileStep('select');
    } else if (mobileStep === 'preview') {
      setMobileStep('form');
    }
  };

  // === SOLID: SRP - Age group change with mobile navigation ===
  const handleAgeGroupChange = (ageGroup: AgeGroupId) => {
    constructor.changeAgeGroup(ageGroup);
    if (breakpoint.isMobile) {
      // Auto-advance to form on mobile after selecting age group
      setTimeout(() => setMobileStep('form'), 300);
    }
  };

  // === SOLID: SRP - Отримання поточної вікової групи ===
  const currentAgeGroup = constructor.form.getCurrentAgeGroup();

  // === SOLID: SRP - Mobile step titles ===
  const getMobileStepTitle = () => {
    switch (mobileStep) {
      case 'select':
        return t('constructor.selectAgeGroup', 'Оберіть вікову групу');
      case 'form':
        return currentAgeGroup ? `${currentAgeGroup.name} (${currentAgeGroup.ageRange})` : t('constructor.setupParameters', 'Налаштування параметрів');
      case 'preview':
        return t('constructor.preview', 'Попередній перегляд');
      default:
        return t('constructor.title', 'Конструктор генерації');
    }
  };

  // === SOLID: SRP - Can proceed to next step ===
  const canProceedNext = () => {
    if (mobileStep === 'select') {
      return !!constructor.selectedAgeGroup;
    }
    if (mobileStep === 'form') {
      return constructor.progress > 20; // At least some fields filled
    }
    return false;
  };

  return (
    <HistoryProvider
      initialFormValues={constructor.form.values}
      ageGroupId={constructor.selectedAgeGroup}
      excludeFields={['temporary', 'preview', 'debug']}
      maxHistorySize={50}
      debounceMs={300}
    >
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={breakpoint.isMobile ? false : "md"}
        fullWidth
        fullScreen={breakpoint.isMobile}
        PaperProps={{
          sx: {
            borderRadius: breakpoint.isMobile ? 0 : 3,
            boxShadow: breakpoint.isMobile ? 'none' : '0 20px 40px rgba(0,0,0,0.1)',
            maxHeight: breakpoint.isMobile ? '100vh' : '90vh',
            margin: breakpoint.isMobile ? 0 : undefined,
            width: breakpoint.isMobile ? '100vw' : undefined,
            height: breakpoint.isMobile ? '100vh' : undefined,
          }
        }}
        TransitionComponent={breakpoint.isMobile ? Slide : Fade}
      >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        position: breakpoint.isMobile ? 'sticky' : 'static',
        top: 0,
        zIndex: 1000,
        backgroundColor: theme.palette.background.paper,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {breakpoint.isMobile && mobileStep !== 'select' && (
            <IconButton onClick={handleMobileBack} size="small">
              <ChevronLeft size={20} />
            </IconButton>
          )}
          <Wand2 size={24} color={theme.palette.primary.main} />
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            fontSize: breakpoint.isMobile ? '1.125rem' : '1.25rem'
          }}>
            {breakpoint.isMobile ? getMobileStepTitle() : t('constructor.title', 'Конструктор генерації')}
          </Typography>
          {!breakpoint.isMobile && constructor.status !== 'filling' && (
            <Chip 
              label={constructor.status === 'ready' ? 'Готово' : 'Заповнюється'} 
              color={constructor.status === 'ready' ? 'success' : 'default'}
              size="small"
            />
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        py: 0,
        flex: breakpoint.isMobile ? 1 : 'initial',
        display: breakpoint.isMobile ? 'flex' : 'block',
        flexDirection: 'column',
      }}>
        {/* Прогрес заповнення */}
        {(!breakpoint.isMobile || mobileStep === 'form') && (
          <Box sx={{ px: 3, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Прогрес заповнення: {constructor.progress}%
              </Typography>
              <Box sx={{ flex: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={constructor.progress} 
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
            </Box>
            {constructor.validation.errorCount > 0 && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                {constructor.validation.errorCount} помилок потребують виправлення
              </Alert>
            )}
          </Box>
        )}

        {/* Undo/Redo Controls */}
        {(!breakpoint.isMobile || mobileStep === 'form') && (
          <Box sx={{ px: 3, py: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <UndoRedoControls
                variant={breakpoint.isMobile ? 'compact' : 'expanded'}
                showStats={!breakpoint.isMobile}
                showShortcuts={!breakpoint.isMobile}
                disabled={constructor.status === 'generating'}
              />
              
              {!breakpoint.isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleReset}
                    disabled={constructor.status === 'generating'}
                  >
                    {t('common.reset', 'Reset')}
                  </Button>
                </Box>
              )}
            </Box>
            <Divider sx={{ mt: 1 }} />
          </Box>
        )}

        {/* Mobile Step Navigation or Desktop Content */}
        {breakpoint.isMobile ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Age Group Selection Step */}
            {mobileStep === 'select' && (
              <Slide direction="right" in={mobileStep === 'select'} timeout={300}>
                <Box sx={{ px: 3, py: 2, flex: 1 }}>
                  <AgeGroupTabs
                    selectedAgeGroup={constructor.selectedAgeGroup}
                    onAgeGroupChange={handleAgeGroupChange}
                    validationErrors={constructor.validation.errors}
                    formProgress={constructor.progress}
                    showDescription={true}
                  />
                </Box>
              </Slide>
            )}

            {/* Form Step */}
            {mobileStep === 'form' && (
              <Slide direction="left" in={mobileStep === 'form'} timeout={300}>
                <Box sx={{ px: 3, py: 3, flex: 1, overflow: 'auto' }}>
                  {currentAgeGroup ? (
                    <FilterForm
                      ageGroupConfig={currentAgeGroup}
                      values={constructor.form.values}
                      errors={constructor.validation.errors}
                      onChange={(field, value) => constructor.changeFieldValue(field, value)}
                      disabled={constructor.status === 'generating'}
                      collapsed={false}
                      onToggleCollapse={(sectionId) => {
                        console.log('Toggle section:', sectionId);
                      }}
                    />
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 2,
                      p: 2,
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        Оберіть вікову групу для продовження
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Slide>
            )}
          </Box>
        ) : (
          <>
            {/* Desktop Layout */}
            {/* Табова навігація по віковим групам */}
            <Box sx={{ px: 3, py: 2 }}>
              <AgeGroupTabs
                selectedAgeGroup={constructor.selectedAgeGroup}
                onAgeGroupChange={(ageGroup) => constructor.changeAgeGroup(ageGroup)}
                validationErrors={constructor.validation.errors}
                formProgress={constructor.progress}
                showDescription={true}
              />
            </Box>

            {/* Контент форми */}
            <Box sx={{ px: 3, py: 3, minHeight: 300 }}>
              {currentAgeGroup ? (
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <FilterForm
                      ageGroupConfig={currentAgeGroup}
                      values={constructor.form.values}
                      errors={constructor.validation.errors}
                      onChange={(field, value) => constructor.changeFieldValue(field, value)}
                      disabled={constructor.status === 'generating'}
                      collapsed={false}
                      onToggleCollapse={(sectionId) => {
                        console.log('Toggle section:', sectionId);
                      }}
                    />
                  </Box>
                  
                  {/* History Timeline */}
                  <Box sx={{ width: 320, flexShrink: 0 }}>
                    <HistoryTimeline
                      maxItems={20}
                      showFilters={false}
                      showSearch={true}
                      allowJumpTo={false}
                      collapsed={false}
                    />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2,
                  p: 2,
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    Оберіть вікову групу для продовження
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}

        {/* Preview Modal */}
        <PreviewModal
          open={constructor.preview.isVisible}
          onClose={handleClosePreview}
          loading={constructor.preview.isLoading}
          data={constructor.preview.data}
          error={constructor.preview.error}
          ageGroup={currentAgeGroup || undefined}
        />
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2,
        position: breakpoint.isMobile ? 'sticky' : 'static',
        bottom: 0,
        backgroundColor: theme.palette.background.paper,
        borderTop: breakpoint.isMobile ? `1px solid ${theme.palette.divider}` : 'none',
        flexDirection: breakpoint.isMobile ? 'column' : 'row',
        gap: breakpoint.isMobile ? 1 : 0,
      }}>
        {breakpoint.isMobile ? (
          // Mobile Action Buttons
          <>
            {mobileStep === 'select' && canProceedNext() && (
              <Button 
                onClick={handleMobileNext}
                variant="contained" 
                fullWidth
                size="large"
                startIcon={<Wand2 size={16} />}
              >
                Продовжити налаштування
              </Button>
            )}
            
            {mobileStep === 'form' && (
              <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
                <Button onClick={handleReset} variant="outlined" sx={{ flex: 1 }}>
                  Скинути
                </Button>
                <Button 
                  onClick={handleShowPreview} 
                  variant="outlined" 
                  startIcon={<Eye size={16} />}
                  disabled={constructor.status === 'generating'}
                  sx={{ flex: 1 }}
                >
                  Превю
                </Button>
                <Button 
                  onClick={handleConfirm} 
                  variant="contained" 
                  startIcon={constructor.status === 'generating' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                  disabled={constructor.status !== 'ready'}
                  sx={{ flex: 2 }}
                >
                  {constructor.status === 'generating' ? 'Генерація...' : 'Згенерувати'}
                </Button>
              </Box>
            )}
          </>
        ) : (
          // Desktop Action Buttons
          <>
            <Button onClick={handleReset} variant="outlined" color="inherit">
              Скинути
            </Button>
            <Button 
              onClick={handleShowPreview} 
              variant="outlined" 
              startIcon={<Eye size={16} />}
              disabled={constructor.status === 'generating'}
            >
              Попередній перегляд
            </Button>
            <Button 
              onClick={handleConfirm} 
              variant="contained" 
              startIcon={constructor.status === 'generating' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              disabled={constructor.status !== 'ready'}
            >
              {constructor.status === 'generating' ? 'Генерація...' : 'Згенерувати'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
    </HistoryProvider>
  );
};

export default GenerationConstructorDialog; 