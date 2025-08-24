'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Tabs,
  Tab,
  Button,
  Alert
} from '@mui/material';
import { useRouter } from 'next/navigation';

// Layout
import Layout from '@/components/layout/Layout';

// Test components
import SnapdomTest from '@/components/debug/SnapdomTest';

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

// Error Test Component
const ErrorTestComponent: React.FC = () => {
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  const triggerError = () => {
    throw new Error('Тестова помилка для перевірки системи обробки помилок');
  };

  const triggerAsyncError = async () => {
    setShowError(true);
    setTimeout(() => {
      throw new Error('Асинхронна тестова помилка');
    }, 1000);
  };

  const goToErrorPage = () => {
    // Перехід на тестову сторінку помилки
    router.push('/error-page?test=true');
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        🧪 Тестування системи обробки помилок
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Використовуйте кнопки нижче для тестування різних типів помилок та перевірки 
        відображення контактної інформації на сторінці помилки.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Рекомендація:</strong> Спочатку скористайтеся синьою кнопкою для безпечного 
          перегляду сторінки помилки. Червоні кнопки викликають справжні помилки.
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={goToErrorPage}
          sx={{ minWidth: 200 }}
        >
          Перейти на сторінку помилки
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={triggerError}
          sx={{ minWidth: 200 }}
        >
          Викликати синхронну помилку
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={triggerAsyncError}
          disabled={showError}
          sx={{ minWidth: 200 }}
        >
          {showError ? 'Помилка через 1 сек...' : 'Викликати асинхронну помилку'}
        </Button>
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Що тестується:
        </Typography>
        <Typography variant="body2" component="div">
          • Відображення контактної інформації з іконкою 📧 (teachsparkai@gmail.com)<br/>
          • Посилання на Телеграм з іконкою 💬 (@teachsparkai)<br/>
          • Правильне форматування повідомлення про помилку<br/>
          • Функціональність кнопок "Спробувати ще раз" та "На головну"
        </Typography>
      </Box>
    </Box>
  );
};

const TestPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            🧪 Test Suite
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            This page contains various tests for different components and features.
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="test tabs">
              <Tab label="🖼️ SnapDOM Thumbnails" />
              <Tab label="❌ Error Testing" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <SnapdomTest />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <ErrorTestComponent />
          </TabPanel>
        </Box>
      </Container>
    </Layout>
  );
};

export default TestPage;
