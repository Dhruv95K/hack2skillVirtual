import { Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
export function StreakCounter({
  streak
}) {
  const active = streak > 0;
  return <Card className={`border-2 ${active ? 'border-orange-200 bg-orange-50/30' : 'border-muted bg-muted/20'}`}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-full flex items-center justify-center ${active ? 'bg-orange-100 text-orange-500' : 'bg-muted text-muted-foreground'}`}>
          <Flame size={28} className={active ? 'fill-orange-500' : ''} />
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight">
            {streak} {streak === 1 ? 'day' : 'days'}
          </div>
          <p className={`text-sm ${active ? 'text-orange-600/80' : 'text-muted-foreground'}`}>
            Current Streak
          </p>
        </div>
      </CardContent>
    </Card>;
}