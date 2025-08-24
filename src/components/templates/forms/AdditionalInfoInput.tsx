import React from 'react';
import { 
  Box, 
  Typography, 
  TextField
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface AdditionalInfoInputProps {
  value: string;
  onChange: (value: string) => void;
}

const AdditionalInfoInput: React.FC<AdditionalInfoInputProps> = ({ value, onChange }) => {
  const { t } = useTranslation('common');

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('createLesson.additionalInfo.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('createLesson.additionalInfo.description')}
      </Typography>
      
      <TextField
        fullWidth
        multiline
        rows={3}
        variant="outlined"
        placeholder={t('createLesson.additionalInfo.placeholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Box>
  );
};

export default AdditionalInfoInput;
