import React from "react";
import { Box, Stepper, Step, StepLabel, StepButton, Typography } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { LessonCreationStep } from "@/types/templates";

interface StepProgressProps {
  currentStep: number;
  onStepClick?: (step: LessonCreationStep) => void;
  canNavigateToStep?: (step: LessonCreationStep) => boolean;
  completedSteps?: Set<LessonCreationStep>;
}

const StepProgress: React.FC<StepProgressProps> = ({ 
  currentStep, 
  onStepClick, 
  canNavigateToStep, 
  completedSteps 
}) => {
  const theme = useTheme();
  const { t } = useTranslation("common");

  const steps = React.useMemo(
    () => [
      { id: 1 as LessonCreationStep, label: t("createLesson.steps.basicInfo") },
      { id: 2 as LessonCreationStep, label: t("createLesson.steps.planReview") },
      { id: 3 as LessonCreationStep, label: t("createLesson.steps.generation") },
    ],
    [t],
  );

  const handleStepClick = (step: LessonCreationStep, event: React.MouseEvent) => {
    if (canNavigateToStep?.(step) && onStepClick) {
      onStepClick(step);
      // Remove focus after click to prevent stuck hover effect
      (event.target as HTMLElement).blur();
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        mb: 2,
        py: 1.5,
        px: 2,
        backgroundColor: "background.paper",
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
      }}
    >
      <Stepper
        activeStep={currentStep - 1}
        alternativeLabel
        sx={{
          "& .MuiStepConnector-root": {
            top: 18,
            "& .MuiStepConnector-line": {
              borderColor: theme.palette.divider,
              borderTopWidth: 1,
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
        {steps.map((step, index) => {
          const stepNumber = (index + 1) as LessonCreationStep;
          const canNavigate = canNavigateToStep?.(stepNumber) ?? true;
          const isActive = currentStep === stepNumber;
          // Step is completed only if it's in completedSteps AND can navigate to it
          const isCompleted = (completedSteps?.has(stepNumber) || false) && canNavigate;
          const isClickable = canNavigate && onStepClick;

          return (
            <Step key={step.label} completed={isCompleted}>
              {isClickable ? (
                <StepButton
                    onClick={(event) => handleStepClick(stepNumber, event)}
                    disableRipple
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        '& .MuiStepLabel-iconContainer': {
                          transform: 'scale(1.1)',
                        },
                        '& .MuiTypography-root': {
                          transform: 'translateY(-1px)',
                        }
                      },
                      '&:focus': {
                        outline: 'none',
                        transform: 'none',
                        '& .MuiStepLabel-iconContainer': {
                          transform: 'none',
                        },
                        '& .MuiTypography-root': {
                          transform: 'none',
                        }
                      },
                      '&:active': {
                        transform: 'none',
                        '& .MuiStepLabel-iconContainer': {
                          transform: 'none',
                        },
                        '& .MuiTypography-root': {
                          transform: 'none',
                        }
                      },
                    "& .MuiStepLabel-iconContainer": {
                      transition: 'transform 0.2s ease',
                      "& .MuiSvgIcon-root": {
                        fontSize: "1.5rem",
                        transition: 'all 0.2s ease',
                        color: !canNavigate
                          ? `${theme.palette.grey[400]} !important`
                          : isCompleted || isActive
                            ? `${theme.palette.primary.main} !important`
                            : `${theme.palette.text.secondary} !important`,
                        "&.Mui-active": {
                          color: isActive ? `${theme.palette.primary.main} !important` : 'inherit',
                        },
                        "&.Mui-completed": {
                          color: isCompleted && canNavigate ? `${theme.palette.primary.main} !important` : 'inherit',
                        },
                      },
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color={
                      !canNavigate
                        ? "text.disabled"
                        : isCompleted || isActive 
                          ? "primary" 
                          : "text.primary"
                    }
                    sx={{
                      fontWeight: isCompleted || isActive ? 600 : 400,
                      mt: 0.5,
                      fontSize: "0.875rem",
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    {step.label}
                  </Typography>
                  </StepButton>
              ) : (
                <StepLabel
                  sx={{
                    "& .MuiStepLabel-iconContainer": {
                      transition: 'transform 0.2s ease',
                      "& .MuiSvgIcon-root": {
                        fontSize: "1.5rem",
                        transition: 'all 0.2s ease',
                        color: !canNavigate
                          ? `${theme.palette.grey[400]} !important`
                          : isCompleted || isActive
                            ? `${theme.palette.primary.main} !important`
                            : `${theme.palette.grey[400]} !important`,
                        "&.Mui-active": {
                          color: isActive ? `${theme.palette.primary.main} !important` : 'inherit',
                        },
                        "&.Mui-completed": {
                          color: isCompleted && canNavigate ? `${theme.palette.primary.main} !important` : 'inherit',
                        },
                      },
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color={
                      !canNavigate
                        ? "text.disabled"
                        : isCompleted || isActive 
                          ? "primary" 
                          : "text.secondary"
                    }
                    sx={{
                      fontWeight: isCompleted || isActive ? 600 : 400,
                      mt: 0.5,
                      fontSize: "0.875rem",
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    {step.label}
                  </Typography>
                </StepLabel>
              )}
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};

export default StepProgress;
