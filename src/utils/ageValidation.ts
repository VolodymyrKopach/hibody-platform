// Age validation and group determination for adaptive content generation

export enum AgeGroup {
  TODDLERS = 'toddlers',      // 3-4 years
  PRESCHOOL = 'preschool',    // 5-6 years
  EARLY_SCHOOL = 'early',     // 7-8 years
  MIDDLE_SCHOOL = 'middle',   // 9-10 years
}

export interface AgeGroupConfig {
  name: string;
  description: string;
  minAge: number;
  maxAge: number;
  characteristics: string[];
  interactiveElements: string[];
  attentionSpan: number; // minutes
  preferredStyles: string[];
}

export const AGE_GROUP_CONFIGS: Record<AgeGroup, AgeGroupConfig> = {
  [AgeGroup.TODDLERS]: {
    name: '🐣 Toddlers',
    description: 'Very simple interactions, large buttons, bright colors',
    minAge: 3,
    maxAge: 4,
    characteristics: [
      'Short attention span (3-5 minutes)',
      'Love large bright elements',
      'Need simple actions (click, tap)',
      'React to sounds and animations',
      'Learn through repetition'
    ],
    interactiveElements: [
      'Large animated buttons',
      'Simple drag & drop',
      'Sound effects on click',
      'Bright flashes and animations',
      'Large emojis and pictures',
      'Simple hover effects'
    ],
    attentionSpan: 5,
    preferredStyles: [
      'Very large fonts (24px+)',
      'Bright contrasting colors',
      'Lots of white space',
      'Simple shapes and contours',
      'Large tactile elements'
    ]
  },
  
  [AgeGroup.PRESCHOOL]: {
    name: '🎨 Preschoolers',
    description: 'Game elements, characters, simple tasks',
    minAge: 5,
    maxAge: 6,
    characteristics: [
      'Attention span 5-10 minutes',
      'Love characters and stories',
      'Can perform simple tasks',
      'Interested in colors and shapes',
      'Learn through play'
    ],
    interactiveElements: [
      'Interactive characters',
      'Mini-games with tasks',
      'Simple quizzes with pictures',
      'Dragging elements',
      'Animated rewards',
      'Interactive stories',
      'Simple score counting'
    ],
    attentionSpan: 8,
    preferredStyles: [
      'Large fonts (20px+)',
      'Bright cheerful colors',
      'Rounded corners',
      'Children\'s illustrations',
      'Smooth animations'
    ]
  },
  
  [AgeGroup.EARLY_SCHOOL]: {
    name: '📚 Early Schoolers',
    description: 'Educational games, simple text, basic interactivity',
    minAge: 7,
    maxAge: 8,
    characteristics: [
      'Attention span 10-15 minutes',
      'Can read simple words',
      'Can perform sequential actions',
      'Interested in achievements',
      'Understand simple rules'
    ],
    interactiveElements: [
      'Educational mini-games',
      'Interactive exercises',
      'Point and level system',
      'Progress bars',
      'Interactive tests',
      'Drag&drop with logic',
      'Collecting items',
      'Simple puzzles'
    ],
    attentionSpan: 12,
    preferredStyles: [
      'Medium fonts (18px+)',
      'Balanced colors',
      'Structured layout',
      'Clear instructions',
      'Visual feedback'
    ]
  },
  
  [AgeGroup.MIDDLE_SCHOOL]: {
    name: '🎯 Middle Schoolers',
    description: 'Complex tasks, texts, interactive experiments',
    minAge: 9,
    maxAge: 10,
    characteristics: [
      'Attention span 15-20 minutes',
      'Read and understand well',
      'Can perform complex tasks',
      'Interested in details',
      'Understand complex concepts'
    ],
    interactiveElements: [
      'Interactive simulations',
      'Complex games with rules',
      'Detailed achievement system',
      'Multi-stage tasks',
      'Interactive diagrams',
      'Virtual experiments',
      'Story-driven quests',
      'Creative tasks'
    ],
    attentionSpan: 18,
    preferredStyles: [
      'Standard fonts (16px+)',
      'Professional colors',
      'Detailed content',
      'Informative elements',
      'Complex navigation'
    ]
  }
};

export function determineAgeGroup(age: number): AgeGroup {
  if (age >= 3 && age <= 4) return AgeGroup.TODDLERS;
  if (age >= 5 && age <= 6) return AgeGroup.PRESCHOOL;
  if (age >= 7 && age <= 8) return AgeGroup.EARLY_SCHOOL;
  if (age >= 9 && age <= 10) return AgeGroup.MIDDLE_SCHOOL;
  
  // Default fallback
  if (age < 3) return AgeGroup.TODDLERS;
  return AgeGroup.MIDDLE_SCHOOL;
}

export function extractAgeFromText(text: string): number | null {
  // Search for age in text
  const agePatterns = [
    /(\d+)\s*(?:років?|рік|year?s?|old)/i,
    /для\s*дітей\s*(\d+)/i,
    /діти\s*(\d+)/i,
    /age[:\s]*(\d+)/i,
    /вік[:\s]*(\d+)/i,
    /(\d+)\s*р\./i
  ];
  
  for (const pattern of agePatterns) {
    const match = text.match(pattern);
    if (match) {
      const age = parseInt(match[1]);
      if (age >= 3 && age <= 10) {
        return age;
      }
    }
  }
  
  return null;
}

export function validateAge(age: number): { valid: boolean; message?: string } {
  if (age < 3) {
    return {
      valid: false,
      message: 'The system is designed for children aged 3 and older. Younger children require a special approach.'
    };
  }
  
  if (age > 10) {
    return {
      valid: false,
      message: 'The system is optimized for children up to 10 years old. For older children, we recommend other learning methods.'
    };
  }
  
  return { valid: true };
}

export function getAgeGroupConfig(age: number): AgeGroupConfig {
  const group = determineAgeGroup(age);
  return AGE_GROUP_CONFIGS[group];
}

export function generateAgePrompt(age: number): string {
  const config = getAgeGroupConfig(age);
  
  return `
**AGE GROUP:** ${config.name} (${age} ${age === 1 ? 'year' : age < 5 ? 'years' : 'years'} old)

**AGE CHARACTERISTICS:**
${config.characteristics.map(char => `• ${char}`).join('\n')}

**MANDATORY INTERACTIVE ELEMENTS:**
${config.interactiveElements.map(elem => `• ${elem}`).join('\n')}

**STYLISTIC REQUIREMENTS:**
${config.preferredStyles.map(style => `• ${style}`).join('\n')}

**ATTENTION SPAN:** ${config.attentionSpan} minutes maximum

**CONTENT ADAPTATION:**
- Divide content into segments of ${Math.ceil(config.attentionSpan / 3)} minutes
- Use ${config.name.toLowerCase()} language and examples
- Periodically add interactive elements every 2-3 minutes
`;
} 