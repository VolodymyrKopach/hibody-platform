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
  markdown: string | any; // Can be markdown string or JSON object
}

const StructuredLessonPlan: React.FC<StructuredLessonPlanProps> = ({ markdown }) => {
  const theme = useTheme();
  
  // Parse content to structured data (handle both JSON object and markdown string)
  const parsedPlan: ParsedLessonPlan = useMemo(() => {
    try {
      // If it's already a JSON object, process it directly
      if (typeof markdown === 'object' && markdown !== null) {
        console.log('📋 [StructuredLessonPlan] Processing JSON object directly');
        return LessonPlanJSONProcessor.processJSONObject(markdown);
      }
      
      // If it's a string, try to parse as JSON first
      if (typeof markdown === 'string') {
        if (LessonPlanJSONProcessor.validateJSON(markdown)) {
          console.log('📋 [StructuredLessonPlan] Processing JSON string');
          return LessonPlanJSONProcessor.processJSON(markdown);
        } else {
          console.log('📋 [StructuredLessonPlan] Processing markdown string');
          return LessonPlanParser.parse(markdown);
        }
      }
      
      // Fallback
      console.warn('⚠️ [StructuredLessonPlan] Unknown data format, using fallback');
      return LessonPlanParser.parse(String(markdown));
      
    } catch (error) {
      console.error('❌ [StructuredLessonPlan] Error parsing plan:', error);
      // Return minimal fallback structure
      return {
        title: 'Lesson Plan',
        metadata: {
          targetAudience: 'Unknown',
          duration: '30-45 minutes',
          goal: 'Educational lesson'
        },
        objectives: [],
        slides: [],
        gameElements: [],
        materials: [],
        recommendations: [],
        rawMarkdown: String(markdown)
      };
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
