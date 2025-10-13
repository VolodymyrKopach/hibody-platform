/**
 * Script to create first Super Admin
 * Run this after applying the admin panel migration
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createFirstAdmin() {
  try {
    console.log('🔍 Looking for users in the database...\n');

    // Get all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      process.exit(1);
    }

    if (!users || users.users.length === 0) {
      console.error('❌ No users found in the database.');
      console.log('💡 Please register a user first, then run this script again.');
      process.exit(1);
    }

    // Display available users
    console.log('📋 Available users:\n');
    users.users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}\n`);
    });

    // Check if any admins already exist
    const { data: existingAdmins, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id, role, created_at');

    if (adminError && adminError.code !== 'PGRST116') {
      // PGRST116 is "table not found" which is ok
      console.warn('⚠️  Warning checking existing admins:', adminError.message);
    }

    if (existingAdmins && existingAdmins.length > 0) {
      console.log('⚠️  Existing admins found:');
      existingAdmins.forEach(admin => {
        const user = users.users.find(u => u.id === admin.user_id);
        console.log(`   - ${user?.email || 'Unknown'} (${admin.role})`);
      });
      console.log('');
    }

    // Use first user as admin
    const firstUser = users.users[0];
    console.log(`✨ Creating Super Admin for: ${firstUser.email}`);
    console.log(`   User ID: ${firstUser.id}\n`);

    // Check if this user is already an admin
    if (existingAdmins && existingAdmins.some(a => a.user_id === firstUser.id)) {
      console.log('✅ This user is already an admin!');
      process.exit(0);
    }

    // Create admin user
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        user_id: firstUser.id,
        role: 'super_admin',
        created_by: firstUser.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating admin:', insertError.message);
      console.log('\n💡 Manual SQL command:');
      console.log(`
INSERT INTO public.admin_users (user_id, role, created_by)
VALUES ('${firstUser.id}', 'super_admin', '${firstUser.id}');
      `);
      process.exit(1);
    }

    console.log('✅ Super Admin created successfully!\n');
    console.log('📊 Admin details:');
    console.log(`   Email: ${firstUser.email}`);
    console.log(`   Role: ${newAdmin.role}`);
    console.log(`   User ID: ${newAdmin.user_id}\n`);
    console.log('🚀 You can now access the admin panel at: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the script
createFirstAdmin();

