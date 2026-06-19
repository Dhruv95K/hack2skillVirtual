import Link from 'next/link';
import { Leaf, Menu } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md">
          <Leaf className="h-6 w-6 text-[#22C55E] transition-transform group-hover:scale-110" aria-hidden="true" />
          <span className="text-xl font-bold tracking-tighter font-[family-name:var(--font-fira-code)]">EcoTrack</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-2 py-1">
            Features
          </Link>
          <Link href="/signup" className={cn(buttonVariants({ variant: "default" }), "bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full font-medium")}>
            Get Started
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }))} aria-label="Open navigation menu">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Main navigation links for the application.</SheetDescription>
              <div className="flex flex-col gap-6 mt-8">
                <Link href="#features" className="text-lg font-medium text-foreground hover:text-[#22C55E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
                  Features
                </Link>
                <Link href="/signup" className={cn(buttonVariants({ variant: "default" }), "bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full w-full font-medium")}>
                  Get Started
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
