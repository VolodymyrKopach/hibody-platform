import { type SimpleSlide, type SimpleLesson } from '@/types/chat';
import { ILessonManagementService } from '../interfaces/IChatServices';

// === SOLID: Single Responsibility - Lesson Management ===
export class LessonManagementService implements ILessonManagementService {
  createLesson(topic: string, age: string): SimpleLesson {
    return {
      id: `lesson_${Date.now()}`,
      title: topic || 'Новий урок',
      description: `Урок про ${topic} для дітей ${age}`,
      subject: 'Загальне навчання',
      ageGroup: age || '8-9 років',
      duration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: 'ai-chat',
      slides: []
    };
  }

  addSlideToLesson(lesson: SimpleLesson, slide: SimpleSlide): SimpleLesson {
    return {
      ...lesson,
      slides: [...lesson.slides, slide],
      updatedAt: new Date()
    };
  }

  updateLesson(lesson: SimpleLesson, updates: Partial<SimpleLesson>): SimpleLesson {
    return {
      ...lesson,
      ...updates,
      updatedAt: new Date()
    };
  }
} 