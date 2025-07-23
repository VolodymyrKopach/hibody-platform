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
        // Clear localStorage after successful migration
        await migrationService.clearLocalStorageAfterMigration();
        
        // Update status
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
        Checking data...
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
            No data for migration found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There is no data in your localStorage for migration to the database.
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUpload color="primary" />
          Migrate data to database
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Data found in your local storage. We recommend migrating it to the database for security and synchronization across devices.
        </Alert>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Local Data:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary={`Lessons: ${localLessonsCount}`}
                secondary="Will be migrated to the database"
              />
              <Chip label={localLessonsCount} color="primary" size="small" />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={`Slides: ${localSlidesCount}`}
                secondary="Will be migrated along with the lessons"
              />
              <Chip label={localSlidesCount} color="secondary" size="small" />
            </ListItem>
          </List>
        </Paper>

        {hasDatabaseData && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Data in Database:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary={`Existing lessons: ${databaseLessonsCount}`}
                  secondary="Duplicates will be skipped"
                />
                <Chip label={databaseLessonsCount} color="default" size="small" />
              </ListItem>
            </List>
          </Paper>
        )}

        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Warning:</strong> After successful migration, local data will be deleted. 
            Make sure you have a backup of important data.
          </Typography>
        </Alert>
      </Box>
    );
  };

  const renderMigratingStep = () => (
    <Box sx={{ py: 3, textAlign: 'center' }}>
      <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Migrating data...
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Please wait. The process may take a few minutes.
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
            {success ? 'Migration completed successfully!' : 'Migration completed with errors'}
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Migration Results:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary={`Migrated lessons: ${migratedLessons}`}
                secondary="Successfully saved to the database"
              />
              <Chip 
                label={migratedLessons} 
                color={migratedLessons > 0 ? 'success' : 'default'} 
                size="small" 
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={`Migrated slides: ${migratedSlides}`}
                secondary="Successfully saved to the database"
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
              Errors during migration:
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
              All data successfully migrated to the database. Local data has been deleted for security.
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
            Cancel
          </Button>
        );
      case 'ready':
        return (
          <>
            <Button onClick={handleClose}>
              Cancel
            </Button>
            {migrationStatus?.hasLocalData && (
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={handleMigration}
                disabled={isMigrating}
              >
                Start Migration
              </Button>
            )}
          </>
        );
      case 'migrating':
        return (
          <Button disabled>
            Migrating...
          </Button>
        );
      case 'completed':
        return (
          <Button variant="contained" onClick={handleClose}>
            Close
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
        Data Migration
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