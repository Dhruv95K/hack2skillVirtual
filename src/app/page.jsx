import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
export const metadata = {
  title: 'EcoTrack — Track & Reduce Your Carbon Footprint',
  description: 'Understand, track, and reduce your personal carbon footprint with AI-powered insights and gamified challenges.'
};
export default function LandingPage() {
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Hero />
        <Features />

        {/* CTA Section */}
        <section className="py-24 bg-surface-2">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-[family-name:var(--font-fira-code)] text-foreground">
              Ready to make a difference?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join EcoTrack today and start taking actionable steps towards a more sustainable lifestyle. Every small choice matters.
            </p>
            <Link href="/signup" className={cn(buttonVariants({
            size: "lg"
          }), "bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-2xl h-14 px-10 text-lg font-medium shadow-lg shadow-[#22C55E]/20")}>
              Create Your Free Account
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background py-10 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
          <div>
            &copy; {new Date().getFullYear()} EcoTrack. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <span>Made for Hack2Skill Virtual</span>
            <span aria-hidden="true" className="select-none">&bull;</span>
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm inline-flex items-center gap-1" aria-label="View source on GitHub">
              <span className="font-bold">GitHub</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>;
}