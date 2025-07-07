'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Stack,
  TextField,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';

interface TestSlideData {
  title: string;
  description: string;
  type: 'welcome' | 'content' | 'activity' | 'game' | 'summary';
  icon: string;
}

export const SlideTestComponent: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [testLessonId, setTestLessonId] = useState<string>('');
  const [slideData, setSlideData] = useState<TestSlideData>({
    title: 'Тестовий слайд',
    description: 'Опис тестового слайду',
    type: 'content',
    icon: '📄'
  });

  const createTestLesson = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Тестовий урок для слайдів',
          description: 'Урок створений для тестування збереження слайдів',
          subject: 'тестування',
          ageGroup: '6-7',
          duration: 30,
          slides: [] // Без базових слайдів
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setTestLessonId(result.lesson.id);
        setMessage(`✅ Тестовий урок створено! ID: ${result.lesson.id}`);
      } else {
        setMessage(`❌ Помилка створення уроку: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating test lesson:', error);
      setMessage(`❌ Помилка: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestSlide = async () => {
    if (!testLessonId) {
      setMessage('❌ Спочатку створіть тестовий урок');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/lessons/${testLessonId}/slides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slide: slideData,
          generateContent: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ Слайд створено! ID: ${result.slide.id}, Файл: ${result.htmlFile}`);
      } else {
        setMessage(`❌ Помилка створення слайду: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating test slide:', error);
      setMessage(`❌ Помилка: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getSlides = async () => {
    if (!testLessonId) {
      setMessage('❌ Спочатку створіть тестовий урок');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/lessons/${testLessonId}/slides`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ Знайдено ${result.slides.length} слайдів:\n${result.slides.map((s: any) => `- ${s.title} (${s.type})`).join('\n')}`);
      } else {
        setMessage(`❌ Помилка отримання слайдів: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error getting slides:', error);
      setMessage(`❌ Помилка: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearTestData = () => {
    setTestLessonId('');
    setMessage('🗑️ Тестові дані очищено');
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          🧪 Тестування збереження слайдів в БД
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Перевірка роботи API для створення та отримання слайдів з Supabase
        </Typography>

        <Stack spacing={3}>
          {/* Створення тестового уроку */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                1. Створення тестового уроку
              </Typography>
              <Button
                variant="contained"
                onClick={createTestLesson}
                disabled={loading}
                color="primary"
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Створити тестовий урок'}
              </Button>
              {testLessonId && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  ID уроку: {testLessonId}
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Налаштування даних слайду */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                2. Налаштування тестового слайду
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Назва слайду"
                  value={slideData.title}
                  onChange={(e) => setSlideData({...slideData, title: e.target.value})}
                  fullWidth
                />
                <TextField
                  label="Опис слайду"
                  value={slideData.description}
                  onChange={(e) => setSlideData({...slideData, description: e.target.value})}
                  fullWidth
                  multiline
                  rows={2}
                />
                <TextField
                  label="Тип слайду"
                  value={slideData.type}
                  onChange={(e) => setSlideData({...slideData, type: e.target.value as any})}
                  select
                  SelectProps={{ native: true }}
                  fullWidth
                >
                  <option value="welcome">Вітання</option>
                  <option value="content">Контент</option>
                  <option value="activity">Активність</option>
                  <option value="game">Гра</option>
                  <option value="summary">Підсумок</option>
                </TextField>
                <TextField
                  label="Іконка"
                  value={slideData.icon}
                  onChange={(e) => setSlideData({...slideData, icon: e.target.value})}
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Дії з слайдами */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                3. Операції зі слайдами
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  onClick={createTestSlide}
                  disabled={loading || !testLessonId}
                  color="success"
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Створити слайд'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={getSlides}
                  disabled={loading || !testLessonId}
                  color="info"
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Отримати слайди'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={clearTestData}
                  color="warning"
                  fullWidth
                >
                  Очистити тестові дані
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Результати */}
          {message && (
            <Alert 
              severity={message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'info'}
              sx={{ whiteSpace: 'pre-line' }}
            >
              {message}
            </Alert>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default SlideTestComponent; 