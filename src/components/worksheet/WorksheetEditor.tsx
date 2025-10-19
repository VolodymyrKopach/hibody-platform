'use client';

import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  CircularProgress, 
  Stack, 
  Typography, 
  alpha, 
  useTheme, 
  Alert, 
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
  Backdrop,
} from '@mui/material';
import { X, Sparkles } from 'lucide-react';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';
import Step1WorksheetParameters from './Step1WorksheetParameters';
import Step3CanvasEditor from './Step3CanvasEditor';
import { ParsedWorksheet } from '@/types/worksheet-generation';
import { WorksheetImageGenerationService, ImageGenerationProgress } from '@/services/worksheet/WorksheetImageGenerationService';
import { ProgressSimulator } from '@/utils/progressSimulation';

const WorksheetEditor: React.FC = () => {
  const theme = useTheme();
  const [showGenerateDialog, setShowGenerateDialog] = useState(true); // Open on mount
  const [isGenerating, setIsGenerating] = useState(false);
  const [parameters, setParameters] = useState<any>(null);
  const [generatedWorksheet, setGeneratedWorksheet] = useState<ParsedWorksheet | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [imageProgress, setImageProgress] = useState<ImageGenerationProgress | null>(null);
  const [generationStage, setGenerationStage] = useState<'content' | 'images'>('content');
  const [contentProgress, setContentProgress] = useState(0);
  const progressSimulatorRef = React.useRef<ProgressSimulator | null>(null);

  const handleGenerateWorksheet = async (params: any) => {
    console.log('🚀 Generating worksheet with params:', params);
    setParameters(params);
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationStage('content');
    setImageProgress(null);
    setContentProgress(0);

    // Start progress simulation
    progressSimulatorRef.current = new ProgressSimulator({
      startProgress: 0,
      targetProgress: 90,
      duration: 35000, // 35 seconds (slower by 40%)
      updateInterval: 500, // Update every 0.5s
      onUpdate: (progress) => {
        setContentProgress(progress);
      },
    });
    progressSimulatorRef.current.start();

    try {
      // Map parameters to API request format
      const requestBody = {
        topic: params.topic,
        ageGroup: params.level, // Convert level to ageGroup format
        learningObjectives: params.learningObjectives,
        difficulty: getDifficultyFromLevel(params.level),
        language: params.language || 'en',
        duration: params.duration || 'standard', // Duration affects content amount, not page count
        includeImages: params.includeImages !== false,
        additionalInstructions: params.additionalNotes || '',
        contentMode: params.contentMode,
      };

      console.log('📡 Sending request to API:', requestBody);

      // STAGE 1: Generate content via backend
      const response = await fetch('/api/worksheet/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate worksheet');
      }

      console.log('✅ Content generated successfully');
      
      // Complete progress animation (jump to 90% then 100%)
      if (progressSimulatorRef.current) {
        await progressSimulatorRef.current.complete();
      }
      
      let finalWorksheet = data.data.worksheet;

      // STAGE 2: Generate images via secure API (if includeImages)
      if (params.includeImages !== false) {
        setGenerationStage('images');
        console.log('🎨 Starting server-side image generation...');

        const imageService = new WorksheetImageGenerationService();

        const result = await imageService.generateImagesForWorksheet(
          finalWorksheet,
          (progress) => {
            setImageProgress(progress);
            console.log(`📊 Image progress: ${progress.completed}/${progress.total}`);
          }
        );

        if (!result.success) {
          console.warn('⚠️ Some images failed to generate:', result.errors);
        }

        finalWorksheet = result.worksheet;
        console.log(`✅ Image generation completed: ${result.stats.generated}/${result.stats.totalImages}`);
      }

      console.log('📝 Setting generated worksheet:', finalWorksheet);
      setGeneratedWorksheet(finalWorksheet);
      setIsGenerating(false);
      setShowGenerateDialog(false); // Close dialog after generation
      console.log('✅ Worksheet generation completed successfully');
    } catch (error) {
      console.error('❌ Worksheet generation failed:', error);
      setGenerationError(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsGenerating(false);
      
      // Stop progress simulation on error
      if (progressSimulatorRef.current) {
        progressSimulatorRef.current.stop();
      }
    }
  };

  const handleSkipGeneration = () => {
    setShowGenerateDialog(false);
  };

  const handleOpenGenerateDialog = () => {
    setShowGenerateDialog(true);
    setGenerationError(null);
  };

  // Cleanup simulator on unmount
  React.useEffect(() => {
    return () => {
      if (progressSimulatorRef.current) {
        progressSimulatorRef.current.stop();
      }
    };
  }, []);

  // Helper: Convert level to difficulty
  const getDifficultyFromLevel = (level: string): 'easy' | 'medium' | 'hard' => {
    if (level === 'beginner' || level === 'elementary') return 'easy';
    if (level === 'advanced' || level === 'upper-intermediate') return 'hard';
    return 'medium';
  };

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Canvas Editor - Always Visible */}
      <Step3CanvasEditor
        generatedWorksheet={generatedWorksheet}
        parameters={parameters}
        onOpenGenerateDialog={handleOpenGenerateDialog}
      />

      {/* Generate Dialog */}
      <Dialog
        open={showGenerateDialog}
        onClose={isGenerating ? undefined : handleSkipGeneration}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={isGenerating}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{ pb: 2, pt: 3, px: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={20} color="white" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  AI Worksheet Generator
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Let AI create your worksheet or build it manually
                </Typography>
              </Box>
            </Stack>
            {!isGenerating && (
              <IconButton 
                onClick={handleSkipGeneration}
                size="small"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { background: alpha(theme.palette.error.main, 0.1) }
                }}
              >
                <X size={20} />
              </IconButton>
            )}
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 3 }}>
          {isGenerating ? (
            // Loading State
            <Box sx={{ py: 6 }}>
              <Stack spacing={3} alignItems="center">
                {generationStage === 'content' ? (
                  <Box sx={{ width: '100%', textAlign: 'center' }}>
                    <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      ✨ AI is Creating Your Worksheet
                    </Typography>
                    <Box 
                      sx={{ 
                        mb: 3,
                        maxHeight: '240px', // ~10 lines at 24px line height
                        overflowY: 'auto',
                        px: 2,
                        py: 1,
                        backgroundColor: alpha(theme.palette.grey[100], 0.5),
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        textAlign: 'left',
                        '& .chat-message': {
                          fontSize: '0.875rem',
                          '& p': {
                            margin: '4px 0',
                            fontSize: '0.875rem',
                            lineHeight: 1.5,
                          },
                          '& strong': {
                            fontWeight: 600,
                            fontSize: '0.875rem',
                          },
                          '& ul, & ol': {
                            margin: '4px 0',
                            paddingLeft: '20px',
                            fontSize: '0.875rem',
                          },
                          '& li': {
                            margin: '2px 0',
                            fontSize: '0.875rem',
                          },
                        },
                      }}
                    >
                      <MarkdownRenderer content={parameters?.topic || ''} />
                    </Box>
                    
                    {/* Progress Bar */}
                    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mb: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={contentProgress}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                          },
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 1 }}>
                      {contentProgress}%
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary">
                      {contentProgress < 30 && '🎯 Analyzing your topic...'}
                      {contentProgress >= 30 && contentProgress < 60 && '📝 Generating content structure...'}
                      {contentProgress >= 60 && contentProgress < 90 && '✍️ Creating exercises and activities...'}
                      {contentProgress >= 90 && '✨ Finalizing your worksheet...'}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', width: '100%' }}>
                    <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      🎨 Generating Images
                    </Typography>
                    {imageProgress && (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {imageProgress.current || 'Preparing...'}
                        </Typography>
                        <Box sx={{ width: '100%', mb: 1, maxWidth: 400, mx: 'auto' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={(imageProgress.completed / imageProgress.total) * 100}
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`,
                              },
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {imageProgress.completed} / {imageProgress.total} images generated
                        </Typography>
                        {imageProgress.errors.length > 0 && (
                          <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                            ⚠️ {imageProgress.errors.length} image(s) failed
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>
                )}
              </Stack>
            </Box>
          ) : (
            // Parameters Form
            <Box>
              {generationError && (
                <Alert 
                  severity="error" 
                  onClose={() => setGenerationError(null)}
                  sx={{ mb: 3, borderRadius: 2 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Generation Failed
                  </Typography>
                  <Typography variant="caption">{generationError}</Typography>
                </Alert>
              )}
              <Step1WorksheetParameters 
                onGenerate={handleGenerateWorksheet}
                onSkip={handleSkipGeneration}
                inDialog={true}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default WorksheetEditor;
