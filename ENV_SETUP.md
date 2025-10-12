# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# WayForPay Payment Gateway
WAYFORPAY_MERCHANT_ACCOUNT=test_merch_n1
WAYFORPAY_SECRET_KEY=your_secret_key
WAYFORPAY_DOMAIN=https://secure.wayforpay.com/pay

# Application URL (REQUIRED for payment system)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# PostHog Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Critical Variables for Payment System

### `NEXT_PUBLIC_APP_URL` (REQUIRED)
This variable is **critical** for the payment system to work. It's used to generate:
- Payment callback URL: `${NEXT_PUBLIC_APP_URL}/api/payment/callback`
- Return URL after payment: `${NEXT_PUBLIC_APP_URL}/payment/success`

**Without this variable, you will get "TypeError: Invalid URL" errors!**

### For Local Development:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### For Production:
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Testing Payment System

After setting up environment variables, restart your dev server:

```bash
npm run dev
```

If you still see errors, check:
1. ✅ All required variables are set in `.env.local`
2. ✅ No typos in variable names
3. ✅ Dev server was restarted after adding variables
4. ✅ URLs don't have trailing slashes

## Troubleshooting

### Error: "TypeError: Invalid URL"
**Cause:** Missing or invalid `NEXT_PUBLIC_APP_URL`
**Solution:** Add `NEXT_PUBLIC_APP_URL=http://localhost:3000` to `.env.local` and restart dev server

### Error: "Payment system is not configured"
**Cause:** Missing WayForPay credentials
**Solution:** Add `WAYFORPAY_MERCHANT_ACCOUNT` and `WAYFORPAY_SECRET_KEY` to `.env.local`

