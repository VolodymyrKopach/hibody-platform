'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  Stack,
} from '@mui/material';
import {
  Sparkles,
  MousePointer,
  Target,
  Palette,
  Hash,
  Brain,
  Layers,
  Move,
  Trophy,
  Music,
  Puzzle,
  Shuffle,
  Timer,
  Mic,
  Lightbulb,
  Shapes,
  Heart,
  Volume2,
} from 'lucide-react';

// Import interactive components
import TapImage from '@/components/worksheet/canvas/interactive/TapImage';
import SimpleDragAndDrop from '@/components/worksheet/canvas/interactive/SimpleDragAndDrop';
import ColorMatcher from '@/components/worksheet/canvas/interactive/ColorMatcher';
import SimpleCounter from '@/components/worksheet/canvas/interactive/SimpleCounter';
import MemoryCards from '@/components/worksheet/canvas/interactive/MemoryCards';
import SortingGame from '@/components/worksheet/canvas/interactive/SortingGame';
import SequenceBuilder from '@/components/worksheet/canvas/interactive/SequenceBuilder';
import ShapeTracer from '@/components/worksheet/canvas/interactive/ShapeTracer';
import EmotionRecognizer from '@/components/worksheet/canvas/interactive/EmotionRecognizer';
import SoundMatcher from '@/components/worksheet/canvas/interactive/SoundMatcher';
import SimplePuzzle from '@/components/worksheet/canvas/interactive/SimplePuzzle';
import PatternBuilder from '@/components/worksheet/canvas/interactive/PatternBuilder';
import Flashcards from '@/components/worksheet/canvas/interactive/Flashcards';
import WordBuilder from '@/components/worksheet/canvas/interactive/WordBuilder';
import DrawingCanvas from '@/components/worksheet/canvas/interactive/DrawingCanvas';

interface ComponentDemo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: 'interactive' | 'standard';
  ageGroups: string[];
  component: React.ReactNode;
}

const TestComponentsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAge, setSelectedAge] = useState<string>('all');

  const componentDemos: ComponentDemo[] = [
    // ==================== 3-5 РОКІВ ====================
    {
      id: 'tap-image-toddler',
      name: 'Tap Image (Малюки)',
      description: 'Натискайте на великі яскраві картинки для збору зірок',
      icon: <MousePointer size={24} />,
      type: 'interactive',
      ageGroups: ['3-5'],
      component: (
        <TapImage
          mode="simple"
          images={[
            {
              id: '1',
              url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
              label: 'Кіт',
            },
          ]}
          targetCount={3}
          caption="Натискай на котика! 🐱"
          prompt="Знайди котика!"
          size="large"
          showProgress={true}
          showStars={true}
          showMascot={true}
          enableVoice={false}
          ageStyle="toddler"
          level={1}
        />
      ),
    },
    {
      id: 'tap-image-preschool',
      name: 'Tap Image (Дошкільнята)',
      description: 'Знайдіть правильну картинку серед інших',
      icon: <MousePointer size={24} />,
      type: 'interactive',
      ageGroups: ['6-7'],
      component: (
        <TapImage
          mode="find"
          images={[
            {
              id: 'cat',
              url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300',
              label: 'Кіт',
            },
            {
              id: 'dog',
              url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300',
              label: 'Собака',
            },
          ]}
          correctAnswer="cat"
          prompt="Знайди кота!"
          size="medium"
          showProgress={true}
          showHints={true}
          enableVoice={false}
          ageStyle="preschool"
        />
      ),
    },
    {
      id: 'drag-drop-toddler',
      name: 'Drag & Drop (Малюки) - 🐶 Нагодуй тваринок',
      description: 'Великі яскраві елементи, милі персонажі, крейзі анімації!',
      icon: <Move size={24} />,
      type: 'interactive',
      ageGroups: ['3-5'],
      component: (
        <SimpleDragAndDrop
          items={[
            {
              id: 'bone',
              imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=250',
              correctTarget: 'dog',
              label: 'Кістка',
              emoji: '🦴',
            },
            {
              id: 'fish',
              imageUrl: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=250',
              correctTarget: 'cat',
              label: 'Рибка',
              emoji: '🐟',
            },
            {
              id: 'honey',
              imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784538?w=250',
              correctTarget: 'bear',
              label: 'Мед',
              emoji: '🍯',
            },
          ]}
          targets={[
            {
              id: 'dog',
              label: 'Песик',
              backgroundColor: '#FFE5B4',
              character: '🐶',
              celebrationText: 'Woof! Yummy!',
            },
            {
              id: 'cat',
              label: 'Котик',
              backgroundColor: '#FFE5F1',
              character: '🐱',
              celebrationText: 'Meow! Tasty!',
            },
            {
              id: 'bear',
              label: 'Ведмідь',
              backgroundColor: '#E8DCC4',
              character: '🐻',
              celebrationText: 'Yum yum!',
            },
          ]}
          layout="horizontal"
          difficulty="easy"
          snapDistance={120}
          ageStyle="toddler"
        />
      ),
    },
    {
      id: 'drag-drop-toddler-colors',
      name: 'Drag & Drop (Малюки) - 🌈 Кольорова веселка',
      description: 'Навчання кольорів через гру з веселими хмаринками',
      icon: <Palette size={24} />,
      type: 'interactive',
      ageGroups: ['3-5'],
      component: (
        <SimpleDragAndDrop
          items={[
            {
              id: 'red-heart',
              imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=250',
              correctTarget: 'red-cloud',
              label: 'Червоне',
              emoji: '❤️',
            },
            {
              id: 'yellow-star',
              imageUrl: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=250',
              correctTarget: 'yellow-cloud',
              label: 'Жовте',
              emoji: '⭐',
            },
            {
              id: 'blue-wave',
              imageUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=250',
              correctTarget: 'blue-cloud',
              label: 'Синє',
              emoji: '💙',
            },
          ]}
          targets={[
            {
              id: 'red-cloud',
              label: 'Червона хмаринка',
              backgroundColor: '#FFB3BA',
              character: '☁️',
              celebrationText: 'Red! YES!',
              idleAnimation: 'bounce',
            },
            {
              id: 'yellow-cloud',
              label: 'Жовта хмаринка',
              backgroundColor: '#FFFFBA',
              character: '☁️',
              celebrationText: 'Yellow! WOW!',
              idleAnimation: 'pulse',
            },
            {
              id: 'blue-cloud',
              label: 'Синя хмаринка',
              backgroundColor: '#BAE1FF',
              character: '☁️',
              celebrationText: 'Blue! COOL!',
              idleAnimation: 'wiggle',
            },
          ]}
          layout="horizontal"
          difficulty="easy"
          snapDistance={120}
          ageStyle="toddler"
        />
      ),
    },
    {
      id: 'drag-drop-preschool',
      name: 'Drag & Drop (Дошкільнята)',
      description: 'Сортуйте предмети за категоріями',
      icon: <Move size={24} />,
      type: 'interactive',
      ageGroups: ['6-7'],
      component: (
        <SimpleDragAndDrop
          items={[
            {
              id: 'apple',
              imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200',
              correctTarget: 'fruits',
              label: 'Яблуко',
            },
            {
              id: 'carrot',
              imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200',
              correctTarget: 'vegetables',
              label: 'Морква',
            },
            {
              id: 'banana',
              imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200',
              correctTarget: 'fruits',
              label: 'Банан',
            },
          ]}
          targets={[
            {
              id: 'fruits',
              label: 'Фрукти',
              backgroundColor: '#FFE0B2',
            },
            {
              id: 'vegetables',
              label: 'Овочі',
              backgroundColor: '#C8E6C9',
            },
          ]}
          layout="horizontal"
          difficulty="easy"
          snapDistance={80}
          ageStyle="preschool"
        />
      ),
    },
    {
      id: 'drag-drop-elementary',
      name: 'Drag & Drop (Школярі)',
      description: 'Точне перетягування з меншими елементами',
      icon: <Move size={24} />,
      type: 'interactive',
      ageGroups: ['8-9'],
      component: (
        <SimpleDragAndDrop
          items={[
            {
              id: 'apple',
              imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150',
              correctTarget: 'fruits',
              label: 'Яблуко',
            },
            {
              id: 'carrot',
              imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=150',
              correctTarget: 'vegetables',
              label: 'Морква',
            },
            {
              id: 'banana',
              imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=150',
              correctTarget: 'fruits',
              label: 'Банан',
            },
            {
              id: 'tomato',
              imageUrl: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=150',
              correctTarget: 'vegetables',
              label: 'Помідор',
            },
          ]}
          targets={[
            {
              id: 'fruits',
              label: 'Фрукти',
              backgroundColor: '#FFE0B2',
            },
            {
              id: 'vegetables',
              label: 'Овочі',
              backgroundColor: '#C8E6C9',
            },
          ]}
          layout="horizontal"
          difficulty="medium"
          snapDistance={40}
          ageStyle="elementary"
        />
      ),
    },
    {
      id: 'color-matcher-toddler',
      name: 'Color Matcher (Малюки)',
      description: 'Натискайте на яскраві великі кольори-бульбашки!',
      icon: <Palette size={24} />,
      type: 'interactive',
      ageGroups: ['3-5'],
      component: (
        <ColorMatcher
          colors={[
            { name: 'Червоний ❤️', hex: '#FF6B6B', voicePrompt: 'Red' },
            { name: 'Синій 💙', hex: '#4DABF7', voicePrompt: 'Blue' },
            { name: 'Жовтий ⭐', hex: '#FFD93D', voicePrompt: 'Yellow' },
          ]}
          mode="single"
          showNames={true}
          autoVoice={false}
          theme="rainbow"
          ageStyle="toddler"
        />
      ),
    },
    {
      id: 'color-matcher-preschool',
      name: 'Color Matcher (Дошкільнята)',
      description: 'Знайдіть усі кольори та дізнайтесь їх назви',
      icon: <Palette size={24} />,
      type: 'interactive',
      ageGroups: ['6-7'],
      component: (
        <ColorMatcher
          colors={[
            { name: 'Червоний', hex: '#FF0000', voicePrompt: 'Red' },
            { name: 'Синій', hex: '#0000FF', voicePrompt: 'Blue' },
            { name: 'Жовтий', hex: '#FFD700', voicePrompt: 'Yellow' },
            { name: 'Зелений', hex: '#00FF00', voicePrompt: 'Green' },
            { name: 'Помаранчевий', hex: '#FFA500', voicePrompt: 'Orange' },
          ]}
          mode="multiple"
          showNames={true}
          autoVoice={false}
          theme="rainbow"
        />
      ),
    },
    {
      id: 'counter-toddler',
      name: 'Simple Counter (Малюки)',
      description: 'Порахуйте до 3 - великі стрибаючі картинки з емоджі цифрами!',
      icon: <Hash size={24} />,
      type: 'interactive',
      ageGroups: ['3-5'],
      component: (
        <SimpleCounter
          objects={[
            {
              imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=250',
              count: 2,
            },
            {
              imageUrl: 'https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?w=250',
              count: 3,
            },
          ]}
          voiceEnabled={false}
          celebrationAtEnd={true}
          showProgress={true}
          theme="ocean"
          ageStyle="toddler"
        />
      ),
    },
    {
      id: 'counter-preschool',
      name: 'Simple Counter (Дошкільнята)',
      description: 'Рахуйте до 10 - більше об\'єктів',
      icon: <Hash size={24} />,
      type: 'interactive',
      ageGroups: ['6-7'],
      component: (
        <SimpleCounter
          objects={[
            {
              imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200',
              count: 5,
            },
            {
              imageUrl: 'https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?w=200',
              count: 7,
            },
            {
              imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200',
              count: 10,
            },
          ]}
          voiceEnabled={false}
          celebrationAtEnd={true}
          showProgress={true}
          theme="forest"
        />
      ),
    },
    
    // ==================== 6-7 РОКІВ ====================
    {
      id: 'memory-cards-preschool',
      name: 'Memory Cards (Дошкільнята)',
      description: 'Знайдіть 2 пари - великі картинки',
      icon: <Brain size={24} />,
      type: 'interactive',
      ageGroups: ['6-7'],
      component: (
        <MemoryCards
          pairs={[
            {
              id: 'pair1',
              imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200',
            },
            {
              id: 'pair2',
              imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200',
            },
          ]}
          gridSize="2x2"
          difficulty="easy"
          theme="forest"
        />
      ),
    },
    {
      id: 'sorting-game-preschool',
      name: 'Sorting Game (Дошкільнята)',
      description: 'Сортуйте 4 тварини за 2 категоріями',
      icon: <Layers size={24} />,
      type: 'interactive',
      ageGroups: ['6-7'],
      component: (
        <SortingGame
          items={[
            {
              id: 'cow',
              imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=200',
              category: 'farm',
              label: 'Корова 🐄',
            },
            {
              id: 'lion',
              imageUrl: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=200',
              category: 'wild',
              label: 'Лев 🦁',
            },
            {
              id: 'chicken',
              imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=200',
              category: 'farm',
              label: 'Курка 🐔',
            },
            {
              id: 'elephant',
              imageUrl: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=200',
              category: 'wild',
              label: 'Слон 🐘',
            },
          ]}
          categories={[
            { id: 'wild', name: 'Дикі тварини 🦁', color: '#FF6B6B' },
            { id: 'farm', name: 'Свійські тварини 🐄', color: '#4ECDC4' },
          ]}
          sortBy="type"
          layout="horizontal"
        />
      ),
    },
    {
      id: 'shape-tracer-toddler',
      name: 'Shape Tracer (Малюки)',
      description: 'Обводьте великі прості форми товстими яскравими лініями!',
      icon: <Shapes size={24} />,
      type: 'interactive',
      ageGroups: ['3-5'],
      component: (
        <ShapeTracer
          shapePath="M 50,50 L 150,50 L 150,150 L 50,150 Z"
          shapeName="Квадрат ⬜"
          difficulty="easy"
          ageStyle="toddler"
        />
      ),
    },
    
    {
      id: 'sequence-builder-preschool',
      name: 'Sequence Builder (Дошкільнята)',
      description: 'Розставте 3 картинки у порядку',
      icon: <Shuffle size={24} />,
      type: 'interactive',
      ageGroups: ['6-7'],
      component: (
        <SequenceBuilder
          steps={[
            { id: 'step1', imageUrl: 'https://via.placeholder.com/180/FF6B6B/FFFFFF?text=1', order: 1, label: 'Крок 1' },
            { id: 'step2', imageUrl: 'https://via.placeholder.com/180/4ECDC4/FFFFFF?text=2', order: 2, label: 'Крок 2' },
            { id: 'step3', imageUrl: 'https://via.placeholder.com/180/45B7D1/FFFFFF?text=3', order: 3, label: 'Крок 3' },
          ]}
          showNumbers={true}
          difficulty="easy"
          instruction="Розставте кроки у правильному порядку! 👆"
        />
      ),
    },
    {
      id: 'shape-tracer-preschool',
      name: 'Shape Tracer (Дошкільнята)',
      description: 'Обведіть коло та інші фігури',
      icon: <Shapes size={24} />,
      type: 'interactive',
      ageGroups: ['6-7'],
      component: (
        <ShapeTracer
          shapePath="M 100,50 A 50,50 0 1,1 100,150 A 50,50 0 1,1 100,50 Z"
          shapeName="Коло"
          difficulty="easy"
          strokeWidth={8}
          guideColor="#3B82F6"
          traceColor="#10B981"
        />
      ),
    },
    {
      id: 'emotion-recognizer-preschool',
      name: 'Emotion Recognizer (Дошкільнята)',
      description: 'Розпізнайте 3 основні емоції з підказками',
      icon: <Heart size={24} />,
      type: 'interactive',
      ageGroups: ['6-7'],
      component: (
        <EmotionRecognizer
          emotions={[
            {
              id: 'happy',
              name: 'Щасливий 😊',
              emoji: '😊',
              imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=220',
              description: 'Посміхається та радіє',
            },
            {
              id: 'sad',
              name: 'Сумний 😢',
              emoji: '😢',
              imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=220',
              description: 'Засмучений',
            },
            {
              id: 'surprised',
              name: 'Здивований 😮',
              emoji: '😮',
              imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=220',
              description: 'Дуже здивований',
            },
          ]}
          mode="identify"
          showDescriptions={true}
          voiceEnabled={false}
        />
      ),
    },
    {
      id: 'sound-matcher-toddler',
      name: 'Sound Matcher (Малюки)',
      description: 'Слухайте звуки тварин - великі веселі картинки з анімацією!',
      icon: <Volume2 size={24} />,
      type: 'interactive',
      ageGroups: ['3-5'],
      component: (
        <SoundMatcher
          items={[
            {
              id: 'dog',
              imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=250',
              soundText: 'Woof! Woof! 🐕',
              label: 'Собака 🐕',
            },
            {
              id: 'cat',
              imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=250',
              soundText: 'Meow! Meow! 🐱',
              label: 'Кіт 🐱',
            },
          ]}
          mode="identify"
          autoPlayFirst={false}
          ageStyle="toddler"
        />
      ),
    },
    {
      id: 'sound-matcher-preschool',
      name: 'Sound Matcher (Дошкільнята)',
      description: 'Знайдіть звуки 3 різних тварин',
      icon: <Volume2 size={24} />,
      type: 'interactive',
      ageGroups: ['6-7'],
      component: (
        <SoundMatcher
          items={[
            {
              id: 'dog',
              imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200',
              soundText: 'Woof! Woof!',
              label: 'Собака',
            },
            {
              id: 'cat',
              imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200',
              soundText: 'Meow! Meow!',
              label: 'Кіт',
            },
            {
              id: 'bird',
              imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200',
              soundText: 'Tweet! Tweet!',
              label: 'Птах',
            },
          ]}
          mode="identify"
          autoPlayFirst={false}
        />
      ),
    },
    {
      id: 'puzzle-preschool',
      name: 'Simple Puzzle (Дошкільнята)',
      description: 'Пазл з 2 великих частин',
      icon: <Puzzle size={24} />,
      type: 'interactive',
      ageGroups: ['6-7'],
      component: (
        <SimplePuzzle
          imageUrl="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600"
          pieces={2}
          showOutline={true}
          difficulty="easy"
        />
      ),
    },
    {
      id: 'word-builder-preschool',
      name: 'Word Builder (Дошкільнята)',
      description: 'Складіть просте слово з 3 літер',
      icon: <Lightbulb size={24} />,
      type: 'interactive',
      ageGroups: ['6-7'],
      component: (
        <WordBuilder
          targetWord="CAT"
          showHints={true}
          mode="buttons"
          imageHint="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300"
        />
      ),
    },
    {
      id: 'drawing-canvas-toddler',
      name: 'Drawing Canvas (Малюки)',
      description: 'Малюйте пальцями великими яскравими кольорами!',
      icon: <Palette size={24} />,
      type: 'interactive',
      ageGroups: ['3-5'],
      component: (
        <DrawingCanvas
          canvasSize="large"
          tools={['brush']}
          ageStyle="toddler"
        />
      ),
    },
    {
      id: 'drawing-canvas-preschool',
      name: 'Drawing Canvas (Дошкільнята)',
      description: 'Малюйте з гумкою та кольорами',
      icon: <Palette size={24} />,
      type: 'interactive',
      ageGroups: ['6-7'],
      component: (
        <DrawingCanvas
          canvasSize="medium"
          tools={['brush', 'eraser']}
          colorPalette={['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#FFA500', '#800080']}
          brushSizes={[5, 10, 15]}
        />
      ),
    },
    
    // ==================== 8-9 РОКІВ ====================
    {
      id: 'memory-cards-elementary',
      name: 'Memory Cards (Школярі)',
      description: 'Знайдіть 3 пари - середні картинки',
      icon: <Brain size={24} />,
      type: 'interactive',
      ageGroups: ['8-9'],
      component: (
        <MemoryCards
          pairs={[
            {
              id: 'pair1',
              imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=180',
            },
            {
              id: 'pair2',
              imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=180',
            },
            {
              id: 'pair3',
              imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=180',
            },
          ]}
          gridSize="2x3"
          difficulty="medium"
          theme="ocean"
        />
      ),
    },
    {
      id: 'sorting-game-elementary',
      name: 'Sorting Game (Школярі)',
      description: 'Сортуйте 6 предметів за 3 категоріями',
      icon: <Layers size={24} />,
      type: 'interactive',
      ageGroups: ['8-9'],
      component: (
        <SortingGame
          items={[
            {
              id: 'tiger',
              imageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=150',
              category: 'wild',
              label: 'Тигр',
            },
            {
              id: 'cow',
              imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=150',
              category: 'farm',
              label: 'Корова',
            },
            {
              id: 'parrot',
              imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=150',
              category: 'pets',
              label: 'Папуга',
            },
            {
              id: 'lion',
              imageUrl: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=150',
              category: 'wild',
              label: 'Лев',
            },
            {
              id: 'chicken',
              imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=150',
              category: 'farm',
              label: 'Курка',
            },
            {
              id: 'hamster',
              imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=150',
              category: 'pets',
              label: 'Хом\'як',
            },
          ]}
          categories={[
            { id: 'wild', name: 'Дикі', color: '#FF6B6B' },
            { id: 'farm', name: 'Ферма', color: '#4ECDC4' },
            { id: 'pets', name: 'Домашні', color: '#95E1D3' },
          ]}
          sortBy="type"
          layout="horizontal"
        />
      ),
    },
    {
      id: 'sequence-builder-elementary',
      name: 'Sequence Builder (Школярі)',
      description: 'Розставте 4 кроки у правильному порядку',
      icon: <Shuffle size={24} />,
      type: 'interactive',
      ageGroups: ['8-9'],
      component: (
        <SequenceBuilder
          steps={[
            { id: 'step1', imageUrl: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=1', order: 1, label: 'Крок 1' },
            { id: 'step2', imageUrl: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=2', order: 2, label: 'Крок 2' },
            { id: 'step3', imageUrl: 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=3', order: 3, label: 'Крок 3' },
            { id: 'step4', imageUrl: 'https://via.placeholder.com/150/96CEB4/FFFFFF?text=4', order: 4, label: 'Крок 4' },
          ]}
          showNumbers={false}
          difficulty="medium"
          instruction="Розставте кроки у правильному порядку"
        />
      ),
    },
    {
      id: 'puzzle-elementary',
      name: 'Simple Puzzle (Школярі)',
      description: 'Пазл з 4 частин',
      icon: <Puzzle size={24} />,
      type: 'interactive',
      ageGroups: ['8-9'],
      component: (
        <SimplePuzzle
          imageUrl="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600"
          pieces={4}
          showOutline={false}
          difficulty="medium"
        />
      ),
    },
    {
      id: 'word-builder-elementary',
      name: 'Word Builder (Школярі)',
      description: 'Складіть слово з 5-6 літер',
      icon: <Lightbulb size={24} />,
      type: 'interactive',
      ageGroups: ['8-9'],
      component: (
        <WordBuilder
          targetWord="HOUSE"
          showHints={false}
          mode="buttons"
          imageHint="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=300"
        />
      ),
    },
    {
      id: 'emotion-recognizer-elementary',
      name: 'Emotion Recognizer (Школярі)',
      description: 'Розпізнайте 4 емоції',
      icon: <Heart size={24} />,
      type: 'interactive',
      ageGroups: ['8-9'],
      component: (
        <EmotionRecognizer
          emotions={[
            {
              id: 'happy',
              name: 'Щасливий',
              emoji: '😊',
              imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=180',
              description: 'Радість',
            },
            {
              id: 'sad',
              name: 'Сумний',
              emoji: '😢',
              imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=180',
              description: 'Сум',
            },
            {
              id: 'angry',
              name: 'Сердитий',
              emoji: '😠',
              imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=180',
              description: 'Злість',
            },
            {
              id: 'surprised',
              name: 'Здивований',
              emoji: '😮',
              imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=180',
              description: 'Здивування',
            },
          ]}
          mode="identify"
          showDescriptions={false}
          voiceEnabled={false}
        />
      ),
    },
    {
      id: 'sound-matcher-elementary',
      name: 'Sound Matcher (Школярі)',
      description: 'Підберіть звуки - без підказок',
      icon: <Volume2 size={24} />,
      type: 'interactive',
      ageGroups: ['8-9'],
      component: (
        <SoundMatcher
          items={[
            {
              id: 'dog',
              imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150',
              soundText: 'Woof!',
              label: 'Собака',
            },
            {
              id: 'cat',
              imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=150',
              soundText: 'Meow!',
              label: 'Кіт',
            },
            {
              id: 'bird',
              imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=150',
              soundText: 'Tweet!',
              label: 'Птах',
            },
            {
              id: 'cow',
              imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=150',
              soundText: 'Moo!',
              label: 'Корова',
            },
          ]}
          mode="identify"
          autoPlayFirst={false}
        />
      ),
    },
    {
      id: 'drawing-canvas-elementary',
      name: 'Drawing Canvas (Школярі)',
      description: 'Малюйте з різними інструментами',
      icon: <Palette size={24} />,
      type: 'interactive',
      ageGroups: ['8-9'],
      component: (
        <DrawingCanvas
          canvasSize="medium"
          tools={['brush', 'eraser']}
          colorPalette={['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#FFA500', '#800080', '#FFFFFF', '#808080']}
          brushSizes={[2, 5, 10, 15]}
        />
      ),
    },
    
    // ==================== 10-13 РОКІВ ====================
    {
      id: 'memory-cards-middle',
      name: 'Memory Cards (Підлітки)',
      description: 'Знайдіть 4-5 пар з таймером',
      icon: <Brain size={24} />,
      type: 'interactive',
      ageGroups: ['10-13'],
      component: (
        <MemoryCards
          pairs={[
            {
              id: 'pair1',
              imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=150',
            },
            {
              id: 'pair2',
              imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150',
            },
            {
              id: 'pair3',
              imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=150',
            },
            {
              id: 'pair4',
              imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150',
            },
          ]}
          gridSize="3x3"
          difficulty="hard"
          theme="minimal"
        />
      ),
    },
    {
      id: 'sequence-builder-middle',
      name: 'Sequence Builder (Підлітки)',
      description: 'Розставте 5-6 кроків без номерів',
      icon: <Shuffle size={24} />,
      type: 'interactive',
      ageGroups: ['10-13'],
      component: (
        <SequenceBuilder
          steps={[
            { id: 'step1', imageUrl: 'https://via.placeholder.com/120/FF6B6B/FFFFFF?text=1', order: 1, label: 'Крок 1' },
            { id: 'step2', imageUrl: 'https://via.placeholder.com/120/4ECDC4/FFFFFF?text=2', order: 2, label: 'Крок 2' },
            { id: 'step3', imageUrl: 'https://via.placeholder.com/120/45B7D1/FFFFFF?text=3', order: 3, label: 'Крок 3' },
            { id: 'step4', imageUrl: 'https://via.placeholder.com/120/96CEB4/FFFFFF?text=4', order: 4, label: 'Крок 4' },
            { id: 'step5', imageUrl: 'https://via.placeholder.com/120/F38181/FFFFFF?text=5', order: 5, label: 'Крок 5' },
          ]}
          showNumbers={false}
          difficulty="medium"
          instruction="Розставте кроки у правильному порядку"
        />
      ),
    },
    {
      id: 'pattern-builder-middle',
      name: 'Pattern Builder (Підлітки)',
      description: 'Складні візерунки з 3 повтореннями',
      icon: <Sparkles size={24} />,
      type: 'interactive',
      ageGroups: ['10-13'],
      component: (
        <PatternBuilder
          pattern={[
            { id: 'red-circle', shape: 'circle', color: '#FF0000' },
            { id: 'blue-square', shape: 'square', color: '#0000FF' },
            { id: 'green-triangle', shape: 'triangle', color: '#00FF00' },
          ]}
          patternType="shape"
          difficulty="medium"
          repetitions={3}
        />
      ),
    },
    {
      id: 'flashcards-middle',
      name: 'Flashcards (Підлітки)',
      description: 'Картки для вивчення - 5-8 карток',
      icon: <Layers size={24} />,
      type: 'interactive',
      ageGroups: ['10-13'],
      component: (
        <Flashcards
          cards={[
            {
              front: { text: 'Cat', imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=180' },
              back: { text: 'Кіт' },
            },
            {
              front: { text: 'Dog', imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=180' },
              back: { text: 'Собака' },
            },
            {
              front: { text: 'Bird', imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=180' },
              back: { text: 'Птах' },
            },
            {
              front: { text: 'Fish', imageUrl: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=180' },
              back: { text: 'Риба' },
            },
            {
              front: { text: 'Mouse', imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=180' },
              back: { text: 'Миша' },
            },
          ]}
          cardSize="small"
          showNavigation={true}
          flipDirection="horizontal"
        />
      ),
    },
  ];

  const componentTypes = [
    { id: 'all', label: 'Всі типи', icon: <Layers size={20} /> },
    { id: 'interactive', label: 'Інтерактивні', icon: <Sparkles size={20} /> },
    { id: 'standard', label: 'Звичайні', icon: <Target size={20} /> },
  ];

  const ageGroups = [
    { id: 'all', label: 'Всі вікові групи', icon: <Heart size={20} /> },
    { id: '3-5', label: '3-5 років', icon: <Heart size={20} /> },
    { id: '6-7', label: '6-7 років', icon: <Brain size={20} /> },
    { id: '8-9', label: '8-9 років', icon: <Brain size={20} /> },
    { id: '10-13', label: '10-13 років', icon: <Brain size={20} /> },
    { id: '14-18', label: '14-18 років', icon: <Brain size={20} /> },
  ];

  // Filter by type and age
  const filteredDemos = componentDemos.filter((demo) => {
    const typeMatch = selectedType === 'all' || demo.type === selectedType;
    const ageMatch = selectedAge === 'all' || demo.ageGroups.includes(selectedAge);
    return typeMatch && ageMatch;
  });

  // Group filtered components by age
  const groupedByAge = ageGroups
    .filter((ag) => ag.id !== 'all')
    .map((ageGroup) => ({
      ageGroup: ageGroup.label,
      ageGroupId: ageGroup.id,
      components: filteredDemos.filter((demo) => demo.ageGroups.includes(ageGroup.id)),
    }))
    .filter((group) => group.components.length > 0);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Sparkles size={40} color="#667eea" />
            <Typography variant="h3" fontWeight="bold" color="primary">
              Галерея Інтерактивних Компонентів
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Тестова сторінка для перегляду всіх доступних інтерактивних компонентів
            системи. Оберіть категорію та переглядайте компоненти перед інтеграцією у
            worksheet.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Chip
              label={`${componentDemos.length} компонентів`}
              color="primary"
              icon={<Layers size={16} />}
            />
            <Chip 
              label={`${componentDemos.filter(d => d.type === 'interactive').length} інтерактивних`} 
              color="secondary" 
              icon={<Sparkles size={16} />} 
            />
            <Chip label="5 вікових груп" color="success" icon={<Heart size={16} />} />
          </Stack>
        </Paper>

        {/* Type Filter */}
        <Paper elevation={2} sx={{ mb: 2, borderRadius: 2 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Тип компонентів
            </Typography>
            <Tabs
              value={selectedType}
              onChange={(e, newValue) => setSelectedType(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 56,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                },
              }}
            >
              {componentTypes.map((type) => (
                <Tab
                  key={type.id}
                  value={type.id}
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      {type.icon}
                      <span>{type.label}</span>
                    </Stack>
                  }
                />
              ))}
            </Tabs>
          </Box>
        </Paper>

        {/* Age Group Filter */}
        <Paper elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Вікова група
            </Typography>
            <Tabs
              value={selectedAge}
              onChange={(e, newValue) => setSelectedAge(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 56,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                },
              }}
            >
              {ageGroups.map((age) => (
                <Tab
                  key={age.id}
                  value={age.id}
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      {age.icon}
                      <span>{age.label}</span>
                    </Stack>
                  }
                />
              ))}
            </Tabs>
          </Box>
        </Paper>

        {/* Components Grouped by Age */}
        {groupedByAge.map((group) => (
          <Box key={group.ageGroupId} sx={{ mb: 6 }}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                {group.ageGroup}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {group.components.length} компонент(ів)
              </Typography>
            </Paper>

            <Stack spacing={3}>
              {group.components.map((demo) => (
                <Card
                  key={demo.id}
                  elevation={3}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent>
                    {/* Header */}
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {demo.icon}
                      </Box>
                      <Box flexGrow={1}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {demo.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {demo.description}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Type Badge */}
                    <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" gap={1}>
                      <Chip
                        label={demo.type === 'interactive' ? 'Інтерактивний' : 'Звичайний'}
                        size="small"
                        color={demo.type === 'interactive' ? 'primary' : 'default'}
                        icon={demo.type === 'interactive' ? <Sparkles size={14} /> : undefined}
                      />
                      {demo.ageGroups.map((age) => (
                        <Chip
                          key={age}
                          label={`${age} років`}
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                      ))}
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    {/* Component Preview */}
                    <Box
                      sx={{
                        minHeight: 300,
                        bgcolor: '#f9fafb',
                        borderRadius: 2,
                        p: 2,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {demo.component}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        ))}

        {/* Empty State */}
        {groupedByAge.length === 0 && (
          <Paper
            elevation={2}
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" color="text.secondary" mb={2}>
              Компоненти не знайдено
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Спробуйте вибрати інший тип або вікову групу
            </Typography>
          </Paper>
        )}

        {/* Footer */}
        <Paper
          elevation={2}
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 2,
            textAlign: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            💡 Натисніть на будь-який компонент для взаємодії. Після тестування ви
            зможете інтегрувати їх у ваші worksheet.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default TestComponentsPage;

