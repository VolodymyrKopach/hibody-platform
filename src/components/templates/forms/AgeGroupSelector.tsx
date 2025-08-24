import React from "react";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

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
    () => [
      {
        id: "2-3",
        label: t("createLesson.ageGroup.2-3"),
        emoji: "👶",
        color: "#FF6B9D",
        description: t("createLesson.ageGroup.earlyChildhood"),
      },
      {
        id: "4-6",
        label: t("createLesson.ageGroup.4-6"),
        emoji: "🧒",
        color: "#4ECDC4",
        description: t("createLesson.ageGroup.preschool"),
      },
      {
        id: "7-8",
        label: t("createLesson.ageGroup.7-8"),
        emoji: "🎒",
        color: "#45B7D1",
        description: t("createLesson.ageGroup.primarySchool"),
      },
      {
        id: "9-10",
        label: t("createLesson.ageGroup.9-10"),
        emoji: "🎓",
        color: "#96CEB4",
        description: t("createLesson.ageGroup.middleSchool"),
      },
    ],
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
