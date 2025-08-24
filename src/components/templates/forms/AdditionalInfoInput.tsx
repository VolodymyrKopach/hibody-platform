import React from 'react';
import { 
  Box, 
  Typography, 
  TextField
} from '@mui/material';

interface AdditionalInfoInputProps {
  value: string;
  onChange: (value: string) => void;
}

const AdditionalInfoInput: React.FC<AdditionalInfoInputProps> = ({ value, onChange }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        📝 Додаткова інформація
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Є якісь особливі побажання чи вимоги? (необов'язково)
      </Typography>
      
      <TextField
        fullWidth
        multiline
        rows={3}
        variant="outlined"
        placeholder="Наприклад: включити інтерактивні ігри, використати конкретні приклади, зосередитися на практичних навичках..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Box>
  );
};

export default AdditionalInfoInput;
