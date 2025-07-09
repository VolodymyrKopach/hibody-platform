'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Database, TestTube, Trash2, Plus, Eye } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from 'react-i18next';

const SlideTestComponent: React.FC = () => {
  const { t } = useTranslation(['debug', 'common']);
  const theme = useTheme();
  const { user } = useAuth();
  
  const [testLessonId, setTestLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  
  // Параметри тестового слайду
  const [slideData, setSlideData] = useState({
    title: 'Тестовий слайд',
    description: 'Опис тестового слайду',
    type: 'content' as 'welcome' | 'content' | 'activity' | 'game' | 'summary',
    htmlContent: `
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; height: 100%; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="font-size: 3em; margin-bottom: 20px;">🚀 Тестовий Слайд</h1>
        <p style="font-size: 1.5em; opacity: 0.9;">Це тестовий слайд для перевірки збереження в базі даних</p>
        <div style="margin-top: 30px;">
          <span style="background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 25px; font-size: 1.2em;">
            ✅ Успішно збережено!
          </span>
        </div>
      </div>
    `
  });

  const createTestLesson = async () => {
    if (!user) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Тестовий урок для слайдів',
          description: 'Автоматично створений урок для тестування API слайдів',
          subject: 'Тестування',
          ageGroup: '10-11',
          duration: 15
        })
      });

      const data = await response.json();
      
      if (data.success && data.lesson) {
        setTestLessonId(data.lesson.id);
        setMessage('✅ Тестовий урок створено успішно!');
      } else {
        setMessage(`❌ Помилка: ${data.error?.message || 'Не вдалося створити урок'}`);
      }
    } catch (error) {
      console.error('Error creating test lesson:', error);
      setMessage('❌ Помилка підключення до API');
    } finally {
      setLoading(false);
    }
  };

  const createSlide = async () => {
    if (!testLessonId) {
      setMessage(t('debug:slideTest.messages.createTestLessonFirst'));
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/lessons/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: testLessonId,
          ...slideData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Слайд створено успішно!');
        // Автоматично отримуємо оновлений список
        getSlides();
      } else {
        setMessage(`❌ Помилка створення слайду: ${data.error?.message || 'Невідома помилка'}`);
      }
    } catch (error) {
      console.error('Error creating slide:', error);
      setMessage('❌ Помилка підключення до API');
    } finally {
      setLoading(false);
    }
  };

  const getSlides = async () => {
    if (!testLessonId) {
      setMessage(t('debug:slideTest.messages.createTestLessonFirst'));
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`/api/lessons/${testLessonId}/slides`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.slides || []);
        setMessage(`✅ Отримано ${data.slides?.length || 0} слайдів`);
      } else {
        setMessage(`❌ Помилка отримання слайдів: ${data.error?.message || 'Невідома помилка'}`);
        setResults([]);
      }
    } catch (error) {
      console.error('Error getting slides:', error);
      setMessage('❌ Помилка підключення до API');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearTestData = async () => {
    if (!testLessonId) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`/api/lessons/${testLessonId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setTestLessonId(null);
        setResults([]);
        setMessage(t('debug:slideTest.messages.testDataCleared'));
      } else {
        setMessage(`❌ Помилка видалення: ${data.error?.message || 'Невідома помилка'}`);
      }
    } catch (error) {
      console.error('Error deleting test data:', error);
      setMessage('❌ Помилка підключення до API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ 
      borderRadius: '16px',
      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              mr: 2,
            }}
          >
            <TestTube size={24} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {t('debug:slideTest.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('debug:slideTest.description')}
            </Typography>
          </Box>
        </Box>

        {/* Повідомлення */}
        {message && (
          <Alert 
            severity={message.includes('❌') ? 'error' : 'success'} 
            sx={{ mb: 3, borderRadius: '12px' }}
          >
            {message}
          </Alert>
        )}

        {/* Інформація про поточний стан */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', bgcolor: alpha(theme.palette.info.main, 0.05) }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Database size={20} color={theme.palette.info.main} />
            <Box>
              <Typography variant="body2" color="info.main" sx={{ fontWeight: 500 }}>
                {t('debug:common.lessonId')} {testLessonId || 'Не створено'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Слайдів знайдено: {results.length}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Stack spacing={3}>
          {/* Секція 1: Створення тестового уроку */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              {t('debug:slideTest.sections.createLesson')}
            </Typography>
            <Button
              variant="contained"
              onClick={createTestLesson}
              disabled={loading || !!testLessonId}
              startIcon={loading ? <CircularProgress size={16} /> : <Plus size={16} />}
              sx={{ borderRadius: '8px' }}
            >
              {t('debug:slideTest.createTestLesson')}
            </Button>
          </Box>

          {/* Секція 2: Налаштування тестового слайду */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              {t('debug:slideTest.sections.slideSettings')}
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Назва слайду"
                value={slideData.title}
                onChange={(e) => setSlideData(prev => ({ ...prev, title: e.target.value }))}
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
              
              <TextField
                label="Опис"
                value={slideData.description}
                onChange={(e) => setSlideData(prev => ({ ...prev, description: e.target.value }))}
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
              
              <FormControl size="small">
                <InputLabel>Тип слайду</InputLabel>
                <Select
                  value={slideData.type}
                  label="Тип слайду"
                  onChange={(e) => setSlideData(prev => ({ ...prev, type: e.target.value as any }))}
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="welcome">{t('slides:types.welcome')}</MenuItem>
                  <MenuItem value="content">{t('slides:types.content')}</MenuItem>
                  <MenuItem value="activity">{t('slides:types.activity')}</MenuItem>
                  <MenuItem value="game">{t('slides:types.game')}</MenuItem>
                  <MenuItem value="summary">{t('slides:types.summary')}</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* Секція 3: Операції зі слайдами */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              {t('debug:slideTest.sections.slideOperations')}
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="contained"
                onClick={createSlide}
                disabled={loading || !testLessonId}
                startIcon={loading ? <CircularProgress size={16} /> : <Plus size={16} />}
                sx={{ borderRadius: '8px' }}
              >
                {t('debug:slideTest.createSlide')}
              </Button>
              
              <Button
                variant="outlined"
                onClick={getSlides}
                disabled={loading || !testLessonId}
                startIcon={loading ? <CircularProgress size={16} /> : <Eye size={16} />}
                sx={{ borderRadius: '8px' }}
              >
                {t('debug:slideTest.getSlides')}
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                onClick={clearTestData}
                disabled={loading || !testLessonId}
                startIcon={loading ? <CircularProgress size={16} /> : <Trash2 size={16} />}
                sx={{ borderRadius: '8px' }}
              >
                {t('debug:slideTest.clearTestData')}
              </Button>
            </Stack>
          </Box>

          {/* Результати */}
          {results.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Результати ({results.length} слайдів):
              </Typography>
              <Stack spacing={1}>
                {results.map((slide: any, index: number) => (
                  <Paper key={slide.id} sx={{ p: 2, borderRadius: '8px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {slide.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {slide.id} • Тип: {slide.type}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`#${index + 1}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SlideTestComponent; 