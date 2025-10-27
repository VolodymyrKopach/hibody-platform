// Utility functions for color handling

/**
 * Converts hex color to Ukrainian color name
 */
export function getColorNameInUkrainian(hexColor: string): string {
  const color = hexColor.toLowerCase();
  
  // Red tones
  if (color.match(/#ff[0-6][0-9a-f]{3}|#[ef][0-9a-f][0-6][0-9a-f]{3}|#dc143c|#b22222|#8b0000/)) {
    return 'Червоним';
  }
  
  // Pink tones
  if (color.match(/#ff[6-9a-f][6-9a-f][6-9a-f][6-9a-f]|#ffc0cb|#ffb6c1|#ff69b4|#ff1493/)) {
    return 'Рожевим';
  }
  
  // Orange tones
  if (color.match(/#ff[8-9a-f][0-5][0-9a-f]{2}|#ffa500|#ff8c00|#ff7f50/)) {
    return 'Помаранчевим';
  }
  
  // Yellow tones
  if (color.match(/#ff[d-f][0-9a-f]{3}|#ffff[0-9a-f]{2}|#ffd700|#ffffe0/)) {
    return 'Жовтим';
  }
  
  // Green tones
  if (color.match(/#[0-5][0-9a-f][0-9a-f][0-5][0-9a-f]{2}|#00ff00|#00fa9a|#32cd32|#228b22|#006400|#4caf50/)) {
    return 'Зеленим';
  }
  
  // Blue tones
  if (color.match(/#[0-6][0-9a-f][0-9a-f][8-9a-f][0-9a-f]{2}|#0000ff|#1e90ff|#4169e1|#87ceeb|#00bfff|#2196f3/)) {
    return 'Синім';
  }
  
  // Purple/Violet tones
  if (color.match(/#[6-9a-f][0-5][0-9a-f][6-9a-f][0-9a-f]{2}|#800080|#9370db|#9c27b0|#8b008b|#9400d3/)) {
    return 'Фіолетовим';
  }
  
  // Brown tones
  if (color.match(/#[6-9a-f][0-6][0-4][0-9a-f]{3}|#8b4513|#a0522d|#d2691e|#8d6e63/)) {
    return 'Коричневим';
  }
  
  // Gray tones
  if (color.match(/#[7-9a-c][0-9a-f]{5}|#808080|#a9a9a9|#d3d3d3/)) {
    return 'Сірим';
  }
  
  // Black
  if (color.match(/#0{6}|#[0-3][0-9a-f]{5}/)) {
    return 'Чорним';
  }
  
  // White
  if (color.match(/#f{6}|#[d-f][0-9a-f]{5}/)) {
    return 'Білим';
  }
  
  // Default
  return 'Кольоровим';
}

/**
 * Gets color emoji based on hex color (deprecated - now using color circle)
 */
export function getColorEmoji(hexColor: string): string {
  const color = hexColor.toLowerCase();
  
  if (color.match(/#ff[0-6][0-9a-f]{3}|#[ef][0-9a-f][0-6][0-9a-f]{3}/)) return '🔴';
  if (color.match(/#ff[6-9a-f]{4}|#ffc0cb|#ffb6c1/)) return '🩷';
  if (color.match(/#ff[8-9a-f][0-5][0-9a-f]{2}|#ffa500/)) return '🟠';
  if (color.match(/#ff[d-f][0-9a-f]{3}|#ffff[0-9a-f]{2}/)) return '🟡';
  if (color.match(/#[0-5][0-9a-f]{5}|#00ff00|#32cd32/)) return '🟢';
  if (color.match(/#[0-6][0-9a-f]{2}[8-9a-f][0-9a-f]{2}|#0000ff/)) return '🔵';
  if (color.match(/#[6-9a-f][0-5][0-9a-f]{2}[6-9a-f]{2}|#800080/)) return '🟣';
  if (color.match(/#[6-9a-f][0-6][0-4][0-9a-f]{3}|#8b4513/)) return '🟤';
  if (color.match(/#0{6}|#[0-3][0-9a-f]{5}/)) return '⚫';
  if (color.match(/#f{6}|#[d-f][0-9a-f]{5}/)) return '⚪';
  
  return '⭕';
}

