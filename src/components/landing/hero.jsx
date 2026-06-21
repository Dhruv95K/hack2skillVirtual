'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { buttonVariants } from '@/components/ui/button';
import { ArrowRight, ArrowDown, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40 bg-background text-center">
      {/* Layered Glassmorphism Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center items-center">
        <motion.div
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[15%] w-72 h-72 md:w-96 md:h-96 bg-gradient-to-tr from-nature-green/30 to-ocean-blue/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[10%] right-[15%] w-80 h-80 md:w-[28rem] md:h-[28rem] bg-gradient-to-tr from-ocean-blue/20 to-nature-green/30 rounded-full blur-3xl"
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 flex flex-col items-center">
        <div className="max-w-3xl relative">
          {/* Dynamic Gamification Badge Teaser */}
          <motion.div 
            aria-hidden="true"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8, rotate: shouldReduceMotion ? 0 : -10 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotate: 0, 
              y: shouldReduceMotion ? 0 : [0, -10, 0] 
            }}
            transition={{ 
              opacity: { duration: shouldReduceMotion ? 0 : 0.5, delay: 0.3 },
              scale: { duration: shouldReduceMotion ? 0 : 0.5, delay: 0.3, type: "spring" },
              y: { duration: shouldReduceMotion ? 0 : 3, repeat: Infinity, ease: "easeInOut", delay: 1 } 
            }}
            className="absolute -top-12 -right-4 md:-top-16 md:-right-12 bg-background/60 backdrop-blur-md border border-border/50 shadow-xl rounded-2xl p-3 flex items-center gap-3 z-20 pointer-events-none"
          >
            <div className="bg-nature-green/20 p-2 rounded-full text-green-700 dark:text-nature-green">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-foreground">Eco Warrior</p>
              <p className="text-[10px] font-medium text-green-700 dark:text-nature-green">+50 points</p>
            </div>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 font-[family-name:var(--font-fira-code)] text-foreground">
            Understand & Reduce Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 dark:from-nature-green dark:to-ocean-blue">Carbon Footprint</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-[family-name:var(--font-fira-sans)]">
            Track your daily impact across transport, food, and energy. Get AI-powered insights and take meaningful action for the planet.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -2 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="w-full sm:w-auto"
            >
              <Link 
                href="/signup" 
                className={cn(
                  buttonVariants({ size: "lg" }), 
                  "bg-gradient-to-r from-nature-green to-ocean-blue hover:from-nature-green/90 hover:to-ocean-blue/90 text-primary-foreground rounded-2xl h-14 px-8 text-lg w-full sm:w-auto font-medium shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                )}
              >
                Start for Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
            
            <Link 
              href="#features" 
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }), 
                "rounded-2xl h-14 px-8 text-lg w-full sm:w-auto font-medium hover:text-green-700 dark:hover:text-nature-green transition-colors"
              )}
            >
              See how it works <ArrowDown className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-border/50 w-full max-w-4xl">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-foreground font-[family-name:var(--font-fira-code)]">500+</span>
            <span className="text-sm text-muted-foreground mt-1">users</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-foreground font-[family-name:var(--font-fira-code)]">10k+</span>
            <span className="text-sm text-muted-foreground mt-1">activities logged</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-green-700 dark:text-nature-green font-[family-name:var(--font-fira-code)]">1000+</span>
            <span className="text-sm text-muted-foreground mt-1">kg CO₂ saved</span>
          </div>
        </div>
      </div>
    </section>
  );
}