import React from "react";
import { Box, Typography, TextField, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { getTopicKeys, getAgeGroupLabel } from "@/utils/ageTopics";

interface TopicInputProps {
  value: string;
  onChange: (value: string) => void;
  ageGroup?: string;
}

const TopicInput: React.FC<TopicInputProps> = ({
  value,
  onChange,
  ageGroup,
}) => {
  const { t } = useTranslation("common");

  const popularTopics = React.useMemo(() => {
    if (!ageGroup) return [];

    const topicKeys = getTopicKeys(ageGroup);
    return topicKeys.map((key) => {
      const translationKey = `createLesson.topics.${ageGroup}.${key}`;
      const fallbackValue = key.charAt(0).toUpperCase() + key.slice(1);
      return t(translationKey, { defaultValue: fallbackValue });
    });
  }, [ageGroup, t]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("createLesson.topic.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("createLesson.topic.description")}
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder={t("createLesson.topic.placeholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {ageGroup
          ? `${t("createLesson.topic.popularFor")} ${getAgeGroupLabel(ageGroup)}:`
          : `${t("createLesson.topic.popular")}`}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          mt: 1,
        }}
      >
        {popularTopics.map((topic) => (
          <Chip
            key={topic}
            label={topic}
            variant={value === topic ? "filled" : "outlined"}
            onClick={() => onChange(topic)}
            sx={{
              cursor: "pointer",
              "&:hover": {
                backgroundColor: value === topic ? undefined : "action.hover",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default TopicInput;
