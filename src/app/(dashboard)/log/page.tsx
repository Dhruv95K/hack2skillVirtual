'use client';

import { useEffect, useState, useCallback } from 'react';
import { ActivityForm } from '@/components/log/activity-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Train, Salad, Zap, Calendar, Loader2 } from 'lucide-react';

interface ActivityLog {
  id: string;
  category: string;
  subType: string;
  quantity: number;
  unit: string;
  co2Kg: number;
  loggedAt: string;
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'transport': return <Train className="w-4 h-4 text-emerald-600" />;
    case 'food': return <Salad className="w-4 h-4 text-emerald-600" />;
    case 'energy': return <Zap className="w-4 h-4 text-emerald-600" />;
    default: return <Calendar className="w-4 h-4 text-emerald-600" />;
  }
};

export default function LogActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/activities?limit=10');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
        Log Activity | EcoTrack
      </h1>
      
      <ActivityForm onSuccess={fetchLogs} />

      <Card className="border-emerald-100/50 dark:border-emerald-900/50 shadow-sm mt-8">
        <CardHeader>
          <CardTitle className="text-xl">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
              No activities logged yet. Start tracking your footprint above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Date</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Activity</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3 rounded-tr-lg">Impact (CO₂)</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {isMounted ? new Date(log.loggedAt).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric', year: 'numeric'
                        }) : ''}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 capitalize">
                          <CategoryIcon category={log.category} />
                          {log.category}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.subType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </td>
                      <td className="px-4 py-3">
                        {log.quantity} {log.unit}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        {log.co2Kg.toFixed(2)} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
