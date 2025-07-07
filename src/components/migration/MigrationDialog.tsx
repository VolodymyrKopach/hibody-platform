'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  LinearProgress,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Chip
} from '@mui/material';
import {
  CloudUpload,
  Storage,
  CheckCircle,
  Error,
  Warning,
  Info
} from '@mui/icons-material';
import { LocalStorageMigrationService, type MigrationResult } from '@/services/migration/LocalStorageMigrationService';
import { useAuth } from '@/providers/AuthProvider';

interface MigrationDialogProps {
  open: boolean;
  onClose: () => void;
  onMigrationComplete?: (result: MigrationResult) => void;
}

interface MigrationStatus {
  hasLocalData: boolean;
  localLessonsCount: number;
  localSlidesCount: number;
  hasDatabaseData: boolean;
  databaseLessonsCount: number;
}

export const MigrationDialog: React.FC<MigrationDialogProps> = ({
  open,
  onClose,
  onMigrationComplete
}) => {
  const { user } = useAuth();
  const [migrationService] = useState(() => new LocalStorageMigrationService());
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [step, setStep] = useState<'checking' | 'ready' | 'migrating' | 'completed'>('checking');

  useEffect(() => {
    if (open && user) {
      checkMigrationStatus();
    }
  }, [open, user]);

  const checkMigrationStatus = async () => {
    setIsLoading(true);
    setStep('checking');
    
    try {
      const status = await migrationService.checkMigrationStatus();
      setMigrationStatus(status);
      setStep('ready');
    } catch (error) {
      console.error('Error checking migration status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigration = async () => {
    if (!user) return;
    
    setIsMigrating(true);
    setStep('migrating');
    
    try {
      const result = await migrationService.migrateUserData();
      setMigrationResult(result);
      setStep('completed');
      
      if (result.success) {
        // Очищаємо localStorage після успішної міграції
        await migrationService.clearLocalStorageAfterMigration();
        
        // Оновлюємо статус
        await checkMigrationStatus();
      }
      
      onMigrationComplete?.(result);
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationResult({
        success: false,
        migratedLessons: 0,
        migratedSlides: 0,
        errors: [`Migration failed: ${error}`]
      });
      setStep('completed');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleClose = () => {
    if (!isMigrating) {
      onClose();
    }
  };

  const renderCheckingStep = () => (
    <Box sx={{ py: 3, textAlign: 'center' }}>
      <Storage sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Перевірка даних...
      </Typography>
      <LinearProgress sx={{ mt: 2 }} />
    </Box>
  );

  const renderReadyStep = () => {
    if (!migrationStatus) return null;

    const { hasLocalData, localLessonsCount, localSlidesCount, hasDatabaseData, databaseLessonsCount } = migrationStatus;

    if (!hasLocalData) {
      return (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Дані для міграції не знайдено
          </Typography>
          <Typography variant="body2" color="text.secondary">
            У вашому localStorage немає даних для міграції до бази даних.
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUpload color="primary" />
          Міграція даних до бази даних
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Знайдено дані у вашому локальному сховищі. Рекомендуємо мігрувати їх до бази даних для безпеки та синхронізації між пристроями.
        </Alert>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Локальні дані:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary={`Уроки: ${localLessonsCount}`}
                secondary="Будуть мігровані до бази даних"
              />
              <Chip label={localLessonsCount} color="primary" size="small" />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={`Слайди: ${localSlidesCount}`}
                secondary="Будуть мігровані разом з уроками"
              />
              <Chip label={localSlidesCount} color="secondary" size="small" />
            </ListItem>
          </List>
        </Paper>

        {hasDatabaseData && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Дані в базі даних:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary={`Існуючі уроки: ${databaseLessonsCount}`}
                  secondary="Дублікати будуть пропущені"
                />
                <Chip label={databaseLessonsCount} color="default" size="small" />
              </ListItem>
            </List>
          </Paper>
        )}

        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Увага:</strong> Після успішної міграції локальні дані будуть видалені. 
            Переконайтеся, що у вас є резервна копія важливих даних.
          </Typography>
        </Alert>
      </Box>
    );
  };

  const renderMigratingStep = () => (
    <Box sx={{ py: 3, textAlign: 'center' }}>
      <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Міграція даних...
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Будь ласка, зачекайте. Процес може зайняти кілька хвилин.
      </Typography>
      <LinearProgress sx={{ mt: 2 }} />
    </Box>
  );

  const renderCompletedStep = () => {
    if (!migrationResult) return null;

    const { success, migratedLessons, migratedSlides, errors } = migrationResult;

    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {success ? (
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
          ) : (
            <Error sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          )}
          <Typography variant="h6" gutterBottom>
            {success ? 'Міграція завершена успішно!' : 'Міграція завершена з помилками'}
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Результати міграції:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary={`Мігровано уроків: ${migratedLessons}`}
                secondary="Успішно збережено в базі даних"
              />
              <Chip 
                label={migratedLessons} 
                color={migratedLessons > 0 ? 'success' : 'default'} 
                size="small" 
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={`Мігровано слайдів: ${migratedSlides}`}
                secondary="Успішно збережено в базі даних"
              />
              <Chip 
                label={migratedSlides} 
                color={migratedSlides > 0 ? 'success' : 'default'} 
                size="small" 
              />
            </ListItem>
          </List>
        </Paper>

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Помилки під час міграції:
            </Typography>
            <List dense>
              {errors.map((error, index) => (
                <ListItem key={index} sx={{ py: 0 }}>
                  <ListItemText
                    primary={error}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {success && (
          <Alert severity="success">
            <Typography variant="body2">
              Всі дані успішно мігровані до бази даних. Локальні дані видалено для безпеки.
            </Typography>
          </Alert>
        )}
      </Box>
    );
  };

  const renderContent = () => {
    switch (step) {
      case 'checking':
        return renderCheckingStep();
      case 'ready':
        return renderReadyStep();
      case 'migrating':
        return renderMigratingStep();
      case 'completed':
        return renderCompletedStep();
      default:
        return null;
    }
  };

  const renderActions = () => {
    switch (step) {
      case 'checking':
        return (
          <Button onClick={handleClose} disabled={isLoading}>
            Скасувати
          </Button>
        );
      case 'ready':
        return (
          <>
            <Button onClick={handleClose}>
              Скасувати
            </Button>
            {migrationStatus?.hasLocalData && (
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={handleMigration}
                disabled={isMigrating}
              >
                Почати міграцію
              </Button>
            )}
          </>
        );
      case 'migrating':
        return (
          <Button disabled>
            Міграція...
          </Button>
        );
      case 'completed':
        return (
          <Button variant="contained" onClick={handleClose}>
            Закрити
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isMigrating}
    >
      <DialogTitle>
        Міграція даних
      </DialogTitle>
      <DialogContent>
        {renderContent()}
      </DialogContent>
      <DialogActions>
        {renderActions()}
      </DialogActions>
    </Dialog>
  );
};

export default MigrationDialog; 