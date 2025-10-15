/**
 * Check if super admin exists and optionally create one
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkSuperAdmin() {
  console.log('🔍 Checking for super admin...\n');

  // Check if admin_users table exists
  const { data: tables, error: tablesError } = await supabase
    .from('admin_users')
    .select('*')
    .limit(1);

  if (tablesError) {
    console.error('❌ Error accessing admin_users table:', tablesError.message);
    console.log('\n💡 Tip: Make sure you applied the migration: supabase/migrations/20251013_admin_panel_schema.sql');
    process.exit(1);
  }

  // Get all admins
  const { data: admins, error: adminsError } = await supabase
    .from('admin_users')
    .select('user_id, role, created_at')
    .order('created_at', { ascending: true });

  if (adminsError) {
    console.error('❌ Error fetching admins:', adminsError.message);
    process.exit(1);
  }

  if (!admins || admins.length === 0) {
    console.log('⚠️  No admins found in the system!\n');
    await promptCreateSuperAdmin();
    return;
  }

  console.log(`✅ Found ${admins.length} admin(s):\n`);

  // Get user details for each admin
  for (const admin of admins) {
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(admin.user_id);
    
    if (userError) {
      console.log(`- ${admin.role.toUpperCase()}: ${admin.user_id} (User details not found)`);
    } else {
      console.log(`- ${admin.role.toUpperCase()}: ${user.email}`);
    }
  }

  // Check for super admin specifically
  const superAdmins = admins.filter(a => a.role === 'super_admin');
  
  if (superAdmins.length === 0) {
    console.log('\n⚠️  No super admin found! You need at least one super admin to manage other admins.\n');
    await promptCreateSuperAdmin();
  } else {
    console.log(`\n✅ System has ${superAdmins.length} super admin(s)`);
  }
}

async function promptCreateSuperAdmin() {
  console.log('🔧 Would you like to make yourself a super admin?\n');
  
  // Get current user from auth
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('❌ Error fetching users:', error.message);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('❌ No users found in the system. Please register first.');
    process.exit(1);
  }

  console.log('Available users:');
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email} (${user.id})`);
  });

  console.log('\n💡 To make a user super admin, run:');
  console.log('   node scripts/check-and-add-admin.js');
  console.log('\nOr manually in Supabase SQL Editor:');
  console.log(`   INSERT INTO public.admin_users (user_id, role, created_by)`);
  console.log(`   VALUES ('USER_ID_HERE', 'super_admin', 'USER_ID_HERE');`);
}

checkSuperAdmin().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

