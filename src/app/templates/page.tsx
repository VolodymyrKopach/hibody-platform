'use client';

import React, { useState } from 'react';
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
  Badge,
  CardMedia,
  CircularProgress,
  FormControlLabel,
  Switch,
  Slider,
} from '@mui/material';
import Layout from '@/components/layout/Layout';
import { 
  Search,
  Filter,
  Star,
  Clock,
  Eye,
  Download,
  Play,
  Grid3x3,
  List,
  Plus,
  Bookmark,
  BookmarkCheck,
  Users,
  TrendingUp,
  Heart,
  Share2,
  Copy,
  MoreVertical,
  BookOpen,
  Calculator,
  Palette,
  Music,
  Globe,
  Zap,
  Award,
  Target,
  CheckCircle,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

interface Template {
  id: number;
  title: string;
  description: string;
  category: string;
  subject: string;
  ageGroup: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  type: string;
  rating: number;
  downloads: number;
  views: number;
  author: string;
  isPopular: boolean;
  isNew: boolean;
  isFree: boolean;
  previewImage: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  parameters: string[];
  outputFormats: string[];
}

const Templates = () => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<number[]>([1, 3]);
  const [configureTemplate, setConfigureTemplate] = useState<Template | null>(null);
  const [configureOpen, setConfigureOpen] = useState(false);
  const [templateSettings, setTemplateSettings] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data - Шаблони для дітей 3-6 років
  const [templates] = useState<Template[]>([
    {
      id: 2,
      title: 'Перші кроки в алфавіті',
      description: 'Знайомство з літерами через гру та пісні. Створюйте інтерактивні заняття для вивчення букв.',
      category: 'presentation',
      subject: 'english',
      ageGroup: '3-6',
      difficulty: 'easy',
      duration: '10 хв',
      type: 'Презентація',
      rating: 4.8,
      downloads: 1892,
      views: 4156,
      author: 'Олена Сидорова',
      isPopular: true,
      isNew: true,
      isFree: true,
      previewImage: '🔤',
      tags: ['алфавіт', 'літери', 'дошкільнята', 'пісні'],
      createdAt: '2024-01-20',
      updatedAt: '2024-01-22',
      parameters: ['Мова (українська/англійська)', 'Кількість літер за раз', 'Включити пісеньки [так/ні]', 'Колір фону', 'Рівень складності'],
      outputFormats: ['Інтерактивна презентація', 'Відео з піснями', 'Картки з літерами']
    },
    {
      id: 3,
      title: 'Кольорова творчість',
      description: 'Малювання, розфарбовування та творчі проекти. Розвиваємо фантазію та дрібну моторику.',
      category: 'activity',
      subject: 'art',
      ageGroup: '3-6',
      difficulty: 'easy',
      duration: '25 хв',
      type: 'Активність',
      rating: 4.9,
      downloads: 1654,
      views: 3823,
      author: 'Іван Коваленко',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '🎨',
      tags: ['малювання', 'кольори', 'творчість', 'моторика'],
      createdAt: '2024-01-05',
      updatedAt: '2024-01-08',
      parameters: ['Тематика (тварини/природа/казки)', 'Розмір сторінки', 'Техніка (олівці/фарби/аплікація)', 'Показати покрокові інструкції [так/ні]', 'Опис персонажа'],
      outputFormats: ['Розмальовки', 'Покрокові схеми', 'Шаблони для аплікацій']
    },
    {
      id: 4,
      title: 'Цікаві експерименти для малюків',
      description: 'Безпечні та захоплюючі досліди з водою, повітрям та простими матеріалами.',
      category: 'activity',
      subject: 'science',
      ageGroup: '4-6',
      difficulty: 'easy',
      duration: '20 хв',
      type: 'Активність',
      rating: 4.7,
      downloads: 1356,
      views: 2890,
      author: 'Анна Волошина',
      isPopular: false,
      isNew: false,
      isFree: true,
      previewImage: '🔬',
      tags: ['експерименти', 'наука', 'дослідження', 'безпека'],
      createdAt: '2023-12-28',
      updatedAt: '2024-01-03',
      parameters: ['Тип експерименту (вода/повітря/кольори)', 'Безпечні матеріали', 'Очікуваний ефект', 'Пояснення для дитини'],
      outputFormats: ['Покрокова інструкція', 'Відео-демонстрація', 'Журнал спостережень']
    },
    {
      id: 5,
      title: 'Музичні ігри та ритми',
      description: 'Розвиток музичного слуху через прості пісні, ритми та рухи під музику.',
      category: 'game',
      subject: 'music',
      ageGroup: '3-6',
      difficulty: 'easy',
      duration: '15 хв',
      type: 'Гра',
      rating: 4.6,
      downloads: 943,
      views: 2167,
      author: 'Михайло Ткачук',
      isPopular: false,
      isNew: true,
      isFree: true,
      previewImage: '🎵',
      tags: ['музика', 'ритм', 'рухи', 'слух'],
      createdAt: '2024-01-18',
      updatedAt: '2024-01-20',
      parameters: ['Тип активності (спів/танці/клацання)', 'Музичний стиль', 'Тривалість', 'Інструменти для ритму'],
      outputFormats: ['Музичне заняття', 'Відео з рухами', 'Аудіо треки']
    },
    {
      id: 6,
      title: 'Подорож по світу тварин',
      description: 'Знайомство з тваринами різних континентів через ігри та цікаві факти.',
      category: 'presentation',
      subject: 'geography',
      ageGroup: '4-6',
      difficulty: 'easy',
      duration: '20 хв',
      type: 'Презентація',
      rating: 4.8,
      downloads: 2103,
      views: 4567,
      author: 'Ольга Дмитренко',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '🦁',
      tags: ['тварини', 'світ', 'подорож', 'природа'],
      createdAt: '2023-12-15',
      updatedAt: '2023-12-20',
      parameters: ['Континент/регіон', 'Типи тварин', 'Включити звуки тварин', 'Інтерактивні ігри'],
      outputFormats: ['Інтерактивна подорож', 'Картки тварин', 'Звукові загадки']
    },
    {
      id: 7,
      title: 'Форми та розміри навколо нас',
      description: 'Вивчення геометричних форм та понять "великий-маленький" через гру та повсякденні предмети.',
      category: 'game',
      subject: 'math',
      ageGroup: '3-5',
      difficulty: 'easy',
      duration: '12 хв',
      type: 'Гра',
      rating: 4.7,
      downloads: 1287,
      views: 2845,
      author: 'Тетяна Іванова',
      isPopular: false,
      isNew: false,
      isFree: true,
      previewImage: '🔺',
      tags: ['форми', 'розміри', 'геометрія', 'порівняння'],
      createdAt: '2024-01-12',
      updatedAt: '2024-01-14',
      parameters: ['Типи форм (круг/квадрат/трикутник)', 'Контекст (іграшки/їжа/природа)', 'Порівняння розмірів', 'Ігрові завдання'],
      outputFormats: ['Інтерактивні пазли', 'Картки для сортування', 'Рухливі ігри']
    },
    {
      id: 8,
      title: 'Перші слова англійською',
      description: 'Вивчення базових слів через картинки, пісні та ігри. Найпростіші слова для дітей.',
      category: 'game',
      subject: 'english',
      ageGroup: '4-6',
      difficulty: 'easy',
      duration: '10 хв',
      type: 'Гра',
      rating: 4.8,
      downloads: 1543,
      views: 3876,
      author: 'Світлана Коваль',
      isPopular: true,
      isNew: true,
      isFree: true,
      previewImage: '🗣️',
      tags: ['англійська', 'слова', 'словник', 'вимова'],
      createdAt: '2024-01-25',
      updatedAt: '2024-01-26',
      parameters: ['Категорія слів (сім\'я/їжа/кольори/тварини)', 'Кількість слів', 'Включити вимову', 'Ігрові активності'],
      outputFormats: ['Словникові картки', 'Інтерактивні ігри', 'Аудіо-уроки']
    },
    {
      id: 9,
      title: 'Створюємо історії разом',
      description: 'Розвиток мовлення та уяви через створення простих історій з картинками.',
      category: 'activity',
      subject: 'art',
      ageGroup: '4-6',
      difficulty: 'easy',
      duration: '30 хв',
      type: 'Активність',
      rating: 4.6,
      downloads: 845,
      views: 1634,
      author: 'Олексій Мельник',
      isPopular: false,
      isNew: false,
      isFree: false,
      previewImage: '📖',
      tags: ['історії', 'мовлення', 'уява', 'розповідь'],
      createdAt: '2024-01-08',
      updatedAt: '2024-01-10',
      parameters: ['Тематика (казки/пригоди/побут)', 'Кількість персонажів', 'Складність сюжету', 'Візуальні підказки'],
      outputFormats: ['Шаблони історій', 'Картки персонажів', 'Інструкції для батьків']
    },
    {
      id: 10,
      title: 'Чарівні досліди з водою',
      description: 'Простісінькі експерименти з водою для розуміння її властивостей.',
      category: 'activity',
      subject: 'science',
      ageGroup: '3-6',
      difficulty: 'easy',
      duration: '15 хв',
      type: 'Активність',
      rating: 4.8,
      downloads: 1876,
      views: 3456,
      author: 'Віктор Савченко',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '💧',
      tags: ['вода', 'досліди', 'властивості', 'чудеса'],
      createdAt: '2023-12-20',
      updatedAt: '2023-12-22',
      parameters: ['Тип досліду (плавання/розчинення/змішування)', 'Безпечні матеріали', 'Очікуваний ефект', 'Пояснення явища'],
      outputFormats: ['Покрокові інструкції', 'Відео-демонстрація', 'Блокнот спостережень']
    },
    {
      id: 11,
      title: 'Співаємо дитячі пісеньки',
      description: 'Колекція улюблених дитячих пісень з рухами та жестами для розвитку координації.',
      category: 'activity',
      subject: 'music',
      ageGroup: '3-6',
      difficulty: 'easy',
      duration: '20 хв',
      type: 'Активність',
      rating: 4.5,
      downloads: 1189,
      views: 2987,
      author: 'Наталя Шевченко',
      isPopular: false,
      isNew: false,
      isFree: true,
      previewImage: '🎤',
      tags: ['пісні', 'рухи', 'координація', 'дитячі'],
      createdAt: '2024-01-02',
      updatedAt: '2024-01-04',
      parameters: ['Тематика пісень (тварини/природа/сім\'я)', 'Складність рухів', 'Тривалість пісні', 'Музичні інструменти'],
      outputFormats: ['Відео з рухами', 'Аудіо треки', 'Схеми жестів']
    },
    {
      id: 12,
      title: 'Загадки про тварин',
      description: 'Розвиток логічного мислення через загадки, звуки та характеристики тварин.',
      category: 'quiz',
      subject: 'geography',
      ageGroup: '4-6',
      difficulty: 'easy',
      duration: '15 хв',
      type: 'Квіз',
      rating: 4.7,
      downloads: 1567,
      views: 3432,
      author: 'Ірина Петрова',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '🐻',
      tags: ['загадки', 'тварини', 'логіка', 'звуки'],
      createdAt: '2023-11-15',
      updatedAt: '2023-11-18',
      parameters: ['Типи тварин (домашні/дикі/морські)', 'Складність загадок', 'Включити звуки', 'Візуальні підказки'],
      outputFormats: ['Інтерактивні загадки', 'Звукова гра', 'Картки-загадки']
    },
    {
      id: 13,
      title: 'Рахуємо пальчиками',
      description: 'Вивчення рахунку через пальчикові ігри та рухи. Розвиток дрібної моторики.',
      category: 'game',
      subject: 'math',
      ageGroup: '3-5',
      difficulty: 'easy',
      duration: '10 хв',
      type: 'Гра',
      rating: 4.9,
      downloads: 2456,
      views: 5890,
      author: 'Андрій Коваленко',
      isPopular: true,
      isNew: true,
      isFree: true,
      previewImage: '✋',
      tags: ['пальчики', 'рахунок', 'моторика', 'ігри'],
      createdAt: '2024-01-28',
      updatedAt: '2024-01-30',
      parameters: ['Діапазон рахунку (1-5 або 1-10)', 'Тип ігор (вірші/пісні/жести)', 'Швидкість', 'Рівень складності'],
      outputFormats: ['Відео з жестами', 'Аудіо з віршиками', 'Схеми рухів']
    },
    {
      id: 14,
      title: 'Веселі вірші та казки',
      description: 'Розвиток мовлення через вірші, казки та словесні ігри з простою лексикою.',
      category: 'presentation',
      subject: 'english',
      ageGroup: '3-6',
      difficulty: 'easy',
      duration: '18 хв',
      type: 'Презентація',
      rating: 4.6,
      downloads: 1434,
      views: 3276,
      author: 'Катерина Бондар',
      isPopular: false,
      isNew: false,
      isFree: true,
      previewImage: '📚',
      tags: ['вірші', 'казки', 'мовлення', 'лексика'],
      createdAt: '2024-01-06',
      updatedAt: '2024-01-09',
      parameters: ['Тип контенту (вірші/казки/потішки)', 'Тематика', 'Складність мови', 'Інтерактивні елементи'],
      outputFormats: ['Аудіо-книжки', 'Ілюстровані історії', 'Інтерактивні презентації']
    },
    {
      id: 15,
      title: 'Кольорові пригоди',
      description: 'Експерименти зі змішуванням кольорів та створення веселкових проектів.',
      category: 'activity',
      subject: 'art',
      ageGroup: '3-6',
      difficulty: 'easy',
      duration: '25 хв',
      type: 'Активність',
      rating: 4.8,
      downloads: 1276,
      views: 2654,
      author: 'Юлія Мороз',
      isPopular: false,
      isNew: true,
      isFree: true,
      previewImage: '🌈',
      tags: ['кольори', 'експерименти', 'веселка', 'змішування'],
      createdAt: '2024-01-24',
      updatedAt: '2024-01-25',
      parameters: ['Основні кольори', 'Матеріали (фарби/папір/пластилін)', 'Складність проекту', 'Результат творчості'],
      outputFormats: ['Творчі проекти', 'Експерименти з фарбами', 'Кольорові ігри']
    },
    {
      id: 16,
      title: 'Що плаває, що тоне?',
      description: 'Простий експеримент для розуміння властивостей предметів у воді.',
      category: 'activity',
      subject: 'science',
      ageGroup: '4-6',
      difficulty: 'easy',
      duration: '12 хв',
      type: 'Активність',
      rating: 4.7,
      downloads: 1167,
      views: 2645,
      author: 'Сергій Ткач',
      isPopular: false,
      isNew: false,
      isFree: true,
      previewImage: '🚣',
      tags: ['плавання', 'експерименти', 'властивості', 'вода'],
      createdAt: '2024-01-03',
      updatedAt: '2024-01-05',
      parameters: ['Типи предметів', 'Безпечні матеріали', 'Прогнозування результату', 'Пояснення явища'],
      outputFormats: ['Інструкція експерименту', 'Таблиця результатів', 'Відео-демонстрація']
    },
    {
      id: 17,
      title: 'Танцюємо під музику',
      description: 'Прості танцювальні рухи та ритмічні вправи для розвитку координації.',
      category: 'game',
      subject: 'music',
      ageGroup: '3-6',
      difficulty: 'easy',
      duration: '15 хв',
      type: 'Гра',
      rating: 4.6,
      downloads: 954,
      views: 2132,
      author: 'Олександр Гаврилов',
      isPopular: false,
      isNew: false,
      isFree: true,
      previewImage: '💃',
      tags: ['танці', 'рухи', 'координація', 'ритм'],
      createdAt: '2024-01-11',
      updatedAt: '2024-01-13',
      parameters: ['Стиль музики', 'Складність рухів', 'Тривалість танцю', 'Групові/індивідуальні'],
      outputFormats: ['Відео-уроки', 'Музичні треки', 'Схеми рухів']
    },
    {
      id: 18,
      title: 'Мій рідний край',
      description: 'Знайомство з рідним містом, традиціями та символами через ігри та розповіді.',
      category: 'presentation',
      subject: 'geography',
      ageGroup: '4-6',
      difficulty: 'easy',
      duration: '20 хв',
      type: 'Презентація',
      rating: 4.5,
      downloads: 987,
      views: 2123,
      author: 'Володимир Лисенко',
      isPopular: false,
      isNew: false,
      isFree: true,
      previewImage: '🏠',
      tags: ['рідний край', 'традиції', 'символи', 'дім'],
      createdAt: '2023-12-10',
      updatedAt: '2023-12-12',
      parameters: ['Регіон/місто', 'Традиції та свята', 'Символи та пам\'ятки', 'Інтерактивні елементи'],
      outputFormats: ['Віртуальна подорож', 'Презентація з фото', 'Ігри-вікторини']
    },
    {
      id: 19,
      title: 'Більше-менше-порівну',
      description: 'Вивчення понять кількості та порівняння через наочні приклади та ігри.',
      category: 'game',
      subject: 'math',
      ageGroup: '3-5',
      difficulty: 'easy',
      duration: '10 хв',
      type: 'Гра',
      rating: 4.8,
      downloads: 1567,
      views: 3234,
      author: 'Людмила Кравець',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '⚖️',
      tags: ['порівняння', 'кількість', 'більше', 'менше'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-03',
      parameters: ['Типи об\'єктів для порівняння', 'Кількісний діапазон', 'Візуальні підказки', 'Рівень складності'],
      outputFormats: ['Інтерактивні ігри', 'Картки для порівняння', 'Практичні завдання']
    },
    {
      id: 20,
      title: 'Звуки навколо нас',
      description: 'Розпізнавання звуків природи, тварин та повсякденного життя для розвитку слуху.',
      category: 'quiz',
      subject: 'english',
      ageGroup: '3-6',
      difficulty: 'easy',
      duration: '12 хв',
      type: 'Квіз',
      rating: 4.7,
      downloads: 1834,
      views: 3876,
      author: 'Марина Зайцева',
      isPopular: true,
      isNew: true,
      isFree: true,
      previewImage: '🔊',
      tags: ['звуки', 'слух', 'розпізнавання', 'навколишній світ'],
      createdAt: '2024-01-29',
      updatedAt: '2024-01-30',
      parameters: ['Категорії звуків (природа/тварини/транспорт)', 'Складність розпізнавання', 'Кількість звуків', 'Візуальні підказки'],
      outputFormats: ['Аудіо-квіз', 'Звукові картки', 'Ігри на розпізнавання']
    },
    // Шаблони для дітей 6-8 років
    {
      id: 21,
      title: 'Математичні приклади до 100',
      description: 'Конструктор для створення прикладів з додавання та віднімання в межах 100. З покроковими поясненнями.',
      category: 'worksheet',
      subject: 'math',
      ageGroup: '6-8',
      difficulty: 'easy',
      duration: '20 хв',
      type: 'Робочий аркуш',
      rating: 4.8,
      downloads: 3245,
      views: 6789,
      author: 'Олександра Ткач',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '🧮',
      tags: ['математика', 'додавання', 'віднімання', 'школярі'],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-18',
      parameters: ['Операція (додавання/віднімання)', 'Діапазон чисел (до 20/50/100)', 'Кількість прикладів', 'Рівень допомоги'],
      outputFormats: ['Робочі аркуші', 'Інтерактивний тренажер', 'Контрольні картки']
    },
    {
      id: 22,
      title: 'Читання з розумінням',
      description: 'Створення коротких текстів з питаннями для перевірки розуміння прочитаного.',
      category: 'quiz',
      subject: 'english',
      ageGroup: '6-8',
      difficulty: 'easy',
      duration: '25 хв',
      type: 'Квіз',
      rating: 4.7,
      downloads: 2156,
      views: 4523,
      author: 'Марія Левченко',
      isPopular: true,
      isNew: true,
      isFree: true,
      previewImage: '📖',
      tags: ['читання', 'розуміння', 'тексти', 'молодші класи'],
      createdAt: '2024-01-25',
      updatedAt: '2024-01-27',
      parameters: ['Складність тексту', 'Тематика (казки/природа/пригоди)', 'Кількість питань', 'Тип питань'],
      outputFormats: ['Тексти з питаннями', 'Інтерактивний квіз', 'Аудіо-книга']
    },
    {
      id: 23,
      title: 'Перші наукові досліди',
      description: 'Безпечні експерименти для пояснення базових наукових концепцій з детальними інструкціями.',
      category: 'activity',
      subject: 'science',
      ageGroup: '6-8',
      difficulty: 'medium',
      duration: '30 хв',
      type: 'Активність',
      rating: 4.9,
      downloads: 1876,
      views: 3456,
      author: 'Іван Науменко',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '🔬',
      tags: ['наука', 'експерименти', 'досліди', 'пізнання'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-12',
      parameters: ['Галузь науки (фізика/хімія/біологія)', 'Складність експерименту', 'Необхідні матеріали', 'Пояснення явища'],
      outputFormats: ['Покрокові інструкції', 'Журнал спостережень', 'Відео-демонстрація']
    },
    {
      id: 24,
      title: 'Базова англійська граматика',
      description: 'Вивчення простих граматичних структур через ігри та вправи з наочними прикладами.',
      category: 'worksheet',
      subject: 'english',
      ageGroup: '6-8',
      difficulty: 'easy',
      duration: '18 хв',
      type: 'Робочий аркуш',
      rating: 4.6,
      downloads: 1654,
      views: 3287,
      author: 'Вікторія Кovalенко',
      isPopular: false,
      isNew: true,
      isFree: true,
      previewImage: '📝',
      tags: ['граматика', 'англійська', 'базові правила', 'вправи'],
      createdAt: '2024-01-28',
      updatedAt: '2024-01-30',
      parameters: ['Граматична тема (артиклі/множина/часи)', 'Рівень складності', 'Кількість прикладів', 'Ігрові елементи'],
      outputFormats: ['Робочі аркуші', 'Інтерактивні вправи', 'Граматичні картки']
    },
    {
      id: 25,
      title: 'Малюємо та вивчаємо мистецтво',
      description: 'Знайомство з основами образотворчого мистецтва через практичні завдання та творчі проекти.',
      category: 'activity',
      subject: 'art',
      ageGroup: '6-8',
      difficulty: 'easy',
      duration: '35 хв',
      type: 'Активність',
      rating: 4.5,
      downloads: 1234,
      views: 2567,
      author: 'Олена Артеменко',
      isPopular: false,
      isNew: false,
      isFree: true,
      previewImage: '🎨',
      tags: ['мистецтво', 'малювання', 'техніки', 'творчість'],
      createdAt: '2024-01-08',
      updatedAt: '2024-01-10',
      parameters: ['Техніка малювання (олівець/акварель/гуаш)', 'Тематика робіт', 'Складність завдання', 'Етапи виконання'],
      outputFormats: ['Покрокові схеми', 'Відео-уроки', 'Галерея прикладів']
    },
    {
      id: 26,
      title: 'Геометрія навколо нас',
      description: 'Вивчення основних геометричних фігур та їх властивостей через практичні завдання.',
      category: 'game',
      subject: 'math',
      ageGroup: '6-8',
      difficulty: 'easy',
      duration: '22 хв',
      type: 'Гра',
      rating: 4.7,
      downloads: 1987,
      views: 4123,
      author: 'Андрій Геометров',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '📐',
      tags: ['геометрія', 'фігури', 'властивості', 'математика'],
      createdAt: '2024-01-05',
      updatedAt: '2024-01-07',
      parameters: ['Типи фігур (2D/3D)', 'Рівень складності', 'Практичні приклади', 'Ігрові завдання'],
      outputFormats: ['Інтерактивні ігри', 'Геометричні пазли', 'Практичні завдання']
    },
    {
      id: 27,
      title: 'Музичні інструменти світу',
      description: 'Знайомство з різними музичними інструментами через звуки, історії та інтерактивні завдання.',
      category: 'presentation',
      subject: 'music',
      ageGroup: '6-8',
      difficulty: 'easy',
      duration: '28 хв',
      type: 'Презентація',
      rating: 4.6,
      downloads: 1456,
      views: 2789,
      author: 'Юлія Мелодійна',
      isPopular: false,
      isNew: true,
      isFree: true,
      previewImage: '🎼',
      tags: ['музика', 'інструменти', 'культура', 'звуки'],
      createdAt: '2024-01-26',
      updatedAt: '2024-01-28',
      parameters: ['Група інструментів (струнні/духові/ударні)', 'Регіон світу', 'Включити звуки', 'Інтерактивні елементи'],
      outputFormats: ['Музична презентація', 'Аудіо-колекція', 'Ігри на розпізнавання']
    },
    {
      id: 28,
      title: 'Планета Земля та її таємниці',
      description: 'Базове знайомство з географією, континентами та цікавими фактами про нашу планету.',
      category: 'presentation',
      subject: 'geography',
      ageGroup: '6-8',
      difficulty: 'easy',
      duration: '30 хв',
      type: 'Презентація',
      rating: 4.8,
      downloads: 2345,
      views: 5678,
      author: 'Михайло Мандрівник',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '🌍',
      tags: ['географія', 'планета', 'континенти', 'факти'],
      createdAt: '2024-01-03',
      updatedAt: '2024-01-05',
      parameters: ['Континент/регіон', 'Тип інформації (природа/країни/культура)', 'Рівень деталізації', 'Інтерактивні карти'],
      outputFormats: ['Інтерактивна презентація', 'Віртуальна подорож', 'Географічні ігри']
    },
    {
      id: 29,
      title: 'Таблиця множення - перші кроки',
      description: 'Поступове вивчення таблиці множення з 2 до 5 через ігри та візуальні приклади.',
      category: 'game',
      subject: 'math',
      ageGroup: '6-8',
      difficulty: 'medium',
      duration: '25 хв',
      type: 'Гра',
      rating: 4.9,
      downloads: 3456,
      views: 7890,
      author: 'Наталя Рахункова',
      isPopular: true,
      isNew: true,
      isFree: true,
      previewImage: '✖️',
      tags: ['множення', 'таблиця', 'математика', 'тренування'],
      createdAt: '2024-01-29',
      updatedAt: '2024-01-31',
      parameters: ['Таблиця (2/3/4/5)', 'Метод навчання (візуальний/ігровий)', 'Рівень тренування', 'Система нагород'],
      outputFormats: ['Ігровий тренажер', 'Візуальні схеми', 'Контрольні картки']
    },
    {
      id: 30,
      title: 'Словниковий запас: 100 нових слів',
      description: 'Поступове поповнення словникового запасу через тематичні групи слів та ігри.',
      category: 'quiz',
      subject: 'english',
      ageGroup: '6-8',
      difficulty: 'easy',
      duration: '20 хв',
      type: 'Квіз',
      rating: 4.7,
      downloads: 2678,
      views: 5234,
      author: 'Ольга Словникова',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '📚',
      tags: ['словник', 'слова', 'вокабуляр', 'мова'],
      createdAt: '2024-01-12',
      updatedAt: '2024-01-14',
      parameters: ['Тематична група (дім/школа/природа/спорт)', 'Кількість слів за урок', 'Включити вимову', 'Ігрові активності'],
      outputFormats: ['Словникові картки', 'Інтерактивні ігри', 'Тематичні квізи']
    },
    {
      id: 31,
      title: 'Цікаві факти про тварин',
      description: 'Пізнавальні історії про тварин різних континентів з науковими фактами для дітей.',
      category: 'presentation',
      subject: 'science',
      ageGroup: '6-8',
      difficulty: 'easy',
      duration: '24 хв',
      type: 'Презентація',
      rating: 4.6,
      downloads: 1789,
      views: 3456,
      author: 'Ігор Зоолог',
      isPopular: false,
      isNew: false,
      isFree: true,
      previewImage: '🦒',
      tags: ['тварини', 'факти', 'природа', 'біологія'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-03',
      parameters: ['Тип тварин (ссавці/птахи/риби/комахи)', 'Континент/середовище', 'Рівень наукових фактів', 'Інтерактивні елементи'],
      outputFormats: ['Енциклопедична презентація', 'Аудіо-розповіді', 'Вікторини про тварин']
    },
    {
      id: 32,
      title: 'Мої перші творчі проекти',
      description: 'Конструктор для створення простих творчих проектів: листівки, закладки, прикраси.',
      category: 'activity',
      subject: 'art',
      ageGroup: '6-8',
      difficulty: 'easy',
      duration: '40 хв',
      type: 'Активність',
      rating: 4.5,
      downloads: 1234,
      views: 2345,
      author: 'Катерина Творча',
      isPopular: false,
      isNew: true,
      isFree: false,
      previewImage: '✂️',
      tags: ['проекти', 'творчість', 'рукоділля', 'поробки'],
      createdAt: '2024-01-27',
      updatedAt: '2024-01-29',
      parameters: ['Тип проекту (листівка/закладка/прикраса)', 'Матеріали (папір/картон/тканина)', 'Складність виконання', 'Тематика оформлення'],
      outputFormats: ['Покрокові інструкції', 'Шаблони для друку', 'Відео майстер-класи']
    },
    {
      id: 33,
      title: 'Години та час',
      description: 'Вивчення годинника, визначення часу та планування дня через практичні завдання.',
      category: 'worksheet',
      subject: 'math',
      ageGroup: '6-8',
      difficulty: 'medium',
      duration: '30 хв',
      type: 'Робочий аркуш',
      rating: 4.8,
      downloads: 2345,
      views: 4567,
      author: 'Володимир Часовий',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '🕐',
      tags: ['час', 'годинник', 'планування', 'практика'],
      createdAt: '2024-01-06',
      updatedAt: '2024-01-08',
      parameters: ['Тип годинника (механічний/цифровий)', 'Точність (година/півгодини/15 хв)', 'Практичні ситуації', 'Рівень складності'],
      outputFormats: ['Робочі аркуші', 'Інтерактивний годинник', 'Плани дня']
    },
    {
      id: 34,
      title: 'Прості пісні англійською',
      description: 'Вивчення англійської через прості пісні з повторюваними фразами та зрозумілою лексикою.',
      category: 'activity',
      subject: 'music',
      ageGroup: '6-8',
      difficulty: 'easy',
      duration: '20 хв',
      type: 'Активність',
      rating: 4.7,
      downloads: 1567,
      views: 3123,
      author: 'Анна Мелодія',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '🎤',
      tags: ['пісні', 'англійська', 'музика', 'вивчення'],
      createdAt: '2024-01-11',
      updatedAt: '2024-01-13',
      parameters: ['Тематика пісень (числа/кольори/родина)', 'Складність лексики', 'Включити караоке', 'Рухи та жести'],
      outputFormats: ['Аудіо з текстом', 'Караоке версії', 'Відео з рухами']
    },
    {
      id: 35,
      title: 'Моя країна - Україна',
      description: 'Знайомство з символами, традиціями та географією України через інтерактивні матеріали.',
      category: 'presentation',
      subject: 'geography',
      ageGroup: '6-8',
      difficulty: 'easy',
      duration: '35 хв',
      type: 'Презентація',
      rating: 4.9,
      downloads: 3456,
      views: 6789,
      author: 'Петро Патріот',
      isPopular: true,
      isNew: true,
      isFree: true,
      previewImage: '🇺🇦',
      tags: ['україна', 'символи', 'традиції', 'географія'],
      createdAt: '2024-01-30',
      updatedAt: '2024-02-01',
      parameters: ['Тема (символи/географія/традиції/історія)', 'Регіон України', 'Рівень деталізації', 'Інтерактивні елементи'],
      outputFormats: ['Патріотична презентація', 'Віртуальна екскурсія', 'Україно-знавчі ігри']
    },
    {
      id: 36,
      title: 'Задачі на логіку та мислення',
      description: 'Розвиток логічного мислення через цікаві завдання, головоломки та математичні задачі.',
      category: 'quiz',
      subject: 'math',
      ageGroup: '6-8',
      difficulty: 'medium',
      duration: '25 хв',
      type: 'Квіз',
      rating: 4.8,
      downloads: 2789,
      views: 5234,
      author: 'Софія Логічна',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '🧩',
      tags: ['логіка', 'мислення', 'головоломки', 'задачі'],
      createdAt: '2024-01-16',
      updatedAt: '2024-01-18',
      parameters: ['Тип завдань (логічні/математичні/просторові)', 'Рівень складності', 'Кількість завдань', 'Підказки'],
      outputFormats: ['Інтерактивні головоломки', 'Логічні картки', 'Турнір з логіки']
    },
    {
      id: 37,
      title: 'Основи здорового харчування',
      description: 'Знайомство з корисними продуктами та правилами здорового харчування через ігри.',
      category: 'presentation',
      subject: 'science',
      ageGroup: '6-8',
      difficulty: 'easy',
      duration: '22 хв',
      type: 'Презентація',
      rating: 4.6,
      downloads: 1456,
      views: 2789,
      author: 'Марина Здорова',
      isPopular: false,
      isNew: true,
      isFree: true,
      previewImage: '🥕',
      tags: ['харчування', 'здоров\'я', 'продукти', 'корисне'],
      createdAt: '2024-01-28',
      updatedAt: '2024-01-30',
      parameters: ['Група продуктів (фрукти/овочі/білки/злаки)', 'Вікові потреби', 'Інтерактивні ігри', 'Практичні поради'],
      outputFormats: ['Харчова піраміда', 'Ігри про продукти', 'Поради для батьків']
    },
    {
      id: 38,
      title: 'Творимо мелодії разом',
      description: 'Основи музичної творчості: створення простих мелодій та ритмів на різних інструментах.',
      category: 'activity',
      subject: 'music',
      ageGroup: '6-8',
      difficulty: 'medium',
      duration: '30 хв',
      type: 'Активність',
      rating: 4.5,
      downloads: 987,
      views: 1876,
      author: 'Богдан Композитор',
      isPopular: false,
      isNew: false,
      isFree: false,
      previewImage: '🎹',
      tags: ['мелодії', 'композиція', 'інструменти', 'творчість'],
      createdAt: '2024-01-09',
      updatedAt: '2024-01-11',
      parameters: ['Інструмент (фортепіано/флейта/ударні)', 'Складність мелодії', 'Жанр музики', 'Запис результату'],
      outputFormats: ['Музичні вправи', 'Простий секвенсор', 'Збірка мелодій']
    },
    {
      id: 39,
      title: 'Вивчаємо алфавіт та письмо',
      description: 'Правильне написання літер, слів та перших речень з каліграфічними вправами.',
      category: 'worksheet',
      subject: 'english',
      ageGroup: '6-8',
      difficulty: 'easy',
      duration: '25 хв',
      type: 'Робочий аркуш',
      rating: 4.7,
      downloads: 2134,
      views: 4321,
      author: 'Людмила Письменна',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '✍️',
      tags: ['письмо', 'алфавіт', 'каліграфія', 'почерк'],
      createdAt: '2024-01-04',
      updatedAt: '2024-01-06',
      parameters: ['Тип письма (друковані/прописні)', 'Мова (українська/англійська)', 'Рівень складності', 'Каліграфічні вправи'],
      outputFormats: ['Прописи', 'Каліграфічні вправи', 'Контроль письма']
    },
    {
      id: 40,
      title: 'Космос та планети',
      description: 'Захоплююча подорож космосом: планети, зірки та космічні явища для молодих дослідників.',
      category: 'presentation',
      subject: 'science',
      ageGroup: '6-8',
      difficulty: 'easy',
      duration: '28 хв',
      type: 'Презентація',
      rating: 4.9,
      downloads: 3789,
      views: 7234,
      author: 'Олексій Космонавт',
      isPopular: true,
      isNew: true,
      isFree: true,
      previewImage: '🚀',
      tags: ['космос', 'планети', 'астрономія', 'дослідження'],
      createdAt: '2024-01-31',
      updatedAt: '2024-02-02',
      parameters: ['Об\'єкт вивчення (планети/зірки/супутники)', 'Рівень наукових фактів', 'Інтерактивні елементи', 'Космічні місії'],
      outputFormats: ['Космічна презентація', 'Віртуальний планетарій', 'Космічні ігри']
    },
    // Шаблони для дітей 8-10 років
    {
      id: 41,
      title: 'Складні математичні задачі',
      description: 'Конструктор текстових задач з множенням, діленням та комбінованими операціями для розвитку аналітичного мислення.',
      category: 'worksheet',
      subject: 'math',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '35 хв',
      type: 'Робочий аркуш',
      rating: 4.8,
      downloads: 4567,
      views: 8923,
      author: 'Олександр Математик',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '🧮',
      tags: ['математика', 'задачі', 'аналіз', 'логіка'],
      createdAt: '2024-01-20',
      updatedAt: '2024-01-22',
      parameters: ['Тип операцій (×÷ + комбіновані)', 'Складність чисел (до 1000)', 'Кількість дій в задачі', 'Життєві ситуації'],
      outputFormats: ['Збірка задач', 'Покрокові розв\'язання', 'Методичні поради']
    },
    {
      id: 42,
      title: 'Англійська граматика: часи дієслів',
      description: 'Вивчення основних часових форм англійської мови через інтерактивні вправи та практичні завдання.',
      category: 'worksheet',
      subject: 'english',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '40 хв',
      type: 'Робочий аркуш',
      rating: 4.7,
      downloads: 3456,
      views: 6789,
      author: 'Емма Граматична',
      isPopular: true,
      isNew: true,
      isFree: true,
      previewImage: '⏰',
      tags: ['граматика', 'часи', 'дієслова', 'англійська'],
      createdAt: '2024-01-28',
      updatedAt: '2024-01-30',
      parameters: ['Часова форма (Present/Past/Future)', 'Тип дієслів (правильні/неправильні)', 'Рівень складності', 'Контекстні приклади'],
      outputFormats: ['Граматичні таблиці', 'Інтерактивні вправи', 'Тестові завдання']
    },
    {
      id: 43,
      title: 'Наукові експерименти з хімії',
      description: 'Безпечні хімічні досліди для демонстрації основних хімічних реакцій та властивостей речовин.',
      category: 'activity',
      subject: 'science',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '45 хв',
      type: 'Активність',
      rating: 4.9,
      downloads: 2789,
      views: 5234,
      author: 'Марія Хімік',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '⚗️',
      tags: ['хімія', 'реакції', 'експерименти', 'молекули'],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-17',
      parameters: ['Тип реакції (кислота-основа/окислення/індикатори)', 'Безпечні реагенти', 'Очікуваний результат', 'Наукове пояснення'],
      outputFormats: ['Лабораторний журнал', 'Відео-інструкції', 'Звіт про досліди']
    },
    {
      id: 44,
      title: 'Створення власних оповідань',
      description: 'Розвиток творчого письма через створення коротких оповідань з персонажами та сюжетними лініями.',
      category: 'activity',
      subject: 'english',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '50 хв',
      type: 'Активність',
      rating: 4.6,
      downloads: 1876,
      views: 3456,
      author: 'Ігор Письменник',
      isPopular: false,
      isNew: true,
      isFree: true,
      previewImage: '📝',
      tags: ['письмо', 'оповідання', 'творчість', 'сюжет'],
      createdAt: '2024-01-25',
      updatedAt: '2024-01-27',
      parameters: ['Жанр (пригоди/фантастика/реалістичний)', 'Кількість персонажів', 'Структура сюжету', 'Обсяг тексту'],
      outputFormats: ['Шаблони оповідань', 'Конструктор персонажів', 'Літературні поради']
    },
    {
      id: 45,
      title: 'Мистецтво епох: від античності до сучасності',
      description: 'Подорож історією мистецтва з вивченням стилів, художників та культурних особливостей різних епох.',
      category: 'presentation',
      subject: 'art',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '45 хв',
      type: 'Презентація',
      rating: 4.5,
      downloads: 1234,
      views: 2567,
      author: 'Вікторія Мистецька',
      isPopular: false,
      isNew: false,
      isFree: false,
      previewImage: '🎭',
      tags: ['мистецтво', 'історія', 'стилі', 'культура'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-12',
      parameters: ['Історична епоха (античність/середньовіччя/ренесанс/модерн)', 'Вид мистецтва', 'Відомі художники', 'Інтерактивні елементи'],
      outputFormats: ['Віртуальна галерея', 'Мистецькі квести', 'Творчі проекти']
    },
    {
      id: 46,
      title: 'Дроби та десяткові числа',
      description: 'Комплексне вивчення дробів, десяткових чисел та їх застосування в практичних ситуаціях.',
      category: 'worksheet',
      subject: 'math',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '40 хв',
      type: 'Робочий аркуш',
      rating: 4.7,
      downloads: 3678,
      views: 7234,
      author: 'Людмила Дробова',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '½',
      tags: ['дроби', 'десяткові', 'математика', 'практика'],
      createdAt: '2024-01-08',
      updatedAt: '2024-01-10',
      parameters: ['Тип дробів (прості/десяткові/змішані)', 'Операції (+−×÷)', 'Практичні застосування', 'Рівень візуалізації'],
      outputFormats: ['Тренувальні вправи', 'Візуальні моделі', 'Практичні задачі']
    },
    {
      id: 47,
      title: 'Основи програмування: алгоритми',
      description: 'Знайомство з основами алгоритмічного мислення через візуальне програмування та логічні завдання.',
      category: 'game',
      subject: 'science',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '35 хв',
      type: 'Гра',
      rating: 4.8,
      downloads: 2345,
      views: 4567,
      author: 'Андрій Програміст',
      isPopular: true,
      isNew: true,
      isFree: true,
      previewImage: '💻',
      tags: ['програмування', 'алгоритми', 'логіка', 'IT'],
      createdAt: '2024-01-29',
      updatedAt: '2024-01-31',
      parameters: ['Тип завдань (послідовності/цикли/умови)', 'Візуальна мова', 'Складність алгоритму', 'Ігрові елементи'],
      outputFormats: ['Візуальні алгоритми', 'Логічні головоломки', 'Програмні проекти']
    },
    {
      id: 48,
      title: 'Світова географія: континенти та океани',
      description: 'Детальне вивчення географії світу з картами, кліматом та особливостями різних регіонів.',
      category: 'presentation',
      subject: 'geography',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '40 хв',
      type: 'Презентація',
      rating: 4.8,
      downloads: 3789,
      views: 6234,
      author: 'Оксана Географ',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '🗺️',
      tags: ['географія', 'континенти', 'океани', 'клімат'],
      createdAt: '2024-01-12',
      updatedAt: '2024-01-14',
      parameters: ['Континент/регіон', 'Тип інформації (фізична/політична/економічна)', 'Рівень деталізації', 'Порівняльний аналіз'],
      outputFormats: ['Інтерактивні карти', 'Географічні квести', 'Порівняльні таблиці']
    },
    {
      id: 49,
      title: 'Музична теорія: ноти та ритми',
      description: 'Вивчення музичної грамоти, нотного запису та основних ритмічних патернів через практику.',
      category: 'activity',
      subject: 'music',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '35 хв',
      type: 'Активність',
      rating: 4.6,
      downloads: 1567,
      views: 2890,
      author: 'Микола Нотний',
      isPopular: false,
      isNew: false,
      isFree: true,
      previewImage: '🎼',
      tags: ['музична теорія', 'ноти', 'ритм', 'грамота'],
      createdAt: '2024-01-06',
      updatedAt: '2024-01-08',
      parameters: ['Музичний ключ (скрипичний/басовий)', 'Тривалості нот', 'Ритмічні патерни', 'Практичні вправи'],
      outputFormats: ['Нотні вправи', 'Ритмічні ігри', 'Музичні диктанти']
    },
    {
      id: 50,
      title: 'Екологія та охорона природи',
      description: 'Вивчення екосистем, екологічних проблем та способів захисту навколишнього середовища.',
      category: 'presentation',
      subject: 'science',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '45 хв',
      type: 'Презентація',
      rating: 4.9,
      downloads: 2678,
      views: 5123,
      author: 'Тетяна Еколог',
      isPopular: true,
      isNew: true,
      isFree: true,
      previewImage: '🌱',
      tags: ['екологія', 'природа', 'охорона', 'екосистеми'],
      createdAt: '2024-01-30',
      updatedAt: '2024-02-01',
      parameters: ['Тип екосистеми (ліс/водойма/степ)', 'Екологічні проблеми', 'Способи захисту', 'Практичні дії'],
      outputFormats: ['Еко-презентації', 'Проекти захисту', 'Практичні поради']
    },
    {
      id: 51,
      title: 'Періметр та площа фігур',
      description: 'Практичне вивчення геометричних понять через вимірювання та обчислення реальних об\'єктів.',
      category: 'worksheet',
      subject: 'math',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '30 хв',
      type: 'Робочий аркуш',
      rating: 4.7,
      downloads: 2456,
      views: 4789,
      author: 'Сергій Геометр',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '📐',
      tags: ['геометрія', 'площа', 'периметр', 'вимірювання'],
      createdAt: '2024-01-18',
      updatedAt: '2024-01-20',
      parameters: ['Тип фігур (квадрат/прямокутник/трикутник)', 'Одиниці вимірювання', 'Практичні об\'єкти', 'Рівень складності'],
      outputFormats: ['Вимірювальні завдання', 'Практичні вправи', 'Геометричні проекти']
    },
    {
      id: 52,
      title: 'Англійська розмовна практика',
      description: 'Розвиток розмовних навичок через діалоги, рольові ігри та комунікативні ситуації.',
      category: 'activity',
      subject: 'english',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '30 хв',
      type: 'Активність',
      rating: 4.8,
      downloads: 3234,
      views: 5678,
      author: 'Джейн Розмовна',
      isPopular: true,
      isNew: true,
      isFree: true,
      previewImage: '💬',
      tags: ['розмова', 'діалоги', 'спілкування', 'практика'],
      createdAt: '2024-01-26',
      updatedAt: '2024-01-28',
      parameters: ['Тематика розмов (школа/хобі/подорожі)', 'Рівень складності', 'Кількість учасників', 'Аудіо підтримка'],
      outputFormats: ['Діалогові сценарії', 'Аудіо-тренажери', 'Рольові ігри']
    },
    {
      id: 53,
      title: 'Фізичні явища: сила та рух',
      description: 'Вивчення основних фізичних законів через експерименти з силою, рухом та енергією.',
      category: 'activity',
      subject: 'science',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '40 хв',
      type: 'Активність',
      rating: 4.6,
      downloads: 1789,
      views: 3456,
      author: 'Віталій Фізик',
      isPopular: false,
      isNew: false,
      isFree: true,
      previewImage: '⚡',
      tags: ['фізика', 'сила', 'рух', 'енергія'],
      createdAt: '2024-01-14',
      updatedAt: '2024-01-16',
      parameters: ['Тип явища (інерція/гравітація/тертя)', 'Експериментальні матеріали', 'Безпека досліду', 'Практичні застосування'],
      outputFormats: ['Фізичні досліди', 'Журнал вимірювань', 'Наукові пояснення']
    },
    {
      id: 54,
      title: 'Скульптура та 3D мистецтво',
      description: 'Основи тривимірного мистецтва через роботу з пластиліном, глиною та простими матеріалами.',
      category: 'activity',
      subject: 'art',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '60 хв',
      type: 'Активність',
      rating: 4.5,
      downloads: 987,
      views: 1876,
      author: 'Олена Скульптор',
      isPopular: false,
      isNew: true,
      isFree: false,
      previewImage: '🗿',
      tags: ['скульптура', '3D', 'ліплення', 'форма'],
      createdAt: '2024-01-27',
      updatedAt: '2024-01-29',
      parameters: ['Матеріал (пластилін/глина/тісто)', 'Тематика робіт', 'Техніки ліплення', 'Розмір проекту'],
      outputFormats: ['Покрокові інструкції', '3D проекти', 'Галерея робіт']
    },
    {
      id: 55,
      title: 'Україна в світі: історія та культура',
      description: 'Поглиблене вивчення української історії, культурних традицій та місця України у світовому контексті.',
      category: 'presentation',
      subject: 'geography',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '50 хв',
      type: 'Презентація',
      rating: 4.9,
      downloads: 4567,
      views: 8234,
      author: 'Богдан Історик',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '🏛️',
      tags: ['україна', 'історія', 'культура', 'традиції'],
      createdAt: '2024-01-05',
      updatedAt: '2024-01-07',
      parameters: ['Історичний період', 'Культурна сфера (мистецтво/література/музика)', 'Регіональні особливості', 'Міжнародні зв\'язки'],
      outputFormats: ['Історичні презентації', 'Культурні проекти', 'Віртуальні екскурсії']
    },
    {
      id: 56,
      title: 'Статистика та графіки',
      description: 'Збір, аналіз та представлення даних через створення різних типів графіків та діаграм.',
      category: 'worksheet',
      subject: 'math',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '35 хв',
      type: 'Робочий аркуш',
      rating: 4.6,
      downloads: 1876,
      views: 3234,
      author: 'Анна Статистик',
      isPopular: false,
      isNew: true,
      isFree: true,
      previewImage: '📊',
      tags: ['статистика', 'графіки', 'дані', 'аналіз'],
      createdAt: '2024-01-28',
      updatedAt: '2024-01-30',
      parameters: ['Тип даних (опитування/спостереження/експерименти)', 'Вид графіків (стовпчасті/кругові/лінійні)', 'Обсяг вибірки', 'Висновки з даних'],
      outputFormats: ['Збірники даних', 'Конструктор графіків', 'Аналітичні звіти']
    },
    {
      id: 57,
      title: 'Комп\'ютерна грамотність',
      description: 'Основи роботи з комп\'ютером, інтернетом та цифровими технологіями для сучасних школярів.',
      category: 'activity',
      subject: 'science',
      ageGroup: '8-10',
      difficulty: 'easy',
      duration: '40 хв',
      type: 'Активність',
      rating: 4.7,
      downloads: 2567,
      views: 4890,
      author: 'Максим IT-шник',
      isPopular: true,
      isNew: true,
      isFree: true,
      previewImage: '🖥️',
      tags: ['комп\'ютер', 'технології', 'інтернет', 'цифрова грамотність'],
      createdAt: '2024-01-31',
      updatedAt: '2024-02-02',
      parameters: ['Тема (основи ПК/інтернет/безпека/офісні програми)', 'Рівень навичок', 'Практичні завдання', 'Цифрова етика'],
      outputFormats: ['Інтерактивні уроки', 'Практичні завдання', 'Тести з безпеки']
    },
    {
      id: 58,
      title: 'Створення музичних композицій',
      description: 'Поглиблена музична творчість: аранжування, гармонія та створення власних музичних творів.',
      category: 'activity',
      subject: 'music',
      ageGroup: '8-10',
      difficulty: 'hard',
      duration: '45 хв',
      type: 'Активність',
      rating: 4.4,
      downloads: 876,
      views: 1567,
      author: 'Софія Композитор',
      isPopular: false,
      isNew: false,
      isFree: false,
      previewImage: '🎵',
      tags: ['композиція', 'аранжування', 'гармонія', 'творчість'],
      createdAt: '2024-01-09',
      updatedAt: '2024-01-11',
      parameters: ['Музичний стиль', 'Інструментальний склад', 'Структура композиції', 'Технічна складність'],
      outputFormats: ['Музичні секвенції', 'Нотні записи', 'Аудіо-композиції']
    },
    {
      id: 59,
      title: 'Наукові проекти та дослідження',
      description: 'Проведення власних наукових досліджень з формулюванням гіпотез та аналізом результатів.',
      category: 'activity',
      subject: 'science',
      ageGroup: '8-10',
      difficulty: 'hard',
      duration: '60 хв',
      type: 'Активність',
      rating: 4.8,
      downloads: 1543,
      views: 2890,
      author: 'Дмитро Дослідник',
      isPopular: true,
      isNew: true,
      isFree: true,
      previewImage: '🔬',
      tags: ['дослідження', 'гіпотези', 'аналіз', 'наука'],
      createdAt: '2024-01-30',
      updatedAt: '2024-02-01',
      parameters: ['Наукова галузь', 'Тип дослідження (спостереження/експеримент)', 'Тривалість проекту', 'Методи аналізу'],
      outputFormats: ['Наукові звіти', 'Презентації досліджень', 'Методичні посібники']
    },
    {
      id: 60,
      title: 'Літературний аналіз творів',
      description: 'Розвиток навичок аналізу художніх творів через вивчення персонажів, сюжету та авторського стилю.',
      category: 'quiz',
      subject: 'english',
      ageGroup: '8-10',
      difficulty: 'medium',
      duration: '40 хв',
      type: 'Квіз',
      rating: 4.7,
      downloads: 2134,
      views: 4321,
      author: 'Валентина Літературознавець',
      isPopular: true,
      isNew: false,
      isFree: true,
      previewImage: '📚',
      tags: ['література', 'аналіз', 'персонажі', 'сюжет'],
      createdAt: '2024-01-16',
      updatedAt: '2024-01-18',
      parameters: ['Жанр твору (казка/оповідання/вірш)', 'Аспекти аналізу (персонажі/сюжет/стиль)', 'Складність питань', 'Творчі завдання'],
      outputFormats: ['Аналітичні питання', 'Літературні проекти', 'Творчі есе']
    }
  ]);

  const categories = [
    { value: 'all', label: 'Всі категорії', count: templates.length },
    { value: 'quiz', label: 'Квізи', count: templates.filter(t => t.category === 'quiz').length },
    { value: 'presentation', label: 'Презентації', count: templates.filter(t => t.category === 'presentation').length },
    { value: 'worksheet', label: 'Робочі аркуші', count: templates.filter(t => t.category === 'worksheet').length },
    { value: 'activity', label: 'Активності', count: templates.filter(t => t.category === 'activity').length },
    { value: 'game', label: 'Ігри', count: templates.filter(t => t.category === 'game').length }
  ];

  const subjects = [
    { value: 'all', label: 'Всі предмети' },
    { value: 'math', label: 'Математика', icon: Calculator, color: '#1976d2' },
    { value: 'english', label: 'Англійська', icon: BookOpen, color: '#388e3c' },
    { value: 'art', label: 'Мистецтво', icon: Palette, color: '#e91e63' },
    { value: 'science', label: 'Наука', icon: Globe, color: '#7b1fa2' },
    { value: 'music', label: 'Музика', icon: Music, color: '#f57c00' },
    { value: 'geography', label: 'Географія', icon: Globe, color: '#795548' }
  ];

  const getSubjectIcon = (subject: string) => {
    const subjectData = subjects.find(s => s.value === subject);
    return subjectData?.icon || BookOpen;
  };

  const getSubjectColor = (subject: string) => {
    const subjectData = subjects.find(s => s.value === subject);
    return subjectData?.color || theme.palette.grey[600];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.palette.success.main;
      case 'medium': return theme.palette.warning.main;
      case 'hard': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легкий';
      case 'medium': return 'Середній';
      case 'hard': return 'Складний';
      default: return difficulty;
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSubject = selectedSubject === 'all' || template.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesSubject && matchesDifficulty;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'recent':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, template: Template) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplate(null);
  };

  const handleSaveTemplate = (templateId: number) => {
    setSavedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handlePreviewTemplate = () => {
    setPreviewDialogOpen(true);
    handleMenuClose();
  };

  const handleConfigureTemplate = (template: Template) => {
    setConfigureTemplate(template);
    setTemplateSettings({});
    setConfigureOpen(true);
  };

  const handleSettingChange = (parameter: string, value: string) => {
    setTemplateSettings(prev => ({
      ...prev,
      [parameter]: value
    }));
  };

  const handleGenerateContent = async () => {
    if (!configureTemplate) return;
    
    // Формуємо промпт на основі налаштувань
    const generatePrompt = () => {
      let prompt = `Створи ${configureTemplate.title.toLowerCase()} для дітей ${configureTemplate.ageGroup} років.\n\n`;
      prompt += `Опис: ${configureTemplate.description}\n\n`;
      
      prompt += "Налаштування:\n";
      Object.entries(templateSettings).forEach(([key, value]) => {
        if (value && value.trim()) {
          prompt += `• ${key}: ${value}\n`;
        }
      });
      
      prompt += `\nФормати виводу: ${configureTemplate.outputFormats.join(', ')}\n`;
      prompt += `\nРівень складності: ${getDifficultyLabel(configureTemplate.difficulty)}\n`;
      prompt += `Тривалість: ${configureTemplate.duration}\n`;
      prompt += `Предмет: ${subjects.find(s => s.value === configureTemplate.subject)?.label || configureTemplate.subject}\n\n`;
      
      prompt += "Створи детальний, структурований та інтерактивний навчальний контент, який буде цікавим та корисним для дітей зазначеного віку.";
      
      return prompt;
    };

    const prompt = generatePrompt();
    
    // Зберігаємо промпт в localStorage для передачі на сторінку чату
    localStorage.setItem('chatPrompt', prompt);
    localStorage.setItem('templateContext', JSON.stringify({
      templateTitle: configureTemplate.title,
      templateId: configureTemplate.id,
      settings: templateSettings
    }));
    
    setConfigureOpen(false);
    
    // Перенаправляємо на чат
    window.location.href = '/chat';
  };

  const stats = {
    total: templates.length,
    popular: templates.filter(t => t.isPopular).length,
    new: templates.filter(t => t.isNew).length,
    free: templates.filter(t => t.isFree).length,
    avgRating: (templates.reduce((sum, t) => sum + t.rating, 0) / templates.length).toFixed(1)
  };

  const renderTemplateCard = (template: Template) => {
    const SubjectIcon = getSubjectIcon(template.subject);
    const isSaved = savedTemplates.includes(template.id);
    
    return (
      <Card
        key={template.id}
        onClick={() => handleConfigureTemplate(template)}
        sx={{
          borderRadius: '16px',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: 'white',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'visible',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
            borderColor: alpha(theme.palette.primary.main, 0.2),
          }
        }}
      >
        {/* Badges */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1, display: 'flex', gap: 1 }}>
          {template.isNew && (
            <Chip
              label="НОВИЙ"
              size="small"
              sx={{
                backgroundColor: theme.palette.success.main,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
          )}
          {template.isPopular && (
            <Chip
              label="ПОПУЛЯРНИЙ"
              size="small"
              sx={{
                backgroundColor: theme.palette.warning.main,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
          )}
          {!template.isFree && (
            <Chip
              label="ПРЕМІУМ"
              size="small"
              sx={{
                backgroundColor: theme.palette.error.main,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
          )}
        </Box>

        {/* Save Button */}
        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleSaveTemplate(template.id);
            }}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: 'white',
              }
            }}
          >
            {isSaved ? (
              <BookmarkCheck size={18} color={theme.palette.primary.main} />
            ) : (
              <Bookmark size={18} color={theme.palette.text.secondary} />
            )}
          </IconButton>
        </Box>

        {/* Preview Image */}
        <Box
          sx={{
            height: 120,
            backgroundColor: alpha(getSubjectColor(template.subject), 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            position: 'relative'
          }}
        >
          {template.previewImage}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              borderRadius: '4px',
              px: 1,
              py: 0.5,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <Clock size={12} />
            {template.duration}
          </Box>
        </Box>

        <CardContent sx={{ p: 2 }}>
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  lineHeight: 1.3,
                  pr: 1
                }}
              >
                {template.title}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuOpen(e, template);
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
                mb: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.3,
                fontSize: '0.8rem'
              }}
            >
              {template.description}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
              <Chip
                icon={<SubjectIcon size={12} />}
                label={subjects.find(s => s.value === template.subject)?.label || template.subject}
                size="small"
                sx={{
                  backgroundColor: alpha(getSubjectColor(template.subject), 0.1),
                  color: getSubjectColor(template.subject),
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  height: '22px'
                }}
              />
              <Chip
                label={getDifficultyLabel(template.difficulty)}
                size="small"
                sx={{
                  backgroundColor: alpha(getDifficultyColor(template.difficulty), 0.1),
                  color: getDifficultyColor(template.difficulty),
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  height: '22px'
                }}
              />
              <Chip
                label={template.ageGroup + ' років'}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: '22px' }}
              />
            </Box>

            {/* Parameters Preview */}
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, color: theme.palette.text.secondary, mb: 0.5, display: 'block' }}>
                Налаштування:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3 }}>
                {template.parameters.slice(0, 2).map((param, index) => (
                  <Chip
                    key={index}
                    label={param}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.6rem',
                      height: '18px',
                      '& .MuiChip-label': { px: 0.5 },
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      borderColor: alpha(theme.palette.primary.main, 0.2)
                    }}
                  />
                ))}
                {template.parameters.length > 2 && (
                  <Chip
                    label={`+${template.parameters.length - 2}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.6rem',
                      height: '18px',
                      '& .MuiChip-label': { px: 0.5 },
                      color: theme.palette.text.secondary,
                      borderColor: theme.palette.divider
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ my: 1.5 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <Star size={14} color={theme.palette.warning.main} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                  {template.rating}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <Download size={14} color={theme.palette.text.secondary} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {template.downloads}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <Eye size={14} color={theme.palette.text.secondary} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {template.views}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Play size={18} />}
              onClick={(e) => {
                e.stopPropagation();
                handleConfigureTemplate(template);
              }}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              }}
            >
              Налаштувати
            </Button>
            <Tooltip title="Переглянути">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewTemplate();
                }}
                sx={{
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <Eye size={18} />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', fontSize: '0.7rem' }}>
            Автор: {template.author}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout title="Шаблони" breadcrumbs={[{ label: 'Шаблони' }]}>
      <Box sx={{ width: '100%' }}>
        {/* Stats Overview */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: 'white',
              textAlign: 'center',
              minWidth: 180
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 1 }}>
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Всього шаблонів
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: 'white',
              textAlign: 'center',
              minWidth: 180
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main, mb: 1 }}>
              {stats.popular}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Популярних
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: 'white',
              textAlign: 'center',
              minWidth: 180
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main, mb: 1 }}>
              {stats.free}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Безкоштовних
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: 'white',
              textAlign: 'center',
              minWidth: 180
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main, mb: 1 }}>
              {stats.avgRating}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Середній рейтинг
            </Typography>
          </Paper>
        </Box>

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Пошук шаблонів..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ minWidth: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  )
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Категорія</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Категорія"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{category.label}</span>
                        <Badge badgeContent={category.count} color="primary" />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Предмет</InputLabel>
                <Select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  label="Предмет"
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Складність</InputLabel>
                <Select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  label="Складність"
                >
                  <MenuItem value="all">Всі</MenuItem>
                  <MenuItem value="easy">Легкі</MenuItem>
                  <MenuItem value="medium">Середні</MenuItem>
                  <MenuItem value="hard">Складні</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Сортування</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Сортування"
                >
                  <MenuItem value="popular">Популярні</MenuItem>
                  <MenuItem value="rating">За рейтингом</MenuItem>
                  <MenuItem value="recent">Нові</MenuItem>
                  <MenuItem value="title">За назвою</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Grid view">
                <IconButton
                  onClick={() => setViewMode('grid')}
                  sx={{
                    backgroundColor: viewMode === 'grid' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    color: viewMode === 'grid' ? theme.palette.primary.main : theme.palette.text.secondary,
                  }}
                >
                  <Grid3x3 size={20} />
                </IconButton>
              </Tooltip>
              <Tooltip title="List view">
                <IconButton
                  onClick={() => setViewMode('list')}
                  sx={{
                    backgroundColor: viewMode === 'list' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    color: viewMode === 'list' ? theme.palette.primary.main : theme.palette.text.secondary,
                  }}
                >
                  <List size={20} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* Templates Grid */}
        {sortedTemplates.length > 0 ? (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
              xl: 'repeat(5, 1fr)'
            },
            gap: 2
          }}>
            {sortedTemplates.map((template) => renderTemplateCard(template))}
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: '16px',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: 'white'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>
              Шаблони не знайдено
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Спробуйте змінити фільтри або пошуковий запит
            </Typography>
          </Paper>
        )}

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
          <MenuItem onClick={handlePreviewTemplate}>
            <ListItemIcon>
              <Eye size={18} />
            </ListItemIcon>
            <ListItemText>Переглянути</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedTemplate) {
              handleConfigureTemplate(selectedTemplate);
            }
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Copy size={18} />
            </ListItemIcon>
            <ListItemText>Налаштувати</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Share2 size={18} />
            </ListItemIcon>
            <ListItemText>Поділитися</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedTemplate) {
              handleSaveTemplate(selectedTemplate.id);
            }
            handleMenuClose();
          }}>
            <ListItemIcon>
              {selectedTemplate && savedTemplates.includes(selectedTemplate.id) ? (
                <BookmarkCheck size={18} />
              ) : (
                <Bookmark size={18} />
              )}
            </ListItemIcon>
            <ListItemText>
              {selectedTemplate && savedTemplates.includes(selectedTemplate.id) ? 'Видалити з збережених' : 'Зберегти'}
            </ListItemText>
          </MenuItem>
        </Menu>

        {/* Preview Dialog */}
        <Dialog
          open={previewDialogOpen}
          onClose={() => setPreviewDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '16px' }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Попередній перегляд шаблону</Typography>
              <IconButton onClick={() => setPreviewDialogOpen(false)}>
                <MoreVertical size={20} />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedTemplate && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ 
                  fontSize: '6rem', 
                  mb: 2,
                  backgroundColor: alpha(getSubjectColor(selectedTemplate.subject), 0.1),
                  borderRadius: '16px',
                  py: 4
                }}>
                  {selectedTemplate.previewImage}
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  {selectedTemplate.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {selectedTemplate.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  {selectedTemplate.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setPreviewDialogOpen(false)} sx={{ textTransform: 'none' }}>
              Закрити
            </Button>
            <Button 
              variant="contained"
              startIcon={<Play size={18} />}
              onClick={() => {
                if (selectedTemplate) {
                  setPreviewDialogOpen(false);
                  handleConfigureTemplate(selectedTemplate);
                }
              }}
              sx={{ textTransform: 'none', borderRadius: '8px' }}
            >
              Налаштувати шаблон
            </Button>
          </DialogActions>
        </Dialog>

        {/* Configure Template Dialog */}
        <Dialog
          open={configureOpen}
          onClose={() => setConfigureOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '16px' }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                fontSize: '2.5rem',
                backgroundColor: configureTemplate ? alpha(getSubjectColor(configureTemplate.subject), 0.1) : 'transparent',
                borderRadius: '12px',
                p: 1
              }}>
                {configureTemplate?.previewImage}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Налаштування шаблону
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {configureTemplate?.title}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 2 }}>
            {configureTemplate && (
              <Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {configureTemplate.description}
                </Typography>

                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Параметри налаштування:
                </Typography>

                <Stack spacing={3}>
                  {configureTemplate.parameters.map((parameter, index) => {
                    // Парсинг параметра для визначення типу поля
                    const getFieldType = (param: string) => {
                      const lower = param.toLowerCase();
                      
                      // Checkbox/Switch для boolean значень
                      if (lower.includes('включити') || lower.includes('увімкнути') || 
                          lower.includes('показати') || lower.includes('додати') ||
                          lower.includes('enable') || lower.includes('show') ||
                          param.includes('[так/ні]') || param.includes('[yes/no]')) {
                        return 'switch';
                      }
                      
                      // Number input для числових значень
                      if (lower.includes('кількість') || lower.includes('число') || 
                          lower.includes('розмір') || lower.includes('швидкість') ||
                          lower.includes('hour') || lower.includes('minute') ||
                          param.includes('[1-') || param.includes('(1-') ||
                          lower.includes('count') || lower.includes('size')) {
                        return 'number';
                      }
                      
                      // Range slider для діапазонів
                      if (param.includes('від') && param.includes('до') ||
                          param.includes('from') && param.includes('to') ||
                          lower.includes('рівень') || lower.includes('level')) {
                        return 'range';
                      }
                      
                      // Color picker для кольорів
                      if (lower.includes('колір') || lower.includes('color') ||
                          lower.includes('відтінок') || lower.includes('tone')) {
                        return 'color';
                      }
                      
                      // Date/Time для часу та дат
                      if (lower.includes('дата') || lower.includes('час') || 
                          lower.includes('date') || lower.includes('time')) {
                        return 'datetime';
                      }
                      
                      // Textarea для довгих описів
                      if (lower.includes('опис') || lower.includes('текст') ||
                          lower.includes('зміст') || lower.includes('сценарій') ||
                          lower.includes('description') || lower.includes('content') ||
                          lower.includes('scenario')) {
                        return 'textarea';
                      }
                      
                      // Select для варіантів в дужках
                      if (parameter.includes('(') && parameter.includes('/')) {
                        return 'select';
                      }
                      
                      // За замовчуванням text
                      return 'text';
                    };

                    const cleanParam = parameter.split('(')[0].split('[')[0].trim();
                    const fieldType = getFieldType(parameter);
                    const options = parameter.includes('(') ? 
                      parameter.split('(')[1].replace(')', '').split('/') : [];
                    
                    const renderField = () => {
                      switch (fieldType) {
                        case 'switch':
                          return (
                            <FormControlLabel
                              control={
                                                                 <Switch
                                   checked={templateSettings[cleanParam] === 'true'}
                                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSettingChange(cleanParam, e.target.checked.toString())}
                                   color="primary"
                                 />
                              }
                              label={cleanParam}
                            />
                          );
                        
                        case 'number':
                          return (
                            <TextField
                              type="number"
                              value={templateSettings[cleanParam] || ''}
                              onChange={(e) => handleSettingChange(cleanParam, e.target.value)}
                              label={cleanParam}
                              placeholder="Введіть число"
                              inputProps={{ min: 1, max: 100 }}
                              fullWidth
                            />
                          );
                        
                        case 'range':
                          return (
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {cleanParam}
                              </Typography>
                                                             <Slider
                                 value={parseInt(templateSettings[cleanParam]) || 50}
                                 onChange={(_: Event, value: number | number[]) => handleSettingChange(cleanParam, value.toString())}
                                 valueLabelDisplay="on"
                                 min={1}
                                 max={100}
                                 marks={[
                                   { value: 1, label: '1' },
                                   { value: 50, label: '50' },
                                   { value: 100, label: '100' }
                                 ]}
                               />
                            </Box>
                          );
                        
                        case 'color':
                          return (
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {cleanParam}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <input
                                  type="color"
                                  value={templateSettings[cleanParam] || '#1976d2'}
                                  onChange={(e) => handleSettingChange(cleanParam, e.target.value)}
                                  style={{
                                    width: 60,
                                    height: 40,
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                  }}
                                />
                                <TextField
                                  value={templateSettings[cleanParam] || '#1976d2'}
                                  onChange={(e) => handleSettingChange(cleanParam, e.target.value)}
                                  placeholder="#1976d2"
                                  size="small"
                                  sx={{ flex: 1 }}
                                />
                              </Box>
                            </Box>
                          );
                        
                        case 'datetime':
                          return (
                            <TextField
                              type="datetime-local"
                              value={templateSettings[cleanParam] || ''}
                              onChange={(e) => handleSettingChange(cleanParam, e.target.value)}
                              label={cleanParam}
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                            />
                          );
                        
                        case 'textarea':
                          return (
                            <TextField
                              value={templateSettings[cleanParam] || ''}
                              onChange={(e) => handleSettingChange(cleanParam, e.target.value)}
                              label={cleanParam}
                              placeholder={`Введіть ${cleanParam.toLowerCase()}`}
                              multiline
                              rows={4}
                              fullWidth
                            />
                          );
                        
                        case 'select':
                          return (
                            <FormControl fullWidth>
                              <InputLabel>{cleanParam}</InputLabel>
                              <Select
                                value={templateSettings[cleanParam] || ''}
                                onChange={(e) => handleSettingChange(cleanParam, e.target.value)}
                                label={cleanParam}
                              >
                                {options.map((option) => (
                                  <MenuItem key={option.trim()} value={option.trim()}>
                                    {option.trim()}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          );
                        
                        default: // text
                          return (
                            <TextField
                              value={templateSettings[cleanParam] || ''}
                              onChange={(e) => handleSettingChange(cleanParam, e.target.value)}
                              label={cleanParam}
                              placeholder={`Введіть ${cleanParam.toLowerCase()}`}
                              fullWidth
                            />
                          );
                      }
                    };
                    
                    return (
                      <Box key={index}>
                        {renderField()}
                      </Box>
                    );
                  })}
                  
                  {/* Додаткові коментарі - завжди присутнє поле */}
                  <TextField
                    value={templateSettings['Додаткові коментарі'] || ''}
                    onChange={(e) => handleSettingChange('Додаткові коментарі', e.target.value)}
                    label="Додаткові коментарі"
                    placeholder="Додайте будь-які додаткові побажання або коментарі..."
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Формати виводу:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {configureTemplate.outputFormats.map((format) => (
                    <Chip
                      key={format}
                      label={format}
                      variant="outlined"
                      sx={{ borderRadius: '8px' }}
                    />
                  ))}
                </Box>


              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={() => setConfigureOpen(false)} 
              sx={{ textTransform: 'none' }}
            >
              Скасувати
            </Button>
            <Button 
              variant="contained"
              startIcon={<MessageSquare size={16} />}
              onClick={handleGenerateContent}
              sx={{ 
                textTransform: 'none', 
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
              }}
            >
              Перейти до чату
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Templates; 