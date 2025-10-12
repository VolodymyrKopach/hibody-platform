import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

const WAYFORPAY_SECRET_KEY = process.env.WAYFORPAY_SECRET_KEY!;

interface WayForPayCallback {
  merchantAccount: string;
  orderReference: string;
  amount: number;
  currency: string;
  authCode: string;
  cardPan: string;
  transactionStatus: 'Approved' | 'Declined' | 'Pending' | 'Refunded';
  reasonCode: number;
  merchantSignature: string;
  [key: string]: any;
}

/**
 * Verify WayForPay signature
 */
function verifySignature(callback: WayForPayCallback): boolean {
  const { merchantSignature, ...params } = callback;
  
  // Build signature string according to WayForPay docs
  const signatureParams = [
    params.merchantAccount,
    params.orderReference,
    params.amount.toString(),
    params.currency,
    params.authCode || '',
    params.cardPan || '',
    params.transactionStatus,
    params.reasonCode?.toString() || '',
  ];

  const signatureString = signatureParams.join(';');
  const hash = crypto
    .createHmac('md5', WAYFORPAY_SECRET_KEY)
    .update(signatureString)
    .digest('hex');

  return hash === merchantSignature;
}

/**
 * POST /api/payment/callback
 * Handles WayForPay payment callback
 */
export async function POST(request: NextRequest) {
  try {
    const callback: WayForPayCallback = await request.json();

    // Verify signature
    if (!verifySignature(callback)) {
      console.error('Invalid WayForPay signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Find payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_reference', callback.orderReference)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', callback.orderReference);
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    const newStatus = callback.transactionStatus === 'Approved' ? 'completed' : 'failed';
    
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        transaction_id: callback.authCode,
        card_pan: callback.cardPan,
        reason_code: callback.reasonCode,
        updated_at: new Date().toISOString(),
      })
      .eq('order_reference', callback.orderReference);

    if (updateError) {
      console.error('Failed to update payment:', updateError);
    }

    // If payment approved, activate Pro subscription
    if (callback.transactionStatus === 'Approved') {
      const proExpiresAt = new Date();
      proExpiresAt.setMonth(proExpiresAt.getMonth() + 1); // 1 month subscription

      const { error: userError } = await supabase
        .from('user_profiles')
        .update({
          subscription_type: 'pro',
          subscription_expires_at: proExpiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.user_id);

      if (userError) {
        console.error('Failed to activate Pro:', userError);
      }
    }

    // Return success response to WayForPay
    return NextResponse.json({
      orderReference: callback.orderReference,
      status: 'accept',
      time: Date.now(),
    });

  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

