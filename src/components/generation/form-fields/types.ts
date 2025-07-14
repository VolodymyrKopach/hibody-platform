import { FilterConfig } from '@/types/generation';

// === SOLID: ISP - Specific interfaces for different field types ===

export interface BaseFieldProps {
  config: FilterConfig;
  error?: string[];
  onBlur?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export interface SelectFieldProps extends BaseFieldProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export interface MultiSelectFieldProps extends BaseFieldProps {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}

export interface RadioFieldProps extends BaseFieldProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export interface CheckboxFieldProps extends BaseFieldProps {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}

export interface TextFieldProps extends BaseFieldProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export interface TextareaFieldProps extends BaseFieldProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export interface FieldRendererProps {
  config: FilterConfig;
  value: any;
  error?: string[];
  onChange: (value: any) => void;
  onBlur?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
} 