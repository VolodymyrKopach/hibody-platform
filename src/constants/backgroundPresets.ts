export const BACKGROUND_PRESETS = [
  { name: 'White', color: '#FFFFFF', icon: '⚪' },
  { name: 'Cream', color: '#FFF8E7', icon: '🟡' },
  { name: 'Light Blue', color: '#F0F9FF', icon: '🔵' },
  { name: 'Light Green', color: '#F0FDF4', icon: '🟢' },
  { name: 'Light Pink', color: '#FDF2F8', icon: '🟣' },
  { name: 'Light Gray', color: '#F9FAFB', icon: '⚫' },
];

// Beautiful gradient presets
export const GRADIENT_PRESETS = [
  { 
    name: 'Sunset', 
    from: '#FF512F',
    to: '#F09819',
    colors: ['#FF512F', '#F09819'],
    direction: 'to-right' as const,
    icon: '🌅'
  },
  { 
    name: 'Ocean', 
    from: '#2E3192',
    to: '#1BFFFF',
    colors: ['#2E3192', '#1BFFFF'],
    direction: 'to-right' as const,
    icon: '🌊'
  },
  { 
    name: 'Spring', 
    from: '#FFECD2',
    to: '#FCB69F',
    colors: ['#FFECD2', '#FCB69F'],
    direction: 'to-bottom' as const,
    icon: '🌸'
  },
  { 
    name: 'Purple Dream', 
    from: '#667eea',
    to: '#764ba2',
    colors: ['#667eea', '#764ba2'],
    direction: 'to-bottom-right' as const,
    icon: '💜'
  },
  { 
    name: 'Fresh Mint', 
    from: '#00d2ff',
    to: '#3a7bd5',
    colors: ['#00d2ff', '#3a7bd5'],
    direction: 'to-right' as const,
    icon: '🍃'
  },
  { 
    name: 'Peachy', 
    from: '#ED4264',
    to: '#FFEDBC',
    colors: ['#ED4264', '#FFEDBC'],
    direction: 'to-right' as const,
    icon: '🍑'
  },
  { 
    name: 'Sky Blue', 
    from: '#56CCF2',
    to: '#2F80ED',
    colors: ['#56CCF2', '#2F80ED'],
    direction: 'to-bottom' as const,
    icon: '☁️'
  },
  { 
    name: 'Lemon', 
    from: '#f7b733',
    to: '#fc4a1a',
    colors: ['#f7b733', '#fc4a1a'],
    direction: 'to-right' as const,
    icon: '🍋'
  },
  { 
    name: 'Rose', 
    from: '#F857A6',
    to: '#FF5858',
    colors: ['#F857A6', '#FF5858'],
    direction: 'to-bottom-right' as const,
    icon: '🌹'
  },
  { 
    name: 'Lavender', 
    from: '#C471F5',
    to: '#FA71CD',
    colors: ['#C471F5', '#FA71CD'],
    direction: 'to-right' as const,
    icon: '💐'
  },
  { 
    name: 'Forest', 
    from: '#134E5E',
    to: '#71B280',
    colors: ['#134E5E', '#71B280'],
    direction: 'to-bottom' as const,
    icon: '🌲'
  },
  { 
    name: 'Sunrise', 
    from: '#FDC830',
    to: '#F37335',
    colors: ['#FDC830', '#F37335'],
    direction: 'to-right' as const,
    icon: '🌄'
  },
  { 
    name: 'Berry', 
    from: '#8E2DE2',
    to: '#4A00E0',
    colors: ['#8E2DE2', '#4A00E0'],
    direction: 'to-bottom-right' as const,
    icon: '🫐'
  },
  { 
    name: 'Coral', 
    from: '#FF6B6B',
    to: '#FFE66D',
    colors: ['#FF6B6B', '#FFE66D'],
    direction: 'to-right' as const,
    icon: '🪸'
  },
  { 
    name: 'Ice', 
    from: '#E0EAFC',
    to: '#CFDEF3',
    colors: ['#E0EAFC', '#CFDEF3'],
    direction: 'to-bottom' as const,
    icon: '❄️'
  },
];

// CSS Pattern presets
export const PATTERN_PRESETS = [
  {
    name: 'Dots',
    pattern: 'dots',
    backgroundColor: '#FFFFFF',
    patternColor: '#E5E7EB',
    css: 'radial-gradient(circle, #E5E7EB 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    icon: '⚫'
  },
  {
    name: 'Grid Paper',
    pattern: 'grid',
    backgroundColor: '#FFFFFF',
    patternColor: '#E5E7EB',
    css: 'linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    icon: '📐'
  },
  {
    name: 'Lined Paper',
    pattern: 'lines-horizontal',
    backgroundColor: '#FFFFFF',
    patternColor: '#DBEAFE',
    css: 'repeating-linear-gradient(0deg, #FFFFFF, #FFFFFF 24px, #DBEAFE 24px, #DBEAFE 25px)',
    backgroundSize: 'auto',
    icon: '📝'
  },
  {
    name: 'Diagonal Lines',
    pattern: 'lines-diagonal',
    backgroundColor: '#FFFFFF',
    patternColor: '#F3F4F6',
    css: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 10px, #F3F4F6 10px, #F3F4F6 20px)',
    backgroundSize: 'auto',
    icon: '⚡'
  },
  {
    name: 'Tiny Dots',
    pattern: 'dots-small',
    backgroundColor: '#FFF8E7',
    patternColor: '#FDE68A',
    css: 'radial-gradient(circle, #FDE68A 0.5px, transparent 0.5px)',
    backgroundSize: '10px 10px',
    icon: '✨'
  },
  {
    name: 'Graph Paper',
    pattern: 'graph',
    backgroundColor: '#F9FAFB',
    patternColor: '#D1D5DB',
    css: 'linear-gradient(#D1D5DB 1px, transparent 1px), linear-gradient(90deg, #D1D5DB 1px, transparent 1px)',
    backgroundSize: '10px 10px',
    icon: '📊'
  },
  {
    name: 'Music Sheet',
    pattern: 'music',
    backgroundColor: '#FFFFFF',
    patternColor: '#000000',
    css: 'repeating-linear-gradient(0deg, transparent, transparent 30px, #000000 30px, #000000 31px, transparent 31px, transparent 45px, #000000 45px, #000000 46px, transparent 46px, transparent 60px, #000000 60px, #000000 61px, transparent 61px, transparent 75px, #000000 75px, #000000 76px, transparent 76px, transparent 90px, #000000 90px, #000000 91px)',
    backgroundSize: 'auto',
    icon: '🎵'
  },
  {
    name: 'Checkered',
    pattern: 'checkered',
    backgroundColor: '#FFFFFF',
    patternColor: '#E5E7EB',
    css: 'linear-gradient(45deg, #E5E7EB 25%, transparent 25%), linear-gradient(-45deg, #E5E7EB 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E5E7EB 75%), linear-gradient(-45deg, transparent 75%, #E5E7EB 75%)',
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
    icon: '♟️'
  },
];

// Beautiful template presets - ready-made combinations
export const TEMPLATE_PRESETS = [
  {
    name: 'Notebook Paper',
    category: 'Educational',
    description: 'Classic lined paper look',
    icon: '📓',
    background: {
      type: 'pattern' as const,
      pattern: {
        name: 'lines-horizontal',
        backgroundColor: '#FFFEF7',
        patternColor: '#B8D4E8',
        css: 'repeating-linear-gradient(0deg, #FFFEF7, #FFFEF7 24px, #B8D4E8 24px, #B8D4E8 25px)',
        backgroundSize: 'auto',
        scale: 1,
        opacity: 100,
      },
    },
  },
  {
    name: 'Math Grid',
    category: 'Educational',
    description: 'Graph paper for math',
    icon: '📐',
    background: {
      type: 'pattern' as const,
      pattern: {
        name: 'graph',
        backgroundColor: '#FFFFFF',
        patternColor: '#DBEAFE',
        css: 'linear-gradient(#DBEAFE 1px, transparent 1px), linear-gradient(90deg, #DBEAFE 1px, transparent 1px)',
        backgroundSize: '10px 10px',
        scale: 1,
        opacity: 100,
      },
    },
  },
  {
    name: 'Sunset Vibes',
    category: 'Colorful',
    description: 'Warm gradient background',
    icon: '🌅',
    background: {
      type: 'gradient' as const,
      gradient: {
        from: '#FF512F',
        to: '#F09819',
        colors: ['#FF512F', '#F09819'],
        direction: 'to-bottom-right' as const,
      },
    },
  },
  {
    name: 'Ocean Breeze',
    category: 'Colorful',
    description: 'Cool blue gradient',
    icon: '🌊',
    background: {
      type: 'gradient' as const,
      gradient: {
        from: '#56CCF2',
        to: '#2F80ED',
        colors: ['#56CCF2', '#2F80ED'],
        direction: 'to-bottom' as const,
      },
    },
  },
  {
    name: 'Soft Dots',
    category: 'Minimal',
    description: 'Subtle dotted pattern',
    icon: '⚪',
    background: {
      type: 'pattern' as const,
      pattern: {
        name: 'dots-small',
        backgroundColor: '#F9FAFB',
        patternColor: '#D1D5DB',
        css: 'radial-gradient(circle, #D1D5DB 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        scale: 1,
        opacity: 100,
      },
    },
  },
  {
    name: 'Clean Lines',
    category: 'Minimal',
    description: 'Professional lined background',
    icon: '📝',
    background: {
      type: 'pattern' as const,
      pattern: {
        name: 'lines-horizontal',
        backgroundColor: '#FFFFFF',
        patternColor: '#E5E7EB',
        css: 'repeating-linear-gradient(0deg, #FFFFFF, #FFFFFF 24px, #E5E7EB 24px, #E5E7EB 25px)',
        backgroundSize: 'auto',
        scale: 1,
        opacity: 30,
      },
    },
  },
  {
    name: 'Spring Garden',
    category: 'Seasonal',
    description: 'Fresh spring colors',
    icon: '🌸',
    background: {
      type: 'gradient' as const,
      gradient: {
        from: '#FFECD2',
        to: '#FCB69F',
        colors: ['#FFECD2', '#FCB69F'],
        direction: 'to-right' as const,
      },
    },
  },
  {
    name: 'Winter Frost',
    category: 'Seasonal',
    description: 'Cool icy background',
    icon: '❄️',
    background: {
      type: 'gradient' as const,
      gradient: {
        from: '#E0EAFC',
        to: '#CFDEF3',
        colors: ['#E0EAFC', '#CFDEF3'],
        direction: 'to-bottom' as const,
      },
    },
  },
  {
    name: 'Playful Dots',
    category: 'Kids',
    description: 'Colorful dotted fun',
    icon: '🎨',
    background: {
      type: 'pattern' as const,
      pattern: {
        name: 'dots',
        backgroundColor: '#FFF8E7',
        patternColor: '#FFD700',
        css: 'radial-gradient(circle, #FFD700 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        scale: 1,
        opacity: 60,
      },
    },
  },
  {
    name: 'Rainbow Burst',
    category: 'Kids',
    description: 'Bright multi-color gradient',
    icon: '🌈',
    background: {
      type: 'gradient' as const,
      gradient: {
        from: '#667eea',
        to: '#FF5858',
        colors: ['#667eea', '#F857A6', '#FF5858'],
        direction: 'to-bottom-right' as const,
      },
    },
  },
  {
    name: 'Professional',
    category: 'Business',
    description: 'Clean and formal',
    icon: '💼',
    background: {
      type: 'solid' as const,
      color: '#F9FAFB',
    },
  },
  {
    name: 'Music Sheet',
    category: 'Special',
    description: 'Musical staff lines',
    icon: '🎵',
    background: {
      type: 'pattern' as const,
      pattern: {
        name: 'music',
        backgroundColor: '#FFFFFF',
        patternColor: '#000000',
        css: 'repeating-linear-gradient(0deg, transparent, transparent 30px, #000000 30px, #000000 31px, transparent 31px, transparent 45px, #000000 45px, #000000 46px, transparent 46px, transparent 60px, #000000 60px, #000000 61px, transparent 61px, transparent 75px, #000000 75px, #000000 76px, transparent 76px, transparent 90px, #000000 90px, #000000 91px)',
        backgroundSize: 'auto',
        scale: 1,
        opacity: 100,
      },
    },
  },
];

