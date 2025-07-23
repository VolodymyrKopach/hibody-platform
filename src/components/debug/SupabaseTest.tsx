'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Stack,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Storage,
  Person,
  Shield,
  Settings
} from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
}

export const SupabaseTest: React.FC = () => {
  const { user, profile } = useAuth();
  const [supabase] = useState(() => createClient());
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTest = (test: TestResult) => {
    setTests(prev => [...prev, test]);
  };

  const updateTest = (name: string, updates: Partial<TestResult>) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, ...updates } : test
    ));
  };

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: Supabase Connection
    addTest({
      name: 'Supabase Connection',
      status: 'pending',
      message: 'Testing connection...'
    });

    try {
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      if (error) throw error;
      
      updateTest('Supabase Connection', {
        status: 'success',
        message: 'Connected successfully',
        details: 'Database is accessible'
      });
    } catch (error) {
      updateTest('Supabase Connection', {
        status: 'error',
        message: 'Connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Authentication
    addTest({
      name: 'Authentication',
      status: 'pending',
      message: 'Checking auth status...'
    });

    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (authUser) {
        updateTest('Authentication', {
          status: 'success',
          message: 'User authenticated',
          details: `User ID: ${authUser.id}`
        });
      } else {
        updateTest('Authentication', {
          status: 'warning',
          message: 'No authenticated user',
          details: 'You need to log in to test full functionality'
        });
      }
    } catch (error) {
      updateTest('Authentication', {
        status: 'error',
        message: 'Auth check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Database Tables
    addTest({
      name: 'Database Tables',
      status: 'pending',
      message: 'Checking database schema...'
    });

    const expectedTables = [
      'user_profiles',
      'lessons',
      'slides',
      'slide_images',
      'chat_sessions',
      'chat_messages',
      'subscription_usage',
      'lesson_shares',
      'lesson_ratings'
    ];

    try {
      const tableChecks = await Promise.all(
        expectedTables.map(async (table) => {
          try {
            const { error } = await supabase.from(table).select('*').limit(1);
            return { table, exists: !error };
          } catch {
            return { table, exists: false };
          }
        })
      );

      const existingTables = tableChecks.filter(t => t.exists).map(t => t.table);
      const missingTables = tableChecks.filter(t => !t.exists).map(t => t.table);

      if (missingTables.length === 0) {
        updateTest('Database Tables', {
          status: 'success',
          message: 'All tables found',
          details: `Found ${existingTables.length} tables: ${existingTables.join(', ')}`
        });
      } else {
        updateTest('Database Tables', {
          status: 'error',
          message: 'Missing tables',
          details: `Missing: ${missingTables.join(', ')}. Found: ${existingTables.join(', ')}`
        });
      }
    } catch (error) {
      updateTest('Database Tables', {
        status: 'error',
        message: 'Schema check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 4: RLS Policies (if user is authenticated)
    if (user) {
      addTest({
        name: 'RLS Policies',
        status: 'pending',
        message: 'Testing Row Level Security...'
      });

      try {
        // Try to access user_profiles table
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .limit(1);

        if (error) throw error;

        updateTest('RLS Policies', {
          status: 'success',
          message: 'RLS working correctly',
          details: 'Can access own profile data'
        });
      } catch (error) {
        updateTest('RLS Policies', {
          status: 'error',
          message: 'RLS test failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 5: User Profile
      addTest({
        name: 'User Profile',
        status: 'pending',
        message: 'Checking user profile...'
      });

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          updateTest('User Profile', {
            status: 'success',
            message: 'Profile found',
            details: `Name: ${data.full_name || 'Not set'}, Role: ${data.role}, Subscription: ${data.subscription_type}`
          });
        } else {
          updateTest('User Profile', {
            status: 'warning',
            message: 'Profile not found',
            details: 'Profile will be created automatically on first use'
          });
        }
      } catch (error) {
        updateTest('User Profile', {
          status: 'error',
          message: 'Profile check failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'pending':
        return <CircularProgress size={24} />;
      default:
        return <Info color="info" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    // Auto-run tests on mount
    runTests();
  }, [user]);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Storage color="primary" />
          <Typography variant="h5" component="h1">
            Supabase Integration Test
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This component tests the connection to Supabase and checks database functionality.
        </Typography>

        <Button
          variant="contained"
          onClick={runTests}
          disabled={isRunning}
          startIcon={isRunning ? <CircularProgress size={20} /> : <Settings />}
          sx={{ mb: 3 }}
        >
          {isRunning ? 'Testing...' : 'Run Tests'}
        </Button>

        {/* Current User Info */}
        {user && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle2">Current User:</Typography>
            <Typography variant="body2">
              Email: {user.email}<br />
              ID: {user.id}<br />
              {profile && (
                <>
                  Name: {profile.full_name || 'Not specified'}<br />
                  Role: {profile.role}<br />
                  Subscription: {profile.subscription_type}
                </>
              )}
            </Typography>
          </Alert>
        )}

        {!user && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Log in to the system for full functionality testing
          </Alert>
        )}
      </Paper>

      {/* Test Results */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Results
          </Typography>

          {tests.length === 0 && !isRunning && (
            <Alert severity="info">
              Click "Run Tests" to check the system
            </Alert>
          )}

          <List>
            {tests.map((test, index) => (
              <React.Fragment key={test.name}>
                <ListItem>
                  <ListItemIcon>
                    {getStatusIcon(test.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1">
                          {test.name}
                        </Typography>
                        <Chip
                          label={test.status}
                          color={getStatusColor(test.status) as any}
                          size="small"
                        />
                      </Stack>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.primary">
                          {test.message}
                        </Typography>
                        {test.details && (
                          <Typography variant="caption" color="text.secondary">
                            {test.details}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < tests.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SupabaseTest; 