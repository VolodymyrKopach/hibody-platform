import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Grid
} from '@mui/material';
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
  const isValid = data.ageGroup && data.topic && data.slideCount > 0;

  const handleFieldChange = (field: keyof TemplateData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card elevation={2}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom color="primary">
          📚 Створіть ваш урок
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Почнемо з основ. Оберіть вікову групу, тему та кількість слайдів.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <AgeGroupSelector
              value={data.ageGroup}
              onChange={(value) => handleFieldChange('ageGroup', value)}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <TopicInput
              value={data.topic}
              onChange={(value) => handleFieldChange('topic', value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <SlideCountSelector
              value={data.slideCount}
              onChange={(value) => handleFieldChange('slideCount', value)}
            />
          </Grid>

          <Grid item xs={12}>
            <AdditionalInfoInput
              value={data.additionalInfo}
              onChange={(value) => handleFieldChange('additionalInfo', value)}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={onNext}
            disabled={!isValid}
            sx={{ px: 4 }}
          >
            Наступний крок: Створити план →
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Step1BasicInfo;
