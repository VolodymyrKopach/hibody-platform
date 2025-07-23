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
  CircularProgress,
  Paper
} from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

export const SimpleSupabaseTest: React.FC = () => {
  const { user, profile } = useAuth();
  const [supabase] = useState(() => createClient());
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      // Test 1: Basic connection
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      
      if (error) {
        setTestResult(`❌ Connection Error: ${error.message}`);
        setIsLoading(false);
        return;
      }

      setTestResult('✅ Supabase connection successful!');

      // Test 2: Check if user is authenticated
      if (user) {
        setTestResult(prev => prev + '\n✅ User authenticated: ' + user.email);

        // Test 3: Try to access user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          setTestResult(prev => prev + '\n❌ Profile Error: ' + profileError.message);
        } else if (profileData) {
          setTestResult(prev => prev + '\n✅ Profile found: ' + (profileData.full_name || 'No name'));
        } else {
          setTestResult(prev => prev + '\n⚠️ Profile not found (will be created automatically)');
        }
      } else {
        setTestResult(prev => prev + '\n⚠️ No authenticated user');
      }

    } catch (error) {
      setTestResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setIsLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          🧪 Supabase Test
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Check database connection
        </Typography>

        <Button
          variant="contained"
          onClick={runTest}
          disabled={isLoading}
          sx={{ mb: 3 }}
        >
          {isLoading ? <CircularProgress size={20} /> : 'Run Test'}
        </Button>

        {user && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>User:</strong> {user.email}
            {profile && (
              <>
                <br />
                <strong>Name:</strong> {profile.full_name || 'Not specified'}
                <br />
                <strong>Role:</strong> {profile.role}
              </>
            )}
          </Alert>
        )}

        {!user && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Log in to the system for full testing
          </Alert>
        )}

        {testResult && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Result:
              </Typography>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {testResult}
              </pre>
            </CardContent>
          </Card>
        )}
      </Paper>
    </Box>
  );
};

export default SimpleSupabaseTest; 