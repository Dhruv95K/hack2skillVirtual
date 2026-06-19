import { Progress } from '@/components/ui/progress';

interface LevelProgressProps {
  level: number;
  levelName: string;
  co2Saved: number;
  nextLevelThreshold?: number | null;
  nextLevelName?: string | null;
  currentLevelThreshold: number;
}

export function LevelProgress({
  level,
  levelName,
  co2Saved,
  nextLevelThreshold,
  nextLevelName,
  currentLevelThreshold
}: LevelProgressProps) {
  let progressValue = 100;
  let text = 'Max level reached!';
  
  if (nextLevelThreshold != null && nextLevelThreshold > currentLevelThreshold) {
    progressValue = ((co2Saved - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100;
    progressValue = Math.min(Math.max(progressValue, 0), 100);
    const co2ToNext = (nextLevelThreshold - co2Saved).toFixed(1);
    text = `${co2ToNext} kg to Level ${level + 1} (${nextLevelName})`;
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Level {level}</h2>
          <p className="text-muted-foreground">{levelName}</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-semibold text-green-600">{co2Saved.toFixed(1)} kg</span>
          <p className="text-xs text-muted-foreground">CO₂ Saved</p>
        </div>
      </div>
      
      <Progress value={progressValue} className="h-3" />
      
      <p className="text-sm text-muted-foreground text-center">
        {text}
      </p>
    </div>
  );
}
