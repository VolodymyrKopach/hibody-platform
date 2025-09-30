'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  useTheme,
  alpha,
  Grid,
  IconButton,
  Chip,
} from '@mui/material';
import { 
  Sparkles, 
  RefreshCw, 
  ArrowLeft,
  ArrowRight,
  Edit,
  Eye,
  Layers,
} from 'lucide-react';

interface WorksheetPage {
  pageNumber: number;
  title: string;
  components: string[];
  thumbnail: string; // For now, emoji/text representation
}

// Mock data - буде замінено на реальні дані з API
const MOCK_PAGES: WorksheetPage[] = [
  {
    pageNumber: 1,
    title: 'Introduction & Instructions',
    components: ['Title', 'Instructions', 'Vocabulary Box'],
    thumbnail: '📋',
  },
  {
    pageNumber: 2,
    title: 'Fill in the Blanks',
    components: ['Title', 'Instructions', 'Fill-in Exercise (7 items)'],
    thumbnail: '✏️',
  },
  {
    pageNumber: 3,
    title: 'Multiple Choice',
    components: ['Title', 'Multiple Choice (5 questions)', 'Answer Key'],
    thumbnail: '☑️',
  },
];

interface Step2WorksheetPreviewProps {
  onBack: () => void;
  onContinue: () => void;
  parameters: any; // Will type properly later
}

const Step2WorksheetPreview: React.FC<Step2WorksheetPreviewProps> = ({
  onBack,
  onContinue,
  parameters,
}) => {
  const theme = useTheme();
  const [selectedPage, setSelectedPage] = React.useState<number | null>(null);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  ✅ Worksheet Generated!
                </Typography>
                <Chip
                  label={`${MOCK_PAGES.length} pages`}
                  size="small"
                  sx={{
                    background: alpha(theme.palette.success.main, 0.15),
                    color: theme.palette.success.dark,
                    fontWeight: 600,
                  }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Review your worksheet pages and edit if needed
              </Typography>
            </Box>
            <Button
              startIcon={<RefreshCw size={18} />}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                borderColor: alpha(theme.palette.divider, 0.2),
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  background: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              Regenerate All
            </Button>
          </Stack>
        </Paper>

        {/* Pages Grid */}
        <Grid container spacing={3}>
          {MOCK_PAGES.map((page) => (
            <Grid item xs={12} md={4} key={page.pageNumber}>
              <Paper
                elevation={0}
                sx={{
                  p: 0,
                  borderRadius: '16px',
                  border: `2px solid ${
                    selectedPage === page.pageNumber
                      ? theme.palette.primary.main
                      : alpha(theme.palette.divider, 0.1)
                  }`,
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => setSelectedPage(page.pageNumber)}
              >
                {/* Thumbnail Preview */}
                <Box
                  sx={{
                    height: 280,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    position: 'relative',
                  }}
                >
                  {/* Page Number Badge */}
                  <Chip
                    label={`Page ${page.pageNumber}`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      background: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                    }}
                  />

                  {/* Mock Thumbnail */}
                  <Typography sx={{ fontSize: '4rem', mb: 2 }}>
                    {page.thumbnail}
                  </Typography>
                  
                  {/* Mock Content Preview */}
                  <Paper
                    elevation={0}
                    sx={{
                      width: '80%',
                      p: 2,
                      background: 'white',
                      borderRadius: '8px',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
                    <Stack spacing={1}>
                      <Box sx={{ height: 8, background: alpha(theme.palette.grey[400], 0.3), borderRadius: 1, width: '60%' }} />
                      <Box sx={{ height: 6, background: alpha(theme.palette.grey[400], 0.2), borderRadius: 1, width: '80%' }} />
                      <Box sx={{ height: 6, background: alpha(theme.palette.grey[400], 0.2), borderRadius: 1, width: '70%' }} />
                      <Box sx={{ height: 6, background: alpha(theme.palette.grey[400], 0.2), borderRadius: 1, width: '90%' }} />
                    </Stack>
                  </Paper>
                </Box>

                {/* Page Info */}
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {page.title}
                  </Typography>
                  <Stack spacing={0.5}>
                    {page.components.map((comp, idx) => (
                      <Stack key={idx} direction="row" alignItems="center" spacing={0.5}>
                        <Box
                          sx={{
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            background: theme.palette.primary.main,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {comp}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  {/* Actions */}
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      startIcon={<Edit size={14} />}
                      fullWidth
                      variant="outlined"
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        py: 0.5,
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Eye size={14} />}
                      fullWidth
                      variant="outlined"
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        py: 0.5,
                      }}
                    >
                      Preview
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ pt: 2 }}>
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={onBack}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              color: theme.palette.text.secondary,
              '&:hover': {
                background: alpha(theme.palette.grey[400], 0.1),
              },
            }}
          >
            Back to Parameters
          </Button>

          <Button
            variant="contained"
            size="large"
            endIcon={<Layers size={20} />}
            onClick={onContinue}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            Open Canvas Editor
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Step2WorksheetPreview;
