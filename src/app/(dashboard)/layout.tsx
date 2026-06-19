import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/signin');
  }

  const dbUser = await prisma.user.findUnique({ 
    where: { id: user.id },
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
