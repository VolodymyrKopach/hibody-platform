import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Rocket, Check } from 'lucide-react';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  generationCount: number;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  open,
  onClose,
  onUpgrade,
  generationCount,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 2,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Rocket size={48} color="#1976d2" />
        </Box>
        <Typography variant="h5" fontWeight="bold">
          Ви створили вже {generationCount} чудові уроки! 🎉
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Продовжуйте генерувати без обмежень — активуйте Pro
        </Typography>

        <Box
          sx={{
            bgcolor: 'primary.50',
            borderRadius: 2,
            p: 3,
            border: '2px solid',
            borderColor: 'primary.main',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
            <Typography variant="h3" fontWeight="bold" color="primary">
              $9
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
              / місяць
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              'Необмежена генерація уроків',
              'Повний експорт презентацій',
              'Кастомізація шаблонів',
              'Пріоритетна підтримка',
            ].map((feature, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Check size={20} color="#4caf50" />
                <Typography variant="body2">{feature}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 2 }}
        >
          Скасувати можна будь-коли
        </Typography>
      </DialogContent>

      <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 3, pb: 2 }}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={onUpgrade}
          sx={{ py: 1.5 }}
        >
          Оформити Pro →
        </Button>
        <Button
          variant="text"
          fullWidth
          onClick={onClose}
          sx={{ color: 'text.secondary' }}
        >
          Поки що ні, дякую
        </Button>
      </DialogActions>
    </Dialog>
  );
};

