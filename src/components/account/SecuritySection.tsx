'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Shield,
  Key,
  AlertTriangle,
} from 'lucide-react';

const SecuritySection: React.FC = () => {
  const theme = useTheme();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value,
    }));
    // Очищаємо помилки при зміні полів
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Пароль повинен містити щонайменше 6 символів';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Пароль повинен містити щонайменше одну малу літеру';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Пароль повинен містити щонайменше одну велику літеру';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Пароль повинен містити щонайменше одну цифру';
    }
    return null;
  };

  const handleStartPasswordChange = () => {
    setIsChangingPassword(true);
    setError(null);
    setSuccess(null);
    setPasswordForm({
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordForm({
      newPassword: '',
      confirmPassword: '',
    });
    setError(null);
    setSuccess(null);
  };

  const handleSavePassword = async () => {
    const { newPassword, confirmPassword } = passwordForm;

    // Валідація
    if (!newPassword || !confirmPassword) {
      setError('Заповніть всі поля');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Пароль успішно змінено');
        setIsChangingPassword(false);
        setPasswordForm({
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(data.error?.message || 'Помилка при зміні пароля');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Помилка підключення до сервера');
    } finally {
      setIsSaving(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[!@#$%^&*])/.test(password)) strength++;

    return {
      score: strength,
      label: ['Дуже слабкий', 'Слабкий', 'Середній', 'Хороший', 'Відмінний'][strength] || 'Дуже слабкий',
      color: ['#f44336', '#ff9800', '#2196f3', '#4caf50', '#8bc34a'][strength] || '#f44336',
    };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Безпека акаунта
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Зміна пароля */}
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
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  mr: 2,
                }}
              >
                <Key size={24} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Зміна пароля
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Оновіть свій пароль для забезпечення безпеки акаунта
                </Typography>
              </Box>
              
              {!isChangingPassword && (
                <Button
                  variant="outlined"
                  onClick={handleStartPasswordChange}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: '8px',
                  }}
                >
                  Змінити пароль
                </Button>
              )}
            </Box>

            {isChangingPassword && (
              <Stack spacing={3}>
                {/* Новий пароль */}
                <Box>
                  <TextField
                    label="Новий пароль"
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
                  
                  {/* Індикатор надійності пароля */}
                  {passwordForm.newPassword && (
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Надійність:
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

                {/* Підтвердження пароля */}
                <TextField
                  label="Підтвердіть новий пароль"
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
                      ? 'Паролі не співпадають'
                      : ''
                  }
                />

                {/* Кнопки */}
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
                    Скасувати
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
                        Збереження...
                      </>
                    ) : (
                      'Зберегти пароль'
                    )}
                  </Button>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Рекомендації з безпеки */}
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
                Рекомендації з безпеки
              </Typography>
            </Box>

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <AlertTriangle size={16} color={theme.palette.info.main} />
                <Typography variant="body2" color="text.secondary">
                  Використовуйте унікальний пароль, який ви не використовуєте на інших сайтах
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <AlertTriangle size={16} color={theme.palette.info.main} />
                <Typography variant="body2" color="text.secondary">
                  Пароль повинен містити великі та малі літери, цифри та спеціальні символи
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <AlertTriangle size={16} color={theme.palette.info.main} />
                <Typography variant="body2" color="text.secondary">
                  Не діліться своїм паролем з іншими людьми
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <AlertTriangle size={16} color={theme.palette.info.main} />
                <Typography variant="body2" color="text.secondary">
                  Регулярно змінюйте пароль для забезпечення максимальної безпеки
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default SecuritySection; 