'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { generateSlideThumbnail, SlidePreviewOptions } from '@/utils/slidePreview';

interface TestResult {
  format: string;
  size: string;
  dataUrl: string;
  processingTime: number;
  error?: string;
}

const SnapdomTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  // Hardcoded dimensions - no user control needed
  const [customHtml, setCustomHtml] = useState(`<div style="
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Arial, sans-serif;
    color: white;
    text-align: center;
    padding: 40px;
    box-sizing: border-box;
  ">
    <div>
      <h1 style="margin: 0 0 20px 0; font-size: 3em; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
        🎨 Custom HTML
      </h1>
      <p style="margin: 0; font-size: 1.5em; opacity: 0.9;">
        Edit this HTML to test your own content!
      </p>
    </div>
  </div>`);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sample HTML content for testing
  const sampleHtmlContent = `
    <div style="
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
      color: white;
      text-align: center;
      padding: 20px;
      box-sizing: border-box;
    ">
      <h1 style="margin: 0 0 20px 0; font-size: 2.5em; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
        🚀 SnapDOM Test
      </h1>
      <p style="margin: 0 0 20px 0; font-size: 1.2em; opacity: 0.9;">
        Testing thumbnail generation with snapDOM
      </p>
      <div style="
        background: rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 20px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
      ">
        <p style="margin: 0; font-size: 1em;">
          📅 Generated: ${new Date().toLocaleString()}
        </p>
      </div>
      <div style="
        margin-top: 20px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
      ">
        <span style="
          background: #4CAF50;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9em;
        ">HTML</span>
        <span style="
          background: #2196F3;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9em;
        ">CSS</span>
        <span style="
          background: #FF9800;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9em;
        ">snapDOM</span>
      </div>
    </div>
  `;

  const complexHtmlContent = `
    <div style="
      width: 100%;
      height: 100%;
      background: #f5f5f5;
      padding: 20px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <header style="
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      ">
        <h1 style="margin: 0 0 10px 0; color: #333; font-size: 2em;">
          📊 Complex Layout Test
        </h1>
        <p style="margin: 0; color: #666; font-size: 1.1em;">
          Testing complex HTML structures with snapDOM
        </p>
      </header>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div style="
          background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
          color: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        ">
          <h3 style="margin: 0 0 10px 0;">🎨 Design</h3>
          <p style="margin: 0; opacity: 0.9;">Beautiful gradients and styling</p>
        </div>
        <div style="
          background: linear-gradient(45deg, #A8E6CF, #88D8A3);
          color: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        ">
          <h3 style="margin: 0 0 10px 0;">⚡ Performance</h3>
          <p style="margin: 0; opacity: 0.9;">Fast and efficient capture</p>
        </div>
      </div>
      
      <footer style="
        background: #333;
        color: white;
        padding: 15px;
        border-radius: 12px;
        text-align: center;
      ">
        <p style="margin: 0; font-size: 0.9em;">
          ✨ Powered by snapDOM • ${new Date().getFullYear()}
        </p>
      </footer>
    </div>
  `;

  const handleGenerateThumbnail = async (htmlContent: string, label: string) => {
    setIsGenerating(true);
    
    try {
      const startTime = performance.now();
      
      const options: SlidePreviewOptions = {
        quality: 0.9,
        compress: true,
        fast: true
      };

      const dataUrl = await generateSlideThumbnail(htmlContent, options);
      const endTime = performance.now();
      const processingTime = endTime - startTime;

      const newResult: TestResult = {
        format: 'WebP',
        size: '400×300',
        dataUrl,
        processingTime,
      };

      setResults(prev => [...prev, newResult]);
      
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      const newResult: TestResult = {
        format: 'WebP',
        size: '400×300',
        dataUrl: '',
        processingTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      setResults(prev => [...prev, newResult]);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🖼️ SnapDOM Thumbnail Generation Test
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This test page demonstrates the new snapDOM-based thumbnail generation system.
        The system <strong>fast-forwards animations</strong> to their final state for instant capture.
        You can test different sizes and HTML content complexity. 
        <strong>Paste your own HTML</strong> in the text area below to generate thumbnails from any content!
      </Alert>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🎛️ Generation Settings
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Chip 
                label="WebP Format" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Chip 
                label="1600×1200 viewport" 
                color="info" 
                variant="outlined"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Chip 
                label="400×300 output" 
                color="secondary" 
                variant="outlined"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Chip 
                label="Fast animation skip" 
                color="success" 
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                label="1600×1200 → 400×300" 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                label="WebP Format" 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                label="Final animation state" 
                color="success" 
                variant="outlined"
              />
              <Chip 
                label="Instant capture" 
                color="warning" 
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>

        {/* HTML Input Area */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          📝 Custom HTML Content
        </Typography>
        
        {/* Quick Templates */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ mr: 2, alignSelf: 'center' }}>
            Quick templates:
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setCustomHtml(`<div style="
              width: 100%;
              height: 100%;
              background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-family: Arial, sans-serif;
              text-align: center;
            ">
              <h1 style="margin: 0; font-size: 4em;">🌟 Hello World!</h1>
            </div>`)}
          >
            Simple Card
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setCustomHtml(`<div style="
              width: 100%;
              height: 100%;
              background: #f8f9fa;
              padding: 40px;
              box-sizing: border-box;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            ">
              <header style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin-bottom: 30px;">
                <h1 style="margin: 0; color: #333; font-size: 2.5em;">📊 Dashboard</h1>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 1.2em;">Analytics Overview</p>
              </header>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; border-radius: 12px; text-align: center;">
                  <h2 style="margin: 0 0 10px 0; font-size: 3em;">2,847</h2>
                  <p style="margin: 0; opacity: 0.9; font-size: 1.1em;">Total Users</p>
                </div>
                <div style="background: linear-gradient(135deg, #f093fb, #f5576c); color: white; padding: 30px; border-radius: 12px; text-align: center;">
                  <h2 style="margin: 0 0 10px 0; font-size: 3em;">$12,456</h2>
                  <p style="margin: 0; opacity: 0.9; font-size: 1.1em;">Revenue</p>
                </div>
              </div>
            </div>`)}
          >
            Dashboard
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setCustomHtml(`<div style="
              width: 100%;
              height: 100%;
              background: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><defs><pattern id=%22grain%22 width=%22100%22 height=%22100%22 patternUnits=%22userSpaceOnUse%22><circle cx=%2250%22 cy=%2250%22 r=%221%22 fill=%22%23ffffff%22 opacity=%220.1%22/></pattern></defs><rect width=%22100%22 height=%22100%22 fill=%22%23000000%22/><rect width=%22100%22 height=%22100%22 fill=%22url(%23grain)%22/></svg>') #000;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: white;
              font-family: 'Georgia', serif;
              text-align: center;
              padding: 60px;
              box-sizing: border-box;
            ">
              <h1 style="
                margin: 0 0 30px 0;
                font-size: 4em;
                font-weight: normal;
                letter-spacing: 2px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
              ">PREMIUM</h1>
              <p style="
                margin: 0 0 40px 0;
                font-size: 1.3em;
                opacity: 0.8;
                font-style: italic;
                max-width: 600px;
                line-height: 1.6;
              ">Experience the finest quality with our premium collection of handcrafted products.</p>
              <div style="
                border: 2px solid white;
                padding: 15px 40px;
                border-radius: 0;
                background: transparent;
                color: white;
                font-size: 1.1em;
                letter-spacing: 1px;
                cursor: pointer;
              ">EXPLORE NOW</div>
            </div>`)}
          >
            Premium Ad
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setCustomHtml(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Educational Slide: Animals</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background: linear-gradient(to bottom, #87CEEB, #90EE90);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            color: #333;
        }
        .container {
            text-align: center;
            position: relative;
            max-width: 800px;
            padding: 20px;
        }
        .title {
            font-size: 48px;
            color: #FF4500;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
            animation: bounce 2s infinite;
        }
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-30px); }
            60% { transform: translateY(-15px); }
        }
        .character {
            width: 200px;
            opacity: 0;
            animation: appear 2s forwards;
            cursor: pointer;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            color: white;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 200px;
            font-size: 60px;
        }
        @keyframes appear {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .message {
            font-size: 24px;
            margin: 20px 0;
            background: rgba(255,255,255,0.7);
            padding: 15px;
            border-radius: 10px;
        }
        .button {
            background: #FFD700;
            color: #333;
            font-size: 28px;
            padding: 15px 30px;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .animals {
            position: absolute;
            top: 10%;
            left: 10%;
            display: flex;
            gap: 20px;
        }
        .animal {
            width: 80px;
            height: 80px;
            cursor: pointer;
            transition: transform 0.3s;
            background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">Чудовий світ тварин!</h1>
        <div class="character">🦉</div>
        <p class="message">Привіт, маленькі дослідники! Я - мудра сова Олівія. Запрошую вас у захоплюючу подорож світом тварин!</p>
        <div class="button">Почати подорож!</div>
        
        <div class="animals">
            <div class="animal">🐦</div>
            <div class="animal">🐱</div>
            <div class="animal">🐶</div>
        </div>
    </div>
</body>
</html>`)}
          >
            Educational Slide
          </Button>
        </Box>
        
        <TextField
          fullWidth
          multiline
          rows={8}
          value={customHtml}
          onChange={(e) => setCustomHtml(e.target.value)}
          placeholder="Paste your HTML content here..."
          variant="outlined"
          sx={{ 
            mb: 3,
            '& .MuiInputBase-input': {
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              fontSize: '12px'
            }
          }}
          helperText="You can paste any HTML content here. Inline styles work best for thumbnail generation."
        />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={() => handleGenerateThumbnail(customHtml, 'Custom')}
            disabled={isGenerating || !customHtml.trim()}
            startIcon={isGenerating ? <CircularProgress size={20} /> : null}
            color="primary"
          >
            Generate Custom HTML
          </Button>
          
          <Button
            variant="contained"
            onClick={() => handleGenerateThumbnail(sampleHtmlContent, 'Simple')}
            disabled={isGenerating}
            startIcon={isGenerating ? <CircularProgress size={20} /> : null}
            color="secondary"
          >
            Generate Simple Test
          </Button>
          
          <Button
            variant="contained"
            onClick={() => handleGenerateThumbnail(complexHtmlContent, 'Complex')}
            disabled={isGenerating}
            startIcon={isGenerating ? <CircularProgress size={20} /> : null}
            color="secondary"
          >
            Generate Complex Test
          </Button>
          
          <Button
            variant="outlined"
            onClick={clearResults}
            disabled={isGenerating}
          >
            Clear Results
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => setCustomHtml('')}
            disabled={isGenerating}
          >
            Clear HTML
          </Button>
        </Box>
      </Paper>

      {/* Results */}
      {results.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            📊 Generation Results
          </Typography>
          
          <Grid container spacing={3}>
            {results.map((result, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    {result.error ? (
                      <Alert severity="error">
                        <Typography variant="body2">
                          {result.error}
                        </Typography>
                      </Alert>
                    ) : (
                      <Box sx={{ textAlign: 'center' }}>
                        <img
                          src={result.dataUrl}
                          alt={`Thumbnail ${index + 1}`}
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            marginBottom: '10px'
                          }}
                        />
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip 
                        label={result.format.toUpperCase()} 
                        size="small" 
                        color="primary" 
                      />
                      <Chip 
                        label={result.size} 
                        size="small" 
                        color="secondary" 
                      />
                      <Chip 
                        label={`${result.processingTime.toFixed(1)}ms`} 
                        size="small" 
                        color="success" 
                      />
                    </Box>
                  </CardContent>
                  
                  {!result.error && (
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = result.dataUrl;
                          link.download = `thumbnail-${index + 1}.webp`;
                          link.click();
                        }}
                      >
                        Download
                      </Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>
  );
};

export default SnapdomTest;