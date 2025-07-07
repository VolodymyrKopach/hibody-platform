import { createClient } from '@/lib/supabase/client'
import { 
  LessonRow, 
  LessonInsert, 
  LessonUpdate, 
  LessonWithSlides,
  LessonFilters,
  PaginationParams,
  PaginatedResult,
  UserStats
} from '@/types/database'

export class LessonService {
  private supabase = createClient()

  // =============================================
  // CRUD OPERATIONS
  // =============================================

  /**
   * Створити новий урок
   */
  async createLesson(lesson: LessonInsert): Promise<LessonRow> {
    const { data, error } = await this.supabase
      .from('lessons')
      .insert(lesson)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create lesson: ${error.message}`)
    }

    return data
  }

  /**
   * Отримати урок за ID
   */
  async getLessonById(id: string): Promise<LessonRow | null> {
    const { data, error } = await this.supabase
      .from('lessons')
      .select()
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Урок не знайдено
      }
      throw new Error(`Failed to get lesson: ${error.message}`)
    }

    return data
  }

  /**
   * Отримати урок з слайдами
   */
  async getLessonWithSlides(id: string): Promise<LessonWithSlides | null> {
    const { data, error } = await this.supabase
      .from('lessons')
      .select(`
        *,
        slides (
          *,
          slide_images (*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get lesson with slides: ${error.message}`)
    }

    return data as LessonWithSlides
  }

  /**
   * Оновити урок
   */
  async updateLesson(id: string, updates: LessonUpdate): Promise<LessonRow> {
    const { data, error } = await this.supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update lesson: ${error.message}`)
    }

    return data
  }

  /**
   * Видалити урок
   */
  async deleteLesson(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('lessons')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete lesson: ${error.message}`)
    }
  }

  // =============================================
  // QUERY OPERATIONS
  // =============================================

  /**
   * Отримати уроки користувача з пагінацією та фільтрацією
   */
  async getUserLessons(
    userId: string,
    filters: LessonFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<LessonRow>> {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'created_at', 
      sortOrder = 'desc' 
    } = pagination

    let query = this.supabase
      .from('lessons')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // Застосовуємо фільтри
    if (filters.subject) {
      query = query.eq('subject', filters.subject)
    }
    if (filters.ageGroup) {
      query = query.eq('age_group', filters.ageGroup)
    }
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.isPublic !== undefined) {
      query = query.eq('is_public', filters.isPublic)
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Сортування та пагінація
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)

    if (error) {
      throw new Error(`Failed to get user lessons: ${error.message}`)
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

  /**
   * Отримати публічні уроки
   */
  async getPublicLessons(
    filters: LessonFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<LessonRow>> {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'created_at', 
      sortOrder = 'desc' 
    } = pagination

    let query = this.supabase
      .from('lessons')
      .select('*', { count: 'exact' })
      .eq('is_public', true)
      .eq('status', 'published')

    // Застосовуємо фільтри
    if (filters.subject) {
      query = query.eq('subject', filters.subject)
    }
    if (filters.ageGroup) {
      query = query.eq('age_group', filters.ageGroup)
    }
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Сортування та пагінація
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)

    if (error) {
      throw new Error(`Failed to get public lessons: ${error.message}`)
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

  /**
   * Пошук уроків
   */
  async searchLessons(
    query: string,
    filters: LessonFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<LessonRow>> {
    return this.getPublicLessons(
      { ...filters, search: query },
      pagination
    )
  }

  // =============================================
  // STATISTICS
  // =============================================

  /**
   * Отримати статистику користувача
   */
  async getUserStats(userId: string): Promise<UserStats> {
    const { data: lessons, error } = await this.supabase
      .from('lessons')
      .select('id, status, views, rating')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to get user stats: ${error.message}`)
    }

    const { data: slides, error: slidesError } = await this.supabase
      .from('slides')
      .select('id')
      .in('lesson_id', lessons.map(l => l.id))

    if (slidesError) {
      throw new Error(`Failed to get slides count: ${slidesError.message}`)
    }

    const totalLessons = lessons.length
    const publishedLessons = lessons.filter((l: any) => l.status === 'published').length
    const totalSlides = slides.length
    const totalViews = lessons.reduce((sum: number, l: any) => sum + l.views, 0)
    const averageRating = lessons.length > 0 
      ? lessons.reduce((sum: number, l: any) => sum + l.rating, 0) / lessons.length 
      : 0

    return {
      totalLessons,
      publishedLessons,
      totalSlides,
      totalViews,
      averageRating: Math.round(averageRating * 10) / 10
    }
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  /**
   * Збільшити кількість переглядів уроку
   */
  async incrementViews(id: string): Promise<void> {
    const { error } = await this.supabase
      .rpc('increment_lesson_views', { lesson_id: id })

    if (error) {
      throw new Error(`Failed to increment views: ${error.message}`)
    }
  }

  /**
   * Дублювати урок
   */
  async duplicateLesson(id: string, userId: string): Promise<LessonRow> {
    // Отримуємо оригінальний урок з слайдами
    const originalLesson = await this.getLessonWithSlides(id)
    if (!originalLesson) {
      throw new Error('Lesson not found')
    }

    // Створюємо копію уроку
    const { slides, id: originalId, created_at, updated_at, views, rating, completion_rate, ...lessonData } = originalLesson
    const newLesson = await this.createLesson({
      ...lessonData,
      user_id: userId,
      title: `${lessonData.title} (Copy)`,
      status: 'draft',
      is_public: false
    })

    // Дублюємо слайди
    if (slides && slides.length > 0) {
      // Імпортуємо SlideService динамічно, щоб уникнути циклічних залежностей
      const { SlideService } = await import('./SlideService')
      const slideService = new SlideService()
      for (const slide of slides) {
        const { id: slideId, lesson_id, created_at: slideCreatedAt, updated_at: slideUpdatedAt, ...slideData } = slide
        await slideService.createSlide({
          ...slideData,
          lesson_id: newLesson.id,
          slide_number: slide.slide_number
        })
      }
    }

    return newLesson
  }

  /**
   * Перевірити, чи може користувач створити урок
   */
  async canCreateLesson(userId: string): Promise<boolean> {
    // ТИМЧАСОВО: Дозволяємо необмежену кількість уроків для тестування
    console.log('🔧 LESSON SERVICE: canCreateLesson called for user:', userId);
    console.log('🔧 LESSON SERVICE: Temporarily allowing unlimited lessons for testing');
    return true;

    /* 
    // ОРИГІНАЛЬНА ЛОГІКА (закоментована для тестування):
    // Отримуємо профіль користувача
    const { data: profile, error } = await this.supabase
      .from('user_profiles')
      .select('subscription_type')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('❌ LESSON SERVICE: Failed to get user profile:', error);
      // Якщо профіль не знайдено, створюємо базовий профіль
      if (error.code === 'PGRST116') {
        try {
          const { data: newProfile, error: createError } = await this.supabase
            .from('user_profiles')
            .insert({
              id: userId,
              email: 'temp@example.com', // Тимчасовий email
              subscription_type: 'free'
            })
            .select()
            .single();
          
          if (createError) {
            console.error('❌ LESSON SERVICE: Failed to create profile:', createError);
            return false;
          }
          
          console.log('✅ LESSON SERVICE: Created new profile for user:', userId);
        } catch (createError) {
          console.error('❌ LESSON SERVICE: Error creating profile:', createError);
          return false;
        }
      } else {
        throw new Error(`Failed to get user profile: ${error.message}`)
      }
    }

    // Рахуємо кількість уроків
    const { count, error: countError } = await this.supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countError) {
      throw new Error(`Failed to count lessons: ${countError.message}`)
    }

    // Перевіряємо ліміти
    const limits: Record<string, number> = {
      free: 5,
      professional: 50,
      premium: Infinity
    }

    const subscriptionType = profile?.subscription_type || 'free';
    const currentCount = count || 0;
    const limit = limits[subscriptionType];
    
    console.log('📊 LESSON SERVICE: Subscription check:', {
      userId,
      subscriptionType,
      currentCount,
      limit,
      canCreate: currentCount < limit
    });

    return currentCount < limit;
    */
  }
}

// Експортуємо singleton instance
export const lessonService = new LessonService() 