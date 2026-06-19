import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const isE2E = process.env.E2E_AUTH_BYPASS_ENABLED === 'true' && cookieStore.has('e2e-mock-auth');
  
  if (!user && !isE2E) {
    redirect('/signin');
  }

  const userId = user?.id || 'e2e-user';
  const dbUser = isE2E ? { name: 'E2E User', email: 'e2e@example.com' } : await prisma.user.findUnique({ 
    where: { id: userId },
    select: { name: true, email: true }
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar user={dbUser} />
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0 relative">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
