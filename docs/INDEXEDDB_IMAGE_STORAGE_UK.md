# IndexedDB для зберігання зображень

## 🎯 Вирішена проблема

Раніше зображення зберігалися як Base64 рядки в `localStorage`, що спричиняло:
- ❌ **QuotaExceededError** - Base64 на ~33% більший за оригінал
- ❌ **Проблеми з продуктивністю** - Великі рядки сповільнюють серіалізацію
- ❌ **Обмеження storage** - localStorage обмежений ~5MB

## ✅ Рішення: IndexedDB

### Чому IndexedDB?

| Функція | localStorage | IndexedDB |
|---------|--------------|-----------|
| **Ліміт** | ~5MB | 50% диска (GB) |
| **Типи даних** | Тільки рядки | Blob, File, об'єкти |
| **Продуктивність** | Синхронно | Асинхронно |
| **Overhead** | Base64 (+33%) | Бінарні дані (0%) |
| **API** | Простий | Складніший |

### Приклад порівняння

**Те саме зображення 2MB:**
- localStorage (Base64): ~2.7MB рядок
- IndexedDB (Blob): 2MB бінарні дані

**Ємність:**
- localStorage: ~1-2 зображення до переповнення
- IndexedDB: Сотні зображень

## 🏗️ Архітектура

### 1. Утиліта для зберігання (`imageStorage.ts`)

```typescript
// Зберегти зображення
const imageId = await storeImage(blob, 'photo.jpg');
// Повертає: "img_1696243200000_abc123"

// Отримати зображення
const blob = await getImage(imageId);

// Отримати Blob URL для <img>
const blobUrl = await getImageURL(imageId);
// Повертає: "blob:http://localhost:3000/abc-123-def"

// Очистити всі зображення
await clearAllImages();
```

### 2. Оновлений LocalImageService

```typescript
// СТАРЕ: Base64 Data URL
{
  url: 'data:image/jpeg;base64,/9j/4AAQ...', // Величезний рядок
  fileName: 'photo.jpg',
  size: 2700000 // Розмір Base64
}

// НОВЕ: Blob URL + IndexedDB ID
{
  url: 'blob:http://localhost:3000/abc-123',  // Маленьке посилання
  imageId: 'img_1696243200000_abc123',        // IndexedDB ID
  fileName: 'photo.jpg',
  size: 2000000 // Оригінальний розмір
}
```

### 3. Автоматичне очищення

Зображення автоматично видаляються при виході з canvas:

```typescript
// При розмонтуванні компонента
useEffect(() => {
  return () => {
    clearAllWorksheets();
    await clearAllImages(); // Очистити IndexedDB
  };
}, []);

// При закритті вікна
window.addEventListener('beforeunload', () => {
  clearAllImages();
});

// При натисканні "Назад"
const handleBackClick = async () => {
  clearAllWorksheets();
  await clearAllImages();
  router.push('/');
};
```

## 📊 Технічні деталі

### Схема IndexedDB

```
База даних: worksheet_images
Версія: 1

ObjectStore: images
  KeyPath: id
  Індекси:
    - createdAt (не унікальний)

Структура запису:
{
  id: string,           // "img_1696243200000_abc123"
  blob: Blob,          // Бінарні дані зображення
  filename: string,     // "photo.jpg"
  mimeType: string,     // "image/jpeg"
  size: number,         // 2000000
  createdAt: number     // 1696243200000
}
```

### Потік зберігання

```
Користувач завантажує зображення
      ↓
Стиснення якщо > 500KB
      ↓
Зберегти Blob в IndexedDB
      ↓
Отримати IndexedDB ID
      ↓
Створити Blob URL
      ↓
Повернути URL + ID до компонента
      ↓
Компонент використовує Blob URL в <img src={url} />
```

### Стиснення

Зображення більші за 500KB стискаються:

```typescript
if (file.size > 500 * 1024) {
  // Стиснути через canvas
  const compressedDataUrl = await compressImage(file, maxWidth);
  
  // Конвертувати назад у Blob
  const response = await fetch(compressedDataUrl);
  const blob = await response.blob();
  
  // Зберегти стиснутий Blob
  await storeImage(blob, filename);
}
```

Налаштування якості:
- Файли > 2MB: 70% якість
- Файли < 2MB: 85% якість

## 🎨 Приклади використання

### Зберегти зображення з input

```typescript
import { localImageService } from '@/services/images/LocalImageService';

const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const result = await localImageService.uploadLocalImage(file, {
    compress: true,
    maxWidth: 1920
  });

  if (result.success) {
    // Використати result.url в <img>
    setImageUrl(result.url);
    
    // Зберегти result.imageId для посилання
    setImageId(result.imageId);
  }
};
```

### Відобразити зображення

```typescript
// Blob URLs працюють так само як звичайні URLs
<img src={imageUrl} alt="Завантажене" />
```

### Отримати статистику storage

```typescript
import { getStorageStats } from '@/utils/imageStorage';

const stats = await getStorageStats();
console.log(`${stats.count} зображень використовують ${stats.formattedSize}`);
// Приклад: "5 зображень використовують 12.4MB"
```

### Очистити всі зображення

```typescript
import { clearAllImages } from '@/utils/imageStorage';

await clearAllImages();
console.log('Всі зображення очищені з IndexedDB');
```

## 🔄 Міграція з Base64

### Зворотна сумісність

Сервіс підтримує зворотну сумісність:

```typescript
// Перевірити чи URL є Blob або Base64
if (localImageService.isBlobUrl(url)) {
  // Сучасне: Blob URL з IndexedDB
  console.log('Використовується IndexedDB');
} else if (localImageService.isBase64DataUrl(url)) {
  // Старе: Base64 Data URL
  console.log('Використовується старий Base64 формат');
}
```

### Шлях міграції

1. **Старі worksheets** з Base64 зображеннями продовжують працювати
2. **Нові завантаження** автоматично використовують IndexedDB
3. **Без втрати даних** під час переходу

## 🚀 Переваги

### Продуктивність

- ✅ **Швидше завантаження**: Немає Base64 encoding overhead
- ✅ **Швидше отримання**: Бінарні дані швидші за парсинг рядків
- ✅ **Менше пам'яті**: Blob об'єкти ефективніші

### Storage

- ✅ **В 10-100 разів більша ємність**: GB замість MB
- ✅ **Без quota errors**: Набагато вищі ліміти
- ✅ **Краще стиснення**: Зберігаємо стиснуті Blobs

### User Experience

- ✅ **Плавніше редагування**: Без попереджень про storage
- ✅ **Більше зображень**: Завантажити десятки зображень
- ✅ **Швидший експорт**: Прямий Blob → PDF

## 🔧 API Довідник

### imageStorage.ts

```typescript
// Зберегти зображення в IndexedDB
storeImage(blob: Blob, filename: string): Promise<string>

// Отримати зображення з IndexedDB
getImage(id: string): Promise<Blob | null>

// Отримати Blob URL для відображення
getImageURL(id: string): Promise<string | null>

// Видалити конкретне зображення
deleteImage(id: string): Promise<void>

// Отримати всі збережені зображення
getAllImages(): Promise<ImageRecord[]>

// Очистити всі зображення
clearAllImages(): Promise<void>

// Отримати статистику storage
getStorageStats(): Promise<{
  count: number;
  totalSize: number;
  formattedSize: string;
}>

// Видалити всю базу даних
deleteDatabase(): Promise<void>
```

### LocalImageService

```typescript
// Завантажити зображення (зберігає в IndexedDB)
uploadLocalImage(
  file: File,
  options?: {
    compress?: boolean;
    maxWidth?: number;
  }
): Promise<LocalImageUploadResult>

// Перевірити типи URL
isBlobUrl(url: string): boolean
isBase64DataUrl(url: string): boolean

// Отримати статистику storage
estimateStorageUsage(): Promise<{
  imageCount: number;
  totalSize: number;
  formattedSize: string;
}>

// Очистити storage
clearStorage(): Promise<void>
```

## 🧪 Тестування

### Ручний тест

1. Відкрити Canvas Editor
2. Завантажити кілька великих зображень (2-3MB кожне)
3. Перевірити консоль: "✅ Image stored in IndexedDB"
4. Переконатися що немає QuotaExceededError
5. Закрити canvas - зображення мають очиститися
6. Відкрити знову - storage має бути порожнім

### Перевірка storage

```javascript
// В консолі браузера
const stats = await getStorageStats();
console.log(stats);
// { count: 5, totalSize: 12400000, formattedSize: "12.4MB" }
```

### Очистити storage

```javascript
// В консолі браузера
await clearAllImages();
console.log('Очищено!');
```

## 📝 Примітки

### Підтримка браузерів

- ✅ Chrome, Edge, Firefox, Safari
- ✅ iOS Safari, Chrome Mobile
- ❌ IE11 (не підтримується)

### Безпека

- IndexedDB прив'язаний до origin (як localStorage)
- Дані зберігаються локально на пристрої користувача
- Очищаються коли користувач чистить дані браузера
- Автоматично очищаються при виході з canvas

### Обмеження

- Blob URLs потрібно revoke для звільнення пам'яті
- IndexedDB асинхронний (потрібен await)
- Не доступний між вкладками легко

### Майбутні покращення

1. **Автоматичний cleanup Blob URLs**: Відстежувати та revoke невикористані URLs
2. **Генерація thumbnails**: Зберігати маленькі preview
3. **Background sync**: Синхронізувати з Supabase у фоні
4. **Моніторинг quota**: Попереджати користувачів перед лімітом
5. **Опції стиснення**: Дозволити користувачам вибирати якість

---

**Статус**: ✅ Впроваджено та протестовано  
**Дата**: 2 жовтня 2025  
**Версія**: 1.0.0  
**Breaking Changes**: Немає (зворотно сумісно)

