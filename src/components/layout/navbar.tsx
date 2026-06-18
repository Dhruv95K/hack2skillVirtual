import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="w-full bg-background border-b border-border/40 py-4 px-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <span className="font-heading font-bold text-xl tracking-tight text-primary">EcoTrack</span>
      </Link>
    </nav>
  );
}
