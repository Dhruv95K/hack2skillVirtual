import type { Metadata } from 'next';
import { BarChart3, Leaf, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard | EcoTrack',
  description: 'Your personal carbon footprint dashboard.',
};

const QUICK_ITEMS = [
  {
    icon: Leaf,
    title: 'Baseline saved',
    description: 'Your onboarding answers are ready to power future recommendations.',
  },
  {
    icon: BarChart3,
    title: 'Tracking hub',
    description: 'This route is ready for the full dashboard slice to build on top of it.',
  },
  {
    icon: Sparkles,
    title: 'Next up',
    description: 'Activity logging, charts, and insights can now safely target /dashboard.',
  },
] as const;

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent/80">
            EcoTrack
          </p>
          <h1 className="font-heading text-3xl font-semibold text-white md:text-4xl">
            Dashboard
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            Your onboarding flow is complete. This placeholder keeps authenticated
            redirects and quiz verification grounded until the dedicated dashboard slice
            replaces it.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {QUICK_ITEMS.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-xl border border-white/10 bg-surface/70 px-4 py-5 backdrop-blur-sm"
            >
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Icon className="size-5" />
              </div>
              <h2 className="text-sm font-semibold text-white">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
