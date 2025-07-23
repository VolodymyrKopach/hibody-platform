'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stack, Typography } from '@mui/material';
import { slideUtils } from '@/utils/slideUtils';
import { LessonSlide } from '@/types/lesson';

interface QuickCommandsExampleProps {
  currentSlide?: LessonSlide;
  onCommandSelect: (command: string) => void;
}

/**
 * Example of correct usage of quick commands with i18n
 * The language for the buttons is taken from the user interface (i18n.language),
 * not from message language detection
 */
export const QuickCommandsExample: React.FC<QuickCommandsExampleProps> = ({
  currentSlide,
  onCommandSelect
}) => {
  const { i18n } = useTranslation();

  // ✅ Correct: use interface language
  const interfaceLanguage = i18n.language as 'uk' | 'en';
  
  // ✅ Correct: pass language from i18n, do not detect from message
  const quickCommands = slideUtils.generateQuickCommands(currentSlide, interfaceLanguage);

  return (
    <Stack spacing={2}>
      <Typography variant="h6">
        {interfaceLanguage === 'uk' ? 'Швидкі команди' : 'Quick Commands'}
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        {interfaceLanguage === 'uk' 
          ? 'Кнопки залежать від мови інтерфейсу, а Gemini автоматично визначає мову відповіді'
          : 'Buttons depend on interface language, Gemini automatically detects response language'
        }
      </Typography>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {quickCommands.map((command, index) => (
          <Button
            key={index}
            variant="outlined"
            size="small"
            onClick={() => onCommandSelect(command)}
            sx={{ mb: 1 }}
          >
            {command}
          </Button>
        ))}
      </Stack>

      <Typography variant="caption" color="text.secondary">
        {interfaceLanguage === 'uk' 
          ? `Мова інтерфейсу: Українська`
          : `Interface language: English`
        }
      </Typography>
    </Stack>
  );
};

export default QuickCommandsExample; 