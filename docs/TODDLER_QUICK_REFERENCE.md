# 🚀 Quick Reference: UI/UX для 2-5 років

> Швидкий довідник для розробників - все найважливіше на одній сторінці

---

## 🎯 Правило 7x150

- **150px** - мінімальний розмір інтерактивних елементів
- **24px** - мінімальний розмір шрифту
- **32px** - мінімальний gap між елементами
- **40px** - мінімальний padding контейнера
- **24px** - мінімальний border-radius
- **700** - мінімальна жирність шрифту
- **300ms** - максимальний час реакції

---

## 🎨 Copy-Paste Snippets

### Контейнер для малюків

```typescript
<Box sx={{
  // Background
  background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 30%, #FFE4B5 60%, #F0E68C 100%)',
  
  // Spacing
  p: 5,              // 40px padding
  minHeight: 500,
  
  // Shape
  borderRadius: 4,   // 32px
  
  // Pattern overlay
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.3) 2px, transparent 2px)',
    backgroundSize: '50px 50px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  
  position: 'relative',
  overflow: 'hidden',
}}>
  {children}
</Box>
```

### Велика кнопка з анімацією

```typescript
<motion.div
  animate={{
    scale: [1, 1.1, 1],
    y: [0, -8, 0],
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
  whileTap={{ scale: 0.9 }}
>
  <Button
    onClick={() => {
      soundService.playTap();
      triggerHaptic('light');
      onTap();
    }}
    sx={{
      minWidth: 150,
      minHeight: 150,
      fontSize: 60,
      borderRadius: 32,
      fontWeight: 700,
      background: 'linear-gradient(135deg, #FFE5F1 0%, #FF6B9D 100%)',
      boxShadow: '0 12px 24px rgba(255, 182, 193, 0.4)',
    }}
  >
    {emoji}
  </Button>
</motion.div>
```

### Декоративні елементи фону

```typescript
{/* Animated cloud */}
<motion.div
  animate={{
    x: [0, 20, 0],
    opacity: [0.15, 0.25, 0.15],
  }}
  transition={{
    duration: 5,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
  style={{
    position: 'absolute',
    top: 20,
    left: 30,
    fontSize: '50px',
    pointerEvents: 'none',
    zIndex: 0,
  }}
>
  ☁️
</motion.div>

{/* Twinkling star */}
<motion.div
  animate={{
    scale: [1, 1.2, 1],
    opacity: [0.15, 0.3, 0.15],
    rotate: [0, 15, 0],
  }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
  style={{
    position: 'absolute',
    top: 40,
    right: 40,
    fontSize: '35px',
    pointerEvents: 'none',
    zIndex: 0,
  }}
>
  ⭐
</motion.div>
```

### Інструкції БЕЗ тексту

```typescript
{/* Drop here → */}
<motion.div
  animate={{
    y: [0, -8, 0],
    scale: [1, 1.1, 1],
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
  }}
  style={{
    textAlign: 'center',
    marginBottom: '24px',
  }}
>
  <Box sx={{ fontSize: '80px', lineHeight: 1 }}>
    ⬇️⬇️⬇️
  </Box>
</motion.div>

{/* Drag these → */}
<motion.div
  animate={{
    y: [0, 8, 0],
    scale: [1, 1.1, 1],
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
  }}
  style={{
    textAlign: 'center',
    marginBottom: '24px',
  }}
>
  <Box sx={{ fontSize: '80px', lineHeight: 1 }}>
    ⬆️⬆️⬆️
  </Box>
</motion.div>

{/* You can do it → */}
<motion.div
  animate={{
    scale: [1, 1.2, 1],
    rotate: [0, 5, -5, 0],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
  }}
  style={{
    textAlign: 'center',
    marginTop: '16px',
  }}
>
  <Box sx={{ fontSize: '60px', lineHeight: 1 }}>
    💪✨🎉
  </Box>
</motion.div>
```

### Success Celebration

```typescript
const handleSuccess = () => {
  // 1. Visual
  setShowSuccess(true);
  
  // 2. Haptic
  triggerHaptic('success');
  
  // 3. Sound
  soundService.playSuccess();
  
  // 4. Confetti
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#FF6B9D', '#FFD93D', '#4DABF7', '#51CF66'],
  });
  
  // 5. Floating stars
  setFloatingStars(Array.from({ length: 5 }, (_, i) => i));
};
```

### Typography для малюків

```typescript
<Typography
  sx={{
    fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif",
    fontSize: 28,
    fontWeight: 700,
    color: '#FF6B9D',
    textAlign: 'center',
    lineHeight: 1.5,
  }}
>
  Молодець! 🎉
</Typography>
```

---

## 🎨 Кольорові палітри (Copy-Paste)

```typescript
// Rainbow gradient
background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 30%, #FFE4B5 60%, #F0E68C 100%)'

// Candy gradient
background: 'linear-gradient(135deg, #FFE5F1 0%, #E3F2FD 50%, #FFF9C4 100%)'

// Sunset gradient
background: 'linear-gradient(135deg, #FFE5B4 0%, #FFB7B2 50%, #E6B8FF 100%)'

// Soft pink box
backgroundColor: '#FFE5F1'
borderColor: '#FF6B9D'

// Soft yellow box
backgroundColor: '#FFF9C4'
borderColor: '#FFD93D'

// Soft blue box
backgroundColor: '#E3F2FD'
borderColor: '#4DABF7'
```

---

## 📏 Розміри (константи)

```typescript
const TODDLER = {
  // Elements
  BUTTON_SIZE: 150,
  ITEM_SIZE: 150,
  TARGET_SIZE: 180,
  IMAGE_SIZE: 200,
  
  // Spacing
  PADDING: 40,
  GAP: 32,
  MARGIN: 24,
  
  // Typography
  FONT_SIZE: 28,
  FONT_WEIGHT: 700,
  EMOJI_SIZE: 60,
  GIANT_EMOJI: 80,
  
  // Shape
  BORDER_RADIUS: 32,
  BORDER_WIDTH: 4,
  
  // Timing
  ANIMATION_FAST: 300,
  ANIMATION_MEDIUM: 600,
  ANIMATION_SLOW: 1500,
  FEEDBACK_DELAY: 100,
};
```

---

## ✅ Швидкий чеклист

Перед коммітом перевір:

```
[ ] Розмір інтерактивних елементів ≥ 150px
[ ] Padding контейнера ≥ 40px
[ ] Gap між елементами ≥ 32px
[ ] Border radius ≥ 24px
[ ] Font size ≥ 24px, weight ≥ 700
[ ] Яскравий градієнт фон (не сірий!)
[ ] Comic Sans шрифт для toddler mode
[ ] Idle animations на важливих елементах
[ ] Sound + haptic feedback на кліках
[ ] Confetti на success
[ ] Емоджі замість тексту
[ ] Декоративні елементи на фоні
[ ] М'які пастельні тіні (не чорні)
```

---

## 🚫 Топ-5 помилок

### ❌ 1. Малі елементи

```typescript
// Погано
minWidth: 80,
minHeight: 80,

// Добре
minWidth: 150,
minHeight: 150,
```

### ❌ 2. Сірий фон

```typescript
// Погано
backgroundColor: 'grey.50',

// Добре
background: 'linear-gradient(135deg, #FFE5F1 0%, #E3F2FD 100%)',
```

### ❌ 3. Тонкий шрифт

```typescript
// Погано
fontSize: 14,
fontWeight: 400,

// Добре
fontSize: 28,
fontWeight: 700,
fontFamily: "'Comic Sans MS', cursive",
```

### ❌ 4. Без анімацій

```typescript
// Погано
<Button onClick={handleClick}>Click</Button>

// Добре
<motion.div
  animate={{ scale: [1, 1.1, 1] }}
  transition={{ duration: 1.5, repeat: Infinity }}
  whileTap={{ scale: 0.9 }}
>
  <Button onClick={handleClick}>👆</Button>
</motion.div>
```

### ❌ 5. Без feedback

```typescript
// Погано
onClick={() => doSomething()}

// Добре
onClick={() => {
  soundService.playTap();
  triggerHaptic('light');
  doSomething();
}}
```

---

## 🎭 Idle Animations Library

```typescript
// Bounce
const bounce = {
  animate: { y: [0, -15, 0], scale: [1, 1.05, 1] },
  transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
};

// Wiggle
const wiggle = {
  animate: { rotate: [-5, 5, -5, 0], scale: [1, 1.05, 1.05, 1] },
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
};

// Pulse
const pulse = {
  animate: { scale: [1, 1.15, 1], opacity: [1, 0.8, 1] },
  transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
};

// Float
const float = {
  animate: { y: [0, -10, 0], x: [0, 5, 0] },
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
};
```

---

## 📱 Responsive Breakpoints

```typescript
// Малюки використовують в основному tablets та великі телефони
sx={{
  // Mobile (мінімум)
  minWidth: { xs: 120, sm: 150 },
  fontSize: { xs: 50, sm: 60 },
  
  // Tablet (оптимально)
  minWidth: { md: 180 },
  fontSize: { md: 80 },
  
  // Desktop (максимум, рідко)
  minWidth: { lg: 200 },
  fontSize: { lg: 100 },
}}
```

---

## 🔗 Корисні лінки

- [Повна документація](./UI_UX_GUIDELINES_TODDLERS.md)
- [Приклади компонентів](./TODDLER_DRAG_DROP_GUIDE.md)
- [Готові теми](./TODDLER_DRAG_DROP_EXAMPLES.json)

---

**Пам'ятайте:** Якщо здається "забагато" - це якраз добре для малюків! 🎨✨

