import { createClient } from '@/lib/supabase/server';
import { getDashboardData } from '@/lib/services/dashboard';
import { DashboardClient } from './dashboard-client';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const dashboardData = await getDashboardData(user.id);

  return <DashboardClient data={dashboardData} />;
}
