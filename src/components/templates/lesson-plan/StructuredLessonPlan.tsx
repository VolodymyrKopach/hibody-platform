import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ParsedLessonPlan } from '@/types/templates';
import { LessonPlanParser } from '@/utils/lessonPlanParser';
import { LessonPlanJSONProcessor } from '@/utils/lessonPlanJSONProcessor';
import LessonPlanHeader from './LessonPlanHeader';
import LessonPlanTabs from './LessonPlanTabs';

interface StructuredLessonPlanProps {
  markdown: string;
}

const StructuredLessonPlan: React.FC<StructuredLessonPlanProps> = ({ markdown }) => {
  const theme = useTheme();
  
  // Parse content to structured data (try JSON first, fallback to markdown)
  const parsedPlan: ParsedLessonPlan = useMemo(() => {
    // Try to parse as JSON first
    if (LessonPlanJSONProcessor.validateJSON(markdown)) {
      return LessonPlanJSONProcessor.processJSON(markdown);
    } else {
      return LessonPlanParser.parse(markdown);
    }
  }, [markdown]);

  // Calculate lesson statistics
  const stats = useMemo(() => {
    const slideTypes = parsedPlan.slides.reduce((acc, slide) => {
      acc[slide.type] = (acc[slide.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSlides: parsedPlan.slides.length,
      slideTypes,
      totalObjectives: parsedPlan.objectives.length,
      totalMaterials: parsedPlan.materials.length,
      totalGames: parsedPlan.gameElements.length,
      totalRecommendations: parsedPlan.recommendations.length
    };
  }, [parsedPlan]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Lesson Header */}
      <LessonPlanHeader 
        title={parsedPlan.title}
        metadata={parsedPlan.metadata}
      />



      {/* Tabbed Content */}
      <LessonPlanTabs parsedPlan={parsedPlan} />
    </Box>
  );
};

export default StructuredLessonPlan;
