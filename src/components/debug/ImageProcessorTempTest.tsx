'use client';

import React, { useState } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Alert, 
  CircularProgress, 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ImageInfo {
  total: number;
  successful: number;
  tempStored: number;
  base64Fallback: number;
  failed: number;
}

interface TempFile {
  fileName: string;
  tempUrl: string;
  prompt: string;
  dimensions: string;
}

interface PerformanceInfo {
  sizeSavings: string;
  base64Size: string;
  tempUrlSize: string;
}

interface TestResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  results?: {
    sessionId: string;
    processingTime: string;
    images: ImageInfo;
    temporaryFiles: {
      count: number;
      files: TempFile[];
    };
    performance: PerformanceInfo;
    errors: string[];
    options: {
      useTemporaryStorage: boolean;
      fallbackToBase64: boolean;
    };
  };
  processedHtml?: string;
  userId?: string;
  timestamp?: string;
}

export const ImageProcessorTempTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  
  // Test options
  const [useTemporaryStorage, setUseTemporaryStorage] = useState(true);
  const [fallbackToBase64, setFallbackToBase64] = useState(true);
  const [customHtml, setCustomHtml] = useState('');

  const runTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      console.log('🧪 Running enhanced image processor test...');
      
      const requestBody = {
        useTemporaryStorage,
        fallbackToBase64,
        ...(customHtml.trim() && { testHtml: customHtml })
      };
      
      const response = await fetch('/api/test/image-processor-temp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          results: data.results,
          processedHtml: data.processedHtml,
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

  const defaultTestHtml = `<div class="slide-content">
  <h1>Test Slide with Images</h1>
  <p>This slide tests temporary image storage.</p>
  
  <!-- IMAGE_PROMPT: "A cute cartoon cat playing with a ball of yarn" WIDTH: 400 HEIGHT: 300 -->
  
  <p>Content between images.</p>
  
  <!-- IMAGE_PROMPT: "A simple illustration of a house with a red roof" WIDTH: 320 HEIGHT: 240 -->
  
  <p>End of test slide.</p>
</div>`;

  return (
    <Box sx={{ p: 3, maxWidth: 1000 }}>
      <Typography variant="h6" gutterBottom>
        🖼️ Enhanced Image Processor Test
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        This test verifies the enhanced image processor with temporary storage support.
        It will generate images, upload them to temporary storage, and measure performance improvements.
      </Typography>

      {/* Test Options */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Test Options
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useTemporaryStorage}
                    onChange={(e) => setUseTemporaryStorage(e.target.checked)}
                  />
                }
                label="Use Temporary Storage"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={fallbackToBase64}
                    onChange={(e) => setFallbackToBase64(e.target.checked)}
                  />
                }
                label="Fallback to Base64"
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            multiline
            rows={6}
            label="Custom HTML (optional)"
            placeholder={defaultTestHtml}
            value={customHtml}
            onChange={(e) => setCustomHtml(e.target.value)}
            sx={{ mt: 2 }}
            helperText="Leave empty to use default test HTML with 2 image prompts"
          />
        </CardContent>
      </Card>

      <Button
        variant="contained"
        onClick={runTest}
        disabled={testing}
        sx={{ mb: 2 }}
        startIcon={testing ? <CircularProgress size={20} /> : null}
      >
        {testing ? 'Processing Images...' : 'Run Enhanced Test'}
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

          {/* Detailed Results */}
          {result.results && (
            <Box sx={{ mt: 2 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">📊 Test Results</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {/* Session Info */}
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Session ID:</strong> {result.results.sessionId}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Processing Time:</strong> {result.results.processingTime}
                      </Typography>
                    </Grid>

                    {/* Image Statistics */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>Images</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Chip label={`Total: ${result.results.images.total}`} />
                        <Chip label={`Success: ${result.results.images.successful}`} color="success" />
                        <Chip label={`Temp Storage: ${result.results.images.tempStored}`} color="primary" />
                        <Chip label={`Base64 Fallback: ${result.results.images.base64Fallback}`} color="warning" />
                        {result.results.images.failed > 0 && (
                          <Chip label={`Failed: ${result.results.images.failed}`} color="error" />
                        )}
                      </Box>
                    </Grid>

                    {/* Performance */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>Performance</Typography>
                      <Typography variant="body2">
                        <strong>Size Savings:</strong> {result.results.performance.sizeSavings}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Base64 Size:</strong> {result.results.performance.base64Size}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Temp URL Size:</strong> {result.results.performance.tempUrlSize}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Temporary Files */}
              {result.results.temporaryFiles.count > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      📁 Temporary Files ({result.results.temporaryFiles.count})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {result.results.temporaryFiles.files.map((file, index) => (
                      <Box key={index} sx={{ mb: 1, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                        <Typography variant="body2">
                          <strong>File:</strong> {file.fileName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Dimensions:</strong> {file.dimensions}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Prompt:</strong> {file.prompt}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                          <strong>URL:</strong> {file.tempUrl}
                        </Typography>
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Processed HTML */}
              {result.processedHtml && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">🔧 Processed HTML</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      value={result.processedHtml}
                      InputProps={{
                        readOnly: true,
                        style: { fontSize: '0.75rem', fontFamily: 'monospace' }
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Errors */}
              {result.results.errors.length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      ⚠️ Errors ({result.results.errors.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {result.results.errors.map((error, index) => (
                      <Typography key={index} variant="body2" color="error" sx={{ mb: 1 }}>
                        {error}
                      </Typography>
                    ))}
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}
        </Alert>
      )}
    </Box>
  );
};
