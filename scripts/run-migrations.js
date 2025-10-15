/**
 * Run database migrations by category
 * Usage: node scripts/run-migrations.js [category]
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

const CATEGORIES = [
  '01_initial_setup',
  '02_storage',
  '03_payments',
  '04_generation_limits',
  '05_admin_panel',
  '06_token_tracking',
  '07_features',
  '08_rls_fixes'
];

// Check environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Execute SQL file
async function runSqlFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`  📄 Running: ${fileName}`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split by ; and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { query: statement });
      if (error) {
        // If exec_sql function doesn't exist, try direct query
        const { error: directError } = await supabase.from('_').select('*').limit(0);
        if (directError && directError.message.includes('does not exist')) {
          console.error(`  ⚠️  Cannot execute via Supabase client. Use psql or Dashboard SQL Editor.`);
          console.error(`  💡 Or run: ./scripts/run-migrations.sh ${path.basename(path.dirname(filePath))}`);
          return false;
        }
        throw error;
      }
    }
    
    console.log(`  ✅ Success\n`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}\n`);
    return false;
  }
}

// Run all files in a category
async function runCategory(category) {
  const categoryPath = path.join(MIGRATIONS_DIR, category);
  
  if (!fs.existsSync(categoryPath)) {
    console.error(`❌ Category not found: ${category}`);
    process.exit(1);
  }
  
  console.log(`🚀 Running migrations for: ${category}\n`);
  
  const files = fs.readdirSync(categoryPath)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  let successCount = 0;
  
  for (const file of files) {
    const filePath = path.join(categoryPath, file);
    const success = await runSqlFile(filePath);
    if (success) successCount++;
  }
  
  console.log(`✅ Completed ${successCount}/${files.length} migration(s) for ${category}\n`);
}

// Run all migrations in order
async function runAll() {
  console.log('🚀 Running ALL migrations in order...\n');
  
  for (const category of CATEGORIES) {
    const categoryPath = path.join(MIGRATIONS_DIR, category);
    if (fs.existsSync(categoryPath)) {
      await runCategory(category);
    }
  }
  
  console.log('✅ All migrations completed!');
}

// List available categories
function listCategories() {
  console.log('📋 Available migration categories:\n');
  
  const dirs = fs.readdirSync(MIGRATIONS_DIR)
    .filter(d => fs.statSync(path.join(MIGRATIONS_DIR, d)).isDirectory())
    .filter(d => !d.startsWith('.'));
  
  for (const dir of dirs) {
    const files = fs.readdirSync(path.join(MIGRATIONS_DIR, dir))
      .filter(f => f.endsWith('.sql'));
    console.log(`  ${dir} (${files.length} files)`);
  }
  console.log('');
}

// Main
async function main() {
  const arg = process.argv[2];
  
  if (!arg) {
    console.log('Usage:');
    console.log('  node scripts/run-migrations.js all        - Run all migrations');
    console.log('  node scripts/run-migrations.js list       - List categories');
    console.log('  node scripts/run-migrations.js [category] - Run specific category');
    console.log('');
    listCategories();
    console.log('⚠️  Note: This script uses Supabase client which has limitations.');
    console.log('💡 For production, use: ./scripts/run-migrations.sh or Supabase Dashboard.');
    return;
  }
  
  switch (arg) {
    case 'all':
      await runAll();
      break;
    case 'list':
      listCategories();
      break;
    default:
      await runCategory(arg);
      break;
  }
}

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
