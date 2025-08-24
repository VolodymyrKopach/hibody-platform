import React from 'react';
import { 
  Box, 
  Typography, 
  ButtonGroup, 
  Button,
  TextField
} from '@mui/material';

interface SlideCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const presetCounts = [3, 4, 5, 6];

const SlideCountSelector: React.FC<SlideCountSelectorProps> = ({ value, onChange }) => {
  const [customMode, setCustomMode] = React.useState(false);

  React.useEffect(() => {
    setCustomMode(!presetCounts.includes(value));
  }, [value]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        📊 Кількість слайдів
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Скільки слайдів вам потрібно?
      </Typography>
      
      <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
        {presetCounts.map((count) => (
          <Button
            key={count}
            variant={value === count ? "contained" : "outlined"}
            onClick={() => {
              onChange(count);
              setCustomMode(false);
            }}
          >
            {count}
          </Button>
        ))}
        <Button
          variant={customMode ? "contained" : "outlined"}
          onClick={() => setCustomMode(true)}
        >
          Інше
        </Button>
      </ButtonGroup>

      {customMode && (
        <TextField
          type="number"
          label="Власна кількість"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 1)}
          inputProps={{ min: 1, max: 20 }}
          size="small"
        />
      )}
    </Box>
  );
};

export default SlideCountSelector;
