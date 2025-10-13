/**
 * Test RLS policies for admin_users table
 * Tests if the user can read their own admin status
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

async function testAdminRLS() {
  try {
    console.log('\n🧪 Testing Admin RLS Policies\n');
    console.log('Testing as: kopachvldmrsoc@gmail.com\n');

    // Create client with anon key (same as frontend)
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Sign in as the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'kopachvldmrsoc@gmail.com',
      password: process.env.TEST_USER_PASSWORD || 'your-password-here'
    });

    if (authError) {
      console.error('❌ Auth error:', authError.message);
      console.log('\n💡 You need to set TEST_USER_PASSWORD in .env.local or provide password');
      console.log('   Or test manually in browser console:\n');
      console.log('   const { data } = await supabase.from("admin_users").select("*").eq("user_id", "639c628d-e725-45e6-ac57-782898cb20b5");');
      process.exit(1);
    }

    console.log('✅ Authenticated successfully');
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}\n`);

    // Test 1: Check if can read own admin status
    console.log('Test 1: Reading own admin status...');
    const { data: adminData1, error: error1 } = await supabase
      .from('admin_users')
      .select('id, role, user_id')
      .eq('user_id', authData.user.id)
      .single();

    console.log('Result:', {
      data: adminData1,
      error: error1?.message,
      code: error1?.code
    });

    if (error1) {
      console.log('\n❌ ERROR: Cannot read own admin status!');
      console.log('   This means RLS policies are blocking the read.\n');
      console.log('💡 Solution: Check RLS policies on admin_users table');
      console.log('   Expected policy: Allow users to read their own admin record\n');
    } else {
      console.log('\n✅ SUCCESS: Can read own admin status!');
      console.log(`   Role: ${adminData1?.role}\n`);
    }

    // Test 2: Check if can read all admins (should fail for regular admin)
    console.log('Test 2: Reading all admins...');
    const { data: adminData2, error: error2 } = await supabase
      .from('admin_users')
      .select('id, role, user_id');

    console.log('Result:', {
      count: adminData2?.length || 0,
      error: error2?.message,
      code: error2?.code
    });

    if (error2) {
      console.log('\n⚠️  Cannot read all admins (expected for regular admin)');
    } else {
      console.log(`\n✅ Can read ${adminData2?.length} admin(s)`);
    }

    // Test 3: Use the helper function
    console.log('\nTest 3: Using is_admin() function...');
    const { data: isAdminResult, error: error3 } = await supabase
      .rpc('is_admin', { check_user_id: authData.user.id });

    console.log('Result:', {
      isAdmin: isAdminResult,
      error: error3?.message
    });

    if (error3) {
      console.log('\n❌ ERROR: is_admin() function failed!');
    } else {
      console.log(`\n✅ is_admin() returned: ${isAdminResult}`);
    }

    // Sign out
    await supabase.auth.signOut();
    console.log('\n✅ Test completed!\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Check if password provided
if (!process.env.TEST_USER_PASSWORD) {
  console.log('\n⚠️  Warning: TEST_USER_PASSWORD not set in .env.local');
  console.log('   Add this line to .env.local:');
  console.log('   TEST_USER_PASSWORD=your-password-here\n');
  console.log('   OR test manually in browser console after login:\n');
  console.log('   Copy this code to browser console:');
  console.log('   ----------------------------------------');
  console.log(`
   const supabase = window.supabase || (await import('/path/to/supabase')).createClient();
   const user = await supabase.auth.getUser();
   console.log('Current user:', user.data.user?.email);
   
   const { data, error } = await supabase
     .from('admin_users')
     .select('*')
     .eq('user_id', user.data.user?.id)
     .single();
   
   console.log('Admin check result:', { data, error });
  `);
  console.log('   ----------------------------------------\n');
  process.exit(0);
}

testAdminRLS();

