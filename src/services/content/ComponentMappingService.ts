/**
 * === Component Mapping Service ===
 * Забезпечує точну відповідність між назвами компонентів у шаблонах та інструкціями для ШІ
 * Гарантує, що ШІ використовує точно ті самі назви класів, що є в наших шаблонах
 */

import { AgeGroup } from '@/types/generation';

export interface ComponentMapping {
  className: string;
  description: string;
  usage: string;
  examples: string[];
}

export interface AgeGroupComponents {
  layouts: ComponentMapping[];
  buttons: ComponentMapping[];
  images: ComponentMapping[];
  interactive: ComponentMapping[];
  text: ComponentMapping[];
  special: ComponentMapping[];
}

/**
 * === SOLID: SRP - Сервіс для мапінгу компонентів ===
 * Відповідає тільки за надання точних назв класів та їх описів для ШІ
 */
export class ComponentMappingService {
  
  /**
   * Отримати точні назви класів для вікової групи
   */
  getComponentsForAge(ageGroup: AgeGroup): AgeGroupComponents {
    switch (ageGroup) {
      case '2-3':
        return this.getComponents2_3();
      case '4-6':
        return this.getComponents4_6();
      case '7-8':
        return this.getComponents7_8();
      case '9-10':
        return this.getComponents9_10();
      default:
        return this.getComponents4_6(); // fallback
    }
  }

  /**
   * Компоненти для 2-3 років
   */
  private getComponents2_3(): AgeGroupComponents {
    return {
      layouts: [
        {
          className: 'layout-fullscreen',
          description: 'Full screen centered layout for main content',
          usage: 'Use for single-focus activities and main slide content',
          examples: ['<div class="layout-fullscreen"><!-- content --></div>']
        },
        {
          className: 'layout-top-bottom',
          description: 'Split layout with top and bottom sections',
          usage: 'Use when you need to separate title/instruction from interactive content',
          examples: ['<div class="layout-top-bottom"><div class="top-section">Title</div><div class="bottom-section">Activity</div></div>']
        },
        {
          className: 'content-center',
          description: 'Centered content container',
          usage: 'Use for centering multiple elements vertically and horizontally',
          examples: ['<div class="content-center"><!-- centered content --></div>']
        },
        {
          className: 'two-column',
          description: 'Two column layout with left and right sides',
          usage: 'Use for comparing or showing two related concepts',
          examples: ['<div class="two-column"><div class="left-side">Left</div><div class="right-side">Right</div></div>']
        }
      ],
      buttons: [
        {
          className: 'giant-button',
          description: 'Extra large circular button (350px) for main actions - can contain images or emojis',
          usage: 'Use as the primary action button on each slide - only one per slide. Can contain images that will be automatically cropped to circular shape',
          examples: [
            '<div class="giant-button" onclick="handleGiantButton(this,\'success\',\'Great job!\')">🌟</div>',
            '<div class="giant-button">🎈</div>',
            '<div class="giant-button" onclick="handleGiantButton(this,\'success\',\'Hello!\')"><div class="image-container"><img src="image-url" alt="description" width="400" height="400"></div></div>'
          ]
        },
        {
          className: 'large-button',
          description: 'Large circular buttons (220px) with variants - can contain images or emojis',
          usage: 'Use for secondary actions, multiple choice options. Can contain images that will be automatically cropped to circular shape',
          examples: [
            '<div class="large-button variant-1">🎮</div>',
            '<div class="large-button variant-2">🎵</div>',
            '<div class="large-button variant-3">🎨</div>',
            '<div class="large-button variant-2" onclick="handleGiantButton(this,\'success\',\'Hug Dad!\')"><div class="image-container"><img src="image-url" alt="dad hugging child" width="400" height="400"></div></div>'
          ]
        }
      ],
      images: [
        {
          className: 'hero-image',
          description: 'Main slide image (400x300px)',
          usage: 'Use for the primary visual content of the slide',
          examples: [
            '<div class="hero-image"><!-- IMAGE_PROMPT: "description" WIDTH: 640 HEIGHT: 480 --></div>'
          ]
        },
        {
          className: 'content-image',
          description: 'Supporting content image (280x210px)',
          usage: 'Use for secondary illustrations that support the main content',
          examples: [
            '<div class="content-image"><!-- IMAGE_PROMPT: "description" WIDTH: 512 HEIGHT: 384 --></div>'
          ]
        },
        {
          className: 'action-image',
          description: 'Interactive circular image (200x200px)',
          usage: 'Use for clickable images that trigger actions. Can include custom text as third parameter',
          examples: [
            '<div class="action-image" onclick="handleImageClick(this,\'action\',\'Car!\')"><!-- IMAGE_PROMPT: "description" WIDTH: 400 HEIGHT: 400 --></div>',
            '<div class="action-image" onclick="handleImageClick(this,\'action\')"><!-- IMAGE_PROMPT: "description" WIDTH: 400 HEIGHT: 400 --></div>'
          ]
        },
        {
          className: 'mini-image',
          description: 'Small decorative image (120x120px)',
          usage: 'Use for small visual accents and decorations',
          examples: [
            '<div class="mini-image"><!-- IMAGE_PROMPT: "description" WIDTH: 256 HEIGHT: 256 --></div>'
          ]
        },
        {
          className: 'h-img',
          description: 'Alternative hero image container (380x280px)',
          usage: 'Use as alternative to hero-image for main slide visuals',
          examples: [
            '<div class="h-img"><!-- IMAGE_PROMPT: "description" WIDTH: 640 HEIGHT: 480 --></div>'
          ]
        }
      ],
      interactive: [
        {
          className: 'interactive-element',
          description: 'Interactive circular elements with variants',
          usage: 'Use for clickable learning elements that provide feedback. Add onclick handlers for interactivity',
          examples: [
            '<div class="interactive-element variant-1" onclick="soundEffects.interactive(\'variant1\')">🐱</div>',
            '<div class="interactive-element variant-2" onclick="soundEffects.interactive(\'variant2\')">🐶</div>',
            '<div class="interactive-element variant-3" onclick="soundEffects.interactive(\'variant3\')">🐻</div>'
          ]
        },
        {
          className: 'interactive-shape',
          description: 'Interactive geometric shapes',
          usage: 'Use for shape recognition and basic learning activities. Can include custom text as third parameter',
          examples: [
            '<div class="interactive-shape circle" onclick="handleInteractiveShape(this,\'circle\',\'Round!\')">⭕</div>',
            '<div class="interactive-shape square" onclick="handleInteractiveShape(this,\'square\')">⬜</div>',
            '<div class="interactive-shape triangle" onclick="handleInteractiveShape(this,\'triangle\',\'Point!\')">🔺</div>'
          ]
        },
        {
          className: 'primary-visual',
          description: 'Main visual element with rotation animation',
          usage: 'Use for the central focus element that draws attention',
          examples: [
            '<div class="primary-visual">🌟</div>'
          ]
        }
      ],
      text: [
        {
          className: 'slide-title-main',
          description: 'Main slide title (72px font)',
          usage: 'Use for the primary title of each slide',
          examples: [
            '<div class="slide-title-main">Hello!</div>',
            '<div class="slide-title-main">Look!</div>'
          ]
        },
        {
          className: 'slide-title-secondary',
          description: 'Secondary title (48px font)',
          usage: 'Use for subtitles and section headers',
          examples: [
            '<div class="slide-title-secondary">Numbers</div>'
          ]
        },
        {
          className: 'instruction-text',
          description: 'Instruction text with glow animation (52px font)',
          usage: 'Use for telling children what to do',
          examples: [
            '<div class="instruction-text">Touch! 👆</div>',
            '<div class="instruction-text">Look! 👀</div>'
          ]
        },
        {
          className: 'simple-text',
          description: 'Simple text content (40px font)',
          usage: 'Use for basic text content and descriptions',
          examples: [
            '<div class="simple-text">Good!</div>'
          ]
        },
        {
          className: 'template-title',
          description: 'Section title with background and shadow (36px font)',
          usage: 'Use for section headers within template-section containers',
          examples: [
            '<div class="template-title">Play Time!</div>'
          ]
        }
      ],
      special: [
        {
          className: 'progress-container',
          description: 'Progress bar container with animated fill',
          usage: 'Use to show learning progress and achievements',
          examples: [
            '<div class="progress-container"><div class="progress-fill"></div></div>'
          ]
        },
        {
          className: 'reward-element',
          description: 'Star-shaped reward element (CSS star shape, NO IMAGES needed)',
          usage: 'Use to celebrate success and completion. Already styled as golden star. Add onclick for interactive rewards',
          examples: [
            '<div class="reward-element" onclick="soundEffects.success()"></div>',
            '<div class="reward-element"></div>'
          ]
        },
        {
          className: 'celebration-element',
          description: 'Spinning celebration element with emoji or text (NO IMAGES)',
          usage: 'Use for celebration animations and positive feedback. Contains emoji or text, NOT images. Add onclick for interactive celebrations',
          examples: [
            '<div class="celebration-element" onclick="soundEffects.success()">🎉</div>',
            '<div class="celebration-element" onclick="soundEffects.success()">🌟</div>',
            '<div class="celebration-element">Yay!</div>'
          ]
        },
        {
          className: 'audio-control',
          description: 'Audio control button with sound waves',
          usage: 'Use for audio-related interactions and sound activities',
          examples: [
            '<div class="audio-control" onclick="soundEffects.music()"><div class="audio-wave"></div></div>',
            '<div class="audio-control"></div>'
          ]
        },
        {
          className: 'background-decoration',
          description: 'Floating background decorations with emoji (NO IMAGES)',
          usage: 'Use for ambient visual elements that enhance the atmosphere. Contains emoji only, NOT images',
          examples: [
            '<div class="background-decoration">✨</div>',
            '<div class="background-decoration">🧸</div>',
            '<div class="background-decoration">🎈</div>',
            '<div class="background-decoration">🌟</div>'
          ]
        },
        {
          className: 'button-row',
          description: 'Horizontal row layout for multiple buttons',
          usage: 'Use to arrange multiple buttons or interactive elements horizontally',
          examples: [
            '<div class="button-row"><!-- multiple buttons here --></div>'
          ]
        },
        {
          className: 'template-section',
          description: 'Sectioned container with dashed border and background',
          usage: 'Use to group related content in visually distinct sections',
          examples: [
            '<div class="template-section"><div class="template-title">Section Title</div><!-- content --></div>'
          ]
        },
        {
          className: 's',
          description: 'Full-height section layout container',
          usage: 'Use as alternative to layout-fullscreen for section-based layouts',
          examples: [
            '<div class="s"><!-- section content --></div>'
          ]
        }
      ]
    };
  }

  /**
   * Компоненти для 4-6 років
   */
  private getComponents4_6(): AgeGroupComponents {
    return {
      layouts: [
        {
          className: 'layout-fullscreen',
          description: 'Full screen centered layout',
          usage: 'Use for main content and activities',
          examples: ['<div class="layout-fullscreen"><!-- content --></div>']
        },
        {
          className: 'content-center',
          description: 'Centered content container',
          usage: 'Use for centering learning activities',
          examples: ['<div class="content-center"><!-- content --></div>']
        },
        {
          className: 'two-column',
          description: 'Two column layout',
          usage: 'Use for comparing concepts or showing related content',
          examples: ['<div class="two-column"><div class="left-side">Left</div><div class="right-side">Right</div></div>']
        }
      ],
      buttons: [
        {
          className: 'giant-button',
          description: 'Large main action button (320px)',
          usage: 'Use as the primary interactive element',
          examples: [
            '<div class="giant-button" onclick="handleGiantButton(this,\'success\',\'Great choice!\')">🌟</div>'
          ]
        }
      ],
      images: [
        {
          className: 'hero-image',
          description: 'Main slide image (400x300px)',
          usage: 'Use for primary visual content',
          examples: [
            '<div class="hero-image"><!-- IMAGE_PROMPT: "description" WIDTH: 640 HEIGHT: 480 --></div>'
          ]
        }
      ],
      interactive: [],
      text: [
        {
          className: 'slide-title-main',
          description: 'Main slide title (64px font)',
          usage: 'Use for slide titles',
          examples: [
            '<div class="slide-title-main">Learn Together!</div>'
          ]
        },
        {
          className: 'instruction-text',
          description: 'Instruction text with animation (48px font)',
          usage: 'Use for instructions and guidance',
          examples: [
            '<div class="instruction-text">Touch the star!</div>'
          ]
        },
        {
          className: 'simple-text',
          description: 'Simple text content (36px font)',
          usage: 'Use for basic content',
          examples: [
            '<div class="simple-text">Well done!</div>'
          ]
        }
      ],
      special: []
    };
  }

  /**
   * Компоненти для 7-8 років
   */
  private getComponents7_8(): AgeGroupComponents {
    return {
      layouts: [
        {
          className: 'content-container',
          description: 'Main content container with white background',
          usage: 'Use as the main wrapper for slide content',
          examples: ['<div class="content-container"><!-- slide content --></div>']
        },
        {
          className: 'layout-fullscreen',
          description: 'Full screen layout',
          usage: 'Use for full-screen activities',
          examples: ['<div class="layout-fullscreen"><!-- content --></div>']
        },
        {
          className: 'two-column',
          description: 'Two column layout',
          usage: 'Use for structured content presentation',
          examples: ['<div class="two-column"><div class="left-side">Left</div><div class="right-side">Right</div></div>']
        }
      ],
      buttons: [],
      images: [
        {
          className: 'hero-image',
          description: 'Main educational image (400x300px)',
          usage: 'Use for primary visual content',
          examples: [
            '<div class="hero-image" onclick="handleImageClick(this,\'hero\')"><!-- IMAGE_PROMPT: "description" WIDTH: 800 HEIGHT: 600 --></div>'
          ]
        }
      ],
      interactive: [
        {
          className: 'reward-element',
          description: 'Achievement badge element',
          usage: 'Use for showing achievements and rewards',
          examples: [
            '<div class="reward-element">🏆</div>'
          ]
        }
      ],
      text: [
        {
          className: 'slide-main-title',
          description: 'Main slide title (36px font)',
          usage: 'Use for slide titles',
          examples: [
            '<div class="slide-main-title">Math: Addition and Subtraction</div>'
          ]
        },
        {
          className: 'main-heading',
          description: 'Main heading with gradient text (32px font)',
          usage: 'Use for section headings',
          examples: [
            '<div class="main-heading">📚 Learning Objectives</div>'
          ]
        },
        {
          className: 'section-heading',
          description: 'Section heading (24px font)',
          usage: 'Use for subsection titles',
          examples: [
            '<div class="section-heading">📚 What You\'ll Learn</div>'
          ]
        },
        {
          className: 'instruction-text',
          description: 'Instruction text (24px font)',
          usage: 'Use for instructions and guidance',
          examples: [
            '<div class="instruction-text">Click on the correct answer</div>'
          ]
        },
        {
          className: 'simple-text',
          description: 'Simple text content (20px font)',
          usage: 'Use for regular content',
          examples: [
            '<div class="simple-text">Great work!</div>'
          ]
        }
      ],
      special: [
        {
          className: 'progress-bar',
          description: 'Progress bar container',
          usage: 'Use to show learning progress',
          examples: [
            '<div class="progress-bar"><div class="progress-fill"></div></div>'
          ]
        }
      ]
    };
  }

  /**
   * Компоненти для 9-10 років
   */
  private getComponents9_10(): AgeGroupComponents {
    return {
      layouts: [
        {
          className: 's',
          description: 'Main content section with white background',
          usage: 'Use as the primary content wrapper',
          examples: ['<div class="s"><!-- content --></div>']
        },
        {
          className: 'two-column',
          description: 'Two column layout for structured content',
          usage: 'Use for comparing information or side-by-side content',
          examples: ['<div class="two-column"><div class="left-side">Left</div><div class="right-side">Right</div></div>']
        },
        {
          className: 'three-column',
          description: 'Three column grid layout',
          usage: 'Use for organizing multiple related items',
          examples: ['<div class="three-column"><!-- grid items --></div>']
        },
        {
          className: 'content-grid',
          description: 'Responsive grid for content cards',
          usage: 'Use for displaying multiple content items in a grid',
          examples: ['<div class="content-grid"><!-- cards --></div>']
        }
      ],
      buttons: [
        {
          className: 'card',
          description: 'Interactive content card',
          usage: 'Use for clickable content sections',
          examples: [
            '<div class="card">Card content</div>'
          ]
        }
      ],
      images: [
        {
          className: 'primary-image',
          description: 'Main slide image (400x300px)',
          usage: 'Use for primary visual content',
          examples: [
            '<div class="primary-image" onclick="handleImageClick(this,\'primary\')"><!-- IMAGE_PROMPT: "description" WIDTH: 800 HEIGHT: 600 --></div>'
          ]
        }
      ],
      interactive: [
        {
          className: 'metric-card',
          description: 'Statistics/metrics display card',
          usage: 'Use for displaying numerical data and statistics',
          examples: [
            '<div class="metric-card"><div class="metric-value">85</div><div class="metric-label">Score</div></div>'
          ]
        },
        {
          className: 'metrics-grid',
          description: 'Grid container for metric cards',
          usage: 'Use to organize multiple metrics',
          examples: [
            '<div class="metrics-grid"><!-- metric cards --></div>'
          ]
        }
      ],
      text: [
        {
          className: 'slide-title-main',
          description: 'Main slide title (34px font)',
          usage: 'Use for slide titles',
          examples: [
            '<div class="slide-title-main">📚 Math: Fractions and Percentages</div>'
          ]
        },
        {
          className: 'main-heading',
          description: 'Main heading with gradient (32px font)',
          usage: 'Use for primary headings',
          examples: [
            '<div class="main-heading">📚 Math: Fractions and Percentages</div>'
          ]
        },
        {
          className: 'section-heading',
          description: 'Section heading (24px font)',
          usage: 'Use for section titles',
          examples: [
            '<div class="section-heading">🎯 Learning Objectives</div>'
          ]
        },
        {
          className: 'instruction-text',
          description: 'Instruction text (20px font)',
          usage: 'Use for instructions and guidance',
          examples: [
            '<div class="instruction-text">Complete the following exercises</div>'
          ]
        },
        {
          className: 'simple-text',
          description: 'Regular text content (18px font)',
          usage: 'Use for body text and descriptions',
          examples: [
            '<div class="simple-text">This lesson covers advanced mathematical concepts.</div>'
          ]
        }
      ],
      special: [
        {
          className: 'content-table',
          description: 'Data table for structured information',
          usage: 'Use for displaying tabular data',
          examples: [
            '<table class="content-table"><thead><tr><th>Column 1</th><th>Column 2</th></tr></thead><tbody><tr><td>Data 1</td><td>Data 2</td></tr></tbody></table>'
          ]
        },
        {
          className: 'progress-bar',
          description: 'Progress indicator',
          usage: 'Use to show completion progress',
          examples: [
            '<div class="progress-bar"><div class="progress-fill" style="width: 75%"><div class="progress-text">75%</div></div></div>'
          ]
        },
        {
          className: 'timeline',
          description: 'Timeline component for sequential content',
          usage: 'Use for showing processes or historical information',
          examples: [
            '<div class="timeline"><div class="timeline-item"><div class="timeline-content">Event 1</div></div></div>'
          ]
        },
        {
          className: 'tag',
          description: 'Small label/tag element',
          usage: 'Use for categorization and labeling',
          examples: [
            '<div class="tag">Important</div>'
          ]
        },
        {
          className: 'alert',
          description: 'Alert/notification box with variants',
          usage: 'Use for important messages and notifications',
          examples: [
            '<div class="alert info">Information message</div>',
            '<div class="alert success">Success message</div>',
            '<div class="alert warning">Warning message</div>'
          ]
        }
      ]
    };
  }

  /**
   * Генерувати інструкції для ШІ на основі точних назв класів
   */
  generateAIInstructions(ageGroup: AgeGroup): string {
    const components = this.getComponentsForAge(ageGroup);
    
    let instructions = `**EXACT CSS CLASS NAMES FOR AGE GROUP ${ageGroup.toUpperCase()}:**\n\n`;
    
    // Layouts
    if (components.layouts.length > 0) {
      instructions += `**📐 LAYOUT COMPONENTS:**\n`;
      components.layouts.forEach(comp => {
        instructions += `- \`.${comp.className}\`: ${comp.description}\n`;
        instructions += `  Usage: ${comp.usage}\n`;
        instructions += `  Example: ${comp.examples[0]}\n\n`;
      });
    }

    // Buttons
    if (components.buttons.length > 0) {
      instructions += `**🔘 BUTTON COMPONENTS:**\n`;
      components.buttons.forEach(comp => {
        instructions += `- \`.${comp.className}\`: ${comp.description}\n`;
        instructions += `  Usage: ${comp.usage}\n`;
        instructions += `  Examples:\n`;
        comp.examples.forEach(example => {
          instructions += `    ${example}\n`;
        });
        instructions += `\n`;
      });
    }

    // Images
    if (components.images.length > 0) {
      instructions += `**🖼️ IMAGE COMPONENTS:**\n`;
      components.images.forEach(comp => {
        instructions += `- \`.${comp.className}\`: ${comp.description}\n`;
        instructions += `  Usage: ${comp.usage}\n`;
        instructions += `  Example: ${comp.examples[0]}\n\n`;
      });
    }

    // Interactive
    if (components.interactive.length > 0) {
      instructions += `**🎮 INTERACTIVE COMPONENTS:**\n`;
      components.interactive.forEach(comp => {
        instructions += `- \`.${comp.className}\`: ${comp.description}\n`;
        instructions += `  Usage: ${comp.usage}\n`;
        instructions += `  Examples:\n`;
        comp.examples.forEach(example => {
          instructions += `    ${example}\n`;
        });
        instructions += `\n`;
      });
    }

    // Text
    if (components.text.length > 0) {
      instructions += `**📝 TEXT COMPONENTS:**\n`;
      components.text.forEach(comp => {
        instructions += `- \`.${comp.className}\`: ${comp.description}\n`;
        instructions += `  Usage: ${comp.usage}\n`;
        instructions += `  Examples:\n`;
        comp.examples.forEach(example => {
          instructions += `    ${example}\n`;
        });
        instructions += `\n`;
      });
    }

    // Special
    if (components.special.length > 0) {
      instructions += `**✨ SPECIAL COMPONENTS:**\n`;
      components.special.forEach(comp => {
        instructions += `- \`.${comp.className}\`: ${comp.description}\n`;
        instructions += `  Usage: ${comp.usage}\n`;
        instructions += `  Examples:\n`;
        comp.examples.forEach(example => {
          instructions += `    ${example}\n`;
        });
        instructions += `\n`;
      });
    }

    instructions += `\n**⚠️ IMPORTANT RULES:**\n`;
    instructions += `1. Use EXACTLY these class names - do not modify or create new ones\n`;
    instructions += `2. Follow the usage guidelines for each component\n`;
    instructions += `3. Combine components appropriately for the age group\n`;
    instructions += `4. Always include proper onclick handlers where shown\n`;
    instructions += `5. Use IMAGE_PROMPT comments for all images as specified\n`;
    instructions += `6. VARIETY IS KEY: Use different components from all categories (layouts, buttons, images, interactive, text, special)\n`;
    instructions += `7. Don't always use the same components - explore the full range available\n`;
    instructions += `8. Special components like progress-container, reward-element, celebration-element add engagement\n`;
    instructions += `9. Background decorations make slides more visually appealing\n`;
    instructions += `10. Use template-section for organized content grouping\n`;
    instructions += `\n**🖼️ IMAGE USAGE RULES:**\n`;
    instructions += `- ONLY these components can contain images: hero-image, content-image, action-image, mini-image, h-img, giant-button, large-button\n`;
    instructions += `- DO NOT put images inside: celebration-element, reward-element, background-decoration, interactive-element, interactive-shape\n`;
    instructions += `- celebration-element should contain emoji or text: <div class="celebration-element">🎉</div>\n`;
    instructions += `- reward-element is already star-shaped, no image needed: <div class="reward-element"></div>\n`;
    instructions += `- background-decoration should contain emoji: <div class="background-decoration">✨</div>\n`;
    
    // Add age-specific text guidelines
    if (ageGroup === '2-3') {
      instructions += `\n**📝 SPECIAL TEXT RULES FOR AGE 2-3:**\n`;
      instructions += `- Use VERY SIMPLE words: maximum 1-2 words per text element\n`;
      instructions += `- Prefer single words like "Touch!", "Look!", "Good!", "Yay!", "Wow!"\n`;
      instructions += `- Add emojis to make text more visual: "Touch! 👆", "Look! 👀"\n`;
      instructions += `- Avoid complex sentences like "Touch the star" - use just "Touch!"\n`;
      instructions += `- Examples of good text: "Mom!", "Dad!", "Hello!", "Pretty!", "Big!", "Fun!"\n`;
      instructions += `- Examples of bad text: "Here is Mom", "Look at these pictures", "Both Mom and Dad love you"\n`;
      instructions += `\n**🖼️ CIRCULAR BUTTON IMAGES FOR AGE 2-3:**\n`;
      instructions += `- Images in giant-button and large-button will be automatically cropped to circular shape\n`;
      instructions += `- Use structure: <div class="large-button variant-X"><div class="image-container"><img src="..." alt="..." width="400" height="400"></div></div>\n`;
      instructions += `- Images will be perfectly centered and cropped to fit the circular button\n`;
      instructions += `- Always include onclick handlers for interactive buttons with images\n`;
      instructions += `- Example: <div class="large-button variant-2" onclick="handleGiantButton(this,'success','Hug!')"><div class="image-container"><img src="..." alt="child hugging parent" width="400" height="400"></div></div>\n`;
      instructions += `\n**🔊 CUSTOM AUDIO TEXT FOR ALL HANDLERS:**\n`;
      instructions += `- handleImageClick(this,'action','CustomText') - for images with custom speech\n`;
      instructions += `- handleInteractiveShape(this,'circle','CustomText') - for shapes with custom speech\n`;
      instructions += `- handleGiantButton(this,'success','CustomText') - for buttons with custom speech\n`;
      instructions += `- soundEffects.success(), soundEffects.interactive('variant1'), etc. - for direct sound effects\n`;
      instructions += `- If no custom text provided, default text will be used\n`;
      instructions += `- NEVER combine with manual speak() calls: onclick="handler(); speak('text')" is WRONG\n`;
      instructions += `- Use ONLY the template handlers - they handle all audio timing correctly\n`;
    }

    return instructions;
  }
}

// Singleton instance
export const componentMappingService = new ComponentMappingService();
