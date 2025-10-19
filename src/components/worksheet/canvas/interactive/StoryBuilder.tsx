'use client';

import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Chip, Grid, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, RotateCcw, Download, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface StoryElement {
  id: string;
  type: 'character' | 'setting' | 'item' | 'event';
  name: string;
  imageUrl?: string;
  description: string;
}

interface StoryBuilderProps {
  characters?: StoryElement[];
  settings?: StoryElement[];
  items?: StoryElement[];
  events?: StoryElement[];
  enableAI?: boolean;
  minSelections?: number;
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const StoryBuilder: React.FC<StoryBuilderProps> = ({
  characters = [],
  settings = [],
  items = [],
  events = [],
  enableAI = false,
  minSelections = 3,
  ageGroup,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<StoryElement | null>(null);
  const [selectedSetting, setSelectedSetting] = useState<StoryElement | null>(null);
  const [selectedItems, setSelectedItems] = useState<StoryElement[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<StoryElement[]>([]);
  const [generatedStory, setGeneratedStory] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showStory, setShowStory] = useState(false);

  const totalSelections =
    (selectedCharacter ? 1 : 0) +
    (selectedSetting ? 1 : 0) +
    selectedItems.length +
    selectedEvents.length;

  const canGenerate = totalSelections >= minSelections;

  const handleElementSelect = (
    element: StoryElement,
    type: 'character' | 'setting' | 'item' | 'event'
  ) => {
    triggerHaptic('light');
    soundService.play('tap');

    switch (type) {
      case 'character':
        setSelectedCharacter(element);
        break;
      case 'setting':
        setSelectedSetting(element);
        break;
      case 'item':
        if (selectedItems.find((i) => i.id === element.id)) {
          setSelectedItems(selectedItems.filter((i) => i.id !== element.id));
        } else {
          setSelectedItems([...selectedItems, element]);
        }
        break;
      case 'event':
        if (selectedEvents.find((e) => e.id === element.id)) {
          setSelectedEvents(selectedEvents.filter((e) => e.id !== element.id));
        } else {
          setSelectedEvents([...selectedEvents, element]);
        }
        break;
    }
  };

  const generateStory = () => {
    setIsGenerating(true);
    triggerHaptic('light');

    // Simple template-based story generation
    let story = '';

    if (selectedCharacter && selectedSetting) {
      story += `Once upon a time, there was ${selectedCharacter.name} who lived in ${selectedSetting.name}. `;

      if (selectedItems.length > 0) {
        story += `One day, ${selectedCharacter.name} found ${selectedItems.map((i) => i.name).join(', ')}. `;
      }

      if (selectedEvents.length > 0) {
        story += `Then, something amazing happened: ${selectedEvents.map((e) => e.description).join(', and ')}. `;
      }

      story += `And they all lived happily ever after! The End. 📖`;
    } else {
      story = 'Please select at least a character and a setting to create your story!';
    }

    setTimeout(() => {
      setGeneratedStory(story);
      setShowStory(true);
      setIsGenerating(false);
      soundService.playSuccess();
      triggerHaptic('success');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 1500);
  };

  const handleReset = () => {
    setSelectedCharacter(null);
    setSelectedSetting(null);
    setSelectedItems([]);
    setSelectedEvents([]);
    setGeneratedStory('');
    setShowStory(false);
    triggerHaptic('light');
  };

  const handleDownload = () => {
    const blob = new Blob([generatedStory], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-story-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    soundService.playCorrect();
    triggerHaptic('success');
  };

  const renderElementGrid = (
    elements: StoryElement[],
    type: 'character' | 'setting' | 'item' | 'event',
    selectedElement: StoryElement | StoryElement[] | null
  ) => {
    const isSelected = (element: StoryElement) => {
      if (Array.isArray(selectedElement)) {
        return selectedElement.some((e) => e.id === element.id);
      }
      return selectedElement?.id === element.id;
    };

    return (
      <Grid container spacing={2}>
        {elements.map((element) => (
          <Grid item xs={6} sm={4} md={3} key={element.id}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Paper
                elevation={isSelected(element) ? 8 : 3}
                onClick={() => handleElementSelect(element, type)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: isSelected(element) ? 'primary.main' : 'transparent',
                  backgroundColor: isSelected(element)
                    ? alpha('#667eea', 0.1)
                    : 'white',
                  transition: 'all 0.3s',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                {element.imageUrl && (
                  <Box
                    component="img"
                    src={element.imageUrl}
                    alt={element.name}
                    sx={{
                      width: '100%',
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 2,
                      mb: 1,
                    }}
                  />
                )}

                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                  {element.name}
                </Typography>

                <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                  {element.description}
                </Typography>

                {isSelected(element) && (
                  <Box sx={{ mt: 1 }}>
                    <Chip label="Selected" size="small" color="primary" />
                  </Box>
                )}
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    );
  };

  if (characters.length === 0 && settings.length === 0) {
    return (
      <Box
        onClick={onFocus}
        sx={{
          p: 4,
          textAlign: 'center',
          border: isSelected ? '2px solid' : '2px dashed',
          borderColor: isSelected ? 'primary.main' : 'grey.400',
          borderRadius: 2,
          backgroundColor: 'grey.50',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Add characters and settings to start building stories!
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 700,
        p: 3,
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: 'primary.main',
        borderRadius: 2,
        backgroundColor: 'grey.50',
        cursor: onFocus ? 'pointer' : 'default',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary">
            📚 Story Builder
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Choose elements to create your own story!
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={`${totalSelections}/${minSelections} selected`}
            color={canGenerate ? 'success' : 'default'}
            icon={<BookOpen size={16} />}
          />
          <Button
            variant="outlined"
            onClick={handleReset}
            startIcon={<RotateCcw size={20} />}
          >
            Reset
          </Button>
        </Box>
      </Box>

      {!showStory ? (
        <>
          {/* Characters */}
          {characters.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                👤 Choose a Character
              </Typography>
              {renderElementGrid(characters, 'character', selectedCharacter)}
            </Box>
          )}

          {/* Settings */}
          {settings.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                🏰 Choose a Setting
              </Typography>
              {renderElementGrid(settings, 'setting', selectedSetting)}
            </Box>
          )}

          {/* Items */}
          {items.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                🎁 Add Items (optional)
              </Typography>
              {renderElementGrid(items, 'item', selectedItems)}
            </Box>
          )}

          {/* Events */}
          {events.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                ⚡ Add Events (optional)
              </Typography>
              {renderElementGrid(events, 'event', selectedEvents)}
            </Box>
          )}

          {/* Generate Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={generateStory}
              disabled={!canGenerate || isGenerating}
              startIcon={isGenerating ? <Wand2 size={24} /> : <Sparkles size={24} />}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {isGenerating ? 'Creating Story...' : 'Generate My Story!'}
            </Button>
          </Box>
        </>
      ) : (
        /* Story Display */
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={12}
              sx={{
                p: 6,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #FFF5E1 0%, #FFE4B5 100%)',
                border: '4px solid',
                borderColor: 'primary.main',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1, type: 'spring' }}
                  >
                    <BookOpen size={32} color="#667eea" />
                  </motion.div>
                ))}
              </Box>

              <Typography
                variant="h4"
                fontWeight={800}
                textAlign="center"
                color="primary"
                sx={{ mb: 4 }}
              >
                Your Story
              </Typography>

              <Paper elevation={4} sx={{ p: 4, mb: 4, backgroundColor: 'white' }}>
                <Typography
                  variant="h6"
                  sx={{
                    lineHeight: 2,
                    fontSize: '1.2rem',
                    fontFamily: 'Georgia, serif',
                    textAlign: 'justify',
                  }}
                >
                  {generatedStory}
                </Typography>
              </Paper>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleDownload}
                  startIcon={<Download size={20} />}
                  color="success"
                  size="large"
                >
                  Download Story
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowStory(false)}
                  startIcon={<RotateCcw size={20} />}
                  size="large"
                >
                  Create Another
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </AnimatePresence>
      )}
    </Box>
  );
};

export default StoryBuilder;

