import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Bolt, CarFront, Leaf, Utensils } from 'lucide-react';

import { QuizStepper } from '@/components/quiz/quiz-stepper';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Your Carbon Footprint Quiz | EcoTrack',
  description:
    'Answer a few quick questions so EcoTrack can estimate your baseline footprint and personalize your dashboard.',
};

const STEP_SUMMARY = [
  {
    icon: CarFront,
    title: 'Transport',
    description: 'Daily travel habits and flight frequency.',
  },
  {
    icon: Utensils,
    title: 'Food',
    description: 'Diet choices and weekly meat consumption.',
  },
  {
    icon: Bolt,
    title: 'Home Energy',
    description: 'Home size and monthly electricity usage.',
  },
] as const;

export default async function QuizPage() {
  const cookieStore = await cookies();
  const isE2EAuthBypassEnabled = process.env.E2E_AUTH_BYPASS_ENABLED === 'true';
  const isE2E = isE2EAuthBypassEnabled && cookieStore.has('e2e-mock-auth');
  const isE2EQuizComplete =
    isE2EAuthBypassEnabled && cookieStore.has('e2e-quiz-complete');

  if (isE2EQuizComplete) {
    redirect('/dashboard');
  }

  if (!isE2E) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/signin');
    }

    const quizResponseCount = await prisma.quizResponse.count({
      where: { userId: user.id },
    });

    if (quizResponseCount > 0) {
      redirect('/dashboard');
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <section className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
            <Leaf className="size-4" />
            First-time setup
          </div>

          <div className="space-y-3">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Your Carbon Footprint Quiz
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
              Answer seven quick questions across transport, food, and home energy.
              We&apos;ll estimate your starting footprint, save your baseline, and tailor
              the rest of EcoTrack around the choices that matter most.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {STEP_SUMMARY.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-white/10 bg-surface/70 px-4 py-4 backdrop-blur-sm"
              >
                <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Icon className="size-5" />
                </div>
                <h2 className="text-sm font-semibold text-white">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <QuizStepper />
      </div>
    </main>
  );
}
