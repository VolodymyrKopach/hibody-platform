/**
 * Base worksheet props interfaces
 * Following SOLID principles - Interface Segregation Principle (ISP)
 */

/**
 * Common props for all worksheet components
 */
export interface BaseWorksheetProps {
  title?: string;
  instruction?: string;
}

/**
 * Visual customization props
 */
export interface VisualCustomizationProps {
  mascot?: string;
  borderColor?: string;
  backgroundColor?: string;
}

/**
 * Theme-based customization props
 */
export interface ThemeProps {
  theme?: string;
}

/**
 * Combined base props for most worksheet components
 */
export interface WorksheetComponentProps extends BaseWorksheetProps, VisualCustomizationProps {
  // Most components will extend this
}

/**
 * Props for components with theme support
 */
export interface ThemedWorksheetProps extends WorksheetComponentProps, ThemeProps {
  // Components with theme presets extend this
}

/**
 * Editor state for worksheet customization
 */
export interface WorksheetEditorState {
  title: string;
  instruction: string;
  mascot: string;
  borderColor: string;
  backgroundColor: string;
  theme?: string;
  // Component-specific props will extend this
}

