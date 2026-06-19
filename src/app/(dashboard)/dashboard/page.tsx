import { createClient } from '@/lib/supabase/server';
import { getDashboardData } from '@/lib/services/dashboard';
import { DashboardClient } from './dashboard-client';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const isE2E = process.env.E2E_AUTH_BYPASS_ENABLED === 'true' && cookieStore.has('e2e-mock-auth');

  if (!user && !isE2E) {
    redirect('/signin');
  }

  const userId = user?.id || 'mock-id';
  const dashboardData = await getDashboardData(userId);

  return <DashboardClient data={dashboardData} />;
}
