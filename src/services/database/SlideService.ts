import { createClient } from '@/lib/supabase/client'
import { 
  SlideRow, 
  SlideInsert, 
  SlideUpdate,
  SlideWithImages
} from '@/types/database'

export class SlideService {
  private supabase = createClient()

  /**
   * Створити новий слайд
   */
  async createSlide(slide: SlideInsert): Promise<SlideRow> {
    const { data, error } = await this.supabase
      .from('slides')
      .insert(slide)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create slide: ${error.message}`)
    }

    return data
  }

  /**
   * Отримати слайд за ID
   */
  async getSlideById(id: string): Promise<SlideRow | null> {
    const { data, error } = await this.supabase
      .from('slides')
      .select()
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get slide: ${error.message}`)
    }

    return data
  }

  /**
   * Оновити слайд
   */
  async updateSlide(id: string, updates: SlideUpdate): Promise<SlideRow> {
    const { data, error } = await this.supabase
      .from('slides')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update slide: ${error.message}`)
    }

    return data
  }

  /**
   * Видалити слайд
   */
  async deleteSlide(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('slides')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete slide: ${error.message}`)
    }
  }

  /**
   * Отримати слайди уроку
   */
  async getLessonSlides(lessonId: string): Promise<SlideRow[]> {
    const { data, error } = await this.supabase
      .from('slides')
      .select()
      .eq('lesson_id', lessonId)
      .order('slide_number')

    if (error) {
      throw new Error(`Failed to get lesson slides: ${error.message}`)
    }

    return data || []
  }
}

export const slideService = new SlideService() 