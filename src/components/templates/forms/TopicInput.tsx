import React from 'react';
import { 
  Box, 
  Typography, 
  TextField,
  Chip,
  Stack
} from '@mui/material';

interface TopicInputProps {
  value: string;
  onChange: (value: string) => void;
}

const popularTopics = [
  'Тварини', 'Кольори', 'Числа', 'Літери', 'Фігури', 
  'Сім\'я', 'Їжа', 'Транспорт', 'Погода', 'Емоції'
];

const TopicInput: React.FC<TopicInputProps> = ({ value, onChange }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        📚 Тема
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Про що ви хочете розповісти?
      </Typography>
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Введіть тему вашого уроку..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Популярні теми:
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {popularTopics.map((topic) => (
          <Chip
            key={topic}
            label={topic}
            variant={value === topic ? "filled" : "outlined"}
            onClick={() => onChange(topic)}
            sx={{ mb: 1 }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default TopicInput;
