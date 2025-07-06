'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Fab,
  useTheme,
  alpha,
  Stack,
  Divider,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import Layout from '@/components/layout/Layout';
import { LessonStorage, SavedLesson, FolderStorage, SavedFolder } from '@/utils/localStorage';
import {
  Search,
  MoreVertical,
  Delete,
  Edit,
  Plus,
  TrendingUp,
  Clock,
  BarChart3,
  BookOpen,
  Calculator,
  Palette,
  Music,
  Globe,
  Zap,
  Users,
  Heart,
  Folder,
  FolderOpen,
  FolderPlus,
  ChevronRight,
  ChevronLeft,
  Home,
  MoveHorizontal,
  X,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Trash2
} from 'lucide-react';

interface Material {
  id: number;
  title: string;
  description: string;
  type: string;
  subject: string;
  ageGroup: string;
  createdAt: string;
  lastModified: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  rating: number;
  duration: string;
  thumbnail: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  completionRate: number;
  folderId?: string;
  lessonId?: string; // Додаємо оригінальний ID уроку
}

interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  materialsCount: number;
  parentId?: string;
}

const MyMaterials = () => {
  const theme = useTheme();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderColor, setSelectedFolderColor] = useState('#1976d2');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedLessonForPreview, setSelectedLessonForPreview] = useState<SavedLesson | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  // Стани для редагування метаданих
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<SavedLesson | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    subject: '',
    ageGroup: ''
  });

  // Стани для видалення слайдів
  const [deleteSlideDialogOpen, setDeleteSlideDialogOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<{ slideId: string; slideIndex: number } | null>(null);

  // Стани для перестановки слайдів
  const [reorderMode, setReorderMode] = useState(false);
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);

  // Стани для drag and drop матеріалів
  const [draggedMaterial, setDraggedMaterial] = useState<Material | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [dragOverRoot, setDragOverRoot] = useState(false);
  const [dragOverCurrentFolder, setDragOverCurrentFolder] = useState(false);
  
  // Стани для контекстного меню переміщення
  const [moveMenuAnchorEl, setMoveMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [materialToMove, setMaterialToMove] = useState<Material | null>(null);

  // Стани для контекстного меню папок
  const [folderMenuAnchorEl, setFolderMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [editFolderDialogOpen, setEditFolderDialogOpen] = useState(false);
  const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false);
  const [editFolderFormData, setEditFolderFormData] = useState({
    name: '',
    color: '#1976d2'
  });

  // Стейт тільки для UI відображення - localStorage є єдиним джерелом правди
  const [folders, setFolders] = useState<Folder[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Стейт для FAB меню
  const [fabMenuAnchorEl, setFabMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Функція для очистки ageGroup від приставки "років"
  const cleanAgeGroup = (ageGroup: string): string => {
    return ageGroup.replace(/\s+років$/i, '').trim();
  };

  // Центральна функція синхронізації з localStorage
  const syncWithLocalStorage = () => {
    console.log('=== ПОЧАТОК СИНХРОНІЗАЦІЇ З LOCALSTORAGE ===');
    
    const lessons = LessonStorage.getAllLessons();
    const foldersData = FolderStorage.getAllFolders();
    
    console.log('Syncing with localStorage:', { 
      lessonsCount: lessons.length, 
      foldersCount: foldersData.length,
      lessonsData: lessons.map(l => ({ id: l.id, title: l.title })),
      foldersData: foldersData.map(f => ({ id: f.id, name: f.name, materialIds: f.materialIds }))
    });
    
    // Конвертуємо папки
    const convertedFolders: Folder[] = foldersData.map(folder => ({
      id: folder.id,
      name: folder.name,
      color: folder.color,
      icon: folder.icon,
      createdAt: folder.createdAt,
      materialsCount: folder.materialIds.length,
      parentId: folder.parentId
    }));
    console.log('Converted folders:', convertedFolders.length);
    setFolders(convertedFolders);

    // Конвертуємо матеріали
    const materials = convertLessonsToMaterials(lessons, foldersData);
    
    console.log('Converted materials:', materials.map(m => ({ 
      id: m.id, 
      title: m.title, 
      lessonId: m.lessonId, 
      folderId: m.folderId 
    })));
    
    setMaterials(materials);
    
    console.log('=== СИНХРОНІЗАЦІЯ ЗАВЕРШЕНА ===');
    console.log('Final state:', {
      foldersCount: convertedFolders.length,
      materialsCount: materials.length
    });
    
    return { lessons, folders: foldersData, materials };
  };

  // Функція для перетворення lessons в materials
  const convertLessonsToMaterials = (lessons: SavedLesson[], foldersData: SavedFolder[]): Material[] => {
    console.log('=== КОНВЕРТАЦІЯ LESSONS В MATERIALS ===');
    console.log('Input lessons:', lessons.map(l => ({ id: l.id, title: l.title })));
    
    // Створюємо карту для швидкого пошуку папки за ID матеріалу
    const materialToFolderMap = new Map<string, string>();
    foldersData.forEach(folder => {
      folder.materialIds.forEach(materialId => {
        materialToFolderMap.set(materialId, folder.id);
      });
    });
    
    console.log('Material to folder map:', Array.from(materialToFolderMap.entries()));
    
    const materials = lessons.map((lesson, index) => {
      const material = {
        id: parseInt(lesson.id.replace('lesson_', '')) || index + 1,
        title: lesson.title,
        description: lesson.description,
        type: 'lesson',
        subject: lesson.subject.toLowerCase(),
        ageGroup: cleanAgeGroup(lesson.ageGroup),
        createdAt: new Date(lesson.createdAt).toLocaleDateString('uk-UA'),
        lastModified: new Date(lesson.updatedAt).toLocaleDateString('uk-UA'),
        status: lesson.status,
        views: lesson.views,
        rating: lesson.rating,
        duration: `${lesson.duration} хв`,
        thumbnail: lesson.thumbnail,
        tags: lesson.tags,
        difficulty: lesson.difficulty,
        completionRate: lesson.completionRate,
        // Додаємо оригінальний lesson.id для надійного зв'язку
        lessonId: lesson.id,
        // Встановлюємо folderId якщо матеріал належить до папки
        folderId: materialToFolderMap.get(lesson.id)
      };
      
      console.log(`Converted lesson ${lesson.id} to material:`, {
        originalId: lesson.id,
        materialId: material.id,
        lessonId: material.lessonId,
        title: material.title,
        folderId: material.folderId
      });
      
      return material;
    });
    
    console.log('=== КОНВЕРТАЦІЯ ЗАВЕРШЕНА ===');
    return materials;
  };

  // Завантажуємо дані з localStorage при монтуванні компонента
  useEffect(() => {
    const loadData = async () => {
      try {
        // Симулюємо мінімальну затримку для показу loading
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Очищаємо дублікати матеріалів в папках
        FolderStorage.cleanupDuplicateMaterials();
        
        // Валідуємо цілісність даних
        const validation = FolderStorage.validateDataIntegrity();
        if (!validation.isValid) {
          console.warn('Data integrity issues found:', validation.errors);
        }
        
        // Синхронізуємо з localStorage
        syncWithLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);



  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'math': return Calculator;
      case 'english': return BookOpen;
      case 'art': return Palette;
      case 'science': return Globe;
      case 'music': return Music;
      default: return BookOpen;
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'math': return theme.palette.primary.main;
      case 'english': return theme.palette.secondary.main;
      case 'art': return '#e91e63';
      case 'science': return '#4caf50';
      case 'music': return '#ff9800';
      default: return theme.palette.grey[600];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return theme.palette.success.main;
      case 'draft': return theme.palette.warning.main;
      case 'archived': return theme.palette.grey[500];
      default: return theme.palette.grey[500];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Опубліковано';
      case 'draft': return 'Чернетка';
      case 'archived': return 'Архів';
      default: return status;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.palette.success.main;
      case 'medium': return theme.palette.warning.main;
      case 'hard': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || 
                         material.subject === selectedFilter || 
                         material.status === selectedFilter ||
                         material.type === selectedFilter;
    
    // Виправлено: на кореневому рівні показуємо тільки матеріали без папки
    const matchesFolder = currentFolderId === null 
      ? !material.folderId  // На кореневому рівні - тільки матеріали без папки
      : material.folderId === currentFolderId;  // В папці - тільки матеріали цієї папки
    
    return matchesSearch && matchesFilter && matchesFolder;
  });

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      case 'popular':
        return b.views - a.views;
      case 'rating':
        return b.rating - a.rating;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, material: Material) => {
    setAnchorEl(event.currentTarget);
    setSelectedMaterial(material);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMaterial(null);
  };

  const handleDeleteClick = () => {
    if (selectedMaterial) {
      setMaterialToDelete(selectedMaterial);
      setDeleteDialogOpen(true);
      handleMenuClose();
    }
  };

  const handleDeleteConfirm = () => {
    if (materialToDelete) {
      console.log('=== ПОЧАТОК ВИДАЛЕННЯ МАТЕРІАЛУ ===');
      console.log('Attempting to delete material:', materialToDelete);
      
      // Використовуємо lessonId для надійного пошуку
      const lessonId = materialToDelete.lessonId;
      
      console.log('LessonId extracted:', lessonId);
      console.log('LessonId type:', typeof lessonId);
      
      if (!lessonId) {
        console.error('No lessonId found in material');
        console.log('Material object keys:', Object.keys(materialToDelete));
        alert('Помилка: не знайдено ID уроку для видалення');
        setDeleteDialogOpen(false);
        setMaterialToDelete(null);
        return;
      }
      
      // Перевіряємо чи існує урок перед видаленням
      const existingLesson = LessonStorage.getLessonById(lessonId);
      console.log('Existing lesson found:', existingLesson);
      
      if (!existingLesson) {
        console.error('Lesson not found in localStorage');
        alert('Помилка: урок не знайдено в сховищі');
        setDeleteDialogOpen(false);
        setMaterialToDelete(null);
        return;
      }
      
      // Показуємо всі уроки перед видаленням
      const allLessons = LessonStorage.getAllLessons();
      console.log('All lessons before deletion:', allLessons.map(l => ({ id: l.id, title: l.title })));
      
      const deleteSuccess = LessonStorage.deleteLesson(lessonId);
      console.log('Delete operation result:', deleteSuccess);
      
      if (deleteSuccess) {
        // Перевіряємо чи дійсно видалено
        const lessonsAfterDeletion = LessonStorage.getAllLessons();
        console.log('All lessons after deletion:', lessonsAfterDeletion.map(l => ({ id: l.id, title: l.title })));
        
        // Видаляємо матеріал з усіх папок
        const folderRemovalResult = FolderStorage.removeMaterialFromAllFolders(lessonId);
        console.log('Folder removal result:', folderRemovalResult);
        
        // Синхронізуємо з localStorage
        console.log('Syncing with localStorage...');
        syncWithLocalStorage();
        
        console.log('=== УСПІШНЕ ВИДАЛЕННЯ ===');
        
        // Показуємо успішне повідомлення
        alert('Урок успішно видалено!');
      } else {
        console.error('=== ПОМИЛКА ВИДАЛЕННЯ ===');
        console.error('Failed to delete lesson from localStorage');
        alert('Помилка при видаленні уроку');
      }
    } else {
      console.error('No material to delete');
    }
    setDeleteDialogOpen(false);
    setMaterialToDelete(null);
  };

  // Функції редагування метаданих
  const handleEditClick = () => {
    if (selectedMaterial) {
      // Спочатку пробуємо знайти за lessonId, якщо є, інакше за назвою
      let lesson: SavedLesson | null = null;
      
      if (selectedMaterial.lessonId) {
        lesson = LessonStorage.getLessonById(selectedMaterial.lessonId);
      } else {
        // Fallback - пошук за назвою (менш надійно)
        const lessons = LessonStorage.getAllLessons();
        lesson = lessons.find(l => l.title === selectedMaterial.title) || null;
      }
      
      if (lesson) {
        setEditingLesson(lesson);
        setEditFormData({
          title: lesson.title,
          description: lesson.description,
          subject: lesson.subject,
          ageGroup: lesson.ageGroup
        });
        setEditDialogOpen(true);
        handleMenuClose();
      }
    }
  };

  const handleEditSave = () => {
    if (editingLesson) {
      const success = LessonStorage.updateLesson(editingLesson.id, {
        title: editFormData.title.trim(),
        description: editFormData.description.trim(),
        subject: editFormData.subject.trim(),
        ageGroup: editFormData.ageGroup.trim()
      });

      if (success) {
        // Синхронізуємо з localStorage
        syncWithLocalStorage();
        
        setEditDialogOpen(false);
        setEditingLesson(null);
      }
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditingLesson(null);
    setEditFormData({ title: '', description: '', subject: '', ageGroup: '' });
  };

  // Функції для видалення слайдів
  const handleDeleteSlideClick = (slideIndex: number) => {
    if (selectedLessonForPreview && selectedLessonForPreview.slides[slideIndex]) {
      setSlideToDelete({
        slideId: selectedLessonForPreview.slides[slideIndex].id,
        slideIndex
      });
      setDeleteSlideDialogOpen(true);
    }
  };

  const handleDeleteSlideConfirm = () => {
    if (slideToDelete && selectedLessonForPreview) {
      // Не дозволяємо видалити останній слайд
      if (selectedLessonForPreview.slides.length === 1) {
        alert('Не можна видалити останній слайд уроку');
        setDeleteSlideDialogOpen(false);
        setSlideToDelete(null);
        return;
      }

      // Альтернативний спосіб видалення - за індексом, якщо ID не працює
      let success = false;
      
      if (slideToDelete.slideId) {
        success = LessonStorage.deleteSlide(selectedLessonForPreview.id, slideToDelete.slideId);
      }
      
      // Якщо видалення за ID не спрацювало, пробуємо видалити за індексом
      if (!success) {
        const updatedSlides = selectedLessonForPreview.slides.filter((_, index) => index !== slideToDelete.slideIndex);
        success = LessonStorage.updateLesson(selectedLessonForPreview.id, { slides: updatedSlides });
      }
      
      if (success) {
        // Оновлюємо локальні стани з localStorage
        const updatedLesson = LessonStorage.getLessonById(selectedLessonForPreview.id);
        
        if (updatedLesson) {
          setSelectedLessonForPreview(updatedLesson);
          
          // Синхронізуємо з localStorage
          syncWithLocalStorage();

          // Коригуємо currentSlideIndex якщо потрібно
          if (slideToDelete.slideIndex <= currentSlideIndex && currentSlideIndex > 0) {
            setCurrentSlideIndex(currentSlideIndex - 1);
          } else if (currentSlideIndex >= updatedLesson.slides.length) {
            setCurrentSlideIndex(updatedLesson.slides.length - 1);
          }
        }
      } else {
        alert('Помилка при видаленні слайду');
      }
      
      setDeleteSlideDialogOpen(false);
      setSlideToDelete(null);
    }
  };

  const handleDeleteSlideCancel = () => {
    setDeleteSlideDialogOpen(false);
    setSlideToDelete(null);
  };

  // Функції для перестановки слайдів
  const handleReorderModeToggle = () => {
    setReorderMode(!reorderMode);
  };

  const handleDragStart = (e: React.DragEvent, slideIndex: number) => {
    setDraggedSlideIndex(slideIndex);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (draggedSlideIndex === null || !selectedLessonForPreview || draggedSlideIndex === targetIndex) {
      setDraggedSlideIndex(null);
      return;
    }

    const slides = [...selectedLessonForPreview.slides];
    const draggedSlide = slides[draggedSlideIndex];
    
    // Видаляємо слайд з поточної позиції
    slides.splice(draggedSlideIndex, 1);
    
    // Вставляємо слайд в нову позицію
    slides.splice(targetIndex, 0, draggedSlide);

    // Оновлюємо в localStorage
    const success = LessonStorage.updateSlideOrder(selectedLessonForPreview.id, slides);
    
    if (success) {
      // Оновлюємо локальні стани
      const updatedLesson = LessonStorage.getLessonById(selectedLessonForPreview.id);
      if (updatedLesson) {
        setSelectedLessonForPreview(updatedLesson);
        
        // Синхронізуємо з localStorage
        syncWithLocalStorage();

        // Оновлюємо currentSlideIndex
        if (draggedSlideIndex === currentSlideIndex) {
          setCurrentSlideIndex(targetIndex);
        } else if (draggedSlideIndex < currentSlideIndex && targetIndex >= currentSlideIndex) {
          setCurrentSlideIndex(currentSlideIndex - 1);
        } else if (draggedSlideIndex > currentSlideIndex && targetIndex <= currentSlideIndex) {
          setCurrentSlideIndex(currentSlideIndex + 1);
        }
      }
    }

    setDraggedSlideIndex(null);
  };

  const moveSlideUp = (slideIndex: number) => {
    if (slideIndex === 0 || !selectedLessonForPreview) return;
    
    const slides = [...selectedLessonForPreview.slides];
    [slides[slideIndex - 1], slides[slideIndex]] = [slides[slideIndex], slides[slideIndex - 1]];

    const success = LessonStorage.updateSlideOrder(selectedLessonForPreview.id, slides);
    
    if (success) {
      const updatedLesson = LessonStorage.getLessonById(selectedLessonForPreview.id);
      if (updatedLesson) {
        setSelectedLessonForPreview(updatedLesson);
        // Синхронізуємо з localStorage
        syncWithLocalStorage();

        if (currentSlideIndex === slideIndex) {
          setCurrentSlideIndex(slideIndex - 1);
        } else if (currentSlideIndex === slideIndex - 1) {
          setCurrentSlideIndex(slideIndex);
        }
      }
    }
  };

  const moveSlideDown = (slideIndex: number) => {
    if (!selectedLessonForPreview || slideIndex === selectedLessonForPreview.slides.length - 1) return;
    
    const slides = [...selectedLessonForPreview.slides];
    [slides[slideIndex], slides[slideIndex + 1]] = [slides[slideIndex + 1], slides[slideIndex]];

    const success = LessonStorage.updateSlideOrder(selectedLessonForPreview.id, slides);
    
    if (success) {
      const updatedLesson = LessonStorage.getLessonById(selectedLessonForPreview.id);
      if (updatedLesson) {
        setSelectedLessonForPreview(updatedLesson);
        // Синхронізуємо з localStorage
        syncWithLocalStorage();

        if (currentSlideIndex === slideIndex) {
          setCurrentSlideIndex(slideIndex + 1);
        } else if (currentSlideIndex === slideIndex + 1) {
          setCurrentSlideIndex(slideIndex);
        }
      }
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: SavedFolder = {
        id: `folder_${Date.now()}`,
        name: newFolderName.trim(),
        color: selectedFolderColor,
        icon: '📁',
        createdAt: new Date().toISOString(),
        materialIds: [],
      };
      
      // Зберігаємо в localStorage
      const success = FolderStorage.saveFolder(newFolder);
      
      if (success) {
        // Оновлюємо локальний стан
        const convertedFolder: Folder = {
          id: newFolder.id,
          name: newFolder.name,
          color: newFolder.color,
          icon: newFolder.icon,
          createdAt: newFolder.createdAt,
          materialsCount: newFolder.materialIds.length,
          parentId: newFolder.parentId
        };
        setFolders(prev => [...prev, convertedFolder]);
        setNewFolderName('');
        setSelectedFolderColor('#1976d2');
        setFolderDialogOpen(false);
      }
    }
  };

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId);
  };

  const handleBackToRoot = () => {
    setCurrentFolderId(null);
  };

  const handleDeleteFolder = (folderId: string) => {
    console.log('handleDeleteFolder called with folderId:', folderId);
    const success = FolderStorage.deleteFolder(folderId);
    console.log('FolderStorage.deleteFolder result:', success);
    
    if (success) {
      console.log('Folder deleted successfully, syncing with localStorage');
      // Синхронізуємо з localStorage
      syncWithLocalStorage();
      
      // Якщо ми в папці яку видаляємо, повертаємось до кореня
      if (currentFolderId === folderId) {
        console.log('Returning to root folder');
        setCurrentFolderId(null);
      }
    } else {
      console.error('Failed to delete folder');
    }
  };

  // Функції для контекстного меню папок
  const handleFolderMenuOpen = (event: React.MouseEvent<HTMLElement>, folder: Folder) => {
    event.stopPropagation();
    setFolderMenuAnchorEl(event.currentTarget);
    setSelectedFolder(folder);
  };

  const handleFolderMenuClose = () => {
    setFolderMenuAnchorEl(null);
    setSelectedFolder(null);
  };

  const handleEditFolderClick = () => {
    if (selectedFolder) {
      setEditFolderFormData({
        name: selectedFolder.name,
        color: selectedFolder.color
      });
      setEditFolderDialogOpen(true);
      handleFolderMenuClose();
    }
  };

  const handleEditFolderSave = () => {
    if (selectedFolder) {
      const success = FolderStorage.updateFolder(selectedFolder.id, {
        name: editFolderFormData.name.trim(),
        color: editFolderFormData.color
      });

      if (success) {
        // Синхронізуємо з localStorage
        syncWithLocalStorage();
        
        setEditFolderDialogOpen(false);
        setSelectedFolder(null);
      }
    }
  };

  const handleEditFolderCancel = () => {
    setEditFolderDialogOpen(false);
    setSelectedFolder(null);
    setEditFolderFormData({ name: '', color: '#1976d2' });
  };

  const handleDeleteFolderClick = () => {
    setDeleteFolderDialogOpen(true);
    // НЕ викликаємо handleFolderMenuClose() тут, щоб зберегти selectedFolder
    setFolderMenuAnchorEl(null); // Закриваємо тільки меню
  };

  const handleDeleteFolderConfirm = () => {
    console.log('handleDeleteFolderConfirm called, selectedFolder:', selectedFolder);
    if (selectedFolder) {
      console.log('Attempting to delete folder:', selectedFolder.id, selectedFolder.name);
      handleDeleteFolder(selectedFolder.id);
      setDeleteFolderDialogOpen(false);
      setSelectedFolder(null);
    } else {
      console.error('No selected folder to delete');
    }
  };

  const handleDeleteFolderCancel = () => {
    setDeleteFolderDialogOpen(false);
    setSelectedFolder(null);
  };

  // Функції для FAB меню
  const handleFabMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFabMenuAnchorEl(event.currentTarget);
  };

  const handleFabMenuClose = () => {
    setFabMenuAnchorEl(null);
  };

  const handleCreateLesson = () => {
    handleFabMenuClose();
    // Перенаправляємо на сторінку чату
    router.push('/chat');
  };

  const handleCreateFolderFromFab = () => {
    handleFabMenuClose();
    setFolderDialogOpen(true);
  };

  // Функції для drag and drop матеріалів
  const handleMaterialDragStart = (e: React.DragEvent, material: Material) => {
    console.log('Drag start for material:', material.title);
    setDraggedMaterial(material);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', material.id.toString());
    
    // Додаємо затримку для запобігання конфлікту з click
    setTimeout(() => {
      console.log('Drag started successfully');
    }, 0);
  };

  const handleMaterialDragEnd = () => {
    console.log('Drag end');
    setDraggedMaterial(null);
    setDragOverFolder(null);
    setDragOverRoot(false);
    setDragOverCurrentFolder(false);
  };

  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolder(folderId);
    console.log('Drag over folder:', folderId);
  };

  const handleFolderDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Перевіряємо чи курсор дійсно покинув область папки
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverFolder(null);
      console.log('Drag leave folder');
    }
  };

  const handleFolderDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drop on folder:', targetFolderId);
    
    if (!draggedMaterial) {
      console.log('No dragged material');
      return;
    }
    
    moveMaterialToFolder(draggedMaterial, targetFolderId);
    setDraggedMaterial(null);
    setDragOverFolder(null);
  };

  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverRoot(true);
    console.log('Drag over root');
  };

  const handleRootDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Перевіряємо чи курсор дійсно покинув область
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverRoot(false);
      console.log('Drag leave root');
    }
  };

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drop on root');
    
    if (!draggedMaterial) {
      console.log('No dragged material for root drop');
      return;
    }
    
    moveMaterialToFolder(draggedMaterial, null);
    setDraggedMaterial(null);
    setDragOverFolder(null);
    setDragOverRoot(false);
  };

  const handleCurrentFolderDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCurrentFolder(true);
    console.log('Drag over current folder');
  };

  const handleCurrentFolderDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Перевіряємо чи курсор дійсно покинув область
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverCurrentFolder(false);
      console.log('Drag leave current folder');
    }
  };

  const handleCurrentFolderDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drop on current folder');
    
    if (!draggedMaterial || !currentFolderId) {
      console.log('No dragged material or current folder for drop');
      return;
    }
    
    moveMaterialToFolder(draggedMaterial, currentFolderId);
    setDraggedMaterial(null);
    setDragOverFolder(null);
    setDragOverCurrentFolder(false);
  };

  const moveMaterialToFolder = (material: Material, targetFolderId: string | null) => {
    if (!material.lessonId) {
      console.warn('Material has no lessonId:', material);
      return;
    }

    console.log('Moving material:', {
      materialId: material.lessonId,
      materialTitle: material.title,
      fromFolder: material.folderId,
      toFolder: targetFolderId
    });

    // Перевіряємо чи це не переміщення в ту ж папку
    if (material.folderId === targetFolderId) {
      console.log('Material is already in the target folder');
      return;
    }

    // Спочатку видаляємо матеріал з усіх папок щоб уникнути дублікатів
    console.log('Removing material from all folders');
    const removeSuccess = FolderStorage.removeMaterialFromAllFolders(material.lessonId);
    console.log('Remove from all folders result:', removeSuccess);

    // Потім додаємо в цільову папку, якщо потрібно
    if (targetFolderId) {
      console.log('Adding to folder:', targetFolderId);
      const addSuccess = FolderStorage.addMaterialToFolder(targetFolderId, material.lessonId);
      console.log('Add to folder result:', addSuccess);
      
      if (!addSuccess) {
        console.error('Failed to add material to folder');
        return;
      }
    }

    // Перезавантажуємо дані з localStorage для синхронізації
    console.log('Syncing with localStorage after move');
    syncWithLocalStorage();
    
    // Додаткова перевірка що переміщення відбулося
    setTimeout(() => {
      const updatedFolders = FolderStorage.getAllFolders();
      const targetFolder = updatedFolders.find(f => f.id === targetFolderId);
      console.log('Target folder after move:', targetFolder);
      
      if (targetFolder && !targetFolder.materialIds.includes(material.lessonId!)) {
        console.error('Material was not properly moved to target folder');
      } else {
        console.log('Material successfully moved');
      }
    }, 100);
  };

  // Функції для контекстного меню переміщення
  const handleMoveMenuOpen = (event: React.MouseEvent<HTMLElement>, material: Material) => {
    setMoveMenuAnchorEl(event.currentTarget);
    setMaterialToMove(material);
  };

  const handleMoveMenuClose = () => {
    setMoveMenuAnchorEl(null);
    setMaterialToMove(null);
  };

  const handleMoveToFolder = (targetFolderId: string | null) => {
    if (materialToMove) {
      moveMaterialToFolder(materialToMove, targetFolderId);
      handleMoveMenuClose();
    }
  };

  const handlePreviewLesson = (material: Material) => {
    // Знаходимо відповідний урок в localStorage
    let lesson: SavedLesson | null = null;
    
    if (material.lessonId) {
      lesson = LessonStorage.getLessonById(material.lessonId);
    } else {
      // Fallback - пошук за назвою (менш надійно)
      const lessons = LessonStorage.getAllLessons();
      lesson = lessons.find(l => l.title === material.title) || null;
    }
    
    if (lesson) {
      setSelectedLessonForPreview(lesson);
      setCurrentSlideIndex(0);
      setPreviewDialogOpen(true);
      // Збільшуємо кількість переглядів
      LessonStorage.incrementViews(lesson.id);
      
      // Синхронізуємо з localStorage
      syncWithLocalStorage();
    }
  };

  const handleClosePreview = () => {
    setPreviewDialogOpen(false);
    setSelectedLessonForPreview(null);
    setCurrentSlideIndex(0);
  };

  const goToNextSlide = () => {
    if (selectedLessonForPreview && currentSlideIndex < selectedLessonForPreview.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const currentFolder = folders.find(f => f.id === currentFolderId);

  const renderFolderCard = (folder: Folder) => {
    const isDragOver = dragOverFolder === folder.id;
    
    return (
      <Card
        key={folder.id}
        onDragOver={(e) => handleFolderDragOver(e, folder.id)}
        onDragLeave={handleFolderDragLeave}
        onDrop={(e) => handleFolderDrop(e, folder.id)}
        sx={{
          borderRadius: '16px',
          border: isDragOver 
            ? `2px dashed ${folder.color}` 
            : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: isDragOver 
            ? alpha(folder.color, 0.05) 
            : 'white',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          transform: isDragOver ? 'scale(1.02)' : 'none',
          '&:hover': {
            transform: isDragOver ? 'scale(1.02)' : 'translateY(-4px)',
            boxShadow: `0 8px 25px ${alpha(folder.color, 0.15)}`,
            borderColor: alpha(folder.color, 0.2),
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box 
              onClick={(e) => {
                e.stopPropagation();
                handleFolderClick(folder.id);
              }}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                flex: 1,
                cursor: 'pointer'
              }}
            >
              <Folder 
                size={24} 
                color={folder.color}
                style={{ flexShrink: 0 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    mb: 0.5
                  }}
                >
                  {folder.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {folder.materialsCount} матеріалів
                </Typography>
              </Box>
              <ChevronRight size={20} color={theme.palette.text.secondary} />
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleFolderMenuOpen(e, folder);
              }}
              sx={{ color: theme.palette.text.secondary }}
            >
              <MoreVertical size={18} />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <Typography variant="caption" color="text.secondary">
              Створено: {new Date(folder.createdAt).toLocaleDateString('uk-UA')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderMaterialCard = (material: Material) => {
    const SubjectIcon = getSubjectIcon(material.subject);
    const isDragging = draggedMaterial?.id === material.id;
    
    return (
      <Card
        key={material.id}
        onClick={() => handlePreviewLesson(material)}
        sx={{
          borderRadius: '16px',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: 'white',
          transition: 'all 0.3s ease',
          opacity: isDragging ? 0.5 : 1,
          position: 'relative',
          cursor: 'pointer',
          '&:hover': {
            transform: isDragging ? 'none' : 'translateY(-4px)',
            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
            borderColor: alpha(theme.palette.primary.main, 0.2),
          }
        }}
      >
        {/* Thumbnail Preview */}
        {material.thumbnail && (
          <Box
            sx={{
              height: 120,
              width: '100%',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '16px 16px 0 0',
              backgroundColor: alpha(theme.palette.grey[100], 0.5)
            }}
          >
            <img
              src={material.thumbnail}
              alt={`Превью ${material.title}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '16px 16px 0 0'
              }}
              onError={(e) => {
                // Fallback to a placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const placeholder = target.nextElementSibling as HTMLElement;
                if (placeholder) {
                  placeholder.style.display = 'flex';
                }
              }}
            />
            {/* Fallback placeholder */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.grey[200], 0.8),
                borderRadius: '16px 16px 0 0'
              }}
            >
              <BookOpen size={32} color={theme.palette.text.secondary} />
            </Box>
            {/* Overlay for status */}
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: getStatusColor(material.status),
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}
            >
              {getStatusLabel(material.status)}
            </Box>
          </Box>
        )}
        
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
              <Box 
                draggable
                onDragStart={(e) => handleMaterialDragStart(e, material)}
                onDragEnd={handleMaterialDragEnd}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flex: 1,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
              >
                <GripVertical size={16} color={theme.palette.text.secondary} style={{ flexShrink: 0 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    lineHeight: 1.3,
                    userSelect: 'none'
                  }}
                >
                  {material.title}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuOpen(e, material);
                }}
                sx={{ color: theme.palette.text.secondary }}
              >
                <MoreVertical size={18} />
              </IconButton>
            </Box>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {material.description}
              </Typography>
              
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip
                icon={<SubjectIcon size={14} />}
                label={material.subject}
                size="small"
                sx={{
                  backgroundColor: alpha(getSubjectColor(material.subject), 0.1),
                  color: getSubjectColor(material.subject),
                  fontWeight: 500
                }}
              />
              <Tooltip title={`Вік: ${material.ageGroup} років`} arrow>
                <Chip
                  label={material.ageGroup}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              </Tooltip>
              <Tooltip title={`Тривалість: ${material.duration}`} arrow>
                <Chip
                  icon={<Clock size={14} />}
                  label={material.duration}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.75rem',
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                    borderColor: alpha(theme.palette.info.main, 0.3)
                  }}
                />
              </Tooltip>
            </Box>
          </Box>
          
          {material.status === 'published' && material.completionRate > 0 && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Рівень завершення
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {material.completionRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={material.completionRate}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    backgroundColor: theme.palette.primary.main
                  }
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

    // Loading state
  if (isLoading) {
    return (
      <Layout title="Мої матеріали" breadcrumbs={[{ label: 'Мої матеріали' }]}>
        <Box 
          sx={{ 
            width: '100%',
            height: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            Завантаження матеріалів...
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Мої матеріали" breadcrumbs={[{ label: 'Мої матеріали' }]}>
      <Box sx={{ width: '100%' }}>


        {/* Breadcrumbs */}
        {currentFolderId && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: '12px',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={handleBackToRoot}
                sx={{
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <Home size={18} />
              </IconButton>
              <ChevronRight size={16} color={theme.palette.text.disabled} />
              <Chip
                icon={<FolderOpen size={14} />}
                label={currentFolder?.name}
                sx={{
                  backgroundColor: alpha(currentFolder?.color || theme.palette.primary.main, 0.1),
                  color: currentFolder?.color || theme.palette.primary.main,
                  fontWeight: 500
                }}
              />
            </Box>
          </Paper>
        )}

        {/* Filters and Controls */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '16px',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            backgroundColor: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <TextField
                placeholder="Пошук матеріалів..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  )
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Фільтр</InputLabel>
                <Select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  label="Фільтр"
                >
                  <MenuItem value="all">Всі</MenuItem>
                  <MenuItem value="published">Опубліковані</MenuItem>
                  <MenuItem value="draft">Чернетки</MenuItem>
                  <MenuItem value="archived">Архів</MenuItem>
                  <MenuItem value="math">Математика</MenuItem>
                  <MenuItem value="english">Англійська</MenuItem>
                  <MenuItem value="art">Мистецтво</MenuItem>
                  <MenuItem value="science">Наука</MenuItem>
                  <MenuItem value="music">Музика</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Сортування</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Сортування"
                >
                  <MenuItem value="recent">За датою</MenuItem>
                  <MenuItem value="popular">За популярністю</MenuItem>
                  <MenuItem value="rating">За рейтингом</MenuItem>
                  <MenuItem value="title">За назвою</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {/* Debug buttons - remove in production */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  console.log('=== DEBUG INFO ===');
                  console.log('Current materials:', materials);
                  console.log('Current folders:', folders);
                  console.log('localStorage lessons:', LessonStorage.getAllLessons());
                  console.log('localStorage folders:', FolderStorage.getAllFolders());
                }}
                sx={{ textTransform: 'none' }}
              >
                Debug Info
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="warning"
                onClick={() => {
                  const confirmed = window.confirm('Створити тестовий урок для перевірки видалення?');
                  if (confirmed) {
                    const testLesson = {
                      id: `lesson_${Date.now()}`,
                      title: 'Тестовий урок для видалення',
                      description: 'Це тестовий урок для перевірки функціональності видалення',
                      subject: 'Математика',
                      ageGroup: '8-9 років',
                      duration: 30,
                      slides: [
                        {
                          id: `slide_${Date.now()}`,
                          title: 'Тестовий слайд',
                          content: 'Тестовий контент',
                          htmlContent: '<h1>Тестовий слайд</h1><p>Тестовий контент</p>',
                          type: 'content' as const,
                          status: 'completed' as const
                        }
                      ],
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      authorId: 'test_user',
                      thumbnail: '',
                      tags: ['тест'],
                      difficulty: 'easy' as const,
                      views: 0,
                      rating: 0,
                      status: 'draft' as const,
                      completionRate: 0
                    };
                    
                    const success = LessonStorage.saveLesson(testLesson);
                    if (success) {
                      console.log('Тестовий урок створено:', testLesson);
                      syncWithLocalStorage();
                      alert('Тестовий урок створено!');
                    } else {
                      console.error('Помилка створення тестового уроку');
                      alert('Помилка створення тестового уроку');
                    }
                  }
                }}
                sx={{ textTransform: 'none' }}
              >
                Створити тест
              </Button>
            </Box>

          </Box>
        </Paper>

        {/* Content Grid - Folders and Materials */}
        {(currentFolderId ? sortedMaterials.length > 0 : (folders.length > 0 || sortedMaterials.length > 0)) ? (
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 3,
              borderRadius: '12px',
              border: (!currentFolderId && dragOverRoot) || (currentFolderId && dragOverCurrentFolder)
                ? `2px dashed ${currentFolder?.color || theme.palette.primary.main}` 
                : '2px solid transparent',
              backgroundColor: (!currentFolderId && dragOverRoot) || (currentFolderId && dragOverCurrentFolder)
                ? alpha(currentFolder?.color || theme.palette.primary.main, 0.05) 
                : 'transparent',
              transition: 'all 0.3s ease',
              padding: ((!currentFolderId && dragOverRoot) || (currentFolderId && dragOverCurrentFolder)) ? 2 : 0,
            }}
            onDragOver={!currentFolderId ? handleRootDragOver : handleCurrentFolderDragOver}
            onDragLeave={!currentFolderId ? handleRootDragLeave : handleCurrentFolderDragLeave}
            onDrop={!currentFolderId ? handleRootDrop : handleCurrentFolderDrop}
          >
            {/* Show folders only in root */}
            {!currentFolderId && folders.map((folder) => renderFolderCard(folder))}
            
            {/* Show materials */}
            {sortedMaterials.map((material) => renderMaterialCard(material))}
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: '16px',
              border: (!currentFolderId && dragOverRoot) || (currentFolderId && dragOverCurrentFolder)
                ? `2px dashed ${currentFolder?.color || theme.palette.primary.main}` 
                : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: (!currentFolderId && dragOverRoot) || (currentFolderId && dragOverCurrentFolder)
                ? alpha(currentFolder?.color || theme.palette.primary.main, 0.05) 
                : 'white',
              transition: 'all 0.3s ease',
              transform: ((!currentFolderId && dragOverRoot) || (currentFolderId && dragOverCurrentFolder)) ? 'scale(1.02)' : 'none',
            }}
            onDragOver={!currentFolderId ? handleRootDragOver : handleCurrentFolderDragOver}
            onDragLeave={!currentFolderId ? handleRootDragLeave : handleCurrentFolderDragLeave}
            onDrop={!currentFolderId ? handleRootDrop : handleCurrentFolderDrop}
          >
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>
              {(!currentFolderId && dragOverRoot) 
                ? 'Перемістити в кореневий каталог' 
                : (currentFolderId && dragOverCurrentFolder)
                  ? `Перемістити в папку "${currentFolder?.name}"`
                  : 'Матеріали не знайдено'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {(!currentFolderId && dragOverRoot) 
                ? 'Відпустіть, щоб перемістити матеріал в кореневий каталог'
                : (currentFolderId && dragOverCurrentFolder)
                  ? `Відпустіть, щоб перемістити матеріал в папку "${currentFolder?.name}"`
                  : 'Спробуйте змінити фільтри або створити новий матеріал'}
            </Typography>
            {!dragOverRoot && !dragOverCurrentFolder && (
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={handleCreateLesson}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                }}
              >
                Створити матеріал
              </Button>
            )}
          </Paper>
        )}

        {/* Floating Action Button */}
        <Fab
          color="primary"
          onClick={handleFabMenuOpen}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
            }
          }}
        >
          <Plus size={24} />
        </Fab>

        {/* FAB Menu */}
        <Menu
          anchorEl={fabMenuAnchorEl}
          open={Boolean(fabMenuAnchorEl)}
          onClose={handleFabMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              borderRadius: '12px',
              minWidth: 200,
              mb: 1
            },
          }}
        >
          <MenuItem onClick={handleCreateLesson}>
            <ListItemIcon>
              <BookOpen size={18} />
            </ListItemIcon>
            <ListItemText>Урок</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleCreateFolderFromFab}>
            <ListItemIcon>
              <FolderPlus size={18} />
            </ListItemIcon>
            <ListItemText>Папка</ListItemText>
          </MenuItem>
        </Menu>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              borderRadius: '12px',
              minWidth: 200,
            },
          }}
        >
          <MenuItem onClick={handleEditClick}>
            <ListItemIcon>
              <Edit size={18} />
            </ListItemIcon>
            <ListItemText>Редагувати</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={(e) => {
            handleMoveMenuOpen(e, selectedMaterial!);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <MoveHorizontal size={18} />
            </ListItemIcon>
            <ListItemText>Перемістити</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleDeleteClick} sx={{ color: theme.palette.error.main }}>
            <ListItemIcon>
              <Delete size={18} color={theme.palette.error.main} />
            </ListItemIcon>
            <ListItemText>Видалити</ListItemText>
          </MenuItem>
        </Menu>

        {/* Create Folder Dialog */}
        <Dialog
          open={folderDialogOpen}
          onClose={() => setFolderDialogOpen(false)}
          PaperProps={{
            sx: { borderRadius: '16px', minWidth: 400 }
          }}
        >
          <DialogTitle>Створити нову папку</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Назва папки"
              fullWidth
              variant="outlined"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Колір папки:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#d32f2f', '#0288d1', '#689f38'].map((color) => (
                <Box
                  key={color}
                  onClick={() => setSelectedFolderColor(color)}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: color,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: selectedFolderColor === color ? '3px solid #000' : '2px solid transparent',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      transition: 'transform 0.2s'
                    }
                  }}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setFolderDialogOpen(false)} sx={{ textTransform: 'none' }}>
              Скасувати
            </Button>
            <Button 
              onClick={handleCreateFolder} 
              variant="contained"
              disabled={!newFolderName.trim()}
              sx={{ textTransform: 'none', borderRadius: '8px' }}
            >
              Створити
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setMaterialToDelete(null);
          }}
          PaperProps={{
            sx: { borderRadius: '16px' }
          }}
        >
          <DialogTitle>Видалити матеріал?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Ви впевнені, що хочете видалити "{materialToDelete?.title}"? Цю дію неможливо скасувати.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={() => {
                setDeleteDialogOpen(false);
                setMaterialToDelete(null);
              }} 
              sx={{ textTransform: 'none' }}
            >
              Скасувати
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
              sx={{ textTransform: 'none', borderRadius: '8px' }}
            >
              Видалити
            </Button>
          </DialogActions>
        </Dialog>

        {/* Move to Folder Menu */}
        <Menu
          anchorEl={moveMenuAnchorEl}
          open={Boolean(moveMenuAnchorEl)}
          onClose={handleMoveMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              borderRadius: '12px',
              minWidth: 250,
              maxHeight: 300,
            },
          }}
        >
          <MenuItem onClick={() => handleMoveToFolder(null)}>
            <ListItemIcon>
              <Home size={18} />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">
                Кореневий каталог
              </Typography>
            </ListItemText>
          </MenuItem>
          {folders.length > 0 && <Divider />}
          {folders
            .filter(folder => folder.id !== materialToMove?.folderId)
            .map((folder) => (
              <MenuItem 
                key={folder.id} 
                onClick={() => handleMoveToFolder(folder.id)}
                sx={{
                  '&:hover': {
                    backgroundColor: alpha(folder.color, 0.1)
                  }
                }}
              >
                <ListItemIcon>
                  <Folder size={18} style={{ color: folder.color }} />
                </ListItemIcon>
                <ListItemText>
                  <Typography variant="body2">
                    {folder.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {folder.materialsCount} матеріалів
                  </Typography>
                </ListItemText>
              </MenuItem>
            ))}
          {folders.filter(folder => folder.id !== materialToMove?.folderId).length === 0 && folders.length > 0 && (
            <MenuItem disabled>
              <ListItemText>
                <Typography variant="body2" color="text.secondary">
                  Немає доступних папок
                </Typography>
              </ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* Folder Context Menu */}
        <Menu
          anchorEl={folderMenuAnchorEl}
          open={Boolean(folderMenuAnchorEl)}
          onClose={handleFolderMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              borderRadius: '12px',
              minWidth: 200,
            },
          }}
        >
          <MenuItem onClick={handleEditFolderClick}>
            <ListItemIcon>
              <Folder size={18} />
            </ListItemIcon>
            <ListItemText>Редагувати папку</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleDeleteFolderClick} sx={{ color: theme.palette.error.main }}>
            <ListItemIcon>
              <Delete size={18} color={theme.palette.error.main} />
            </ListItemIcon>
            <ListItemText>Видалити папку</ListItemText>
          </MenuItem>
        </Menu>

        {/* Edit Folder Dialog */}
        <Dialog
          open={editFolderDialogOpen}
          onClose={handleEditFolderCancel}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,250,0.95) 100%)',
              backdropFilter: 'blur(10px)',
              minHeight: '400px'
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1.5, 
            pt: 2,
            px: 3,
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
            borderRadius: '16px 16px 0 0',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: '12px', 
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              minWidth: 40,
              minHeight: 40
            }}>
              📁
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                mb: 0.25,
                fontSize: '1.1rem'
              }}>
                Редагувати папку
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                fontSize: '0.8rem',
                lineHeight: 1.3
              }}>
                Змініть назву та колір папки
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 4, pb: 3, px: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2 }}>
              {/* Назва папки */}
              <TextField
                label="📁 Назва папки"
                variant="outlined"
                fullWidth
                value={editFolderFormData.name}
                onChange={(e) => setEditFolderFormData(prev => ({ ...prev, name: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.06),
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1rem',
                    fontWeight: 500
                  }
                }}
                placeholder="Введіть назву папки"
                required
              />

              {/* Колір папки */}
              <Box>
                <Typography variant="subtitle1" sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: '1rem'
                }}>
                  🎨 Колір папки
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#d32f2f', '#0288d1', '#689f38', '#e91e63'].map((color) => (
                    <Box
                      key={color}
                      onClick={() => setEditFolderFormData(prev => ({ ...prev, color }))}
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: color,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: editFolderFormData.color === color ? '3px solid #000' : '2px solid transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: `0 4px 12px ${alpha(color, 0.4)}`
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ 
            p: 3, 
            pt: 2,
            gap: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.8)} 0%, ${alpha(theme.palette.grey[100], 0.6)} 100%)`,
            borderRadius: '0 0 16px 16px'
          }}>
            <Button 
              onClick={handleEditFolderCancel}
              sx={{ 
                textTransform: 'none',
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.grey[400], 0.1),
                  color: theme.palette.text.primary
                }
              }}
            >
              Скасувати
            </Button>
            <Button 
              onClick={handleEditFolderSave}
              variant="contained"
              disabled={!editFolderFormData.name.trim()}
              sx={{ 
                textTransform: 'none',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: theme.palette.grey[300],
                  color: theme.palette.grey[500],
                  boxShadow: 'none'
                }
              }}
            >
              Зберегти зміни
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Folder Confirmation Dialog */}
        <Dialog
          open={deleteFolderDialogOpen}
          onClose={handleDeleteFolderCancel}
          PaperProps={{
            sx: { borderRadius: '16px' }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            color: theme.palette.error.main
          }}>
            <Delete size={24} />
            Видалити папку?
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Ви впевнені, що хочете видалити папку "{selectedFolder?.name}"? 
              <br /><br />
              Всі матеріали з цієї папки будуть переміщені в кореневий каталог. 
              Цю дію неможливо скасувати.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleDeleteFolderCancel} sx={{ textTransform: 'none' }}>
              Скасувати
            </Button>
            <Button 
              onClick={handleDeleteFolderConfirm} 
              color="error" 
              variant="contained"
              sx={{ textTransform: 'none', borderRadius: '8px' }}
            >
              Видалити папку
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Slide Confirmation Dialog */}
        <Dialog
          open={deleteSlideDialogOpen}
          onClose={handleDeleteSlideCancel}
          PaperProps={{
            sx: { borderRadius: '16px' }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            color: theme.palette.error.main
          }}>
            <Delete size={24} />
            Видалити слайд?
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Ви впевнені, що хочете видалити слайд {slideToDelete ? slideToDelete.slideIndex + 1 : ''} з уроку "{selectedLessonForPreview?.title}"? 
              <br /><br />
              Цю дію неможливо скасувати.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleDeleteSlideCancel} sx={{ textTransform: 'none' }}>
              Скасувати
            </Button>
            <Button 
              onClick={handleDeleteSlideConfirm} 
              color="error" 
              variant="contained"
              sx={{ textTransform: 'none', borderRadius: '8px' }}
            >
              Видалити
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Lesson Metadata Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={handleEditCancel}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,250,0.95) 100%)',
              backdropFilter: 'blur(10px)',
              minHeight: '500px'
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1.5, 
            pt: 2,
            px: 3,
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
            borderRadius: '16px 16px 0 0',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: '12px', 
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              minWidth: 40,
              minHeight: 40
            }}>
              ✏️
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                mb: 0.25,
                fontSize: '1.1rem'
              }}>
                Редагувати урок
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                fontSize: '0.8rem',
                lineHeight: 1.3
              }}>
                Змініть назву, опис та інші параметри уроку
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 4, pb: 3, px: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2 }}>
              {/* Назва уроку */}
              <TextField
                label="📚 Назва уроку"
                variant="outlined"
                fullWidth
                value={editFormData.title}
                onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.06),
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1rem',
                    fontWeight: 500
                  }
                }}
                placeholder="Введіть назву уроку"
                required
              />

              {/* Опис уроку */}
              <TextField
                label="📝 Опис уроку"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.06),
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1rem',
                    fontWeight: 500
                  }
                }}
                placeholder="Короткий опис змісту та мети уроку"
              />

              {/* Предмет/жанр */}
              <TextField
                label="🎯 Предмет/Жанр"
                variant="outlined"
                fullWidth
                select
                value={editFormData.subject}
                onChange={(e) => setEditFormData(prev => ({ ...prev, subject: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.06),
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1rem',
                    fontWeight: 500
                  }
                }}
              >
                <MenuItem value="Математика">🔢 Математика</MenuItem>
                <MenuItem value="Українська мова">🇺🇦 Українська мова</MenuItem>
                <MenuItem value="Англійська мова">🇬🇧 Англійська мова</MenuItem>
                <MenuItem value="Природознавство">🌿 Природознавство</MenuItem>
                <MenuItem value="Історія">📜 Історія</MenuItem>
                <MenuItem value="Географія">🌍 Географія</MenuItem>
                <MenuItem value="Фізика">⚡ Фізика</MenuItem>
                <MenuItem value="Хімія">🧪 Хімія</MenuItem>
                <MenuItem value="Біологія">🧬 Біологія</MenuItem>
                <MenuItem value="Мистецтво">🎨 Мистецтво</MenuItem>
                <MenuItem value="Музика">🎵 Музика</MenuItem>
                <MenuItem value="Фізкультура">⚽ Фізкультура</MenuItem>
                <MenuItem value="Інформатика">💻 Інформатика</MenuItem>
                <MenuItem value="Трудове навчання">🔨 Трудове навчання</MenuItem>
                <MenuItem value="Загальне навчання">📚 Загальне навчання</MenuItem>
              </TextField>

              {/* Вікова група */}
              <TextField
                label="👥 Вікова група"
                variant="outlined"
                fullWidth
                select
                value={editFormData.ageGroup}
                onChange={(e) => setEditFormData(prev => ({ ...prev, ageGroup: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.06),
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1rem',
                    fontWeight: 500
                  }
                }}
              >
                <MenuItem value="3-5 років">🍼 3-5 років (дошкільна)</MenuItem>
                <MenuItem value="6-7 років">🎒 6-7 років (1 клас)</MenuItem>
                <MenuItem value="8-9 років">📖 8-9 років (2-3 класи)</MenuItem>
                <MenuItem value="10-11 років">🧮 10-11 років (4-5 класи)</MenuItem>
                <MenuItem value="12-13 років">🔬 12-13 років (6-7 класи)</MenuItem>
                <MenuItem value="14-15 років">🎓 14-15 років (8-9 класи)</MenuItem>
                <MenuItem value="16-18 років">🎯 16-18 років (10-11 класи)</MenuItem>
                <MenuItem value="Всі вікові групи">🌈 Всі вікові групи</MenuItem>
              </TextField>
            </Box>
          </DialogContent>

          <DialogActions sx={{ 
            p: 3, 
            pt: 2, 
            gap: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            backgroundColor: alpha(theme.palette.grey[50], 0.5)
          }}>
            <Button 
              onClick={handleEditCancel} 
              sx={{ 
                textTransform: 'none',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.grey[400], 0.1),
                  color: theme.palette.text.primary
                }
              }}
            >
              Скасувати
            </Button>
            <Button 
              onClick={handleEditSave}
              variant="contained"
              disabled={!editFormData.title.trim()}
              sx={{ 
                textTransform: 'none',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: theme.palette.grey[300],
                  color: theme.palette.grey[500],
                  boxShadow: 'none'
                }
              }}
            >
              Зберегти зміни
            </Button>
          </DialogActions>
        </Dialog>

        {/* Lesson Preview Dialog */}
        <Dialog
          open={previewDialogOpen}
          onClose={handleClosePreview}
          maxWidth={false}
          PaperProps={{
            sx: { 
              borderRadius: '16px',
              maxHeight: '90vh',
              width: '1100px',
              maxWidth: '95vw',
              margin: 'auto'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            pb: 2
          }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {selectedLessonForPreview?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Слайд {currentSlideIndex + 1} з {selectedLessonForPreview?.slides.length}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Кнопка перестановки слайдів */}
              <Tooltip title={reorderMode ? "Вимкнути режим перестановки" : "Увімкнути режим перестановки"}>
                <IconButton 
                  onClick={handleReorderModeToggle}
                  disabled={!selectedLessonForPreview || selectedLessonForPreview.slides.length <= 1}
                  sx={{ 
                    color: reorderMode ? theme.palette.success.main : theme.palette.primary.main,
                    backgroundColor: reorderMode ? alpha(theme.palette.success.main, 0.1) : 'transparent',
                    '&:hover': {
                      backgroundColor: reorderMode 
                        ? alpha(theme.palette.success.main, 0.2) 
                        : alpha(theme.palette.primary.main, 0.1)
                    },
                    '&:disabled': {
                      color: theme.palette.grey[400]
                    }
                  }}
                >
                  <MoveHorizontal size={20} />
                </IconButton>
              </Tooltip>
              
              {/* Кнопка видалення поточного слайда */}
              <Tooltip title="Видалити поточний слайд">
                <IconButton 
                  onClick={() => handleDeleteSlideClick(currentSlideIndex)}
                  disabled={!selectedLessonForPreview || selectedLessonForPreview.slides.length === 1}
                  sx={{ 
                    color: theme.palette.error.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.1)
                    },
                    '&:disabled': {
                      color: theme.palette.grey[400]
                    }
                  }}
                >
                  <Delete size={20} />
                </IconButton>
              </Tooltip>
              <IconButton onClick={handleClosePreview}>
                <X size={24} />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0 }}>
            {selectedLessonForPreview && (
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Slide Content */}
                <Box sx={{ 
                  p: 3,
                  backgroundColor: alpha(theme.palette.grey[50], 0.5),
                  maxHeight: '70vh',
                  overflow: 'auto'
                }}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 4, 
                      borderRadius: '12px',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      backgroundColor: 'white'
                    }}
                  >
                    <Box sx={{ 
                      width: '100%', 
                      height: '600px',
                      overflow: 'auto',
                      borderRadius: '8px',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}>
                      <iframe
                        srcDoc={selectedLessonForPreview.slides[currentSlideIndex]?.htmlContent || ''}
                        style={{
                          width: '1200px',
                          height: '800px',
                          border: 'none',
                          borderRadius: '8px',
                          transform: 'scale(0.83)',
                          transformOrigin: 'top left',
                        }}
                        title={`Slide ${currentSlideIndex + 1}: ${selectedLessonForPreview.slides[currentSlideIndex]?.title}`}
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </Box>
                  </Paper>
                </Box>
                
                {/* Navigation Controls */}
                <Box sx={{ 
                  p: 3, 
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  backgroundColor: 'white'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}>
                    <Button
                      startIcon={<ChevronLeft size={20} />}
                      onClick={goToPrevSlide}
                      disabled={currentSlideIndex === 0}
                      sx={{ 
                        textTransform: 'none',
                        borderRadius: '8px'
                      }}
                    >
                      Попередній
                    </Button>
                    
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {reorderMode ? (
                        // Режим перестановки - показуємо слайди з можливістю переміщення
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', maxWidth: 400 }}>
                          {selectedLessonForPreview.slides.map((_, index) => (
                            <Box
                              key={index}
                              draggable={reorderMode}
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, index)}
                              onClick={() => setCurrentSlideIndex(index)}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                backgroundColor: index === currentSlideIndex 
                                  ? theme.palette.primary.main 
                                  : alpha(theme.palette.grey[500], 0.1),
                                color: index === currentSlideIndex ? 'white' : 'text.primary',
                                cursor: reorderMode ? 'grab' : 'pointer',
                                transition: 'all 0.2s ease',
                                border: draggedSlideIndex === index ? `2px dashed ${theme.palette.primary.main}` : '2px solid transparent',
                                '&:hover': {
                                  backgroundColor: index === currentSlideIndex 
                                    ? theme.palette.primary.dark 
                                    : alpha(theme.palette.grey[500], 0.2),
                                  transform: 'scale(1.05)'
                                },
                                '&:active': {
                                  cursor: reorderMode ? 'grabbing' : 'pointer'
                                }
                              }}
                            >
                              {reorderMode && <GripVertical size={12} />}
                              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                {index + 1}
                              </Typography>
                              {reorderMode && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveSlideUp(index);
                                    }}
                                    disabled={index === 0}
                                    sx={{ 
                                      p: 0.25, 
                                      minWidth: 'auto',
                                      color: 'inherit',
                                      '&:disabled': { opacity: 0.3 }
                                    }}
                                  >
                                    <ArrowUp size={10} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveSlideDown(index);
                                    }}
                                    disabled={index === selectedLessonForPreview.slides.length - 1}
                                    sx={{ 
                                      p: 0.25, 
                                      minWidth: 'auto',
                                      color: 'inherit',
                                      '&:disabled': { opacity: 0.3 }
                                    }}
                                  >
                                    <ArrowDown size={10} />
                                  </IconButton>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        // Звичайний режим - прості крапки
                        selectedLessonForPreview.slides.map((_, index) => (
                          <Box
                            key={index}
                            onClick={() => setCurrentSlideIndex(index)}
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: index === currentSlideIndex 
                                ? theme.palette.primary.main 
                                : alpha(theme.palette.grey[400], 0.5),
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: index === currentSlideIndex 
                                  ? theme.palette.primary.dark 
                                  : theme.palette.grey[400],
                                transform: 'scale(1.2)'
                              }
                            }}
                          />
                        ))
                      )}
                    </Box>
                    
                    <Button
                      endIcon={<ChevronRight size={20} />}
                      onClick={goToNextSlide}
                      disabled={!selectedLessonForPreview || currentSlideIndex === selectedLessonForPreview.slides.length - 1}
                      sx={{ 
                        textTransform: 'none',
                        borderRadius: '8px'
                      }}
                    >
                      Наступний
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default MyMaterials;