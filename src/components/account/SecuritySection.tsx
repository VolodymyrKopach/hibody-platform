'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Box,
  Stack,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from 'react-i18next';

const SecuritySection: React.FC = () => {
  const { t } = useTranslation(['account', 'auth', 'security', 'common']);
  const theme = useTheme();
  const { user } = useAuth();
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return t('auth:validation.passwordTooShort');
    }
    
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return t('account:security.recommendations.passwordComplexity');
    }
    
    return null;
  };

  const handleStartPasswordChange = () => {
    setIsChangingPassword(true);
    setPasswordForm({
      newPassword: '',
      confirmPassword: '',
    });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordForm({
      newPassword: '',
      confirmPassword: '',
    });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSavePassword = async () => {
    // Валідація
    const passwordError = validatePassword(passwordForm.newPassword);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage(t('auth:validation.passwordsDoNotMatch2'));
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(t('account:security.passwordChanged'));
        setIsChangingPassword(false);
        setPasswordForm({
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setErrorMessage(data.message || t('account:security.passwordError'));
      }
    } catch (error) {
      console.error('Password change error:', error);
      setErrorMessage(t('common:errors.connectionToServer'));
    } finally {
      setIsSaving(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    const labels = [
      t('auth:passwordStrength.veryWeak'),
      t('auth:passwordStrength.weak'),
      t('auth:passwordStrength.medium'),
      t('auth:passwordStrength.good'),
      t('auth:passwordStrength.excellent')
    ];
    
    return {
      score: strength,
      label: labels[strength] || t('auth:passwordStrength.veryWeak'),
      color: ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2e7d32'][strength] || '#f44336'
    };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Section Title */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        {t('security:title')}
      </Typography>

      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Password Change Card */}
      <Card sx={{ 
        borderRadius: '12px',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        mb: 3,
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '8px',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                mr: 2,
              }}
            >
              <Shield size={24} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('security:changePassword')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('account:security.updatePasswordDescription')}
              </Typography>
            </Box>
            {!isChangingPassword && (
              <Button
                onClick={handleStartPasswordChange}
                variant="outlined"
                sx={{ 
                  textTransform: 'none',
                  borderRadius: '8px',
                }}
              >
                {t('security:changePassword')}
              </Button>
            )}
          </Box>

          {isChangingPassword && (
            <Stack spacing={3}>
              {/* New Password */}
              <Box>
                <TextField
                  label={t('security:form.newPassword')}
                  type={showPasswords.new ? 'text' : 'password'}
                  fullWidth
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('new')}
                          edge="end"
                        >
                          {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                {/* Password Strength Indicator */}
                {passwordForm.newPassword && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('auth:passwordStrength.strengthLabel')}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ color: passwordStrength.color, fontWeight: 500 }}
                      >
                        {passwordStrength.label}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.grey[300], 0.5),
                        mt: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          borderRadius: 2,
                          backgroundColor: passwordStrength.color,
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Confirm Password */}
              <TextField
                label={t('security:form.confirmNewPassword')}
                type={showPasswords.confirm ? 'text' : 'password'}
                fullWidth
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                      >
                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                error={
                  passwordForm.confirmPassword.length > 0 && 
                  passwordForm.newPassword !== passwordForm.confirmPassword
                }
                helperText={
                  passwordForm.confirmPassword.length > 0 && 
                  passwordForm.newPassword !== passwordForm.confirmPassword
                    ? t('auth:validation.passwordsDoNotMatch2')
                    : ''
                }
              />

              {/* Buttons */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'flex-end',
                pt: 2,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}>
                <Button
                  onClick={handleCancelPasswordChange}
                  variant="outlined"
                  disabled={isSaving}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: '8px',
                  }}
                >
                  {t('security:actions.cancel')}
                </Button>
                <Button
                  onClick={handleSavePassword}
                  variant="contained"
                  disabled={
                    isSaving || 
                    !passwordForm.newPassword || 
                    !passwordForm.confirmPassword ||
                    passwordForm.newPassword !== passwordForm.confirmPassword
                  }
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: '8px',
                  }}
                >
                  {isSaving ? (
                    <>
                      <CircularProgress size={18} sx={{ mr: 1 }} />
                      {t('security:actions.saving')}
                    </>
                  ) : (
                    t('security:actions.save')
                  )}
                </Button>
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card sx={{ 
        borderRadius: '12px',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '8px',
                backgroundColor: alpha(theme.palette.warning.main, 0.1),
                color: theme.palette.warning.main,
                mr: 2,
              }}
            >
              <Shield size={24} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('security:recommendations.title')}
            </Typography>
          </Box>

          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <AlertTriangle size={16} color={theme.palette.info.main} />
              <Typography variant="body2" color="text.secondary">
                {t('security:recommendations.uniquePassword')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <AlertTriangle size={16} color={theme.palette.info.main} />
              <Typography variant="body2" color="text.secondary">
                {t('security:recommendations.passwordComplexity')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <AlertTriangle size={16} color={theme.palette.info.main} />
              <Typography variant="body2" color="text.secondary">
                {t('security:recommendations.dontShare')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <AlertTriangle size={16} color={theme.palette.info.main} />
              <Typography variant="body2" color="text.secondary">
                {t('account:security.recommendations.updateRegularly', { defaultValue: 'Regularly update your password for maximum security' })}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SecuritySection; 