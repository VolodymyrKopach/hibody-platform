import { ElementEditorComponent } from '@/types/element-editors';
import dynamic from 'next/dynamic';

// Lazy load editors for better performance
const TextElementEditor = dynamic(() => import('../element/editors/TextElementEditor'));
const ImageElementEditor = dynamic(() => import('../element/editors/ImageElementEditor'));
const DividerEditor = dynamic(() => import('../element/editors/DividerEditor'));
const TapImageEditor = dynamic(() => import('../element/editors/TapImageEditor'));
const ColorMatcherEditor = dynamic(() => import('../element/editors/ColorMatcherEditor'));
const MatchColumnsEditor = dynamic(() => import('../element/editors/MatchColumnsEditor'));
const DefaultElementEditor = dynamic(() => import('../element/editors/DefaultElementEditor'));

const ELEMENT_EDITORS: Record<string, ElementEditorComponent> = {
  'text': TextElementEditor,
  'title': TextElementEditor,
  'image': ImageElementEditor,
  'divider': DividerEditor,
  'tap-image': TapImageEditor,
  'color-matcher': ColorMatcherEditor,
  'match-columns': MatchColumnsEditor,
};

export const getElementEditor = (type: string): ElementEditorComponent => {
  return ELEMENT_EDITORS[type] || DefaultElementEditor;
};

export const hasCustomEditor = (type: string): boolean => {
  return type in ELEMENT_EDITORS;
};

export const registerElementEditor = (type: string, editor: ElementEditorComponent): void => {
  ELEMENT_EDITORS[type] = editor;
};

