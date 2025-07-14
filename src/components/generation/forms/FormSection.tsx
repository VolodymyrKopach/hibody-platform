// === SOLID: SRP - Single Responsibility Principle ===
// Компонент відповідає тільки за рендеринг розділу форми

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ChevronDown } from 'lucide-react';
import { alpha } from '@mui/material/styles';
import { SectionConfig, FieldConfig } from '../../../types/generation';
import { FormField } from './FormField';

// === SOLID: SRP - Стилізований компонент ===
const SectionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  '& .MuiAccordionSummary-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderRadius: theme.shape.borderRadius,
  }
}));

interface FormSectionProps {
  section: SectionConfig;
  fields: Array<{
    key: string;
    config: FieldConfig;
    value: string | string[] | boolean;
  }>;
  onFieldChange: (fieldKey: string, value: string | string[] | boolean) => void;
  defaultExpanded?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({
  section,
  fields,
  onFieldChange,
  defaultExpanded = false
}) => {
  // Якщо немає полів для цього розділу, не рендеримо його
  if (fields.length === 0) {
    return null;
  }

  return (
    <SectionCard elevation={1}>
      <Accordion defaultExpanded={defaultExpanded}>
        <AccordionSummary expandIcon={<ChevronDown />}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {section.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {section.description}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 3
          }}>
            {fields.map(({ key, config, value }) => (
              <FormField
                key={key}
                fieldKey={key}
                config={config}
                value={value}
                onChange={onFieldChange}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
    </SectionCard>
  );
}; 