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

