// Worksheet Format Presets

export interface FormatPreset {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  unit: 'px' | 'mm';
  icon: string;
  category: 'document' | 'photo' | 'social' | 'custom';
}

export const FORMAT_PRESETS: FormatPreset[] = [
  // Documents
  {
    id: 'a4-portrait',
    name: 'A4 Portrait',
    description: '210 × 297 mm',
    width: 794,
    height: 1123,
    unit: 'px',
    icon: '📄',
    category: 'document',
  },
  {
    id: 'a4-landscape',
    name: 'A4 Landscape',
    description: '297 × 210 mm',
    width: 1123,
    height: 794,
    unit: 'px',
    icon: '📃',
    category: 'document',
  },
  {
    id: 'letter-portrait',
    name: 'US Letter Portrait',
    description: '8.5 × 11 in',
    width: 816,
    height: 1056,
    unit: 'px',
    icon: '📋',
    category: 'document',
  },
  {
    id: 'letter-landscape',
    name: 'US Letter Landscape',
    description: '11 × 8.5 in',
    width: 1056,
    height: 816,
    unit: 'px',
    icon: '📰',
    category: 'document',
  },
  
  // Photos
  {
    id: 'photo-4x6',
    name: 'Photo 4×6',
    description: '4 × 6 inches',
    width: 384,
    height: 576,
    unit: 'px',
    icon: '🖼️',
    category: 'photo',
  },
  {
    id: 'photo-5x7',
    name: 'Photo 5×7',
    description: '5 × 7 inches',
    width: 480,
    height: 672,
    unit: 'px',
    icon: '🖼️',
    category: 'photo',
  },
  {
    id: 'photo-8x10',
    name: 'Photo 8×10',
    description: '8 × 10 inches',
    width: 768,
    height: 960,
    unit: 'px',
    icon: '🖼️',
    category: 'photo',
  },
  
  // Social Media
  {
    id: 'instagram-post',
    name: 'Instagram Post',
    description: '1080 × 1080 px',
    width: 1080,
    height: 1080,
    unit: 'px',
    icon: '📱',
    category: 'social',
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    description: '1080 × 1920 px',
    width: 1080,
    height: 1920,
    unit: 'px',
    icon: '📱',
    category: 'social',
  },
  {
    id: 'facebook-post',
    name: 'Facebook Post',
    description: '1200 × 630 px',
    width: 1200,
    height: 630,
    unit: 'px',
    icon: '📱',
    category: 'social',
  },
];

export const getFormatPreset = (id: string): FormatPreset | undefined => {
  return FORMAT_PRESETS.find(preset => preset.id === id);
};

export const getFormatPresetsByCategory = (category: FormatPreset['category']): FormatPreset[] => {
  return FORMAT_PRESETS.filter(preset => preset.category === category);
};

