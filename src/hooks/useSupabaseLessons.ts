'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { LessonService } from '@/services/database/LessonService';
import { SlideService } from '@/services/database/SlideService';
import type { 
  LessonRow, 
  SlideRow, 
  LessonInsert, 
  SlideInsert 
} from '@/types/database';

export interface DatabaseLesson {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  age_group: string;
  duration: number;
  status: 'draft' | 'published' | 'archived';
  thumbnail_url: string | null;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  views: number;
  rating: number;
  completion_rate: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  slides?: DatabaseSlide[];
}

export interface DatabaseSlide {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  type: string;
  slide_number: number;
  html_content: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UseSupabaseLessonsReturn {
  lessons: DatabaseLesson[];
  currentLesson: LessonRow | null;
  slides: SlideRow[];
  loading: boolean;
  error: string | null;
  
  // Lesson operations
  createLesson: (data: Omit<LessonInsert, 'user_id'>) => Promise<LessonRow>;
  updateLesson: (id: string, updates: Partial<LessonRow>) => Promise<LessonRow>;
  deleteLesson: (id: string) => Promise<boolean>;
  loadLesson: (id: string) => Promise<void>;
  loadUserLessons: () => Promise<void>;
  
  // Slide operations
  createSlide: (data: Omit<SlideInsert, 'lesson_id'>) => Promise<SlideRow>;
  updateSlide: (id: string, updates: Partial<SlideRow>) => Promise<SlideRow>;
  deleteSlide: (id: string) => Promise<void>;
  loadLessonSlides: (lessonId: string) => Promise<void>;
  
  // Utility functions
  refreshData: () => Promise<void>;
  clearError: () => void;
  refreshLessons: () => Promise<void>;
}

export const useSupabaseLessons = (): UseSupabaseLessonsReturn => {
  const { user } = useAuth();
  const [lessonService] = useState(() => new LessonService());
  const [slideService] = useState(() => new SlideService());
  
  const [lessons, setLessons] = useState<DatabaseLesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonRow | null>(null);
  const [slides, setSlides] = useState<SlideRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lesson operations
  const createLesson = useCallback(async (data: Omit<LessonInsert, 'user_id'>): Promise<LessonRow> => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const lessonData = {
        ...data,
        user_id: user.id
      };
      
      const newLesson = await lessonService.createLesson(lessonData);
      setLessons(prev => [newLesson, ...prev]);
      return newLesson;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lesson';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, lessonService]);

  const updateLesson = useCallback(async (id: string, updates: Partial<LessonRow>): Promise<LessonRow> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedLesson = await lessonService.updateLesson(id, updates);
      
      // Update lessons list
      setLessons(prev => prev.map(lesson => 
        lesson.id === id ? updatedLesson : lesson
      ));
      
      // Update current lesson if it's the one being updated
      if (currentLesson?.id === id) {
        setCurrentLesson(updatedLesson);
      }
      
      return updatedLesson;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lesson';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [lessonService, currentLesson]);

  const deleteLesson = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await lessonService.deleteLesson(id);
      
      // Remove from lessons list
      setLessons(prev => prev.filter(lesson => lesson.id !== id));
      
      // Clear current lesson if it's the one being deleted
      if (currentLesson?.id === id) {
        setCurrentLesson(null);
        setSlides([]);
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete lesson';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [lessonService, currentLesson]);

  const loadLesson = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const lesson = await lessonService.getLessonById(id);
      if (!lesson) {
        throw new Error('Lesson not found');
      }
      
      setCurrentLesson(lesson);
      
      // Load slides for this lesson
      await loadLessonSlides(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load lesson';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [lessonService]);

  // Основна функція завантаження уроків користувача
  const loadUserLessons = useCallback(async (): Promise<void> => {
    console.log('🔄 HOOK: loadUserLessons called');
    console.log('👤 User:', user ? { id: user.id, email: user.email } : 'Not authenticated');
    
    if (!user) {
      console.log('❌ No user found, clearing lessons');
      setLessons([]);
      setLoading(false);
      return;
    }
    
    console.log('⏳ Starting lessons fetch...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 Making API call to /api/lessons');
      const response = await fetch('/api/lessons', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📨 API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to fetch lessons');
      }

      const data = await response.json();
      console.log('📋 API Response data:', data);
      console.log('📊 Lessons received:', data.lessons?.length || 0);
      
      // Детальне логування кожного уроку
      if (data.lessons && Array.isArray(data.lessons)) {
        data.lessons.forEach((lesson: any, index: number) => {
          console.log(`📖 Lesson ${index + 1}:`, {
            id: lesson.id,
            title: lesson.title,
            thumbnail_url: lesson.thumbnail_url,
            has_thumbnail: !!lesson.thumbnail_url,
            slides_count: lesson.slides?.length || 0,
            status: lesson.status,
            created_at: lesson.created_at
          });
        });
      }
      
      setLessons(data.lessons || []);
      console.log('✅ Lessons state updated successfully');
    } catch (err) {
      console.error('💥 Error fetching lessons:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load lessons';
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('🏁 loadUserLessons completed');
    }
  }, [user]);

  // Slide operations
  const createSlide = useCallback(async (data: Omit<SlideInsert, 'lesson_id'>): Promise<SlideRow> => {
    if (!currentLesson) throw new Error('No current lesson selected');
    
    setLoading(true);
    setError(null);
    
    try {
      const slideData = {
        ...data,
        lesson_id: currentLesson.id
      };
      
      const newSlide = await slideService.createSlide(slideData);
      setSlides(prev => [...prev, newSlide]);
      return newSlide;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create slide';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentLesson, slideService]);

  const updateSlide = useCallback(async (id: string, updates: Partial<SlideRow>): Promise<SlideRow> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedSlide = await slideService.updateSlide(id, updates);
      
      // Update slides list
      setSlides(prev => prev.map(slide => 
        slide.id === id ? updatedSlide : slide
      ));
      
      return updatedSlide;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update slide';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [slideService]);

  const deleteSlide = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await slideService.deleteSlide(id);
      
      // Remove from slides list
      setSlides(prev => prev.filter(slide => slide.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete slide';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [slideService]);

  const loadLessonSlides = useCallback(async (lessonId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const lessonSlides = await slideService.getLessonSlides(lessonId);
      setSlides(lessonSlides);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load slides';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [slideService]);

  // Utility functions
  const refreshData = useCallback(async (): Promise<void> => {
    await loadUserLessons();
    if (currentLesson) {
      await loadLessonSlides(currentLesson.id);
    }
  }, [loadUserLessons, loadLessonSlides, currentLesson]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshLessons = useCallback(async () => {
    await loadUserLessons();
  }, [loadUserLessons]);

  // Load user lessons on mount and when user changes
  useEffect(() => {
    let mounted = true;
    
    const initializeLessons = async () => {
      if (user && mounted) {
        await loadUserLessons();
      } else if (!user && mounted) {
        setLessons([]);
        setLoading(false);
      }
    };

    initializeLessons();
    
    return () => {
      mounted = false;
    };
  }, [user?.id]); // Залежність тільки від user.id, а не від всього user об'єкта

  return {
    lessons,
    currentLesson,
    slides,
    loading,
    error,
    
    // Lesson operations
    createLesson,
    updateLesson,
    deleteLesson,
    loadLesson,
    loadUserLessons,
    
    // Slide operations
    createSlide,
    updateSlide,
    deleteSlide,
    loadLessonSlides,
    
    // Utility functions
    refreshData,
    clearError,
    refreshLessons
  };
}; 