'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Leaf, Brain, Trophy } from 'lucide-react';

const features = [
  {
    title: "Smart Activity Logging",
    description: "Log transport, food, and energy activities in seconds. See your CO₂ impact instantly.",
    icon: Leaf,
  },
  {
    title: "AI-Powered Insights",
    description: "Gemini AI analyzes your footprint and gives you 3–5 personalized, actionable reduction tips.",
    icon: Brain,
  },
  {
    title: "Gamification & Rewards",
    description: "Earn badges, maintain streaks, and level up as you make sustainable choices.",
    icon: Trophy,
  }
];

export function Features() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-fira-code)] text-foreground">
            Everything You Need to Go Green
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : index * 0.2 }}
              className="bg-surface rounded-3xl p-8 border border-border/50 flex flex-col items-start hover:border-[#22C55E]/30 transition-colors shadow-sm hover:shadow-md"
            >
              <div className="h-14 w-14 rounded-full bg-[#22C55E]/10 flex items-center justify-center mb-6">
                <feature.icon className="h-7 w-7 text-[#22C55E]" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground font-[family-name:var(--font-fira-code)]">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
