import React from 'react';
import { 
  Box, 
  Typography, 
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface AgeGroupSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ageGroups = [
  { id: '2-3', label: '2-3 роки', emoji: '👶', color: '#FF6B9D', description: 'Раннє дитинство' },
  { id: '4-6', label: '4-6 років', emoji: '🧒', color: '#4ECDC4', description: 'Дошкільний вік' },
  { id: '7-8', label: '7-8 років', emoji: '🎒', color: '#45B7D1', description: 'Молодший шкільний' },
  { id: '9-10', label: '9-10 років', emoji: '🎓', color: '#96CEB4', description: 'Середній шкільний' }
];

const AgeGroupSelector: React.FC<AgeGroupSelectorProps> = ({ value, onChange }) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        🎯 Вікова група
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Оберіть цільову вікову групу для вашого уроку
      </Typography>
      
      <Grid container spacing={2}>
        {ageGroups.map((group) => (
          <Grid item xs={6} md={3} key={group.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: value === group.id ? `2px solid ${group.color}` : '2px solid transparent',
                backgroundColor: value === group.id ? `${group.color}15` : 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4]
                }
              }}
              onClick={() => onChange(group.id)}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h3" sx={{ mb: 1 }}>
                  {group.emoji}
                </Typography>
                <Typography variant="h6" color="primary">
                  {group.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {group.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AgeGroupSelector;
