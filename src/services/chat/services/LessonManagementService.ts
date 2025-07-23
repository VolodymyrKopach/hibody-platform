import { type SimpleSlide, type SimpleLesson } from '@/types/chat';
import { ILessonManagementService } from '../interfaces/IChatServices';

// === SOLID: Single Responsibility - Lesson Management ===
export class LessonManagementService implements ILessonManagementService {
  createLesson(topic: string, age: string): SimpleLesson {
    return {
      id: `lesson_${Date.now()}`,
      title: topic || 'New Lesson',
      description: `Lesson about ${topic} for children ${age}`,
      subject: 'General Education',
      ageGroup: age || '8-9 years',
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