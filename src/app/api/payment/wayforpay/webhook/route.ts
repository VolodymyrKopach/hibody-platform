/**
 * WayForPay Webhook Handler
 * POST /api/payment/wayforpay/webhook
 * 
 * Handles payment notifications from WayForPay
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

interface WayForPayWebhookData {
  merchantAccount: string;
  orderReference: string;
  amount: string;
  currency: string;
  authCode?: string;
  email?: string;
  phone?: string;
  createdDate: string;
  processingDate: string;
  cardPan?: string;
  cardType?: string;
  issuerBankCountry?: string;
  issuerBankName?: string;
  recToken?: string;
  transactionStatus: string;
  reason?: string;
  reasonCode?: string;
  fee?: string;
  paymentSystem?: string;
  acquirerBankName?: string;
  cardProduct?: string;
  clientName?: string;
  merchantSignature: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const data: WayForPayWebhookData = await request.json();

    console.log('WayForPay webhook received:', {
      orderReference: data.orderReference,
      status: data.transactionStatus,
      amount: data.amount,
    });

    // Verify signature
    const merchantSecret = process.env.WAYFORPAY_SECRET_KEY || '';
    const isValid = verifySignature(data, merchantSecret);

    if (!isValid) {
      console.error('Invalid WayForPay signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Extract user_id from order_reference
    // Expected format: "user_id-timestamp" or similar
    const orderParts = data.orderReference.split('-');
    const userId = orderParts[0];

    // Determine plan type and generations based on amount
    // $9 = professional plan with 20 generations
    const amount = parseFloat(data.amount);
    let planType = 'free';
    let generations = 0;

    if (amount >= 9) {
      planType = 'professional';
      generations = 20;
    }

    // Handle different transaction statuses
    let paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' = 'pending';

    switch (data.transactionStatus) {
      case 'Approved':
        paymentStatus = 'completed';
        break;
      case 'Declined':
      case 'Expired':
        paymentStatus = 'failed';
        break;
      case 'Refunded':
        paymentStatus = 'refunded';
        break;
      default:
        paymentStatus = 'pending';
    }

    // Create or update payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .upsert({
        user_id: userId,
        order_reference: data.orderReference,
        amount: parseFloat(data.amount),
        currency: data.currency,
        status: paymentStatus,
        payment_system: 'wayforpay',
        plan_type: planType,
        generations_granted: generations,
        wayforpay_order_id: data.orderReference,
        transaction_id: data.authCode || null,
        payment_method: data.cardType || null,
        customer_email: data.email || null,
        customer_phone: data.phone || null,
        raw_response: data as any,
        webhook_received_at: new Date().toISOString(),
      }, {
        onConflict: 'order_reference',
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // If payment is completed, process subscription update
    if (paymentStatus === 'completed') {
      // Get current user subscription
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('subscription_type, generation_count')
        .eq('id', userId)
        .single();

      if (userProfile) {
        const currentGenerations = userProfile.generation_count || 0;
        const newGenerations = currentGenerations + generations;

        // Update user profile
        await supabase
          .from('user_profiles')
          .update({
            subscription_type: planType,
            generation_count: newGenerations,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        // Create subscription history record
        await supabase
          .from('subscription_history')
          .insert({
            user_id: userId,
            payment_id: payment.id,
            previous_type: userProfile.subscription_type,
            new_type: planType,
            change_reason: 'payment_received',
            previous_generations: currentGenerations,
            new_generations: newGenerations,
            generations_added: generations,
          });

        // Track activity
        await supabase
          .from('activity_log')
          .insert({
            user_id: userId,
            action: 'payment_succeeded',
            entity_type: 'payment',
            entity_id: payment.id,
            metadata: {
              amount: parseFloat(data.amount),
              currency: data.currency,
              plan: planType,
              generations: generations,
            },
          });

        // Track subscription change if type changed
        if (userProfile.subscription_type !== planType) {
          await supabase
            .from('activity_log')
            .insert({
              user_id: userId,
              action: 'subscription_started',
              entity_type: 'subscription',
              metadata: {
                from: userProfile.subscription_type,
                to: planType,
                generations: generations,
              },
            });
        }
      }
    }

    // Return success response to WayForPay
    return NextResponse.json({
      orderReference: data.orderReference,
      status: 'accept',
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing WayForPay webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Verify WayForPay signature
 */
function verifySignature(data: WayForPayWebhookData, secretKey: string): boolean {
  try {
    // WayForPay signature format:
    // merchantAccount;orderReference;amount;currency;authCode;cardPan;transactionStatus;reasonCode
    const signatureString = [
      data.merchantAccount,
      data.orderReference,
      data.amount,
      data.currency,
      data.authCode || '',
      data.cardPan || '',
      data.transactionStatus,
      data.reasonCode || '',
    ].join(';');

    const hash = crypto
      .createHmac('md5', secretKey)
      .update(signatureString)
      .digest('hex');

    return hash === data.merchantSignature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

