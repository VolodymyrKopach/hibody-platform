// Utilities for working with localStorage
export interface SavedLesson {
  id: string;
  title: string;
  description: string;
  subject: string;
  ageGroup: string;
  duration: number;
  slides: SavedSlide[];
  createdAt: string;
  updatedAt: string;
  authorId: string;
  thumbnail: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  views: number;
  rating: number;
  status: 'draft' | 'published' | 'archived';
  completionRate: number;
}

export interface SavedSlide {
  id: string;
  title: string;
  content: string;
  htmlContent: string;
  type: 'title' | 'content' | 'interactive' | 'summary';
  status: 'completed' | 'draft';
  thumbnailUrl?: string;
}

export interface SavedFolder {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  parentId?: string;
  materialIds: string[];
}

const LESSONS_STORAGE_KEY = 'teachspark_saved_lessons';
const FOLDERS_STORAGE_KEY = 'teachspark_saved_folders';

export class LessonStorage {
  
  static getAllLessons(): SavedLesson[] {
    try {
      const stored = localStorage.getItem(LESSONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading lessons from localStorage:', error);
      return [];
    }
  }

  static saveLesson(lesson: SavedLesson): boolean {
    try {
      const lessons = this.getAllLessons();
      const existingIndex = lessons.findIndex(l => l.id === lesson.id);
      
      if (existingIndex >= 0) {
        lessons[existingIndex] = lesson;
      } else {
        lessons.push(lesson);
      }
      
      localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessons));
      return true;
    } catch (error) {
      console.error('Error saving lesson to localStorage:', error);
      return false;
    }
  }

  static getLessonById(id: string): SavedLesson | null {
    try {
      const lessons = this.getAllLessons();
      return lessons.find(l => l.id === id) || null;
    } catch (error) {
      console.error('Error getting lesson by id:', error);
      return null;
    }
  }

  static deleteLesson(id: string): boolean {
    try {
      const lessons = this.getAllLessons();
      console.log('Before deletion - lessons:', lessons);
      console.log('Deleting lesson with id:', id);
      
      const initialCount = lessons.length;
      const filteredLessons = lessons.filter(l => l.id !== id);
      const finalCount = filteredLessons.length;
      
      console.log(`Deletion result: ${initialCount} -> ${finalCount} lessons`);
      
      if (initialCount === finalCount) {
        console.warn('No lesson was deleted - lesson not found');
        return false;
      }
      
      localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(filteredLessons));
      console.log('After deletion - lessons in localStorage:', this.getAllLessons());
      return true;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      return false;
    }
  }

  static updateLesson(id: string, updates: Partial<SavedLesson>): boolean {
    try {
      const lessons = this.getAllLessons();
      const lessonIndex = lessons.findIndex(l => l.id === id);
      
      if (lessonIndex >= 0) {
        lessons[lessonIndex] = { ...lessons[lessonIndex], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessons));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating lesson:', error);
      return false;
    }
  }

  // Functions for working with slides
  static updateSlideOrder(lessonId: string, newSlideOrder: SavedSlide[]): boolean {
    try {
      return this.updateLesson(lessonId, { slides: newSlideOrder });
    } catch (error) {
      console.error('Error updating slide order:', error);
      return false;
    }
  }

  static deleteSlide(lessonId: string, slideId: string): boolean {
    try {
      const lesson = this.getLessonById(lessonId);
      
      if (!lesson) {
        return false;
      }
      
      const initialSlideCount = lesson.slides.length;
      const updatedSlides = lesson.slides.filter(slide => slide.id !== slideId);
      
      if (initialSlideCount === updatedSlides.length) {
        return false;
      }
      
      return this.updateLesson(lessonId, { slides: updatedSlides });
    } catch (error) {
      console.error('Error deleting slide:', error);
      return false;
    }
  }

  static updateSlide(lessonId: string, slideId: string, updates: Partial<SavedSlide>): boolean {
    try {
      const lesson = this.getLessonById(lessonId);
      if (!lesson) return false;
      
      const updatedSlides = lesson.slides.map(slide => 
        slide.id === slideId ? { ...slide, ...updates } : slide
      );
      
      return this.updateLesson(lessonId, { slides: updatedSlides });
    } catch (error) {
      console.error('Error updating slide:', error);
      return false;
    }
  }

  static getLessonStats(): { total: number; published: number; drafts: number; archived: number } {
    const lessons = this.getAllLessons();
    return {
      total: lessons.length,
      published: lessons.filter(l => l.status === 'published').length,
      drafts: lessons.filter(l => l.status === 'draft').length,
      archived: lessons.filter(l => l.status === 'archived').length,
    };
  }

  static incrementViews(id: string): void {
    const lesson = this.getLessonById(id);
    if (lesson) {
      this.updateLesson(id, { views: lesson.views + 1 });
    }
  }

  static updateRating(id: string, rating: number): void {
    this.updateLesson(id, { rating });
  }

  static searchLessons(query: string): SavedLesson[] {
    const lessons = this.getAllLessons();
    const lowercaseQuery = query.toLowerCase();
    
    return lessons.filter(lesson => 
      lesson.title.toLowerCase().includes(lowercaseQuery) ||
      lesson.description.toLowerCase().includes(lowercaseQuery) ||
      lesson.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      lesson.subject.toLowerCase().includes(lowercaseQuery)
    );
  }

  static filterLessons(filters: {
    subject?: string;
    status?: string;
    difficulty?: string;
    ageGroup?: string;
  }): SavedLesson[] {
    const lessons = this.getAllLessons();
    
    return lessons.filter(lesson => {
      if (filters.subject && lesson.subject !== filters.subject) return false;
      if (filters.status && lesson.status !== filters.status) return false;
      if (filters.difficulty && lesson.difficulty !== filters.difficulty) return false;
      if (filters.ageGroup && lesson.ageGroup !== filters.ageGroup) return false;
      return true;
    });
  }

  static exportLessons(): string {
    const lessons = this.getAllLessons();
    return JSON.stringify(lessons, null, 2);
  }

  static importLessons(jsonData: string): boolean {
    try {
      const importedLessons = JSON.parse(jsonData);
      if (Array.isArray(importedLessons)) {
        localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(importedLessons));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing lessons:', error);
      return false;
    }
  }

  static clearAllLessons(): void {
    localStorage.removeItem(LESSONS_STORAGE_KEY);
  }
}

export class FolderStorage {
  
  static getAllFolders(): SavedFolder[] {
    try {
      const stored = localStorage.getItem(FOLDERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading folders from localStorage:', error);
      return [];
    }
  }

  static saveFolder(folder: SavedFolder): boolean {
    try {
      const folders = this.getAllFolders();
      const existingIndex = folders.findIndex(f => f.id === folder.id);
      
      if (existingIndex >= 0) {
        folders[existingIndex] = folder;
      } else {
        folders.push(folder);
      }
      
      localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
      return true;
    } catch (error) {
      console.error('Error saving folder to localStorage:', error);
      return false;
    }
  }

  static getFolderById(id: string): SavedFolder | null {
    try {
      const folders = this.getAllFolders();
      return folders.find(f => f.id === id) || null;
    } catch (error) {
      console.error('Error getting folder by id:', error);
      return null;
    }
  }

  static deleteFolder(id: string): boolean {
    try {
      console.log('FolderStorage.deleteFolder called with id:', id);
      const folders = this.getAllFolders();
      console.log('Current folders before deletion:', folders.length);
      
      const folderToDelete = folders.find(f => f.id === id);
      console.log('Folder to delete:', folderToDelete);
      
      const filteredFolders = folders.filter(f => f.id !== id);
      console.log('Folders after filtering:', filteredFolders.length);
      
      localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(filteredFolders));
      console.log('Successfully deleted folder from localStorage');
      return true;
    } catch (error) {
      console.error('Error deleting folder:', error);
      return false;
    }
  }

  static updateFolder(id: string, updates: Partial<SavedFolder>): boolean {
    try {
      const folders = this.getAllFolders();
      const folderIndex = folders.findIndex(f => f.id === id);
      
      if (folderIndex >= 0) {
        folders[folderIndex] = { ...folders[folderIndex], ...updates };
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating folder:', error);
      return false;
    }
  }

  static addMaterialToFolder(folderId: string, materialId: string): boolean {
    try {
      console.log('FolderStorage.addMaterialToFolder called:', { folderId, materialId });
      
      const folder = this.getFolderById(folderId);
      if (!folder) {
        console.error('Folder not found:', folderId);
        return false;
      }
      
      console.log('Current folder materialIds:', folder.materialIds);
      
      if (!folder.materialIds.includes(materialId)) {
        folder.materialIds.push(materialId);
        console.log('Adding material to folder, new materialIds:', folder.materialIds);
        const updateResult = this.updateFolder(folderId, folder);
        console.log('Update folder result:', updateResult);
        return updateResult;
      }
      
      console.log('Material already in folder');
      return true;
    } catch (error) {
      console.error('Error adding material to folder:', error);
      return false;
    }
  }

  static removeMaterialFromFolder(folderId: string, materialId: string): boolean {
    try {
      const folder = this.getFolderById(folderId);
      if (!folder) return false;
      
      folder.materialIds = folder.materialIds.filter(id => id !== materialId);
      return this.updateFolder(folderId, folder);
    } catch (error) {
      console.error('Error removing material from folder:', error);
      return false;
    }
  }

  static clearAllFolders(): void {
    localStorage.removeItem(FOLDERS_STORAGE_KEY);
  }

  // Function to clean up duplicate materials in folders
  static cleanupDuplicateMaterials(): boolean {
    try {
      const folders = this.getAllFolders();
      const seenMaterials = new Set<string>();
      let hasChanges = false;

      const cleanedFolders = folders.map(folder => {
        const originalLength = folder.materialIds.length;
        const uniqueMaterials = folder.materialIds.filter(materialId => {
          if (seenMaterials.has(materialId)) {
            return false; // Remove duplicate
          }
          seenMaterials.add(materialId);
          return true;
        });

        if (uniqueMaterials.length !== originalLength) {
          hasChanges = true;
          console.log(`Removed ${originalLength - uniqueMaterials.length} duplicate materials from folder ${folder.name}`);
        }

        return {
          ...folder,
          materialIds: uniqueMaterials
        };
      });

      if (hasChanges) {
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(cleanedFolders));
        console.log('Cleaned up duplicate materials in folders');
      }

      return hasChanges;
    } catch (error) {
      console.error('Error cleaning up duplicate materials:', error);
      return false;
    }
  }

  // Function to remove material from all folders
  static removeMaterialFromAllFolders(materialId: string): boolean {
    try {
      console.log('FolderStorage.removeMaterialFromAllFolders called with materialId:', materialId);
      
      const folders = this.getAllFolders();
      console.log('Current folders count:', folders.length);
      
      let hasChanges = false;

      const updatedFolders = folders.map(folder => {
        const originalLength = folder.materialIds.length;
        const filteredMaterials = folder.materialIds.filter(id => id !== materialId);
        
        if (filteredMaterials.length !== originalLength) {
          console.log(`Removed material ${materialId} from folder ${folder.name}`);
          hasChanges = true;
        }

        return {
          ...folder,
          materialIds: filteredMaterials
        };
      });

      if (hasChanges) {
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(updatedFolders));
        console.log('Updated folders in localStorage');
      } else {
        console.log('No changes needed - material not found in any folder');
      }

      return hasChanges;
    } catch (error) {
      console.error('Error removing material from all folders:', error);
      return false;
    }
  }

  // Function for future migration to PostgreSQL
  static getDataForMigration() {
    return {
      lessons: LessonStorage.getAllLessons(),
      folders: this.getAllFolders(),
      version: '1.0.0',
      exportDate: new Date().toISOString()
    };
  }

  // Function for data integrity validation
  static validateDataIntegrity(): { isValid: boolean; errors: string[] } {
    const lessons = LessonStorage.getAllLessons();
    const folders = this.getAllFolders();
    const errors: string[] = [];

    // Check if all materials in folders exist
    folders.forEach(folder => {
      folder.materialIds.forEach(materialId => {
        const lesson = lessons.find(l => l.id === materialId);
        if (!lesson) {
          errors.push(`Material ${materialId} in folder ${folder.name} does not exist`);
        }
      });
    });

    // Check for duplicate materials in folders
    const allMaterialIds: string[] = [];
    folders.forEach(folder => {
      folder.materialIds.forEach(materialId => {
        if (allMaterialIds.includes(materialId)) {
          errors.push(`Material ${materialId} is duplicated across folders`);
        }
        allMaterialIds.push(materialId);
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Additional functions for future PostgreSQL API
export class DataMigrationHelper {
  // Structure for PostgreSQL schemas
  static getLessonSchema() {
    return {
      id: 'TEXT PRIMARY KEY',
      title: 'TEXT NOT NULL',
      description: 'TEXT',
      subject: 'TEXT NOT NULL',
      age_group: 'TEXT NOT NULL',
      duration: 'INTEGER NOT NULL',
      slides: 'JSONB NOT NULL',
      created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
      updated_at: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
      author_id: 'TEXT',
      thumbnail: 'TEXT',
      tags: 'TEXT[]',
      difficulty: 'TEXT CHECK (difficulty IN (\'easy\', \'medium\', \'hard\'))',
      views: 'INTEGER DEFAULT 0',
      rating: 'NUMERIC(3,2) DEFAULT 0',
      status: 'TEXT CHECK (status IN (\'draft\', \'published\', \'archived\')) DEFAULT \'draft\'',
      completion_rate: 'INTEGER DEFAULT 0'
    };
  }

  static getFolderSchema() {
    return {
      id: 'TEXT PRIMARY KEY',
      name: 'TEXT NOT NULL',
      color: 'TEXT NOT NULL',
      icon: 'TEXT NOT NULL',
      created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
      parent_id: 'TEXT REFERENCES folders(id)',
      material_ids: 'TEXT[]'
    };
  }

  // Converter for PostgreSQL-compatible format
  static convertToPostgreSQLFormat(data: any) {
    if (data.createdAt) {
      data.created_at = data.createdAt;
      delete data.createdAt;
    }
    if (data.updatedAt) {
      data.updated_at = data.updatedAt;
      delete data.updatedAt;
    }
    if (data.authorId) {
      data.author_id = data.authorId;
      delete data.authorId;
    }
    if (data.ageGroup) {
      data.age_group = data.ageGroup;
      delete data.ageGroup;
    }
    if (data.parentId) {
      data.parent_id = data.parentId;
      delete data.parentId;
    }
    if (data.materialIds) {
      data.material_ids = data.materialIds;
      delete data.materialIds;
    }
    return data;
  }
} 