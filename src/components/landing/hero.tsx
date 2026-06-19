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
      {/* Decorative background shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 2, repeat: shouldReduceMotion ? 0 : Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#22C55E] blur-[120px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1.1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 3, repeat: shouldReduceMotion ? 0 : Infinity, repeatType: "reverse", ease: "easeInOut", delay: shouldReduceMotion ? 0 : 1 }}
          className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#16A34A] blur-[100px]"
        />
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
            <span className="text-sm text-muted-foreground mt-1">Users taking action</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-foreground font-[family-name:var(--font-fira-code)]">10k+</span>
            <span className="text-sm text-muted-foreground mt-1">Activities logged</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-[#22C55E] font-[family-name:var(--font-fira-code)]">1000+ kg</span>
            <span className="text-sm text-muted-foreground mt-1">CO₂ saved</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
