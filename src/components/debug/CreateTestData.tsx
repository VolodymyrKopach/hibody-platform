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
  Paper,
  Divider
} from '@mui/material';

export const CreateTestData: React.FC = () => {
  const [message, setMessage] = useState<string>('');

  const createTestLessons = () => {
    const testLessons = [
      {
        id: 'lesson_test_1',
        title: 'Тестовий урок математики',
        description: 'Урок про основи математики для дітей',
        targetAge: '6-7',
        subject: 'математика',
        duration: 45,
        status: 'planning',
        slides: [
          {
            id: 'slide_test_1_1',
            number: 1,
            title: 'Вступ до математики',
            description: 'Знайомство з цифрами',
            type: 'welcome',
            icon: '🔢',
            status: 'ready',
            preview: 'Привіт! Сьогодні ми вивчаємо цифри!',
            _internal: {
              filename: 'slide_1.html',
              htmlContent: '<h1>Привіт! Сьогодні ми вивчаємо цифри!</h1>',
              dependencies: [],
              lastModified: new Date(),
              version: 1
            },
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'slide_test_1_2',
            number: 2,
            title: 'Цифра 1',
            description: 'Вивчаємо цифру один',
            type: 'content',
            icon: '1️⃣',
            status: 'ready',
            preview: 'Це цифра 1. Вона означає один предмет.',
            _internal: {
              filename: 'slide_2.html',
              htmlContent: '<h1>Це цифра 1</h1><p>Вона означає один предмет.</p>',
              dependencies: [],
              lastModified: new Date(),
              version: 1
            },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        _internal: {
          projectPath: '/test/lesson_1',
          files: [],
          structure: {},
          metadata: {
            lessonTitle: 'Тестовий урок математики',
            targetAge: '6-7',
            subject: 'математика',
            duration: 45,
            slidesCount: 2,
            language: 'uk',
            createdBy: 'test',
            version: '1.0'
          },
          lastSync: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'lesson_test_2',
        title: 'Урок природознавства',
        description: 'Вивчаємо тварин лісу',
        targetAge: '8-9',
        subject: 'природознавство',
        duration: 30,
        status: 'ready',
        slides: [
          {
            id: 'slide_test_2_1',
            number: 1,
            title: 'Тварини лісу',
            description: 'Знайомство з лісовими тваринами',
            type: 'welcome',
            icon: '🐻',
            status: 'ready',
            preview: 'Давайте дізнаємося про тварин, що живуть у лісі!',
            _internal: {
              filename: 'slide_1.html',
              htmlContent: '<h1>Тварини лісу</h1><p>Давайте дізнаємося про тварин, що живуть у лісі!</p>',
              dependencies: [],
              lastModified: new Date(),
              version: 1
            },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        _internal: {
          projectPath: '/test/lesson_2',
          files: [],
          structure: {},
          metadata: {
            lessonTitle: 'Урок природознавства',
            targetAge: '8-9',
            subject: 'природознавство',
            duration: 30,
            slidesCount: 1,
            language: 'uk',
            createdBy: 'test',
            version: '1.0'
          },
          lastSync: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    try {
      localStorage.setItem('lessons', JSON.stringify(testLessons));
      setMessage('✅ Тестові уроки створені в localStorage');
    } catch (error) {
      setMessage('❌ Помилка створення тестових даних: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const clearLocalStorage = () => {
    try {
      localStorage.removeItem('lessons');
      localStorage.removeItem('slides');
      localStorage.removeItem('currentLesson');
      setMessage('🗑️ localStorage очищено');
    } catch (error) {
      setMessage('❌ Помилка очищення: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const checkLocalStorage = () => {
    try {
      const lessons = localStorage.getItem('lessons');
      const slides = localStorage.getItem('slides');
      
      if (lessons) {
        const parsedLessons = JSON.parse(lessons);
        setMessage(`📊 Знайдено ${parsedLessons.length} уроків в localStorage`);
      } else {
        setMessage('📭 Немає уроків в localStorage');
      }
    } catch (error) {
      setMessage('❌ Помилка перевірки: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          🧪 Тестові дані для міграції
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Створення тестових уроків в localStorage для тестування міграції до Supabase
        </Typography>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={createTestLessons}
            color="primary"
          >
            Створити тестові уроки
          </Button>

          <Button
            variant="outlined"
            onClick={checkLocalStorage}
            color="info"
          >
            Перевірити localStorage
          </Button>

          <Button
            variant="outlined"
            onClick={clearLocalStorage}
            color="error"
          >
            Очистити localStorage
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Що буде створено:
        </Typography>

        <Typography variant="body2" component="div" sx={{ mb: 2 }}>
          • 2 тестових уроки<br />
          • 3 тестових слайди<br />
          • Правильна структура даних для міграції
        </Typography>

        {message && (
          <Alert severity={message.includes('❌') ? 'error' : message.includes('⚠️') ? 'warning' : 'success'}>
            {message}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default CreateTestData; 