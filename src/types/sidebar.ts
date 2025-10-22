import { WorksheetEdit } from './worksheet-generation';

export interface PageBackground {
  type: 'solid' | 'gradient' | 'pattern' | 'image';
  color?: string;
  image?: {
    url: string;
    size: 'cover' | 'contain' | 'repeat' | 'auto';
    position: 'center' | 'top' | 'bottom' | 'left' | 'right';
    opacity?: number;
  };
  gradient?: {
    from: string;
    to: string;
    colors?: string[];
    direction: 'to-bottom' | 'to-top' | 'to-right' | 'to-left' | 'to-bottom-right' | 'to-bottom-left' | 'to-top-right' | 'to-top-left';
  };
  pattern?: {
    name: string;
    backgroundColor: string;
    patternColor: string;
    css: string;
    backgroundSize: string;
    backgroundPosition?: string;
    scale?: number;
    opacity?: number;
  };
  opacity?: number;
}

export type Selection = 
  | { type: 'page'; data: any }
  | { type: 'element'; pageData: any; elementData: any }
  | null;

export interface SidebarBaseProps {
  isOpen: boolean;
  onToggle: () => void;
}

export interface SidebarSelectionProps {
  selection: Selection;
  onSelectionChange?: (selection: Selection) => void;
}

export interface PageEditingProps {
  onPageBackgroundUpdate?: (pageId: string, background: PageBackground) => void;
  onImageUpload?: (pageId: string, file: File) => Promise<void>;
}

export interface ElementEditingProps {
  onUpdate?: (updates: any) => void;
  onDuplicate?: (pageId: string, elementId: string) => void;
  onDelete?: (pageId: string, elementId: string) => void;
}

export interface AIEditingProps {
  parameters?: any;
  onAIEdit?: (instruction: string) => Promise<void>;
  editHistory?: WorksheetEdit[];
  isAIEditing?: boolean;
  editError?: string | null;
  onClearEditError?: () => void;
}

export interface RightSidebarProps extends 
  SidebarBaseProps,
  SidebarSelectionProps,
  PageEditingProps,
  ElementEditingProps,
  AIEditingProps {}

export interface BackgroundEditorProps {
  pageData: any;
  onPageBackgroundUpdate?: (pageId: string, background: PageBackground) => void;
  onImageUpload?: (pageId: string, file: File) => Promise<void>;
}

export interface WorksheetEditContext {
  topic: string;
  ageGroup: string;
  difficulty: string;
  language: string;
}

