'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Leaf, Brain, Trophy, TreePine } from 'lucide-react';

const navLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Log', href: '/log', icon: Leaf },
  { name: 'Insights', href: '/insights', icon: Brain },
  { name: 'Progress', href: '/gamification', icon: Trophy },
  { name: 'Offsets', href: '/offsets', icon: TreePine },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-surface-2 bg-surface/90 backdrop-blur-md pb-safe z-50">
      <nav className="flex items-center justify-around px-2 h-16">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
                isActive ? 'text-accent' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
