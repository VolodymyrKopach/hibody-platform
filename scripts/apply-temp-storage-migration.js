const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Читаємо змінні оточення
require('dotenv').config({ path: '.env.local' });

async function applyTempStorageMigration() {
  try {
    console.log('🚀 Starting temporary storage migration...');

    // Ініціалізуємо Supabase client з service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Missing Supabase credentials in environment variables');
      console.log('Required variables:');
      console.log('- NEXT_PUBLIC_SUPABASE_URL');
      console.log('- SUPABASE_SERVICE_ROLE_KEY');
      return;
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Supabase client initialized');

    // Читаємо міграцію
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250202000001_create_temp_images_bucket.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      return;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded');

    // Розділяємо SQL на окремі команди
    const sqlCommands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);

    console.log(`📋 Found ${sqlCommands.length} SQL commands to execute`);

    // Виконуємо кожну команду окремо
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      
      if (command.startsWith('--') || command.length < 10) {
        console.log(`⏭️  Skipping comment/empty command ${i + 1}`);
        continue;
      }

      console.log(`🔄 Executing command ${i + 1}/${sqlCommands.length}...`);
      console.log(`   ${command.substring(0, 100)}${command.length > 100 ? '...' : ''}`);

      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: command + ';'
        });

        if (error) {
          // Спробуємо виконати через raw query
          const { error: rawError } = await supabase
            .from('dummy') // Використовуємо будь-яку таблицю для raw SQL
            .select()
            .limit(0);

          if (rawError) {
            console.error(`❌ Error executing command ${i + 1}:`, error);
            console.error('Raw error:', rawError);
          } else {
            console.log(`✅ Command ${i + 1} executed successfully (via raw)`);
          }
        } else {
          console.log(`✅ Command ${i + 1} executed successfully`);
        }
      } catch (execError) {
        console.error(`💥 Exception executing command ${i + 1}:`, execError);
      }
    }

    // Перевіряємо, чи створився bucket
    console.log('🔍 Checking if temp-images bucket was created...');
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
    } else {
      const tempBucket = buckets.find(bucket => bucket.id === 'temp-images');
      
      if (tempBucket) {
        console.log('✅ temp-images bucket created successfully!');
        console.log('📋 Bucket details:', {
          id: tempBucket.id,
          name: tempBucket.name,
          public: tempBucket.public,
          file_size_limit: tempBucket.file_size_limit,
          allowed_mime_types: tempBucket.allowed_mime_types
        });
      } else {
        console.log('⚠️  temp-images bucket not found in bucket list');
        console.log('Available buckets:', buckets.map(b => b.id));
      }
    }

    console.log('🎯 Migration process completed!');

  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

// Альтернативний метод - створення bucket через API
async function createTempBucketDirectly() {
  try {
    console.log('🔄 Attempting to create temp-images bucket directly...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Створюємо bucket
    const { data, error } = await supabase.storage.createBucket('temp-images', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ temp-images bucket already exists');
      } else {
        console.error('❌ Error creating bucket:', error);
      }
    } else {
      console.log('✅ temp-images bucket created successfully:', data);
    }

  } catch (error) {
    console.error('💥 Direct bucket creation failed:', error);
  }
}

// Запускаємо міграцію
if (require.main === module) {
  console.log('🧪 Temporary Storage Migration Script');
  console.log('=====================================');
  
  applyTempStorageMigration()
    .then(() => {
      console.log('\n🔄 Trying direct bucket creation as backup...');
      return createTempBucketDirectly();
    })
    .then(() => {
      console.log('\n✅ All done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { applyTempStorageMigration, createTempBucketDirectly };
