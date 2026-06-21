'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Leaf, Brain, Trophy, ArrowRight, Activity, TrendingDown } from 'lucide-react';

const features = [
  {
    title: "Smart Activity Logging",
    description: "Log transport, food, and energy activities in seconds. See your CO₂ impact instantly with real-time feedback.",
    icon: Leaf,
    className: "md:col-span-2 md:row-span-2",
    iconColor: "text-nature-green",
    iconBg: "bg-nature-green/10",
    hoverBorder: "hover:border-nature-green/30",
    content: (
      <div className="mt-8 flex-1 w-full bg-gradient-to-br from-background/50 to-background rounded-2xl border border-border/50 p-6 relative overflow-hidden group-hover:border-nature-green/20 transition-colors">
        <div className="absolute -right-4 -top-4 p-4 opacity-5 transition-opacity duration-500 group-hover:opacity-10">
          <Leaf className="w-48 h-48 text-nature-green" />
        </div>
        <div className="space-y-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-nature-green/20 flex items-center justify-center">
              <Activity className="h-6 w-6 text-nature-green" />
            </div>
            <div className="space-y-2">
              <div className="h-2.5 w-32 bg-foreground/20 rounded-full" />
              <div className="h-2 w-24 bg-border rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-full bg-ocean-blue/20 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-ocean-blue" />
            </div>
            <div className="space-y-2">
              <div className="h-2.5 w-40 bg-foreground/20 rounded-full" />
              <div className="h-2 w-20 bg-border rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "AI-Powered Insights",
    description: "Gemini AI analyzes your footprint and gives you personalized, actionable reduction tips.",
    icon: Brain,
    className: "md:col-span-1 md:row-span-1",
    iconColor: "text-ocean-blue",
    iconBg: "bg-ocean-blue/10",
    hoverBorder: "hover:border-ocean-blue/30",
    content: (
      <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
        <Brain className="w-40 h-40 text-ocean-blue" />
      </div>
    )
  },
  {
    title: "Gamification & Rewards",
    description: "Earn badges, maintain streaks, and level up as you make sustainable choices.",
    icon: Trophy,
    className: "md:col-span-1 md:row-span-1",
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-600/10 dark:bg-amber-400/10",
    hoverBorder: "hover:border-amber-600/30 dark:hover:border-amber-400/30",
    content: (
      <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
        <Trophy className="w-40 h-40 text-amber-600 dark:text-amber-400" />
      </div>
    )
  }
];

export function Features() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute -left-40 top-40 w-96 h-96 bg-nature-green/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-40 bottom-40 w-96 h-96 bg-ocean-blue/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
            className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-nature-green/10 text-green-700 dark:text-nature-green border border-nature-green/20 font-sans"
          >
            Features
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold font-sans text-foreground mb-6 tracking-tight">
            Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 dark:from-nature-green dark:to-ocean-blue">Go Green</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A comprehensive suite of tools designed to help you track, understand, and reduce your environmental impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto auto-rows-[minmax(250px,auto)]">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 30,
                scale: shouldReduceMotion ? 1 : 0.95
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                scale: 1
              }}
              viewport={{
                once: true,
                margin: "-50px"
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.5,
                delay: shouldReduceMotion ? 0 : index * 0.15,
                ease: [0.21, 0.47, 0.32, 0.98]
              }}
              className={`bg-card rounded-3xl p-8 border border-border/50 transition-all duration-300 shadow-sm hover:shadow-lg group flex flex-col justify-between overflow-hidden relative ${feature.hoverBorder} ${feature.className}`}
            >
              <div className="flex flex-col h-full z-10 relative">
                <div className="mb-6 flex items-center justify-between">
                  <div className={`h-14 w-14 rounded-2xl ${feature.iconBg} flex items-center justify-center`}>
                    <feature.icon className={`h-7 w-7 ${feature.iconColor}`} aria-hidden="true" />
                  </div>
                  <motion.div 
                    whileHover={shouldReduceMotion ? {} : { x: 5 }}
                    className="h-10 w-10 rounded-full border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm"
                  >
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground font-sans tracking-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>
                
                {feature.content}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}