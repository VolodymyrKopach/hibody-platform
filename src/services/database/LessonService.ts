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
import { ParsedLessonPlan, ParsedSlide } from '@/types/templates'
import { LessonPlanJSONProcessor } from '@/utils/lessonPlanJSONProcessor'
import { LessonPlanParser } from '@/utils/lessonPlanParser'

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

  /**
   * Отримати уроки користувача з пагінацією
   */
  async getUserLessons(
    userId: string,
    params: PaginationParams = {},
    filters: LessonFilters = {}
  ): Promise<PaginatedResult<LessonRow>> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = params
    const offset = (page - 1) * limit

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
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

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
   * Отримати урок з слайдами
   */
  async getLessonWithSlides(id: string): Promise<LessonWithSlides | null> {
    const { data, error } = await this.supabase
      .from('lessons')
      .select(`
        *,
        slides (*)
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
   * Отримати публічні уроки
   */
  async getPublicLessons(
    params: PaginationParams = {},
    filters: Omit<LessonFilters, 'isPublic'> = {}
  ): Promise<PaginatedResult<LessonRow>> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = params
    const offset = (page - 1) * limit

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
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

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
   * Збільшити кількість переглядів уроку
   */
  async incrementViews(id: string): Promise<void> {
    const { error } = await this.supabase
      .rpc('increment_lesson_views', { lesson_id: id })

    if (error) {
      console.error('Failed to increment lesson views:', error)
      // Не кидаємо помилку, оскільки це не критично
    }
  }

  /**
   * Отримати статистику користувача
   */
  async getUserStats(userId: string): Promise<UserStats> {
    // Отримуємо кількість уроків
    const { count: totalLessons, error: lessonsError } = await this.supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (lessonsError) {
      throw new Error(`Failed to get lessons count: ${lessonsError.message}`)
    }

    // Отримуємо кількість опублікованих уроків
    const { count: publishedLessons, error: publishedError } = await this.supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'published')

    if (publishedError) {
      throw new Error(`Failed to get published lessons count: ${publishedError.message}`)
    }

    // Отримуємо кількість слайдів
    const { count: totalSlides, error: slidesError } = await this.supabase
      .from('slides')
      .select('*', { count: 'exact', head: true })
      .in('lesson_id', 
        this.supabase
          .from('lessons')
          .select('id')
          .eq('user_id', userId)
      )

    if (slidesError) {
      throw new Error(`Failed to get slides count: ${slidesError.message}`)
    }

    // Отримуємо загальну кількість переглядів та середній рейтинг
    const { data: statsData, error: statsError } = await this.supabase
      .from('lessons')
      .select('views, rating')
      .eq('user_id', userId)

    if (statsError) {
      throw new Error(`Failed to get lesson stats: ${statsError.message}`)
    }

    const totalViews = statsData?.reduce((sum, lesson) => sum + (lesson.views || 0), 0) || 0
    const averageRating = statsData?.length > 0 
      ? statsData.reduce((sum, lesson) => sum + (lesson.rating || 0), 0) / statsData.length 
      : 0

    return {
      totalLessons: totalLessons || 0,
      publishedLessons: publishedLessons || 0,
      totalSlides: totalSlides || 0,
      totalViews,
      averageRating: Math.round(averageRating * 10) / 10 // Округлюємо до 1 знака після коми
    }
  }

  /**
   * Перевірити, чи може користувач створити урок (ліміти підписки)
   */
  async canUserCreateLesson(userId: string): Promise<boolean> {
    // Тимчасово повертаємо true, поки не реалізовано систему підписок
    return true

    /*
    // Отримуємо профіль користувача
    const { data: profile, error: profileError } = await this.supabase
      .from('user_profiles')
      .select('subscription_type')
      .eq('id', userId)
      .single()

    if (profileError) {
      throw new Error(`Failed to get user profile: ${profileError.message}`)
    }

    // Отримуємо кількість уроків користувача
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

  // =============================================
  // LESSON PLAN OPERATIONS
  // =============================================

  /**
   * Зберегти план уроку в базі даних
   * @param lessonId - ID уроку
   * @param rawPlan - сирий план (JSON string або object)
   * @param planFormat - формат плану (json або markdown)
   */
  async saveLessonPlan(
    lessonId: string, 
    rawPlan: string | object,
    planFormat: 'json' | 'markdown' = 'json'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Парсимо план
      let parsedPlan: ParsedLessonPlan;
      
      if (planFormat === 'json') {
        if (typeof rawPlan === 'object') {
          parsedPlan = LessonPlanJSONProcessor.processJSONObject(rawPlan);
        } else {
          const jsonPlan = JSON.parse(rawPlan as string);
          parsedPlan = LessonPlanJSONProcessor.processJSONObject(jsonPlan);
        }
      } else {
        parsedPlan = LessonPlanParser.parse(rawPlan as string);
      }


      // Оновлюємо урок з планом
      const { error: lessonError } = await this.supabase
        .from('lessons')
        .update({
          lesson_plan: parsedPlan,
          plan_metadata: parsedPlan.metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', lessonId);

      if (lessonError) {
        console.error('❌ LESSON SERVICE: Error updating lesson with plan:', lessonError);
        throw lessonError;
      }

      // Оновлюємо слайди з витягами з плану
      await this.updateSlidesWithPlanData(lessonId, parsedPlan.slides);
      return { success: true };
      
    } catch (error) {
      console.error('❌ LESSON SERVICE: Error saving lesson plan:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Отримати план уроку з бази даних
   * @param lessonId - ID уроку
   */
  async getLessonPlan(lessonId: string): Promise<ParsedLessonPlan | null> {
    try {
      const { data, error } = await this.supabase
        .from('lessons')
        .select('lesson_plan, plan_metadata')
        .eq('id', lessonId)
        .single();

      if (error) {
        console.error('❌ LESSON SERVICE: Error getting lesson plan:', error);
        return null;
      }

      if (!data?.lesson_plan) {
        return null;
      }
      return data.lesson_plan as ParsedLessonPlan;
      
    } catch (error) {
      console.error('❌ LESSON SERVICE: Error getting lesson plan:', error);
      return null;
    }
  }

  /**
   * Оновити слайди з даними з плану
   * @param lessonId - ID уроку
   * @param planSlides - слайди з плану
   */
  private async updateSlidesWithPlanData(
    lessonId: string, 
    planSlides: ParsedSlide[]
  ): Promise<void> {
    try {
      // Отримуємо існуючі слайди
      const { data: existingSlides, error } = await this.supabase
        .from('slides')
        .select('id, slide_number')
        .eq('lesson_id', lessonId)
        .order('slide_number');

      if (error) {
        console.error('❌ LESSON SERVICE: Error getting existing slides:', error);
        throw error;
      }

      // Оновлюємо кожен слайд з відповідними даними з плану
      const updates = existingSlides?.map(slide => {
        const planSlide = planSlides.find(ps => ps.slideNumber === slide.slide_number);
        
        return {
          id: slide.id,
          plan_data: planSlide ? {
            goal: planSlide.goal,
            content: planSlide.content,
            slideNumber: planSlide.slideNumber,
            type: planSlide.type,
            structure: (planSlide as any).structure || {}
          } : {}
        };
      }) || [];

      // Batch update слайдів
      for (const update of updates) {
        const { error: updateError } = await this.supabase
          .from('slides')
          .update({ 
            plan_data: update.plan_data,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id);

        if (updateError) {
          console.error('❌ LESSON SERVICE: Error updating slide', update.id, updateError);
          // Continue with other slides even if one fails
        }
      }
      
    } catch (error) {
      console.error('❌ LESSON SERVICE: Error updating slides with plan data:', error);
      throw error;
    }
  }

  /**
   * Отримати дані плану для конкретного слайду
   * @param slideId - ID слайду
   */
  async getSlidePlanData(slideId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('slides')
        .select('plan_data')
        .eq('id', slideId)
        .single();

      if (error) {
        console.error('❌ LESSON SERVICE: Error getting slide plan data:', error);
        return null;
      }
      return data?.plan_data || null;
      
    } catch (error) {
      console.error('❌ LESSON SERVICE: Error getting slide plan data:', error);
      return null;
    }
  }

  /**
   * Перевірити, чи має урок збережений план
   * @param lessonId - ID уроку
   */
  async hasLessonPlan(lessonId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('lessons')
        .select('lesson_plan')
        .eq('id', lessonId)
        .single();

      if (error) return false;
      
      return !!(data?.lesson_plan && Object.keys(data.lesson_plan).length > 0);
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Перевірити, чи може користувач створити урок
   * @param userId - ID користувача
   */
  async canCreateLesson(userId: string): Promise<boolean> {
    try {
      // Простий метод - завжди дозволяємо створення
      // В майбутньому тут можна додати логіку лімітів підписки
      
      return true;
    } catch (error) {
      console.error('❌ LESSON SERVICE: Error in canCreateLesson:', error);
      return false;
    }
  }
}

// Експортуємо singleton instance
export const lessonService = new LessonService()
