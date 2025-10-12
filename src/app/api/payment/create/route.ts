import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

const WAYFORPAY_MERCHANT_ACCOUNT = process.env.WAYFORPAY_MERCHANT_ACCOUNT;
const WAYFORPAY_SECRET_KEY = process.env.WAYFORPAY_SECRET_KEY;
const WAYFORPAY_DOMAIN = process.env.WAYFORPAY_DOMAIN || 'https://secure.wayforpay.com/pay';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

interface CreatePaymentRequest {
  amount: number;
  currency: string;
  productName: string;
}

/**
 * Generate WayForPay signature
 * https://wiki.wayforpay.com/view/852091
 */
function generateSignature(params: string[]): string {
  const signatureString = params.join(';');
  const hash = crypto
    .createHmac('md5', WAYFORPAY_SECRET_KEY)
    .update(signatureString)
    .digest('hex');
  return hash;
}

/**
 * POST /api/payment/create
 * Creates a WayForPay payment request
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate required environment variables
    if (!WAYFORPAY_MERCHANT_ACCOUNT || !WAYFORPAY_SECRET_KEY || !APP_URL) {
      console.error('Missing required environment variables:', {
        WAYFORPAY_MERCHANT_ACCOUNT: !!WAYFORPAY_MERCHANT_ACCOUNT,
        WAYFORPAY_SECRET_KEY: !!WAYFORPAY_SECRET_KEY,
        APP_URL: !!APP_URL,
      });
      return NextResponse.json(
        { success: false, error: 'Payment system is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: CreatePaymentRequest = await request.json();
    const { amount, currency, productName } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Generate unique order reference
    const orderReference = `TS-${user.id.substring(0, 8)}-${Date.now()}`;
    const orderDate = Math.floor(Date.now() / 1000);

    // Prepare payment data
    const paymentData = {
      merchantAccount: WAYFORPAY_MERCHANT_ACCOUNT,
      merchantDomainName: APP_URL,
      orderReference,
      orderDate,
      amount,
      currency: currency || 'USD',
      productName: [productName || 'TeachSpark Pro Subscription'],
      productCount: [1],
      productPrice: [amount],
      clientEmail: user.email || '',
      clientFirstName: user.user_metadata?.name || 'User',
      clientLastName: '',
      language: 'UA',
      serviceUrl: `${APP_URL}/api/payment/callback`,
      returnUrl: `${APP_URL}/payment/success`,
    };

    // Generate signature
    // Order matters: merchantAccount;merchantDomainName;orderReference;orderDate;amount;currency;productName;productCount;productPrice
    const signatureParams = [
      paymentData.merchantAccount,
      paymentData.merchantDomainName,
      paymentData.orderReference,
      paymentData.orderDate.toString(),
      paymentData.amount.toString(),
      paymentData.currency,
      paymentData.productName.join(';'),
      paymentData.productCount.join(';'),
      paymentData.productPrice.join(';'),
    ];

    const merchantSignature = generateSignature(signatureParams);

    // Create payment record in database
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        order_reference: orderReference,
        amount,
        currency: paymentData.currency,
        status: 'pending',
        product_name: productName,
      });

    if (dbError) {
      console.error('Failed to create payment record:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // Return payment form data
    return NextResponse.json({
      success: true,
      paymentData: {
        ...paymentData,
        merchantSignature,
      },
      wayforpayUrl: WAYFORPAY_DOMAIN,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

