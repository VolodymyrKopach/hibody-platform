/**
 * HTML Minifier Utility
 * Агресивно мінімізує HTML для зменшення кількості токенів при відправці до AI API
 */

export interface MinifyOptions {
  removeComments?: boolean;
  removeEmptyAttributes?: boolean;
  collapseWhitespace?: boolean;
  minifyCSS?: boolean;
  minifyJS?: boolean;
  preserveLineBreaks?: boolean;
}

/**
 * Агресивно мінімізує HTML для максимального зменшення токенів
 */
export function minifyHTML(html: string, options: MinifyOptions = {}): string {
  const {
    removeComments = true,
    removeEmptyAttributes = true,
    collapseWhitespace = true,
    minifyCSS = true,
    minifyJS = true,
    preserveLineBreaks = false
  } = options;

  let minified = html;

  if (removeComments) {
    // Видаляємо HTML коментарі
    minified = minified.replace(/<!--[\s\S]*?-->/g, '');
    // Видаляємо CSS коментарі
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
    // Видаляємо JS коментарі (однорядкові)
    minified = minified.replace(/\/\/.*$/gm, '');
  }

  if (collapseWhitespace) {
    // Видаляємо зайві пробіли, табуляції та переноси рядків
    minified = minified.replace(/\s+/g, ' ');
    // Видаляємо пробіли навколо тегів
    minified = minified.replace(/>\s+</g, '><');
    // Видаляємо пробіли після відкриваючих тегів
    minified = minified.replace(/(<[^>]+>)\s+/g, '$1');
    // Видаляємо пробіли перед закриваючими тегами
    minified = minified.replace(/\s+(<\/[^>]+>)/g, '$1');
  }

  if (minifyCSS) {
    // Видаляємо пробіли навколо знаків = в атрибутах
    minified = minified.replace(/\s*=\s*/g, '=');
    // Видаляємо пробіли навколо : в CSS
    minified = minified.replace(/\s*:\s*/g, ':');
    // Видаляємо пробіли навколо ; в CSS
    minified = minified.replace(/\s*;\s*/g, ';');
    // Видаляємо пробіли навколо { } в CSS
    minified = minified.replace(/\s*{\s*/g, '{');
    minified = minified.replace(/\s*}\s*/g, '}');
    // Видаляємо пробіли навколо , в CSS
    minified = minified.replace(/\s*,\s*/g, ',');
    
    // Мінімізуємо CSS в style тегах
    minified = minified.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
      const minifiedCSS = css
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s+/g, ' ')
        // Видаляємо зайві пробіли навколо операторів
        .replace(/\s*\+\s*/g, '+')
        .replace(/\s*-\s*/g, '-')
        .replace(/\s*\*\s*/g, '*')
        .replace(/\s*\/\s*/g, '/')
        // Видаляємо зайві пробіли в calc()
        .replace(/calc\(\s*/g, 'calc(')
        .replace(/\s*\)/g, ')')
        // Скорочуємо hex кольори (#ffffff -> #fff)
        .replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3')
        // Видаляємо зайві нулі (0.5 -> .5, 0px -> 0)
        .replace(/\b0+(\.\d+)/g, '$1')
        .replace(/\b0+(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)\b/g, '0')
        .trim();
      return match.replace(css, minifiedCSS);
    });
    
    // Додаткова мінімізація inline стилів
    minified = minified.replace(/style="([^"]*?)"/g, (match, styles) => {
      const minifiedStyles = styles
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*,\s*/g, ',')
        // Скорочуємо hex кольори
        .replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3')
        // Видаляємо зайві нулі
        .replace(/\b0+(\.\d+)/g, '$1')
        .replace(/\b0+(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)\b/g, '0')
        .trim();
      return `style="${minifiedStyles}"`;
    });
  }

  // Очищаємо атрибути class та style від зайвих пробілів
  minified = minified.replace(/class="([^"]*?)"/g, (match, classes) => {
    return `class="${classes.replace(/\s+/g, ' ').trim()}"`;
  });
  
  minified = minified.replace(/style="([^"]*?)"/g, (match, styles) => {
    return `style="${styles.replace(/\s+/g, ' ').trim()}"`;
  });

  if (removeEmptyAttributes) {
    // Видаляємо порожні атрибути
    minified = minified.replace(/\s+[a-zA-Z-]+=""\s*/g, ' ');
    // Видаляємо зайві атрибути, які не впливають на функціональність
    minified = minified.replace(/\s+data-[a-zA-Z-]+="\s*"\s*/g, ' ');
    // Видаляємо порожні title атрибути
    minified = minified.replace(/\s+title="\s*"\s*/g, ' ');
    // Видаляємо порожні alt атрибути (але залишаємо alt="" для доступності)
    minified = minified.replace(/\s+alt="\s+"\s*/g, ' alt=""');
  }

  // Видаляємо зайві пробіли на початку та в кінці
  minified = minified.trim();

  if (!preserveLineBreaks) {
    // Видаляємо порожні рядки
    minified = minified.replace(/\n\s*\n/g, '\n');
    // Видаляємо всі переноси рядків якщо не потрібно їх зберігати
    minified = minified.replace(/\n/g, '');
  }

  return minified;
}

/**
 * Розраховує економію токенів після мінімізації
 */
export function calculateTokenSavings(original: string, minified: string): {
  originalLength: number;
  minifiedLength: number;
  savedCharacters: number;
  savedPercentage: number;
  estimatedTokenSavings: number;
} {
  const originalLength = original.length;
  const minifiedLength = minified.length;
  const savedCharacters = originalLength - minifiedLength;
  const savedPercentage = (savedCharacters / originalLength) * 100;
  
  // Приблизна оцінка токенів (1 токен ≈ 4 символи для англійського тексту)
  const estimatedTokenSavings = Math.floor(savedCharacters / 4);

  return {
    originalLength,
    minifiedLength,
    savedCharacters,
    savedPercentage: Math.round(savedPercentage * 100) / 100,
    estimatedTokenSavings
  };
}

/**
 * Швидка мінімізація для AI API (максимальна економія токенів)
 */
export function minifyForAI(html: string): string {
  return minifyHTML(html, {
    removeComments: true,
    removeEmptyAttributes: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    preserveLineBreaks: false
  });
}

/**
 * М'яка мінімізація (зберігає читабельність)
 */
export function minifyGentle(html: string): string {
  return minifyHTML(html, {
    removeComments: true,
    removeEmptyAttributes: true,
    collapseWhitespace: true,
    minifyCSS: false,
    minifyJS: false,
    preserveLineBreaks: true
  });
}
