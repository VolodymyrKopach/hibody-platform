import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Flag as GoalIcon
} from '@mui/icons-material';
import { LessonMetadata } from '@/types/templates';

interface LessonPlanHeaderProps {
  title: string;
  metadata: LessonMetadata;
}

const LessonPlanHeader: React.FC<LessonPlanHeaderProps> = ({ title, metadata }) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 3 }}>
      {/* Main Title */}
      <Typography 
        variant="h4" 
        component="h1"
        sx={{ 
          fontWeight: 700,
          color: theme.palette.primary.main,
          mb: 2,
          textAlign: 'center'
        }}
      >
        {title}
      </Typography>

      {/* Compact Metadata */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 2, 
        flexWrap: 'wrap',
        mb: 2
      }}>
        <Chip 
          icon={<SchoolIcon />}
          label={metadata.targetAudience}
          color="primary"
          variant="outlined"
        />
        <Chip 
          icon={<ScheduleIcon />}
          label={metadata.duration}
          color="secondary"
          variant="outlined"
        />
      </Box>

      {/* Goal - only if not too long */}
      {metadata.goal && metadata.goal.length < 100 && (
        <Typography 
          variant="body2" 
          sx={{ 
            textAlign: 'center',
            color: theme.palette.text.secondary,
            fontStyle: 'italic'
          }}
        >
          {metadata.goal}
        </Typography>
      )}
    </Box>
  );
};

export default LessonPlanHeader;
