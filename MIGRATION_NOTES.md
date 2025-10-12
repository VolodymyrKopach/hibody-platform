# 📝 Migration Notes for user_profiles

## Existing Structure

Your database already has `user_profiles` table with:
- ✅ `subscription_type` (text) - will use 'free' or 'pro'
- ✅ `subscription_expires_at` (timestamptz) - already exists

## What We're Adding

Only these 2 new fields:
- 🆕 `generation_count` (integer, default 0)
- 🆕 `last_generation_at` (timestamptz, nullable)

## Migration Order

Run migrations in this exact order:

### 1. Add new fields to user_profiles
```bash
# Execute: supabase/migrations/012_add_subscription_fields.sql
```

This adds:
- `generation_count` column
- `last_generation_at` column
- Indexes for performance

### 2. Create increment function
```bash
# Execute: supabase/migrations/013_add_increment_function.sql
```

This creates function to safely update generation count.

### 3. Create payments table
```bash
# Execute: supabase/migrations/014_create_payments_table.sql
```

This creates new `payments` table linked to `user_profiles`.

## Subscription Logic

### Free Users
```sql
subscription_type = 'free' OR subscription_type IS NULL
generation_count < 3  -- can generate
generation_count >= 3 -- paywall shows
```

### Pro Users
```sql
subscription_type = 'pro'
AND subscription_expires_at > NOW()
-- unlimited generations
```

## Testing Queries

### Check user status
```sql
SELECT 
  id,
  email,
  full_name,
  subscription_type,
  subscription_expires_at,
  generation_count,
  last_generation_at
FROM user_profiles
WHERE email = 'test@example.com';
```

### Reset for testing
```sql
-- Reset generation count
UPDATE user_profiles 
SET generation_count = 0 
WHERE email = 'test@example.com';

-- Make user Pro
UPDATE user_profiles 
SET 
  subscription_type = 'pro',
  subscription_expires_at = NOW() + INTERVAL '1 month'
WHERE email = 'test@example.com';

-- Make user Free
UPDATE user_profiles 
SET 
  subscription_type = 'free',
  subscription_expires_at = NULL
WHERE email = 'test@example.com';
```

### Check payments
```sql
SELECT 
  p.order_reference,
  p.amount,
  p.currency,
  p.status,
  p.created_at,
  up.email
FROM payments p
JOIN user_profiles up ON p.user_id = up.id
ORDER BY p.created_at DESC;
```

## Code Changes Summary

All references to `users` table changed to `user_profiles`:
- ✅ `useGenerationLimit.ts` - queries user_profiles
- ✅ `payment/callback/route.ts` - updates subscription_type
- ✅ All migrations reference user_profiles

Fields mapping:
- `is_pro` → `subscription_type = 'pro'`
- `pro_expires_at` → `subscription_expires_at`

## Rollback (if needed)

```sql
-- Remove new columns
ALTER TABLE user_profiles 
DROP COLUMN IF EXISTS generation_count,
DROP COLUMN IF EXISTS last_generation_at;

-- Drop function
DROP FUNCTION IF EXISTS increment_generation_count(UUID);

-- Drop payments table
DROP TABLE IF EXISTS payments;
```

---

**Ready to migrate?** Follow the Quick Start guide! 🚀

