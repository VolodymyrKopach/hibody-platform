'use client';

import React from 'react';
import { Box, Typography, Chip, Stack, alpha, useTheme } from '@mui/material';
import { Lightbulb } from 'lucide-react';
import { getTopicSuggestionsWithEmoji, AGE_GROUPS } from '@/utils/ageTopics';

interface TopicSuggestionsProps {
  ageGroup: string;
  onTopicSelect: (topic: string) => void;
  selectedTopic?: string;
}

const TopicSuggestions: React.FC<TopicSuggestionsProps> = ({
  ageGroup,
  onTopicSelect,
  selectedTopic,
}) => {
  const theme = useTheme();

  // Only show for 2-3 and 4-6 years
  if (ageGroup !== AGE_GROUPS.EARLY_CHILDHOOD && ageGroup !== AGE_GROUPS.PRESCHOOL) {
    return null;
  }

  const suggestions = getTopicSuggestionsWithEmoji(ageGroup);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: '16px',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Lightbulb size={20} color={theme.palette.warning.main} />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
          }}
        >
          💡 Popular Topics for this age
        </Typography>
      </Stack>

      <Stack
        direction="row"
        flexWrap="wrap"
        gap={1}
        sx={{
          '& > *': {
            transition: 'all 0.2s',
          },
        }}
      >
        {suggestions.map((suggestion) => (
          <Chip
            key={suggestion.key}
            label={`${suggestion.emoji} ${suggestion.label}`}
            onClick={() => onTopicSelect(suggestion.label)}
            sx={{
              px: 1.5,
              py: 2.5,
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '12px',
              background:
                selectedTopic === suggestion.label
                  ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                  : alpha(theme.palette.grey[400], 0.1),
              color:
                selectedTopic === suggestion.label
                  ? 'white'
                  : theme.palette.text.primary,
              border: 'none',
              cursor: 'pointer',
              '&:hover': {
                background:
                  selectedTopic === suggestion.label
                    ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                    : alpha(theme.palette.primary.main, 0.15),
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
              },
            }}
          />
        ))}
      </Stack>

      <Typography
        variant="caption"
        sx={{
          mt: 2,
          display: 'block',
          color: theme.palette.text.secondary,
          fontStyle: 'italic',
        }}
      >
        Or type your own topic below...
      </Typography>
    </Box>
  );
};

export default TopicSuggestions;

