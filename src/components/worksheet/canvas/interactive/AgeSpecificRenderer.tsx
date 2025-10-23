'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { CanvasElement } from '@/types/canvas-element';
import { AgeGroup, ComponentType } from '@/types/age-group-data';
import ComponentSelectorService from '@/services/ComponentSelectorService';

// Age-specific component imports
import { MagneticPlayground } from './toddlers';
// Future imports will be added here as we create more components
// import { StoryDragAdventure } from './preschool';
// import { EducationalSorter } from './elementary';
// import { StrategicMatcher } from './middle';
// import { ProfessionalWorkflow } from './teens';

interface AgeSpecificRendererProps {
  element: CanvasElement;
  ageGroup?: AgeGroup;
  isSelected: boolean;
  onEdit: (elementId: string, properties: any) => void;
  onSelect: (elementId: string) => void;
}

/**
 * Renderer for age-specific drag and drop components
 * This component handles the rendering of all age-grouped components
 */
const AgeSpecificRenderer: React.FC<AgeSpecificRendererProps> = ({
  element,
  ageGroup = '8-9', // Default fallback
  isSelected,
  onEdit,
  onSelect,
}) => {
  // Simply try to find the component - no age group validation needed
  const componentDefinition = ComponentSelectorService.findComponentByType(element.type as ComponentType);

  if (!componentDefinition) {
    return (
      <Box sx={{ p: 2, border: '2px dashed red', borderRadius: '8px' }}>
        <Typography sx={{ color: 'red', fontSize: '14px', fontWeight: 600 }}>
          Unknown component: "{element.type}"
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '12px', mt: 1 }}>
          This component type is not registered in the system.
        </Typography>
      </Box>
    );
  }

  // Prepare common props for all age-specific components
  const commonProps = {
    isSelected,
    onEdit: (properties: any) => {
      onEdit(element.id, { ...element.properties, ...properties });
    },
    onFocus: () => onSelect(element.id),
    onComplete: (results: any) => {
      // Handle completion analytics
      console.log('🎉 Component completed:', {
        componentType: element.type,
        ageGroup,
        results,
        timestamp: Date.now(),
      });
    },
  };

  // Render component directly - no warnings needed
  switch (element.type) {
    // ===== TODDLERS (3-5 years) =====
    case 'magnetic-playground':
      return (
        <MagneticPlayground
          data={{
            id: element.id,
            type: 'magnetic-playground',
            title: element.properties.title || 'Magnetic Playground',
            description: element.properties.description || 'Drag items to their homes!',
            magneticStrength: element.properties.magneticStrength || 150,
            animalHelper: element.properties.animalHelper || 'bunny',
            autoComplete: element.properties.autoComplete ?? true,
            celebrationLevel: element.properties.celebrationLevel || 'maximum',
            items: element.properties.items || [
              {
                id: 'fish',
                label: 'Fish',
                imageUrl: '/images/toddler/fish.png',
                correctTarget: 'water',
                size: 'extra-large',
                animations: ['swim'],
                sounds: ['splash.mp3'],
              },
              {
                id: 'bird',
                label: 'Bird',
                imageUrl: '/images/toddler/bird.png',
                correctTarget: 'sky',
                size: 'extra-large',
                animations: ['fly'],
                sounds: ['chirp.mp3'],
              },
            ],
            targets: element.properties.targets || [
              {
                id: 'water',
                label: 'Water',
                imageUrl: '/images/toddler/water.png',
                backgroundColor: '#87CEEB',
                size: 'extra-large',
                magneticZone: 200,
                celebrationAnimation: 'splash',
              },
              {
                id: 'sky',
                label: 'Sky',
                imageUrl: '/images/toddler/sky.png',
                backgroundColor: '#87CEEB',
                size: 'extra-large',
                magneticZone: 200,
                celebrationAnimation: 'fly',
              },
            ],
            settings: element.properties.settings || {},
          }}
          {...commonProps}
        />
      );

    // Other age-specific components will be added here when implemented

    default:
      return (
        <Box sx={{ p: 2, border: '2px dashed red', borderRadius: '8px' }}>
          <Typography sx={{ color: 'red', fontSize: '14px', fontWeight: 600 }}>
            Unknown age-specific component: {element.type}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '12px', mt: 1 }}>
            Age group: {ageGroup}
          </Typography>
        </Box>
      );
  }
};

/**
 * Check if a component type is an age-specific component
 */
export const isAgeSpecificComponent = (componentType: string): boolean => {
  const ageSpecificTypes = [
    // Toddlers
    'magnetic-playground',
    'simple-matching',
    'color-sorter',
    // Preschoolers
    'story-adventure',
    'animal-homes',
    'shape-puzzle',
    // Elementary
    'educational-sorter',
    'math-matcher',
    'science-classifier',
    // Middle School
    'strategic-matcher',
    'logic-puzzle',
    'data-organizer',
    // Teens
    'professional-workflow',
    'research-sorter',
    'analysis-tools',
  ];

  return ageSpecificTypes.includes(componentType);
};

/**
 * Get default properties for age-specific components
 */
export const getAgeSpecificDefaultProperties = (componentType: ComponentType, ageGroup: AgeGroup): any => {
  return ComponentSelectorService.generateTemplateData(componentType, ageGroup);
};

export default AgeSpecificRenderer;
