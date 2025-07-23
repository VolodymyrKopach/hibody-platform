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
  
  // Test slide parameters
  const [slideData, setSlideData] = useState({
    title: 'Test Slide',
    description: 'Description of the test slide',
    type: 'content' as 'welcome' | 'content' | 'activity' | 'game' | 'summary',
    htmlContent: `
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; height: 100%; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="font-size: 3em; margin-bottom: 20px;">🚀 Test Slide</h1>
        <p style="font-size: 1.5em; opacity: 0.9;">This is a test slide to check saving to the database</p>
        <div style="margin-top: 30px;">
          <span style="background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 25px; font-size: 1.2em;">
            ✅ Successfully saved!
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
          title: 'Test Lesson for Slides',
          description: 'Automatically created lesson for testing slide API',
          subject: 'Testing',
          ageGroup: '10-11',
          duration: 15
        })
      });

      const data = await response.json();
      
      if (data.success && data.lesson) {
        setTestLessonId(data.lesson.id);
        setMessage('✅ Test lesson created successfully!');
      } else {
        setMessage(`❌ Error: ${data.error?.message || 'Failed to create lesson'}`);
      }
    } catch (error) {
      console.error('Error creating test lesson:', error);
      setMessage('❌ API connection error');
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
        setMessage('✅ Slide created successfully!');
        // Automatically retrieve updated list
        getSlides();
      } else {
        setMessage(`❌ Slide creation error: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating slide:', error);
      setMessage('❌ API connection error');
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
        setMessage(`✅ Retrieved ${data.slides?.length || 0} slides`);
      } else {
        setMessage(`❌ Error retrieving slides: ${data.error?.message || 'Unknown error'}`);
        setResults([]);
      }
    } catch (error) {
      console.error('Error getting slides:', error);
      setMessage('❌ API connection error');
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
        setMessage(`❌ Deletion error: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting test data:', error);
      setMessage('❌ API connection error');
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
        {/* Title */}
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

        {/* Message */}
        {message && (
          <Alert 
            severity={message.includes('❌') ? 'error' : 'success'} 
            sx={{ mb: 3, borderRadius: '12px' }}
          >
            {message}
          </Alert>
        )}

        {/* Current State Information */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', bgcolor: alpha(theme.palette.info.main, 0.05) }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Database size={20} color={theme.palette.info.main} />
            <Box>
              <Typography variant="body2" color="info.main" sx={{ fontWeight: 500 }}>
                {t('debug:common.lessonId')} {testLessonId || 'Not Created'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Slides found: {results.length}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Stack spacing={3}>
          {/* Section 1: Create Test Lesson */}
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

          {/* Section 2: Configure Test Slide */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              {t('debug:slideTest.sections.slideSettings')}
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Slide Title"
                value={slideData.title}
                onChange={(e) => setSlideData(prev => ({ ...prev, title: e.target.value }))}
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
              
              <TextField
                label="Description"
                value={slideData.description}
                onChange={(e) => setSlideData(prev => ({ ...prev, description: e.target.value }))}
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
              
              <FormControl size="small">
                <InputLabel>Slide Type</InputLabel>
                <Select
                  value={slideData.type}
                  label="Slide Type"
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

          {/* Section 3: Slide Operations */}
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

          {/* Results */}
          {results.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Results ({results.length} slides):
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
                          ID: {slide.id} • Type: {slide.type}
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