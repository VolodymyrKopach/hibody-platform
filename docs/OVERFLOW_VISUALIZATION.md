# Overflow Visualization System

## Проблема

Коли контент не вміщається на сторінку worksheet, він раніше обрізався (`overflow: hidden`), і користувач не міг побачити, наскільки контент виходить за межі сторінки.

## Рішення

Змінено поведінку overflow на `overflow: visible` з додаванням візуального індикатора для покращення UX.

---

## Що було змінено

### 1. Canvas Page Overflow

**File:** `src/components/worksheet/canvas/CanvasPage.tsx`

#### До:
```typescript
<Paper
  sx={{
    position: 'relative',
    width,
    height,
    overflow: 'hidden', // ❌ Контент обрізався
  }}
>
```

#### Після:
```typescript
<Paper
  sx={{
    position: 'relative',
    width,
    height,
    overflow: 'visible', // ✅ Контент виходить за межі сторінки
  }}
>
  {/* Overflow Visual Indicator */}
  {!isDropTarget && (
    <Box
      data-overflow-indicator
      sx={{
        position: 'absolute',
        bottom: -10,
        left: 0,
        right: 0,
        height: '10px',
        background: `linear-gradient(to bottom, transparent, ${alpha(theme.palette.warning.main, 0.2)})`,
        borderRadius: '0 0 8px 8px',
        pointerEvents: 'none',
        opacity: 0.8,
        zIndex: -1,
      }}
    />
  )}
</Paper>
```

---

## Візуальний Індикатор Overflow

### Мета

Показати користувачу, що контент виходить за межі сторінки, без необхідності прокрутки.

### Характеристики

1. **Позиція:** Під нижнім краєм сторінки (`bottom: -10px`)
2. **Колір:** Warning color з прозорістю (`warning.main` з `opacity: 0.2`)
3. **Градієнт:** Від прозорого до кольору (`linear-gradient(to bottom, transparent, color)`)
4. **Висота:** 10px
5. **z-index:** -1 (за контентом, але видимий)
6. **Pointer Events:** none (не перешкоджає взаємодії)

### Умовний Рендеринг

Індикатор **не показується**, коли:
- Сторінка є drop target (`isDropTarget === true`)
- Експортується PDF (має `data-overflow-indicator` атрибут для фільтрації)

---

## Переваги

### ✅ 1. Видимість Overflow

**До:**
```
┌─────────────────┐
│ Page Content    │
│ More content    │
│ [hidden content]│ ← Не видно!
└─────────────────┘
```

**Після:**
```
┌─────────────────┐
│ Page Content    │
│ More content    │
│ Visible content │ ← Видно!
│ More overflow   │
└─────────────────┘
  (warning glow)    ← Візуальний індикатор
```

### ✅ 2. Розуміння Проблеми

Користувач **одразу бачить**:
- Що контент виходить за межі
- Наскільки контент виходить за межі
- Де потрібно коригувати пагінацію

### ✅ 3. Не Заважає Роботі

- **Pointer events: none** → Індикатор не перешкоджає кліку
- **z-index: -1** → За контентом, не перекриває
- **Условний рендеринг** → Не показується при drag-and-drop

### ✅ 4. Експорт-Friendly

- `data-overflow-indicator` атрибут дозволяє фільтрувати при експорті
- PDF/Print не включає індикатор
- Тільки візуальна допомога в редакторі

---

## Використання

### Автоматичне Відображення

Індикатор відображається автоматично для всіх сторінок. Не потрібні додаткові налаштування.

### Приклад Сценарію

**Ситуація:** Користувач додає великий fill-blank exercise, який не вміщується на сторінку.

**До змін:**
```
1. Користувач додає exercise
2. Exercise обрізається в кінці сторінки
3. Користувач не розуміє, чому вправа не повна
4. 😕 Плутанина
```

**Після змін:**
```
1. Користувач додає exercise
2. Exercise виходить за межі сторінки (видно overflow)
3. Під сторінкою з'являється warning gradient
4. Користувач бачить, що контент не вміщається
5. 💡 Користувач може:
   - Зменшити розмір контенту
   - Перемістити частину на іншу сторінку
   - Додати нову сторінку
6. ✅ Проблема зрозуміла та вирішена
```

---

## Інтеграція з Smart Pagination

Overflow visualization працює разом з [Enhanced Smart Pagination](./ENHANCED_SMART_PAGINATION.md):

### 1. Пагінація Запобігає Overflow

Smart Pagination намагається:
- Групувати контент логічно
- Переносити елементи на нову сторінку, якщо не вміщаються
- Тримати activity blocks разом

### 2. Overflow Показує Проблеми

Якщо Smart Pagination не змогла запобігти overflow (наприклад, один великий atomic компонент):
- Overflow visualization показує проблему
- Користувач може вручну виправити

### 3. Користувач Контролює

```
Smart Pagination (Автоматична)
           ↓
   [Контент розподілений]
           ↓
    Overflow є?
    ├─ Ні → ✅ Все ОК
    └─ Так → ⚠️ Overflow Indicator
              ↓
         Користувач бачить проблему
              ↓
         Ручне коригування
```

---

## Технічні Деталі

### CSS Properties

```typescript
{
  position: 'absolute',    // Не впливає на layout
  bottom: -10,             // 10px під сторінкою
  left: 0,                 // Повна ширина
  right: 0,
  height: '10px',          // Тонкий індикатор
  background: `linear-gradient(to bottom, transparent, ${alpha(theme.palette.warning.main, 0.2)})`,
  borderRadius: '0 0 8px 8px', // Округлені кути знизу
  pointerEvents: 'none',   // Не блокує клікі
  opacity: 0.8,            // Напівпрозорий
  zIndex: -1,              // За контентом
}
```

### Data Attributes

```typescript
data-overflow-indicator  // Для фільтрації при експорті
```

### Theme Integration

Використовує Material-UI theme:
```typescript
theme.palette.warning.main  // Колір попередження
alpha(color, 0.2)           // Прозорість 20%
```

---

## Export Handling

### PDF Export

При експорті в PDF індикатор **не включається**:

```typescript
// В export функції
const elementsToHide = [
  '[data-page-header]',
  '[data-drop-indicator]',
  '[data-overflow-indicator]', // ← Фільтрується
];

elementsToHide.forEach(selector => {
  elements = elements.filter(el => !el.matches(selector));
});
```

### Print

При друку індикатор також **не відображається** через CSS:

```css
@media print {
  [data-overflow-indicator] {
    display: none !important;
  }
}
```

---

## Майбутні Покращення

### 1. Dynamic Indicator

Показувати індикатор **тільки якщо реально є overflow**:

```typescript
const [hasOverflow, setHasOverflow] = useState(false);

useEffect(() => {
  if (pageRef.current) {
    const pageHeight = pageRef.current.offsetHeight;
    const contentHeight = pageRef.current.scrollHeight;
    setHasOverflow(contentHeight > pageHeight);
  }
}, [elements]);

{hasOverflow && !isDropTarget && (
  <Box data-overflow-indicator sx={{...}} />
)}
```

### 2. Overflow Measurement

Показувати **скільки** контенту виходить за межі:

```typescript
{hasOverflow && (
  <Box data-overflow-indicator>
    <Typography variant="caption">
      +{overflowAmount}px overflow
    </Typography>
  </Box>
)}
```

### 3. Overflow Direction Indicators

Показувати overflow не тільки знизу, але й збоку (якщо контент виходить за ширину):

```typescript
{/* Bottom overflow */}
{hasOverflow.bottom && <Box sx={{...}} />}

{/* Right overflow */}
{hasOverflow.right && <Box sx={{...}} />}
```

### 4. Clickable Indicator

Дозволити користувачу клікнути на індикатор для дій:

```typescript
<Box
  onClick={() => {
    // Автоматично створити нову сторінку
    // і перенести overflow контент
  }}
  sx={{
    cursor: 'pointer',
    '&:hover': {
      opacity: 1,
      background: `linear-gradient(to bottom, transparent, ${alpha(theme.palette.warning.main, 0.4)})`,
    }
  }}
>
  <Tooltip title="Click to move overflow to new page">
    <Box>Overflow indicator</Box>
  </Tooltip>
</Box>
```

### 5. Interactive Overflow Preview

При hover на індикатор показувати preview overflow контенту:

```typescript
<Popover
  anchorEl={indicatorRef.current}
  open={isHovering}
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'center',
  }}
>
  <Box sx={{ p: 2, maxWidth: 300 }}>
    <Typography variant="caption">
      Overflow Content Preview:
    </Typography>
    {/* Truncated preview of overflow content */}
  </Box>
</Popover>
```

---

## Testing

### Manual Testing

1. **Create Worksheet:**
   - Go to Worksheet Generator
   - Generate worksheet with multiple elements

2. **Add Large Content:**
   - Add several fill-blank exercises
   - Add large tables
   - Add long text blocks

3. **Check Overflow:**
   - Content should extend beyond page bounds (visible)
   - Warning gradient should appear under page
   - Gradient should NOT appear during drag-and-drop

4. **Export Test:**
   - Export to PDF
   - Verify overflow indicator is NOT in PDF
   - Content should still be visible in PDF (as separate pages if needed)

### Automated Testing (Future)

```typescript
describe('Overflow Visualization', () => {
  it('should show overflow indicator when content exceeds page height', () => {
    // Add content that exceeds page height
    // Assert indicator is visible
  });

  it('should hide overflow indicator during drag-and-drop', () => {
    // Start drag-and-drop
    // Assert indicator is hidden
  });

  it('should not include overflow indicator in PDF export', () => {
    // Export to PDF
    // Assert data-overflow-indicator elements are filtered
  });
});
```

---

## Висновок

Overflow Visualization System забезпечує:

✅ **Видимість проблем** - Користувач бачить, що контент не вміщається
✅ **Розуміння масштабу** - Видно, наскільки контент виходить за межі
✅ **Не заважає роботі** - Індикатор не перешкоджає взаємодії
✅ **Export-friendly** - Не включається в PDF/Print
✅ **Працює з Smart Pagination** - Доповнює автоматичну пагінацію

**Ключовий принцип:** Показати користувачу реальну картину, не приховувати проблеми, дати можливість свідомо виправити.

### Порівняння підходів:

| Підхід | Переваги | Недоліки |
|--------|----------|----------|
| **Overflow: Hidden** | Чистий вигляд | ❌ Проблеми приховані |
| **Overflow: Auto (scroll)** | Весь контент доступний | ❌ Незручно для preview |
| **Overflow: Visible** ✅ | Проблеми видимі | Може виглядати "неохайно" |
| **Visible + Indicator** ✅✅ | Проблеми видимі + візуальне попередження | None! |

**Наше рішення:** Overflow: Visible + Warning Indicator = Найкращий баланс!

