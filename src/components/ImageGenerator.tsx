'use client';

import { useState } from 'react';
import { Button, TextField, Box, Card, CardContent, Typography, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
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
      setError('Будь ласка, введіть тему або користувацький промпт');
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
        setError(result.error || 'Не вдалося згенерувати зображення');
      }
    } catch (err) {
      setError('Помилка при генерації зображення');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSlideImageGenerate = async () => {
    if (!topic) {
      setError('Будь ласка, введіть тему для слайду');
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
          setError(result.error || 'Не вдалося згенерувати зображення для слайду');
        }
      } else {
        setError('Помилка сервера при генерації зображення');
      }
    } catch (err) {
      setError('Помилка при генерації зображення для слайду');
      console.error('Slide generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestedTopics = [
    'Математика - додавання чисел',
    'Українська мова - алфавіт',
    'Природознавство - тварини',
    'Мистецтво - кольори',
    'Географія - країни світу',
    'Історія - стародавні часи'
  ];

  return (
    <Box sx={{ maxWidth: mode === 'embedded' ? '100%' : 800, mx: 'auto', p: 2 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            🎨 Генератор зображень FLUX.1 [schnell]
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Створюйте високоякісні освітні ілюстрації для ваших уроків за допомогою штучного інтелекту
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Тема */}
            <TextField
              label="Тема уроку"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Наприклад: Додавання чисел до 10"
              fullWidth
              disabled={useCustomPrompt}
            />

            {/* Швидкі теми */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Швидкий вибір тем:
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

            {/* Налаштування */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Вік</InputLabel>
                <Select
                  value={ageGroup}
                  label="Вік"
                  onChange={(e) => setAgeGroup(e.target.value)}
                  disabled={useCustomPrompt}
                >
                  <MenuItem value="3-6">3-6 років</MenuItem>
                  <MenuItem value="6-12">6-12 років</MenuItem>
                  <MenuItem value="12-18">12-18 років</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Стиль</InputLabel>
                <Select
                  value={style}
                  label="Стиль"
                  onChange={(e) => setStyle(e.target.value as any)}
                  disabled={useCustomPrompt}
                >
                  <MenuItem value="cartoon">Мультяшний</MenuItem>
                  <MenuItem value="illustration">Ілюстрація</MenuItem>
                  <MenuItem value="realistic">Реалістичний</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Користувацький промпт */}
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
                    Використати власний промпт
                  </Typography>
                </label>
              </Box>
              
              {useCustomPrompt && (
                <TextField
                  label="Користувацький промпт"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Опишіть зображення англійською мовою..."
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            </Box>

            {/* Кнопки генерації */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleGenerate}
                disabled={isGenerating || (!topic && !customPrompt)}
                startIcon={isGenerating ? <CircularProgress size={16} /> : null}
                sx={{ flex: 1 }}
              >
                {isGenerating ? 'Генерується...' : '🎨 Згенерувати зображення'}
              </Button>

              {!useCustomPrompt && (
                <Button
                  variant="outlined"
                  onClick={handleSlideImageGenerate}
                  disabled={isGenerating || !topic}
                  sx={{ flex: 1 }}
                >
                  📊 Для слайду
                </Button>
              )}
            </Box>

            {/* Результат */}
            {generatedImage && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Згенероване зображення:
                </Typography>
                
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <img
                    src={`data:image/png;base64,${generatedImage}`}
                    alt="Generated illustration"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: 8,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  <strong>Використаний промпт:</strong> {usedPrompt}
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