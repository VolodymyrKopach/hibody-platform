import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { getPopularTopicsByAge } from '@/utils/ageTopics';
import AgeGroupSelector from '../forms/AgeGroupSelector';
import TopicInput from '../forms/TopicInput';
import SlideCountSelector from '../forms/SlideCountSelector';
import AdditionalInfoInput from '../forms/AdditionalInfoInput';

interface TemplateData {
  ageGroup: string;
  topic: string;
  slideCount: number;
  additionalInfo: string;
}

interface Step1Props {
  data: TemplateData;
  onChange: (data: TemplateData) => void;
  onNext: () => void;
}

const Step1BasicInfo: React.FC<Step1Props> = ({ data, onChange, onNext }) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const isValid = data.ageGroup && data.topic && data.slideCount > 0;

  const handleFieldChange = (field: keyof TemplateData, value: any) => {
    const updatedData = { ...data, [field]: value };
    
    // If age group changes, clear topic if it's not in the new age group's popular topics
    if (field === 'ageGroup' && data.topic) {
      const newAgeTopics = getPopularTopicsByAge(value);
      if (!newAgeTopics.includes(data.topic)) {
        updatedData.topic = '';
      }
    }
    
    onChange(updatedData);
  };

  return (
    <Card 
      elevation={2}
      sx={{ 
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <CardContent sx={{ p: 6 }}>
        {/* Main Form Content */}
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          
          {/* Step 1: Age Group Selection */}
          <Box sx={{ mb: 5 }}>
            <AgeGroupSelector
              value={data.ageGroup}
              onChange={(value) => handleFieldChange('ageGroup', value)}
            />
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Step 2: Topic */}
          <Box sx={{ mb: 5 }}>
            <TopicInput
              value={data.topic}
              onChange={(value) => handleFieldChange('topic', value)}
              ageGroup={data.ageGroup}
            />
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Step 3: Slide Count */}
          <Box sx={{ mb: 5 }}>
            <SlideCountSelector
              value={data.slideCount}
              onChange={(value) => handleFieldChange('slideCount', value)}
            />
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Step 4: Additional Information */}
          <Box sx={{ mb: 4 }}>
            <AdditionalInfoInput
              value={data.additionalInfo}
              onChange={(value) => handleFieldChange('additionalInfo', value)}
            />
          </Box>

        </Box>

        {/* Action Section */}
        <Box sx={{ 
          mt: 6, 
          pt: 4,
          display: 'flex', 
          justifyContent: 'center',
          borderTop: `1px solid ${theme.palette.divider}`,
          maxWidth: 800,
          mx: 'auto'
        }}>
          <Button
            variant="contained"
            size="large"
            onClick={onNext}
            disabled={!isValid}
            sx={{ 
              px: 8,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 3,
              minWidth: 280,
              boxShadow: theme.shadows[4],
              '&:hover': {
                boxShadow: theme.shadows[8],
                transform: 'translateY(-2px)'
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled
              },
              transition: 'all 0.3s ease'
            }}
          >
            {t('createLesson.nextStep')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Step1BasicInfo;
