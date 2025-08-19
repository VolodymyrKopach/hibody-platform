'use client';

import React, { useState } from 'react';
import { Button, Box, Typography, Alert, CircularProgress } from '@mui/material';

interface TestResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  userId?: string;
  timestamp?: string;
}

export const TempStorageTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      console.log('🧪 Running temporary storage test...');
      
      const response = await fetch('/api/test/temp-storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          userId: data.userId,
          timestamp: data.timestamp
        });
        console.log('✅ Test passed:', data);
      } else {
        setResult({
          success: false,
          error: data.error,
          details: data.details
        });
        console.error('❌ Test failed:', data);
      }

    } catch (error) {
      setResult({
        success: false,
        error: 'Network or parsing error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error('💥 Test error:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        🧪 Temporary Storage Test
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This test checks if the temporary image storage bucket is working correctly.
        It will create a test image, upload it to temp storage, and then clean it up.
      </Typography>

      <Button
        variant="contained"
        onClick={runTest}
        disabled={testing}
        sx={{ mb: 2 }}
        startIcon={testing ? <CircularProgress size={20} /> : null}
      >
        {testing ? 'Testing...' : 'Run Test'}
      </Button>

      {result && (
        <Alert 
          severity={result.success ? 'success' : 'error'} 
          sx={{ mt: 2 }}
        >
          <Typography variant="subtitle2">
            {result.success ? '✅ Test Passed' : '❌ Test Failed'}
          </Typography>
          
          {result.message && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {result.message}
            </Typography>
          )}
          
          {result.error && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Error:</strong> {result.error}
            </Typography>
          )}
          
          {result.details && (
            <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }}>
              <strong>Details:</strong> {result.details}
            </Typography>
          )}
          
          {result.userId && (
            <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }}>
              <strong>User ID:</strong> {result.userId}
            </Typography>
          )}
          
          {result.timestamp && (
            <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }}>
              <strong>Timestamp:</strong> {result.timestamp}
            </Typography>
          )}
        </Alert>
      )}
    </Box>
  );
};
