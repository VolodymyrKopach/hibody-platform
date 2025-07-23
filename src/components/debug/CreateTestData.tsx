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
        title: 'Test Math Lesson',
        description: 'Lesson about the basics of mathematics for children',
        targetAge: '6-7',
        subject: 'mathematics',
        duration: 45,
        status: 'planning',
        slides: [
          {
            id: 'slide_test_1_1',
            number: 1,
            title: 'Introduction to Mathematics',
            description: 'Introduction to numbers',
            type: 'welcome',
            icon: '🔢',
            status: 'ready',
            preview: 'Hello! Today we are learning numbers!',
            _internal: {
              filename: 'slide_1.html',
              htmlContent: '<h1>Hello! Today we are learning numbers!</h1>',
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
            title: 'Number 1',
            description: 'Learning the number one',
            type: 'content',
            icon: '1️⃣',
            status: 'ready',
            preview: 'This is the number 1. It means one item.',
            _internal: {
              filename: 'slide_2.html',
              htmlContent: '<h1>This is the number 1</h1><p>It means one item.</p>',
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
            lessonTitle: 'Test Math Lesson',
            targetAge: '6-7',
            subject: 'mathematics',
            duration: 45,
            slidesCount: 2,
            language: 'en',
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
        title: 'Nature Study Lesson',
        description: 'Learning forest animals',
        targetAge: '8-9',
        subject: 'nature study',
        duration: 30,
        status: 'ready',
        slides: [
          {
            id: 'slide_test_2_1',
            number: 1,
            title: 'Forest Animals',
            description: 'Introduction to forest animals',
            type: 'welcome',
            icon: '🐻',
            status: 'ready',
            preview: 'Let\'s learn about animals that live in the forest!',
            _internal: {
              filename: 'slide_1.html',
              htmlContent: '<h1>Forest Animals</h1><p>Let\'s learn about animals that live in the forest!</p>',
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
            lessonTitle: 'Nature Study Lesson',
            targetAge: '8-9',
            subject: 'nature study',
            duration: 30,
            slidesCount: 1,
            language: 'en',
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
      setMessage('✅ Test lessons created in localStorage');
    } catch (error) {
      setMessage('❌ Error creating test data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const clearLocalStorage = () => {
    try {
      localStorage.removeItem('lessons');
      localStorage.removeItem('slides');
      localStorage.removeItem('currentLesson');
      setMessage('🗑️ localStorage cleared');
    } catch (error) {
      setMessage('❌ Error clearing: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const checkLocalStorage = () => {
    try {
      const lessons = localStorage.getItem('lessons');
      const slides = localStorage.getItem('slides');
      
      if (lessons) {
        const parsedLessons = JSON.parse(lessons);
        setMessage(`📊 Found ${parsedLessons.length} lessons in localStorage`);
      } else {
        setMessage('📭 No lessons found in localStorage');
      }
    } catch (error) {
      setMessage('❌ Error checking: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          🧪 Test Data for Migration
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Creating test lessons in localStorage for testing migration to Supabase
        </Typography>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={createTestLessons}
            color="primary"
          >
            Create Test Lessons
          </Button>

          <Button
            variant="outlined"
            onClick={checkLocalStorage}
            color="info"
          >
            Check localStorage
          </Button>

          <Button
            variant="outlined"
            onClick={clearLocalStorage}
            color="error"
          >
            Clear localStorage
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          What will be created:
        </Typography>

        <Typography variant="body2" component="div" sx={{ mb: 2 }}>
          • 2 test lessons<br />
          • 3 test slides<br />
          • Correct data structure for migration
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