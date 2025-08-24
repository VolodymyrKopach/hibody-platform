import React from "react";
import { Box, Stepper, Step, StepLabel, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

interface StepProgressProps {
  currentStep: number;
}

const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  const theme = useTheme();
  const { t } = useTranslation("common");

  const steps = React.useMemo(
    () => [
      { label: t("createLesson.steps.basicInfo") },
      { label: t("createLesson.steps.planReview") },
      { label: t("createLesson.steps.generation") },
    ],
    [t],
  );

  return (
    <Box
      sx={{
        width: "100%",
        mb: 4,
        py: 3,
        px: 4,
        backgroundColor: "background.paper",
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
      }}
    >
      <Stepper
        activeStep={currentStep - 1}
        alternativeLabel
        sx={{
          "& .MuiStepConnector-root": {
            top: 22,
            "& .MuiStepConnector-line": {
              borderColor: theme.palette.divider,
              borderTopWidth: 2,
            },
          },
          "& .MuiStepConnector-active .MuiStepConnector-line": {
            borderColor: theme.palette.primary.main,
          },
          "& .MuiStepConnector-completed .MuiStepConnector-line": {
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              sx={{
                "& .MuiStepLabel-iconContainer": {
                  "& .MuiSvgIcon-root": {
                    fontSize: "2rem",
                    color:
                      currentStep > index
                        ? theme.palette.primary.main
                        : theme.palette.grey[400],
                    "&.Mui-active": {
                      color: theme.palette.primary.main,
                    },
                    "&.Mui-completed": {
                      color: theme.palette.primary.main,
                    },
                  },
                },
              }}
            >
              <Typography
                variant="h6"
                color={currentStep > index ? "primary" : "text.secondary"}
                sx={{
                  fontWeight: currentStep > index ? 600 : 400,
                  mt: 1,
                }}
              >
                {step.label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default StepProgress;
