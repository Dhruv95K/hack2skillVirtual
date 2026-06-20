'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Brain, Clock3, Leaf, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { InsightCard } from '@/components/insights/insight-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
const SKELETON_COUNT = 3;
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
};
function formatTimestamp(value) {
  if (!value) {
    return null;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}
function InsightsSkeleton() {
  return <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({
      length: SKELETON_COUNT
    }).map((_, index) => <Card key={index} className="border-l-4 border-accent bg-surface/95 ring-white/8">
          <CardHeader className="gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-1 items-start gap-3">
                <Skeleton className="size-11 rounded-2xl bg-white/10" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
                  <Skeleton className="h-5 w-3/4 bg-white/10" />
                </div>
              </div>
              <Skeleton className="h-5 w-32 rounded-full bg-emerald-500/20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-4 w-5/6 bg-white/10" />
            <Skeleton className="h-4 w-2/3 bg-white/10" />
          </CardContent>
        </Card>)}
    </div>;
}
export function InsightsPageClient() {
  const shouldReduceMotion = useReducedMotion();
  const [tips, setTips] = useState([]);
  const [message, setMessage] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const lastGeneratedLabel = useMemo(() => formatTimestamp(generatedAt), [generatedAt]);
  const loadSavedInsights = useCallback(async () => {
    try {
      const response = await fetch('/api/insights', {
        method: 'GET',
        cache: 'no-store'
      });
      if (response.status === 401) {
        window.location.href = '/signin';
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Unable to load saved insights.');
      }
      const data = await response.json();
      setTips((data.tips ?? []).slice(0, 5));
      setGeneratedAt(data.generatedAt ?? null);
      setMessage((data.tips ?? []).length > 0 ? null : data.message ?? 'Generate personalized tips from your latest activity logs.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load saved insights.');
      setMessage('Generate personalized tips from your latest activity logs.');
    } finally {
      setIsBootstrapping(false);
    }
  }, []);
  const handleGenerateInsights = useCallback(async () => {
    setIsGenerating(true);
    setMessage(null);
    try {
      const response = await fetch('/api/insights', {
        method: 'POST'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to generate insights right now.');
      }
      const nextTips = (data.tips ?? []).slice(0, 5);
      setTips(nextTips);
      setGeneratedAt(nextTips.length > 0 ? new Date().toISOString() : generatedAt);
      setMessage(data.message ?? null);
      if (nextTips.length > 0) {
        toast.success('Fresh AI insights generated.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to generate insights right now.');
    } finally {
      setIsGenerating(false);
    }
  }, [generatedAt]);
  useEffect(() => {
    loadSavedInsights();
  }, [loadSavedInsights]);
  return <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:px-6">
      <section className="rounded-3xl border border-white/8 bg-surface/95 px-6 py-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.9)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-200">
              <Brain className="size-4" />
              Gemini-powered recommendations
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-3xl font-semibold text-white md:text-4xl">
                AI Insights
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                Turn your latest footprint data into practical, category-specific moves you can make this week.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <Button onClick={handleGenerateInsights} disabled={isGenerating || isBootstrapping} className="cursor-pointer bg-emerald-600 px-4 text-white hover:bg-emerald-500">
              {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Generate New Insights
            </Button>

            <div aria-live="polite" className="flex min-h-5 items-center gap-2 text-xs text-slate-400">
              <Clock3 className="size-3.5" />
              {lastGeneratedLabel ? `Last generated ${lastGeneratedLabel}` : 'No saved insights yet'}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="bg-surface/95 text-white ring-white/8">
          <CardHeader className="gap-3">
            <CardTitle className="text-xl text-white">Personalized reduction tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {isBootstrapping || isGenerating ? <InsightsSkeleton /> : tips.length > 0 ? <motion.div variants={shouldReduceMotion ? undefined : containerVariants} initial={shouldReduceMotion ? undefined : 'hidden'} animate={shouldReduceMotion ? undefined : 'visible'} className="grid gap-4 lg:grid-cols-2">
                {tips.slice(0, 5).map(tip => <InsightCard key={`${tip.category}-${tip.title}`} {...tip} />)}
              </motion.div> : <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 px-5 py-10 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-200">
                  <Leaf className="size-5" />
                </div>
                <p className="text-base font-medium text-white">
                  {message ?? 'Log some activities first'}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Track a few transport, food, or energy activities and EcoTrack will turn them into tailored recommendations.
                </p>
              </div>}
          </CardContent>
        </Card>

        <Card className="bg-surface/95 text-white ring-white/8">
          <CardHeader className="gap-3">
            <CardTitle className="text-xl text-white">How these are generated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
            <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4">
              EcoTrack looks at your 20 most recent activity logs, totals each emissions category, and asks Gemini for 3-5 practical next steps tied to the biggest source.
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4">
              Each tip includes an estimated CO2 saving so you can compare which habits are worth trying first.
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4">
              New insights overwrite older suggestions in spirit, not in history. The most recent saved set stays available the next time you open this page.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>;
}