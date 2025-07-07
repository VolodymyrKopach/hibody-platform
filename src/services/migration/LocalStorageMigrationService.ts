import { createClient } from '@/lib/supabase/client';
import { LessonService } from '@/services/database/LessonService';
import { SlideService } from '@/services/database/SlideService';
import type { Lesson, LessonSlide } from '@/types/lesson';
import type { Database } from '@/types/database';

export interface MigrationResult {
  success: boolean;
  migratedLessons: number;
  migratedSlides: number;
  errors: string[];
}

export class LocalStorageMigrationService {
  private supabase = createClient();
  private lessonService = new LessonService();
  private slideService = new SlideService();

  async migrateUserData(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedLessons: 0,
      migratedSlides: 0,
      errors: []
    };

    try {
      // Перевіряємо авторизацію
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        result.errors.push('User not authenticated');
        return result;
      }

      // Отримуємо дані з localStorage
      const localLessons = this.getLocalStorageLessons();
      const localSlides = this.getLocalStorageSlides();

      console.log(`Found ${localLessons.length} lessons and ${localSlides.length} slides in localStorage`);

      // Мігруємо уроки
      for (const lesson of localLessons) {
        try {
          const migratedLesson = await this.migrateLessonToDatabase(lesson, user.id);
          if (migratedLesson) {
            result.migratedLessons++;
            
            // Мігруємо слайди для цього уроку
            const lessonSlides = lesson.slides || [];
            for (const slide of lessonSlides) {
              try {
                await this.migrateSlideToDatabase(slide, migratedLesson.id);
                result.migratedSlides++;
              } catch (error) {
                result.errors.push(`Failed to migrate slide ${slide.id}: ${error}`);
              }
            }
          }
        } catch (error) {
          result.errors.push(`Failed to migrate lesson ${lesson.id}: ${error}`);
        }
      }

      result.success = result.errors.length === 0;
      return result;

    } catch (error) {
      result.errors.push(`Migration failed: ${error}`);
      return result;
    }
  }

  private getLocalStorageLessons(): Lesson[] {
    try {
      const lessonsData = localStorage.getItem('lessons');
      if (!lessonsData) return [];
      
      const lessons = JSON.parse(lessonsData);
      return Array.isArray(lessons) ? lessons : [];
    } catch (error) {
      console.error('Error reading lessons from localStorage:', error);
      return [];
    }
  }

  private getLocalStorageSlides(): LessonSlide[] {
    try {
      const slidesData = localStorage.getItem('slides');
      if (!slidesData) return [];
      
      const slides = JSON.parse(slidesData);
      return Array.isArray(slides) ? slides : [];
    } catch (error) {
      console.error('Error reading slides from localStorage:', error);
      return [];
    }
  }

  private async migrateLessonToDatabase(
    localLesson: Lesson, 
    userId: string
  ): Promise<Database['public']['Tables']['lessons']['Row'] | null> {
    try {
      // Перевіряємо, чи не існує вже урок з таким ID
      const existingLesson = await this.lessonService.getLessonById(localLesson.id);
      if (existingLesson) {
        console.log(`Lesson ${localLesson.id} already exists in database`);
        return existingLesson;
      }

      // Створюємо новий урок в базі даних
      const lessonData = {
        id: localLesson.id,
        title: localLesson.title,
        description: localLesson.description || '',
        age_group: localLesson.targetAge,
        subject: localLesson.subject || 'general',
        difficulty_level: 'medium',
        duration_minutes: localLesson.duration || 30,
        learning_objectives: [],
        materials_needed: [],
        is_public: false,
        user_id: userId,
        created_at: localLesson.createdAt?.toISOString() || new Date().toISOString(),
        updated_at: localLesson.updatedAt?.toISOString() || new Date().toISOString()
      };

      const newLesson = await this.lessonService.createLesson(lessonData);
      console.log(`Successfully migrated lesson: ${newLesson.title}`);
      return newLesson;

    } catch (error) {
      console.error(`Error migrating lesson ${localLesson.id}:`, error);
      throw error;
    }
  }

  private async migrateSlideToDatabase(
    localSlide: LessonSlide, 
    lessonId: string
  ): Promise<Database['public']['Tables']['slides']['Row'] | null> {
    try {
      // Перевіряємо, чи не існує вже слайд з таким ID
      const existingSlides = await this.slideService.getLessonSlides(lessonId);
      const existingSlide = existingSlides.find((s: Database['public']['Tables']['slides']['Row']) => s.id === localSlide.id);
      
      if (existingSlide) {
        console.log(`Slide ${localSlide.id} already exists in database`);
        return existingSlide;
      }

      // Створюємо новий слайд в базі даних
      const slideData = {
        id: localSlide.id,
        lesson_id: lessonId,
        title: localSlide.title,
        content: localSlide.description,
        slide_number: localSlide.number || 1,
        slide_type: localSlide.type || 'content',
        html_content: localSlide._internal?.htmlContent || '',
        speaker_notes: '',
        created_at: localSlide.createdAt?.toISOString() || new Date().toISOString(),
        updated_at: localSlide.updatedAt?.toISOString() || new Date().toISOString()
      };

      const newSlide = await this.slideService.createSlide(slideData);
      console.log(`Successfully migrated slide: ${newSlide.title}`);
      return newSlide;

    } catch (error) {
      console.error(`Error migrating slide ${localSlide.id}:`, error);
      throw error;
    }
  }

  async clearLocalStorageAfterMigration(): Promise<void> {
    try {
      localStorage.removeItem('lessons');
      localStorage.removeItem('slides');
      localStorage.removeItem('currentLesson');
      console.log('LocalStorage cleared after successful migration');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  async checkMigrationStatus(): Promise<{
    hasLocalData: boolean;
    localLessonsCount: number;
    localSlidesCount: number;
    hasDatabaseData: boolean;
    databaseLessonsCount: number;
  }> {
    const localLessons = this.getLocalStorageLessons();
    const localSlides = this.getLocalStorageSlides();
    
    let databaseLessonsCount = 0;
    let hasDatabaseData = false;

    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (user) {
        const result = await this.lessonService.getUserLessons(user.id);
        databaseLessonsCount = result.total;
        hasDatabaseData = databaseLessonsCount > 0;
      }
    } catch (error) {
      console.error('Error checking database data:', error);
    }

    return {
      hasLocalData: localLessons.length > 0 || localSlides.length > 0,
      localLessonsCount: localLessons.length,
      localSlidesCount: localSlides.length,
      hasDatabaseData,
      databaseLessonsCount
    };
  }
} 