const fs = require('fs');
const path = require('path');

// Читаємо SQL файли міграцій
const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');

console.log('🚀 Запуск міграцій Supabase...\n');

// Список файлів міграцій у правильному порядку
const migrationFiles = [
  '001_initial_schema.sql',
  '002_rls_policies.sql'
];

console.log('📋 Файли для виконання:');
migrationFiles.forEach((file, index) => {
  console.log(`${index + 1}. ${file}`);
});

console.log('\n📝 Інструкції для запуску:');
console.log('1. Відкрийте Supabase Dashboard: https://app.supabase.com');
console.log('2. Перейдіть до вашого проекту');
console.log('3. Відкрийте SQL Editor');
console.log('4. Виконайте файли в наступному порядку:\n');

migrationFiles.forEach((file, index) => {
  const filePath = path.join(migrationsDir, file);
  
  if (fs.existsSync(filePath)) {
    console.log(`\n=== ${index + 1}. ${file} ===`);
    console.log(`Файл: ${filePath}`);
    console.log('Статус: ✅ Готовий до виконання');
    
    // Читаємо перші кілька рядків для перевірки
    const content = fs.readFileSync(filePath, 'utf8');
    const firstLines = content.split('\n').slice(0, 5).join('\n');
    console.log('Початок файлу:');
    console.log('```sql');
    console.log(firstLines);
    console.log('```');
  } else {
    console.log(`\n=== ${index + 1}. ${file} ===`);
    console.log('Статус: ❌ Файл не знайдено');
  }
});

console.log('\n🔧 Альтернативний спосіб через Supabase CLI:');
console.log('Якщо у вас встановлений Supabase CLI, виконайте:');
console.log('```bash');
console.log('supabase db reset');
console.log('supabase db push');
console.log('```');

console.log('\n✅ Після виконання міграцій:');
console.log('1. Перевірте, що всі таблиці створені');
console.log('2. Перевірте RLS політики');
console.log('3. Запустіть npm run dev для тестування');

console.log('\n📊 Очікувані таблиці:');
const expectedTables = [
  'user_profiles',
  'lessons', 
  'slides',
  'slide_images',
  'chat_sessions',
  'chat_messages',
  'subscription_usage',
  'lesson_shares',
  'lesson_ratings'
];

expectedTables.forEach(table => {
  console.log(`- ${table}`);
});

console.log('\n🔐 Очікувані RLS політики:');
console.log('- Користувачі можуть читати/писати тільки свої дані');
console.log('- Публічні уроки доступні всім для читання');
console.log('- Адміни мають повний доступ'); 