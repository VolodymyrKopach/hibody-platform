import React from "react";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { AGE_GROUPS } from "@/constants";

interface AgeGroupSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const AgeGroupSelector: React.FC<AgeGroupSelectorProps> = ({
  value,
  onChange,
}) => {
  const theme = useTheme();
  const { t } = useTranslation("common");

  const ageGroups = React.useMemo(
    () => AGE_GROUPS.map(group => {
      // Map description to correct translation key
      const descriptionKey = group.description === 'Early Childhood' ? 'earlyChildhood' :
                            group.description === 'Preschool' ? 'preschool' :
                            group.description === 'Primary School' ? 'primarySchool' :
                            group.description === 'Middle School' ? 'middleSchool' :
                            'preschool';
      
      return {
        ...group,
        label: t(`createLesson.ageGroup.${group.id}`),
        description: t(`createLesson.ageGroup.${descriptionKey}`),
      };
    }),
    [t],
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("createLesson.ageGroup.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("createLesson.ageGroup.description")}
      </Typography>

      <Grid container spacing={2}>
        {ageGroups.map((group) => (
          <Grid item xs={6} md={3} key={group.id}>
            <Card
              sx={{
                cursor: "pointer",
                border:
                  value === group.id
                    ? `2px solid ${group.color}`
                    : "2px solid transparent",
                backgroundColor:
                  value === group.id ? `${group.color}15` : "background.paper",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                },
              }}
              onClick={() => onChange(group.id)}
            >
              <CardContent sx={{ textAlign: "center", py: 3 }}>
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
