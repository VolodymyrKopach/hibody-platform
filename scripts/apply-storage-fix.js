#!/usr/bin/env node

/**
 * Скрипт для застосування виправлень RLS політик Supabase Storage
 * Виправляє проблему 403 Unauthorized при завантаженні файлів
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ініціалізація Supabase клієнта з service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Помилка: Відсутні змінні середовища NEXT_PUBLIC_SUPABASE_URL або SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyStorageFix() {
  console.log('🔧 Застосування виправлень RLS політик для Storage...\n');

  const queries = [
    // Видаляємо старі політики
    `DROP POLICY IF EXISTS "Users can upload their own lesson assets" ON storage.objects;`,
    `DROP POLICY IF EXISTS "Users can view their own lesson assets" ON storage.objects;`,
    `DROP POLICY IF EXISTS "Users can update their own lesson assets" ON storage.objects;`,
    `DROP POLICY IF EXISTS "Users can delete their own lesson assets" ON storage.objects;`,
    `DROP POLICY IF EXISTS "Public access to lesson thumbnails" ON storage.objects;`,
    
    // Створюємо нові політики
    `CREATE POLICY "Users can upload lesson assets" ON storage.objects
     FOR INSERT WITH CHECK (
       bucket_id = 'lesson-assets' AND (
         auth.uid()::text = (storage.foldername(name))[1] OR
         (storage.foldername(name))[1] = 'lesson-thumbnails' OR
         (storage.foldername(name))[1] = 'lessons'
       )
     );`,
     
    `CREATE POLICY "Users can view lesson assets" ON storage.objects
     FOR SELECT USING (
       bucket_id = 'lesson-assets' AND (
         auth.uid()::text = (storage.foldername(name))[1] OR
         (storage.foldername(name))[1] = 'lesson-thumbnails' OR
         (storage.foldername(name))[1] = 'lessons'
       )
     );`,
     
    `CREATE POLICY "Users can update lesson assets" ON storage.objects
     FOR UPDATE USING (
       bucket_id = 'lesson-assets' AND (
         auth.uid()::text = (storage.foldername(name))[1] OR
         (storage.foldername(name))[1] = 'lesson-thumbnails' OR
         (storage.foldername(name))[1] = 'lessons'
       )
     );`,
     
    `CREATE POLICY "Users can delete lesson assets" ON storage.objects
     FOR DELETE USING (
       bucket_id = 'lesson-assets' AND (
         auth.uid()::text = (storage.foldername(name))[1] OR
         (storage.foldername(name))[1] = 'lesson-thumbnails' OR
         (storage.foldername(name))[1] = 'lessons'
       )
     );`,
     
    `CREATE POLICY "Public access to lesson files" ON storage.objects
     FOR SELECT USING (
       bucket_id = 'lesson-assets' AND (
         (storage.foldername(name))[1] = 'lesson-thumbnails' OR
         (storage.foldername(name))[1] = 'lessons'
       )
     );`
  ];

  let success = 0;
  let errors = 0;

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`${i + 1}/${queries.length} Виконання запиту...`);
    console.log(`📝 ${query.substring(0, 80)}...`);
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      
      if (error) {
        console.error(`❌ Помилка: ${error.message}`);
        errors++;
      } else {
        console.log(`✅ Успішно виконано`);
        success++;
      }
    } catch (err) {
      console.error(`❌ Критична помилка: ${err.message}`);
      errors++;
    }
    
    console.log('');
  }

  console.log(`\n📊 Результати:`);
  console.log(`✅ Успішно: ${success}`);
  console.log(`❌ Помилки: ${errors}`);

  if (errors === 0) {
    console.log(`\n🎉 Всі RLS політики Storage успішно оновлено!`);
    console.log(`\n📝 Тепер ви можете завантажувати файли в:`);
    console.log(`   - lesson-thumbnails/{lessonId}/...`);
    console.log(`   - lessons/{lessonId}/...`);
    console.log(`   - {userId}/...`);
  } else {
    console.log(`\n⚠️ Деякі операції завершилися з помилками. Перевірте логи вище.`);
  }
}

// Головна функція
async function main() {
  try {
    await applyStorageFix();
  } catch (error) {
    console.error('❌ Критична помилка:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 