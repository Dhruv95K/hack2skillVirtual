/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
'use client';

import { Co2TrendChart } from '@/components/charts/co2-trend-chart';
import { CategoryDonutChart } from '@/components/charts/category-donut-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Flame, Leaf, TreePine } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
export function DashboardClient({
  data
}) {
  const shouldReduceMotion = useReducedMotion();
  const containerVariants = shouldReduceMotion ? {
    hidden: {},
    visible: {}
  } : {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = shouldReduceMotion ? {
    hidden: {},
    visible: {}
  } : {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  return <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-nature-green to-ocean-blue">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's how you're doing.</p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} whileHover={shouldReduceMotion ? {} : { scale: 1.02 }} data-testid="stat-card-total-co2">
          <Card className="rounded-3xl backdrop-blur-xl bg-surface/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total CO₂ Tracked</CardTitle>
              <div className="p-2 rounded-full bg-nature-green/20">
                <Leaf className="w-4 h-4 text-nature-green" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold text-white">
                {data.summary.totalCo2Tracked.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kg</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={shouldReduceMotion ? {} : { scale: 1.02 }} data-testid="stat-card-impact-equivalent">
          <Card className="rounded-3xl backdrop-blur-xl bg-surface/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Impact Equivalent</CardTitle>
              <div className="p-2 rounded-full bg-ocean-blue/20">
                <TreePine className="w-4 h-4 text-ocean-blue" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold text-white">
                {(data.summary.totalCo2Tracked / 21).toFixed(1)} <span className="text-sm font-normal text-muted-foreground">trees</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={shouldReduceMotion ? {} : { scale: 1.02 }} data-testid="stat-card-current-streak">
          <Card className="rounded-3xl backdrop-blur-xl bg-surface/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
              <div className="p-2 rounded-full bg-orange-500/20">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold text-white">
                {data.summary.streak} <span className="text-sm font-normal text-muted-foreground">days</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={shouldReduceMotion ? {} : { scale: 1.02 }} data-testid="stat-card-current-level">
          <Card className="rounded-3xl backdrop-blur-xl bg-surface/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Level</CardTitle>
              <div className="p-2 rounded-full bg-yellow-500/20">
                <Trophy className="w-4 h-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-heading font-bold text-white">Lvl {data.summary.level}</span>
                <span className="text-sm text-muted-foreground">{data.summary.levelName}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={shouldReduceMotion ? {} : {
        opacity: 0,
        y: 20
      }} animate={shouldReduceMotion ? {} : {
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }} className="lg:col-span-2">
          <Card className="rounded-3xl backdrop-blur-xl bg-surface/50 border-white/5 h-full">
            <CardHeader>
              <CardTitle className="text-lg text-white">30-Day Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <Co2TrendChart data={data.trend} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={shouldReduceMotion ? {} : {
        opacity: 0,
        y: 20
      }} animate={shouldReduceMotion ? {} : {
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.4
      }} className="lg:col-span-1">
          <Card className="rounded-3xl backdrop-blur-xl bg-surface/50 border-white/5 h-full">
            <CardHeader>
              <CardTitle className="text-lg text-white">All-Time Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryDonutChart data={data.categories} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>;
}