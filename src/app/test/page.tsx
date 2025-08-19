'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Tabs,
  Tab
} from '@mui/material';

// Layout
import Layout from '@/components/layout/Layout';

// Test components
import SnapdomTest from '@/components/debug/SnapdomTest';
import { TempStorageTest } from '@/components/debug';

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
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Layout 
      title="Test Suite" 
      breadcrumbs={[
        { label: 'Home', href: '/' }, 
        { label: 'Test Suite' }
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

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="test tabs">
              <Tab label="🖼️ SnapDOM Thumbnails" />
              <Tab label="☁️ Temp Storage" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <SnapdomTest />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <TempStorageTest />
          </TabPanel>
        </Box>
      </Container>
    </Layout>
  );
};

export default TestPage;
