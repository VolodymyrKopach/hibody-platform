'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import { Edit, Save, X, Camera } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  subscription_type: string;
  created_at: string;
  updated_at: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
}

const ProfileSection: React.FC = () => {
  const { t } = useTranslation(['account', 'common']);
  const theme = useTheme();
  const { user, profile: contextProfile, updateProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    avatar_url: '',
  });

  // Завантажуємо повний профіль з API
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();
        
        if (data.success) {
          setProfile(data.profile);
          setEditForm({
            full_name: data.profile.full_name || '',
            avatar_url: data.profile.avatar_url || '',
          });
        } else {
          setError(data.error?.message || t('profile.profileLoadError'));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(t('profile.connectionError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, t]);

  const handleEditStart = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({
      full_name: profile?.full_name || '',
      avatar_url: profile?.avatar_url || '',
    });
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // API запит для оновлення профілю
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: editForm.full_name.trim() || null,
          avatar_url: editForm.avatar_url.trim() || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.profile);
        setIsEditing(false);
        setSuccess(t('profile.profileUpdated'));
        
        // Оновлюємо профіль в контексті
        await updateProfile({
          full_name: data.profile.full_name,
          avatar_url: data.profile.avatar_url,
        });
      } else {
        setError(data.error?.message || t('profile.profileUpdateError'));
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(t('profile.connectionError'));
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t('profile.unknown');
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 200 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Alert severity="error">
        {t('profile.profileLoadError')}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {t('profile.profileInfo')}
        </Typography>
        
        {!isEditing && (
          <Button
            startIcon={<Edit size={18} />}
            onClick={handleEditStart}
            variant="outlined"
            sx={{ 
              textTransform: 'none',
              borderRadius: '8px',
            }}
          >
            {t('profile.edit')}
          </Button>
        )}
      </Box>

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
        {/* Аватар */}
        <Card sx={{ 
          borderRadius: '12px',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {t('profile.avatar')}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={isEditing ? editForm.avatar_url : profile.avatar_url}
                  alt={profile.full_name || profile.email}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '2rem',
                    fontWeight: 600,
                  }}
                >
                  {(profile.full_name || profile.email || '').charAt(0).toUpperCase()}
                </Avatar>
                
                {isEditing && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: -8,
                      right: -8,
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    <Camera size={16} />
                  </IconButton>
                )}
              </Box>
              
              {isEditing && (
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label={t('profile.avatarUrl')}
                    fullWidth
                    value={editForm.avatar_url}
                    onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                    placeholder={t('profile.enterAvatarUrl')}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {t('profile.avatarUrlDescription')}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Основна інформація */}
        <Card sx={{ 
          borderRadius: '12px',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              {t('profile.basicInfo')}
            </Typography>
            
            <Stack spacing={3}>
              {/* Повне ім'я */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  {t('profile.fullName')}
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={editForm.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder={t('profile.enterFullName')}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      }
                    }}
                  />
                ) : (
                  <Typography variant="body1">
                    {profile.full_name || t('profile.notSpecified')}
                  </Typography>
                )}
              </Box>

              {/* Email (тільки для читання) */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  {t('profile.email')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {profile.email}
                </Typography>
              </Box>

              {/* Роль (тільки для читання) */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  {t('profile.role')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t(`common:roles.${profile.role}`)}
                </Typography>
              </Box>

              {/* Підписка (тільки для читання) */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  {t('profile.subscriptionType')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t(`common:subscription.${profile.subscription_type}`)}
                </Typography>
              </Box>
            </Stack>

            {/* Кнопки збереження/скасування */}
            {isEditing && (
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'flex-end',
                mt: 3,
                pt: 3,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}>
                <Button
                  startIcon={<X size={18} />}
                  onClick={handleEditCancel}
                  variant="outlined"
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: '8px',
                  }}
                >
                  {t('profile.cancel')}
                </Button>
                <Button
                  startIcon={isSaving ? <CircularProgress size={18} /> : <Save size={18} />}
                  onClick={handleSave}
                  variant="contained"
                  disabled={isSaving}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: '8px',
                  }}
                >
                  {isSaving ? t('profile.saving') : t('profile.save')}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Додаткова інформація (тільки для читання) */}
        <Card sx={{ 
          borderRadius: '12px',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              {t('profile.systemInfo')}
            </Typography>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  {t('profile.registrationDate')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(profile.created_at)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  {t('profile.lastProfileUpdate')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(profile.updated_at)}
                </Typography>
              </Box>

              {profile.last_sign_in_at && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                    {t('profile.lastSignIn')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(profile.last_sign_in_at)}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default ProfileSection; 