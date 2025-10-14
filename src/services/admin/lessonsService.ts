/**
 * Admin Lessons Service
 * Service for managing lessons in admin panel
 */

import { createClient } from '@/lib/supabase/client';
import type {
  LessonListItem,
  LessonDetail,
  LessonFilters,
  LessonStats,
  UpdateLessonRequest,
  PaginatedResponse,
  AdminApiResponse,
} from '@/types/admin';

class LessonsService {
  /**
   * Get paginated list of lessons with filters
   */
  async getLessons(filters: LessonFilters = {}): Promise<PaginatedResponse<LessonListItem>> {
    const supabase = createClient();
    
    const {
      search,
      user_id,
      status,
      subject,
      age_group,
      difficulty,
      is_public,
      date_from,
      date_to,
      min_rating,
      tags,
      sort_by = 'created_at',
      sort_order = 'desc',
      limit = 20,
      offset = 0,
    } = filters;

    let query = supabase
      .from('lessons')
      .select(
        `
        *,
        user_profiles!inner(email, full_name),
        slides(count)
        `,
        { count: 'exact' }
      );

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,subject.ilike.%${search}%`);
    }

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (subject) {
      query = query.eq('subject', subject);
    }

    if (age_group) {
      query = query.eq('age_group', age_group);
    }

    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }

    if (typeof is_public === 'boolean') {
      query = query.eq('is_public', is_public);
    }

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    if (min_rating) {
      query = query.gte('rating', min_rating);
    }

    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    // Sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching lessons:', error);
      throw new Error('Failed to fetch lessons');
    }

    // Transform data
    const lessons: LessonListItem[] = (data || []).map((lesson: any) => ({
      id: lesson.id,
      user_id: lesson.user_id,
      title: lesson.title,
      description: lesson.description,
      subject: lesson.subject,
      age_group: lesson.age_group,
      duration: lesson.duration,
      status: lesson.status,
      thumbnail_url: lesson.thumbnail_url,
      tags: lesson.tags || [],
      difficulty: lesson.difficulty,
      views: lesson.views || 0,
      rating: lesson.rating || 0,
      completion_rate: lesson.completion_rate || 0,
      is_public: lesson.is_public,
      created_at: lesson.created_at,
      updated_at: lesson.updated_at,
      user_email: lesson.user_profiles?.email,
      user_full_name: lesson.user_profiles?.full_name,
      slides_count: Array.isArray(lesson.slides) ? lesson.slides.length : lesson.slides?.[0]?.count || 0,
    }));

    return {
      data: lessons,
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  }

  /**
   * Get detailed lesson information
   */
  async getLessonDetail(lessonId: string): Promise<LessonDetail> {
    const supabase = createClient();

    const { data: lesson, error } = await supabase
      .from('lessons')
      .select(
        `
        *,
        user_profiles!inner(email, full_name),
        slides(
          id,
          slide_number,
          title,
          content,
          layout_type,
          created_at
        )
        `
      )
      .eq('id', lessonId)
      .single();

    if (error || !lesson) {
      console.error('Error fetching lesson detail:', error);
      throw new Error('Failed to fetch lesson detail');
    }

    // Get additional stats (you can expand this with actual queries)
    const stats = {
      total_views: lesson.views || 0,
      unique_viewers: 0, // TODO: Implement unique viewers tracking
      downloads_count: 0, // TODO: Implement downloads tracking
      copies_count: 0, // TODO: Implement copies tracking
      shares_count: 0, // TODO: Implement shares tracking
    };

    return {
      id: lesson.id,
      user_id: lesson.user_id,
      title: lesson.title,
      description: lesson.description,
      subject: lesson.subject,
      age_group: lesson.age_group,
      duration: lesson.duration,
      status: lesson.status,
      thumbnail_url: lesson.thumbnail_url,
      tags: lesson.tags || [],
      difficulty: lesson.difficulty,
      views: lesson.views || 0,
      rating: lesson.rating || 0,
      completion_rate: lesson.completion_rate || 0,
      is_public: lesson.is_public,
      metadata: lesson.metadata || {},
      lesson_plan: lesson.lesson_plan,
      plan_metadata: lesson.plan_metadata,
      created_at: lesson.created_at,
      updated_at: lesson.updated_at,
      user_email: lesson.user_profiles?.email,
      user_full_name: lesson.user_profiles?.full_name,
      slides_count: lesson.slides?.length || 0,
      slides: lesson.slides || [],
      ...stats,
    };
  }

  /**
   * Update lesson
   */
  async updateLesson(
    lessonId: string,
    updates: UpdateLessonRequest
  ): Promise<AdminApiResponse<LessonListItem>> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('lessons')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lessonId)
      .select(
        `
        *,
        user_profiles!inner(email, full_name)
        `
      )
      .single();

    if (error) {
      console.error('Error updating lesson:', error);
      return {
        success: false,
        error: 'Failed to update lesson',
      };
    }

    return {
      success: true,
      data: {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        description: data.description,
        subject: data.subject,
        age_group: data.age_group,
        duration: data.duration,
        status: data.status,
        thumbnail_url: data.thumbnail_url,
        tags: data.tags || [],
        difficulty: data.difficulty,
        views: data.views || 0,
        rating: data.rating || 0,
        completion_rate: data.completion_rate || 0,
        is_public: data.is_public,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_email: data.user_profiles?.email,
        user_full_name: data.user_profiles?.full_name,
      },
      message: 'Lesson updated successfully',
    };
  }

  /**
   * Delete lesson
   */
  async deleteLesson(lessonId: string): Promise<AdminApiResponse> {
    const supabase = createClient();

    const { error } = await supabase.from('lessons').delete().eq('id', lessonId);

    if (error) {
      console.error('Error deleting lesson:', error);
      return {
        success: false,
        error: 'Failed to delete lesson',
      };
    }

    return {
      success: true,
      message: 'Lesson deleted successfully',
    };
  }

  /**
   * Bulk delete lessons
   */
  async bulkDeleteLessons(lessonIds: string[]): Promise<AdminApiResponse> {
    const supabase = createClient();

    const { error } = await supabase.from('lessons').delete().in('id', lessonIds);

    if (error) {
      console.error('Error bulk deleting lessons:', error);
      return {
        success: false,
        error: 'Failed to delete lessons',
      };
    }

    return {
      success: true,
      message: `${lessonIds.length} lessons deleted successfully`,
    };
  }

  /**
   * Archive lesson
   */
  async archiveLesson(lessonId: string): Promise<AdminApiResponse> {
    return this.updateLesson(lessonId, { status: 'archived' });
  }

  /**
   * Publish lesson
   */
  async publishLesson(lessonId: string): Promise<AdminApiResponse> {
    return this.updateLesson(lessonId, { status: 'published' });
  }

  /**
   * Get lessons statistics
   */
  async getLessonsStats(): Promise<LessonStats> {
    const supabase = createClient();

    // Get total counts by status
    const { data: statusCounts } = await supabase
      .from('lessons')
      .select('status')
      .then((result) => {
        if (result.error) throw result.error;
        const counts = result.data.reduce(
          (acc: any, lesson: any) => {
            acc[lesson.status] = (acc[lesson.status] || 0) + 1;
            return acc;
          },
          { draft: 0, published: 0, archived: 0 }
        );
        return { data: counts };
      });

    // Get total views
    const { data: viewsData } = await supabase.rpc('get_total_lessons_views').single();

    // Get average rating
    const { data: ratingData } = await supabase.rpc('get_average_lesson_rating').single();

    // Get popular subjects
    const { data: subjects } = await supabase
      .from('lessons')
      .select('subject')
      .then((result) => {
        if (result.error) throw result.error;
        const subjectCounts = result.data.reduce((acc: any, lesson: any) => {
          acc[lesson.subject] = (acc[lesson.subject] || 0) + 1;
          return acc;
        }, {});
        return {
          data: Object.entries(subjectCounts)
            .map(([subject, count]) => ({ subject, count: count as number }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
        };
      });

    // Get popular age groups
    const { data: ageGroups } = await supabase
      .from('lessons')
      .select('age_group')
      .then((result) => {
        if (result.error) throw result.error;
        const ageCounts = result.data.reduce((acc: any, lesson: any) => {
          acc[lesson.age_group] = (acc[lesson.age_group] || 0) + 1;
          return acc;
        }, {});
        return {
          data: Object.entries(ageCounts)
            .map(([age_group, count]) => ({ age_group, count: count as number }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
        };
      });

    const total = (statusCounts?.draft || 0) + (statusCounts?.published || 0) + (statusCounts?.archived || 0);

    return {
      total_lessons: total,
      published_lessons: statusCounts?.published || 0,
      draft_lessons: statusCounts?.draft || 0,
      archived_lessons: statusCounts?.archived || 0,
      total_views: viewsData || 0,
      average_rating: ratingData || 0,
      most_popular_subjects: subjects || [],
      most_popular_age_groups: ageGroups || [],
      lessons_by_status: [
        { status: 'draft', count: statusCounts?.draft || 0 },
        { status: 'published', count: statusCounts?.published || 0 },
        { status: 'archived', count: statusCounts?.archived || 0 },
      ],
    };
  }

  /**
   * Get unique subjects list
   */
  async getSubjects(): Promise<string[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('lessons')
      .select('subject')
      .order('subject');

    if (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }

    const unique = [...new Set(data.map((item: any) => item.subject))];
    return unique;
  }

  /**
   * Get unique age groups list
   */
  async getAgeGroups(): Promise<string[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('lessons')
      .select('age_group')
      .order('age_group');

    if (error) {
      console.error('Error fetching age groups:', error);
      return [];
    }

    const unique = [...new Set(data.map((item: any) => item.age_group))];
    return unique;
  }

  /**
   * Export lessons to CSV
   */
  async exportLessonsToCSV(filters: LessonFilters = {}): Promise<string> {
    const { data: lessons } = await this.getLessons({ ...filters, limit: 10000, offset: 0 });

    // CSV Headers
    const headers = [
      'ID',
      'Title',
      'Subject',
      'Age Group',
      'Status',
      'Difficulty',
      'Views',
      'Rating',
      'Duration',
      'Author Email',
      'Author Name',
      'Slides Count',
      'Created At',
    ];

    // CSV Rows
    const rows = lessons.map((lesson) => [
      lesson.id,
      lesson.title,
      lesson.subject,
      lesson.age_group,
      lesson.status,
      lesson.difficulty,
      lesson.views,
      lesson.rating,
      lesson.duration,
      lesson.user_email || '',
      lesson.user_full_name || '',
      lesson.slides_count || 0,
      new Date(lesson.created_at).toLocaleDateString(),
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');

    return csvContent;
  }
}

export const lessonsService = new LessonsService();

