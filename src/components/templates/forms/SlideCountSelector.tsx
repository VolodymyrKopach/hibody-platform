import React from 'react';
import { 
  Box, 
  Typography, 
  ButtonGroup, 
  Button,
  TextField
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface SlideCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const presetCounts = [3, 4, 5, 6];

const SlideCountSelector: React.FC<SlideCountSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation('common');
  const [customMode, setCustomMode] = React.useState(false);

  React.useEffect(() => {
    setCustomMode(!presetCounts.includes(value));
  }, [value]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('createLesson.slideCount.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('createLesson.slideCount.description')}
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <ButtonGroup variant="outlined" sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {presetCounts.map((count) => (
            <Button
              key={count}
              variant={value === count ? "contained" : "outlined"}
              onClick={() => {
                onChange(count);
                setCustomMode(false);
              }}
              sx={{ minWidth: 48 }}
            >
              {count}
            </Button>
          ))}
          <Button
            variant={customMode ? "contained" : "outlined"}
            onClick={() => setCustomMode(true)}
            sx={{ minWidth: 60 }}
          >
            {t('createLesson.slideCount.other')}
          </Button>
        </ButtonGroup>
      </Box>

      {customMode && (
        <Box sx={{ mt: 2 }}>
          <TextField
            type="number"
            label={t('createLesson.slideCount.customCount')}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 1)}
            inputProps={{ min: 1, max: 20 }}
            size="small"
            fullWidth
            sx={{ maxWidth: 200 }}
          />
        </Box>
      )}
    </Box>
  );
};

export default SlideCountSelector;
