'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { OFFSET_PROGRAMS } from '@/lib/offsets';

type OffsetProgram = typeof OFFSET_PROGRAMS[number];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

function OffsetsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-l-4 border-accent bg-surface/95 ring-white/8">
          <CardHeader className="gap-2">
            <Skeleton className="h-6 w-1/2 bg-white/10" />
            <Skeleton className="h-4 w-full bg-white/10" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 bg-white/10" />
              <Skeleton className="h-5 w-16 bg-white/10" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function OffsetsClient() {
  const [programs, setPrograms] = useState<OffsetProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const response = await fetch('/api/offsets');
        if (!response.ok) {
          throw new Error('Failed to fetch offsets');
        }
        const data = await response.json();
        setPrograms(data.programs || []);
      } catch (error) {
        console.error('[offsets] fetch error', error);
        toast.error('Failed to load carbon offset programs.');
      } finally {
        setLoading(false);
      }
    }
    fetchPrograms();
  }, []);

  if (loading) {
    return <OffsetsSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial={shouldReduceMotion ? 'visible' : 'hidden'}
      animate="visible"
      className="grid gap-4 lg:grid-cols-2"
    >
      {programs.map((program) => (
        <motion.div key={program.name} variants={shouldReduceMotion ? undefined : cardVariants}>
          <Card className="flex h-full flex-col border-l-4 border-accent bg-surface/95 ring-white/8">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-xl font-bold">{program.name}</CardTitle>
                <Badge variant="outline" className="shrink-0 bg-white/5">
                  {program.category}
                </Badge>
              </div>
              <CardDescription className="text-muted-foreground mt-2">
                {program.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Impact:</span>
                <Badge
                  className={
                    program.impact === 'High'
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20'
                  }
                  variant="outline"
                >
                  {program.impact}
                </Badge>
              </div>
            </CardContent>
            <CardFooter>
              <a 
                href={program.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: 'secondary' }), "w-full gap-2")}
              >
                Visit Website <ExternalLink className="size-4" />
              </a>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
