/**
 * Admin Settings Page
 * Platform configuration, generation limits, email templates, and promo codes
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { settingsService } from '@/services/admin/settingsService';
import type {
  PlatformSettings,
  GenerationLimitConfig,
  EmailTemplate,
  PromoCode,
} from '@/types/admin';

export default function AdminSettingsPage() {
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const [generationLimits, setGenerationLimits] = useState<GenerationLimitConfig[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [settings, limits, templates, codes] = await Promise.all([
        settingsService.getPlatformSettings(),
        settingsService.getGenerationLimitConfigs(),
        settingsService.getEmailTemplates(),
        settingsService.getPromoCodes(),
      ]);

      setPlatformSettings(settings);
      setGenerationLimits(limits);
      setEmailTemplates(templates);
      setPromoCodes(codes);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!platformSettings) return;

    try {
      const result = await settingsService.updatePlatformSettings(platformSettings);
      if (result.success) {
        setSuccess('Settings saved successfully');
      } else {
        setError(result.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4">Loading settings...</Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth={false}
      sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 }, maxWidth: '1800px', mx: 'auto' }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 4,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}40`,
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
            <SettingsIcon sx={{ mr: 2, fontSize: 40 }} />
            Platform Settings
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Configure platform behavior, limits, and features
          </Typography>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Platform Settings */}
        {platformSettings && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Platform Configuration
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={platformSettings.maintenance_mode}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          maintenance_mode: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Maintenance Mode"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={platformSettings.registration_enabled}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          registration_enabled: e.target.checked,
                        })
                      }
                    />
                  }
                  label="User Registration Enabled"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={platformSettings.ai_generation_enabled}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          ai_generation_enabled: e.target.checked,
                        })
                      }
                    />
                  }
                  label="AI Generation Enabled"
                />

                <Divider />

                <TextField
                  label="Default Generation Limit"
                  type="number"
                  value={platformSettings.default_generation_limit}
                  onChange={(e) =>
                    setPlatformSettings({
                      ...platformSettings,
                      default_generation_limit: parseInt(e.target.value),
                    })
                  }
                  fullWidth
                />

                <TextField
                  label="Max Generation Limit"
                  type="number"
                  value={platformSettings.max_generation_limit}
                  onChange={(e) =>
                    setPlatformSettings({
                      ...platformSettings,
                      max_generation_limit: parseInt(e.target.value),
                    })
                  }
                  fullWidth
                />

                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Save Settings
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Feature Flags */}
        {platformSettings && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Feature Flags
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(platformSettings.feature_flags).map(([key, value]) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Switch
                        checked={value}
                        onChange={(e) =>
                          setPlatformSettings({
                            ...platformSettings,
                            feature_flags: {
                              ...platformSettings.feature_flags,
                              [key]: e.target.checked,
                            },
                          })
                        }
                      />
                    }
                    label={key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Generation Limits */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Generation Limits by Plan
            </Typography>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Daily Limit</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Monthly Limit</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Slide Cost</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Worksheet Cost</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {generationLimits.map((limit) => (
                  <TableRow key={limit.plan}>
                    <TableCell>
                      <Chip label={limit.plan} />
                    </TableCell>
                    <TableCell>{limit.daily_limit === -1 ? 'Unlimited' : limit.daily_limit}</TableCell>
                    <TableCell>
                      {limit.monthly_limit === -1 ? 'Unlimited' : limit.monthly_limit}
                    </TableCell>
                    <TableCell>{limit.slide_generation_cost}</TableCell>
                    <TableCell>{limit.worksheet_generation_cost}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Email Templates */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Email Templates
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />}>
                Add Template
              </Button>
            </Box>

            <Grid container spacing={2}>
              {emailTemplates.map((template) => (
                <Grid item xs={12} md={6} key={template.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {template.name}
                      </Typography>
                      <Chip label={template.category} size="small" sx={{ mb: 2 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {template.subject}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Variables: {template.variables.join(', ')}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button size="small" startIcon={<EditIcon />}>
                          Edit
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Promo Codes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Promo Codes
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />}>
                Create Promo Code
              </Button>
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Discount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Valid Until</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Uses</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {promoCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {code.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {code.discount_type === 'percentage' ? `${code.discount_value}%` : `$${code.discount_value}`}
                    </TableCell>
                    <TableCell>{new Date(code.valid_until).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {code.current_uses} / {code.max_uses}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={code.is_active ? 'Active' : 'Inactive'}
                        color={code.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

