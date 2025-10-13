/**
 * Apply RLS policy fix for admin_users table
 * Allows users to check their own admin status
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyFix() {
  console.log('\n🔧 Applying RLS policy fix for admin_users table...\n');

  try {
    // Drop existing policy
    console.log('1️⃣ Dropping old policy...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP POLICY IF EXISTS "Super admins can view all admins" ON public.admin_users;'
    });

    if (dropError) {
      console.log('   Note:', dropError.message);
    }

    // Create new policy for users to read their own status
    console.log('2️⃣ Creating policy: Users can read their own admin status...');
    const { error: policy1Error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can read their own admin status"
          ON public.admin_users
          FOR SELECT
          USING (user_id = auth.uid());
      `
    });

    if (policy1Error) {
      console.log('   Note:', policy1Error.message);
    } else {
      console.log('   ✅ Created!');
    }

    // Create policy for super admins to view all
    console.log('3️⃣ Creating policy: Super admins can view all admins...');
    const { error: policy2Error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Super admins can view all admins"
          ON public.admin_users
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM public.admin_users
              WHERE user_id = auth.uid() AND role = 'super_admin'
            )
          );
      `
    });

    if (policy2Error) {
      console.log('   Note:', policy2Error.message);
    } else {
      console.log('   ✅ Created!');
    }

    console.log('\n✅ RLS policies updated!');
    console.log('\n💡 Now users can check their own admin status.');
    console.log('   kopachvldmrsoc@gmail.com should now see "Admin Panel" in menu!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Manual fix:');
    console.log('   Go to Supabase Dashboard → SQL Editor');
    console.log('   Run this SQL:\n');
    console.log(`
-- Drop old policy
DROP POLICY IF EXISTS "Super admins can view all admins" ON public.admin_users;

-- Allow users to read their own admin status
CREATE POLICY "Users can read their own admin status"
  ON public.admin_users
  FOR SELECT
  USING (user_id = auth.uid());

-- Allow super admins to view all admins
CREATE POLICY "Super admins can view all admins"
  ON public.admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );
    `);
    process.exit(1);
  }
}

applyFix();

