'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { buttonVariants } from '@/components/ui/button';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40 bg-background text-center">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden text-[#22C55E]/10">
        <motion.svg
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 2, repeat: shouldReduceMotion ? 0 : Infinity, repeatType: "reverse", ease: "easeInOut" }}
          viewBox="0 0 1440 320"
          className="absolute bottom-0 w-full h-auto"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M0,160L48,176C96,192,192,224,288,208C384,192,480,128,576,133.3C672,139,768,213,864,229.3C960,245,1056,203,1152,181.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </motion.svg>
        <motion.svg
          initial={{ opacity: 0, rotate: shouldReduceMotion ? 0 : -10 }}
          animate={{ opacity: 0.5, rotate: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 3, repeat: shouldReduceMotion ? 0 : Infinity, repeatType: "reverse", ease: "easeInOut", delay: shouldReduceMotion ? 0 : 1 }}
          className="absolute -top-10 -left-10 w-64 h-64 text-[#16A34A]/20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </motion.svg>
      </div>

      <div className="container relative z-10 mx-auto px-4 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 font-[family-name:var(--font-fira-code)] text-foreground">
            Understand & Reduce Your <span className="text-[#22C55E]">Carbon Footprint</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-[family-name:var(--font-fira-sans)]">
            Track your daily impact across transport, food, and energy. Get AI-powered insights and take meaningful action for the planet.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-2xl h-14 px-8 text-lg w-full sm:w-auto font-medium")}>
              Start for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="#features" className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "rounded-2xl h-14 px-8 text-lg w-full sm:w-auto font-medium hover:text-[#22C55E]")}>
              See how it works <ArrowDown className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-border/50 w-full max-w-4xl"
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-foreground font-[family-name:var(--font-fira-code)]">500+</span>
            <span className="text-sm text-muted-foreground mt-1">users</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-foreground font-[family-name:var(--font-fira-code)]">10k+</span>
            <span className="text-sm text-muted-foreground mt-1">activities logged</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-[#22C55E] font-[family-name:var(--font-fira-code)]">1000+</span>
            <span className="text-sm text-muted-foreground mt-1">kg CO₂ saved</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
