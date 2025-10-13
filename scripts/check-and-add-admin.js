/**
 * Script to check admin status and optionally add user as admin
 * Usage: node scripts/check-and-add-admin.js EMAIL
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndAddAdmin(email) {
  try {
    console.log(`\n🔍 Checking admin status for: ${email}\n`);

    // Get user by email
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      process.exit(1);
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      console.log('\n💡 Available users:');
      users.users.slice(0, 5).forEach(u => {
        console.log(`   - ${u.email}`);
      });
      process.exit(1);
    }

    console.log('✅ User found:');
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}\n`);

    // Check if user is already admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (adminData) {
      console.log('✅ User is ALREADY an admin!');
      console.log(`   Role: ${adminData.role}`);
      console.log(`   Admin since: ${new Date(adminData.created_at).toLocaleString()}`);
      console.log('\n🎉 User should see "Admin Panel" in menu!\n');
      return;
    }

    if (adminError && adminError.code !== 'PGRST116') {
      console.error('❌ Error checking admin status:', adminError.message);
      process.exit(1);
    }

    console.log('⚠️  User is NOT an admin yet.\n');

    // Get first super admin to use as creator
    const { data: superAdmins } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('role', 'super_admin')
      .limit(1);

    const createdBy = superAdmins?.[0]?.user_id || user.id;

    console.log('➕ Adding user as Super Admin...\n');

    // Add user as admin
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        user_id: user.id,
        role: 'super_admin',
        created_by: createdBy
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error adding admin:', insertError.message);
      console.log('\n💡 Manual SQL command:');
      console.log(`
INSERT INTO public.admin_users (user_id, role, created_by)
VALUES ('${user.id}', 'super_admin', '${createdBy}');
      `);
      process.exit(1);
    }

    console.log('✅ User successfully added as Super Admin!');
    console.log(`   Email: ${email}`);
    console.log(`   Role: ${newAdmin.role}`);
    console.log(`   User ID: ${newAdmin.user_id}\n`);
    console.log('🎉 User will now see "Admin Panel" in menu!');
    console.log('💡 They may need to refresh the page.\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Get email from command line args
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('\nUsage: node scripts/check-and-add-admin.js EMAIL');
  console.log('Example: node scripts/check-and-add-admin.js kopachvldmrsoc@gmail.com\n');
  process.exit(1);
}

// Run the script
checkAndAddAdmin(email);

