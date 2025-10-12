# 💰 Monetization MVP Implementation

## Overview

This document describes the implementation of the Trial + Soft Paywall monetization model for TeachSpark platform.

## Model: Trial + Soft Paywall

Users get **3 free lesson generations**, then are presented with a soft paywall offering Pro subscription for **$9/month**.

---

## 📁 Files Created/Modified

### Database Migrations

1. **`supabase/migrations/012_add_subscription_fields.sql`**
   - Adds subscription tracking fields to `users` table:
     - `generation_count` - Total lessons generated
     - `is_pro` - Pro subscription status
     - `pro_expires_at` - Subscription expiration date
     - `last_generation_at` - Last generation timestamp

2. **`supabase/migrations/013_add_increment_function.sql`**
   - Database function `increment_generation_count()` for safely updating counts

3. **`supabase/migrations/014_create_payments_table.sql`**
   - `payments` table for transaction history
   - RLS policies for security
   - Indexes for performance

### Hooks

4. **`src/hooks/useGenerationLimit.ts`**
   - Hook for managing generation limits
   - Returns: `count`, `canGenerate`, `isPro`, `incrementCount()`

5. **`src/hooks/useAnalytics.ts`** (updated)
   - Added monetization tracking events:
     - `trackGenerateLesson()`
     - `trackPaywallOpened()`
     - `trackUpgradeClicked()`
     - `trackPaymentCompleted()`
     - `trackGenerateAfterPaywall()`

### Components

6. **`src/components/dialogs/PaywallModal.tsx`**
   - Beautiful paywall modal with $9/month pricing
   - Shows generation count and Pro features
   - Fully responsive design

7. **`src/components/templates/steps/Step2PlanGeneration.tsx`** (updated)
   - Integrated paywall logic
   - Generation limit checking
   - Analytics tracking
   - Shows paywall after 3rd generation

### API Routes

8. **`src/app/api/payment/create/route.ts`**
   - Creates WayForPay payment request
   - Generates secure signature
   - Creates payment record in DB

9. **`src/app/api/payment/callback/route.ts`**
   - Handles WayForPay callback
   - Verifies signature
   - Updates payment status
   - Activates Pro subscription

### Pages

10. **`src/app/payment/page.tsx`**
    - Payment page with Pro features list
    - WayForPay form integration
    - Loading and error states

11. **`src/app/payment/success/page.tsx`**
    - Success page after payment
    - Tracks completion
    - Redirects to lesson creation

### Account Page

12. **`src/components/account/SubscriptionSection.tsx`**
    - New tab on Account page
    - Shows subscription status
    - Displays generation usage
    - Payment history table
    - Upgrade CTA for Free users

13. **`src/app/api/user/subscription/route.ts`**
    - API endpoint for subscription data
    - Returns subscription info + payments

14. **`src/app/account/page.tsx`** (updated)
    - Added "Subscription" tab
    - Integration with new SubscriptionSection

15. **`src/app/api/user/stats/route.ts`** (updated)
    - Added generation_count to stats
    - Shows in Stats tab

---

## 👤 Account Page Integration

Users can now view their subscription status and usage in `/account`:

### Subscription Tab Features:

**For Free Users:**
- Current usage (e.g., "2 / 3 generations")
- Progress bar visualization  
- Pro features list
- Upgrade button → `/payment`

**For Pro Users:**
- "TeachSpark Pro 🎉" badge
- Days remaining until expiration
- Total generations count (unlimited)
- Payment history table

**Both:**
- Real-time generation count
- Subscription expiration date
- Can upgrade/renew from this page

### How to Access:
```
/account → "Підписка" tab
```

---

## 🔧 Environment Variables

Add to your `.env.local`:

```bash
# WayForPay Configuration
WAYFORPAY_MERCHANT_ACCOUNT=your_merchant_account
WAYFORPAY_SECRET_KEY=your_secret_key
WAYFORPAY_DOMAIN=https://secure.wayforpay.com/pay

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 🚀 How It Works

### User Flow

1. **First 3 Generations (Free Trial)**
   ```
   User creates lesson → Count increments → Success
   ```

2. **After 3rd Generation**
   ```
   User creates lesson → Paywall appears → User sees:
   - "You created 3 awesome lessons! 🎉"
   - Pro features list
   - $9/month pricing
   ```

3. **User Clicks "Upgrade"**
   ```
   Redirect to /payment → WayForPay form → Payment
   → Callback → Pro activated → Redirect to /payment/success
   ```

4. **Pro User**
   ```
   Unlimited generations → No paywall → Analytics tracked
   ```

### Analytics Events

All events are tracked via PostHog:

- `generate_lesson` - Every generation attempt
- `open_paywall` - When paywall is shown
- `click_upgrade` - When user clicks upgrade
- `complete_payment` - Successful payment
- `generate_after_paywall` - Generation after seeing paywall

---

## 📊 Conversion Funnel

Track these metrics in PostHog:

```
Total Users
  ↓
Generated 1st lesson (%)
  ↓
Generated 2nd lesson (%)
  ↓
Generated 3rd lesson (%)
  ↓
Saw Paywall (%)
  ↓
Clicked Upgrade (%)
  ↓
Completed Payment (%)
```

### Key Metrics to Monitor

- **Activation Rate**: % who generate 1st lesson
- **Engagement Rate**: % who reach 3 generations
- **Paywall View Rate**: % who see paywall
- **Conversion Rate**: % who complete payment
- **Target**: 1-2% conversion on MVP

---

## 🔒 Security

1. **Database Security**
   - RLS policies on `users` and `payments` tables
   - Service role for payment callbacks
   - User can only see own data

2. **Payment Security**
   - HMAC-MD5 signature verification
   - Signature checked on callback
   - Transaction ID validation

3. **API Security**
   - Authentication required for payment creation
   - Signature verification on callbacks
   - Error handling without data leaks

---

## 🧪 Testing Checklist

### Database
- [ ] Run migrations: `npm run migrate` (or Supabase CLI)
- [ ] Verify `users` table has new columns
- [ ] Test `increment_generation_count()` function
- [ ] Check `payments` table exists

### Frontend
- [ ] Create 1st lesson → No paywall
- [ ] Create 2nd lesson → No paywall
- [ ] Create 3rd lesson → Paywall appears ✓
- [ ] Click "Upgrade" → Redirects to payment
- [ ] Payment page loads correctly
- [ ] Pro user → No limits

### Analytics
- [ ] Open PostHog dashboard
- [ ] Verify events are firing:
  - `generate_lesson`
  - `open_paywall`
  - `click_upgrade`

### Payment (Sandbox)
- [ ] WayForPay sandbox configured
- [ ] Payment form submits
- [ ] Callback received
- [ ] Pro status activated
- [ ] Success page shows

---

## 🐛 Common Issues

### Issue: Paywall not showing after 3 generations

**Solution**: Check `generation_count` in database:
```sql
SELECT id, email, generation_count, is_pro 
FROM users 
WHERE email = 'user@example.com';
```

### Issue: Payment callback not working

**Solution**: 
1. Check WayForPay webhook URL in dashboard
2. Verify `WAYFORPAY_SECRET_KEY` is correct
3. Check logs: `console.log` in callback route

### Issue: Pro not activated after payment

**Solution**: Check `payments` table:
```sql
SELECT * FROM payments 
WHERE user_id = 'user-uuid' 
ORDER BY created_at DESC;
```

---

## 📈 Next Steps (Post-MVP)

After validating the model:

1. **A/B Testing**
   - Test $7 vs $9 pricing
   - Test different paywall copy
   - Test showing paywall at 2nd vs 3rd generation

2. **Additional Features**
   - Email reminders for inactive users
   - Referral program ("+2 free generations")
   - Annual plan ($20/3 months)

3. **Retention**
   - Monitor churn rate
   - Add usage analytics dashboard for users
   - Send usage tips via email

4. **Scale**
   - Add payment provider redundancy
   - Implement webhook retries
   - Add admin dashboard for payments

---

## 🎯 Success Criteria

**Week 1-2:**
- ✅ 10+ users reach paywall
- ✅ 1-2% conversion rate
- ✅ No critical bugs

**If successful:**
- Continue with current model
- Add more payment options
- Implement email campaigns

**If not converting:**
- Review funnel drop-off points
- Test different pricing
- Interview users who dismissed paywall

---

## 📞 Support

For questions or issues:
1. Check this documentation first
2. Review code comments
3. Check PostHog analytics
4. Review WayForPay documentation

---

## 🔗 Useful Links

- [WayForPay API Docs](https://wiki.wayforpay.com)
- [PostHog Events API](https://posthog.com/docs/api)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Implementation Date**: October 12, 2025  
**Version**: 1.0.0 (MVP)  
**Status**: ✅ Ready for Testing

