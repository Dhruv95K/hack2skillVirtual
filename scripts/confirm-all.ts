import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  for (const user of users.users) {
    if (!user.email_confirmed_at) {
      console.log(`Confirming user: ${user.email}`);
      await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true });
    }
  }
  console.log('All done');
}

main();
