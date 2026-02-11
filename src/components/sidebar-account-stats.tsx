import { useSelector } from "react-redux";
import { Progress } from "@/components/ui/progress";

import { calcLevelFromXp, xpRequiredForLevel, xpRangeForLevel } from "@/lib/userGame";

export function SidebarAccountStats() {
  const { user } = useSelector((state: any) => state.auth);

  const xpTotal = Number(user?.game?.xp ?? 0);
  const level = calcLevelFromXp(xpTotal);

  const levelStartXp = xpRequiredForLevel(level);
  const levelSize = xpRangeForLevel(level);

  const xpInLevel = Math.max(0, xpTotal - levelStartXp);
  const progress = Math.min(100, Math.round((xpInLevel / levelSize) * 100));

  return (
    <div className="min-w-0 flex-1 text-xs space-y-2">
      <div className="mt-1 flex items-center justify-between text-muted-foreground tabular-nums">
        <span className="truncate">Level Progress</span>
        <span>
          {xpInLevel}/{levelSize} XP
        </span>
      </div>

      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
        <Progress className="h-full rounded-full" value={progress} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="shrink-0 text-muted-foreground tabular-nums">
          Lv <span className="text-foreground">{level}</span>
        </div>
        <span className="opacity-80">{xpTotal}XP total</span>
      </div>
    </div>
  );
}
