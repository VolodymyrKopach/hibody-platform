'use client';

import { useState } from 'react';
import { Button, TextField, Box, Card, CardContent, Typography, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { generateImage, createEducationalImagePrompt } from '@/utils/imageGeneration';

interface ImageGeneratorProps {
  onImageGenerated?: (imageData: string, prompt: string) => void;
  initialTopic?: string;
  initialAgeGroup?: string;
  mode?: 'standalone' | 'embedded';
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  onImageGenerated,
  initialTopic = '',
  initialAgeGroup = '6-12',
  mode = 'standalone'
}) => {
  const { t } = useTranslation(['lessons', 'common']);
  
  const [topic, setTopic] = useState(initialTopic);
  const [ageGroup, setAgeGroup] = useState(initialAgeGroup);
  const [style, setStyle] = useState<'cartoon' | 'realistic' | 'illustration'>('cartoon');
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [usedPrompt, setUsedPrompt] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleGenerate = async () => {
    if (!topic && !customPrompt) {
      setError(t('lessons:generator.errors.enterTopic'));
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const prompt = useCustomPrompt 
        ? customPrompt 
        : createEducationalImagePrompt(topic, ageGroup, style);

      const result = await generateImage({
        prompt: prompt,
        width: 1024,
        height: 768
      });

      if (result.success && result.image) {
        setGeneratedImage(result.image);
        setUsedPrompt(result.prompt || prompt);
        if (onImageGenerated) {
          onImageGenerated(result.image, result.prompt || prompt);
        }
      } else {
        setError(result.error || t('lessons:generator.errors.generateFailed'));
      }
    } catch (err) {
      setError(t('lessons:generator.errors.generationError'));
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSlideImageGenerate = async () => {
    if (!topic) {
      setError(t('lessons:generator.errors.enterTopicForSlide'));
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/images/slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          ageGroup: ageGroup,
          style: style,
          imageType: 'illustration'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.image) {
          setGeneratedImage(result.image);
          setUsedPrompt(result.prompt);
          if (onImageGenerated) {
            onImageGenerated(result.image, result.prompt);
          }
        } else {
          setError(result.error || t('lessons:generator.errors.generateFailed'));
        }
      } else {
        setError(t('lessons:generator.errors.serverError'));
      }
    } catch (err) {
      setError(t('lessons:generator.errors.generationError'));
      console.error('Slide generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestedTopics = t('lessons:suggestedTopics', { returnObjects: true }) as string[];

  return (
    <Box sx={{ maxWidth: mode === 'embedded' ? '100%' : 800, mx: 'auto', p: 2 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {t('lessons:generator.title')}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {t('lessons:generator.description')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Topic */}
            <TextField
              label={t('lessons:generator.topicLabel')}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t('common:placeholders.topicExample')}
              fullWidth
              disabled={useCustomPrompt}
            />

            {/* Quick topics */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('lessons:generator.quickTopics')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestedTopics.map((suggestedTopic) => (
                  <Chip
                    key={suggestedTopic}
                    label={suggestedTopic}
                    onClick={() => setTopic(suggestedTopic)}
                    variant="outlined"
                    size="small"
                    disabled={useCustomPrompt}
                  />
                ))}
              </Box>
            </Box>

            {/* Settings */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>{t('lessons:generator.ageLabel')}</InputLabel>
                <Select
                  value={ageGroup}
                  label={t('lessons:generator.ageLabel')}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  disabled={useCustomPrompt}
                >
                  <MenuItem value="3-6">{t('common:ageGroups.3-5')}</MenuItem>
                  <MenuItem value="6-12">{t('common:ageGroups.6-7')} - {t('common:ageGroups.10-11')}</MenuItem>
                  <MenuItem value="12-18">{t('common:ageGroups.12-13')} - {t('common:ageGroups.16-18')}</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>{t('lessons:generator.styleLabel')}</InputLabel>
                <Select
                  value={style}
                  label={t('lessons:generator.styleLabel')}
                  onChange={(e) => setStyle(e.target.value as any)}
                  disabled={useCustomPrompt}
                >
                  <MenuItem value="cartoon">{t('lessons:generator.styles.cartoon')}</MenuItem>
                  <MenuItem value="illustration">{t('lessons:generator.styles.illustration')}</MenuItem>
                  <MenuItem value="realistic">{t('lessons:generator.styles.realistic')}</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Custom prompt */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <input
                  type="checkbox"
                  id="custom-prompt"
                  checked={useCustomPrompt}
                  onChange={(e) => setUseCustomPrompt(e.target.checked)}
                />
                <label htmlFor="custom-prompt">
                  <Typography variant="body2">
                    {t('lessons:generator.customPrompt')}
                  </Typography>
                </label>
              </Box>
              
              {useCustomPrompt && (
                <TextField
                  label={t('lessons:generator.customPromptLabel')}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={t('common:placeholders.customPromptExample')}
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            </Box>

            {/* Generation buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleGenerate}
                disabled={isGenerating || (!topic && !customPrompt)}
                startIcon={isGenerating ? <CircularProgress size={16} /> : null}
                sx={{ flex: 1 }}
              >
                {isGenerating ? t('lessons:generator.generating') : t('lessons:generator.generateImage')}
              </Button>

              {!useCustomPrompt && (
                <Button
                  variant="outlined"
                  onClick={handleSlideImageGenerate}
                  disabled={isGenerating || !topic}
                  sx={{ flex: 1 }}
                >
                  {t('lessons:generator.forSlide')}
                </Button>
              )}
            </Box>

            {/* Result */}
            {generatedImage && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('lessons:generator.result.title')}
                </Typography>
                
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <img
                    src={`data:image/png;base64,${generatedImage}`}
                    alt={t('lessons:generator.result.altText', 'Generated educational illustration')}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: 8,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  <strong>{t('lessons:generator.result.promptUsed')}</strong> {usedPrompt}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ImageGenerator; 