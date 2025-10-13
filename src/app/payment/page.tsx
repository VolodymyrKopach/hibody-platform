'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Check, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAnalytics } from '@/hooks/useAnalytics';

interface PaymentFormData {
  merchantAccount: string;
  merchantDomainName: string;
  orderReference: string;
  orderDate: number;
  amount: number;
  currency: string;
  productName: string[];
  productCount: number[];
  productPrice: number[];
  clientEmail: string;
  clientFirstName: string;
  clientLastName: string;
  language: string;
  serviceUrl: string;
  returnUrl: string;
  merchantSignature: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const { trackUpgradeClicked } = useAnalytics();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null);
  const [wayforpayUrl, setWayforpayUrl] = useState<string>('');

  useEffect(() => {
    // Initialize payment form
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 9,
          currency: 'USD',
          productName: 'TeachSpark Pro - Monthly Subscription',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      setPaymentData(data.paymentData);
      setWayforpayUrl(data.wayforpayUrl);

    } catch (err) {
      console.error('Payment initialization error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    if (!paymentData || !wayforpayUrl) {
      setError('Payment data not ready');
      return;
    }

    // Track payment initiation
    trackUpgradeClicked('payment_page');

    // Submit form to WayForPay
    const form = document.getElementById('wayforpay-form') as HTMLFormElement;
    if (form) {
      form.submit();
    }
  };

  const handleBack = () => {
    router.push('/create-lesson');
  };

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={64} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Підготовка платежу...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Button
        startIcon={<ArrowLeft size={18} />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Назад
      </Button>

      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Підписка TeachSpark Pro
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ my: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
              <Typography variant="h2" fontWeight="bold" color="primary">
                $9
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                / місяць
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                '20 уроків на місяць',
                'Повний експорт презентацій',
                'Кастомізація шаблонів',
                'Пріоритетна підтримка',
              ].map((feature, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Check size={24} color="#4caf50" />
                  <Typography variant="body1">{feature}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handlePayment}
            disabled={!paymentData || !!error}
            sx={{ py: 2, fontSize: '1.1rem' }}
          >
            Оформити підписку
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 2 }}
          >
            Безпечна оплата через WayForPay
          </Typography>
        </CardContent>
      </Card>

      {/* Hidden form for WayForPay */}
      {paymentData && wayforpayUrl && (
        <form
          id="wayforpay-form"
          method="post"
          action={wayforpayUrl}
          acceptCharset="utf-8"
          style={{ display: 'none' }}
        >
          <input name="merchantAccount" value={paymentData.merchantAccount} readOnly />
          <input name="merchantDomainName" value={paymentData.merchantDomainName} readOnly />
          <input name="orderReference" value={paymentData.orderReference} readOnly />
          <input name="orderDate" value={paymentData.orderDate} readOnly />
          <input name="amount" value={paymentData.amount} readOnly />
          <input name="currency" value={paymentData.currency} readOnly />
          <input name="productName[]" value={paymentData.productName[0]} readOnly />
          <input name="productCount[]" value={paymentData.productCount[0]} readOnly />
          <input name="productPrice[]" value={paymentData.productPrice[0]} readOnly />
          <input name="clientEmail" value={paymentData.clientEmail} readOnly />
          <input name="clientFirstName" value={paymentData.clientFirstName} readOnly />
          <input name="clientLastName" value={paymentData.clientLastName} readOnly />
          <input name="language" value={paymentData.language} readOnly />
          <input name="serviceUrl" value={paymentData.serviceUrl} readOnly />
          <input name="returnUrl" value={paymentData.returnUrl} readOnly />
          <input name="merchantSignature" value={paymentData.merchantSignature} readOnly />
        </form>
      )}
    </Container>
  );
}

