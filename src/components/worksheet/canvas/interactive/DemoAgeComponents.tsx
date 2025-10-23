'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { AgeGroup } from '@/types/age-group-data';
import ComponentSelectorService from '@/services/ComponentSelectorService';
import AgeGroupComponentPicker from '@/components/generation/AgeGroupComponentPicker';
import AgeSpecificRenderer from './AgeSpecificRenderer';

/**
 * Demo component to showcase age-specific drag and drop components
 * This component demonstrates the new age-grouped architecture
 */
const DemoAgeComponents: React.FC = () => {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>('3-5');
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [demoComponent, setDemoComponent] = useState<any>(null);

  const ageGroups: { value: AgeGroup; label: string; color: string }[] = [
    { value: '3-5', label: '🐣 Toddlers (3-5)', color: '#FFE5F1' },
    { value: '6-7', label: '🎨 Preschoolers (6-7)', color: '#F3E7FF' },
    { value: '8-9', label: '📚 Elementary (8-9)', color: '#EFF6FF' },
    { value: '10-13', label: '🎯 Middle School (10-13)', color: '#F9FAFB' },
    { value: '14-18', label: '🎓 Teens (14-18)', color: '#FFFFFF' },
  ];

  const handleComponentSelect = (componentType: string, componentData: any) => {
    setSelectedComponents(prev => [...prev, componentType]);
    
    // Create a demo element for rendering
    setDemoComponent({
      id: `demo-${componentType}-${Date.now()}`,
      type: componentType,
      properties: componentData,
    });
  };

  const handlePreview = (componentType: string) => {
    const templateData = ComponentSelectorService.generateTemplateData(componentType as any, selectedAgeGroup);
    setDemoComponent({
      id: `preview-${componentType}-${Date.now()}`,
      type: componentType,
      properties: templateData,
    });
  };

  const clearDemo = () => {
    setDemoComponent(null);
    setSelectedComponents([]);
  };

  const stats = ComponentSelectorService.getComponentStats();

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={800} gutterBottom>
          🎯 Age-Specific Drag & Drop Components
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Унікальні компоненти з різними механіками взаємодії для кожної вікової групи
        </Typography>
        
        {/* Stats */}
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Chip 
              label={`${stats.totalComponents} Total Components`} 
              color="primary" 
              size="large"
            />
          </Grid>
          <Grid item>
            <Chip 
              label={`5 Age Groups`} 
              color="secondary" 
              size="large"
            />
          </Grid>
          <Grid item>
            <Chip 
              label={`${Math.round(stats.averageEstimatedTime)} min avg`} 
              color="success" 
              size="large"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Age Group Selector */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Select Age Group
        </Typography>
        <Tabs
          value={selectedAgeGroup}
          onChange={(_, newValue) => {
            setSelectedAgeGroup(newValue);
            clearDemo();
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          {ageGroups.map((group) => (
            <Tab
              key={group.value}
              value={group.value}
              label={group.label}
              sx={{
                minWidth: 200,
                textTransform: 'none',
                fontWeight: 600,
                '&.Mui-selected': {
                  backgroundColor: group.color,
                },
              }}
            />
          ))}
        </Tabs>

        {/* Age Group Stats */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <Chip 
            label={`${stats.componentsByAge[selectedAgeGroup] || 0} components available`}
            variant="outlined"
          />
          <Chip 
            label={`${selectedComponents.length} selected`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Component Picker */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Available Components
            </Typography>
            <AgeGroupComponentPicker
              ageGroup={selectedAgeGroup}
              onComponentSelect={handleComponentSelect}
              onPreview={handlePreview}
              selectedComponents={selectedComponents}
              maxComponents={5}
            />
          </Paper>
        </Grid>

        {/* Demo Area */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 600 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" fontWeight={700}>
                Live Demo
              </Typography>
              {demoComponent && (
                <Button variant="outlined" onClick={clearDemo}>
                  Clear Demo
                </Button>
              )}
            </Box>

            {demoComponent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AgeSpecificRenderer
                  element={demoComponent}
                  ageGroup={selectedAgeGroup}
                  isSelected={false}
                  onEdit={(elementId, properties) => {
                    console.log('Demo edit:', elementId, properties);
                  }}
                  onSelect={(elementId) => {
                    console.log('Demo select:', elementId);
                  }}
                />
              </motion.div>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 400,
                  backgroundColor: 'grey.50',
                  borderRadius: 2,
                  border: '2px dashed',
                  borderColor: 'grey.300',
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Select a component to see it in action
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose from the available components on the left
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Architecture Overview */}
      <Paper elevation={2} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          🏗️ Architecture Overview
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  🧩 Modular Design
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Each age group has its own set of components with unique mechanics and visual styles.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  🎨 Age-Appropriate UX
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Components adapt their interaction patterns, visual complexity, and feedback to match cognitive development.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  📊 Smart Selection
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Teachers see only relevant components for their target age group, simplifying lesson creation.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Implementation Status */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Implementation Status
        </Typography>
        
        <Grid container spacing={2}>
          {ageGroups.map((group) => {
            const componentCount = stats.componentsByAge[group.value] || 0;
            const isImplemented = componentCount > 0;
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={group.value}>
                <Card 
                  elevation={1}
                  sx={{
                    backgroundColor: isImplemented ? group.color : 'grey.100',
                    border: '2px solid',
                    borderColor: isImplemented ? 'success.main' : 'grey.300',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {group.label}
                    </Typography>
                    <Chip
                      label={isImplemented ? `${componentCount} components` : 'Coming Soon'}
                      size="small"
                      color={isImplemented ? 'success' : 'default'}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Box>
  );
};

export default DemoAgeComponents;
