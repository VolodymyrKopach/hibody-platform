# Admin Panel - Real Data Implementation Plan

## 📋 Overview
Replace mock data in admin panel with real data from database.

**Payment System:** WayForPay  
**Plans:** 
- Free: 3 generations
- Professional: $9 for 20 generations

---

## 🎯 Phase 1: Database Schema (Foundation)
**Goal:** Create all necessary tables and structures

### 1.1 Activity Log Table ⭐ CRITICAL
**File:** `supabase/migrations/20251013_create_activity_log.sql`

**Purpose:** Track all user actions for analytics

**Schema:**
```sql
- id (UUID)
- user_id (UUID, FK to user_profiles)
- action (TEXT) - lesson_created, slide_generated, worksheet_created, 
                  payment_succeeded, payment_failed, subscription_started, 
                  subscription_cancelled, login, logout, etc.
- entity_type (TEXT) - lesson, slide, worksheet, payment, subscription
- entity_id (UUID) - ID of related entity
- metadata (JSONB) - flexible data (amount, plan, duration, etc.)
- ip_address (TEXT)
- user_agent (TEXT)
- created_at (TIMESTAMP)
```

**Indexes:**
- user_id
- action
- entity_type
- created_at (DESC)
- (user_id, created_at) - for user timeline

### 1.2 User Activity Stats Table
**File:** `supabase/migrations/20251013_create_user_activity_stats.sql`

**Purpose:** Pre-calculated daily/weekly/monthly stats

**Schema:**
```sql
- id (UUID)
- user_id (UUID, FK)
- date (DATE)
- period_type (TEXT) - daily, weekly, monthly
- lessons_created (INTEGER)
- slides_generated (INTEGER)
- worksheets_created (INTEGER)
- time_spent_minutes (INTEGER)
- last_activity_at (TIMESTAMP)
- created_at (TIMESTAMP)
- UNIQUE(user_id, date, period_type)
```

### 1.3 User Cohorts Table
**File:** `supabase/migrations/20251013_create_user_cohorts.sql`

**Purpose:** Track user retention by registration cohort

**Schema:**
```sql
- id (UUID)
- cohort_date (DATE) - YYYY-MM-DD (first day of month)
- user_id (UUID, FK)
- registration_date (DATE)
- first_lesson_date (DATE)
- first_payment_date (DATE)
- days_to_first_lesson (INTEGER)
- days_to_first_payment (INTEGER)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

### 1.4 Platform Settings Table
**File:** `supabase/migrations/20251013_create_platform_settings.sql`

**Purpose:** Store global platform configuration

**Schema:**
```sql
- id (UUID)
- setting_key (TEXT UNIQUE) - maintenance_mode, ai_model, etc.
- setting_value (JSONB)
- setting_type (TEXT) - boolean, string, number, json
- description (TEXT)
- updated_by (UUID, FK to user_profiles)
- updated_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

### 1.5 Update Payments Table
**File:** `supabase/migrations/20251013_update_payments_table.sql`

**Purpose:** Add WayForPay specific fields

**Add columns:**
```sql
- payment_system (TEXT) - wayforpay
- subscription_id (UUID, FK to subscriptions if needed)
- plan_type (TEXT) - free, professional
- generations_granted (INTEGER)
- metadata (JSONB) - WayForPay response data
```

---

## 🎯 Phase 2: Backend Services & APIs
**Goal:** Create server-side logic for data retrieval

### 2.1 Activity Tracking Service
**File:** `src/services/activityTrackingService.ts`

**Methods:**
- `trackAction(userId, action, entityType, entityId, metadata)`
- `getUserActivity(userId, fromDate, toDate)`
- `getSystemActivity(fromDate, toDate)`

### 2.2 Analytics Service APIs
**Files:**
- `src/app/api/admin/analytics/engagement/route.ts`
- `src/app/api/admin/analytics/cohorts/route.ts`
- `src/app/api/admin/analytics/user-segments/route.ts`
- `src/app/api/admin/analytics/feature-usage/route.ts`
- `src/app/api/admin/analytics/content-popularity/route.ts`

**Each endpoint returns real data from:**
- activity_log
- user_activity_stats
- user_cohorts
- lessons, slides, worksheets tables

### 2.3 Finance Service APIs
**Files:**
- `src/app/api/admin/finance/revenue/route.ts`
- `src/app/api/admin/finance/churn/route.ts`
- `src/app/api/admin/finance/conversions/route.ts`
- `src/app/api/admin/finance/subscriptions/route.ts`
- `src/app/api/admin/finance/trends/route.ts`

**Data sources:**
- payments table
- user_profiles (subscription data)
- activity_log (subscription events)

### 2.4 Settings Service APIs
**Files:**
- `src/app/api/admin/settings/platform/route.ts`
- `src/app/api/admin/settings/generation-limits/route.ts`
- `src/app/api/admin/settings/email-templates/route.ts` (future)
- `src/app/api/admin/settings/promo-codes/route.ts` (future)

---

## 🎯 Phase 3: Update Frontend Services
**Goal:** Replace mock implementations with API calls

### 3.1 Finance Service
**File:** `src/services/admin/financeService.ts`

**Replace methods:**
- `getRevenueMetrics()` → API call
- `getChurnMetrics()` → API call
- `getConversionMetrics()` → API call
- `getSubscriptionMetrics()` → API call
- `getFinancialTrends()` → API call

### 3.2 Analytics Service
**File:** `src/services/admin/analyticsService.ts`

**Replace methods:**
- `getEngagementMetrics()` → API call
- `getCohortAnalysis()` → API call
- `getUserSegments()` → API call
- `getFeatureUsage()` → API call
- `getContentPopularity()` → API call

### 3.3 Settings Service
**File:** `src/services/admin/settingsService.ts`

**Replace methods:**
- `getPlatformSettings()` → API call
- `updatePlatformSettings()` → API call
- `getGenerationLimitConfigs()` → hardcoded (free: 3, pro: 20)

---

## 🎯 Phase 4: Integration with Existing Systems
**Goal:** Connect activity tracking to existing flows

### 4.1 Track Lesson Creation
**File:** `src/app/api/lessons/route.ts` (or wherever lessons are created)

**Add:** `activityTrackingService.trackAction()` after lesson creation

### 4.2 Track Slide Generation
**File:** `src/app/api/slides/generate/route.ts`

**Add:** Activity tracking

### 4.3 Track Worksheet Creation
**File:** `src/app/api/worksheets/route.ts`

**Add:** Activity tracking

### 4.4 Track Payments
**File:** `src/app/api/payment/callback/route.ts` (WayForPay webhook)

**Add:** 
- Activity tracking
- Payment record creation
- Subscription update

### 4.5 Track User Sessions
**Middleware:** `middleware.ts`

**Add:** Track login/logout events

---

## 🎯 Phase 5: Background Jobs & Calculations
**Goal:** Pre-calculate heavy analytics data

### 5.1 Daily Stats Aggregation
**File:** `src/services/jobs/aggregateDailyStats.ts`

**Purpose:** Calculate DAU/WAU/MAU daily

**Schedule:** Run daily at 00:00 UTC

### 5.2 Cohort Calculation
**File:** `src/services/jobs/calculateCohorts.ts`

**Purpose:** Update retention rates

**Schedule:** Run weekly

### 5.3 Financial Reports
**File:** `src/services/jobs/generateFinancialReports.ts`

**Purpose:** Calculate MRR, ARR, churn

**Schedule:** Run daily

---

## 📊 Implementation Order

### Sprint 1 (Day 1-2): Foundation
1. ✅ Create activity_log table
2. ✅ Create user_activity_stats table
3. ✅ Create user_cohorts table
4. ✅ Create platform_settings table
5. ✅ Update payments table
6. ✅ Create activityTrackingService

### Sprint 2 (Day 3-4): Finance Module
1. ✅ Create finance API endpoints
2. ✅ Update financeService to use APIs
3. ✅ Test finance dashboard with real data
4. ✅ Integrate payment tracking

### Sprint 3 (Day 5-6): Analytics Module
1. ✅ Create analytics API endpoints
2. ✅ Update analyticsService to use APIs
3. ✅ Test analytics dashboard
4. ✅ Create engagement tracking

### Sprint 4 (Day 7-8): Settings Module
1. ✅ Create settings API endpoints
2. ✅ Update settingsService to use APIs
3. ✅ Test settings page
4. ✅ Add platform configuration

### Sprint 5 (Day 9-10): Integration & Jobs
1. ✅ Integrate tracking across the app
2. ✅ Create background jobs
3. ✅ Set up cron jobs (if using Vercel Cron or similar)
4. ✅ Testing & optimization

---

## 🎯 Key Metrics to Track

### User Engagement
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Monthly Active Users (MAU)
- Average session duration
- Actions per session

### Content Creation
- Lessons created per day/week/month
- Slides generated per day/week/month
- Worksheets created per day/week/month
- Most popular subjects
- Most popular age groups

### Financial
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Churn rate
- Free → Professional conversion rate
- Average revenue per user (ARPU)
- Customer Lifetime Value (LTV)

### Retention
- Day 1, 7, 14, 30, 60, 90 retention
- Cohort analysis by month
- Time to first lesson
- Time to first payment

---

## 🔧 Technical Considerations

### Performance
- Use database indexes on frequently queried columns
- Pre-calculate heavy metrics in background jobs
- Cache frequently accessed data
- Use pagination for large datasets

### Privacy & Security
- Anonymize user data in analytics
- Admin-only access to sensitive data
- Audit log for admin actions
- GDPR compliance for user data

### Scalability
- Use materialized views for complex queries
- Partition large tables by date
- Archive old data
- Use connection pooling

---

## 📝 Next Steps

1. **Approve this plan**
2. **Start with Sprint 1** - Create database tables
3. **Implement incrementally** - Test each phase before moving forward
4. **Deploy gradually** - Enable features one by one

---

## 💡 Notes

- All dates in UTC
- All money amounts in cents (to avoid floating point issues)
- Use JSONB for flexible metadata
- Keep activity_log forever (for historical analysis)
- Archive user_activity_stats older than 2 years
- WayForPay webhook must be secured with signature verification


