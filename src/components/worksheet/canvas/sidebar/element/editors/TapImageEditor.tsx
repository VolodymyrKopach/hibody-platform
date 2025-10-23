'use client';

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Delete, Image as ImageIcon } from '@mui/icons-material';
import { ElementEditorProps } from '@/types/element-editors';
import CommonElementProperties from '../shared/CommonElementProperties';
import { TapImageMode } from '@/components/worksheet/canvas/interactive/TapImage/types';

const TapImageEditor: React.FC<ElementEditorProps> = ({
  elementData,
  onUpdate,
  onDuplicate,
  onDelete,
  pageData,
}) => {
  const properties = elementData.properties || {};
  const mode: TapImageMode = properties.mode || 'simple';
  const images = properties.images || [];

  // Add new image
  const handleAddImage = () => {
    const newImages = [
      ...images,
      { id: `img-${Date.now()}`, url: '', label: '' },
    ];
    onUpdate?.({ images: newImages });
  };

  // Update image
  const handleUpdateImage = (index: number, field: 'url' | 'label', value: string) => {
    const newImages = [...images];
    newImages[index][field] = value;
    onUpdate?.({ images: newImages });
  };

  // Delete image
  const handleDeleteImage = (index: number) => {
    const newImages = images.filter((_: any, i: number) => i !== index);
    onUpdate?.({ images: newImages });
  };

  // Mode descriptions
  const getModeDescription = (selectedMode: TapImageMode) => {
    switch (selectedMode) {
      case 'simple':
        return 'Дитина тапає на одну картинку і збирає зірки';
      case 'find':
        return 'Дитина має знайти правильну картинку серед декількох';
      case 'sequence':
        return 'Дитина має тапнути картинки в правильній послідовності';
      case 'memory':
        return 'Дитина має запам\'ятати і знайти картинку';
      default:
        return '';
    }
  };

  return (
    <Stack spacing={2.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        ⚡ Tap Image Properties (3-5 years optimized)
      </Typography>

      {/* Game Mode */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.75, display: 'block' }}>
          🎮 Game Mode
        </Typography>
        <Select
          fullWidth
          size="small"
          value={mode}
          onChange={(e) => onUpdate?.({ mode: e.target.value as TapImageMode })}
          sx={{
            borderRadius: '10px',
            fontSize: '0.875rem',
          }}
        >
          <MenuItem value="simple">Simple Tap 🎯</MenuItem>
          <MenuItem value="find">Find & Tap 🔍</MenuItem>
          <MenuItem value="sequence">Sequence 🔢</MenuItem>
          <MenuItem value="memory">Memory 🧠</MenuItem>
        </Select>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            color: 'text.secondary',
            fontSize: '0.7rem',
            fontStyle: 'italic',
          }}
        >
          {getModeDescription(mode)}
        </Typography>
      </Box>

      <Divider />

      {/* Images */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            🖼️ Images
          </Typography>
          <Button
            size="small"
            startIcon={<Add />}
            onClick={handleAddImage}
            sx={{ fontSize: '0.75rem' }}
          >
            Add Image
          </Button>
        </Box>

        {images.length === 0 ? (
          <Box
            sx={{
              p: 2,
              border: '2px dashed #E5E7EB',
              borderRadius: 2,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <ImageIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
            <Typography variant="caption">No images added yet</Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {images.map((image: any, index: number) => (
              <Box
                key={image.id}
                sx={{
                  p: 1.5,
                  border: '1px solid #E5E7EB',
                  borderRadius: 2,
                  background: '#F9FAFB',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip
                    label={`#${index + 1}`}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteImage(index)}
                    sx={{ color: 'error.main' }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Image URL"
                  value={image.url}
                  onChange={(e) => handleUpdateImage(index, 'url', e.target.value)}
                  sx={{
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Label"
                  value={image.label}
                  onChange={(e) => handleUpdateImage(index, 'label', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                    },
                  }}
                />

                {image.url && (
                  <Box
                    component="img"
                    src={image.url}
                    alt={image.label}
                    sx={{
                      width: '100%',
                      maxHeight: 100,
                      objectFit: 'contain',
                      borderRadius: 1,
                      mt: 1,
                      border: '1px solid #E5E7EB',
                    }}
                  />
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <Divider />

      {/* Mode-specific settings */}
      {mode === 'simple' && (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.75, display: 'block' }}>
            ⭐ Target Stars
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            placeholder="5"
            value={properties.targetCount || 5}
            onChange={(e) => onUpdate?.({ targetCount: parseInt(e.target.value) || 5 })}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>
      )}

      {mode === 'find' && (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.75, display: 'block' }}>
            ✅ Correct Answer (Image ID)
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g., img-1234567890"
            value={properties.correctAnswer || ''}
            onChange={(e) => onUpdate?.({ correctAnswer: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                fontSize: '0.875rem',
              },
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mt: 0.5 }}>
            Use the ID from the images above
          </Typography>
        </Box>
      )}

      {mode === 'sequence' && (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.75, display: 'block' }}>
            🔢 Sequence (Image IDs, comma separated)
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="img-1,img-2,img-3"
            value={properties.sequence?.join(',') || ''}
            onChange={(e) => onUpdate?.({ sequence: e.target.value.split(',').map((s: string) => s.trim()) })}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
          }}
        />
      </Box>
      )}

      {mode === 'memory' && (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.75, display: 'block' }}>
            ⏱️ Memory Time (seconds)
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            placeholder="3"
            value={(properties.memoryTime || 3000) / 1000}
            onChange={(e) => onUpdate?.({ memoryTime: parseInt(e.target.value) * 1000 || 3000 })}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>
      )}

      <Divider />

      {/* Prompt */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.75, display: 'block' }}>
          💬 Prompt / Instruction
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Find the dog!"
          value={properties.prompt || ''}
          onChange={(e) => onUpdate?.({ prompt: e.target.value })}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
          }}
        />
      </Box>

      <Divider />

      {/* Display Options */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
          🎨 Display Options
        </Typography>
        <Stack spacing={1}>
          <FormControlLabel
            control={
              <Switch
                checked={properties.showProgress !== false}
                onChange={(e) => onUpdate?.({ showProgress: e.target.checked })}
                size="small"
              />
            }
            label={<Typography variant="caption">Show Progress Bar</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                checked={properties.showStars !== false}
                onChange={(e) => onUpdate?.({ showStars: e.target.checked })}
                size="small"
              />
            }
            label={<Typography variant="caption">Show Stars</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                checked={properties.showMascot !== false}
                onChange={(e) => onUpdate?.({ showMascot: e.target.checked })}
                size="small"
              />
            }
            label={<Typography variant="caption">Show Mascot Helper</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                checked={properties.showHints !== false}
                onChange={(e) => onUpdate?.({ showHints: e.target.checked })}
                size="small"
              />
            }
            label={<Typography variant="caption">Show Hints</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                checked={properties.showTutorial !== false}
                onChange={(e) => onUpdate?.({ showTutorial: e.target.checked })}
                size="small"
              />
            }
            label={<Typography variant="caption">Show Tutorial (First Time)</Typography>}
          />
        </Stack>
      </Box>

      <Divider />

      {/* Voice Options */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
          🔊 Voice Guidance (Text-to-Speech)
        </Typography>
        <Stack spacing={1}>
          <FormControlLabel
            control={
              <Switch
                checked={properties.enableVoice === true}
                onChange={(e) => onUpdate?.({ enableVoice: e.target.checked })}
                size="small"
              />
            }
            label={<Typography variant="caption">Enable Voice (Default OFF)</Typography>}
          />
          
          {properties.enableVoice === true && (
            <>
              <FormControlLabel
                control={
                  <Switch
                    checked={properties.speakPrompt === true || properties.speakPrompt === undefined}
                    onChange={(e) => onUpdate?.({ speakPrompt: e.target.checked })}
                    size="small"
                  />
                }
                label={<Typography variant="caption">Speak Prompt/Instructions</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={properties.speakFeedback === true || properties.speakFeedback === undefined}
                    onChange={(e) => onUpdate?.({ speakFeedback: e.target.checked })}
                    size="small"
                  />
                }
                label={<Typography variant="caption">Speak Feedback Messages</Typography>}
              />
              
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.75, display: 'block' }}>
                  🌍 Voice Language
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={properties.voiceLanguage || 'uk-UA'}
                  onChange={(e) => onUpdate?.({ voiceLanguage: e.target.value })}
                  sx={{
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                  }}
                >
                  <MenuItem value="uk-UA">🇺🇦 Українська</MenuItem>
                  <MenuItem value="en-US">🇺🇸 English</MenuItem>
                  <MenuItem value="ru-RU">🇷🇺 Русский</MenuItem>
                </Select>
              </Box>
            </>
          )}
        </Stack>
      </Box>

      <Divider />

      {/* Size */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.75, display: 'block' }}>
          📏 Size
        </Typography>
        <Select
          fullWidth
          size="small"
          value={properties.size || 'large'}
          onChange={(e) => onUpdate?.({ size: e.target.value })}
          sx={{
            borderRadius: '10px',
            fontSize: '0.875rem',
          }}
        >
          <MenuItem value="small">Small</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="large">Large (Recommended for 3-5)</MenuItem>
        </Select>
      </Box>

      <Divider />

      {/* Common Properties */}
      <CommonElementProperties
        elementData={elementData}
        onUpdate={onUpdate}
        onDuplicate={onDuplicate ? () => onDuplicate(pageData?.id, elementData.id) : undefined}
        onDelete={onDelete ? () => onDelete(pageData?.id, elementData.id) : undefined}
      />
    </Stack>
  );
};

export default TapImageEditor;

