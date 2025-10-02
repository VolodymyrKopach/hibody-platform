# Page Background - Quick Test Guide 🎨

## Швидкий тест (2 хвилини)

### ✅ Тест 1: Швидкі пресети з Header
1. Відкрий Canvas Editor
2. Натисни на іконку **🎨 Palette** в header
3. Вибери "Light Blue"
4. **Очікуваний результат**: Всі сторінки стають блакитними

### ✅ Тест 2: Застосування до однієї сторінки
1. Клікни на **Page 1** (вибери її)
2. Натисни **🎨 Palette** в header
3. Вибери "Cream"
4. **Очікуваний результат**: Тільки Page 1 стає кремовою

### ✅ Тест 3: Properties Panel
1. Вибери **Page 2**
2. У правому сайдбарі знайди **"Background"** секцію
3. Клікни на зелений пресет
4. **Очікуваний результат**: Page 2 стає зеленою

### ✅ Тест 4: Custom Color
1. Вибери **Page 3**
2. У Properties Panel → Background
3. Використай **Custom Color picker**
4. Вибери фіолетовий
5. **Очікуваний результат**: Page 3 стає фіолетовою

### ✅ Тест 5: Keyboard Shortcut
1. Натисни **Cmd+B** (Mac) або **Ctrl+B** (Windows)
2. **Очікуваний результат**: Відкривається Background menu
3. Вибери колір
4. **Очікуваний результат**: Колір застосовується

### ✅ Тест 6: Export з фоном
1. Встанови різні фони для кожної сторінки
2. Натисни **Export → Export All as PDF**
3. Відкрий PDF
4. **Очікуваний результат**: PDF містить всі фони

---

## Що перевірити

- [ ] Іконка Palette є в header
- [ ] Tooltip показує "Page Background (Ctrl+B)"
- [ ] Меню відкривається по кліку
- [ ] 6 пресетів відображаються коректно
- [ ] Checkmark на активному кольорі
- [ ] Hover ефект (scale) працює
- [ ] Properties panel показує Background секцію
- [ ] Custom color picker працює
- [ ] Немає infinite loops при зміні кольору
- [ ] Export включає фони
- [ ] Kbd shortcut працює

---

## Можливі проблеми

### Проблема: "Maximum update depth exceeded"
**Рішення**: Вже виправлено - використовується `onBlur` замість `onChange` для color picker

### Проблема: Фон не застосовується
**Перевір**:
- Чи обрана сторінка?
- Чи функція `handlePageBackgroundUpdate` викликається?
- Чи оновлюється state `pages`?

### Проблема: Фон не експортується
**Перевір**:
- Чи CSS background застосовується до Paper компонента?
- Чи `getBackgroundStyle()` повертає правильний CSS?

---

## Швидкі команди

```bash
# Запустити dev server
npm run dev

# Відкрити Canvas Editor
http://localhost:3000/worksheet-editor

# Перевірити в консолі
console.log('Current pages:', pages);
```

---

## Успіх! 🎉

Якщо всі тести пройшли - фіча працює ідеально!

