import React from 'react';

export interface ElementEditorProps {
  elementData: any;
  onUpdate?: (updates: any) => void;
  onDuplicate?: (pageId: string, elementId: string) => void;
  onDelete?: (pageId: string, elementId: string) => void;
  pageData?: any;
}

export type ElementEditorComponent = React.FC<ElementEditorProps>;

export interface IElementEditor {
  validate?: (data: any) => boolean;
  getDefaultProperties?: () => Record<string, any>;
}

export interface CommonElementPropertiesProps {
  elementData: any;
  onUpdate?: (updates: any) => void;
}

export interface PositionControlsProps {
  x: number;
  y: number;
  onChange: (position: { x?: number; y?: number }) => void;
}

export interface SizeControlsProps {
  width: number;
  height: number;
  onChange: (size: { width?: number; height?: number }) => void;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

