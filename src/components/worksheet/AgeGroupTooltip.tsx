'use client';

import React from 'react';
import { Box, Typography, Chip, Stack, alpha, useTheme, Tooltip, TooltipProps, styled } from '@mui/material';
import { Clock, ListChecks, Target, CheckCircle2 } from 'lucide-react';
import { ageBasedContentService, type Duration } from '@/services/worksheet/AgeBasedContentService';

interface AgeGroupTooltipProps {
  ageGroup: string;
  duration: Duration;
  children: React.ReactElement;
}

// Custom styled tooltip with rich content
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    maxWidth: 350,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    borderRadius: 12,
    padding: 0,
    boxShadow: theme.shadows[8],
  },
}));

/**
 * Tooltip component that displays detailed age-appropriate content information
 */
const AgeGroupTooltip: React.FC<AgeGroupTooltipProps> = ({ ageGroup, duration, children }) => {
  const theme = useTheme();
  
  // Get age configuration
  const config = ageBasedContentService.getConfig(ageGroup);
  const contentAmount = ageBasedContentService.calculateComponentCount(ageGroup, duration);
  
  if (!config) {
    return children;
  }

  const timePerComponent = Math.round(1 / config.componentsPerMinute);

  const tooltipContent = (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 0.5 }}>
          {config.label}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Age-Appropriate Content Settings
        </Typography>
      </Box>

      {/* Main Stats */}
      <Stack spacing={1} sx={{ mb: 1.5 }}>
        {/* Components */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ListChecks size={14} color={theme.palette.success.main} />
          <Typography variant="caption" sx={{ fontWeight: 600, flex: 1 }}>
            Components:
          </Typography>
          <Chip
            label={`${contentAmount.targetCount} items`}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 600,
              backgroundColor: alpha(theme.palette.success.main, 0.15),
              color: theme.palette.success.dark,
            }}
          />
        </Box>

        {/* Time per Component */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Clock size={14} color={theme.palette.info.main} />
          <Typography variant="caption" sx={{ fontWeight: 600, flex: 1 }}>
            Time each:
          </Typography>
          <Chip
            label={`~${timePerComponent} min`}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 600,
              backgroundColor: alpha(theme.palette.info.main, 0.15),
              color: theme.palette.info.dark,
            }}
          />
        </Box>

        {/* Attention Span */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Target size={14} color={theme.palette.warning.main} />
          <Typography variant="caption" sx={{ fontWeight: 600, flex: 1 }}>
            Focus span:
          </Typography>
          <Chip
            label={`${config.attentionSpanMinutes} min`}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 600,
              backgroundColor: alpha(theme.palette.warning.main, 0.15),
              color: theme.palette.warning.dark,
            }}
          />
        </Box>
      </Stack>

      {/* Preferred Exercises */}
      {config.preferredExerciseTypes.length > 0 && (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', mb: 0.5, display: 'block' }}>
            Preferred Exercises:
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
            {config.preferredExerciseTypes.slice(0, 4).map((type) => (
              <Chip
                key={type}
                label={type.replace('-', ' ')}
                size="small"
                icon={<CheckCircle2 size={10} />}
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '& .MuiChip-icon': {
                    fontSize: '0.6rem',
                    marginLeft: '4px',
                  },
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Visual Importance */}
      {config.requiresImages && (
        <Box 
          sx={{ 
            pt: 1, 
            borderTop: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '0.65rem',
              color: theme.palette.text.secondary,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            🎨 Images are critical for this age
          </Typography>
        </Box>
      )}

      {/* Bottom hint */}
      <Box sx={{ 
        mt: 1.5, 
        pt: 1, 
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` 
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: '0.65rem',
            color: theme.palette.text.secondary,
            fontStyle: 'italic',
          }}
        >
          {contentAmount.explanation}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <HtmlTooltip
      title={tooltipContent}
      placement="top"
      arrow
      enterDelay={800}
      leaveDelay={0}
      enterNextDelay={800}
      disableInteractive={false}
    >
      {children}
    </HtmlTooltip>
  );
};

export default AgeGroupTooltip;

