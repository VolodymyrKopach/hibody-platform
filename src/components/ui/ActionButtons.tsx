import React from "react";
import { Button, Stack, ButtonProps } from "@mui/material";
import { Home, RefreshCw, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ActionButtonsProps {
  onTryAgain?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  showTryAgain?: boolean;
  showGoHome?: boolean;
  showGoBack?: boolean;
  direction?: "row" | "column";
  spacing?: number;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onTryAgain,
  onGoHome,
  onGoBack,
  showTryAgain = false,
  showGoHome = false,
  showGoBack = false,
  direction = "row",
  spacing = 2,
  variant = "contained",
  size = "medium",
}) => {
  const { t } = useTranslation("common");

  const handleGoHome = React.useCallback(() => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = "/";
    }
  }, [onGoHome]);

  const handleGoBack = React.useCallback(() => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  }, [onGoBack]);

  return (
    <Stack direction={direction} spacing={spacing} justifyContent="center">
      {showTryAgain && onTryAgain && (
        <Button
          onClick={onTryAgain}
          variant={variant}
          size={size}
          startIcon={<RefreshCw size={20} />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {t("buttons.tryAgain")}
        </Button>
      )}

      {showGoHome && (
        <Button
          onClick={handleGoHome}
          variant={variant === "contained" ? "outlined" : variant}
          size={size}
          startIcon={<Home size={20} />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {t("buttons.goHome")}
        </Button>
      )}

      {showGoBack && (
        <Button
          onClick={handleGoBack}
          variant={variant === "contained" ? "outlined" : variant}
          size={size}
          startIcon={<ArrowLeft size={20} />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {t("buttons.goBack")}
        </Button>
      )}
    </Stack>
  );
};

export default ActionButtons;
