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
import { useAuth } from '@/providers/AuthProvider';
import { useSupabaseLessons, DatabaseLesson } from '@/hooks/useSupabaseLessons';
import {
  Search,
  MoreVertical,
  Delete,
  Edit,
  Plus,
  Clock,
  BookOpen,
  Calculator,
  Palette,
  Music,
  Globe,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SlideDialog } from '@/components/slides';
import { SimpleLesson, SimpleSlide } from '@/types/chat';

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
  lessonId?: string;
}

const MyMaterials = () => {
  console.log('🔄 MATERIALS PAGE: Component render started');
  
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedLessonForPreview, setSelectedLessonForPreview] = useState<SimpleLesson | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  
  // Стани для редагування метаданих
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<DatabaseLesson | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    subject: '',
    ageGroup: ''
  });

  // Стейт тільки для UI відображення
  const [materials, setMaterials] = useState<Material[]>([]);
  
  // Стейт для FAB меню
  const [fabMenuAnchorEl, setFabMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Використовуємо хук для роботи з базою даних
  const { 
    lessons: dbLessons, 
    loading: isLoading, 
    error: dbError, 
    refreshLessons,
    deleteLesson: deleteLessonFromDb,
    updateLesson: updateLessonInDb
  } = useSupabaseLessons();

  // Додаємо стейт для контролю таймауту
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Додаємо стейт для відстеження ініціалізації
  const [isInitialized, setIsInitialized] = useState(false);
  // Додаємо стейт для відстеження першого завантаження
  const [hasStartedLoading, setHasStartedLoading] = useState(false);

  // Функція для очистки ageGroup від приставки "років"
  const cleanAgeGroup = (ageGroup: string): string => {
    return ageGroup.replace(/\s+років$/i, '').trim();
  };

  // Функція конвертації уроку з бази в формат SimpleLesson для SlideDialog
  const convertToSimpleLesson = (dbLesson: any): SimpleLesson => {
    const slides: SimpleSlide[] = (dbLesson.slides || []).map((slide: any) => ({
      id: slide.id,
      title: slide.title || 'Слайд без назви',
      content: slide.description || '',
      htmlContent: slide.html_content || '<div style="padding: 20px; text-align: center;">Контент слайду недоступний</div>',
      type: slide.type || 'content',
      status: slide.status || 'ready'
    }));

    return {
      id: dbLesson.id,
      title: dbLesson.title,
      description: dbLesson.description || '',
      subject: dbLesson.subject,
      ageGroup: dbLesson.age_group,
      duration: dbLesson.duration || 30,
      slides,
      createdAt: new Date(dbLesson.created_at),
      updatedAt: new Date(dbLesson.updated_at),
      authorId: dbLesson.user_id || 'unknown'
    };
  };

  // Функція для перетворення database lessons в materials
  const convertDatabaseLessonsToMaterials = (lessons: DatabaseLesson[]): Material[] => {
    console.log('🔄 MATERIALS PAGE: Converting database lessons to materials');
    console.log('📊 Raw database lessons:', lessons);
    console.log('📈 Total lessons count:', lessons.length);
    
    const convertedMaterials = lessons.map((lesson, index) => {
      const material = {
        id: index + 1,
        title: lesson.title,
        description: lesson.description || '',
        type: 'lesson',
        subject: lesson.subject.toLowerCase(),
        ageGroup: cleanAgeGroup(lesson.age_group),
        createdAt: new Date(lesson.created_at).toLocaleDateString('uk-UA'),
        lastModified: new Date(lesson.updated_at).toLocaleDateString('uk-UA'),
        status: lesson.status,
        views: lesson.views,
        rating: lesson.rating,
        duration: `${lesson.duration} хв`,
        thumbnail: lesson.thumbnail_url || '/images/default-lesson.png',
        tags: lesson.tags,
        difficulty: lesson.difficulty,
        completionRate: lesson.completion_rate,
        lessonId: lesson.id,
      };
      
      // Детальне логування для кожного уроку
      console.log(`📝 Lesson ${index + 1} (${lesson.id}):`, {
        title: lesson.title,
        thumbnail_url: lesson.thumbnail_url,
        has_thumbnail: !!lesson.thumbnail_url,
        thumbnail_fallback: material.thumbnail,
        slides_count: lesson.slides?.length || 0,
        status: lesson.status,
        created_at: lesson.created_at,
        updated_at: lesson.updated_at
      });
      
      return material;
    });
    
    // Підсумкова статистика
    const thumbnailStats = {
      total: convertedMaterials.length,
      with_thumbnails: convertedMaterials.filter(m => m.thumbnail !== '/images/default-lesson.png').length,
      with_fallback: convertedMaterials.filter(m => m.thumbnail === '/images/default-lesson.png').length
    };
    
    console.log('🖼️ THUMBNAIL STATISTICS:', thumbnailStats);
    console.log('✅ Converted materials:', convertedMaterials);
    
    return convertedMaterials;
  };

  // Відстежуємо початок завантаження
  useEffect(() => {
    if (isLoading && !hasStartedLoading) {
      setHasStartedLoading(true);
    }
  }, [isLoading, hasStartedLoading]);

  // Оновлюємо materials коли змінюються dbLessons
  useEffect(() => {
    console.log('🔄 MATERIALS PAGE: useEffect triggered');
    
    if (dbLessons.length > 0) {
      console.log('✅ Processing lessons from database...');
      const convertedMaterials = convertDatabaseLessonsToMaterials(dbLessons);
      setMaterials(convertedMaterials);
      console.log('🎯 Materials state updated with', convertedMaterials.length, 'items');
    } else {
      console.log('⚠️ No lessons found in database');
      setMaterials([]);
    }
    
    // Позначаємо як ініціалізовано коли завантаження почалося і завершилося
    if (hasStartedLoading && !isLoading && !isInitialized) {
      console.log('🚀 Setting page as initialized');
      setIsInitialized(true);
    }
  }, [dbLessons, isLoading, dbError, isInitialized, hasStartedLoading, user]);

  // Додаємо таймаут для loading стану
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoading) {
      setLoadingTimeout(false);
      // Якщо loading триває більше 10 секунд, показуємо помилку
      timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000);
    } else {
      setLoadingTimeout(false);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  // Обробка ресайзінгу вікна - запобігаємо повторному завантаженню
  useEffect(() => {
    const handleResize = () => {
      // Просто форсуємо перерендерінг без повторного завантаження
      if (isInitialized) {
        // Можна додати логіку для оптимізації відображення при зміні розміру
        console.log('Window resized, but preventing unnecessary reload');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isInitialized]);

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



  // Фільтрація та сортування
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || 
                         material.subject === selectedFilter ||
                         material.status === selectedFilter ||
                         material.difficulty === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  console.log('🔍 MATERIALS PAGE: Filtering and sorting results:', {
    total_materials: materials.length,
    filtered_materials: filteredMaterials.length,
    search_term: searchTerm,
    selected_filter: selectedFilter,
    sort_by: sortBy
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

  console.log('📊 MATERIALS PAGE: Final sorted materials:', sortedMaterials.length);

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

  const handleDeleteConfirm = async () => {
    if (materialToDelete) {
      const lessonId = materialToDelete.lessonId;
      
      if (!lessonId) {
        console.error('No lessonId found in material');
        alert('Помилка: не знайдено ID уроку для видалення');
        setDeleteDialogOpen(false);
        setMaterialToDelete(null);
        return;
      }
      
      const deleteSuccess = await deleteLessonFromDb(lessonId);
      
      if (!deleteSuccess) {
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
      // Знаходимо урок в базі даних за ID
      const lesson = dbLessons.find(l => l.id === selectedMaterial.lessonId);
      
      if (lesson) {
        setEditingLesson(lesson);
        setEditFormData({
          title: lesson.title,
          description: lesson.description || '',
          subject: lesson.subject,
          ageGroup: lesson.age_group
        });
        setEditDialogOpen(true);
        handleMenuClose();
      }
    }
  };

  const handleEditSave = async () => {
    if (editingLesson) {
      const success = await updateLessonInDb(editingLesson.id, {
        title: editFormData.title.trim(),
        description: editFormData.description.trim(),
        subject: editFormData.subject.trim(),
        age_group: editFormData.ageGroup.trim()
      });

      if (success) {
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

  const handlePreviewLesson = async (material: Material) => {
    if (!material.lessonId) {
      console.error('No lesson ID found for material:', material);
      return;
    }

    try {
      console.log('🔍 Loading lesson with slides for ID:', material.lessonId);
      
      // Завантажуємо урок зі слайдами через API
      const response = await fetch(`/api/lessons?id=${material.lessonId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch lesson details');
      }
      
      const data = await response.json();
      
      if (!data.success || !data.lesson) {
        throw new Error('Lesson not found');
      }
      
      console.log('✅ Lesson loaded with slides:', {
        id: data.lesson.id,
        title: data.lesson.title,
        slides_count: data.lesson.slides?.length || 0,
        slides: data.lesson.slides?.map((slide: any, index: number) => ({
          index: index,
          id: slide.id,
          title: slide.title,
          has_html_content: !!slide.html_content,
          html_content_length: slide.html_content?.length || 0,
          slide_number: slide.slide_number
        }))
      });
      
      const simpleLesson = convertToSimpleLesson(data.lesson);
      setSelectedLessonForPreview(simpleLesson);
      setCurrentSlideIndex(0);
      setPreviewDialogOpen(true);
      
      // Додаткове логування при відкритті діалогу
      console.log('🔍 Dialog opened with lesson:', {
        lessonTitle: simpleLesson.title,
        slidesArray: simpleLesson.slides,
        slidesLength: simpleLesson.slides?.length,
        slidesType: typeof simpleLesson.slides,
        isArray: Array.isArray(simpleLesson.slides),
        firstSlide: simpleLesson.slides?.[0]
      });
      
      // TODO: Implement view increment in API
    } catch (error) {
      console.error('❌ Error loading lesson:', error);
      // Показуємо повідомлення про помилку користувачу
      // Тут можна додати показ snackbar або іншого повідомлення
    }
  };

  const handleClosePreview = () => {
    setPreviewDialogOpen(false);
    setSelectedLessonForPreview(null);
    setCurrentSlideIndex(0);
  };

  const goToNextSlide = () => {
    if (selectedLessonForPreview && selectedLessonForPreview.slides && currentSlideIndex < selectedLessonForPreview.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const handleFabMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFabMenuAnchorEl(event.currentTarget);
  };

  const handleFabMenuClose = () => {
    setFabMenuAnchorEl(null);
  };

  const handleCreateLesson = () => {
    router.push('/chat');
    handleFabMenuClose();
  };

  const renderMaterialCard = (material: Material) => {
    const SubjectIcon = getSubjectIcon(material.subject);
    
    // Логування інформації про картку матеріалу
    console.log(`🎨 RENDER: Material card for "${material.title}":`, {
      id: material.id,
      lessonId: material.lessonId,
      thumbnail: material.thumbnail,
      has_thumbnail: material.thumbnail !== '/images/default-lesson.png',
      will_show_image: !!(material.thumbnail && material.thumbnail !== '/images/default-lesson.png'),
      will_show_fallback: !(material.thumbnail && material.thumbnail !== '/images/default-lesson.png')
    });
    
    return (
      <Card
        key={material.id}
        onClick={() => {
          handlePreviewLesson(material);
        }}
        sx={{
          borderRadius: '16px',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: '#ffffff',
          transition: 'all 0.3s ease',
          position: 'relative',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
            borderColor: alpha(theme.palette.primary.main, 0.2),
          }
        }}
      >
        {/* Thumbnail Preview */}
        <Box
          sx={{
            height: 200,
            borderRadius: '16px 16px 0 0',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(theme.palette.grey[100], 0.5),
          }}
        >
          {/* Thumbnail Image або Fallback */}
          {material.thumbnail && material.thumbnail !== '/images/default-lesson.png' ? (
            <Box
              component="img"
              src={material.thumbnail}
              alt={material.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              onError={(e) => {
                // Fallback до іконки предмету якщо зображення не завантажилося
                e.currentTarget.style.display = 'none';
                const fallbackContainer = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallbackContainer) {
                  fallbackContainer.style.display = 'flex';
                }
              }}
            />
          ) : null}
          
          {/* Fallback з іконкою предмету */}
          <Box
            sx={{
              position: material.thumbnail && material.thumbnail !== '/images/default-lesson.png' ? 'absolute' : 'static',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${getSubjectColor(material.subject)} 0%, ${alpha(getSubjectColor(material.subject), 0.7)} 100%)`,
              display: material.thumbnail && material.thumbnail !== '/images/default-lesson.png' ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SubjectIcon size={48} color="#ffffff" />
          </Box>
          


          {/* More Menu */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e, material);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: alpha('#ffffff', 0.9),
              color: 'grey.700',
              zIndex: 2,
              '&:hover': {
                backgroundColor: '#ffffff',
              }
            }}
          >
            <MoreVertical size={20} />
          </IconButton>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            mb: 1,
            color: 'text.primary',
            fontSize: '1.1rem',
            lineHeight: 1.3
          }}>
            {material.title}
          </Typography>
          
          <Typography variant="body2" sx={{ 
            color: 'text.secondary', 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4
          }}>
            {material.description}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              label={material.ageGroup}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 500,
                fontSize: '0.75rem'
              }}
            />
            <Chip
              label={material.subject}
              size="small"
              sx={{
                backgroundColor: alpha(getSubjectColor(material.subject), 0.1),
                color: getSubjectColor(material.subject),
                fontWeight: 500,
                fontSize: '0.75rem'
              }}
            />
            <Chip
              icon={<Clock size={14} />}
              label={material.duration}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                fontWeight: 500,
                fontSize: '0.75rem',
                '& .MuiChip-icon': {
                  color: theme.palette.info.main,
                }
              }}
            />
          </Stack>


        </CardContent>
      </Card>
    );
  };

  // Loading state з таймаутом - показуємо тільки якщо не ініціалізовано
  if (isLoading && !loadingTimeout && !isInitialized) {
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
          </Box>
        </Layout>
      
    );
  }

  // Loading timeout state
  if (loadingTimeout) {
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
            <Typography variant="h6" color="error">
              Завантаження займає більше часу, ніж очікувалося
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Можливо, виникла проблема з мережею або сервером
            </Typography>
            <Button 
              variant="contained" 
              onClick={refreshLessons}
              sx={{ textTransform: 'none' }}
            >
              Спробувати знову
            </Button>
          </Box>
        </Layout>
      
    );
  }

  // Error state
  if (dbError) {
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
            <Typography variant="h6" color="error">
              Помилка завантаження матеріалів
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dbError}
            </Typography>
            <Button 
              variant="contained" 
              onClick={refreshLessons}
              sx={{ textTransform: 'none' }}
            >
              Спробувати знову
            </Button>
          </Box>
        </Layout>
      
    );
  }



  return (
    
      <Layout title="Мої матеріали" breadcrumbs={[{ label: 'Мої матеріали' }]}>
        <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', p: 3 }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                Мої матеріали
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Керуйте своїми навчальними матеріалами та уроками
              </Typography>
            </Box>
            
            {/* Міні-лоадер для оновлення */}
            {isLoading && isInitialized && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} thickness={4} />
              </Box>
            )}
          </Box>

          {/* Search and Filters */}
          <Paper sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: '16px',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            backgroundColor: alpha(theme.palette.grey[50], 0.5)
          }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                placeholder="Пошук матеріалів..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#ffffff'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Фільтр</InputLabel>
                <Select
                  value={selectedFilter}
                  label="Фільтр"
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  sx={{ 
                    borderRadius: '12px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <MenuItem value="all">Всі</MenuItem>
                  <MenuItem value="published">Опубліковані</MenuItem>
                  <MenuItem value="draft">Чернетки</MenuItem>
                  <MenuItem value="easy">Легкі</MenuItem>
                  <MenuItem value="medium">Середні</MenuItem>
                  <MenuItem value="hard">Складні</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Сортування</InputLabel>
                <Select
                  value={sortBy}
                  label="Сортування"
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ 
                    borderRadius: '12px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <MenuItem value="recent">Нещодавні</MenuItem>
                  <MenuItem value="popular">Популярні</MenuItem>
                  <MenuItem value="rating">За рейтингом</MenuItem>
                  <MenuItem value="title">За назвою</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {/* Materials Grid */}
          {!isInitialized ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '400px',
              gap: 3
            }}>
              <CircularProgress size={60} thickness={4} />
            </Box>
          ) : sortedMaterials.length > 0 ? (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 3,
              opacity: isLoading && isInitialized ? 0.7 : 1,
              transition: 'opacity 0.3s ease'
            }}>
              {sortedMaterials.map((material) => renderMaterialCard(material))}
            </Box>
          ) : (
            <Paper sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: '16px',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: alpha(theme.palette.grey[50], 0.3)
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                Матеріали не знайдено
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Створіть свій перший урок, щоб побачити його тут
              </Typography>
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
                Створити урок
              </Button>
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
              <ListItemText>Створити урок</ListItemText>
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
                borderRadius: '12px',
                minWidth: 180,
                mt: 1.5,
              },
            }}
          >
            <MenuItem onClick={handleEditClick}>
              <ListItemIcon>
                <Edit size={16} />
              </ListItemIcon>
              <ListItemText>Редагувати</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <Delete size={16} color={theme.palette.error.main} />
              </ListItemIcon>
              <ListItemText>Видалити</ListItemText>
            </MenuItem>
          </Menu>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
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
              Видалити матеріал?
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Ви впевнені, що хочете видалити "{materialToDelete?.title}"? 
                Цю дію неможливо скасувати.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: 'none' }}>
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

          {/* Edit Lesson Dialog */}
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
            }}>
              <Edit size={24} />
              Редагувати урок
            </DialogTitle>
            <DialogContent sx={{ px: 3, pb: 2 }}>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  label="Назва уроку"
                  fullWidth
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    }
                  }}
                />
                <TextField
                  label="Опис"
                  fullWidth
                  multiline
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    }
                  }}
                />
                <TextField
                  label="Предмет"
                  fullWidth
                  value={editFormData.subject}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, subject: e.target.value }))}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    }
                  }}
                />
                <TextField
                  label="Вікова група"
                  fullWidth
                  value={editFormData.ageGroup}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, ageGroup: e.target.value }))}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    }
                  }}
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={handleEditCancel} sx={{ textTransform: 'none' }}>
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
                }}
              >
                Зберегти
              </Button>
            </DialogActions>
          </Dialog>

          {/* Lesson Preview Dialog - використовуємо SlideDialog як в чаті */}
          <SlideDialog
            open={previewDialogOpen}
            currentLesson={selectedLessonForPreview}
            currentSlideIndex={currentSlideIndex}
            onClose={handleClosePreview}
            onNextSlide={goToNextSlide}
            onPrevSlide={goToPrevSlide}
          />
        </Box>
      </Layout>
    
  );
};

export default MyMaterials;