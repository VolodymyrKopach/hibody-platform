import React from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface MaterialsListProps {
  materials: string[];
}

const MaterialsList: React.FC<MaterialsListProps> = ({ materials }) => {
  const theme = useTheme();

  if (materials.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {materials.map((material, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            p: 1.5,
            backgroundColor: theme.palette.grey[50],
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography sx={{ fontSize: '1rem', mt: 0.2 }}>📦</Typography>
          <Typography 
            variant="body2"
            sx={{ 
              lineHeight: 1.4,
              color: theme.palette.text.primary
            }}
          >
            {material}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default MaterialsList;
