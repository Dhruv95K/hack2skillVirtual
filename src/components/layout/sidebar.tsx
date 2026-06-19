'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Leaf, Brain, Trophy, TreePine, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  user: {
    name: string;
    email: string;
  } | null;
}

const navLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Log Activity', href: '/log', icon: Leaf },
  { name: 'Insights', href: '/insights', icon: Brain },
  { name: 'Gamification', href: '/gamification', icon: Trophy },
  { name: 'Offsets', href: '/offsets', icon: TreePine },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/signin');
    router.refresh();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-surface-2 bg-surface">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-heading font-bold text-white">
          <Leaf className="w-6 h-6 text-accent" />
          EcoTrack
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                isActive 
                  ? 'bg-surface-2 text-accent font-medium' 
                  : 'text-muted-foreground hover:text-white hover:bg-surface-2'
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-surface-2 mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar>
              <AvatarFallback className="bg-accent/20 text-accent font-heading">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>
      )}
    </aside>
  );
}
