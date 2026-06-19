'use client';

import { useState } from 'react';
import { ACTIVITY_SUB_TYPES, ACTIVITY_UNITS } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Co2Preview } from './co2-preview';
import { Train, Salad, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ActivityForm({ onSuccess }: { onSuccess?: () => void }) {
  const [category, setCategory] = useState<'transport' | 'food' | 'energy'>('transport');
  const [subType, setSubType] = useState<string>(ACTIVITY_SUB_TYPES.transport[0]);
  const [quantity, setQuantity] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleCategoryChange = (val: string) => {
    const newCategory = val as 'transport' | 'food' | 'energy';
    setCategory(newCategory);
    setSubType(ACTIVITY_SUB_TYPES[newCategory][0]);
    setQuantity('');
  };

  const unit = ACTIVITY_UNITS[subType] || ACTIVITY_UNITS[category] || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = Number(quantity);
    if (!quantity || isNaN(qtyNum) || qtyNum <= 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subType,
          quantity: Number(quantity),
          unit
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to log activity');
      }

      const data = await res.json();
      toast.success(`Activity logged! ${data.log.co2Kg} kg CO₂ calculated`);
      setQuantity('');
      setSubType(ACTIVITY_SUB_TYPES[category as keyof typeof ACTIVITY_SUB_TYPES][0]);
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-emerald-100/50 dark:border-emerald-900/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          Log an Activity
        </CardTitle>
        <CardDescription>Select a category and enter the details to track your footprint.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={category} onValueChange={handleCategoryChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="transport" className="flex items-center gap-2">
                <Train className="w-4 h-4" /> Transport
              </TabsTrigger>
              <TabsTrigger value="food" className="flex items-center gap-2">
                <Salad className="w-4 h-4" /> Food
              </TabsTrigger>
              <TabsTrigger value="energy" className="flex items-center gap-2">
                <Zap className="w-4 h-4" /> Energy
              </TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subType">Activity Type</Label>
                <select
                  id="subType"
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  {ACTIVITY_SUB_TYPES[category as keyof typeof ACTIVITY_SUB_TYPES].map(type => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Amount ({unit})</Label>
                <div className="relative">
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="e.g. 15.5"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="pr-16"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground text-sm">
                    {unit}
                  </div>
                </div>
              </div>
            </div>
          </Tabs>

          <Co2Preview category={category} subType={subType} quantity={Number(quantity) || 0} />

          <Button type="submit" disabled={loading || !quantity} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Log Activity
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
