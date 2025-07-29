'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tabs,
  Tab
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

// Layout
import Layout from '@/components/layout/Layout';

// Chat components for testing
import ChatMessage from '@/components/chat/ChatMessage';
import { Message } from '@/types/chat';
import { generateMessageId } from '@/utils/messageUtils';

// Loading test component
import { LoadingTest } from '@/components/debug/LoadingTest';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`test-tabpanel-${index}`}
      aria-labelledby={`test-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TestPage: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const { t: tChat } = useTranslation('chat');
  const router = useRouter();
  
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [tabValue, setTabValue] = useState(0);

  // Create test welcome message based on current language
  const createWelcomeMessage = (): Message => ({
    id: generateMessageId(),
    text: `${tChat('welcome.greeting')}\n\n🎯 ${tChat('welcome.capabilities')}\n\n🔹 ${tChat('welcome.feature1')}\n🔹 ${tChat('welcome.feature2')}\n🔹 ${tChat('welcome.feature3')}\n🔹 ${tChat('welcome.feature4')}\n\n💬 ${tChat('welcome.callToAction')}\n\n${tChat('welcome.example')}`,
    sender: 'ai',
    timestamp: new Date(),
    status: 'sent'
  });

  const [testMessage, setTestMessage] = useState<Message>(createWelcomeMessage());

  const handleLanguageChange = async (event: SelectChangeEvent<string>) => {
    const newLanguage = event.target.value;
    setCurrentLanguage(newLanguage);
    await i18n.changeLanguage(newLanguage);
    
    // Update the test message with new language
    setTimeout(() => {
      setTestMessage(createWelcomeMessage());
    }, 100);
  };

  const errorMessage: Message = {
    id: generateMessageId(),
    text: tChat('actions.errorGeneral'),
    sender: 'ai',
    timestamp: new Date(),
    status: 'sent'
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Layout 
      title={t('pages.testTitle')} 
      breadcrumbs={[
        { label: t('navigation.home'), href: '/' }, 
        { label: t('pages.testTitle') }
      ]}
    >
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            🧪 Test Suite
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            This page contains various tests for different components and features.
          </Typography>

          {/* Tab Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="test tabs">
              <Tab label="💬 Chat Localization" />
              <Tab label="⏳ Loading Components" />
            </Tabs>
          </Box>

          {/* Chat Localization Tab */}
          <TabPanel value={tabValue} index={0}>
            {/* Language Selector */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Language Settings
              </Typography>
              <FormControl sx={{ minWidth: 200 }}>
                <Select
                  value={currentLanguage}
                  onChange={handleLanguageChange}
                  displayEmpty
                >
                  <MenuItem value="uk">🇺🇦 Українська</MenuItem>
                  <MenuItem value="en">🇬🇧 English</MenuItem>
                </Select>
              </FormControl>
            </Paper>

            {/* Chat Messages Test */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Welcome Message Test
              </Typography>
              <Box sx={{ 
                maxWidth: '800px',
                mx: 'auto',
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 2
              }}>
                <ChatMessage
                  message={testMessage}
                  onLessonCreate={() => console.log('Lesson create clicked')}
                  onActionClick={() => console.log('Action clicked')}
                />
              </Box>
            </Paper>

            {/* Error Message Test */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Error Message Test
              </Typography>
              <Box sx={{ 
                maxWidth: '800px',
                mx: 'auto',
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 2
              }}>
                <ChatMessage
                  message={errorMessage}
                  onLessonCreate={() => console.log('Lesson create clicked')}
                  onActionClick={() => console.log('Action clicked')}
                />
              </Box>
            </Paper>

            {/* Test with HTML content */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                HTML Content Message Test
              </Typography>
              <Box sx={{ 
                maxWidth: '800px',
                mx: 'auto',
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 2
              }}>
                <ChatMessage
                  message={{
                    id: generateMessageId(),
                    text: `Here's your lesson slide:\n\n\`\`\`html\n<div>Sample slide content</div>\n\`\`\``,
                    sender: 'ai',
                    timestamp: new Date(),
                    status: 'sent'
                  }}
                  onLessonCreate={() => console.log('Lesson create clicked')}
                  onActionClick={() => console.log('Action clicked')}
                />
              </Box>
            </Paper>
          </TabPanel>

          {/* Loading Components Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h5" gutterBottom>
              ⏳ Loading Components Test
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Test the new TypeScript logo loading screen and other loading components.
            </Typography>
            <LoadingTest />
          </TabPanel>

          {/* Navigation */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              onClick={() => router.push('/chat')}
            >
              Go to Chat
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => router.push('/')}
            >
              Go Home
            </Button>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default TestPage; 