/**
 * Admin Panel Types
 * Types for admin functionality, user management, and system metrics
 */

// =====================================================
// Admin User Types
// =====================================================

export type AdminRole = 'admin' | 'super_admin';

export interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  // Joined user data
  email?: string;
  full_name?: string;
}

export interface CreateAdminUserRequest {
  user_id: string;
  role: AdminRole;
}

export interface UpdateAdminUserRequest {
  role: AdminRole;
}

// =====================================================
// Activity Log Types
// =====================================================

export type EntityType = 
  | 'lesson'
  | 'slide'
  | 'worksheet'
  | 'auth'
  | 'payment'
  | 'user'
  | 'subscription'
  | 'admin';

export type ActivityAction =
  // Auth actions
  | 'login'
  | 'logout'
  | 'register'
  | 'password_reset'
  | 'failed_login'
  // Content actions
  | 'lesson_created'
  | 'lesson_updated'
  | 'lesson_deleted'
  | 'slide_generated'
  | 'worksheet_created'
  | 'worksheet_updated'
  // Payment actions
  | 'subscription_started'
  | 'subscription_cancelled'
  | 'payment_succeeded'
  | 'payment_failed'
  // Admin actions
  | 'admin_created'
  | 'admin_updated'
  | 'admin_deleted'
  | 'user_blocked'
  | 'user_unblocked'
  | 'user_deleted';

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: ActivityAction | string;
  entity_type: EntityType | null;
  entity_id: string | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  // Joined user data
  user_email?: string;
  user_full_name?: string;
}

export interface CreateActivityLogRequest {
  action: ActivityAction | string;
  entity_type?: EntityType;
  entity_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export interface ActivityLogFilters {
  user_id?: string;
  action?: ActivityAction | string;
  entity_type?: EntityType;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// =====================================================
// System Metrics Types
// =====================================================

export interface SystemMetrics {
  id: string;
  date: string;
  total_users: number;
  active_users_7d: number;
  active_users_30d: number;
  new_registrations: number;
  lessons_created: number;
  slides_generated: number;
  worksheets_created: number;
  ai_requests: number;
  total_revenue: number;
  created_at: string;
}

export interface DashboardMetrics {
  // User metrics
  total_users: number;
  active_users_7d: number;
  active_users_30d: number;
  new_registrations_today: number;
  new_registrations_7d: number;
  new_registrations_30d: number;
  
  // Content metrics
  total_lessons: number;
  lessons_created_today: number;
  lessons_created_7d: number;
  lessons_created_30d: number;
  
  total_slides: number;
  slides_generated_today: number;
  slides_generated_7d: number;
  
  total_worksheets: number;
  worksheets_created_today: number;
  worksheets_created_7d: number;
  
  // AI usage
  ai_requests_today: number;
  ai_requests_7d: number;
  ai_requests_30d: number;
  
  // Revenue metrics
  total_revenue: number;
  revenue_today: number;
  revenue_7d: number;
  revenue_30d: number;
  mrr: number;
  
  // Subscription metrics
  total_subscriptions: number;
  active_subscriptions: number;
  trial_users: number;
  paid_users: number;
  
  // Growth metrics
  user_growth_rate_7d: number;
  user_growth_rate_30d: number;
  revenue_growth_rate_30d: number;
}

export interface MetricTrend {
  date: string;
  value: number;
}

export interface MetricsChartData {
  user_growth: MetricTrend[];
  lesson_creation: MetricTrend[];
  revenue: MetricTrend[];
  ai_usage: MetricTrend[];
}

// =====================================================
// User Management Types
// =====================================================

export interface UserListItem {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
  admin_role: AdminRole | null;
  
  // Activity stats
  lessons_count: number;
  slides_count: number;
  worksheets_count: number;
  last_activity_at: string | null;
  
  // Subscription info
  subscription_status: 'free' | 'trial' | 'active' | 'cancelled' | null;
  subscription_plan: string | null;
}

export interface UserDetail extends UserListItem {
  // Additional profile info
  phone: string | null;
  avatar_url: string | null;
  
  // Detailed stats
  total_ai_requests: number;
  generation_limit_used: number;
  generation_limit_total: number;
  
  // Recent activity
  recent_activities: ActivityLog[];
  
  // Payment history
  total_paid: number;
  last_payment_at: string | null;
}

export interface UserFilters {
  search?: string;
  role?: AdminRole | 'user' | 'all';
  subscription_status?: 'free' | 'trial' | 'active' | 'cancelled' | 'all';
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'last_sign_in_at' | 'lessons_count';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface UpdateUserRequest {
  full_name?: string;
  phone?: string;
  generation_limit?: number;
}

// =====================================================
// Response Types
// =====================================================

export interface AdminApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// =====================================================
// Component Props Types
// =====================================================

export interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  loading?: boolean;
}

export interface ChartProps {
  data: MetricTrend[];
  title: string;
  loading?: boolean;
}

export interface UsersTableProps {
  users: UserListItem[];
  loading?: boolean;
  onUserClick?: (userId: string) => void;
  onRefresh?: () => void;
}

export interface ActivityLogTableProps {
  activities: ActivityLog[];
  loading?: boolean;
  onRefresh?: () => void;
}

// =====================================================
// Lessons Management Types
// =====================================================

export type LessonStatus = 'draft' | 'published' | 'archived';
export type LessonDifficulty = 'easy' | 'medium' | 'hard';

export interface LessonListItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  subject: string;
  age_group: string;
  duration: number;
  status: LessonStatus;
  thumbnail_url: string | null;
  tags: string[];
  difficulty: LessonDifficulty;
  views: number;
  rating: number;
  completion_rate: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  
  // Joined data
  user_email?: string;
  user_full_name?: string;
  slides_count?: number;
  worksheets_count?: number;
}

export interface LessonDetail extends LessonListItem {
  metadata: Record<string, any>;
  lesson_plan: Record<string, any> | null;
  plan_metadata: Record<string, any> | null;
  
  // Stats
  total_views: number;
  unique_viewers: number;
  downloads_count: number;
  copies_count: number;
  shares_count: number;
  
  // Slides info
  slides: LessonSlideInfo[];
}

export interface LessonSlideInfo {
  id: string;
  slide_number: number;
  title: string;
  content: string | null;
  layout_type: string;
  created_at: string;
}

export interface LessonFilters {
  search?: string;
  user_id?: string;
  status?: LessonStatus | 'all';
  subject?: string;
  age_group?: string;
  difficulty?: LessonDifficulty | 'all';
  is_public?: boolean;
  date_from?: string;
  date_to?: string;
  min_rating?: number;
  tags?: string[];
  sort_by?: 'created_at' | 'updated_at' | 'views' | 'rating' | 'title';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  subject?: string;
  age_group?: string;
  duration?: number;
  status?: LessonStatus;
  thumbnail_url?: string;
  tags?: string[];
  difficulty?: LessonDifficulty;
  is_public?: boolean;
}

export interface LessonStats {
  total_lessons: number;
  published_lessons: number;
  draft_lessons: number;
  archived_lessons: number;
  total_views: number;
  average_rating: number;
  most_popular_subjects: { subject: string; count: number }[];
  most_popular_age_groups: { age_group: string; count: number }[];
  lessons_by_status: { status: string; count: number }[];
}

// =====================================================
// Worksheets Management Types
// =====================================================

export type WorksheetType = 
  | 'coloring'
  | 'writing'
  | 'math'
  | 'reading'
  | 'puzzle'
  | 'drawing'
  | 'other';

export interface WorksheetListItem {
  id: string;
  lesson_id: string | null;
  user_id: string;
  title: string;
  type: WorksheetType;
  age_group: string;
  thumbnail_url: string | null;
  file_url: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  
  // Joined data
  user_email?: string;
  user_full_name?: string;
  lesson_title?: string;
  downloads_count?: number;
}

export interface WorksheetDetail extends WorksheetListItem {
  description: string | null;
  metadata: Record<string, any>;
  
  // Stats
  total_downloads: number;
  views_count: number;
}

export interface WorksheetFilters {
  search?: string;
  user_id?: string;
  lesson_id?: string;
  type?: WorksheetType | 'all';
  age_group?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'updated_at' | 'downloads_count' | 'title';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface WorksheetStats {
  total_worksheets: number;
  by_type: { type: string; count: number }[];
  by_age_group: { age_group: string; count: number }[];
  total_downloads: number;
  most_downloaded: WorksheetListItem[];
}

// =====================================================
// Finance & Revenue Types
// =====================================================

export interface RevenueMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  total_revenue_30d: number;
  total_revenue_7d: number;
  revenue_today: number;
  
  // Growth
  mrr_growth_rate: number;
  revenue_growth_rate_30d: number;
  
  // By plan
  revenue_by_plan: { plan: string; revenue: number }[];
  
  // Forecasts
  projected_mrr: number;
  projected_arr: number;
}

export interface ChurnMetrics {
  churn_rate_30d: number;
  churn_rate_7d: number;
  churned_customers_30d: number;
  revenue_lost_30d: number;
  
  // Reasons
  churn_by_reason: { reason: string; count: number }[];
}

export interface ConversionMetrics {
  trial_to_paid_rate: number;
  free_to_trial_rate: number;
  free_to_paid_rate: number;
  
  // Counts
  trial_conversions_30d: number;
  trial_conversions_7d: number;
  
  // By plan
  conversions_by_plan: { plan: string; conversions: number }[];
}

export interface SubscriptionMetrics {
  total_active: number;
  total_trial: number;
  total_cancelled: number;
  total_past_due: number;
  
  // By plan
  by_plan: { plan: string; count: number; mrr: number }[];
  
  // Upcoming events
  upcoming_renewals: SubscriptionRenewal[];
  expiring_trials: SubscriptionTrial[];
}

export interface SubscriptionRenewal {
  subscription_id: string;
  user_email: string;
  plan: string;
  renewal_date: string;
  amount: number;
}

export interface SubscriptionTrial {
  subscription_id: string;
  user_email: string;
  trial_end_date: string;
  days_remaining: number;
}

export interface FailedPayment {
  id: string;
  user_id: string;
  user_email: string;
  subscription_id: string;
  amount: number;
  currency: string;
  failure_reason: string;
  failed_at: string;
  retry_count: number;
  next_retry_at: string | null;
  status: 'pending_retry' | 'failed' | 'resolved';
}

export interface FinancialTrend {
  date: string;
  mrr: number;
  revenue: number;
  new_subscriptions: number;
  cancelled_subscriptions: number;
  net_revenue: number;
}

// =====================================================
// Analytics Types
// =====================================================

export interface EngagementMetrics {
  dau: number; // Daily Active Users
  wau: number; // Weekly Active Users
  mau: number; // Monthly Active Users
  
  dau_wau_ratio: number;
  wau_mau_ratio: number;
  
  // Trends
  dau_trend: MetricTrend[];
  wau_trend: MetricTrend[];
  mau_trend: MetricTrend[];
}

export interface CohortData {
  cohort_date: string;
  cohort_size: number;
  retention_rates: {
    day_1: number;
    day_7: number;
    day_14: number;
    day_30: number;
    day_60: number;
    day_90: number;
  };
}

export interface UserSegment {
  segment_name: string;
  user_count: number;
  percentage: number;
  avg_revenue: number;
  characteristics: Record<string, any>;
}

export interface FeatureUsageData {
  feature_name: string;
  usage_count: number;
  unique_users: number;
  avg_time_spent: number;
  adoption_rate: number;
}

export interface FunnelStep {
  step_name: string;
  step_order: number;
  users_entered: number;
  users_completed: number;
  drop_off_rate: number;
  avg_time_to_complete: number;
}

export interface ContentPopularity {
  // Subjects
  popular_subjects: { subject: string; count: number; growth_rate: number }[];
  
  // Age groups
  popular_age_groups: { age_group: string; count: number; growth_rate: number }[];
  
  // Templates
  popular_templates: { template_name: string; usage_count: number }[];
  
  // Peak times
  peak_usage_hours: { hour: number; usage_count: number }[];
  peak_usage_days: { day: string; usage_count: number }[];
}

// =====================================================
// Settings Types
// =====================================================

export interface PlatformSettings {
  maintenance_mode: boolean;
  registration_enabled: boolean;
  ai_generation_enabled: boolean;
  default_generation_limit: number;
  max_generation_limit: number;
  
  // AI Models
  default_ai_model: string;
  available_ai_models: string[];
  
  // Features
  feature_flags: Record<string, boolean>;
}

export interface GenerationLimitConfig {
  plan: string;
  daily_limit: number;
  monthly_limit: number;
  slide_generation_cost: number;
  worksheet_generation_cost: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: 'welcome' | 'trial' | 'subscription' | 'notification' | 'marketing';
  created_at: string;
  updated_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_from: string;
  valid_until: string;
  max_uses: number;
  current_uses: number;
  applicable_plans: string[];
  is_active: boolean;
  created_at: string;
}

