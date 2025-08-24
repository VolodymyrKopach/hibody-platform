import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  SportsEsports as GameIcon
} from '@mui/icons-material';

interface GameElementsProps {
  gameElements: string[];
}

const GameElements: React.FC<GameElementsProps> = ({ gameElements }) => {
  const theme = useTheme();

  if (gameElements.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {gameElements.map((element, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            backgroundColor: theme.palette.grey[50],
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography sx={{ fontSize: '1.2rem' }}>🎯</Typography>
          <Typography 
            variant="body2"
            sx={{ 
              lineHeight: 1.4,
              color: theme.palette.text.primary
            }}
          >
            {element}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default GameElements;
