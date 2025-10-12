'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Divider,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Crown,
  Zap,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useGenerationLimit } from '@/hooks/useGenerationLimit';

interface Payment {
  id: string;
  order_reference: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

interface SubscriptionData {
  subscription_type: string;
  subscription_expires_at: string | null;
  generation_count: number;
  payments: Payment[];
}

const SubscriptionSection: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation(['account', 'common']);
  const { count, limit, isPro, canGenerate, isLoading: limitLoading } = useGenerationLimit();
  
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/subscription');
      const data = await response.json();

      if (data.success) {
        setSubscriptionData(data.data);
      } else {
        setError(data.error || 'Failed to load subscription data');
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffInMs = expires.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    return diffInDays > 0 ? diffInDays : 0;
  };

  const handleUpgrade = () => {
    router.push('/payment');
  };

  if (isLoading || limitLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const daysRemaining = subscriptionData?.subscription_expires_at 
    ? getDaysRemaining(subscriptionData.subscription_expires_at)
    : null;

  const generationProgress = Math.min((count / limit) * 100, 100);

  return (
    <Box sx={{ p: 3 }}>
      {/* Subscription Status Card */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          background: isPro
            ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.1)})`
            : `linear-gradient(135deg, ${alpha(theme.palette.grey[300], 0.1)}, ${alpha(theme.palette.grey[100], 0.1)})`,
          border: `2px solid ${isPro ? theme.palette.warning.main : theme.palette.grey[300]}`,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isPro ? (
                <Crown size={32} color={theme.palette.warning.main} />
              ) : (
                <Zap size={32} color={theme.palette.grey[500]} />
              )}
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {isPro ? t('account:subscription.proPlan') : t('account:subscription.freePlan')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isPro
                    ? `${t('account:subscription.activeUntil')} ${formatDate(subscriptionData?.subscription_expires_at || null)}`
                    : t('account:subscription.limitation')}
                </Typography>
              </Box>
            </Box>

            {isPro ? (
              <Chip
                label={`${daysRemaining} ${t('account:subscription.days')}`}
                color="success"
                icon={<CheckCircle size={16} />}
              />
            ) : (
              <Button
                variant="contained"
                startIcon={<Crown size={20} />}
                onClick={handleUpgrade}
                sx={{ minWidth: 160 }}
              >
                {t('account:subscription.upgradeToPro')}
              </Button>
            )}
          </Box>

          {isPro && (
            <Alert severity="success" icon={<CheckCircle size={20} />}>
              <strong>{t('account:subscription.unlimitedGenerations')}</strong> {t('account:subscription.unlimitedDescription')}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generation Usage Card */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TrendingUp size={24} color={theme.palette.primary.main} />
            <Typography variant="h6" sx={{ ml: 2, fontWeight: 600 }}>
              {t('account:subscription.generationUsage')}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {isPro ? t('account:subscription.generatedLessons') : t('account:subscription.usedGenerations')}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {count} {isPro ? '' : `/ ${limit}`}
              </Typography>
            </Box>

            {!isPro && (
              <LinearProgress
                variant="determinate"
                value={generationProgress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    backgroundColor:
                      generationProgress >= 100
                        ? theme.palette.error.main
                        : generationProgress >= 66
                        ? theme.palette.warning.main
                        : theme.palette.success.main,
                  },
                }}
              />
            )}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
              mt: 3,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('account:subscription.totalGenerated')}
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {count}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(
                  canGenerate ? theme.palette.success.main : theme.palette.error.main,
                  0.05
                ),
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('account:subscription.status')}
              </Typography>
              <Chip
                label={canGenerate ? t('account:subscription.canGenerate') : t('account:subscription.limitReached')}
                color={canGenerate ? 'success' : 'error'}
                icon={canGenerate ? <CheckCircle size={16} /> : <XCircle size={16} />}
              />
            </Box>
          </Box>

          {!isPro && !canGenerate && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              <strong>{t('account:subscription.limitReachedTitle')}</strong>
              <br />
              {t('account:subscription.limitReachedDescription')}
              <Button
                variant="contained"
                size="small"
                onClick={handleUpgrade}
                sx={{ mt: 2 }}
                endIcon={<ArrowRight size={16} />}
              >
                {t('account:subscription.getProButton')}
              </Button>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Pro Features Card */}
      {!isPro && (
        <Card sx={{ mb: 3, borderRadius: 3, border: `2px solid ${theme.palette.primary.main}` }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Crown size={24} color={theme.palette.warning.main} />
              <Typography variant="h6" sx={{ ml: 2, fontWeight: 600 }}>
                {t('account:subscription.proFeatures')}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              {[
                t('account:subscription.feature1'),
                t('account:subscription.feature2'),
                t('account:subscription.feature3'),
                t('account:subscription.feature4'),
              ].map((feature, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircle size={20} color={theme.palette.success.main} />
                  <Typography variant="body1">{feature}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
              <Typography variant="h3" fontWeight="bold" color="primary">
                $9
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                {t('account:subscription.perMonth')}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleUpgrade}
              startIcon={<Crown size={20} />}
            >
              {t('account:subscription.getProSubscription')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      {subscriptionData?.payments && subscriptionData.payments.length > 0 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Clock size={24} color={theme.palette.primary.main} />
              <Typography variant="h6" sx={{ ml: 2, fontWeight: 600 }}>
                {t('account:subscription.paymentHistory')}
              </Typography>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('account:subscription.date')}</TableCell>
                    <TableCell>{t('account:subscription.orderNumber')}</TableCell>
                    <TableCell align="right">{t('account:subscription.amount')}</TableCell>
                    <TableCell align="center">{t('account:subscription.paymentStatus')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscriptionData.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.created_at)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {payment.order_reference}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          ${payment.amount} {payment.currency}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={payment.status}
                          size="small"
                          color={
                            payment.status === 'completed'
                              ? 'success'
                              : payment.status === 'pending'
                              ? 'warning'
                              : 'error'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default SubscriptionSection;

