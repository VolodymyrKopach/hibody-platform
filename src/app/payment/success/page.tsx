'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { trackPaymentCompleted } = useAnalytics();

  useEffect(() => {
    // Track successful payment
    trackPaymentCompleted(9, 'USD');
  }, [trackPaymentCompleted]);

  const handleContinue = () => {
    router.push('/create-lesson');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 6, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <CheckCircle size={80} color="#4caf50" />
          </Box>

          <Typography variant="h4" gutterBottom fontWeight="bold">
            Оплата успішна! 🎉
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Ваша підписка TeachSpark Pro активована. Тепер ви можете створювати необмежену кількість уроків!
          </Typography>

          <Box sx={{ 
            bgcolor: 'primary.50', 
            borderRadius: 2, 
            p: 3, 
            mb: 4 
          }}>
            <Typography variant="h6" gutterBottom>
              Що далі?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Створюйте уроки без обмежень, експортуйте презентації та насолоджуйтеся всіма функціями Pro.
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleContinue}
            sx={{ py: 2 }}
          >
            Почати створювати уроки
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}

